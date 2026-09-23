import { create } from 'zustand';
import type { Tab } from '@/components/TabBar';

interface ShellState {
  tab: Tab;
  /** Set by the Dish tab when its current screen hides the tab bar (spec §5: Station, Verdict, Wall, Thread, Share). */
  immersive: boolean;
  setTab: (t: Tab) => void;
  setImmersive: (v: boolean) => void;
}

export const useShell = create<ShellState>((set) => ({
  tab: 'dish',
  immersive: false,
  setTab: (tab) => set({ tab }),
  setImmersive: (immersive) => set({ immersive }),
}));
