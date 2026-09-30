// The Bin's judge (spec §3.5 score and stones, §3.7 label, §3.8 line, §3.9 habit): pure, deterministic, a faithful
// port of the prototype's judge() including its order of checks. No React, no clock (register Q58).
import type { Dish, Habits, Plate, Verdict } from './types';
import { COPY, fill } from './content/copy';
import { dishLower } from './content/dishes';
import { ingredient } from './content/ingredients';
import { habitLine } from './habits';
import { cursedName, dishName, seed, type JudgedItem } from './namer';
import { portionStyle } from './station';

const NUMBER_WORDS: Readonly<Record<number, string>> = COPY.numbers;
/** Number words to twelve, numerals beyond (spec §3.8). */
export const numberWord = (n: number): string => NUMBER_WORDS[n] ?? String(n);

const sum = (items: readonly JudgedItem[], tag: 'sauce' | 'protein' | 'chilli'): number =>
  items.filter((i) => i.tags.includes(tag)).reduce((a, i) => a + i.n, 0);

/**
 * Judge a plate. `habits` are the player's current counters (the habit line shows counter + 1); `plate.flair`
 * adds at most +10 to the score (register Q59).
 */
export function judge(dish: Dish, plate: Plate, habits: Pick<Habits, 'chilli' | 'unhinged'>): Verdict {
  const recipe = [...dish.ingredients, ...(dish.optional ?? [])];
  const items: JudgedItem[] = plate.items
    .filter((i) => i.n > 0)
    .map((i) => ({ ...ingredient(i.ingredientId), ...i }));
  const total = items.reduce((a, i) => a + i.n, 0);
  const present = items.filter((i) => dish.ingredients.includes(i.id));
  const coverage = present.length / dish.ingredients.length;

  // ---- score (spec §3.5, in the prototype's order) ----
  let score = 100 - Math.round((1 - coverage) * 50);
  let burnt = 0;
  let rawRice = false;
  for (const i of items) {
    if (recipe.includes(i.id)) {
      if (i.needsCut && i.cut === 0) score -= 8;
      if (i.needsHeat && i.heat === 0) {
        score -= 10;
        if (i.tags.includes('rice')) rawRice = true;
      }
      if (!i.needsHeat && i.heat >= 1) score -= 4;
      if (i.cut === 3) score -= 6;
    }
    if (i.heat === 3) {
      score -= 15;
      burnt += 1;
    }
  }
  const extras = items.filter((i) => i.extra);
  score -= extras.length * 20;
  const excess = Math.max(0, total - dish.ingredients.length);
  score -= Math.min(30, excess * 3);
  // Strict `>`: on a tie the first item in plate order is the biggest one (prototype).
  const maxItem = items.reduce<{ n: number; name: string }>((m, i) => (i.n > m.n ? i : m), {
    n: 0,
    name: '',
  });
  if (maxItem.n >= 5) score -= 10;
  score += Math.min(5, plate.flair) * 2;
  score = Math.max(0, Math.min(100, score));

  // Spec §3.4/§7: `Empty` for no portions (the prototype's judge said Neat there; register Q45, spec wins).
  const style = portionStyle(items, dish);
  const cursed = total === 0 || score < 35 || extras.length >= 2 || burnt >= 2;
  const stones: 1 | 2 | 3 = cursed ? 1 : score >= 75 ? 3 : score >= 45 ? 2 : 1;
  const chilli = sum(items, 'chilli') >= 2;
  const lower = dishLower(dish);
  const key = seed(items, dish.id);

  // ---- name (spec §3.6) ----
  let name: string;
  let hint: string | undefined;
  if (cursed) {
    name = cursedName(key, total === 0);
    hint = fill(COPY.judge.hint, { dish: lower });
  } else {
    const sauce = items.find((i) => i.tags.includes('sauce') && i.n >= 4);
    name = dishName(dish, {
      burnt: burnt > 0,
      seared: items.some((i) => i.tags.includes('protein') && i.heat === 2),
      style,
      sauce: sauce?.name.toLowerCase(),
      extra: extras.length === 1 ? extras[0]?.name.toLowerCase() : undefined,
      coverage,
    });
  }

  // ---- label (spec §3.7) ----
  const saucy = items.some((i) => i.tags.includes('sauce') && i.n >= 3);
  const L = COPY.judge.labels;
  const label =
    stones === 3
      ? style === 'Neat'
        ? L.clean
        : L.academy
      : stones === 2
        ? saucy
          ? L.saucy
          : style === 'Generous'
            ? L.bold
            : L.comforting
        : cursed
          ? L.questions
          : L.lost;

  // ---- the Bin's line (spec §3.8, first match wins) ----
  const burntItem = items.find((i) => i.heat === 3);
  let line: string;
  if (total === 0) line = COPY.judge.air;
  else if (extras.some((e) => e.id === 'durian')) line = fill(COPY.judge.durian, { dish: lower });
  else if (maxItem.n >= 8) {
    const word = numberWord(maxItem.n);
    line = fill(COPY.judge.portions, { Eight: word, item: maxItem.name.toLowerCase() });
  } else if (burntItem) line = fill(COPY.bin.burntNow, { x: burntItem.name.toLowerCase() });
  else if (rawRice) line = COPY.judge.rawRice;
  else line = COPY.lines[stones][key % 3] ?? '';
  const waste = cursed && (extras.length >= 2 || score < 15);

  const habit = habitLine(
    { chilli, rawRice, style, stones, sauceN: sum(items, 'sauce'), proteinN: sum(items, 'protein') },
    habits,
  );

  return {
    name,
    ...(hint !== undefined ? { hint } : {}),
    label,
    line,
    ...(waste ? { wasteLine: COPY.judge.waste } : {}),
    stones,
    score,
    style,
    cursed,
    habit,
    leftoversUsed: items.some((i) => i.n > 3),
    summary: items.map((i) => fill(COPY.station.chip, { Ingredient: i.name, n: i.n })).join(' · '),
    dishId: dish.id,
    key,
    flags: { chilli, rawRice },
  };
}
