// Sigil classifier (spec §3.4), ported from the prototype's classify() with the same constants and rule order.
// Pure: no React, no DOM. Never fails; a stroke is either ignored (null) or becomes one of four sigils.

export interface StrokePoint {
  x: number;
  y: number;
  /** Timestamp in ms. */
  t: number;
}

export type SigilKind = 'cut' | 'heat' | 'plate' | 'clean';

export interface Sigil {
  kind: SigilKind;
  /** Fast stroke (> 0.9 px/ms and > 60px): +1 Flair. */
  fast: boolean;
}

export const MIN_POINTS = 4;
export const MIN_LENGTH = 24;
/** Segments shorter than this still count towards length but are too noisy to measure turning. */
export const MIN_SEGMENT = 2;
export const HEAT_TURN = 4.2;
export const LOOSE_HEAT_TURN = 2.4;
export const PLATE_STRAIGHT = 0.7;
export const PLATE_UP = 0.6;
export const CLEAN_STRAIGHT = 0.85;
export const CLEAN_HORIZONTAL = 0.85;
export const CLEAN_WIDTH = 0.55;
export const CUT_STRAIGHT = 0.55;
export const FAST_SPEED = 0.9;
export const FAST_LENGTH = 60;

/**
 * Classify a finished stroke on a pad `padWidth` px wide. `mess` decides whether a wipe is a CLEAN or a CUT
 * (spec: "… and mess > 0 → CLEAN (wipe). With no mess this is a CUT.").
 */
export function classify(pts: readonly StrokePoint[], padWidth: number, mess: number): Sigil | null {
  if (pts.length < MIN_POINTS) return null;
  let len = 0;
  let turn = 0;
  let prev: number | null = null;
  for (let i = 1; i < pts.length; i++) {
    const a0 = pts[i - 1];
    const a1 = pts[i];
    if (!a0 || !a1) continue;
    const dx = a1.x - a0.x;
    const dy = a1.y - a0.y;
    const d = Math.hypot(dx, dy);
    len += d;
    if (d < MIN_SEGMENT) continue;
    const a = Math.atan2(dy, dx);
    if (prev !== null) {
      let da = a - prev;
      while (da > Math.PI) da -= 2 * Math.PI;
      while (da < -Math.PI) da += 2 * Math.PI;
      turn += Math.abs(da);
    }
    prev = a;
  }
  if (len < MIN_LENGTH) return null;
  const f = pts[0];
  const l = pts[pts.length - 1];
  if (!f || !l) return null;
  const dx = l.x - f.x;
  const dy = l.y - f.y;
  const disp = Math.hypot(dx, dy);
  const straight = disp / len;
  const dur = Math.max(1, l.t - f.t);
  const fast = len / dur > FAST_SPEED && len > FAST_LENGTH;
  if (turn > HEAT_TURN) return { kind: 'heat', fast };
  if (straight > PLATE_STRAIGHT && -dy > PLATE_UP * disp) return { kind: 'plate', fast };
  if (straight > CLEAN_STRAIGHT && Math.abs(dx) > CLEAN_HORIZONTAL * disp && len >= CLEAN_WIDTH * padWidth) {
    return { kind: mess > 0 ? 'clean' : 'cut', fast };
  }
  if (straight > CUT_STRAIGHT) return { kind: 'cut', fast };
  return { kind: turn > LOOSE_HEAT_TURN ? 'heat' : 'cut', fast };
}

/** SVG path for the stroke trail. */
export function strokePath(pts: readonly StrokePoint[]): string {
  return pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
}
