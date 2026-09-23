import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';

/** Key-value persistence: IndexedDB (idb-keyval) with a localStorage fallback, plus an in-memory store for tests. */
export interface Storage {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  del(key: string): Promise<void>;
}

const hasIndexedDb = (): boolean => typeof indexedDB !== 'undefined';

function localStore(): Storage {
  return {
    get: <T>(key: string): Promise<T | undefined> => {
      try {
        const raw = localStorage.getItem(key);
        return Promise.resolve(raw === null ? undefined : (JSON.parse(raw) as T));
      } catch {
        return Promise.resolve(undefined);
      }
    },
    set: <T>(key: string, value: T): Promise<void> => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* quota or private mode: state stays in memory for this session */
      }
      return Promise.resolve();
    },
    del: (key: string): Promise<void> => {
      try {
        localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
      return Promise.resolve();
    },
  };
}

export function createStorage(): Storage {
  if (!hasIndexedDb()) return localStore();
  const fallback = localStore();
  return {
    get: async <T>(key: string): Promise<T | undefined> => {
      try {
        return await idbGet<T>(key);
      } catch {
        return fallback.get<T>(key);
      }
    },
    set: async <T>(key: string, value: T): Promise<void> => {
      try {
        await idbSet(key, value);
      } catch {
        await fallback.set(key, value);
      }
    },
    del: async (key: string): Promise<void> => {
      try {
        await idbDel(key);
      } catch {
        await fallback.del(key);
      }
    },
  };
}

export function createMemoryStorage(
  initial: Record<string, unknown> = {},
): Storage & { dump(): Record<string, unknown> } {
  const map = new Map<string, unknown>(Object.entries(initial));
  return {
    get: <T>(key: string) => Promise.resolve(map.get(key) as T | undefined),
    set: <T>(key: string, value: T) => {
      map.set(key, structuredClone(value));
      return Promise.resolve();
    },
    del: (key: string) => {
      map.delete(key);
      return Promise.resolve();
    },
    dump: () => Object.fromEntries(map),
  };
}
