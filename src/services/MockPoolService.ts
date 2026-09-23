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
  /** The player's own plates and flings, added to the simulated Bin-eaten counter. */
  binEatenExtra: number;
  posts: ThreadMessage[];
}

const emptyDay = (): DayState => ({
  pick: null,
  plate: { items: [], flair: 0, mess: 0 },
  taken: {},
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

export class MockPoolService implements PoolService {
  private readonly city: City;
  private readonly clock: Clock;
  private readonly storage: Storage;
  private readonly profile: ProfileStore;
  private sim: Simulation | null = null;
  private day: DayState | null = null;
  private date = '';
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

  private async ensureDay(): Promise<DayState> {
    const { date } = this.clock.city();
    if (this.day && this.date === date) return this.day;
    this.date = date;
    this.sim = new Simulation(this.city, date);
    const saved = await this.storage.get<DayState>(dayKey(this.city, date));
    this.day = saved ?? emptyDay();
    return this.day;
  }

  private async save(): Promise<void> {
    if (this.day) await this.storage.set(dayKey(this.city, this.date), this.day);
  }

  private snapshot(): DayBoard {
    if (!this.sim || !this.day) throw new Error('ensureDay() first');
    const now = this.clock.now();
    const ct = this.clock.city();
    const s = this.sim.stateAt(ct.msSinceMidnight);
    const counts = { ...s.counts };
    const cooks = { ...s.cooks };
    const p = this.profile.get();
    if (this.day.pick) {
      const id = this.day.pick.dishId;
      counts[id] = (counts[id] ?? 0) + 1;
      // Owner ruling (Q8): the player's own avatar appears on their card, as the most recent cook.
      cooks[id] = [{ classKey: p.classKey, figure: p.figure }, ...(s.cooks[id] ?? [])].slice(0, 3);
    }
    const stock = { ...s.stock };
    for (const [id, n] of Object.entries(this.day.taken)) stock[id] = Math.max(0, (stock[id] ?? 0) - n);
    return {
      city: this.city,
      date: this.date,
      resetAt: new Date(nextResetAt(now)).toISOString(),
      leftoversHour: this.clock.leftovers(),
      binEaten: s.binEaten + this.day.binEatenExtra,
      dishes: [...DISHES],
      counts,
      cooks,
      stock,
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

  async pick(dishId: string): Promise<Pick> {
    const day = await this.ensureDay();
    dish(dishId);
    if (day.pick) throw new PoolError('already-picked', 'One dish per day');
    day.pick = { playerId: this.profile.get().id, date: this.date, dishId, swapsLeft: 1 };
    await this.save();
    await this.emit();
    return day.pick;
  }

  async swap(dishId: string): Promise<Pick> {
    const day = await this.ensureDay();
    dish(dishId);
    if (!day.pick) throw new PoolError('not-picked', 'Pick a dish first');
    if (day.pick.dishId === dishId) throw new PoolError('same-dish', 'Already cooking that');
    if (day.pick.swapsLeft === 0) throw new PoolError('no-swaps', 'No swaps left today');
    // Spec §3.2: swapping clears the plate; taken portions go back to the pool (stock is derived from `taken`).
    day.taken = {};
    day.plate = { items: [], flair: 0, mess: 0 };
    day.pick = { ...day.pick, dishId, swapsLeft: 0 };
    await this.save();
    await this.emit();
    return day.pick;
  }

  private item(day: DayState, ingredientId: string): PlateItem {
    let it = day.plate.items.find((i) => i.ingredientId === ingredientId);
    if (!it) {
      it = { ingredientId, n: 0, cut: 0, heat: 0 };
      day.plate.items.push(it);
    }
    return it;
  }

  async takePortion(ingredientId: string): Promise<TakeResult & { stock: number }> {
    const day = await this.ensureDay();
    const board = this.snapshot();
    const units = board.stock[ingredientId] ?? 0;
    const held = day.taken[ingredientId] ?? 0;
    const result = canTake(units, held, board.leftoversHour, ingredientId);
    if (!result.ok) return { ...result, stock: units };
    day.taken[ingredientId] = held + 1;
    this.item(day, ingredientId).n += 1;
    await this.save();
    await this.emit();
    return { ...result, stock: units - 1 };
  }

  async returnPortion(ingredientId: string): Promise<{ stock: number }> {
    const day = await this.ensureDay();
    const held = day.taken[ingredientId] ?? 0;
    if (held > 0) {
      const { [ingredientId]: _drop, ...rest } = day.taken;
      day.taken = held - 1 > 0 ? { ...rest, [ingredientId]: held - 1 } : rest;
      const it = this.item(day, ingredientId);
      it.n = Math.max(0, it.n - 1);
      if (it.n === 0) day.plate.items = day.plate.items.filter((i) => i !== it);
      await this.save();
      await this.emit();
    }
    return { stock: this.snapshot().stock[ingredientId] ?? 0 };
  }

  async fling(ingredientId: string): Promise<void> {
    const day = await this.ensureDay();
    // Spec §3.4: removes the item, mess +1, city Bin-eaten counter +1. Portions are not returned to the pool.
    day.plate.items = day.plate.items.filter((i) => i.ingredientId !== ingredientId);
    day.plate.mess += 1;
    day.binEatenExtra += 1;
    await this.save();
    await this.emit();
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

  async post(dishId: string, text: string): Promise<ThreadMessage> {
    const day = await this.ensureDay();
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
    void this.emit();
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
