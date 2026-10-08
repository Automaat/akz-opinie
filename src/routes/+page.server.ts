import { listCruises } from '$lib/server/store';

export async function load() {
  return { cruises: await listCruises() };
}
