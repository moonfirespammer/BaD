// Simulated city: a deterministic function of (city, date, ms since midnight). Reloads and clock overrides
// reproduce the same state, so the Board's counts, avatars, stock and Bin-eaten counter "move" over the day
// without any hidden randomness. Wall rows use only names the Phase 3 namer can produce.

import type { City, ClassKey, Cook, Figure, Gem, WallEntry } from '@/game/types';
import { DISHES, dishLower } from '@/game/content/dishes';
import { INGREDIENT_MAP, STOCK0 } from '@/game/content/ingredients';
import { CLASS_ORDER, GEM_ORDER } from '@/game/content/identity';
import { fnv1a, mulberry32 } from '@/game/hash';
import { isMainIngredient } from '@/game/pool';

/** Cooking counts the prototype shows on its first Board; these cooks committed before the app is opened. */
export const SEED_COUNTS: Readonly<Record<string, number>> = {
  'chicken-rice': 38,
  'aglio-olio': 21,
  'mutton-soup': 12,
  'nasi-lemak': 44,
  'fish-chips': 9,
};

/** The prototype's three avatars per dish, kept as the first three cooks so the first Board matches. */
const SEED_COOKS: Readonly<Record<string, [ClassKey, Figure][]>> = {
  'chicken-rice': [
    ['taster', 't1f'],
    ['provider', 't2m'],
    ['host', 't1f'],
  ],
  'aglio-olio': [
    ['spark', 't2f'],
    ['purist', 't1m'],
    ['foodsmith', 't1m'],
  ],
  'mutton-soup': [
    ['rebel', 't2m'],
    ['gastronaut', 't1f'],
    ['stirrer', 't1m'],
  ],
  'nasi-lemak': [
    ['provider', 't1m'],
    ['host', 't2f'],
    ['spark', 't1f'],
  ],
  'fish-chips': [
    ['foodsmith', 't2m'],
    ['taster', 't1m'],
    ['purist', 't2f'],
  ],
};

const NAMES = [
  'Wei Lin',
  'Farhan',
  'Priya',
  'Jun Hao',
  'Aisyah',
  'Marcus',
  'Nadia',
  'Kavi',
  'Mei Ling',
  'Hafiz',
  'Devi',
  'Zhi Wei',
  'Nurul',
  'Daniel',
  'Shalini',
  'Arif',
  'Hui Min',
  'Irfan',
  'Ganesh',
  'Xin Yi',
  'Syafiq',
  'Kai',
  'Amira',
  'Ravi',
  'Yi Xuan',
  'Haziq',
  'Lakshmi',
  'Jia Hui',
  'Zul',
  'Sofia',
  'Ming',
  'Tan',
];

const FIGS: readonly Figure[] = ['t1m', 't1f', 't2m', 't2f'];
const DAY_MS = 864e5;
const EXTRA_PICKS_PER_DAY = 160;

interface SimCook {
  id: string;
  name: string;
  classKey: ClassKey;
  figure: Figure;
  gem: Gem;
}

type SimEvent =
  | { t: number; kind: 'pick'; cook: SimCook; dishId: string }
  | {
      t: number;
      kind: 'plate';
      cook: SimCook;
      dishId: string;
      entry: WallEntry;
      takes: Record<string, number>;
      fling: boolean;
    };

export interface SimState {
  counts: Record<string, number>;
  cooks: Record<string, Cook[]>;
  stock: Record<string, number>;
  binEaten: number;
  wall: Record<string, WallEntry[]>;
  /** ms since midnight of the next event, or null when the day is exhausted. */
  nextEventAt: number | null;
}

const TONES = ['Strange', 'Suspicious', 'Chaotic', 'Questionable', 'Cursed', 'Experimental', 'Unfortunate'];
const BASES = ['Plate', 'Bowl', 'Creation', 'Mess', 'Heap', 'Accident'];
const DETAILS = [
  'of unknown origin',
  'with too much confidence',
  'gone slightly wrong',
  'that should not exist',
];
const LINES: Record<1 | 2 | 3, string[]> = {
  3: [
    'Fine. I have eaten worse on purpose.',
    'Acceptable. Do not let it go to your head.',
    'Clean plate. I have nothing to add, which annoys me.',
  ],
  2: [
    'Edible. That is the whole review.',
    'You were close. Closeness is not a flavour.',
    'The rice is doing all the work here.',
  ],
  1: [
    'I am a bin and even I have standards.',
    'This plate lost an argument with itself.',
    'I will eat it. I will not enjoy it. I never do.',
  ],
};

const pickOne = <T>(rnd: () => number, arr: readonly T[]): T => {
  const v = arr[Math.floor(rnd() * arr.length)];
  if (v === undefined) throw new Error('empty array');
  return v;
};

/** A spec-producible wall row for a simulated cook (names and lines the Phase 3 judge/namer can generate). */
function makeEntry(rnd: () => number, cook: SimCook, dishId: string, platedAt: string): WallEntry {
  const d = DISHES.find((x) => x.id === dishId);
  if (!d) throw new Error(`Unknown dish ${dishId}`);
  const lower = dishLower(d);
  const sauce = d.ingredients.map((id) => INGREDIENT_MAP[id]).find((g) => g?.tags.includes('sauce'));
  const roll = rnd();
  let stones: 1 | 2 | 3;
  let variant: string;
  let style: string;
  if (roll < 0.35) {
    stones = 3;
    const seared = rnd() < 0.5;
    variant = seared ? `Seared ${lower}` : d.short;
    style = 'Neat';
  } else if (roll < 0.75) {
    stones = 2;
    const missing = rnd() < 0.5;
    variant = missing ? `${d.short}, missing something` : `Generous ${lower}`;
    style = missing ? 'Neat' : 'Generous';
  } else if (roll < 0.9) {
    stones = 1;
    variant = sauce ? `${d.short}, drowning in ${sauce.name.toLowerCase()}` : `${d.short}, missing something`;
    style = 'Unhinged';
  } else {
    stones = 1;
    variant = `${pickOne(rnd, TONES)} ${pickOne(rnd, BASES)} ${pickOne(rnd, DETAILS)}`;
    style = rnd() < 0.5 ? 'Unhinged' : 'Generous';
  }
  return {
    playerId: cook.id,
    name: cook.name,
    classKey: cook.classKey,
    figure: cook.figure,
    gem: cook.gem,
    stones,
    variant,
    style,
    line: pickOne(rnd, LINES[stones]),
    platedAt,
  };
}

const isoAt = (date: string, ms: number): string =>
  new Date(Date.parse(`${date}T00:00:00+08:00`) + ms).toISOString();

export class Simulation {
  private readonly events: SimEvent[];
  private readonly roster: SimCook[];

  constructor(
    readonly city: City,
    readonly date: string,
  ) {
    const rnd = mulberry32(fnv1a(`${city}|${date}`));
    this.roster = NAMES.flatMap((name, i) =>
      Array.from({ length: 8 }, (_, k): SimCook => {
        const seed = SEED_COOKS[DISHES[k % DISHES.length]?.id ?? '']?.[i] ?? null;
        return {
          id: `sim-${i}-${k}`,
          name: k === 0 ? name : `${name} ${String.fromCharCode(65 + k)}`,
          classKey: seed && k === 0 ? seed[0] : pickOne(rnd, CLASS_ORDER),
          figure: seed && k === 0 ? seed[1] : pickOne(rnd, FIGS),
          gem: pickOne(rnd, GEM_ORDER),
        };
      }),
    );
    const events: SimEvent[] = [];
    let cursor = 0;
    const takeCook = (): SimCook => {
      const c = this.roster[cursor % this.roster.length];
      cursor += 1;
      if (!c) throw new Error('empty roster');
      return c;
    };
    const addPickAndPlate = (cook: SimCook, dishId: string, t: number, plateDelayMs: number): void => {
      events.push({ t, kind: 'pick', cook, dishId });
      const pt = t + plateDelayMs;
      if (pt >= DAY_MS) return;
      const d = DISHES.find((x) => x.id === dishId);
      // Stock drifts slowly: one portion of one non-main ingredient per simulated plate.
      const takes: Record<string, number> = {};
      if (d) {
        const candidates = d.ingredients.filter((id) => !isMainIngredient(id));
        if (candidates.length) takes[pickOne(rnd, candidates)] = 1;
      }
      events.push({
        t: pt,
        kind: 'plate',
        cook,
        dishId,
        entry: makeEntry(rnd, cook, dishId, isoAt(date, pt)),
        takes,
        fling: rnd() < 0.1,
      });
    };
    // Overnight crowd: the prototype's seed counts, with the three seed avatars first for each dish.
    for (const d of DISHES) {
      const seedCooks = SEED_COOKS[d.id] ?? [];
      const n = SEED_COUNTS[d.id] ?? 0;
      for (let i = 0; i < n; i++) {
        const seed = seedCooks[i];
        const cook: SimCook = seed ? { ...takeCook(), classKey: seed[0], figure: seed[1] } : takeCook();
        // Picks are ordered so the seed avatars are the three most recent; plates spread over the first hours.
        addPickAndPlate(cook, d.id, seed ? 3 - i : -n + i, (10 + rnd() * 600) * 6e4);
      }
    }
    const weights = DISHES.map((d) => SEED_COUNTS[d.id] ?? 1);
    const total = weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < EXTRA_PICKS_PER_DAY; i++) {
      let r = rnd() * total;
      let dishId = DISHES[0]?.id ?? '';
      for (let k = 0; k < DISHES.length; k++) {
        r -= weights[k] ?? 0;
        if (r <= 0) {
          dishId = DISHES[k]?.id ?? dishId;
          break;
        }
      }
      addPickAndPlate(takeCook(), dishId, rnd() * DAY_MS, (5 + rnd() * 35) * 6e4);
    }
    events.sort((a, b) => a.t - b.t);
    this.events = events;
  }

  /** Fold every event with t ≤ msSinceMidnight. Seed picks have t ≤ 3 so they are always included. */
  stateAt(msSinceMidnight: number): SimState {
    const counts: Record<string, number> = {};
    const recent: Record<string, Cook[]> = {};
    const stock: Record<string, number> = { ...STOCK0 };
    const wall: Record<string, WallEntry[]> = {};
    let binEaten = 0;
    let nextEventAt: number | null = null;
    for (const d of DISHES) {
      counts[d.id] = 0;
      recent[d.id] = [];
      wall[d.id] = [];
    }
    for (const ev of this.events) {
      if (ev.t > msSinceMidnight) {
        nextEventAt = ev.t;
        break;
      }
      if (ev.kind === 'pick') {
        counts[ev.dishId] = (counts[ev.dishId] ?? 0) + 1;
        const list = recent[ev.dishId] ?? [];
        list.unshift({ classKey: ev.cook.classKey, figure: ev.cook.figure });
        if (list.length > 3) list.length = 3;
        recent[ev.dishId] = list;
      } else {
        binEaten += 1 + (ev.fling ? 1 : 0);
        for (const [id, n] of Object.entries(ev.takes)) stock[id] = Math.max(0, (stock[id] ?? 0) - n);
        (wall[ev.dishId] ??= []).push(ev.entry);
      }
    }
    return { counts, cooks: recent, stock, binEaten, wall, nextEventAt };
  }
}
