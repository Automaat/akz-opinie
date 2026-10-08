import { cruiseOr404 } from '$lib/server/http';
import { renderDocument } from '$lib/render';

export async function GET({ params, url }) {
  const cruise = await cruiseOr404(params.id);
  const memberId = url.searchParams.get('member');
  const members = memberId ? cruise.crew.filter((m) => m.id === memberId) : cruise.crew;
  return new Response(renderDocument(cruise, members), {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }
  });
}
