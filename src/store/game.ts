import { create } from 'zustand';
import type { City, DayBoard, Pick, Plate, Profile } from '@/game/types';
import type { PoolService } from '@/services/PoolService';
import type { Clock } from '@/services/clock';
import type { ProfileStore } from '@/services/profile';
import { dish } from '@/game/content/dishes';
import { COPY, fill } from '@/game/content/copy';
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
  /** Ticks once a second for the countdown. */
  now: number;
  init: (deps: GameDeps) => Promise<void>;
  dispose: () => void;
  selectDish: (dishId: string | null) => void;
  pickSelected: () => Promise<void>;
  swapToSelected: () => Promise<void>;
  markIntroSeen: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
}

let unsubscribe: (() => void) | null = null;
let unsubscribeProfile: (() => void) | null = null;
let tick: ReturnType<typeof setInterval> | null = null;

export const useGame = create<GameState>((set, get) => ({
  ready: false,
  deps: null,
  profile: null,
  board: null,
  pick: null,
  plate: { items: [], flair: 0, mess: 0 },
  selectedDish: null,
  now: Date.now(),
  init: async (deps) => {
    get().dispose();
    const profile = await deps.profileStore.load(deps.clock.city().month);
    const [board, pick, plate] = await Promise.all([
      deps.service.getToday(deps.city),
      deps.service.getPick(),
      deps.service.getPlate(),
    ]);
    set({
      deps,
      profile,
      board,
      pick,
      plate,
      selectedDish: pick?.dishId ?? null,
      now: deps.clock.now(),
      ready: true,
    });
    unsubscribe = deps.service.subscribe(deps.city, (b) => {
      const prev = get().board;
      // Day rollover: the pool, pick and plate reset together (spec §3.1).
      if (prev && prev.date !== b.date) {
        void Promise.all([deps.service.getPick(), deps.service.getPlate()]).then(([p, pl]) =>
          set({ board: b, pick: p, plate: pl, selectedDish: p?.dishId ?? null }),
        );
        return;
      }
      set({ board: b });
    });
    unsubscribeProfile = deps.profileStore.subscribe((p) => set({ profile: p }));
    tick = setInterval(() => set({ now: deps.clock.now() }), 1000);
  },
  dispose: () => {
    unsubscribe?.();
    unsubscribeProfile?.();
    if (tick) clearInterval(tick);
    unsubscribe = null;
    unsubscribeProfile = null;
    tick = null;
  },
  selectDish: (dishId) => set({ selectedDish: dishId }),
  pickSelected: async () => {
    const { deps, selectedDish } = get();
    if (!deps || !selectedDish) return;
    const pick = await deps.service.pick(selectedDish);
    set({ pick, selectedDish: pick.dishId });
    remark(fill(COPY.bin.picked, { Dish: dish(pick.dishId).short }));
  },
  swapToSelected: async () => {
    const { deps, selectedDish } = get();
    if (!deps || !selectedDish) return;
    const pick = await deps.service.swap(selectedDish);
    const plate = await deps.service.getPlate();
    set({ pick, plate, selectedDish: pick.dishId });
    remark(fill(COPY.bin.swapped, { dish: dish(pick.dishId).short.toLowerCase() }));
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
