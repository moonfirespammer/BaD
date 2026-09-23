import { describe, expect, it } from 'vitest';
import { PROFILE_KEY, ProfileStore, freshProfile } from './profile';
import { createMemoryStorage } from './storage';

describe('ProfileStore', () => {
  it('creates a fresh profile with zero counters and persists it', async () => {
    const storage = createMemoryStorage();
    const store = new ProfileStore(storage, { city: 'SG' });
    const p = await store.load('2026-09');
    expect(p).toMatchObject({
      name: 'Ayu',
      city: 'SG',
      classKey: 'stirrer',
      gem: 'ruby',
      figure: 't1m',
      introSeen: false,
      cursedPlates: [],
    });
    expect(p.habits).toEqual({ chilli: 0, rawRice: 0, unhinged: 0, plates: 0, month: '2026-09' });
    expect(p.id).not.toBe('');
    expect(storage.dump()[PROFILE_KEY]).toEqual(p);
  });
  it('updates persist and notify, and survive a reload', async () => {
    const storage = createMemoryStorage();
    const store = new ProfileStore(storage, { city: 'SG' });
    await store.load('2026-09');
    const seen: boolean[] = [];
    const off = store.subscribe((p) => seen.push(p.introSeen));
    await store.update({ introSeen: true });
    off();
    await store.update({ gem: 'emerald' });
    expect(seen).toEqual([true]);
    const again = new ProfileStore(storage, { city: 'SG' });
    const p = await again.load('2026-09');
    expect(p.introSeen).toBe(true);
    expect(p.gem).toBe('emerald');
    expect(p.id).toBe(store.get().id);
  });
  it('rolls the monthly counters and follows the host city', async () => {
    const storage = createMemoryStorage({
      [PROFILE_KEY]: {
        ...freshProfile('2026-08'),
        habits: { chilli: 2, rawRice: 1, unhinged: 2, plates: 14, month: '2026-08' },
      },
    });
    const store = new ProfileStore(storage, { city: 'KL' });
    const p = await store.load('2026-09');
    expect(p.habits).toEqual({ chilli: 0, rawRice: 0, unhinged: 0, plates: 0, month: '2026-09' });
    expect(p.city).toBe('KL');
    expect(() => new ProfileStore(storage).get()).toThrow();
  });
});
