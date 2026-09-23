import { describe, expect, it } from 'vitest';
import { DISHES, dish, dishLower } from './content/dishes';
import { EXTRAS, INGREDIENTS, INGREDIENT_MAP, STOCK0, ingredient } from './content/ingredients';
import { COPY, fill } from './content/copy';
import { CLASSES, CLASS_ORDER, GEMS } from './content/identity';
import { fnv1a, mulberry32 } from './hash';

describe('seed content (spec §4)', () => {
  it('has five dishes with 4–6 required ingredients and one optional bread row', () => {
    expect(DISHES).toHaveLength(5);
    for (const d of DISHES) {
      expect(d.ingredients.length).toBeGreaterThanOrEqual(4);
      expect(d.ingredients.length).toBeLessThanOrEqual(6);
      for (const id of [...d.ingredients, ...(d.optional ?? [])]) expect(INGREDIENT_MAP[id]).toBeDefined();
      expect(d.ingredients).toContain(d.main);
    }
    expect(dish('mutton-soup').optional).toEqual(['baguette', 'roti', 'sourdough']);
    expect(dish('mutton-soup').local).toBe('Sup kambing');
    expect(() => dish('laksa')).toThrow();
  });
  it('ingredient attributes match the spec table', () => {
    expect(ingredient('chicken')).toMatchObject({ needsCut: true, needsHeat: true, tags: ['protein'] });
    expect(ingredient('sambal')).toMatchObject({ needsHeat: true, tags: ['sauce', 'chilli'] });
    expect(ingredient('durian').extra).toBe(true);
    expect(EXTRAS).toEqual(['chilli-padi', 'durian', 'cheddar', 'ice-cream']);
    expect(INGREDIENTS).toHaveLength(34);
    expect(Object.keys(STOCK0)).toHaveLength(34);
    expect(() => ingredient('nope')).toThrow();
  });
  it('short names lower-case mid-sentence', () => {
    expect(dishLower(dish('chicken-rice'))).toBe('chicken rice');
    expect(fill(COPY.board.cta.pickDish, { dish: dishLower(dish('aglio-olio')) })).toBe(
      'Pick aglio e olio for today',
    );
    expect(fill('{n} of {m}', { n: 1 })).toBe('1 of {m}');
  });
  it('identity tables are complete', () => {
    expect(CLASS_ORDER).toHaveLength(9);
    expect(CLASSES.stirrer.role).toBe('Mage');
    expect(GEMS.ruby.plural).toBe('rubies');
  });
});

describe('hash helpers', () => {
  it('fnv1a is the prototype hash', () => {
    expect(fnv1a('')).toBe(2166136261);
    expect(fnv1a('a')).toBe(0xe40c292c);
    expect(fnv1a('chicken1111|rice1011chicken-rice')).toBe(fnv1a('chicken1111|rice1011chicken-rice'));
  });
  it('mulberry32 is deterministic and in [0, 1)', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      const x = a();
      expect(x).toBe(b());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
});
