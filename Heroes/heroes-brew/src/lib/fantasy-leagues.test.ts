/**
 * FILE: fantasy-leagues.test.ts
 * PURPOSE: Guard the official-draft past-date filter so /fantasy-football
 * only presents upcoming leagues in America/Los_Angeles.
 *
 * OVERVIEW:
 * Sheet-driven league rows can still include drafts that already happened.
 * Presentation must drop those so open-spot totals exclude past slots.
 *
 * DEPENDENCIES:
 * - ./fantasy-leagues.ts
 *
 * EXPORTS:
 * - (none — Vitest suite)
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Filters sheet dates and formatted labels that are already past
 * - ✅ Keeps same-day drafts that have not started yet
 * - ✅ End-of-day cutoff when time is missing
 * - ✅ Bundled list excludes the cancelled Fri Sep 4 3pm draft
 *
 * RELATED FILES:
 * - src/lib/fantasy-leagues.ts
 * - src/lib/fantasy.ts
 *
 * LAST UPDATED: 2026-09-04
 * MAINTAINER: American Heroes & Brew
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FANTASY, OFFICIAL_LEAGUES, leagueDateText } from './fantasy';
import { filterUpcomingLeagues, isUpcomingDraft } from './fantasy-leagues';

/** Friday Sep 4, 2026 2:00 PM PDT (UTC-7). */
const FRI_SEP4_2PM = new Date('2026-09-04T21:00:00.000Z');
/** Friday Sep 4, 2026 3:01 PM PDT. */
const FRI_SEP4_301PM = new Date('2026-09-04T22:01:00.000Z');

describe('isUpcomingDraft', () => {
  it('drops a sheet date whose draft datetime is already past in PT', () => {
    expect(isUpcomingDraft('8/29/26', '4:00 PM', FRI_SEP4_2PM)).toBe(false);
    expect(isUpcomingDraft('8/30/26', '3:00 PM', FRI_SEP4_2PM)).toBe(false);
  });

  it('keeps a later sheet date and a same-day draft that has not started', () => {
    expect(isUpcomingDraft('9/5/26', '4:00 PM', FRI_SEP4_2PM)).toBe(true);
    expect(isUpcomingDraft('9/4/26', '3:00 PM', FRI_SEP4_2PM)).toBe(true);
    expect(isUpcomingDraft('9/4/26', '4:00 PM', FRI_SEP4_2PM)).toBe(true);
  });

  it('drops a same-day draft once its PT start time has passed', () => {
    expect(isUpcomingDraft('9/4/26', '3:00 PM', FRI_SEP4_301PM)).toBe(false);
    expect(isUpcomingDraft('Fri, Sep 4', '3:00 PM', FRI_SEP4_301PM)).toBe(false);
    expect(isUpcomingDraft('9/4/26', '4:00 PM', FRI_SEP4_301PM)).toBe(true);
  });

  it('parses formatted labels the same way as sheet dates', () => {
    expect(isUpcomingDraft('Sat, Aug 29', '4:00 PM', FRI_SEP4_2PM)).toBe(false);
    expect(isUpcomingDraft('Sun, Aug 30', '3:00 PM', FRI_SEP4_2PM)).toBe(false);
    expect(isUpcomingDraft('Fri, Sep 4', '3:00 PM', FRI_SEP4_2PM)).toBe(true);
    expect(isUpcomingDraft('Sat, Sep 5', '4:00 PM', FRI_SEP4_2PM)).toBe(true);
    expect(isUpcomingDraft('Sun, Sep 6', '3:00 PM', FRI_SEP4_2PM)).toBe(true);
  });

  it('uses end of the local day when time is missing', () => {
    expect(isUpcomingDraft('8/29/26', undefined, FRI_SEP4_2PM)).toBe(false);
    expect(isUpcomingDraft('Fri, Sep 4', undefined, FRI_SEP4_2PM)).toBe(true);
    expect(isUpcomingDraft('Fri, Sep 4', '', FRI_SEP4_301PM)).toBe(true);
  });

  it('keeps unparseable labels so a bad sheet row is not silently hidden', () => {
    expect(isUpcomingDraft('TBD', '4:00 PM', FRI_SEP4_2PM)).toBe(true);
    expect(isUpcomingDraft('', undefined, FRI_SEP4_2PM)).toBe(true);
  });
});

describe('filterUpcomingLeagues', () => {
  it('drops past official drafts and sums spots from the remainder only', () => {
    const rows = [
      { id: '02', label: 'Sat, Aug 29', time: '4:00 PM', spotsLeft: 5 },
      { id: '03', label: 'Sun, Aug 30', time: '3:00 PM', spotsLeft: 5 },
      { id: '04', label: 'Fri, Sep 4', time: '3:00 PM', spotsLeft: 4 },
      { id: '05', label: 'Fri, Sep 4', time: '4:00 PM', spotsLeft: 3 },
      { id: '06', label: 'Sat, Sep 5', time: '4:00 PM', spotsLeft: 6 },
      { id: '07', label: 'Sun, Sep 6', time: '3:00 PM', spotsLeft: 2 },
    ];

    const upcoming = filterUpcomingLeagues(rows, FRI_SEP4_2PM);
    expect(upcoming.map((l) => l.id)).toEqual(['04', '05', '06', '07']);
    expect(upcoming.reduce((n, l) => n + l.spotsLeft, 0)).toBe(15);

    const afterThree = filterUpcomingLeagues(rows, FRI_SEP4_301PM);
    expect(afterThree.map((l) => l.id)).toEqual(['05', '06', '07']);
    expect(afterThree.reduce((n, l) => n + l.spotsLeft, 0)).toBe(11);
  });

  it('prefers raw sheet dateLabel (with year) over the formatted label', () => {
    const rows = [
      { id: 'past', label: 'Sat, Aug 29', dateLabel: '8/29/26', time: '4:00 PM', spotsLeft: 5 },
      { id: 'next', label: 'Sat, Sep 5', dateLabel: '9/5/26', time: '4:00 PM', spotsLeft: 6 },
    ];
    expect(filterUpcomingLeagues(rows, FRI_SEP4_2PM).map((l) => l.id)).toEqual(['next']);
  });
});

describe('bundled remaining official drafts', () => {
  it('lists only the remaining Labor Day weekend slots', () => {
    expect(OFFICIAL_LEAGUES.map(leagueDateText)).toEqual([
      'Fri, Sep 4 · 4:00 PM',
      'Sat, Sep 5 · 4:00 PM',
      'Sun, Sep 6 · 3:00 PM',
    ]);
    expect(OFFICIAL_LEAGUES.some((l) => l.id === 'sep04-3pm')).toBe(false);
    expect(OFFICIAL_LEAGUES.some((l) => l.label === 'Fri, Sep 4' && l.time === '3:00 PM')).toBe(false);
    expect(OFFICIAL_LEAGUES.some((l) => /aug\s*2[89]|aug\s*30|moved from/i.test(`${l.id} ${l.label}`))).toBe(false);
  });

  it('FAQ no longer advertises the full two-weekend slate', () => {
    const draftsFaq = FANTASY.faqs.find((f) => /when are the official/i.test(f.question));
    expect(draftsFaq?.answer).toMatch(/Labor Day weekend/i);
    expect(draftsFaq?.answer).toMatch(/Sep(?:tember)? 4/);
    expect(draftsFaq?.answer).toMatch(/4pm/);
    expect(draftsFaq?.answer).toMatch(/Sat(?:urday)? Sep 5 at 4pm/);
    expect(draftsFaq?.answer).toMatch(/Sun(?:day)? Sep 6 at 3pm/);
    expect(draftsFaq?.answer).not.toMatch(/two weekends/i);
    expect(draftsFaq?.answer).not.toMatch(/two Friday/i);
    expect(draftsFaq?.answer).not.toMatch(/3pm and 4pm/);
    expect(draftsFaq?.answer).not.toMatch(/Friday Sep 4 at 3pm/i);
    expect(draftsFaq?.answer).not.toMatch(/Aug(?:ust)? 2[89]|Aug(?:ust)? 30/);
  });

  it('FantasyPageView sums spotsOpen from returned leagues only', () => {
    const src = readFileSync(resolve(__dirname, '../components/FantasyPageView.tsx'), 'utf8');
    expect(src).toMatch(/spotsOpen = leagues\.reduce\(\(n, l\) => n \+ l\.spotsLeft/);
    expect(src).not.toMatch(/spotsOpen\s*=\s*33/);
  });
});
