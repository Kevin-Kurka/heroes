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

describe('curatePromos — IG Feed posts (biggest games only)', () => {
  it('emits a feed-post for a USA World Cup game', () => {
    const out = curatePromos([ev({ id: 'wc-usa', league: 'WORLDCUP', homeTeam: 'United States', awayTeam: 'Wales' })]);
    const feed = out.find((p) => p.key === 'feed-wc-usa');
    expect(feed?.postType).toBe('feed-post');
    expect(feed?.channel).toBe('Feed');
    expect(feed?.media).toContain('/api/og/event');
    expect(feed?.media).toContain('ratio=4x5');
  });

  it('emits a feed-post for a Padres HOME game but not a Padres AWAY game', () => {
    const home = curatePromos([ev({ id: 'mlb-home', league: 'MLB', homeTeam: 'San Diego Padres', awayTeam: 'Los Angeles Dodgers' })]);
    expect(home.find((p) => p.key === 'feed-mlb-home')?.postType).toBe('feed-post');
    const away = curatePromos([ev({ id: 'mlb-away', league: 'MLB', homeTeam: 'Los Angeles Dodgers', awayTeam: 'San Diego Padres' })]);
    expect(away.find((p) => p.postType === 'feed-post')).toBeUndefined();
  });

  it('emits a feed-post for a Chargers HOME game', () => {
    const out = curatePromos([ev({ id: 'nfl-home', league: 'NFL', homeTeam: 'Los Angeles Chargers', awayTeam: 'Denver Broncos' })]);
    expect(out.find((p) => p.key === 'feed-nfl-home')?.postType).toBe('feed-post');
  });

  it('does NOT emit a feed-post for a Monday-Night game without a followed team', () => {
    const out = curatePromos([ev({ id: 'nfl-mnf', league: 'NFL', homeTeam: 'Buffalo Bills', awayTeam: 'New York Jets', eventTimestamp: '2026-06-29T19:00:00-07:00' })]);
    expect(out.find((p) => p.postType === 'feed-post')).toBeUndefined();
    // ...but it is still a Google Event.
    expect(out.find((p) => p.postType === 'google-event')).toBeTruthy();
  });

  it('does NOT emit a feed-post for a non-USA/Mexico World Cup game', () => {
    const out = curatePromos([ev({ id: 'wc-br', league: 'WORLDCUP', homeTeam: 'Brazil', awayTeam: 'Serbia' })]);
    expect(out.find((p) => p.postType === 'feed-post')).toBeUndefined();
  });
});

describe('curatePromos — Schedule Stories', () => {
  it('emits one WC schedule story per game-day', () => {
    const out = curatePromos([
      ev({ id: 'wc-a', league: 'WORLDCUP', homeTeam: 'Brazil', awayTeam: 'Serbia', eventTimestamp: '2026-06-29T11:00:00-07:00' }),
      ev({ id: 'wc-b', league: 'WORLDCUP', homeTeam: 'France', awayTeam: 'Denmark', eventTimestamp: '2026-06-29T14:00:00-07:00' }),
    ]);
    const stories = out.filter((p) => p.postType === 'schedule-story' && p.league === 'WORLDCUP');
    expect(stories).toHaveLength(1);
    expect(stories[0].media).toContain('/api/og/schedule');
    expect(stories[0].media).toContain('league=WC');
    expect(stories[0].media).toContain('date=2026-06-29');
    expect(stories[0].channel).toBe('Story');
  });

  it('emits an NFL schedule story only on a Sunday with NFL games', () => {
    // 2026-06-28 is a Sunday.
    const out = curatePromos([
      ev({ id: 'nfl-s', league: 'NFL', homeTeam: 'Dallas Cowboys', awayTeam: 'Green Bay Packers', eventTimestamp: '2026-06-28T13:00:00-07:00' }),
    ]);
    const stories = out.filter((p) => p.postType === 'schedule-story' && p.league === 'NFL');
    expect(stories).toHaveLength(1);
    expect(stories[0].media).toContain('league=NFL');
  });

  it('does NOT emit an NFL schedule story for a non-Sunday NFL game', () => {
    // 2026-06-29 is a Monday.
    const out = curatePromos([
      ev({ id: 'nfl-m', league: 'NFL', homeTeam: 'Dallas Cowboys', awayTeam: 'Green Bay Packers', eventTimestamp: '2026-06-29T19:00:00-07:00' }),
    ]);
    expect(out.filter((p) => p.postType === 'schedule-story' && p.league === 'NFL')).toHaveLength(0);
  });
});
