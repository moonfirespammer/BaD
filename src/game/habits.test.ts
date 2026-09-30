// Kickoff prompt, check 2 (habits): each of the six habit strings is reachable; the counters move per plate.
import { describe, expect, it } from 'vitest';
import { applyVerdict, habitLine, type HabitFacts } from './habits';
import { judge } from './judge';
import { dish } from './content/dishes';
import { ingredient } from './content/ingredients';
import type { Habits, Level, PlateItem } from './types';

const CR = dish('chicken-rice');
const item = (ingredientId: string, n = 1, cut: Level = 0, heat: Level = 0): PlateItem => ({
  ingredientId,
  n,
  cut,
  heat,
});
const clean = (): PlateItem[] =>
  CR.ingredients.map((id) => {
    const g = ingredient(id);
    return item(id, 1, g.needsCut ? 1 : 0, g.needsHeat ? 1 : 0);
  });
const withItem = (items: PlateItem[], id: string, patch: Partial<PlateItem>): PlateItem[] =>
  items.map((i) => (i.ingredientId === id ? { ...i, ...patch } : i));
const line = (items: PlateItem[], counters = { chilli: 0, unhinged: 0 }): string =>
  judge(CR, { items, flair: 0, mess: 0 }, counters).habit;

describe('habits (spec §3.9)', () => {
  it('first match: chilli ≥ 2 · raw rice · Unhinged · 3 stones & Neat · sauce > protein · new habit', () => {
    const base: HabitFacts = {
      chilli: false,
      rawRice: false,
      style: 'Neat',
      stones: 2,
      sauceN: 0,
      proteinN: 1,
    };
    const c = { chilli: 4, unhinged: 1 };
    expect(habitLine({ ...base, chilli: true, rawRice: true, style: 'Unhinged' }, c)).toBe(
      'You doubled the chilli again · ×5',
    );
    expect(habitLine({ ...base, rawRice: true, style: 'Unhinged' }, c)).toBe('Raw rice. Again.');
    expect(habitLine({ ...base, style: 'Unhinged', stones: 3 }, c)).toBe('Unhinged plate ×2 this month');
    expect(habitLine({ ...base, stones: 3 }, c)).toBe('Neat plater, apparently');
    expect(habitLine({ ...base, stones: 3, style: 'Generous', sauceN: 2, proteinN: 1 }, c)).toBe(
      'Sauce first, as usual',
    );
    expect(habitLine({ ...base, sauceN: 0, proteinN: 0 }, c)).toBe('A new habit is forming');
    expect(habitLine({ ...base, sauceN: 1, proteinN: 1 }, c)).toBe('A new habit is forming');
  });

  it('every line is reachable from a real plate through the judge', () => {
    expect(line(withItem(clean(), 'chilli-sauce', { n: 2 }))).toBe('You doubled the chilli again · ×1');
    expect(line(withItem(clean(), 'rice', { heat: 0 }))).toBe('Raw rice. Again.');
    expect(line(withItem(clean(), 'ginger', { n: 5 }), { chilli: 0, unhinged: 6 })).toBe(
      'Unhinged plate ×7 this month',
    );
    expect(line(clean())).toBe('Neat plater, apparently');
    // Sauces (4) outnumber the chicken (1); raw chicken and raw cucumber keep it at two stones (71).
    const saucy = withItem(
      withItem(withItem(clean(), 'ginger', { n: 2 }), 'chicken', { cut: 0, heat: 0 }),
      'cucumber',
      { cut: 0 },
    );
    expect(line(saucy)).toBe('Sauce first, as usual');
    expect(line([])).toBe('A new habit is forming');
  });

  it('applyVerdict moves every applicable counter, whichever line was shown', () => {
    const h: Habits = { chilli: 1, rawRice: 2, unhinged: 3, plates: 4, month: '2026-09' };
    const items = withItem(withItem(clean(), 'chilli-sauce', { n: 6 }), 'rice', { heat: 0 });
    const v = judge(CR, { items, flair: 0, mess: 0 }, h);
    expect(v.habit).toBe('You doubled the chilli again · ×2'); // the chilli line wins …
    expect(v.style).toBe('Unhinged');
    expect(v.flags).toEqual({ chilli: true, rawRice: true });
    expect(applyVerdict(h, v)).toEqual({ chilli: 2, rawRice: 3, unhinged: 4, plates: 5, month: '2026-09' }); // … all move
    expect(applyVerdict(h, judge(CR, { items: clean(), flair: 0, mess: 0 }, h))).toEqual({ ...h, plates: 5 });
  });
});
