import { describe, it, expect } from 'vitest';
import { gbpDateTime, gbpLocalPostsUrl } from './route';

describe('gbpDateTime', () => {
  it('splits an ISO timestamp into PT date + time objects', () => {
    const r = gbpDateTime('2026-06-29T19:10:00-07:00');
    expect(r.date).toEqual({ year: 2026, month: 6, day: 29 });
    expect(r.time).toEqual({ hours: 19, minutes: 10, seconds: 0 });
  });

  it('converts a UTC timestamp into PT wall-clock', () => {
    // 2026-06-30T02:00:00Z == 2026-06-29 19:00 PT
    const r = gbpDateTime('2026-06-30T02:00:00Z');
    expect(r.date).toEqual({ year: 2026, month: 6, day: 29 });
    expect(r.time.hours).toBe(19);
  });
});

describe('gbpLocalPostsUrl', () => {
  const BASE = 'https://mybusiness.googleapis.com/v4';
  const EXPECTED = `${BASE}/accounts/123/locations/456/localPosts`;

  it('builds the URL from bare numeric ids', () => {
    expect(gbpLocalPostsUrl('123', '456')).toBe(EXPECTED);
  });

  it('tolerates prefixed resource names (accounts/…, locations/…)', () => {
    // The GBP APIs and our own docs return/expect the prefixed form; the URL template
    // already hardcodes the literals, so the env value must not double them up.
    expect(gbpLocalPostsUrl('accounts/123', 'locations/456')).toBe(EXPECTED);
  });

  it('tolerates a mix of prefixed and bare ids', () => {
    expect(gbpLocalPostsUrl('accounts/123', '456')).toBe(EXPECTED);
  });

  it('trims surrounding whitespace', () => {
    expect(gbpLocalPostsUrl(' accounts/123 ', ' 456 ')).toBe(EXPECTED);
  });
});
