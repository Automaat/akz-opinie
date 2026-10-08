import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  createCruise,
  deleteCruise,
  duplicateCruise,
  getCruise,
  listCruises,
  NotFoundError,
  readImage,
  setImage,
  updateCruise
} from '../src/lib/server/store';
import { sanitizeCruise } from '../src/lib/server/validate';

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'akz-'));
  process.env.DATA_DIR = dir;
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('store', () => {
  it('persists a cruise across reads and lists it', async () => {
    const created = await createCruise();
    await updateCruise(created.id, (c) => ({ ...c, title: 'NNE' }));
    expect((await getCruise(created.id)).title).toBe('NNE');
    expect((await listCruises()).map((c) => c.id)).toEqual([created.id]);
  });

  it('rejects ids that are not UUIDs', async () => {
    await expect(getCruise('../etc')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('keeps an uploaded image when a form save runs concurrently', async () => {
    const { id } = await createCruise();
    await Promise.all([
      setImage(id, 'crew', new Uint8Array([1, 2, 3])),
      updateCruise(id, (c) => sanitizeCruise({ ...c, title: 'x' }, c))
    ]);
    const after = await getCruise(id);
    expect(after.images.crew).not.toBeNull();
    expect(after.title).toBe('x');
  });

  it('duplicates data and images with fresh crew ids, then deletes', async () => {
    const src = await createCruise();
    await setImage(src.id, 'yacht', new Uint8Array([9]));
    const copy = await duplicateCruise(src.id);
    expect(copy.id).not.toBe(src.id);
    expect(copy.crew[0].id).not.toBe(src.crew[0].id);
    expect(await readImage(copy.id, 'yacht')).toEqual(Buffer.from([9]));
    await deleteCruise(copy.id);
    await expect(getCruise(copy.id)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('sanitizeCruise', () => {
  it('drops unknown fields, coerces types and keeps server-owned image state', async () => {
    const current = await createCruise();
    const out = sanitizeCruise(
      {
        title: 5,
        hacked: true,
        tidal: 'yes',
        images: { crew: 'evil' },
        crew: [{ firstName: 'A', gender: 'x' }]
      },
      current
    );
    expect(out.title).toBe('');
    expect(out.tidal).toBe(false);
    expect(out.images).toEqual(current.images);
    expect(out.crew[0]).toMatchObject({ firstName: 'A', gender: 'm' });
    expect(out).not.toHaveProperty('hacked');
  });
});
