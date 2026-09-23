import { create } from 'zustand';
import type { City, DayBoard, Pick, Plate, Profile } from '@/game/types';
import { NotImplementedError, PoolError, type PoolService } from '@/services/PoolService';
import type { Clock } from '@/services/clock';
import type { ProfileStore } from '@/services/profile';
import { dish } from '@/game/content/dishes';
import { ingredient } from '@/game/content/ingredients';
import { CITY_NAME } from '@/game/content/identity';
import { COPY, fill } from '@/game/content/copy';
import type { SigilKind } from '@/game/sigils';
import { applySigil, flingItem, rotating } from '@/game/station';
import { remark } from './toast';

export interface GameDeps {
  city: City;
  service: PoolService;
  clock: Clock;
  profileStore: ProfileStore;
}

interface GameState {
  ready: boolean;
  deps: GameDeps | null;
  profile: Profile | null;
  board: DayBoard | null;
  pick: Pick | null;
  plate: Plate;
  selectedDish: string | null;
  /** True while a pick or swap is in flight: the CTA is disabled so a double tap does nothing. */
  busy: boolean;
  /** Ticks once a second for the countdown. */
  now: number;
  /** Station: the ingredient strokes apply to (set by any Pantry tap or plate chip). */
  selectedIng: string | null;
  /** Station: the sigil word to flash; `seq` restarts the flash for a repeated word. */
  flash: { word: string; seq: number } | null;
  /** Session counters that drive the rotating remarks (spec §3.3 refusals, §3.4 flings). */
  refusals: number;
  flings: number;
  init: (deps: GameDeps) => Promise<void>;
  dispose: () => void;
  selectDish: (dishId: string | null) => void;
  pickSelected: () => Promise<void>;
  swapToSelected: () => Promise<void>;
  tapIngredient: (ingredientId: string) => Promise<void>;
  removeIngredient: (ingredientId: string) => Promise<void>;
  selectItem: (ingredientId: string) => void;
  stroke: (kind: SigilKind, fast: boolean) => Promise<void>;
  fling: () => Promise<void>;
  plateNow: () => Promise<void>;
  setPreferButtons: (on: boolean) => Promise<void>;
  markIntroSeen: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
}

let unsubscribe: (() => void) | null = null;
let unsubscribeProfile: (() => void) | null = null;
let tick: ReturnType<typeof setInterval> | null = null;
/** Bumped by every init and dispose; an init that finds a newer generation after its awaits gives up. */
let generation = 0;

/** A refused action (already picked, no swaps left, ...) is a no-op for the player; anything else is a bug. */
function ignorePoolError(e: unknown): void {
  if (!(e instanceof PoolError)) throw e;
}

export const useGame = create<GameState>((set, get) => ({
  ready: false,
  deps: null,
  profile: null,
  board: null,
  pick: null,
  plate: { items: [], flair: 0, mess: 0 },
  selectedDish: null,
  busy: false,
  now: Date.now(),
  selectedIng: null,
  flash: null,
  refusals: 0,
  flings: 0,
  init: async (deps) => {
    get().dispose();
    const mine = ++generation;
    const profile = await deps.profileStore.load(deps.clock.city().month);
    const [board, pick, plate] = await Promise.all([
      deps.service.getToday(deps.city),
      deps.service.getPick(),
      deps.service.getPlate(),
    ]);
    if (mine !== generation) return; // disposed or re-initialised meanwhile (React StrictMode double mount)
    set({
      deps,
      profile,
      board,
      pick,
      plate,
      selectedDish: pick?.dishId ?? null,
      busy: false,
      now: deps.clock.now(),
      ready: true,
    });
    unsubscribe = deps.service.subscribe(deps.city, (b) => {
      const prev = get().board;
      // Day rollover: the pool, pick and plate reset together (spec §3.1).
      if (prev && prev.date !== b.date) {
        void Promise.all([deps.service.getPick(), deps.service.getPlate()]).then(([p, pl]) => {
          if (mine === generation) {
            set({ board: b, pick: p, plate: pl, selectedDish: p?.dishId ?? null, selectedIng: null });
          }
        });
        return;
      }
      set({ board: b });
    });
    unsubscribeProfile = deps.profileStore.subscribe((p) => set({ profile: p }));
    tick = setInterval(() => set({ now: deps.clock.now() }), 1000);
  },
  dispose: () => {
    generation += 1;
    unsubscribe?.();
    unsubscribeProfile?.();
    if (tick) clearInterval(tick);
    unsubscribe = null;
    unsubscribeProfile = null;
    tick = null;
  },
  selectDish: (dishId) => set({ selectedDish: dishId }),
  pickSelected: async () => {
    const { deps, selectedDish, busy } = get();
    if (!deps || !selectedDish || busy) return;
    set({ busy: true });
    try {
      const pick = await deps.service.pick(selectedDish);
      set({ pick, selectedDish: pick.dishId });
      remark(fill(COPY.bin.picked, { Dish: dish(pick.dishId).short }));
    } catch (e) {
      ignorePoolError(e);
    } finally {
      set({ busy: false });
    }
  },
  swapToSelected: async () => {
    const { deps, selectedDish, busy } = get();
    if (!deps || !selectedDish || busy) return;
    set({ busy: true });
    try {
      const pick = await deps.service.swap(selectedDish);
      const plate = await deps.service.getPlate();
      set({ pick, plate, selectedDish: pick.dishId, selectedIng: null });
      remark(fill(COPY.bin.swapped, { dish: dish(pick.dishId).short.toLowerCase() }));
    } catch (e) {
      ignorePoolError(e);
    } finally {
      set({ busy: false });
    }
  },
  tapIngredient: async (ingredientId) => {
    const { deps } = get();
    if (!deps) return;
    // Every Pantry tap selects the ingredient, including refused and Gone taps (prototype behaviour).
    set({ selectedIng: ingredientId });
    const r = await deps.service.takePortion(ingredientId);
    if (!r.ok) {
      if (r.reason === 'gone') remark(fill(COPY.bin.gone, { City: CITY_NAME[deps.city] }));
      else {
        const n = get().refusals;
        set({ refusals: n + 1 });
        remark(rotating(COPY.bin.cap, n));
      }
      return;
    }
    set((s) => {
      const items = s.plate.items.some((i) => i.ingredientId === ingredientId)
        ? s.plate.items.map((i) => (i.ingredientId === ingredientId ? { ...i, n: i.n + 1 } : i))
        : [...s.plate.items, { ingredientId, n: 1, cut: 0 as const, heat: 0 as const }];
      return { plate: { ...s.plate, items } };
    });
    if (r.note === 'leftovers4') remark(COPY.bin.leftovers4);
    if (r.note === 'leftovers10') {
      remark(fill(COPY.bin.leftovers10, { ingredient: ingredient(ingredientId).name.toLowerCase() }));
    }
  },
  removeIngredient: async (ingredientId) => {
    const { deps } = get();
    if (!deps || !get().plate.items.some((i) => i.ingredientId === ingredientId && i.n > 0)) return;
    await deps.service.returnPortion(ingredientId);
    set((s) => ({
      plate: {
        ...s.plate,
        items: s.plate.items
          .map((i) => (i.ingredientId === ingredientId ? { ...i, n: i.n - 1 } : i))
          .filter((i) => i.n > 0),
      },
    }));
  },
  selectItem: (ingredientId) => set({ selectedIng: ingredientId }),
  stroke: async (kind, fast) => {
    const { deps, plate, selectedIng, flash } = get();
    if (!deps) return;
    const o = applySigil(plate, selectedIng, kind, fast);
    set({ plate: o.plate, flash: { word: o.word, seq: (flash?.seq ?? 0) + 1 } });
    if (o.remark) remark(o.remark);
    await deps.service.saveDraft(o.plate);
    if (o.plateNow) await get().plateNow();
  },
  fling: async () => {
    const { deps, plate, selectedIng } = get();
    if (!deps || !selectedIng || !plate.items.some((i) => i.ingredientId === selectedIng && i.n > 0)) return;
    await deps.service.fling(selectedIng);
    const n = get().flings;
    const next = flingItem(get().plate, selectedIng);
    set({ plate: next, selectedIng: null, flings: n + 1 });
    remark(rotating(COPY.bin.fling, n));
    await deps.service.saveDraft(next);
  },
  plateNow: async () => {
    const { deps, plate } = get();
    if (!deps) return;
    try {
      await deps.service.plate(plate);
      // Phase 3: navigate to the Verdict.
    } catch (e) {
      if (!(e instanceof NotImplementedError)) throw e; // the judge and the Verdict arrive in Phase 3
    }
  },
  setPreferButtons: async (on) => {
    const { deps } = get();
    if (!deps) return;
    await deps.profileStore.update({ preferButtons: on });
  },
  markIntroSeen: async () => {
    const { deps } = get();
    if (!deps) return;
    await deps.profileStore.update({ introSeen: true });
  },
  updateProfile: async (patch) => {
    const { deps } = get();
    if (!deps) return;
    await deps.profileStore.update(patch);
  },
}));
