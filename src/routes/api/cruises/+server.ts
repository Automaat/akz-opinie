import { json } from '@sveltejs/kit';
import { createCruise, listCruises } from '$lib/server/store';

export async function GET() {
  return json(await listCruises());
}

export async function POST() {
  return json(await createCruise(), { status: 201 });
}
