import { json } from '@sveltejs/kit';
import { cruiseOr404 } from '$lib/server/http';
import { deleteCruise, updateCruise } from '$lib/server/store';
import { sanitizeCruise } from '$lib/server/validate';

export async function GET({ params }) {
  return json(await cruiseOr404(params.id));
}

export async function PUT({ params, request }) {
  await cruiseOr404(params.id);
  const body = await request.json();
  return json(await updateCruise(params.id, (current) => sanitizeCruise(body, current)));
}

export async function DELETE({ params }) {
  await cruiseOr404(params.id);
  await deleteCruise(params.id);
  return new Response(null, { status: 204 });
}
