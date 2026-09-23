import { describe, expect, it } from 'vitest';
import {
  boardCta,
  canTake,
  capLifted,
  dishStockState,
  isMainIngredient,
  portionsToReturn,
  stockState,
} from './pool';
import { STOCK0 } from './content/ingredients';
import { DISHES } from './content/dishes';

describe('stock states (spec §3.3 + owner ruling Q5)', () => {
  it('bands: plenty > 50, moderate 26–50, running low 1–25, gone 0', () => {
    expect(stockState(51)).toBe('plenty');
    expect(stockState(50)).toBe('moderate');
    expect(stockState(26)).toBe('moderate');
    expect(stockState(25)).toBe('low');
    expect(stockState(1)).toBe('low');
    expect(stockState(0)).toBe('gone');
    expect(stockState(-3)).toBe('gone');
  });
  it('the main ingredient of every dish never runs out', () => {
    for (const d of DISHES) {
      expect(isMainIngredient(d.main)).toBe(true);
      expect(stockState(0, d.main)).toBe('plenty');
    }
    expect(isMainIngredient('cucumber')).toBe(false);
  });
  it('Leftovers hour lifts the cap only above 25 units', () => {
    expect(capLifted(true, 'plenty')).toBe(true);
    expect(capLifted(true, 'moderate')).toBe(true);
    expect(capLifted(true, 'low')).toBe(false);
    expect(capLifted(true, 'gone')).toBe(false);
    expect(capLifted(false, 'plenty')).toBe(false);
  });
});

describe('canTake (soft cap, Leftovers rule, Gone)', () => {
  it('allows three portions, refuses the fourth outside Leftovers hour', () => {
    expect(canTake(88, 0, false)).toEqual({ ok: true });
    expect(canTake(88, 2, false)).toEqual({ ok: true });
    expect(canTake(88, 3, false)).toEqual({ ok: false, reason: 'cap' });
    expect(canTake(88, 7, false)).toEqual({ ok: false, reason: 'cap' });
  });
  it('allows the fourth in Leftovers hour only when stock > 25, with the milestone notes', () => {
    expect(canTake(88, 3, true)).toEqual({ ok: true, note: 'leftovers4' });
    expect(canTake(88, 9, true)).toEqual({ ok: true, note: 'leftovers10' });
    expect(canTake(88, 4, true)).toEqual({ ok: true });
    expect(canTake(26, 3, true)).toEqual({ ok: true, note: 'leftovers4' });
    expect(canTake(25, 3, true)).toEqual({ ok: false, reason: 'cap' });
    expect(canTake(22, 3, true, 'chicken')).toEqual({ ok: true, note: 'leftovers4' }); // main ingredient is always plenty
  });
  it('Gone at 0 regardless of the hour', () => {
    expect(canTake(0, 0, false)).toEqual({ ok: false, reason: 'gone' });
    expect(canTake(0, 0, true)).toEqual({ ok: false, reason: 'gone' });
  });
});

describe('dishStockState', () => {
  it('reports the worst required ingredient, ignoring the main one', () => {
    expect(dishStockState('chicken-rice', STOCK0)).toBe('gone'); // cucumber 0
    expect(dishStockState('aglio-olio', STOCK0)).toBe('low'); // parmesan 14
    expect(dishStockState('fish-chips', STOCK0)).toBe('moderate'); // peas 38
    expect(dishStockState('mutton-soup', STOCK0)).toBe('low'); // coriander 19
    expect(dishStockState('fish-chips', { ...STOCK0, peas: 60, lemon: 60 })).toBe('plenty');
  });
});

describe('portionsToReturn', () => {
  it('sums portions per ingredient and skips empty items', () => {
    expect(
      portionsToReturn([
        { ingredientId: 'ginger', n: 3, cut: 0, heat: 0 },
        { ingredientId: 'rice', n: 1, cut: 0, heat: 1 },
        { ingredientId: 'egg', n: 0, cut: 0, heat: 0 },
      ]),
    ).toEqual({ ginger: 3, rice: 1 });
  });
});

describe('boardCta ladder (spec §3.2)', () => {
  it('walks the five states in order', () => {
    expect(boardCta(null, null, 1)).toEqual({ kind: 'pick', disabled: true });
    expect(boardCta(null, 'chicken-rice', 1)).toEqual({
      kind: 'pickDish',
      disabled: false,
      dishId: 'chicken-rice',
    });
    expect(boardCta('chicken-rice', 'chicken-rice', 1)).toEqual({
      kind: 'cook',
      disabled: false,
      dishId: 'chicken-rice',
    });
    expect(boardCta('chicken-rice', null, 1)).toEqual({
      kind: 'cook',
      disabled: false,
      dishId: 'chicken-rice',
    });
    expect(boardCta('chicken-rice', 'nasi-lemak', 1)).toEqual({
      kind: 'swap',
      disabled: false,
      dishId: 'nasi-lemak',
    });
    expect(boardCta('nasi-lemak', 'chicken-rice', 0)).toEqual({ kind: 'noSwaps', disabled: true });
    expect(boardCta('nasi-lemak', 'nasi-lemak', 0)).toEqual({
      kind: 'cook',
      disabled: false,
      dishId: 'nasi-lemak',
    });
  });
});
