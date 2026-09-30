// Phase 3 store actions: plating produces the verdict, the signature and the share state follow it.
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
const g = () => useGame.getState();

describe('Verdict store actions (spec §3.5–3.13)', () => {
  afterEach(() => {
    useToast.getState().clear();
    g().dispose();
  });

  it('a PLATE stroke flashes, plates, clears the toast and resolves with the verdict', async () => {
    await boot();
    await g().tapIngredient('chicken');
    useToast.getState().remark('lingering');
    const v = await g().stroke('plate', true);
    expect(g().flash?.word).toBe('PLATE');
    expect(v).not.toBeNull();
    expect(g().verdict).toBe(v);
    expect(g().sent).toBe(false);
    expect(useToast.getState().text).toBeNull();
    expect(v?.summary).toBe('Poached chicken ×1');
    expect(v?.dishId).toBe('chicken-rice');
    expect(g().profile?.habits.plates).toBe(1); // the profile subscription carries the new counters
    expect(g().plate.items).toHaveLength(1); // the plate stays for another go
  });

  it('Plate it and a double tap: one plate per press', async () => {
    const deps = await boot();
    const plate = vi.spyOn(deps.service, 'plate');
    const [a, b] = await Promise.all([g().plateNow(), g().plateNow()]);
    expect(plate).toHaveBeenCalledTimes(1);
    expect(a).not.toBeNull();
    expect(b).toBeNull();
    expect(g().profile?.habits.plates).toBe(1);
    expect(g().verdict?.name).toBe('Empty Plate of unknown origin');
    expect(g().profile?.cursedPlates).toHaveLength(1);
  });

  it('Set as Signature Dish stores the verdict on the profile; Send to your party marks it sent', async () => {
    await boot();
    await g().setSignature(); // nothing to set yet
    expect(g().profile?.signature).toBeUndefined();
    const v = await g().plateNow();
    await g().setSignature();
    expect(g().profile?.signature).toMatchObject({ key: v?.key, name: v?.name, date: '23 Sep 2026' });
    g().sendToParty();
    expect(g().sent).toBe(true);
    await g().plateNow();
    expect(g().sent).toBe(false); // a new verdict, a new card
  });

  it('a swap clears the verdict', async () => {
    await boot();
    await g().plateNow();
    expect(g().verdict).not.toBeNull();
    g().selectDish('nasi-lemak');
    await g().swapToSelected();
    expect(g().verdict).toBeNull();
    expect(g().pick?.dishId).toBe('nasi-lemak');
  });

  it('a stroke that does not plate resolves null; plating with no service does nothing', async () => {
    await boot();
    expect(await g().stroke('cut', false)).toBeNull();
    g().dispose();
    useGame.setState({ deps: null });
    expect(await g().plateNow()).toBeNull();
  });
});
