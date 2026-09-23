import { afterEach, describe, expect, it, vi } from 'vitest';
import { useGame, type GameDeps } from './game';
import { useToast } from './toast';
import { MockPoolService } from '@/services/MockPoolService';
import { createClock } from '@/services/clock';
import { ProfileStore } from '@/services/profile';
import { createMemoryStorage, type Storage } from '@/services/storage';

const sgt = (iso: string): number => Date.parse(`${iso}+08:00`);

async function boot(
  iso = '2026-09-23T10:00:00',
  storage: Storage = createMemoryStorage(),
): Promise<GameDeps> {
  const clock = createClock({ source: () => sgt(iso) });
  const profileStore = new ProfileStore(storage, { city: 'SG' });
  const service = new MockPoolService({ city: 'SG', clock, storage, profile: profileStore });
  const deps: GameDeps = { city: 'SG', service, clock, profileStore };
  await useGame.getState().init(deps);
  await service.pick('chicken-rice');
  useGame.setState({ refusals: 0, flings: 0, selectedIng: null, flash: null });
  return deps;
}

/** Collect every remark the Bin makes. */
function listen(): { remarks: string[]; off: () => void } {
  const remarks: string[] = [];
  let last: string | null = null;
  const off = useToast.subscribe((t) => {
    if (t.text && t.text !== last) remarks.push(t.text);
    last = t.text;
  });
  return { remarks, off };
}

const g = () => useGame.getState();
const n = (id: string) => g().plate.items.find((i) => i.ingredientId === id)?.n ?? 0;

describe('Station store actions', () => {
  afterEach(() => {
    useToast.getState().clear();
    g().dispose();
  });

  it('tap adds a portion and selects it; the 4th tap is refused with the three cap lines in rotation', async () => {
    await boot();
    const { remarks, off } = listen();
    for (let i = 0; i < 3; i++) await g().tapIngredient('ginger');
    expect(n('ginger')).toBe(3);
    expect(g().selectedIng).toBe('ginger');
    await g().tapIngredient('rice');
    for (let i = 0; i < 4; i++) {
      await g().tapIngredient('ginger');
      useToast.getState().clear();
    }
    off();
    expect(n('ginger')).toBe(3);
    expect(g().selectedIng).toBe('ginger'); // a refused tap still selects
    expect(remarks).toEqual([
      'Three is plenty. Come back at leftovers hour.',
      'The whole city eats from this shelf. Three.',
      'No. Leftovers hour starts at 21:00.',
      'Three is plenty. Come back at leftovers hour.',
    ]);
  });

  it('a Gone tap says so with the city name and still selects the ingredient', async () => {
    const deps = await boot();
    vi.spyOn(deps.service, 'takePortion').mockResolvedValueOnce({ ok: false, reason: 'gone', stock: 0 });
    const { remarks, off } = listen();
    await g().tapIngredient('cucumber');
    off();
    expect(remarks).toEqual(['Gone. Singapore ate it all before you.']);
    expect(g().selectedIng).toBe('cucumber');
    expect(n('cucumber')).toBe(0);
  });

  it('Leftovers hour: the 4th and 10th portions get their remarks and ten portions fit', async () => {
    await boot('2026-09-23T21:30:00');
    const { remarks, off } = listen();
    for (let i = 0; i < 10; i++) await g().tapIngredient('ginger');
    off();
    expect(n('ginger')).toBe(10);
    expect(remarks).toEqual([
      'Leftovers hour. Go on, then. I am watching.',
      'Ten portions of ginger sauce. Ten. I am counting.',
    ]);
  });

  it('minus removes one portion and drops the chip at zero', async () => {
    await boot();
    await g().tapIngredient('ginger');
    await g().tapIngredient('ginger');
    await g().removeIngredient('ginger');
    expect(n('ginger')).toBe(1);
    await g().removeIngredient('ginger');
    expect(g().plate.items).toEqual([]);
    await g().removeIngredient('ginger'); // nothing held: no-op
    expect(g().plate.items).toEqual([]);
  });

  it('strokes: no target asks for one; heat to burnt adds mess; the word flashes; the draft is saved', async () => {
    const deps = await boot();
    const save = vi.spyOn(deps.service, 'saveDraft');
    const { remarks, off } = listen();
    await g().stroke('heat', true);
    expect(g().flash?.word).toBe('HEAT');
    expect(g().plate.flair).toBe(1);
    await g().tapIngredient('chicken');
    for (let i = 0; i < 3; i++) await g().stroke('heat', false);
    off();
    expect(g().plate.items[0]).toMatchObject({ ingredientId: 'chicken', heat: 3 });
    expect(g().plate.mess).toBe(1);
    expect(remarks).toEqual([
      'Strokes need a target. Tap something first.',
      'You burnt the poached chicken. It did nothing to you.',
    ]);
    expect(save).toHaveBeenLastCalledWith(g().plate);
    const seq = g().flash?.seq ?? 0;
    await g().stroke('clean', false);
    expect(g().plate.mess).toBe(0);
    expect(g().flash).toEqual({ word: 'CLEAN', seq: seq + 1 });
  });

  it('PLATE flashes and tries to plate; until Phase 3 the judge is missing and nothing else happens', async () => {
    const deps = await boot();
    const plate = vi.spyOn(deps.service, 'plate');
    await g().stroke('plate', false);
    expect(g().flash?.word).toBe('PLATE');
    expect(plate).toHaveBeenCalledTimes(1);
    vi.spyOn(deps.service, 'plate').mockRejectedValueOnce(new Error('boom'));
    await expect(g().plateNow()).rejects.toThrow('boom');
  });

  it('fling removes the selected item with the rotating lines, clears the selection, and needs a target', async () => {
    await boot();
    const { remarks, off } = listen();
    await g().fling(); // nothing selected: no-op
    for (const id of ['ginger', 'rice', 'egg', 'dark-soy']) {
      await g().tapIngredient(id);
      await g().fling();
      useToast.getState().clear();
    }
    off();
    expect(g().plate.items).toEqual([]);
    expect(g().plate.mess).toBe(4);
    expect(g().selectedIng).toBeNull();
    expect(remarks).toEqual([
      'Rude. Delicious, but rude.',
      'I was going to eat that anyway.',
      'Noted. Everything is noted.',
      'Rude. Delicious, but rude.',
    ]);
  });

  it('Prefer buttons persists on the profile', async () => {
    await boot();
    expect(g().profile?.preferButtons).toBe(false);
    await g().setPreferButtons(true);
    expect(g().profile?.preferButtons).toBe(true);
  });

  it('the plate (portions, prep, flair, mess) survives a reload', async () => {
    const storage = createMemoryStorage();
    await boot('2026-09-23T10:00:00', storage);
    await g().tapIngredient('chicken');
    await g().stroke('cut', true);
    await g().stroke('heat', false);
    await g().tapIngredient('ginger');
    const before = g().plate;
    g().dispose();
    const clock = createClock({ source: () => sgt('2026-09-23T10:05:00') });
    const profileStore = new ProfileStore(storage, { city: 'SG' });
    const service = new MockPoolService({ city: 'SG', clock, storage, profile: profileStore });
    await g().init({ city: 'SG', service, clock, profileStore });
    expect(g().plate).toEqual(before);
    expect(before).toMatchObject({
      flair: 1,
      items: [
        { ingredientId: 'chicken', n: 1, cut: 1, heat: 1 },
        { ingredientId: 'ginger', n: 1 },
      ],
    });
  });
});
