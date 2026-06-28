import { describe, it, expect } from 'vitest';
import { gbpDateTime } from './route';

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
