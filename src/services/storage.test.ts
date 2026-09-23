import { describe, expect, it } from 'vitest';
import { createMemoryStorage, createStorage } from './storage';

describe('storage', () => {
  it('falls back to localStorage when IndexedDB is unavailable (jsdom)', async () => {
    const s = createStorage();
    await s.set('k', { a: 1 });
    expect(await s.get<{ a: number }>('k')).toEqual({ a: 1 });
    expect(localStorage.getItem('k')).toBe('{"a":1}');
    await s.del('k');
    expect(await s.get('k')).toBeUndefined();
    localStorage.setItem('bad-json', '{');
    expect(await s.get('bad-json')).toBeUndefined();
  });
  it('memory storage clones values', async () => {
    const s = createMemoryStorage();
    const v = { n: 1 };
    await s.set('x', v);
    v.n = 2;
    expect(await s.get<{ n: number }>('x')).toEqual({ n: 1 });
    await s.del('x');
    expect(s.dump()).toEqual({});
  });
});
