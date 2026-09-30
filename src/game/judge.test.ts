// Kickoff prompt, check 2 (judge): the required cases, plus the label ladder and the Bin line priority.
import { describe, expect, it } from 'vitest';
import { judge, numberWord } from './judge';
import { applyVerdict } from './habits';
import { COPY } from './content/copy';
import { dish } from './content/dishes';
import { ingredient } from './content/ingredients';
import type { Level, Plate, PlateItem } from './types';

const CR = dish('chicken-rice');
const H0 = { chilli: 0, unhinged: 0 };
const item = (ingredientId: string, n = 1, cut: Level = 0, heat: Level = 0): PlateItem => ({
  ingredientId,
  n,
  cut,
  heat,
});
/** All six chicken-rice ingredients, one portion each, prepped as the recipe asks. */
const clean = (): PlateItem[] =>
  CR.ingredients.map((id) => {
    const g = ingredient(id);
    return item(id, 1, g.needsCut ? 1 : 0, g.needsHeat ? 1 : 0);
  });
const plate = (items: PlateItem[], flair = 0): Plate => ({ items, flair, mess: 0 });
const withItem = (items: PlateItem[], id: string, patch: Partial<PlateItem>): PlateItem[] =>
  items.map((i) => (i.ingredientId === id ? { ...i, ...patch } : i));

describe('judge (spec §3.5–3.9)', () => {
  it('clean chicken rice (all six, prepped) → 3 stones, Clean plate, Neat', () => {
    const v = judge(CR, plate(clean()), H0);
    expect(v).toMatchObject({
      stones: 3,
      score: 100,
      label: 'Clean plate',
      style: 'Neat',
      cursed: false,
      name: 'Chicken rice',
      habit: 'Neat plater, apparently',
      leftoversUsed: false,
      dishId: 'chicken-rice',
      flags: { chilli: false, rawRice: false },
    });
    expect(v.hint).toBeUndefined();
    expect(v.wasteLine).toBeUndefined();
    expect(COPY.lines[3]).toContain(v.line);
    expect(v.summary).toBe(
      'Poached chicken ×1 · Chicken rice ×1 · Ginger sauce ×1 · Chilli sauce ×1 · Cucumber ×1 · Dark soy ×1',
    );
  });

  it('the same plate with 10 × ginger sauce (Leftovers hour) → the Ten line, the Leftovers hour chip, Unhinged', () => {
    const v = judge(CR, plate(withItem(clean(), 'ginger', { n: 10 })), H0);
    expect(v.line).toBe('Ten portions of ginger sauce. Ten. I counted.');
    expect(v.leftoversUsed).toBe(true);
    expect(v.style).toBe('Unhinged');
    // 100 − 27 (excess 9 × 3) − 10 (an item at ≥ 5 portions) = 63: two stones, not cursed (register Q58).
    expect(v).toMatchObject({
      score: 63,
      stones: 2,
      cursed: false,
      label: 'Saucy but controlled',
      name: 'Chicken rice, drowning in ginger sauce',
      habit: 'Unhinged plate ×1 this month',
    });
  });

  it('durian added → the durian line', () => {
    const v = judge(CR, plate([...clean(), item('durian')]), H0);
    expect(v.line).toBe('Durian. In chicken rice. I will be filing a report.');
    expect(v).toMatchObject({ score: 77, stones: 3, cursed: false, name: 'Chicken rice with durian' });
  });

  it('two extras → cursed, with the Wasteways line', () => {
    const v = judge(CR, plate([...clean(), item('durian'), item('cheddar')]), H0);
    expect(v.cursed).toBe(true);
    expect(v.stones).toBe(1);
    expect(v.wasteLine).toBe('Something below said thank you. That is not normal.');
    expect(v.label).toBe('The Bin has questions');
    expect(v.hint).toBe('meant to be chicken rice');
    expect(v.name).toMatch(
      /^(Strange|Suspicious|Chaotic|Questionable|Cursed|Experimental|Unfortunate) (Plate|Bowl|Creation|Mess|Heap|Accident) (of unknown origin|with too much confidence|gone slightly wrong|that should not exist)$/,
    );
    expect(v.line).toBe('Durian. In chicken rice. I will be filing a report.'); // durian outranks the tier lines
    expect(v.style).toBe('Generous'); // 8 portions on a 6-ingredient recipe
  });

  it('two burnt items → cursed', () => {
    const v = judge(CR, plate(withItem(withItem(clean(), 'chicken', { heat: 3 }), 'rice', { heat: 3 })), H0);
    expect(v).toMatchObject({ score: 70, cursed: true, stones: 1 });
    expect(v.line).toBe('You burnt the poached chicken. It did nothing to you.');
    expect(v.wasteLine).toBeUndefined(); // score ≥ 15 and fewer than two extras
  });

  it('empty plate → the air line, Empty Plate of unknown origin, style Empty', () => {
    const v = judge(CR, plate([]), H0);
    expect(v).toMatchObject({
      line: 'You plated air. Bold. Pointless, but bold.',
      name: 'Empty Plate of unknown origin',
      hint: 'meant to be chicken rice',
      style: 'Empty',
      cursed: true,
      stones: 1,
      score: 50,
      label: 'The Bin has questions',
      summary: '',
      habit: 'A new habit is forming',
      leftoversUsed: false,
    });
  });

  it('raw rice → the rice line and the rawRice habit; the counter moves after the plate', () => {
    const v = judge(CR, plate(withItem(clean(), 'rice', { heat: 0 })), H0);
    expect(v.line).toBe('The rice is raw. Rice is the easy part.');
    expect(v.flags.rawRice).toBe(true);
    expect(v.habit).toBe('Raw rice. Again.');
    expect(v).toMatchObject({ score: 90, stones: 3, name: 'Chicken rice' });
    const h = applyVerdict({ chilli: 0, rawRice: 0, unhinged: 0, plates: 0, month: '2026-09' }, v);
    expect(h).toMatchObject({ rawRice: 1, plates: 1, chilli: 0, unhinged: 0 });
  });

  it('flair caps at +10 (inside the judge; the Station counter is not clamped)', () => {
    const half = clean().slice(0, 3); // chicken, rice, ginger: coverage 0.5 → 75
    expect(judge(CR, plate(half, 0), H0).score).toBe(75);
    expect(judge(CR, plate(half, 5), H0).score).toBe(85);
    expect(judge(CR, plate(half, 100), H0).score).toBe(85);
  });

  it('label ladder (spec §3.7)', () => {
    const generous = withItem(withItem(clean(), 'chicken', { n: 3 }), 'rice', { n: 3 }); // 10 portions
    expect(judge(CR, plate(generous), H0)).toMatchObject({
      stones: 3,
      style: 'Generous',
      label: 'Academy acceptable',
      name: 'Generous chicken rice',
    });
    // Raw chicken (−18) on the generous plate (−12) → 70: two stones, Generous, no sauce at 3.
    expect(judge(CR, plate(withItem(generous, 'chicken', { cut: 0, heat: 0 })), H0)).toMatchObject({
      score: 70,
      stones: 2,
      label: 'Bold but messy',
    });
    // Raw chicken and raw cucumber → 74: two stones, Neat.
    const comforting = withItem(withItem(clean(), 'chicken', { cut: 0, heat: 0 }), 'cucumber', { cut: 0 });
    expect(judge(CR, plate(comforting), H0)).toMatchObject({ score: 74, stones: 2, label: 'Comforting' });
    // Three ginger sauces on that plate: saucy wins over Generous/Neat.
    expect(judge(CR, plate(withItem(comforting, 'ginger', { n: 3 })), H0).label).toBe('Saucy but controlled');
    // One raw chicken alone: coverage 1/6 → 58, −18 → 40: one stone, not cursed.
    expect(judge(CR, plate([item('chicken')]), H0)).toMatchObject({
      score: 40,
      stones: 1,
      cursed: false,
      label: 'The plate lost the argument',
      name: 'Chicken rice, missing something',
    });
  });

  it('stone boundaries: 44 → one, 45 → two, 74 → two, 75 → three (spec §3.5)', () => {
    const at = (items: PlateItem[], flair: number) => judge(CR, plate(items, flair), H0);
    expect(at([item('chicken', 1, 3, 0)], 1)).toMatchObject({ score: 44, stones: 1, cursed: false }); // 58 − 6 − 10 + 2
    expect(at([item('chicken', 1, 0, 3)], 5)).toMatchObject({ score: 45, stones: 2 }); // 58 − 8 − 15 + 10
    const comforting = withItem(withItem(clean(), 'chicken', { cut: 0, heat: 0 }), 'cucumber', { cut: 0 });
    expect(at(comforting, 0)).toMatchObject({ score: 74, stones: 2 });
    expect(at(withItem(comforting, 'rice', { n: 2 }), 2)).toMatchObject({ score: 75, stones: 3 }); // −3 excess, +4
  });

  it("the Bin's line: air > durian > portions > burnt > raw rice > tier line (spec §3.8)", () => {
    const base = clean();
    expect(judge(CR, plate([...withItem(base, 'ginger', { n: 8 }), item('durian')]), H0).line).toBe(
      'Durian. In chicken rice. I will be filing a report.',
    );
    expect(
      judge(CR, plate(withItem(withItem(base, 'ginger', { n: 8 }), 'chicken', { heat: 3 })), H0).line,
    ).toBe('Eight portions of ginger sauce. Eight. I counted.');
    expect(
      judge(CR, plate(withItem(withItem(base, 'chicken', { heat: 3 }), 'rice', { heat: 0 })), H0).line,
    ).toBe('You burnt the poached chicken. It did nothing to you.');
    expect(judge(CR, plate(withItem(base, 'rice', { heat: 0 })), H0).line).toBe(
      'The rice is raw. Rice is the easy part.',
    );
    expect(judge(CR, plate(withItem(base, 'ginger', { n: 12 })), H0).line).toBe(
      'Twelve portions of ginger sauce. Twelve. I counted.',
    );
    expect(judge(CR, plate(withItem(base, 'ginger', { n: 13 })), H0).line).toBe(
      '13 portions of ginger sauce. 13. I counted.',
    );
    expect(numberWord(8)).toBe('Eight');
    expect(numberWord(3)).toBe('3');
  });

  it('optional bread is judged for prep but not coverage; the other dishes judge too', () => {
    const MS = dish('mutton-soup');
    const soup = MS.ingredients.map((id) => {
      const g = ingredient(id);
      return item(id, 1, g.needsCut ? 1 : 0, g.needsHeat ? 1 : 0);
    });
    expect(judge(MS, plate(soup), H0).score).toBe(100);
    expect(judge(MS, plate([...soup, item('roti', 1, 0, 0)]), H0).score).toBe(87); // raw roti −10, excess 1 −3
    for (const d of ['aglio-olio', 'nasi-lemak', 'fish-chips']) {
      const v = judge(dish(d), plate([]), H0);
      expect(v.name).toBe('Empty Plate of unknown origin');
      expect(v.dishId).toBe(d);
    }
  });
});
