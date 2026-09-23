import type {
  City,
  DayBoard,
  Pick,
  Plate,
  SavedVerdict,
  ThreadMessage,
  Verdict,
  WallEntry,
} from '@/game/types';
import type { TakeResult } from '@/game/pool';

/**
 * Service boundary from BUILD-A-DISH.md §7 and the kickoff prompt. Phases 1–4 implement it in the browser
 * (MockPoolService); a real API replaces it later. Additions over the spec list, reported in the Phase 1 report:
 * `fling` (spec §3.4 needs the Bin-eaten counter bumped server-side), `getPick`/`getPlate` (restore state on reload),
 * `report`/`mute` (Phase 4 moderation stubs), `saveDraft` (Phase 2: the plate survives a reload).
 */
export interface PoolService {
  getToday(city: City): Promise<DayBoard>;
  getPick(): Promise<Pick | null>;
  getPlate(): Promise<Plate>;
  pick(dishId: string): Promise<Pick>;
  swap(dishId: string): Promise<Pick>;
  takePortion(ingredientId: string): Promise<TakeResult & { stock: number }>;
  returnPortion(ingredientId: string): Promise<{ stock: number }>;
  fling(ingredientId: string): Promise<void>;
  /** Keep the in-progress plate's prep, flair and mess (portions stay server-owned via take/return/fling). */
  saveDraft(plate: Plate): Promise<void>;
  plate(plate: Plate): Promise<Verdict>;
  getWall(dishId: string): Promise<WallEntry[]>;
  getThread(dishId: string): Promise<ThreadMessage[]>;
  post(dishId: string, text: string): Promise<ThreadMessage>;
  report(messageId: string): Promise<void>;
  mute(playerId: string): Promise<void>;
  getGallery(): Promise<SavedVerdict[]>;
  setSignature(verdict: Verdict): Promise<void>;
  subscribe(city: City, listener: (board: DayBoard) => void): () => void;
}

export class NotImplementedError extends Error {
  constructor(method: string) {
    super(`${method} arrives in a later phase`);
    this.name = 'NotImplementedError';
  }
}

export class PoolError extends Error {
  constructor(
    public readonly code: 'already-picked' | 'no-swaps' | 'not-picked' | 'same-dish',
    message: string,
  ) {
    super(message);
    this.name = 'PoolError';
  }
}
