import { describe, expect, it } from 'vitest';
import {
  cityTime,
  clockFromSearch,
  createClock,
  formatDate,
  isLeftoversHour,
  nextResetAt,
  resetIn,
} from './clock';

const sgt = (iso: string): number => Date.parse(`${iso}+08:00`);

describe('city clock (spec §3.1)', () => {
  it('reads the city date and hour in UTC+8', () => {
    const t = sgt('2026-09-23T21:30:00');
    expect(cityTime(t)).toMatchObject({ date: '2026-09-23', month: '2026-09', hour: 21 });
    expect(cityTime(sgt('2026-09-23T23:59:59')).date).toBe('2026-09-23');
    expect(cityTime(sgt('2026-09-24T00:00:00')).date).toBe('2026-09-24');
  });
  it('counts down to 00:00 city time', () => {
    expect(resetIn(sgt('2026-09-23T21:30:00'))).toBe('02:30:00');
    expect(resetIn(sgt('2026-09-23T23:59:59'))).toBe('00:00:01');
    expect(resetIn(sgt('2026-09-23T00:00:00'))).toBe('00:00:00');
    expect(resetIn(sgt('2026-09-23T00:00:01'))).toBe('23:59:59');
    expect(nextResetAt(sgt('2026-09-23T21:30:00'))).toBe(sgt('2026-09-24T00:00:00'));
  });
  it('Leftovers hour is 21:00–00:00, with a dev override', () => {
    expect(isLeftoversHour(sgt('2026-09-23T20:59:59'))).toBe(false);
    expect(isLeftoversHour(sgt('2026-09-23T21:00:00'))).toBe(true);
    expect(isLeftoversHour(sgt('2026-09-23T23:59:59'))).toBe(true);
    expect(isLeftoversHour(sgt('2026-09-24T00:00:00'))).toBe(false);
    expect(isLeftoversHour(sgt('2026-09-23T12:00:00'), 'on')).toBe(true);
    expect(isLeftoversHour(sgt('2026-09-23T22:00:00'), 'off')).toBe(false);
  });
  it('formats dates as d Mon yyyy in city time', () => {
    expect(formatDate(sgt('2026-09-23T00:30:00'))).toBe('23 Sep 2026');
    expect(formatDate(Date.parse('2026-09-23T17:00:00Z'))).toBe('24 Sep 2026');
  });
  it('createClock applies offset and override', () => {
    const real = sgt('2026-09-23T10:00:00');
    const clock = createClock({ source: () => real, offsetMs: 12 * 36e5, leftoversOverride: null });
    expect(clock.city().hour).toBe(22);
    expect(clock.leftovers()).toBe(true);
    expect(clock.resetIn()).toBe('02:00:00');
    expect(createClock({ source: () => real, leftoversOverride: 'on' }).leftovers()).toBe(true);
  });
  it('clockFromSearch parses ?clock (city-local) and ?leftovers', () => {
    const real = sgt('2026-09-23T10:00:00');
    const opts = clockFromSearch('?clock=2026-09-23T21:30&leftovers=off', real);
    expect(opts.offsetMs).toBe(11.5 * 36e5);
    expect(opts.leftoversOverride).toBe('off');
    expect(clockFromSearch('?clock=2026-09-23T13:30:00Z', real).offsetMs).toBe(11.5 * 36e5);
    expect(clockFromSearch('?clock=nonsense&leftovers=maybe', real)).toEqual({});
    expect(clockFromSearch('', real)).toEqual({});
  });
});
