import { mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { emptyCruise, IMAGE_SLOTS, newId, type Cruise, type ImageSlot } from '$lib/types';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export const dataDir = (): string => process.env.DATA_DIR ?? join(process.cwd(), 'data');
const cruisesDir = (): string => join(dataDir(), 'cruises');

export class NotFoundError extends Error {}

function dirOf(id: string): string {
  if (!UUID.test(id)) throw new NotFoundError(id);
  return join(cruisesDir(), id);
}

async function writeAtomic(path: string, data: string | Uint8Array): Promise<void> {
  const tmp = `${path}.${process.pid}.tmp`;
  await writeFile(tmp, data);
  await rename(tmp, path);
}

export async function getCruise(id: string): Promise<Cruise> {
  try {
    return JSON.parse(await readFile(join(dirOf(id), 'cruise.json'), 'utf8')) as Cruise;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') throw new NotFoundError(id);
    throw e;
  }
}

export async function listCruises(): Promise<Cruise[]> {
  await mkdir(cruisesDir(), { recursive: true });
  const ids = (await readdir(cruisesDir())).filter((d) => UUID.test(d));
  const all = await Promise.all(ids.map((id) => getCruise(id).catch(() => null)));
  return all
    .filter((c): c is Cruise => c !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

const locks = new Map<string, Promise<unknown>>();

function withLock<T>(id: string, fn: () => Promise<T>): Promise<T> {
  const run = (locks.get(id) ?? Promise.resolve()).then(fn, fn);
  locks.set(
    id,
    run.catch(() => undefined)
  );
  return run;
}

export function updateCruise(id: string, change: (current: Cruise) => Cruise): Promise<Cruise> {
  return withLock(id, async () => saveCruise(change(await getCruise(id))));
}

async function saveCruise(cruise: Cruise): Promise<Cruise> {
  const dir = dirOf(cruise.id);
  await mkdir(dir, { recursive: true });
  const saved = { ...cruise, updatedAt: new Date().toISOString() };
  await writeAtomic(join(dir, 'cruise.json'), JSON.stringify(saved, null, 2));
  return saved;
}

export async function createCruise(seed?: Partial<Cruise>): Promise<Cruise> {
  return saveCruise({
    ...emptyCruise(),
    ...seed,
    id: newId(),
    createdAt: new Date().toISOString()
  });
}

export async function deleteCruise(id: string): Promise<void> {
  await rm(dirOf(id), { recursive: true, force: true });
}

const imagePath = (id: string, slot: ImageSlot): string => join(dirOf(id), `${slot}.img`);

export async function readImage(id: string, slot: ImageSlot): Promise<Buffer | null> {
  try {
    return await readFile(imagePath(id, slot));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw e;
  }
}

export function setImage(id: string, slot: ImageSlot, bytes: Uint8Array): Promise<Cruise> {
  return withLock(id, async () => {
    const cruise = await getCruise(id);
    await writeAtomic(imagePath(id, slot), bytes);
    return saveCruise({ ...cruise, images: { ...cruise.images, [slot]: String(Date.now()) } });
  });
}

export function clearImage(id: string, slot: ImageSlot): Promise<Cruise> {
  return withLock(id, async () => {
    const cruise = await getCruise(id);
    await rm(imagePath(id, slot), { force: true });
    return saveCruise({ ...cruise, images: { ...cruise.images, [slot]: null } });
  });
}

export async function duplicateCruise(id: string): Promise<Cruise> {
  const src = await getCruise(id);
  const copy = await createCruise({
    ...src,
    title: `${src.title} (kopia)`.trim(),
    crew: src.crew.map((m) => ({ ...m, id: newId() })),
    images: { crew: null, yacht: null }
  });
  for (const slot of IMAGE_SLOTS) {
    const bytes = await readImage(id, slot);
    if (bytes) await setImage(copy.id, slot, bytes);
  }
  return getCruise(copy.id);
}
