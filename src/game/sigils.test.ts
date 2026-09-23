import { describe, expect, it } from 'vitest';
import { classify, strokePath, type StrokePoint } from './sigils';

const W = 358; // Station pad width at 390px

/** Points along a polyline, sampled every `step` px, `msPerPx` ms per px travelled. */
function path(corners: [number, number][], step = 4, msPerPx = 4): StrokePoint[] {
  const pts: StrokePoint[] = [];
  let t = 0;
  corners.forEach(([x, y], i) => {
    if (i === 0) {
      pts.push({ x, y, t });
      return;
    }
    const prev = corners[i - 1] ?? [x, y];
    const len = Math.hypot(x - prev[0], y - prev[1]);
    const n = Math.max(1, Math.round(len / step));
    for (let k = 1; k <= n; k++) {
      t += (len / n) * msPerPx;
      pts.push({ x: prev[0] + ((x - prev[0]) * k) / n, y: prev[1] + ((y - prev[1]) * k) / n, t });
    }
  });
  return pts;
}

function spiral(turns: number, r0 = 8, r1 = 50, steps = 90, msPerPt = 6): StrokePoint[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const a = (i / steps) * turns * 2 * Math.PI;
    const r = r0 + ((r1 - r0) * i) / steps;
    return { x: 180 + r * Math.cos(a), y: 75 + r * Math.sin(a), t: i * msPerPt };
  });
}

describe('sigil classifier (spec §3.4) — required cases', () => {
  it('a 3-turn spiral is HEAT', () => {
    expect(classify(spiral(3), W, 0)?.kind).toBe('heat');
  });
  it('a straight upward 80px flick is PLATE', () => {
    expect(
      classify(
        path([
          [180, 120],
          [180, 40],
        ]),
        W,
        0,
      )?.kind,
    ).toBe('plate');
  });
  it('a horizontal 70%-width sweep is CLEAN with mess and CUT without', () => {
    const sweep = path([
      [50, 80],
      [50 + 0.7 * W, 80],
    ]);
    expect(classify(sweep, W, 2)?.kind).toBe('clean');
    expect(classify(sweep, W, 0)?.kind).toBe('cut');
  });
  it('a 20px scribble is ignored', () => {
    const scribble = path(
      [
        [100, 70],
        [104, 74],
        [100, 78],
        [104, 82],
        [101, 85],
      ],
      1,
    );
    const len = scribble
      .slice(1)
      .reduce((a, p, i) => a + Math.hypot(p.x - (scribble[i]?.x ?? 0), p.y - (scribble[i]?.y ?? 0)), 0);
    expect(len).toBeLessThan(24);
    expect(len).toBeGreaterThan(19);
    expect(classify(scribble, W, 0)).toBeNull();
  });
  it('a fast slash is a CUT with +1 Flair; the same slash slowly is not fast', () => {
    const fast = classify(
      path(
        [
          [100, 20],
          [200, 130],
        ],
        4,
        0.5,
      ),
      W,
      0,
    );
    expect(fast).toEqual({ kind: 'cut', fast: true });
    expect(
      classify(
        path(
          [
            [100, 20],
            [200, 130],
          ],
          4,
          3,
        ),
        W,
        0,
      ),
    ).toEqual({ kind: 'cut', fast: false });
  });
});

describe('sigil classifier — thresholds and order', () => {
  it('ignores fewer than 4 points even when long', () => {
    expect(
      classify(
        [
          { x: 0, y: 0, t: 0 },
          { x: 100, y: 0, t: 10 },
          { x: 200, y: 0, t: 20 },
        ],
        W,
        1,
      ),
    ).toBeNull();
  });
  it('ignores strokes under 24px; 24px and more count', () => {
    expect(
      classify(
        path(
          [
            [100, 60],
            [100, 83],
          ],
          2,
        ),
        W,
        0,
      ),
    ).toBeNull();
    expect(
      classify(
        path(
          [
            [100, 84],
            [100, 60],
          ],
          2,
        ),
        W,
        0,
      )?.kind,
    ).toBe('plate');
  });
  it('a wipe needs length ≥ 55% of the pad width (spec ≥, boundary included)', () => {
    const at = path(
      [
        [20, 80],
        [20 + 0.55 * W, 80],
      ],
      3,
    );
    const under = path(
      [
        [20, 80],
        [20 + 0.55 * W - 3, 80],
      ],
      3,
    );
    expect(classify(at, W, 1)?.kind).toBe('clean');
    expect(classify(under, W, 1)?.kind).toBe('cut');
  });
  it('a wipe must be horizontal: a long diagonal with mess is a CUT', () => {
    // dx 190, disp 230: |dx| < 0.85 × disp, so not horizontal enough, although long enough.
    expect(
      classify(
        path([
          [20, 10],
          [210, 140],
        ]),
        W,
        3,
      )?.kind,
    ).toBe('cut');
  });
  it('an upward stroke that is mostly sideways is not PLATE', () => {
    expect(
      classify(
        path([
          [20, 120],
          [140, 70],
        ]),
        W,
        0,
      )?.kind,
    ).toBe('cut');
  });
  it('turning beats straightness: a full circle is HEAT', () => {
    expect(classify(spiral(1.2, 30, 30, 60), W, 0)?.kind).toBe('heat');
  });
  it('a loose curve: turning 2.4–4.2 rad and not straight is HEAT, less turning is CUT', () => {
    const hook = spiral(0.5, 40, 40, 30); // half circle ≈ π rad, straightness ≈ 0.64
    const arc = spiral(0.3, 60, 60, 20); // ≈ 1.9 rad
    expect(classify(hook, W, 0)?.kind).toBe('cut'); // straight 0.64 > 0.55 → CUT before the loose rule
    const u = path(
      [
        [60, 40],
        [60, 120],
        [140, 120],
        [140, 40],
      ],
      4,
    ); // U-turn: turning π, straightness 0.33
    expect(classify(u, W, 0)?.kind).toBe('heat');
    const zig = path(
      [
        [60, 40],
        [120, 120],
        [180, 40],
      ],
      4,
    ); // one sharp turn ≈ 1.85 rad, straightness 0.6
    expect(classify(zig, W, 0)?.kind).toBe('cut');
    expect(classify(arc, W, 0)?.kind).toBe('cut');
  });
  it('sub-2px segments count towards length but not turning', () => {
    const jitter: StrokePoint[] = [];
    for (let i = 0; i <= 40; i++) jitter.push({ x: 100 + i * 1.5, y: 80 + (i % 2 ? 0.5 : -0.5), t: i * 10 });
    const s = classify(jitter, W, 0);
    expect(s?.kind).toBe('cut'); // 60px of tiny zigzag: no turning measured, straight enough
  });
  it('fast needs both > 0.9 px/ms and > 60px', () => {
    expect(
      classify(
        path(
          [
            [100, 110],
            [100, 60],
          ],
          4,
          0.2,
        ),
        W,
        0,
      ),
    ).toEqual({ kind: 'plate', fast: false }); // 50px
    expect(
      classify(
        path(
          [
            [100, 140],
            [100, 60],
          ],
          4,
          0.2,
        ),
        W,
        0,
      ),
    ).toEqual({ kind: 'plate', fast: true }); // 80px
  });
  it('builds the trail path', () => {
    expect(
      strokePath([
        { x: 1, y: 2, t: 0 },
        { x: 3.25, y: 4, t: 1 },
      ]),
    ).toBe('M1.0 2.0 L3.3 4.0');
    expect(strokePath([])).toBe('');
  });
});
