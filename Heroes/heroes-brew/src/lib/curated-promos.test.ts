import { describe, it, expect } from 'vitest';
import { curatePromos } from './curated-promos';
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

describe('curatePromos — Google Events', () => {
  it('flags a Padres game as a google-event', () => {
    const out = curatePromos([ev({ id: 'mlb-1', league: 'MLB', homeTeam: 'San Diego Padres', awayTeam: 'Los Angeles Dodgers' })]);
    const e = out.find((p) => p.key.includes('mlb-1'));
    expect(e?.postType).toBe('google-event');
    expect(e?.channel).toBe('Google');
    expect(e?.eventStart).toBeTruthy();
    expect(e?.eventEnd).toBeTruthy();
  });

  it('flags a USA World Cup game as a google-event', () => {
    const out = curatePromos([ev({ id: 'wc-1', league: 'WORLDCUP', homeTeam: 'United States', awayTeam: 'Wales' })]);
    expect(out.find((p) => p.key.includes('wc-1'))?.postType).toBe('google-event');
  });

  it('flags a Mexico World Cup game as a google-event', () => {
    const out = curatePromos([ev({ id: 'wc-2', league: 'WORLDCUP', homeTeam: 'Mexico', awayTeam: 'Poland' })]);
    expect(out.find((p) => p.key.includes('wc-2'))?.postType).toBe('google-event');
  });

  it('flags a Chargers game as a google-event', () => {
    const out = curatePromos([ev({ id: 'nfl-1', league: 'NFL', homeTeam: 'Los Angeles Chargers', awayTeam: 'Denver Broncos' })]);
    expect(out.find((p) => p.key.includes('nfl-1'))?.postType).toBe('google-event');
  });

  it('flags a Monday Night NFL game as a google-event even without a followed team', () => {
    // 2026-06-29 is a Monday; 19:00 PT is evening.
    const out = curatePromos([ev({ id: 'nfl-2', league: 'NFL', homeTeam: 'Buffalo Bills', awayTeam: 'New York Jets', eventTimestamp: '2026-06-29T19:00:00-07:00' })]);
    expect(out.find((p) => p.key.includes('nfl-2'))?.postType).toBe('google-event');
  });

  it('does NOT flag a non-followed MLB game', () => {
    const out = curatePromos([ev({ id: 'mlb-9', league: 'MLB', homeTeam: 'New York Yankees', awayTeam: 'Boston Red Sox' })]);
    expect(out.find((p) => p.key.includes('mlb-9') && p.postType === 'google-event')).toBeUndefined();
  });

  it('does NOT flag a non-USA/Mexico World Cup game as a google-event', () => {
    const out = curatePromos([ev({ id: 'wc-9', league: 'WORLDCUP', homeTeam: 'Brazil', awayTeam: 'Serbia' })]);
    expect(out.find((p) => p.key.includes('wc-9') && p.postType === 'google-event')).toBeUndefined();
  });
});

describe('curatePromos — games post ONLY as Google Events', () => {
  it('emits no feed-post or schedule-story rows — games are Google Events only', () => {
    const out = curatePromos([
      ev({ id: 'mlb-home', league: 'MLB', homeTeam: 'San Diego Padres', awayTeam: 'Los Angeles Dodgers', eventTimestamp: '2026-06-29T18:00:00-07:00' }),
      ev({ id: 'wc-usa', league: 'WORLDCUP', homeTeam: 'United States', awayTeam: 'Wales' }),
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
  it('auto-approves Padres/Chargers Events, but NOT Monday-Night events', () => {
    const out = curatePromos([
      ev({ id: 'p', league: 'MLB', homeTeam: 'San Diego Padres', awayTeam: 'Chicago Cubs', eventTimestamp: '2026-06-30T18:00:00-07:00' }),
      ev({ id: 'mnf', league: 'NFL', homeTeam: 'Buffalo Bills', awayTeam: 'New York Jets', eventTimestamp: '2026-06-29T19:00:00-07:00' }),
    ]);
    expect(out.find((p) => p.key === 'gevt-p')?.autoApprove).toBe(true);
    expect(out.find((p) => p.key === 'gevt-mnf')?.autoApprove).toBe(false);
  });
});

describe('curatePromos — Friar Frank push on Padres games', () => {
  it('adds the Friar Frank push to a Padres Google Event', () => {
    const out = curatePromos([ev({ id: 'mlb-p', league: 'MLB', homeTeam: 'San Diego Padres', awayTeam: 'Los Angeles Dodgers' })]);
    expect(out.find((p) => p.key === 'gevt-mlb-p')?.caption).toContain('Friar Franks $6');
  });

  it('does NOT add the Friar Frank push to a Chargers Google Event', () => {
    const out = curatePromos([ev({ id: 'nfl-c', league: 'NFL', homeTeam: 'Los Angeles Chargers', awayTeam: 'Denver Broncos' })]);
    expect(out.find((p) => p.key === 'gevt-nfl-c')?.caption).not.toContain('Friar Frank');
  });
});
