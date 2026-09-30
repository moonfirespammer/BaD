// Kickoff prompt, check 2 (namer): determinism on random plates, and prefix/suffix precedence per spec §3.6.
import { describe, expect, it } from 'vitest';
import { cursedName, cursedRenderKey, dishName, seed } from './namer';
import { judge } from './judge';
import { COPY } from './content/copy';
import { DISHES, dish } from './content/dishes';
import { EXTRAS } from './content/ingredients';
import { fnv1a, mulberry32 } from './hash';
import type { Level, Plate, PlateItem } from './types';

const CR = dish('chicken-rice');
const H0 = { chilli: 0, unhinged: 0 };

function randomPlate(rnd: () => number, dishId: string): Plate {
  const d = dish(dishId);
  const pool = [...d.ingredients, ...(d.optional ?? []), ...EXTRAS].sort(() => rnd() - 0.5);
  const items: PlateItem[] = pool
    .filter(() => rnd() < 0.5)
    .map((ingredientId) => ({
      ingredientId,
      n: 1 + Math.floor(rnd() * (rnd() < 0.8 ? 3 : 10)),
      cut: Math.floor(rnd() * 4) as Level,
      heat: Math.floor(rnd() * 4) as Level,
    }));
  return { items, flair: Math.floor(rnd() * 7), mess: 0 };
}

describe('namer (spec §3.6)', () => {
  it('the seed is FNV-1a of "{id}{n}{cut}{heat}|…" + dishId, byte for byte as the prototype', () => {
    const items: PlateItem[] = [
      { ingredientId: 'chicken', n: 1, cut: 1, heat: 1 },
      { ingredientId: 'rice', n: 1, cut: 0, heat: 1 },
      { ingredientId: 'ginger', n: 1, cut: 0, heat: 0 },
    ];
    const h = seed(items, 'chicken-rice');
    expect(h).toBe(fnv1a('chicken111|rice101|ginger100chicken-rice'));
    expect(cursedName(h, false)).toBe('Unfortunate Heap of unknown origin'); // the register's probe (Q50)
    expect(seed([...items].reverse(), 'chicken-rice')).not.toBe(h); // plate order is part of the seed (Q50)
    expect(seed([], 'nasi-lemak')).toBe(fnv1a('nasi-lemak'));
  });

  it('the same plate always gets the same name: 100 random plates, run twice', () => {
    const rnd = mulberry32(2026);
    for (let k = 0; k < 100; k++) {
      const d = DISHES[k % DISHES.length] ?? CR;
      const plate = randomPlate(rnd, d.id);
      const a = judge(d, structuredClone(plate), { chilli: k, unhinged: k % 3 });
      const b = judge(d, structuredClone(plate), { chilli: k, unhinged: k % 3 });
      expect(b).toEqual(a);
      expect(b.key).toBe(seed(plate.items, d.id));
    }
  });

  it('cursed names are {Tone} {Base} {Detail} from the spec lists, and the empty plate has its own name', () => {
    const { tones, bases, details } = COPY.namer;
    const seen = new Set<string>();
    for (let k = 0; k < 600; k++) {
      const name = cursedName(fnv1a(`plate-${k}`), false);
      const m = /^(\S+) (\S+) (.+)$/.exec(name);
      expect(m).not.toBeNull();
      expect(tones).toContain(m?.[1]);
      expect(bases).toContain(m?.[2]);
      expect(details).toContain(m?.[3]);
      seen.add(name);
    }
    expect(seen.size).toBeGreaterThan(100); // all three parts vary
    expect(cursedName(123, true)).toBe('Empty Plate of unknown origin');
  });

  it('prefix precedence: burnt > seared > Generous; the dish is lower-cased when prefixed', () => {
    const base = { style: 'Neat' as const, coverage: 1, burnt: false, seared: false };
    expect(dishName(CR, { ...base, burnt: true, seared: true, style: 'Generous' })).toBe(
      'Burnt chicken rice',
    );
    expect(dishName(CR, { ...base, seared: true, style: 'Generous' })).toBe('Seared chicken rice');
    expect(dishName(CR, { ...base, style: 'Generous' })).toBe('Generous chicken rice');
    expect(dishName(CR, base)).toBe('Chicken rice');
    expect(dishName(dish('mutton-soup'), { ...base, seared: true })).toBe('Seared mutton soup'); // ruling Q1
  });

  it('suffix precedence: a sauce at 4+ > exactly one extra > coverage < 1', () => {
    const base = { style: 'Neat' as const, coverage: 0.5, burnt: false, seared: false };
    expect(dishName(CR, { ...base, sauce: 'ginger sauce', extra: 'durian' })).toBe(
      'Chicken rice, drowning in ginger sauce',
    );
    expect(dishName(CR, { ...base, extra: 'durian' })).toBe('Chicken rice with durian');
    expect(dishName(CR, base)).toBe('Chicken rice, missing something');
    expect(dishName(CR, { ...base, seared: true })).toBe('Seared chicken rice, missing something');
  });

  it('the judge feeds the namer from the plate: burnt, seared, drowning, missing', () => {
    const prepped = (id: string, n = 1, cut: Level = 1, heat: Level = 1): PlateItem => ({
      ingredientId: id,
      n,
      cut,
      heat,
    });
    const full = [
      prepped('chicken'),
      prepped('rice', 1, 0, 1),
      prepped('ginger', 1, 0, 0),
      prepped('chilli-sauce', 1, 0, 0),
      prepped('cucumber', 1, 1, 0),
      prepped('dark-soy', 1, 0, 0),
    ];
    const at = (items: PlateItem[]) => judge(CR, { items, flair: 0, mess: 0 }, H0).name;
    expect(at(full.map((i) => (i.ingredientId === 'rice' ? { ...i, heat: 3 } : i)))).toBe(
      'Burnt chicken rice',
    );
    expect(at(full.map((i) => (i.ingredientId === 'chicken' ? { ...i, heat: 2 } : i)))).toBe(
      'Seared chicken rice',
    );
    // Four ginger sauces make nine portions: Generous, and drowning.
    expect(at(full.map((i) => (i.ingredientId === 'ginger' ? { ...i, n: 4 } : i)))).toBe(
      'Generous chicken rice, drowning in ginger sauce',
    );
    expect(at(full.slice(0, 5))).toBe('Chicken rice, missing something');
    expect(at([...full, prepped('cheddar', 1, 0, 0)])).toBe('Chicken rice with cheddar');
  });

  it('the cursed render key is the Base word, or empty', () => {
    expect(cursedRenderKey('Empty Plate of unknown origin')).toBe('empty');
    expect(cursedRenderKey('Strange Bowl gone slightly wrong')).toBe('bowl');
    expect(cursedRenderKey('Cursed Accident that should not exist')).toBe('accident');
  });
});
