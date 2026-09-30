// Habits (spec §3.9): one line per plate, first match wins, and four persisted counters. Pure, no React.
import type { Habits, Style, Verdict } from './types';
import { COPY, fill } from './content/copy';

export interface HabitFacts {
  /** Chilli-tagged portions ≥ 2. */
  chilli: boolean;
  rawRice: boolean;
  style: Style;
  stones: 1 | 2 | 3;
  /** Sauce-tagged and protein-tagged portions on the plate. */
  sauceN: number;
  proteinN: number;
}

/**
 * The habit chip. `×{n}` is the counter after this plate (register Q52: the judge takes the current counters and
 * writes counter + 1, as the prototype).
 */
export function habitLine(f: HabitFacts, counters: Pick<Habits, 'chilli' | 'unhinged'>): string {
  const H = COPY.judge.habits;
  if (f.chilli) return fill(H.chilli, { n: counters.chilli + 1 });
  if (f.rawRice) return H.rawRice;
  if (f.style === 'Unhinged') return fill(H.unhinged, { n: counters.unhinged + 1 });
  if (f.stones === 3 && f.style === 'Neat') return H.neat;
  if (f.sauceN > f.proteinN && f.sauceN > 0) return H.sauce;
  return H.new;
}

/** After a plate every applicable counter moves, whichever line was shown (the prototype's plateDish()). */
export function applyVerdict(h: Habits, v: Pick<Verdict, 'flags' | 'style'>): Habits {
  return {
    ...h,
    plates: h.plates + 1,
    chilli: h.chilli + (v.flags.chilli ? 1 : 0),
    rawRice: h.rawRice + (v.flags.rawRice ? 1 : 0),
    unhinged: h.unhinged + (v.style === 'Unhinged' ? 1 : 0),
  };
}
