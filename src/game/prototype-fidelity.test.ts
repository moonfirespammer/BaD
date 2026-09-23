/* eslint-disable @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call --
   This test deliberately evaluates the prototype's own logic script (a design-handoff file in docs/) to compare it
   with the port. It never runs in the app. */
// Port fidelity (kickoff prompt: "port those faithfully, including thresholds, constants and rule order"): run the
// prototype's own logic, extracted from docs/prototype/Build-A-Dish.dc.html, beside ours on thousands of seeded
// random inputs. The only allowed difference is the documented spec ≥ (ours) vs prototype > at the wipe length.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { classify, type StrokePoint } from './sigils';
import { applySigil } from './station';
import { mulberry32 } from './hash';
import type { Level, Plate } from './types';

const html = readFileSync(resolve(process.cwd(), 'docs/prototype/Build-A-Dish.dc.html'), 'utf8');
const script = /<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/.exec(html)?.[1] ?? '';

type ProtoSigil = { kind: string; fast: boolean } | null;
const protoClassify = new Function(
  `${/function classify\([\s\S]*?\n}\n/.exec(script)?.[0] ?? ''}; return classify;`,
)() as (pts: StrokePoint[], w: number) => ProtoSigil;

interface ProtoComponent {
  state: Record<string, unknown>;
  props: Record<string, unknown>;
  fire: (g: { kind: string; fast: boolean }) => void;
  remark: (t: string) => void;
  showSigil: (t: string) => void;
  plateDish: () => void;
  splat: () => unknown;
  setState: (p: Record<string, unknown>) => void;
}
const makeProto = new Function(
  `class DCLogic { constructor(){ this.props = {}; } setState(p){ this.state = { ...this.state, ...p }; } }\n${script}\nreturn () => new Component();`,
)() as () => ProtoComponent;
const newProto = makeProto;

describe('prototype fidelity', () => {
  it('classify agrees with the prototype on 20,000 random strokes', () => {
    const rnd = mulberry32(20260923);
    let compared = 0;
    let boundary = 0;
    for (let n = 0; n < 20000; n++) {
      const w = 300 + rnd() * 100;
      const kind = n % 4;
      const pts: StrokePoint[] = [];
      let t = 0;
      const count = 2 + Math.floor(rnd() * 40);
      let x = rnd() * w;
      let y = rnd() * 150;
      for (let i = 0; i < count; i++) {
        if (kind === 0) {
          x += (rnd() - 0.5) * 30; // random walk
          y += (rnd() - 0.5) * 30;
        } else if (kind === 1) {
          const a = (i / count) * (1 + rnd() * 5) * 2 * Math.PI; // spirals of varying turns
          x = w / 2 + (10 + i * 1.5) * Math.cos(a);
          y = 75 + (10 + i * 1.2) * Math.sin(a);
        } else if (kind === 2) {
          x += 4 + rnd() * 10; // near-horizontal sweeps
          y += (rnd() - 0.5) * 3;
        } else {
          x += (rnd() - 0.5) * 4; // flicks and slashes
          y -= rnd() * 12 * (rnd() < 0.8 ? 1 : -1);
        }
        t += rnd() * 20;
        pts.push({ x, y, t });
      }
      const mess = rnd() < 0.5 ? 0 : 1 + Math.floor(rnd() * 3);
      const ours = classify(pts, w, mess);
      const theirs = protoClassify(pts, w);
      // The prototype applies "clean with no mess is a cut" in fire(); ours inside classify.
      const expected = theirs?.kind === 'clean' && mess === 0 ? { ...theirs, kind: 'cut' } : theirs;
      const len = pts
        .slice(1)
        .reduce((a, p, i) => a + Math.hypot(p.x - (pts[i]?.x ?? 0), p.y - (pts[i]?.y ?? 0)), 0);
      if (Math.abs(len - 0.55 * w) < 1e-9) {
        boundary += 1;
        continue;
      }
      expect(ours, `stroke ${n}`).toEqual(expected);
      compared += 1;
    }
    expect(compared).toBeGreaterThan(19000);
    expect(boundary).toBeLessThan(10);
  });

  it('applySigil matches the prototype fire() on 3,000 random plates and strokes', () => {
    const rnd = mulberry32(42);
    const ids = ['chicken', 'rice', 'ginger', 'cucumber', 'durian'];
    for (let n = 0; n < 3000; n++) {
      const items = ids
        .filter(() => rnd() < 0.7)
        .map((ingredientId) => ({
          ingredientId,
          n: 1 + Math.floor(rnd() * 3), // both models drop an item at 0 portions, so n ≥ 1 is the reachable state
          cut: Math.floor(rnd() * 4) as Level,
          heat: Math.floor(rnd() * 4) as Level,
        }));
      const plate: Plate = { items, flair: Math.floor(rnd() * 6), mess: Math.floor(rnd() * 3) };
      const selected = rnd() < 0.15 ? null : (ids[Math.floor(rnd() * ids.length)] ?? null);
      const kinds =
        plate.mess > 0 ? (['cut', 'heat', 'plate', 'clean'] as const) : (['cut', 'heat', 'plate'] as const);
      const kind = kinds[Math.floor(rnd() * kinds.length)] ?? 'cut';
      const fast = rnd() < 0.5;

      const ours = applySigil(plate, selected, kind, fast);

      const proto = newProto();
      let remark: string | undefined;
      let word: string | undefined;
      let plated = false;
      proto.remark = (t) => (remark = t);
      proto.showSigil = (t) => (word = t);
      proto.plateDish = () => (plated = true);
      proto.splat = () => ({});
      proto.state = {
        ...proto.state,
        plate: Object.fromEntries(items.map((i) => [i.ingredientId, { n: i.n, cut: i.cut, heat: i.heat }])),
        selectedIng: selected,
        flair: plate.flair,
        mess: plate.mess,
        splats: [],
      };
      proto.fire({ kind, fast });
      const st = proto.state as {
        plate: Record<string, { n: number; cut: number; heat: number }>;
        flair: number;
        mess: number;
      };

      expect(ours.word, `case ${n}`).toBe(word);
      expect(ours.remark, `case ${n}`).toBe(remark);
      expect(ours.plateNow, `case ${n}`).toBe(plated);
      expect(ours.plate.flair, `case ${n}`).toBe(st.flair);
      expect(ours.plate.mess, `case ${n}`).toBe(st.mess);
      for (const i of ours.plate.items) {
        const p = st.plate[i.ingredientId];
        expect({ n: i.n, cut: i.cut, heat: i.heat }, `case ${n} ${i.ingredientId}`).toEqual(p);
      }
    }
  });
});
