import { error } from '@sveltejs/kit';
import { getCruise, NotFoundError } from './store';
import type { Cruise } from '$lib/types';

export async function cruiseOr404(id: string): Promise<Cruise> {
  try {
    return await getCruise(id);
  } catch (e) {
    if (e instanceof NotFoundError) error(404, 'Nie znaleziono rejsu');
    throw e;
  }
}
