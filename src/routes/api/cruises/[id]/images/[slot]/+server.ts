import { error, json } from '@sveltejs/kit';
import { cruiseOr404 } from '$lib/server/http';
import { clearImage, readImage, setImage } from '$lib/server/store';
import { IMAGE_SLOTS, type ImageSlot } from '$lib/types';

const MAX_BYTES = 30 * 1024 * 1024;
const TYPES: Record<string, string> = {
  'image/jpeg': '\xff\xd8\xff',
  'image/png': '\x89PNG',
  'image/webp': 'RIFF'
};

function slotOf(raw: string): ImageSlot {
  if (!IMAGE_SLOTS.includes(raw as ImageSlot)) error(404, 'Nieznany slot zdjęcia');
  return raw as ImageSlot;
}

function sniff(bytes: Uint8Array): string | null {
  const head = String.fromCharCode(...bytes.slice(0, 4));
  return Object.entries(TYPES).find(([, magic]) => head.startsWith(magic))?.[0] ?? null;
}

export async function GET({ params }) {
  const slot = slotOf(params.slot);
  await cruiseOr404(params.id);
  const bytes = await readImage(params.id, slot);
  if (!bytes) error(404, 'Brak zdjęcia');
  return new Response(new Uint8Array(bytes), {
    headers: {
      'content-type': sniff(bytes) ?? 'application/octet-stream',
      'cache-control': 'private, max-age=31536000, immutable'
    }
  });
}

export async function PUT({ params, request }) {
  const slot = slotOf(params.slot);
  await cruiseOr404(params.id);
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.length === 0 || bytes.length > MAX_BYTES)
    error(413, 'Plik pusty lub większy niż 30 MB');
  if (!sniff(bytes)) error(415, 'Obsługiwane formaty: JPEG, PNG, WebP');
  return json(await setImage(params.id, slot, bytes));
}

export async function DELETE({ params }) {
  const slot = slotOf(params.slot);
  await cruiseOr404(params.id);
  return json(await clearImage(params.id, slot));
}
