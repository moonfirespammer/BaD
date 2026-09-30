// Naming (spec §3.6), a faithful port of the naming block of the prototype's judge(): the seed, the cursed names
// and the `{prefix}{dish}{suffix}` names. Pure, no React.
import type { Dish, Ingredient, PlateItem, Style } from './types';
import { COPY, fill } from './content/copy';
import { fnv1a } from './hash';

/** A plate item joined with its ingredient's attributes, as the judge sees it. */
export type JudgedItem = Ingredient & PlateItem;

/**
 * Seed = FNV-1a 32-bit of `"{id}{n}{cut}{heat}|…" + dishId` (spec §3.6), byte-for-byte as the prototype, over the
 * items in plate order (first-add order; register Q50 — items are not sorted, so tap order is part of the seed).
 */
export function seed(items: readonly PlateItem[], dishId: string): number {
  return fnv1a(items.map((i) => `${i.ingredientId}${i.n}${i.cut}${i.heat}`).join('|') + dishId);
}

/** `{Tone} {Base} {Detail}` from the seed; `Empty Plate of unknown origin` for a plate with nothing on it. */
export function cursedName(h: number, empty: boolean): string {
  if (empty) return COPY.judge.emptyName;
  const { tones, bases, details } = COPY.namer;
  const tone = tones[h % tones.length] ?? '';
  const base = bases[(h >>> 3) % bases.length] ?? '';
  const detail = details[(h >>> 6) % details.length] ?? '';
  return `${tone} ${base} ${detail}`;
}

export interface NameFacts {
  /** Any burnt item. */
  burnt: boolean;
  /** Any protein at heat 2. */
  seared: boolean;
  style: Style;
  /** The first sauce with n ≥ 4, lower-cased. */
  sauce?: string | undefined;
  /** The one extra, lower-cased (only when exactly one). */
  extra?: string | undefined;
  coverage: number;
}

/**
 * Not cursed → `{prefix}{dish}{suffix}`: prefix (first match) burnt · seared · Generous; suffix (first match) a sauce
 * with n ≥ 4 · exactly one extra · coverage < 1. The dish is lower-cased when prefixed (spec §3.6).
 */
export function dishName(dish: Pick<Dish, 'short'>, f: NameFacts): string {
  const P = COPY.namer.prefix;
  const S = COPY.namer.suffix;
  const pre = f.burnt ? P.burnt : f.seared ? P.seared : f.style === 'Generous' ? P.generous : '';
  const suf = f.sauce
    ? fill(S.drowning, { sauce: f.sauce })
    : f.extra
      ? fill(S.extra, { extra: f.extra })
      : f.coverage < 1
        ? S.missing
        : '';
  return pre + (pre ? dish.short.toLowerCase() : dish.short) + suf;
}

/** The Base word of a cursed name, lower-cased: the cursed render key (asset brief); `empty` for a plate of air. */
export function cursedRenderKey(name: string): string {
  if (name === COPY.judge.emptyName) return 'empty';
  return name.split(' ')[1]?.toLowerCase() ?? 'plate';
}
