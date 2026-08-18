import { describe, it, expect } from 'vitest';
import { curatePromos, ptIso } from './curated-promos';
import type { UnifiedEvent } from '@/types';

function ev(p: Partial<UnifiedEvent>): UnifiedEvent {
  return {
    id: p.id ?? 'x',
    eventTimestamp: p.eventTimestamp ?? '2026-06-29T19:00:00-07:00',
    eventTitle: p.eventTitle ?? 'Game',
    eventType: 'SPORTS',
    displayMessage: '',
    ...p,
  };
}

function nflSundaySlate(ymd = '2026-09-13', count = 13): UnifiedEvent[] {
  return Array.from({ length: count }, (_, i) =>
    ev({
      id: `nfl-${i}`,
      league: 'NFL',
      homeTeam: i === 0 ? 'Los Angeles Chargers' : `Home ${i}`,
      awayTeam: i === 0 ? 'Kansas City Chiefs' : `Away ${i}`,
      eventTimestamp: `${ymd}T${i < 8 ? '13' : '16'}:00:00-07:00`,
    }),
  );
}

describe('curatePromos — Google Events', () => {
  it('flags a Padres game as a google-event', () => {
    const out = curatePromos([ev({ id: 'mlb-1', league: 'MLB', homeTeam: 'San Diego Padres', awayTeam: 'Los Angeles Dodgers' })]);
    const e = out.find((p) => p.key.includes('mlb-1'));
    expect(e?.postType).toBe('google-event');
    expect(e?.channel).toBe('Google');
    expect(e?.eventStart).toBeTruthy();
    expect(e?.eventEnd).toBeTruthy();
  });

  it('does NOT flag a finished World Cup match as a live google-event', () => {
    const out = curatePromos([
      ev({ id: 'wc-1', league: 'WORLDCUP', homeTeam: 'United States', awayTeam: 'Wales' }),
      ev({ id: 'wc-2', league: 'WORLDCUP', homeTeam: 'Mexico', awayTeam: 'Poland' }),
    ]);
    expect(out.find((p) => p.key.includes('wc-1'))).toBeUndefined();
    expect(out.find((p) => p.key.includes('wc-2'))).toBeUndefined();
  });

  it('flags a preseason Chargers game (outside the regular-season window) as a matchup google-event', () => {
    const out = curatePromos([
      ev({
        id: 'nfl-1',
        league: 'NFL',
        homeTeam: 'Los Angeles Chargers',
        awayTeam: 'Denver Broncos',
        eventTimestamp: '2026-08-22T16:00:00-07:00',
      }),
    ]);
    expect(out.find((p) => p.key.includes('nfl-1'))?.postType).toBe('google-event');
    expect(out.find((p) => p.key.startsWith('gnfl-'))).toBeUndefined();
  });

  it('does NOT flag a non-followed MLB game', () => {
    const out = curatePromos([ev({ id: 'mlb-9', league: 'MLB', homeTeam: 'New York Yankees', awayTeam: 'Boston Red Sox' })]);
    expect(out.find((p) => p.key.includes('mlb-9') && p.postType === 'google-event')).toBeUndefined();
  });
});

describe('curatePromos — one NFL Google Event per game day', () => {
  it('collapses a Sunday slate into exactly one gnfl- promo with a stable key', () => {
    const out = curatePromos(nflSundaySlate('2026-09-13', 13));
    const nfl = out.filter((p) => p.league === 'NFL');
    expect(nfl).toHaveLength(1);
    expect(nfl[0].key).toBe('gnfl-2026-09-13');
    expect(nfl[0].postType).toBe('google-event');
    expect(nfl[0].autoApprove).toBe(true);
    expect(nfl[0].eventStart).toBe('2026-09-13T09:00:00-07:00');
    expect(nfl[0].eventEnd).toBe('2026-09-13T20:00:00-07:00');
    expect(nfl[0].headline).toMatch(/NFL Sunday/i);
    expect(nfl[0].media).toContain('/api/og/schedule?');
    expect(nfl[0].media).toContain('league=NFL');
    expect(nfl[0].media).toContain('date=2026-09-13');
    expect(out.map((p) => p.key).filter((k) => k.startsWith('gevt-nfl-'))).toHaveLength(0);
  });

  it('does not emit a gnfl- promo for a Sunday outside the regular season', () => {
    const out = curatePromos(nflSundaySlate('2026-08-23', 8));
    expect(out.find((p) => p.key.startsWith('gnfl-'))).toBeUndefined();
  });

  it('uses PST (-08:00) for the Nov 1, 2026 DST-boundary Sunday', () => {
    const out = curatePromos(nflSundaySlate('2026-11-01', 4).map((e) => ({
      ...e,
      eventTimestamp: e.eventTimestamp.replace('-07:00', '-08:00'),
    })));
    const day = out.find((p) => p.key === 'gnfl-2026-11-01');
    expect(day?.eventStart).toBe('2026-11-01T09:00:00-08:00');
    expect(day?.eventEnd).toBe('2026-11-01T20:00:00-08:00');
  });

  it('uses the Kickoff Night headline on Sep 9, 2026, not a generic Wednesday', () => {
    const out = curatePromos([
      ev({
        id: 'nfl-kickoff',
        league: 'NFL',
        homeTeam: 'Seattle Seahawks',
        awayTeam: 'New England Patriots',
        eventTimestamp: '2026-09-09T17:20:00-07:00',
      }),
    ]);
    const day = out.find((p) => p.key === 'gnfl-2026-09-09');
    expect(day?.headline).toMatch(/Kickoff Night/i);
    expect(day?.headline).toMatch(/Patriots/i);
    expect(out.find((p) => p.key === 'gevt-nfl-kickoff')).toBeUndefined();
  });

  it('does not invent a Wednesday spec for a random in-season Wednesday', () => {
    const out = curatePromos([
      ev({
        id: 'nfl-wed',
        league: 'NFL',
        homeTeam: 'Buffalo Bills',
        awayTeam: 'Miami Dolphins',
        eventTimestamp: '2026-10-07T17:00:00-07:00',
      }),
    ]);
    expect(out.find((p) => p.key === 'gnfl-2026-10-07')).toBeUndefined();
  });

  it('uses the Thanksgiving headline and all-day window on Nov 26, 2026', () => {
    const out = curatePromos([
      ev({
        id: 'nfl-tg1',
        league: 'NFL',
        homeTeam: 'Detroit Lions',
        awayTeam: 'Green Bay Packers',
        eventTimestamp: '2026-11-26T09:30:00-08:00',
      }),
      ev({
        id: 'nfl-tg2',
        league: 'NFL',
        homeTeam: 'Dallas Cowboys',
        awayTeam: 'Kansas City Chiefs',
        eventTimestamp: '2026-11-26T13:30:00-08:00',
      }),
      ev({
        id: 'nfl-tg3',
        league: 'NFL',
        homeTeam: 'Kansas City Chiefs',
        awayTeam: 'Dallas Cowboys',
        eventTimestamp: '2026-11-26T17:20:00-08:00',
      }),
    ]);
    const day = out.find((p) => p.key === 'gnfl-2026-11-26');
    expect(day).toBeDefined();
    expect(day?.headline).toMatch(/Thanksgiving/i);
    expect(day?.eventStart).toBe('2026-11-26T09:00:00-08:00');
    expect(day?.eventEnd).toBe('2026-11-26T20:00:00-08:00');
    expect(out.filter((p) => p.league === 'NFL')).toHaveLength(1);
  });

  it('emits one Monday promo, not one per Monday Night game', () => {
    const out = curatePromos([
      ev({
        id: 'nfl-mnf-a',
        league: 'NFL',
        homeTeam: 'Buffalo Bills',
        awayTeam: 'New York Jets',
        eventTimestamp: '2026-09-14T17:15:00-07:00',
      }),
      ev({
        id: 'nfl-mnf-b',
        league: 'NFL',
        homeTeam: 'Philadelphia Eagles',
        awayTeam: 'Dallas Cowboys',
        eventTimestamp: '2026-09-14T20:15:00-07:00',
      }),
    ]);
    const nfl = out.filter((p) => p.league === 'NFL');
    expect(nfl).toHaveLength(1);
    expect(nfl[0].key).toBe('gnfl-2026-09-14');
    expect(nfl[0].headline).toMatch(/Monday Night Football/i);
  });

  it('never repeats a gnfl- key when the same slate is curated twice in one list', () => {
    const slate = nflSundaySlate('2026-09-20', 14);
    const out = curatePromos([...slate, ...slate]);
    const keys = out.map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys.filter((k) => k === 'gnfl-2026-09-20')).toHaveLength(1);
  });
});

describe('ptIso — Pacific offset across the 2026 DST change', () => {
  it('emits PDT (-07:00) before Nov 1, 2026', () => {
    expect(ptIso('2026-09-13', 9)).toBe('2026-09-13T09:00:00-07:00');
  });

  it('emits PST (-08:00) on Nov 1, 2026 (DST end + NFL Sunday)', () => {
    expect(ptIso('2026-11-01', 9)).toBe('2026-11-01T09:00:00-08:00');
  });
});

describe('curatePromos — games post ONLY as Google Events', () => {
  it('emits no feed-post or schedule-story rows — games are Google Events only', () => {
    const out = curatePromos([
      ev({ id: 'mlb-home', league: 'MLB', homeTeam: 'San Diego Padres', awayTeam: 'Los Angeles Dodgers', eventTimestamp: '2026-06-29T18:00:00-07:00' }),
    ]);
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((p) => p.postType === 'google-event')).toBe(true);
    expect(out.find((p) => p.postType === 'feed-post')).toBeUndefined();
    expect(out.find((p) => p.postType === 'schedule-story')).toBeUndefined();
  });

  it('a Padres Google Event carries a start and end time', () => {
    const out = curatePromos([ev({ id: 'mlb-1', league: 'MLB', homeTeam: 'San Diego Padres', awayTeam: 'Chicago Cubs' })]);
    const e = out.find((p) => p.key === 'gevt-mlb-1');
    expect(e?.channel).toBe('Google');
    expect(e?.eventStart).toBeTruthy();
    expect(e?.eventEnd).toBeTruthy();
  });
});

describe('curatePromos — auto-approval', () => {
  it('auto-approves Padres Events and in-season NFL gameday Events', () => {
    const out = curatePromos([
      ev({ id: 'p', league: 'MLB', homeTeam: 'San Diego Padres', awayTeam: 'Chicago Cubs', eventTimestamp: '2026-06-30T18:00:00-07:00' }),
      ...nflSundaySlate('2026-09-13', 2),
    ]);
    expect(out.find((p) => p.key === 'gevt-p')?.autoApprove).toBe(true);
    expect(out.find((p) => p.key === 'gnfl-2026-09-13')?.autoApprove).toBe(true);
  });
});

describe('curatePromos — Friar Frank push on Padres games', () => {
  it('adds the Friar Frank push to a Padres Google Event', () => {
    const out = curatePromos([ev({ id: 'mlb-p', league: 'MLB', homeTeam: 'San Diego Padres', awayTeam: 'Los Angeles Dodgers' })]);
    expect(out.find((p) => p.key === 'gevt-mlb-p')?.caption).toContain('Friar Franks $6');
  });

  it('does NOT add the Friar Frank push to an NFL gameday Event', () => {
    const out = curatePromos(nflSundaySlate('2026-09-13', 1));
    expect(out.find((p) => p.key === 'gnfl-2026-09-13')?.caption).not.toContain('Friar Frank');
  });
});
