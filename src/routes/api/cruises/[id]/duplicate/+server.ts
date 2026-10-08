import { json } from '@sveltejs/kit';
import { cruiseOr404 } from '$lib/server/http';
import { duplicateCruise } from '$lib/server/store';

export async function POST({ params }) {
  await cruiseOr404(params.id);
  return json(await duplicateCruise(params.id), { status: 201 });
}
