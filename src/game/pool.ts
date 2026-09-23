import type { PlateItem, StockState } from './types';
import { DISH_MAP } from './content/dishes';

/** Spec §3.3: plenty > 25 · Running low 1–25 · Gone 0. Owner ruling (Q5) splits plenty into plenty (> 50) and moderate (26–50). */
export const LOW_MAX = 25;
export const MODERATE_MAX = 50;
export const SOFT_CAP = 3;

const MAINS = new Set(Object.values(DISH_MAP).map((d) => d.main));

/** A dish's main ingredient never runs out (owner ruling, Q5). */
export const isMainIngredient = (ingredientId: string): boolean => MAINS.has(ingredientId);

export function stockState(units: number, ingredientId?: string): StockState {
  if (ingredientId !== undefined && isMainIngredient(ingredientId)) return 'plenty';
  if (units <= 0) return 'gone';
  if (units <= LOW_MAX) return 'low';
  if (units <= MODERATE_MAX) return 'moderate';
  return 'plenty';
}

/** Leftovers hour lifts the cap for stock in the spec's "plenty" band only (> 25), i.e. plenty or moderate here. */
export const capLifted = (leftoversHour: boolean, state: StockState): boolean =>
  leftoversHour && (state === 'plenty' || state === 'moderate');

export type TakeResult =
  { ok: true; note?: 'leftovers4' | 'leftovers10' } | { ok: false; reason: 'gone' | 'cap' };

/** Pure rule for one tap on the Pantry. `held` = portions the player already has of this ingredient. */
export function canTake(
  units: number,
  held: number,
  leftoversHour: boolean,
  ingredientId?: string,
): TakeResult {
  const st = stockState(units, ingredientId);
  if (st === 'gone') return { ok: false, reason: 'gone' };
  const lifted = capLifted(leftoversHour, st);
  if (held >= SOFT_CAP && !lifted) return { ok: false, reason: 'cap' };
  if (held === SOFT_CAP && lifted) return { ok: true, note: 'leftovers4' };
  if (held === 9 && lifted) return { ok: true, note: 'leftovers10' };
  return { ok: true };
}

/** The worst stock state among a dish's required ingredients, for the Board card (owner ruling, Q5). */
export function dishStockState(dishId: string, stock: Record<string, number>): StockState {
  const d = DISH_MAP[dishId];
  if (!d) throw new Error(`Unknown dish ${dishId}`);
  const rank: Record<StockState, number> = { plenty: 0, moderate: 1, low: 2, gone: 3 };
  let worst: StockState = 'plenty';
  for (const id of d.ingredients) {
    const st = stockState(stock[id] ?? 0, id);
    if (rank[st] > rank[worst]) worst = st;
  }
  return worst;
}

/** Portions to hand back to the pool when a plate is cleared (swap). Spec §3.2. */
export function portionsToReturn(items: readonly PlateItem[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const it of items) if (it.n > 0) out[it.ingredientId] = (out[it.ingredientId] ?? 0) + it.n;
  return out;
}

export type CtaState =
  | { kind: 'pick'; disabled: true }
  | { kind: 'pickDish'; disabled: false; dishId: string }
  | { kind: 'cook'; disabled: false; dishId: string }
  | { kind: 'swap'; disabled: false; dishId: string }
  | { kind: 'noSwaps'; disabled: true };

/** Spec §3.2 CTA ladder: Pick a dish → Pick {dish} for today → Cook {dish} → Swap to {dish} · 1 swap left → No swaps left today. */
export function boardCta(picked: string | null, selected: string | null, swapsLeft: 0 | 1): CtaState {
  if (!picked) {
    return selected
      ? { kind: 'pickDish', disabled: false, dishId: selected }
      : { kind: 'pick', disabled: true };
  }
  if (!selected || selected === picked) return { kind: 'cook', disabled: false, dishId: picked };
  return swapsLeft > 0
    ? { kind: 'swap', disabled: false, dishId: selected }
    : { kind: 'noSwaps', disabled: true };
}
