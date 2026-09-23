// Station rules (spec §3.3–3.4), pure: prep words, portion style, what a sigil does to the plate, the Bin's remark.
import type { Dish, Level, Plate, PlateItem, Style } from './types';
import { COPY, fill } from './content/copy';
import { ingredient } from './content/ingredients';
import type { SigilKind } from './sigils';

/** Prep caption: non-zero words joined with ` · `; `raw` on plate chips when both are 0, empty on Pantry cards. */
export function prepText(p: Pick<PlateItem, 'cut' | 'heat'>, showRaw: boolean): string {
  const parts: string[] = [COPY.prep.cut[p.cut], COPY.prep.heat[p.heat]].filter((w) => w !== '');
  return parts.length ? parts.join(' · ') : showRaw ? COPY.prep.raw : '';
}

/**
 * Portion style (spec §3.4): `Empty` (0 portions) · `Unhinged` (any item ≥ 5, or total > 2 × required count) ·
 * `Generous` (total > required count + 1) · `Neat`.
 */
export function portionStyle(items: readonly PlateItem[], dish: Pick<Dish, 'ingredients'>): Style {
  const counted = items.filter((i) => i.n > 0);
  const total = counted.reduce((a, i) => a + i.n, 0);
  const required = dish.ingredients.length;
  if (total === 0) return 'Empty';
  if (counted.some((i) => i.n >= 5) || total > required * 2) return 'Unhinged';
  if (total > required + 1) return 'Generous';
  return 'Neat';
}

export const styleWord = (s: Style): string => COPY.style[s.toLowerCase() as Lowercase<Style>];

export interface SigilOutcome {
  plate: Plate;
  /** The word flashed on the pad. */
  word: string;
  remark?: string;
  /** PLATE: the caller plates the dish. */
  plateNow: boolean;
}

const bump = (l: Level): Level => Math.min(3, l + 1) as Level;

/**
 * Apply one sigil to the plate, in the prototype's order: flair first (fast strokes always count), PLATE plates,
 * CLEAN wipes (the classifier already turned a wipe without mess into a CUT), CUT/HEAT need a selected item with
 * portions on the plate.
 */
export function applySigil(
  plate: Plate,
  selected: string | null,
  kind: SigilKind,
  fast: boolean,
): SigilOutcome {
  const flair = plate.flair + (fast ? 1 : 0);
  const base: Plate = { ...plate, items: plate.items, flair };
  if (kind === 'plate') return { plate: base, word: COPY.sigils.plate, plateNow: true };
  if (kind === 'clean') {
    return { plate: { ...base, mess: 0 }, word: COPY.sigils.clean, remark: COPY.bin.clean, plateNow: false };
  }
  const word = kind === 'cut' ? COPY.sigils.cut : COPY.sigils.heat;
  const target = selected ? plate.items.find((i) => i.ingredientId === selected && i.n > 0) : undefined;
  if (!target) return { plate: base, word, remark: COPY.bin.noTarget, plateNow: false };
  const x = ingredient(target.ingredientId).name.toLowerCase();
  const replace = (next: PlateItem): PlateItem[] => plate.items.map((i) => (i === target ? next : i));
  if (kind === 'cut') {
    const cut = bump(target.cut);
    const remark =
      target.cut === 3 ? fill(COPY.bin.dustAlready, { x }) : cut === 3 ? COPY.bin.dustNow : undefined;
    return {
      plate: { ...base, items: replace({ ...target, cut }) },
      word,
      plateNow: false,
      ...(remark ? { remark } : {}),
    };
  }
  const heat = bump(target.heat);
  if (target.heat === 3) {
    return {
      plate: { ...base, items: replace(target) },
      word,
      remark: COPY.bin.burntAlready,
      plateNow: false,
    };
  }
  if (heat === 3) {
    // Reaching burnt adds +1 mess and a splat on the pad.
    return {
      plate: { ...base, items: replace({ ...target, heat }), mess: base.mess + 1 },
      word,
      remark: fill(COPY.bin.burntNow, { x }),
      plateNow: false,
    };
  }
  return { plate: { ...base, items: replace({ ...target, heat }) }, word, plateNow: false };
}

/** Fling the item: removed from the plate, mess +1 (spec §3.4). The pool side is PoolService.fling. */
export function flingItem(plate: Plate, ingredientId: string): Plate {
  return {
    ...plate,
    items: plate.items.filter((i) => i.ingredientId !== ingredientId),
    mess: plate.mess + 1,
  };
}

/** Rotating remark: the n-th refusal or fling of the session picks line n mod 3, in the spec's order. */
export const rotating = (lines: readonly string[], n: number): string => lines[n % lines.length] ?? '';

export interface Splat {
  left: number;
  top: number;
  width: number;
  height: number;
  radius: string;
}

/** The prototype's blob shape, the same for every splat. */
export const SPLAT_RADIUS = '40% 60% 55% 45%';

/**
 * Splat i (one per mess point): deterministic position and size so the pad looks the same after a reload.
 * Spec §5: 10–22px blobs (width and height drawn separately, as the prototype), placed by their top-left corner at
 * left 12–88 %. Top is 18–60 % (prototype 18–78 %) so a blob never lies under the spec's two-line pad hint, which
 * would drop that text below 4.5:1.
 */
export function splat(i: number): Splat {
  const r = (k: number): number => {
    let h = 2166136261 ^ (i * 7919 + k * 104729);
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  return {
    left: 12 + r(1) * 76,
    top: 18 + r(2) * 42,
    width: Math.round(10 + r(3) * 12),
    height: Math.round(10 + r(4) * 12),
    radius: SPLAT_RADIUS,
  };
}
