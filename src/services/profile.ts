import type { City, ClassKey, Gem, Profile } from '@/game/types';
import type { Storage } from './storage';

export const PROFILE_KEY = 'bad:profile';

export interface ProfileDefaults {
  city?: City;
  classKey?: ClassKey;
  gem?: Gem;
  name?: string;
}

const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `p-${Date.now().toString(36)}`;

/** A fresh profile: the prototype's identity (Ayu, Stirrer, Ruby, Singapore) with every counter at zero. */
export function freshProfile(month: string, d: ProfileDefaults = {}): Profile {
  return {
    id: newId(),
    name: d.name ?? 'Ayu',
    city: d.city ?? 'SG',
    classKey: d.classKey ?? 'stirrer',
    gem: d.gem ?? 'ruby',
    figure: 't1m',
    introSeen: false,
    cursedPlates: [],
    habits: { chilli: 0, rawRice: 0, unhinged: 0, plates: 0, month },
  };
}

/** Owns the game's slice of the profile (introSeen, signature, cursedPlates, habits) and persists it. */
export class ProfileStore {
  private profile: Profile | null = null;
  private readonly listeners = new Set<(p: Profile) => void>();

  constructor(
    private readonly storage: Storage,
    private readonly defaults: ProfileDefaults = {},
  ) {}

  async load(month: string): Promise<Profile> {
    const saved = await this.storage.get<Profile>(PROFILE_KEY);
    let p = saved ?? freshProfile(month, this.defaults);
    if (this.defaults.city && p.city !== this.defaults.city) p = { ...p, city: this.defaults.city };
    if (p.habits.month !== month)
      p = { ...p, habits: { chilli: 0, rawRice: 0, unhinged: 0, plates: 0, month } };
    this.profile = p;
    if (!saved) await this.storage.set(PROFILE_KEY, p);
    return p;
  }

  get(): Profile {
    if (!this.profile) throw new Error('ProfileStore.load() first');
    return this.profile;
  }

  async update(patch: Partial<Profile>): Promise<Profile> {
    const next = { ...this.get(), ...patch };
    this.profile = next;
    await this.storage.set(PROFILE_KEY, next);
    for (const l of this.listeners) l(next);
    return next;
  }

  subscribe(listener: (p: Profile) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
