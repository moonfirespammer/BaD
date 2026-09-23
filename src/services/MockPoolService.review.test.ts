// Regression tests for the Phase 1 review findings (race, fling ledger, stock floors, returns, subscribers).
import { describe, expect, it } from 'vitest';
import { MockPoolService } from './MockPoolService';
import { PoolError } from './PoolService';
import { createClock } from './clock';
import { ProfileStore } from './profile';
import { createMemoryStorage, type Storage } from './storage';
import { stockState } from '@/game/pool';

const sgt = (iso: string): number => Date.parse(`${iso}+08:00`);

async function setup(
  iso: string,
  leftovers: 'on' | 'off' | null = null,
  storage: Storage = createMemoryStorage(),
) {
  let now = sgt(iso);
  const clock = createClock({ source: () => now, leftoversOverride: leftovers });
  const profile = new ProfileStore(storage, { city: 'SG' });
  await profile.load(clock.city().month);
  const service = new MockPoolService({ city: 'SG', clock, storage, profile });
  return { service, storage, advance: (ms: number) => (now += ms) };
}

/** Storage whose reads wait until released, to force calls to overlap. */
function slowStorage() {
  const inner = createMemoryStorage();
  let gate: (() => void) | null = null;
  let slow = false;
  const storage: Storage = {
    get: async <T>(key: string) => {
      if (slow) await new Promise<void>((r) => (gate = r));
      return inner.get<T>(key);
    },
    set: (key, value) => inner.set(key, value),
    del: (key) => inner.del(key),
  };
  return { storage, inner, slowDown: () => (slow = true), release: () => gate?.() };
}

describe('MockPoolService review fixes', () => {
  it('two picks at the same moment: exactly one succeeds (one dish per day)', async () => {
    const { service } = await setup('2026-09-23T10:00:00');
    const results = await Promise.allSettled([service.pick('chicken-rice'), service.pick('aglio-olio')]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const rejected = results.find((r) => r.status === 'rejected');
    expect(rejected?.status === 'rejected' && rejected.reason instanceof PoolError).toBe(true);
    expect((await service.getPick())?.dishId).toBe('chicken-rice');
  });

  it('at midnight, calls that overlap the new-day load never mix yesterday into today', async () => {
    const slow = slowStorage();
    const { service, advance } = await setup('2026-09-23T23:59:59', null, slow.storage);
    await service.pick('chicken-rice');
    await service.takePortion('ginger');
    advance(2000); // 00:00:01
    slow.slowDown();
    const board = service.getToday('SG');
    const take = service.takePortion('ginger');
    const pick = service.getPick();
    await Promise.resolve();
    slow.release();
    expect((await board).date).toBe('2026-09-24');
    expect(await pick).toBeNull();
    // Today has no pick yet, so the take is refused (Phase 2 review) rather than landing on today's pool.
    await expect(take).rejects.toMatchObject({ code: 'not-picked' });
    expect(slow.inner.dump()['bad:day:SG:2026-09-24']).toBeUndefined();
    const yesterday = slow.inner.dump()['bad:day:SG:2026-09-23'] as { taken: Record<string, number> };
    expect(yesterday.taken).toEqual({ ginger: 1 });
  });

  it('fling: the portions are eaten (not returned), the cap resets, and a swap does not bring them back', async () => {
    const { service } = await setup('2026-09-23T10:00:00');
    await service.pick('chicken-rice');
    const s0 = (await service.getToday('SG')).stock.ginger ?? 0;
    for (let i = 0; i < 3; i++) await service.takePortion('ginger');
    await service.fling('ginger');
    expect((await service.getToday('SG')).stock.ginger).toBe(s0 - 3);
    expect(await service.returnPortion('ginger')).toEqual({ stock: s0 - 3 }); // nothing held: no-op
    expect(await service.takePortion('ginger')).toMatchObject({ ok: true, stock: s0 - 4 });
    await service.swap('aglio-olio');
    expect((await service.getToday('SG')).stock.ginger).toBe(s0 - 3);
  });

  it('a main ingredient never reports negative stock and never runs out', async () => {
    const { service } = await setup('2026-09-23T21:30:00');
    await service.pick('chicken-rice');
    const s0 = (await service.getToday('SG')).stock.chicken ?? 0;
    for (let i = 0; i < s0 + 5; i++) {
      const r = await service.takePortion('chicken');
      expect(r.ok).toBe(true);
      expect(r.stock).toBeGreaterThanOrEqual(0);
    }
    expect(stockState(0, 'chicken')).toBe('plenty');
  });

  it('portions returned after the shelf ran dry reappear on the shelf', async () => {
    const { service, advance } = await setup('2026-09-23T01:00:00', 'on');
    await service.pick('nasi-lemak');
    let held = 0;
    while ((await service.takePortion('cucumber')).ok) held += 1;
    expect(held).toBeGreaterThan(3);
    advance(22.9 * 36e5); // 23:54: simulated cooks have wanted more cucumber than was left
    expect((await service.getToday('SG')).stock.cucumber).toBe(0);
    expect(await service.takePortion('cucumber')).toEqual({ ok: false, reason: 'gone', stock: 0 });
    await service.swap('fish-chips'); // returns every held portion
    expect((await service.getToday('SG')).stock.cucumber).toBe(held);
  });

  it('every new subscriber gets the current board at once', async () => {
    const { service } = await setup('2026-09-23T10:00:00');
    const a: number[] = [];
    const b: number[] = [];
    const offA = service.subscribe('SG', (x) => a.push(x.binEaten));
    await new Promise((r) => setTimeout(r, 20));
    const offB = service.subscribe('SG', (x) => b.push(x.binEaten));
    await new Promise((r) => setTimeout(r, 20));
    expect(a.length).toBeGreaterThanOrEqual(1);
    expect(b).toHaveLength(1);
    offA();
    offB();
  });

  it('at 00:00 the city shows the seed counts, and the dish cards vary over the day', async () => {
    const { service, advance } = await setup('2026-09-23T00:00:00');
    const first = await service.getToday('SG');
    expect(first.counts).toMatchObject({ 'chicken-rice': 38, 'aglio-olio': 21, 'mutton-soup': 12 });
    for (const [id, n] of Object.entries(first.stock)) expect(stockState(n, id), id).not.toBe('low');
    advance(23.5 * 36e5);
    const late = await service.getToday('SG');
    const states = new Set(Object.entries(late.stock).map(([id, n]) => stockState(n, id)));
    expect(states.size).toBeGreaterThanOrEqual(2);
  });
});

// Regression tests for the Phase 2 review findings (day rollover, double fling).
describe('MockPoolService plate writes (Phase 2 review)', () => {
  it('refuses every plate write when the day has no pick, e.g. the moment after 00:00', async () => {
    const { service, advance } = await setup('2026-09-23T23:59:58');
    await service.pick('chicken-rice');
    await service.takePortion('chicken');
    await service.saveDraft({
      items: [{ ingredientId: 'chicken', n: 1, cut: 1, heat: 0 }],
      flair: 3,
      mess: 1,
    });
    advance(2500); // 00:00:00.5 — the new day starts with no pick
    const writes = [
      () => service.takePortion('ginger'),
      () => service.returnPortion('chicken'),
      () => service.fling('chicken'),
      () =>
        service.saveDraft({ items: [{ ingredientId: 'chicken', n: 1, cut: 2, heat: 0 }], flair: 4, mess: 1 }),
    ];
    for (const w of writes) {
      await expect(w()).rejects.toMatchObject({ code: 'not-picked' });
    }
    expect(await service.getPick()).toBeNull();
    expect(await service.getPlate()).toEqual({ items: [], flair: 0, mess: 0 });
    await service.pick('nasi-lemak');
    expect(await service.getPlate()).toEqual({ items: [], flair: 0, mess: 0 });
  });

  it('refuses a fling of an ingredient that is not on the plate (double tap, or minus took the last one)', async () => {
    const { service } = await setup('2026-09-23T10:00:00');
    await service.pick('chicken-rice');
    await service.takePortion('ginger');
    const bin0 = (await service.getToday('SG')).binEaten;
    const both = await Promise.allSettled([service.fling('ginger'), service.fling('ginger')]);
    expect(both.map((r) => r.status)).toEqual(['fulfilled', 'rejected']);
    expect(both[1]).toMatchObject({ reason: new PoolError('not-on-plate', 'Nothing to fling') });
    await service.takePortion('rice');
    await service.returnPortion('rice');
    await expect(service.fling('rice')).rejects.toMatchObject({ code: 'not-on-plate' });
    expect((await service.getPlate()).mess).toBe(1);
    expect((await service.getToday('SG')).binEaten).toBe(bin0 + 1);
  });
});
