import { create } from 'zustand';

export const TOAST_MS = 2800;

interface ToastState {
  text: string | null;
  seq: number;
  remark: (text: string) => void;
  clear: () => void;
}

let timer: ReturnType<typeof setTimeout> | null = null;

/** The Bin's toast: one at a time, a new remark replaces the current one and restarts the 2.8s timer (spec §5). */
export const useToast = create<ToastState>((set) => ({
  text: null,
  seq: 0,
  remark: (text) => {
    if (timer) clearTimeout(timer);
    set((s) => ({ text, seq: s.seq + 1 }));
    timer = setTimeout(() => {
      timer = null;
      set({ text: null });
    }, TOAST_MS);
  },
  clear: () => {
    if (timer) clearTimeout(timer);
    timer = null;
    set({ text: null });
  },
}));

export const remark = (text: string): void => useToast.getState().remark(text);
