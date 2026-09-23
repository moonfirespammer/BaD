import { describe, expect, it, vi } from 'vitest';
import { useGame, type GameDeps } from './game';
import { useToast } from './toast';
import { MockPoolService } from '@/services/MockPoolService';
import { createClock } from '@/services/clock';
import { ProfileStore } from '@/services/profile';
import { createMemoryStorage } from '@/services/storage';

const sgt = (iso: string): number => Date.parse(`${iso}+08:00`);

function deps(): GameDeps {
  const clock = createClock({ source: () => sgt('2026-09-23T10:00:00') });
  const storage = createMemoryStorage();
  const profileStore = new ProfileStore(storage, { city: 'SG' });
  const service = new MockPoolService({ city: 'SG', clock, storage, profile: profileStore });
  return { city: 'SG', service, clock, profileStore };
}

describe('game store', () => {
  it('a double mount (init, dispose, init) leaves exactly one live subscription', async () => {
    const d1 = deps();
    const d2 = deps();
    const sub1 = vi.spyOn(d1.service, 'subscribe');
    const sub2 = vi.spyOn(d2.service, 'subscribe');
    const first = useGame.getState().init(d1);
    useGame.getState().dispose();
    const second = useGame.getState().init(d2);
    await Promise.all([first, second]);
    expect(sub1).not.toHaveBeenCalled();
    expect(sub2).toHaveBeenCalledTimes(1);
    expect(useGame.getState().deps).toBe(d2);
    useGame.getState().dispose();
  });

  it('a double tap on Pick picks once, with no error and one remark', async () => {
    const d = deps();
    await useGame.getState().init(d);
    useGame.getState().selectDish('chicken-rice');
    const pickSpy = vi.spyOn(d.service, 'pick');
    const remarks: string[] = [];
    const off = useToast.subscribe((t) => t.text && remarks.push(t.text));
    await Promise.all([useGame.getState().pickSelected(), useGame.getState().pickSelected()]);
    off();
    expect(pickSpy).toHaveBeenCalledTimes(1);
    expect(useGame.getState().pick?.dishId).toBe('chicken-rice');
    expect(useGame.getState().busy).toBe(false);
    expect(new Set(remarks)).toEqual(new Set(['Chicken rice. The whole city can see that now.']));
    useGame.getState().selectDish('nasi-lemak');
    await Promise.all([useGame.getState().swapToSelected(), useGame.getState().swapToSelected()]);
    expect(useGame.getState().pick).toMatchObject({ dishId: 'nasi-lemak', swapsLeft: 0 });
    useToast.getState().clear();
    useGame.getState().dispose();
  });

  it('a refused action (no swaps left) is swallowed; other errors still surface', async () => {
    const d = deps();
    await useGame.getState().init(d);
    await d.service.pick('chicken-rice');
    await d.service.swap('nasi-lemak');
    useGame.getState().selectDish('fish-chips');
    await expect(useGame.getState().swapToSelected()).resolves.toBeUndefined();
    vi.spyOn(d.service, 'swap').mockRejectedValueOnce(new Error('network down'));
    await expect(useGame.getState().swapToSelected()).rejects.toThrow('network down');
    useToast.getState().clear();
    useGame.getState().dispose();
  });
});
