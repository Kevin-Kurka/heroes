/**
 * FILE: curated-promos.test.ts
 * PURPOSE: Guard Google Event curation — who gets a row, auto-approve, and branded media.
 *
 * OVERVIEW:
 * Fixture-driven checks for Padres/Chargers/WC/MNF Google Events. P0 branded-media
 * tests assert Padres/MLB and Chargers never ship bare /api/og/event Satori cards.
 *
 * DEPENDENCIES:
 * - ./curated-promos.ts
 * - public/promos/event-padres-*.jpg, nfl-sunday-4x5.jpg
 *
 * LAST UPDATED: 2026-09-17
 * MAINTAINER: American Heroes & Brew
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { curatePromos, GAMEDAY_EVENT_PLATES, resolveEventPoster } from './curated-promos';
import type { UnifiedEvent } from '@/types';

const PUBLIC = resolve(__dirname, '../../public');

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

describe('curatePromos — branded event media (no Satori OG cards)', () => {
  it('uses the Dodgers rivalry still for Padres vs Dodgers', () => {
    const out = curatePromos([ev({
      id: 'mlb-lad',
      league: 'MLB',
      homeTeam: 'San Diego Padres',
      awayTeam: 'Los Angeles Dodgers',
    })]);
    const e = out.find((p) => p.key === 'gevt-mlb-lad');
    expect(e?.media).toBe('/promos/event-padres-dodgers.jpg');
    expect(e?.media).not.toMatch(/\/api\/og\/event/);
  });

  it('uses the home still for other Padres games', () => {
    const home = curatePromos([ev({
      id: 'mlb-chc',
      league: 'MLB',
      homeTeam: 'San Diego Padres',
      awayTeam: 'Chicago Cubs',
    })]).find((p) => p.key === 'gevt-mlb-chc');
    const away = curatePromos([ev({
      id: 'mlb-ari',
      league: 'MLB',
      homeTeam: 'Arizona Diamondbacks',
      awayTeam: 'San Diego Padres',
    })]).find((p) => p.key === 'gevt-mlb-ari');
    expect(home?.media).toBe('/promos/event-padres-home.jpg');
    expect(away?.media).toBe('/promos/event-padres-home.jpg');
    expect(home?.media).not.toMatch(/\/api\/og\/event/);
  });

  it('uses a branded NFL still for Chargers — not /api/og/event and not week3 gameday plates', () => {
    const out = curatePromos([ev({
      id: 'nfl-c',
      league: 'NFL',
      homeTeam: 'Los Angeles Chargers',
      awayTeam: 'Las Vegas Raiders',
    })]);
    const e = out.find((p) => p.key === 'gevt-nfl-c');
    expect(e?.media).toBe('/promos/nfl-sunday-4x5.jpg');
    expect(e?.media).not.toMatch(/\/api\/og\/event/);
    expect(e?.media).not.toMatch(/\/gameday\/week2\//);
    expect(e?.media).not.toMatch(/\/gameday\/week3\//);
  });

  it('keeps World Cup / Monday Night on the OG event card (unchanged path)', () => {
    const wc = curatePromos([ev({
      id: 'wc-1',
      league: 'WORLDCUP',
      homeTeam: 'United States',
      awayTeam: 'Wales',
    })]).find((p) => p.key === 'gevt-wc-1');
    const mnf = curatePromos([ev({
      id: 'mnf',
      league: 'NFL',
      homeTeam: 'Buffalo Bills',
      awayTeam: 'New York Jets',
      eventTimestamp: '2026-06-29T19:00:00-07:00',
    })]).find((p) => p.key === 'gevt-mnf');
    expect(wc?.media).toMatch(/^\/api\/og\/event\?/);
    expect(mnf?.media).toMatch(/^\/api\/og\/event\?/);
  });

  it('frames Padres/Chargers as a fan watch party — no official partnership language', () => {
    const out = curatePromos([
      ev({ id: 'mlb-p', league: 'MLB', homeTeam: 'San Diego Padres', awayTeam: 'Los Angeles Dodgers' }),
      ev({ id: 'nfl-c', league: 'NFL', homeTeam: 'Los Angeles Chargers', awayTeam: 'Denver Broncos' }),
    ]);
    for (const p of out) {
      const copy = `${p.headline}\n${p.caption}\n${p.storyCaption}`;
      expect(copy).not.toMatch(/official (mlb|padres|nfl|chargers|partnership)/i);
      expect(copy).not.toMatch(/presented by (the )?(mlb|padres|chargers|nfl)/i);
      expect(copy).toMatch(/watch|catch/i);
    }
  });

  it('points media at files that exist under public/', () => {
    for (const src of [
      '/promos/event-padres-dodgers.jpg',
      '/promos/event-padres-home.jpg',
      '/promos/event-padres-home-feed-45.jpg',
      '/promos/event-padres-rival-feed-45.jpg',
      '/promos/nfl-sunday-4x5.jpg',
    ]) {
      expect(existsSync(resolve(PUBLIC, src.replace(/^\//, ''))), src).toBe(true);
    }
  });
});

describe('resolveEventPoster — /gameday/ registry hook', () => {
  it('keeps the gameday registry free of NFL week2/week3 live-post plates', () => {
    expect(GAMEDAY_EVENT_PLATES.every((p) => !p.media.includes('/gameday/week2/'))).toBe(true);
    expect(GAMEDAY_EVENT_PLATES.every((p) => !p.media.includes('/gameday/week3/'))).toBe(true);
  });

  it('lets a registered gameday MLB plate win over static /promos/ plates', () => {
    const e = ev({
      league: 'MLB',
      homeTeam: 'San Diego Padres',
      awayTeam: 'Los Angeles Dodgers',
    });
    const future = '/gameday/mlb/dodgers-at-padres-feed-45.jpg';
    expect(resolveEventPoster(e, 'Fri 7:10 PM', [
      { league: 'MLB', awayIncludes: 'Dodgers', homeIncludes: 'Padres', media: future },
    ])).toBe(future);
  });

  it('falls back to the static Dodgers plate when the gameday registry is empty', () => {
    const e = ev({
      league: 'MLB',
      homeTeam: 'San Diego Padres',
      awayTeam: 'Los Angeles Dodgers',
    });
    expect(resolveEventPoster(e, 'Fri 7:10 PM', [])).toBe('/promos/event-padres-dodgers.jpg');
  });
});
