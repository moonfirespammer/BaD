import type {
  City,
  DayBoard,
  Pick,
  Plate,
  PlateItem,
  SavedVerdict,
  ThreadMessage,
  Verdict,
  WallEntry,
} from '@/game/types';
import { DISHES, dish } from '@/game/content/dishes';
import { STOCK0 } from '@/game/content/ingredients';
import { canTake, type TakeResult } from '@/game/pool';
import type { Clock } from './clock';
import { formatDate, nextResetAt } from './clock';
import type { Storage } from './storage';
import type { ProfileStore } from './profile';
import { NotImplementedError, PoolError, type PoolService } from './PoolService';
import { Simulation } from './sim';

/** Player-owned state for one city day; everything else is derived from the simulation. */
interface DayState {
  pick: Pick | null;
  plate: Plate;
  /** Portions the player currently holds from the pool, per ingredient (mirrors plate item counts). */
  taken: Record<string, number>;
  /** Portions the player flung to the Bin: gone from the pool for the day, never returned. */
  flung: Record<string, number>;
  /**
   * Portions simulated cooks wanted but could not get because the player held them. Monotonic per day, so
   * portions the player returns always reappear on the shelf.
   */
  refused: Record<string, number>;
  /** The player's own plates and flings, added to the simulated Bin-eaten counter. */
  binEatenExtra: number;
  posts: ThreadMessage[];
}

const emptyDay = (): DayState => ({
  pick: null,
  plate: { items: [], flair: 0, mess: 0 },
  taken: {},
  flung: {},
  refused: {},
  binEatenExtra: 0,
  posts: [],
});

const dayKey = (city: City, date: string): string => `bad:day:${city}:${date}`;

/** Seeded thread messages from the handoff prototype (same three on every dish, Phase 4 revisits). */
const SEED_THREAD: readonly [string, ThreadMessage['classKey'], ThreadMessage['figure'], string, string][] = [
  ['Wei Lin', 'taster', 't1f', '18:02', 'who else ran out of cucumber. the whole east side is dry'],
  [
    'Farhan',
    'provider',
    't2m',
    '18:40',
    'leftovers hour at 21:00. ginger sauce is at 88%. no cap. see you there',
  ],
  ['Aisyah', 'spark', 't2f', '19:15', 'the Bin said it counted. it did not count.'],
];

export interface MockPoolServiceOptions {
  city: City;
  clock: Clock;
  storage: Storage;
  profile: ProfileStore;
}

const add = (rec: Record<string, number>, id: string, n: number): void => {
  const v = (rec[id] ?? 0) + n;
  if (v > 0) rec[id] = v;
  else Reflect.deleteProperty(rec, id);
};

export class MockPoolService implements PoolService {
  private readonly city: City;
  private readonly clock: Clock;
  private readonly storage: Storage;
  private readonly profile: ProfileStore;
  private sim: Simulation | null = null;
  private day: DayState | null = null;
  private date = '';
  /** The in-flight load of a city day, shared by every caller that asks for that day while it loads. */
  private loading: { date: string; promise: Promise<DayState> } | null = null;
  /** Serialises every read-modify-write so two calls can never interleave (one dish per day, etc.). */
  private queue: Promise<unknown> = Promise.resolve();
  private readonly listeners = new Set<(b: DayBoard) => void>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private lastEmitted = '';

  constructor(opts: MockPoolServiceOptions) {
    this.city = opts.city;
    this.clock = opts.clock;
    this.storage = opts.storage;
    this.profile = opts.profile;
  }

  // ---- day lifecycle -------------------------------------------------------------------------------------

  /** The current city day. A new day is only installed once fully loaded, so no caller ever sees a mix. */
  private ensureDay(): Promise<DayState> {
    const { date } = this.clock.city();
    if (this.day && this.date === date) return Promise.resolve(this.day);
    if (this.loading?.date === date) return this.loading.promise;
    const promise = (async () => {
      const saved = await this.storage.get<DayState>(dayKey(this.city, date));
      const day: DayState = { ...emptyDay(), ...saved };
      this.sim = new Simulation(this.city, date);
      this.day = day;
      this.date = date;
      if (this.loading?.date === date) this.loading = null;
      return day;
    })();
    this.loading = { date, promise };
    return promise;
  }

  /** Run `fn` after every earlier call has finished, on the current day. */
  private exclusive<T>(fn: (day: DayState) => Promise<T> | T): Promise<T> {
    const run = this.queue.then(async () => fn(await this.ensureDay()));
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async save(): Promise<void> {
    if (this.day) await this.storage.set(dayKey(this.city, this.date), this.day);
  }

  /** Units left on the shelf: seed − simulated takes (minus the ones refused) − the player's holdings − flings. */
  private stockOf(day: DayState, drained: Record<string, number>): Record<string, number> {
    const stock: Record<string, number> = {};
    for (const [id, s0] of Object.entries(STOCK0)) {
      const player = (day.taken[id] ?? 0) + (day.flung[id] ?? 0);
      const wanted = drained[id] ?? 0;
      const raw = s0 - player - (wanted - (day.refused[id] ?? 0));
      // Simulated cooks who arrived to an empty shelf left without it; never refuse more than they wanted.
      if (raw < 0) add(day.refused, id, Math.min(-raw, wanted - (day.refused[id] ?? 0)));
      stock[id] = Math.max(0, s0 - player - (wanted - (day.refused[id] ?? 0)));
    }
    return stock;
  }

  private snapshot(): DayBoard {
    if (!this.sim || !this.day) throw new Error('ensureDay() first');
    const now = this.clock.now();
    const s = this.sim.stateAt(this.clock.city().msSinceMidnight);
    const counts = { ...s.counts };
    const cooks = { ...s.cooks };
    const p = this.profile.get();
    if (this.day.pick) {
      const id = this.day.pick.dishId;
      counts[id] = (counts[id] ?? 0) + 1;
      // Owner ruling (Q8): the player's own avatar appears on their card, as the most recent cook.
      cooks[id] = [{ classKey: p.classKey, figure: p.figure }, ...(s.cooks[id] ?? [])].slice(0, 3);
    }
    return {
      city: this.city,
      date: this.date,
      resetAt: new Date(nextResetAt(now)).toISOString(),
      leftoversHour: this.clock.leftovers(),
      binEaten: s.binEaten + this.day.binEatenExtra,
      dishes: [...DISHES],
      counts,
      cooks,
      stock: this.stockOf(this.day, s.drained),
    };
  }

  private async emit(): Promise<void> {
    await this.ensureDay();
    const board = this.snapshot();
    const sig = JSON.stringify([
      board.date,
      board.leftoversHour,
      board.binEaten,
      board.counts,
      board.cooks,
      board.stock,
    ]);
    if (sig === this.lastEmitted) return;
    this.lastEmitted = sig;
    for (const l of this.listeners) l(board);
  }

  // ---- PoolService ---------------------------------------------------------------------------------------

  async getToday(city: City): Promise<DayBoard> {
    if (city !== this.city) throw new Error(`This service is bound to ${this.city}`);
    await this.ensureDay();
    return this.snapshot();
  }

  async getPick(): Promise<Pick | null> {
    return (await this.ensureDay()).pick;
  }

  async getPlate(): Promise<Plate> {
    return structuredClone((await this.ensureDay()).plate);
  }

  pick(dishId: string): Promise<Pick> {
    return this.exclusive(async (day) => {
      dish(dishId);
      if (day.pick) throw new PoolError('already-picked', 'One dish per day');
      day.pick = { playerId: this.profile.get().id, date: this.date, dishId, swapsLeft: 1 };
      await this.save();
      await this.emit();
      return day.pick;
    });
  }

  swap(dishId: string): Promise<Pick> {
    return this.exclusive(async (day) => {
      dish(dishId);
      if (!day.pick) throw new PoolError('not-picked', 'Pick a dish first');
      if (day.pick.dishId === dishId) throw new PoolError('same-dish', 'Already cooking that');
      if (day.pick.swapsLeft === 0) throw new PoolError('no-swaps', 'No swaps left today');
      // Spec §3.2: swapping clears the plate; taken portions go back to the pool (flung ones stay gone).
      day.taken = {};
      day.plate = { items: [], flair: 0, mess: 0 };
      day.pick = { ...day.pick, dishId, swapsLeft: 0 };
      await this.save();
      await this.emit();
      return day.pick;
    });
  }

  private item(day: DayState, ingredientId: string): PlateItem {
    let it = day.plate.items.find((i) => i.ingredientId === ingredientId);
    if (!it) {
      it = { ingredientId, n: 0, cut: 0, heat: 0 };
      day.plate.items.push(it);
    }
    return it;
  }

  takePortion(ingredientId: string): Promise<TakeResult & { stock: number }> {
    return this.exclusive(async (day) => {
      const board = this.snapshot();
      const units = board.stock[ingredientId] ?? 0;
      const held = day.taken[ingredientId] ?? 0;
      const result = canTake(units, held, board.leftoversHour, ingredientId);
      if (!result.ok) return { ...result, stock: units };
      add(day.taken, ingredientId, 1);
      this.item(day, ingredientId).n += 1;
      await this.save();
      await this.emit();
      return { ...result, stock: this.snapshot().stock[ingredientId] ?? 0 };
    });
  }

  returnPortion(ingredientId: string): Promise<{ stock: number }> {
    return this.exclusive(async (day) => {
      if ((day.taken[ingredientId] ?? 0) > 0) {
        add(day.taken, ingredientId, -1);
        const it = this.item(day, ingredientId);
        it.n = Math.max(0, it.n - 1);
        if (it.n === 0) day.plate.items = day.plate.items.filter((i) => i !== it);
        await this.save();
        await this.emit();
      }
      return { stock: this.snapshot().stock[ingredientId] ?? 0 };
    });
  }

  fling(ingredientId: string): Promise<void> {
    return this.exclusive(async (day) => {
      // Spec §3.4: removes the item, mess +1, city Bin-eaten counter +1. The portions are eaten, not returned.
      const held = day.taken[ingredientId] ?? 0;
      if (held > 0) {
        add(day.taken, ingredientId, -held);
        add(day.flung, ingredientId, held);
      }
      day.plate.items = day.plate.items.filter((i) => i.ingredientId !== ingredientId);
      day.plate.mess += 1;
      day.binEatenExtra += 1;
      await this.save();
      await this.emit();
    });
  }

  saveDraft(plate: Plate): Promise<void> {
    return this.exclusive(async (day) => {
      const lvl = (v: number): 0 | 1 | 2 | 3 => Math.max(0, Math.min(3, Math.round(v))) as 0 | 1 | 2 | 3;
      const client = new Map(plate.items.map((i) => [i.ingredientId, i]));
      // Portions (n) stay as the pool counted them; the client owns prep, flair and mess.
      day.plate = {
        items: day.plate.items.map((i) => {
          const c = client.get(i.ingredientId);
          return c ? { ...i, cut: lvl(c.cut), heat: lvl(c.heat) } : i;
        }),
        flair: Math.max(0, Math.round(plate.flair)),
        mess: Math.max(0, Math.round(plate.mess)),
      };
      await this.save();
    });
  }

  plate(_plate: Plate): Promise<Verdict> {
    return Promise.reject(new NotImplementedError('plate'));
  }

  async getWall(dishId: string): Promise<WallEntry[]> {
    await this.ensureDay();
    if (!this.sim) throw new Error('no simulation');
    return this.sim.stateAt(this.clock.city().msSinceMidnight).wall[dishId] ?? [];
  }

  async getThread(dishId: string): Promise<ThreadMessage[]> {
    const day = await this.ensureDay();
    const seeded = SEED_THREAD.map(([name, classKey, figure, at, text], i): ThreadMessage => ({
      id: `seed-${dishId}-${i}`,
      dishId,
      date: this.date,
      playerId: `seed-${i}`,
      name,
      classKey,
      figure,
      text,
      at,
    }));
    return [...seeded, ...day.posts.filter((m) => m.dishId === dishId)];
  }

  post(dishId: string, text: string): Promise<ThreadMessage> {
    return this.exclusive(async (day) => {
      const p = this.profile.get();
      const ct = this.clock.city();
      const hh = String(ct.hour).padStart(2, '0');
      const mm = String(Math.floor((ct.msSinceMidnight / 6e4) % 60)).padStart(2, '0');
      const msg: ThreadMessage = {
        id: `post-${day.posts.length + 1}`,
        dishId,
        date: this.date,
        playerId: p.id,
        name: p.name,
        classKey: p.classKey,
        figure: p.figure,
        text,
        at: `${hh}:${mm}`,
      };
      day.posts.push(msg);
      await this.save();
      return msg;
    });
  }

  report(_messageId: string): Promise<void> {
    return Promise.resolve();
  }

  mute(_playerId: string): Promise<void> {
    return Promise.resolve();
  }

  getGallery(): Promise<SavedVerdict[]> {
    return Promise.resolve([...this.profile.get().cursedPlates]);
  }

  async setSignature(verdict: Verdict): Promise<void> {
    await this.profile.update({ signature: { ...verdict, date: formatDate(this.clock.now()) } });
  }

  subscribe(city: City, listener: (board: DayBoard) => void): () => void {
    if (city !== this.city) throw new Error(`This service is bound to ${this.city}`);
    this.listeners.add(listener);
    // Every new subscriber gets the current board at once, even when nothing changed since the last emit.
    void this.ensureDay().then(() => {
      if (this.listeners.has(listener)) listener(this.snapshot());
    });
    this.timer ??= setInterval(() => void this.emit(), 1000);
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0 && this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    };
  }
}
