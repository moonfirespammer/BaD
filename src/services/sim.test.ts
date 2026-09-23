import { describe, expect, it } from 'vitest';
import { SEED_COUNTS, Simulation } from './sim';
import { STOCK0 } from '@/game/content/ingredients';
import { DISHES } from '@/game/content/dishes';
import { isMainIngredient } from '@/game/pool';

describe('Simulation (deterministic city)', () => {
  it('is a pure function of city, date and time', () => {
    const a = new Simulation('SG', '2026-09-23').stateAt(13 * 36e5);
    const b = new Simulation('SG', '2026-09-23').stateAt(13 * 36e5);
    expect(a).toEqual(b);
    const kl = new Simulation('KL', '2026-09-23').stateAt(13 * 36e5);
    expect(kl.counts).not.toEqual(a.counts);
  });
  it('starts the day with the prototype counts and avatars', () => {
    const s = new Simulation('SG', '2026-09-23').stateAt(10);
    expect(s.counts).toEqual(SEED_COUNTS);
    expect(s.cooks['chicken-rice']).toEqual([
      { classKey: 'taster', figure: 't1f' },
      { classKey: 'provider', figure: 't2m' },
      { classKey: 'host', figure: 't1f' },
    ]);
    expect(s.binEaten).toBe(0);
    expect(s.nextEventAt).toBeGreaterThan(10);
  });
  it('counts and the Bin-eaten counter grow over the day, stock never goes negative, mains are untouched', () => {
    const sim = new Simulation('SG', '2026-09-23');
    let prev = sim.stateAt(0);
    for (let h = 1; h <= 24; h++) {
      const s = sim.stateAt(h * 36e5 - 1);
      for (const d of DISHES) expect(s.counts[d.id]).toBeGreaterThanOrEqual(prev.counts[d.id] ?? 0);
      expect(s.binEaten).toBeGreaterThanOrEqual(prev.binEaten);
      for (const [id, n] of Object.entries(s.stock)) {
        expect(n).toBeGreaterThanOrEqual(0);
        if (isMainIngredient(id)) expect(n).toBe(STOCK0[id]);
      }
      prev = s;
    }
    const end = sim.stateAt(24 * 36e5 - 1);
    expect(end.nextEventAt).toBeNull();
    const total = Object.values(end.counts).reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThan(Object.values(SEED_COUNTS).reduce((a, b) => a + b, 0));
    expect(end.binEaten).toBeGreaterThan(100);
  });
  it('writes spec-producible wall rows, most recent last, three cooks per dish', () => {
    const s = new Simulation('SG', '2026-09-23').stateAt(20 * 36e5);
    for (const d of DISHES) {
      expect(s.cooks[d.id]).toHaveLength(3);
      const wall = s.wall[d.id] ?? [];
      expect(wall.length).toBeGreaterThan(0);
      for (const row of wall) {
        expect([1, 2, 3]).toContain(row.stones);
        expect(row.variant.length).toBeGreaterThan(0);
        expect(row.line.endsWith('.')).toBe(true);
        expect(row.name).not.toBe('');
      }
      const times = wall.map((r) => r.platedAt);
      expect([...times].sort()).toEqual(times);
    }
  });
});
