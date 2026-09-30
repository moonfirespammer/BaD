import { create } from 'zustand';
import type { Tab } from '@/components/TabBar';

interface ShellState {
  tab: Tab;
  /** Counts selections of the Dish tab: the game returns to the Board on each (prototype tabTo). */
  dishHome: number;
  /** Set by the Dish tab when its current screen hides the tab bar (spec §5: Station, Verdict, Wall, Thread, Share). */
  immersive: boolean;
  setTab: (t: Tab) => void;
  setImmersive: (v: boolean) => void;
}

export const useShell = create<ShellState>((set) => ({
  tab: 'dish',
  dishHome: 0,
  immersive: false,
  setTab: (tab) => set((s) => ({ tab, dishHome: tab === 'dish' ? s.dishHome + 1 : s.dishHome })),
  setImmersive: (immersive) => set({ immersive }),
}));
