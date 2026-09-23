import { describe, expect, it } from 'vitest';
import { applySigil, flingItem, portionStyle, prepText, rotating, splat, styleWord } from './station';
import { dish } from './content/dishes';
import type { Plate, PlateItem } from './types';

const item = (ingredientId: string, n = 1, cut: 0 | 1 | 2 | 3 = 0, heat: 0 | 1 | 2 | 3 = 0): PlateItem => ({
  ingredientId,
  n,
  cut,
  heat,
});
const plate = (items: PlateItem[], flair = 0, mess = 0): Plate => ({ items, flair, mess });

describe('prep words (spec §3.4)', () => {
  it('joins non-zero words; raw on chips, empty on Pantry cards', () => {
    expect(prepText({ cut: 0, heat: 0 }, true)).toBe('raw');
    expect(prepText({ cut: 0, heat: 0 }, false)).toBe('');
    expect(prepText({ cut: 1, heat: 1 }, true)).toBe('cut · cooked');
    expect(prepText({ cut: 2, heat: 2 }, true)).toBe('diced · seared');
    expect(prepText({ cut: 3, heat: 3 }, true)).toBe('dust · burnt');
    expect(prepText({ cut: 0, heat: 2 }, false)).toBe('seared');
  });
});

describe('portion style (spec §3.4)', () => {
  const cr = dish('chicken-rice'); // 6 required
  it('Empty, Neat, Generous, Unhinged by the spec thresholds', () => {
    expect(portionStyle([], cr)).toBe('Empty');
    expect(portionStyle([item('ginger', 0)], cr)).toBe('Empty');
    expect(portionStyle([item('ginger', 3), item('rice', 4)], cr)).toBe('Neat'); // 7 = required + 1
    expect(portionStyle([item('ginger', 4), item('rice', 4)], cr)).toBe('Generous'); // 8 > 7
    expect(portionStyle([item('ginger', 5)], cr)).toBe('Unhinged'); // any item ≥ 5
    expect(portionStyle([item('ginger', 4), item('rice', 4), item('egg', 4), item('dark-soy', 1)], cr)).toBe(
      'Unhinged',
    ); // 13 > 12
    expect(portionStyle([item('ginger', 4), item('rice', 4), item('egg', 4)], cr)).toBe('Generous'); // 12 = 2 × 6
    expect(styleWord('Unhinged')).toBe('Unhinged');
  });
});

describe('applySigil (spec §3.4, prototype order)', () => {
  it('fast strokes add flair on every branch, even with no target', () => {
    expect(applySigil(plate([]), null, 'cut', true).plate.flair).toBe(1);
    expect(applySigil(plate([], 2), null, 'heat', false).plate.flair).toBe(2);
    expect(applySigil(plate([], 4), null, 'plate', true).plate.flair).toBe(5);
    expect(applySigil(plate([], 0, 1), null, 'clean', true).plate.flair).toBe(1);
  });
  it('PLATE plates, whatever is selected', () => {
    const o = applySigil(plate([]), null, 'plate', false);
    expect(o).toMatchObject({ word: 'PLATE', plateNow: true });
    expect(o.remark).toBeUndefined();
  });
  it('CLEAN wipes the mess with the Bin remark', () => {
    const o = applySigil(plate([item('ginger')], 0, 3), 'ginger', 'clean', false);
    expect(o.plate.mess).toBe(0);
    expect(o).toMatchObject({ word: 'CLEAN', remark: 'Cleaner. Not clean. Cleaner.', plateNow: false });
  });
  it('CUT or HEAT with nothing selected (or a selection with no portions) asks for a target', () => {
    for (const sel of [null, 'ginger', 'egg']) {
      const o = applySigil(plate([item('ginger', 0)]), sel, 'cut', false);
      expect(o).toMatchObject({ word: 'CUT', remark: 'Strokes need a target. Tap something first.' });
    }
    expect(applySigil(plate([]), null, 'heat', false)).toMatchObject({
      word: 'HEAT',
      remark: 'Strokes need a target. Tap something first.',
    });
  });
  it('CUT steps cut → diced → dust, then the dust remarks', () => {
    let p = plate([item('parsley'), item('garlic')]);
    const words: (string | undefined)[] = [];
    for (let i = 0; i < 4; i++) {
      const o = applySigil(p, 'parsley', 'cut', false);
      p = o.plate;
      words.push(o.remark);
    }
    expect(p.items[0]).toMatchObject({ cut: 3, heat: 0 });
    expect(p.items[1]).toEqual(item('garlic'));
    expect(words).toEqual([
      undefined,
      undefined,
      'That is dust now. Congratulations.',
      'The parsley is dust. It cannot get smaller.',
    ]);
  });
  it('HEAT steps cooked → seared → burnt; burnt adds mess and the remark; past burnt it is trying', () => {
    let p = plate([item('chicken', 2, 1)], 0, 0);
    const remarks: (string | undefined)[] = [];
    for (let i = 0; i < 4; i++) {
      const o = applySigil(p, 'chicken', 'heat', false);
      p = o.plate;
      remarks.push(o.remark);
    }
    expect(p.items[0]).toMatchObject({ n: 2, cut: 1, heat: 3 });
    expect(p.mess).toBe(1); // only the step that reached burnt
    expect(remarks).toEqual([
      undefined,
      undefined,
      'You burnt the poached chicken. It did nothing to you.',
      'It cannot get more burnt. It is trying.',
    ]);
  });
  it('fling removes the item and adds mess', () => {
    expect(flingItem(plate([item('ginger', 3), item('rice')], 1, 1), 'ginger')).toEqual(
      plate([item('rice')], 1, 2),
    );
  });
});

describe('rotating remarks and splats', () => {
  it('rotates in order and wraps', () => {
    const lines = ['a', 'b', 'c'];
    expect([0, 1, 2, 3, 4].map((n) => rotating(lines, n))).toEqual(['a', 'b', 'c', 'a', 'b']);
    expect(rotating([], 3)).toBe('');
  });
  it('splats are deterministic, 10–22px, inside the pad margins', () => {
    for (let i = 0; i < 50; i++) {
      const s = splat(i);
      expect(splat(i)).toEqual(s);
      expect(s.size).toBeGreaterThanOrEqual(10);
      expect(s.size).toBeLessThanOrEqual(22);
      expect(s.left).toBeGreaterThanOrEqual(12);
      expect(s.left).toBeLessThanOrEqual(88);
      expect(s.top).toBeGreaterThanOrEqual(18);
      expect(s.top).toBeLessThanOrEqual(78);
    }
    expect(splat(1)).not.toEqual(splat(2));
  });
});
