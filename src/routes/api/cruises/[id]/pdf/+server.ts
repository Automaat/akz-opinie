import { error } from '@sveltejs/kit';
import { zipSync } from 'fflate';
import { dev } from '$app/environment';
import { fullName } from '$lib/format';
import { cruiseOr404 } from '$lib/server/http';
import { htmlToPdf } from '$lib/server/pdf';
import type { CrewMember } from '$lib/types';

const slug = (s: string): string =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const fileName = (m: CrewMember): string => `opinia-${slug(fullName(m)) || 'zalogant'}.pdf`;

function attachment(name: string, type: string, body: BodyInit): Response {
  return new Response(body, {
    headers: {
      'content-type': type,
      'content-disposition': `attachment; filename="${name}"; filename*=UTF-8''${encodeURIComponent(name)}`
    }
  });
}

export async function GET({ params, url }) {
  const cruise = await cruiseOr404(params.id);
  const mode = url.searchParams.get('member') ?? 'all';
  const base = dev ? url.origin : `http://127.0.0.1:${process.env.PORT ?? 3000}`;
  const printUrl = (memberId?: string) =>
    `${base}/print/${cruise.id}${memberId ? `?member=${memberId}` : ''}`;

  if (mode === 'zip') {
    const files: Record<string, Uint8Array> = {};
    for (const m of cruise.crew) {
      files[`${String(Object.keys(files).length + 1).padStart(2, '0')}-${fileName(m)}`] =
        await htmlToPdf(printUrl(m.id));
    }
    return attachment(
      'opinie.zip',
      'application/zip',
      new Uint8Array(zipSync(files, { level: 0 }))
    );
  }
  if (mode === 'all') {
    return attachment('opinie.pdf', 'application/pdf', new Uint8Array(await htmlToPdf(printUrl())));
  }
  const member = cruise.crew.find((m) => m.id === mode);
  if (!member) error(404, 'Nie znaleziono załoganta');
  return attachment(
    fileName(member),
    'application/pdf',
    new Uint8Array(await htmlToPdf(printUrl(mode)))
  );
}
