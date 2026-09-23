// Reads public/assets/bad/manifest.json at runtime (ASSET_BRIEF_CHATGPT.md §10). Anything but a real JSON 200
// (Vite dev and static hosts answer index.html with 200 for missing files) counts as "no manifest".

export interface ManifestEntry {
  path: string;
  w: number;
  h: number;
  alpha: boolean;
  group: string;
  key: string;
}

export const MANIFEST_URL = '/assets/bad/manifest.json';
export const ASSET_BASE = '/assets/bad/';

let cache: Promise<ManifestEntry[]> | null = null;

const isEntry = (e: unknown): e is ManifestEntry =>
  typeof e === 'object' &&
  e !== null &&
  typeof (e as ManifestEntry).path === 'string' &&
  typeof (e as ManifestEntry).group === 'string' &&
  typeof (e as ManifestEntry).key === 'string';

export function loadManifest(): Promise<ManifestEntry[]> {
  cache ??= (async () => {
    try {
      const res = await fetch(MANIFEST_URL, { headers: { Accept: 'application/json' } });
      if (!res.ok || !(res.headers.get('content-type') ?? '').includes('application/json')) return [];
      const json: unknown = await res.json();
      const list = Array.isArray(json)
        ? json
        : typeof json === 'object' && json !== null && Array.isArray((json as { entries?: unknown }).entries)
          ? (json as { entries: unknown[] }).entries
          : [];
      return list.filter(isEntry);
    } catch {
      return [];
    }
  })();
  return cache;
}

export async function resolveArt(group: string, key: string): Promise<ManifestEntry | null> {
  const list = await loadManifest();
  return list.find((e) => e.group === group && e.key === key) ?? null;
}

/** Test hook: forget the cached manifest. */
export function resetManifestCache(): void {
  cache = null;
}
