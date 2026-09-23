import type { Ingredient, Tag } from '../types';

const I = (
  id: string,
  name: string,
  assetKey: string,
  cut: 0 | 1,
  heat: 0 | 1,
  tags: Tag[] = [],
  extra = false,
): Ingredient => ({
  id,
  name,
  assetKey,
  needsCut: cut === 1,
  needsHeat: heat === 1,
  tags,
  ...(extra ? { extra } : {}),
});

/** Ids and attributes ported verbatim from the prototype (the reference implementation); assetKey from the asset brief. */
export const INGREDIENTS: readonly Ingredient[] = [
  I('chicken', 'Poached chicken', 'poached-chicken', 1, 1, ['protein']),
  I('rice', 'Chicken rice', 'chicken-rice', 0, 1, ['rice']),
  I('ginger', 'Ginger sauce', 'ginger-sauce', 0, 0, ['sauce']),
  I('chilli-sauce', 'Chilli sauce', 'chilli-sauce', 0, 0, ['sauce', 'chilli']),
  I('cucumber', 'Cucumber', 'cucumber', 1, 0),
  I('dark-soy', 'Dark soy', 'dark-soy', 0, 0, ['sauce']),
  I('spaghetti', 'Spaghetti', 'spaghetti', 0, 1, ['carb']),
  I('garlic', 'Garlic', 'garlic', 1, 1),
  I('olive-oil', 'Olive oil', 'olive-oil', 0, 1, ['sauce']),
  I('chilli-flakes', 'Chilli flakes', 'chilli-flakes', 0, 0, ['chilli']),
  I('parsley', 'Parsley', 'parsley', 1, 0),
  I('parmesan', 'Parmesan', 'parmesan', 0, 0),
  I('mutton', 'Mutton', 'mutton', 1, 1, ['protein']),
  I('spices', 'Soup spices', 'soup-spices', 0, 1),
  I('onion', 'Onion', 'onion', 1, 1),
  I('coriander', 'Coriander', 'coriander', 1, 0),
  I('baguette', 'Baguette', 'baguette', 1, 0),
  I('roti', 'Roti', 'roti', 0, 1),
  I('sourdough', 'Sourdough', 'sourdough', 1, 1),
  I('coconut-rice', 'Coconut rice', 'coconut-rice', 0, 1, ['rice']),
  I('sambal', 'Sambal', 'sambal', 0, 1, ['sauce', 'chilli']),
  I('anchovies', 'Fried anchovies', 'fried-anchovies', 0, 1),
  I('peanuts', 'Peanuts', 'peanuts', 0, 1),
  I('egg', 'Egg', 'egg', 0, 1),
  I('fish', 'Fish fillet', 'fish-fillet', 1, 1, ['protein']),
  I('batter', 'Batter', 'batter', 0, 1),
  I('potato', 'Potato', 'potato', 1, 1),
  I('peas', 'Mushy peas', 'mushy-peas', 0, 1),
  I('tartare', 'Tartare', 'tartare', 0, 0, ['sauce']),
  I('lemon', 'Lemon', 'lemon', 1, 0),
  I('chilli-padi', 'Chilli padi', 'chilli-padi', 1, 0, ['chilli'], true),
  I('durian', 'Durian', 'durian', 0, 0, [], true),
  I('cheddar', 'Cheddar', 'cheddar', 0, 0, [], true),
  I('ice-cream', 'Ice cream', 'ice-cream', 0, 0, [], true),
];

export const INGREDIENT_MAP: Readonly<Record<string, Ingredient>> = Object.fromEntries(
  INGREDIENTS.map((i) => [i.id, i]),
);

export const EXTRAS: readonly string[] = ['chilli-padi', 'durian', 'cheddar', 'ice-cream'];

export function ingredient(id: string): Ingredient {
  const g = INGREDIENT_MAP[id];
  if (!g) throw new Error(`Unknown ingredient ${id}`);
  return g;
}

/**
 * Stock at 00:00 city time. The prototype's table was a mid-day snapshot (cucumber and roti at 0); owner decision
 * after the Phase 1 review: every shelf starts the day above 25, so shelves run out only through play. Values the
 * prototype had above 25 are kept. Both cities start from the same numbers, in separate pools.
 */
export const STOCK0: Readonly<Record<string, number>> = {
  chicken: 60,
  rice: 64,
  ginger: 88,
  'chilli-sauce': 71,
  cucumber: 58,
  'dark-soy': 93,
  spaghetti: 58,
  garlic: 47,
  'olive-oil': 80,
  'chilli-flakes': 66,
  parsley: 44,
  parmesan: 36,
  mutton: 56,
  spices: 77,
  onion: 52,
  coriander: 38,
  baguette: 41,
  roti: 40,
  sourdough: 63,
  'coconut-rice': 55,
  sambal: 48,
  anchovies: 72,
  peanuts: 84,
  egg: 40,
  fish: 60,
  batter: 69,
  potato: 76,
  peas: 38,
  tartare: 57,
  lemon: 45,
  'chilli-padi': 81,
  durian: 97,
  cheddar: 74,
  'ice-cream': 32,
};
