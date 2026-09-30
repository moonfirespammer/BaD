// Phase 3: plate() is the server-side judge (spec §7) and the one write point for habits, the gallery and the wall.
import { describe, expect, it } from 'vitest';
import { MockPoolService } from './MockPoolService';
import { createClock } from './clock';
import { ProfileStore } from './profile';
import { createMemoryStorage, type Storage } from './storage';
import type { Plate } from '@/game/types';

const sgt = (iso: string): number => Date.parse(`${iso}+08:00`);

async function setup(iso = '2026-09-23T12:00:00', storage: Storage = createMemoryStorage()) {
  let now = sgt(iso);
  const clock = createClock({ source: () => now });
  const profile = new ProfileStore(storage, { city: 'SG' });
  await profile.load(clock.city().month);
  const service = new MockPoolService({ city: 'SG', clock, storage, profile });
  return { service, profile, storage, advance: (ms: number) => (now += ms) };
}

const prepped = (items: { id: string; cut?: number; heat?: number; n?: number }[], flair = 0): Plate => ({
  items: items.map((i) => ({
    ingredientId: i.id,
    n: i.n ?? 1,
    cut: (i.cut ?? 0) as 0 | 1 | 2 | 3,
    heat: (i.heat ?? 0) as 0 | 1 | 2 | 3,
  })),
  flair,
  mess: 0,
});

describe('MockPoolService.plate (spec §7, §3.5–3.9)', () => {
  it('needs a pick, judges the pool portions with the client prep, and counts the plate', async () => {
    const { service, profile } = await setup();
    await expect(service.plate(prepped([]))).rejects.toMatchObject({ code: 'not-picked' });
    await service.pick('chicken-rice');
    for (const id of ['chicken', 'rice', 'ginger', 'chilli-sauce', 'cucumber', 'dark-soy']) {
      await service.takePortion(id);
    }
    const bin0 = (await service.getToday('SG')).binEaten;
    // The client says chicken ×9 (impossible) and all prepped: portions come from the pool, prep from the draft.
    const v = await service.plate(
      prepped(
        [
          { id: 'chicken', n: 9, cut: 1, heat: 1 },
          { id: 'rice', heat: 1 },
          { id: 'ginger' },
          { id: 'chilli-sauce' },
          { id: 'cucumber', cut: 1 },
          { id: 'dark-soy' },
        ],
        2,
      ),
    );
    expect(v).toMatchObject({
      stones: 3,
      score: 100,
      name: 'Chicken rice',
      label: 'Clean plate',
      cursed: false,
    });
    expect(v.summary).toContain('Poached chicken ×1');
    expect((await service.getToday('SG')).binEaten).toBe(bin0 + 1);
    expect(profile.get().habits.plates).toBe(1);
    expect(profile.get().cursedPlates).toEqual([]);
    expect((await service.getPlate()).items.map((i) => i.n)).toEqual([1, 1, 1, 1, 1, 1]); // the plate stays
    expect((await service.getPlate()).flair).toBe(2);
  });

  it('a cursed plate joins the gallery, newest first, dated d Mon yyyy', async () => {
    const { service, profile } = await setup('2026-09-23T13:30:00');
    await service.pick('nasi-lemak');
    const v1 = await service.plate(prepped([]));
    expect(v1.cursed).toBe(true);
    await service.takePortion('durian');
    await service.takePortion('cheddar');
    const v2 = await service.plate(prepped([{ id: 'durian' }, { id: 'cheddar' }]));
    expect(v2.cursed).toBe(true);
    const gallery = await service.getGallery();
    expect(gallery.map((g) => g.name)).toEqual([v2.name, 'Empty Plate of unknown origin']);
    expect(gallery[0]?.date).toBe('23 Sep 2026');
    expect(gallery[0]?.hint).toBe('meant to be nasi lemak');
    expect(profile.get().habits).toMatchObject({ plates: 2 });
  });

  it('upserts the player’s single wall row for the dish; a swap removes it', async () => {
    const { service, profile } = await setup();
    await service.pick('chicken-rice');
    const before = await service.getWall('chicken-rice');
    await service.takePortion('chicken');
    const v1 = await service.plate(prepped([{ id: 'chicken', cut: 1, heat: 1 }]));
    let wall = await service.getWall('chicken-rice');
    expect(wall).toHaveLength(before.length + 1);
    const mine = wall.filter((r) => r.playerId === profile.get().id);
    expect(mine).toHaveLength(1);
    expect(mine[0]).toMatchObject({
      name: 'Ayu',
      classKey: 'stirrer',
      gem: 'ruby',
      stones: v1.stones,
      variant: v1.name,
      style: v1.style,
      line: v1.line,
    });
    expect(mine[0]?.platedAt).toBe(new Date(sgt('2026-09-23T12:00:00')).toISOString());
    await service.takePortion('rice');
    const v2 = await service.plate(
      prepped([
        { id: 'chicken', cut: 1, heat: 1 },
        { id: 'rice', heat: 1 },
      ]),
    );
    wall = await service.getWall('chicken-rice');
    expect(wall.filter((r) => r.playerId === profile.get().id)).toHaveLength(1); // still one row
    expect(wall.at(-1)?.variant).toBe(v2.name); // the latest plate wins
    expect(await service.getWall('nasi-lemak')).not.toContainEqual(expect.objectContaining({ name: 'Ayu' }));
    await service.swap('nasi-lemak');
    expect(await service.getWall('chicken-rice')).toHaveLength(before.length);
    expect(await service.getWall('nasi-lemak')).not.toContainEqual(expect.objectContaining({ name: 'Ayu' }));
  });

  it('habits counters move from the plate’s own flags, and the habit line shows the new count', async () => {
    const { service, profile } = await setup();
    await service.pick('chicken-rice');
    await service.takePortion('chilli-sauce');
    await service.takePortion('chilli-sauce');
    const v1 = await service.plate(prepped([{ id: 'chilli-sauce', n: 2 }]));
    expect(v1.habit).toBe('You doubled the chilli again · ×1');
    expect(profile.get().habits).toMatchObject({ chilli: 1, plates: 1 });
    const v2 = await service.plate(prepped([{ id: 'chilli-sauce', n: 2 }]));
    expect(v2.habit).toBe('You doubled the chilli again · ×2');
    expect(profile.get().habits).toMatchObject({ chilli: 2, plates: 2 });
  });

  it('the wall row and the gallery survive a reload; setSignature stores the verdict with its date', async () => {
    const storage = createMemoryStorage();
    const first = await setup('2026-09-23T12:00:00', storage);
    await first.service.pick('fish-chips');
    const v = await first.service.plate(prepped([]));
    await first.service.setSignature(v);
    const again = await setup('2026-09-23T12:05:00', storage);
    expect((await again.service.getWall('fish-chips')).some((r) => r.name === 'Ayu')).toBe(true);
    expect((await again.service.getGallery()).map((g) => g.name)).toEqual(['Empty Plate of unknown origin']);
    expect(again.profile.get().signature).toMatchObject({
      key: v.key,
      date: '23 Sep 2026',
      dishId: 'fish-chips',
    });
  });
});
