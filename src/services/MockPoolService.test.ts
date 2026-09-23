import { describe, expect, it, vi } from 'vitest';
import { MockPoolService } from './MockPoolService';
import { NotImplementedError, PoolError } from './PoolService';
import { createClock } from './clock';
import { ProfileStore } from './profile';
import { createMemoryStorage } from './storage';
import { SEED_COUNTS } from './sim';
import { STOCK0 } from '@/game/content/ingredients';

const sgt = (iso: string): number => Date.parse(`${iso}+08:00`);

async function setup(
  iso = '2026-09-23T10:00:00',
  leftovers: 'on' | 'off' | null = null,
  storage = createMemoryStorage(),
) {
  let now = sgt(iso);
  const clock = createClock({ source: () => now, leftoversOverride: leftovers });
  const profile = new ProfileStore(storage, { city: 'SG' });
  await profile.load(clock.city().month);
  const service = new MockPoolService({ city: 'SG', clock, storage, profile });
  return { service, storage, profile, clock, advance: (ms: number) => (now += ms) };
}

describe('MockPoolService', () => {
  it('serves today with the seed counts, seed stock and the city clock', async () => {
    const { service } = await setup();
    const b = await service.getToday('SG');
    expect(b.city).toBe('SG');
    expect(b.date).toBe('2026-09-23');
    expect(b.leftoversHour).toBe(false);
    expect(b.dishes.map((d) => d.id)).toEqual([
      'chicken-rice',
      'aglio-olio',
      'mutton-soup',
      'nasi-lemak',
      'fish-chips',
    ]);
    for (const [id, n] of Object.entries(SEED_COUNTS)) expect(b.counts[id]).toBeGreaterThanOrEqual(n);
    expect(b.stock.chicken).toBe(STOCK0.chicken);
    expect(b.resetAt).toBe(new Date(sgt('2026-09-24T00:00:00')).toISOString());
    await expect(service.getToday('KL')).rejects.toThrow();
    expect(() => service.subscribe('KL', () => undefined)).toThrow();
  });

  it('pick counts the player once, puts their avatar first, and allows one swap that moves the count', async () => {
    const { service, profile } = await setup();
    const before = await service.getToday('SG');
    const pick = await service.pick('chicken-rice');
    expect(pick).toMatchObject({
      dishId: 'chicken-rice',
      swapsLeft: 1,
      date: '2026-09-23',
      playerId: profile.get().id,
    });
    let b = await service.getToday('SG');
    expect(b.counts['chicken-rice']).toBe((before.counts['chicken-rice'] ?? 0) + 1);
    expect(b.cooks['chicken-rice']?.[0]).toEqual({ classKey: 'stirrer', figure: 't1m' });
    expect(b.cooks['chicken-rice']).toHaveLength(3);
    await expect(service.pick('nasi-lemak')).rejects.toBeInstanceOf(PoolError);
    await expect(service.swap('chicken-rice')).rejects.toMatchObject({ code: 'same-dish' });
    const swapped = await service.swap('nasi-lemak');
    expect(swapped).toMatchObject({ dishId: 'nasi-lemak', swapsLeft: 0 });
    b = await service.getToday('SG');
    expect(b.counts['chicken-rice']).toBe(before.counts['chicken-rice']);
    expect(b.counts['nasi-lemak']).toBe((before.counts['nasi-lemak'] ?? 0) + 1);
    await expect(service.swap('fish-chips')).rejects.toMatchObject({ code: 'no-swaps' });
    expect(await service.getPick()).toEqual(swapped);
  });

  it('swap before pick is refused', async () => {
    const { service } = await setup();
    await expect(service.swap('nasi-lemak')).rejects.toMatchObject({ code: 'not-picked' });
  });

  it('takes up to three portions, refuses the fourth, returns one, and swap returns everything', async () => {
    const { service } = await setup();
    await service.pick('chicken-rice');
    const s0 = (await service.getToday('SG')).stock.ginger ?? 0;
    expect(await service.takePortion('ginger')).toEqual({ ok: true, stock: s0 - 1 });
    await service.takePortion('ginger');
    await service.takePortion('ginger');
    expect(await service.takePortion('ginger')).toEqual({ ok: false, reason: 'cap', stock: s0 - 3 });
    expect((await service.getPlate()).items).toEqual([{ ingredientId: 'ginger', n: 3, cut: 0, heat: 0 }]);
    expect(await service.returnPortion('ginger')).toEqual({ stock: s0 - 2 });
    const rice0 = (await service.getToday('SG')).stock.rice ?? 0;
    await service.takePortion('rice');
    // The last portion (n = 1) goes back to the shelf and the item leaves the plate.
    expect(await service.returnPortion('rice')).toEqual({ stock: rice0 });
    expect((await service.getToday('SG')).stock.rice).toBe(rice0);
    await service.returnPortion('rice'); // nothing held: no-op
    expect((await service.getPlate()).items).toEqual([{ ingredientId: 'ginger', n: 2, cut: 0, heat: 0 }]);
    await service.swap('nasi-lemak');
    expect((await service.getToday('SG')).stock.ginger).toBe(s0);
    expect((await service.getPlate()).items).toEqual([]);
  });

  it('Leftovers hour lifts the cap on plentiful stock only, with the 4th and 10th notes', async () => {
    const { service } = await setup('2026-09-23T21:30:00');
    await service.pick('chicken-rice');
    for (let i = 0; i < 3; i++) await service.takePortion('ginger');
    expect(await service.takePortion('ginger')).toMatchObject({ ok: true, note: 'leftovers4' });
    for (let i = 0; i < 5; i++) await service.takePortion('ginger');
    expect(await service.takePortion('ginger')).toMatchObject({ ok: true, note: 'leftovers10' });
    expect((await service.getPlate()).items[0]?.n).toBe(10);
    for (let i = 0; i < 3; i++) await service.takePortion('coriander'); // stock 19: running low
    expect(await service.takePortion('coriander')).toMatchObject({ ok: false, reason: 'cap' });
    expect((await service.getToday('SG')).leftoversHour).toBe(true);
  });

  it('fling removes the item, bumps the Bin-eaten counter and keeps the portions taken', async () => {
    const { service } = await setup();
    await service.pick('chicken-rice');
    await service.takePortion('ginger');
    const b0 = await service.getToday('SG');
    await service.fling('ginger');
    const b1 = await service.getToday('SG');
    expect(b1.binEaten).toBe(b0.binEaten + 1);
    expect(b1.stock.ginger).toBe(b0.stock.ginger);
    const plate = await service.getPlate();
    expect(plate.items).toEqual([]);
    expect(plate.mess).toBe(1);
  });

  it('persists the day across a reload and resets at 00:00 city time', async () => {
    const storage = createMemoryStorage();
    const first = await setup('2026-09-23T23:59:00', null, storage);
    await first.service.pick('fish-chips');
    await first.service.takePortion('lemon');
    const second = await setup('2026-09-23T23:59:30', null, storage);
    expect((await second.service.getPick())?.dishId).toBe('fish-chips');
    expect((await second.service.getPlate()).items[0]?.n).toBe(1);
    second.advance(60_000); // 00:00:30 next day
    const b = await second.service.getToday('SG');
    expect(b.date).toBe('2026-09-24');
    expect(await second.service.getPick()).toBeNull();
    expect((await second.service.getPlate()).items).toEqual([]);
  });

  it('subscribe pushes a snapshot immediately, on change and on the timer, and stops cleanly', async () => {
    vi.useFakeTimers();
    try {
      const { service, advance } = await setup('2026-09-23T10:00:00');
      const seen: number[] = [];
      const off = service.subscribe('SG', (b) => seen.push(b.counts['chicken-rice'] ?? 0));
      await vi.advanceTimersByTimeAsync(10);
      expect(seen).toHaveLength(1);
      await service.pick('chicken-rice');
      expect(seen).toHaveLength(2);
      expect(seen[1]).toBe((seen[0] ?? 0) + 1);
      advance(3 * 36e5); // simulated cooks pick over the next three hours
      await vi.advanceTimersByTimeAsync(1000);
      expect(seen.length).toBeGreaterThanOrEqual(3);
      off();
      const n = seen.length;
      advance(36e5);
      await vi.advanceTimersByTimeAsync(2000);
      expect(seen).toHaveLength(n);
    } finally {
      vi.useRealTimers();
    }
  });

  it('wall, thread, post, gallery, signature and stubs', async () => {
    const { service, profile } = await setup('2026-09-23T20:00:00');
    const wall = await service.getWall('chicken-rice');
    expect(wall.length).toBeGreaterThan(0);
    const thread = await service.getThread('aglio-olio');
    expect(thread).toHaveLength(3);
    const msg = await service.post('aglio-olio', 'no parmesan left on the east side');
    expect(msg).toMatchObject({ dishId: 'aglio-olio', name: 'Ayu', classKey: 'stirrer', at: '20:00' });
    expect(await service.getThread('aglio-olio')).toHaveLength(4);
    expect(await service.getThread('nasi-lemak')).toHaveLength(3);
    await service.report(msg.id);
    await service.mute('sim-0-0');
    expect(await service.getGallery()).toEqual([]);
    await service.setSignature({
      name: 'Chicken rice',
      label: 'Clean plate',
      line: 'Fine. I have eaten worse on purpose.',
      stones: 3,
      score: 100,
      style: 'Neat',
      cursed: false,
      habit: 'Neat plater, apparently',
      leftoversUsed: false,
      summary: 'Poached chicken ×1',
      dishId: 'chicken-rice',
      key: 1,
      flags: { chilli: false, rawRice: false },
    });
    expect(profile.get().signature).toMatchObject({ name: 'Chicken rice', date: '23 Sep 2026' });
    await expect(service.plate({ items: [], flair: 0, mess: 0 })).rejects.toBeInstanceOf(NotImplementedError);
  });
});
