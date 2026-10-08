import { cruiseOr404 } from '$lib/server/http';

export async function load({ params }) {
  return { cruise: await cruiseOr404(params.id) };
}
