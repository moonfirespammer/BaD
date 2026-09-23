import type { Dish } from '../types';

/** Spec §4. `cuisine` is the prototype's caption text; `cuisines` the owner's category list (Q10). Neither is rendered. */
export const DISHES: readonly Dish[] = [
  {
    id: 'chicken-rice',
    name: 'Hainanese chicken rice',
    short: 'Chicken rice',
    cuisine: 'Hainanese · Singapore',
    cuisines: ['chinese', 'asian'],
    ingredients: ['chicken', 'rice', 'ginger', 'chilli-sauce', 'cucumber', 'dark-soy'],
    main: 'chicken',
  },
  {
    id: 'aglio-olio',
    name: 'Spaghetti aglio e olio',
    short: 'Aglio e olio',
    cuisine: 'Italian',
    cuisines: ['italian', 'western'],
    ingredients: ['spaghetti', 'garlic', 'olive-oil', 'chilli-flakes', 'parsley', 'parmesan'],
    main: 'spaghetti',
  },
  {
    id: 'mutton-soup',
    name: 'Mutton soup',
    short: 'Mutton soup',
    local: 'Sup kambing',
    cuisine: 'Malay · Indian-Muslim',
    cuisines: ['malay-indo', 'indian', 'asian'],
    ingredients: ['mutton', 'spices', 'onion', 'coriander'],
    optional: ['baguette', 'roti', 'sourdough'],
    main: 'mutton',
  },
  {
    id: 'nasi-lemak',
    name: 'Nasi lemak',
    short: 'Nasi lemak',
    cuisine: 'Malay · Kuala Lumpur',
    cuisines: ['malay-indo', 'asian'],
    ingredients: ['coconut-rice', 'sambal', 'anchovies', 'peanuts', 'egg', 'cucumber'],
    main: 'coconut-rice',
  },
  {
    id: 'fish-chips',
    name: 'Fish and chips',
    short: 'Fish and chips',
    cuisine: 'British',
    cuisines: ['western'],
    ingredients: ['fish', 'batter', 'potato', 'peas', 'tartare', 'lemon'],
    main: 'fish',
  },
];

export const DISH_MAP: Readonly<Record<string, Dish>> = Object.fromEntries(DISHES.map((d) => [d.id, d]));

export function dish(id: string): Dish {
  const d = DISH_MAP[id];
  if (!d) throw new Error(`Unknown dish ${id}`);
  return d;
}

/** `{dish}` mid-sentence: the short name lower-cased (prototype rule, confirmed by the owner). */
export const dishLower = (d: Dish): string => d.short.toLowerCase();
