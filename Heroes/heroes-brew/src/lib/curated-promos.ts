/**
 * FILE: curated-promos.ts
 * PURPOSE: Turn the live 7-day schedule into Google Event sheet rows.
 *
 * OVERVIEW:
 * Padres/Chargers/USA-Mexico WC/Monday Night become google-event promos.
 * Padres Media is always a live static JPG (home / Dodgers rival) — never a
 * bare /api/og/event navy card, and never an invented story-916 URL.
 *
 * DEPENDENCIES:
 * - ./events.ts
 * - public/promos/event-padres-*.jpg, nfl-sunday-4x5.jpg
 *
 * EXPORTS:
 * - PromoPostType, CuratedPromo, curatePromos, getCuratedPromos
 * - EventPosterPlate, GAMEDAY_EVENT_PLATES, resolveEventPoster
 * - PADRES_HOME_PLATE, PADRES_RIVAL_PLATE, padresEventMedia
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Padres home/Petco → /promos/event-padres-home.jpg
 * - ✅ Padres vs Dodgers → /promos/event-padres-dodgers.jpg
 * - ✅ Away non-Dodgers fall back to the live home JPG (no 404 story/away URLs)
 * - ✅ Chargers NFL Sunday fallback (not week3 live-post plates)
 * - ❌ Week 3 NFL live-post flow is manual sheet rows — not wired here
 *
 * RELATED FILES:
 * - src/lib/curated-promos.test.ts
 * - src/app/api/promos/curate/route.ts
 * - scripts/sheet-auto-publisher.gs (seedCuratedRows)
 *
 * LAST UPDATED: 2026-09-25
 * MAINTAINER: American Heroes & Brew
 */
import type { UnifiedEvent } from '@/types';
import { getAllEvents, isMondayNight } from './events';

export type PromoPostType = 'google-event' | 'schedule-story' | 'feed-post';

export interface CuratedPromo {
  /** Post classification. */
  postType: PromoPostType;
  /** Stable dedup key written into the sheet's Notes cell. */
  key: string;
  /** Sheet "Post Date" (e.g. "Jun 29, 2026"). */
  date: string;
  /** Sheet "Post Time" (e.g. "10:00 AM"). */
  time: string;
  channel: 'Google' | 'Story' | 'Feed' | 'Story, Google';
  /** Poster URL path (relative to the site origin). */
  media: string;
  headline: string;
  caption: string;
  storyCaption: string;
  tags: string;
  /** ISO start (PT offset) — google-event only. */
  eventStart?: string;
  /** ISO end (PT offset) — google-event only. */
  eventEnd?: string;
  /** SportLeague string of the source event(s). */
  league: string;
  /**
   * Whether the seeder should stamp Approval="Approve" so the row auto-posts.
   * True for daily lineups and local-team (Padres/Chargers) Events + feed posts;
   * false for other Events (e.g. Monday-Night, WC) which keep the manual gate.
   */
  autoApprove: boolean;
}

const TAGS = '#AmericanHeroesAndBrew #CarlsbadVillage #SportsBar';
const EVENT_POST_TIME = '10:00 AM';
const EVENT_DURATION_MS = 2.5 * 60 * 60 * 1000;

/** The Padres game-day special, pushed on every Padres post. */
const FRIAR_FRANK_PUSH = 'Friar Franks $6 + $2 off Heroes drafts all game. 🌭🍺';

function teamBlob(e: UnifiedEvent): string {
  return `${e.homeTeam ?? ''}|${e.awayTeam ?? ''}|${e.eventTitle ?? ''}`.toLowerCase();
}

function isPadres(e: UnifiedEvent): boolean {
  return /\bpadres\b/.test(teamBlob(e));
}

function isDodgersRivalry(e: UnifiedEvent): boolean {
  const blob = teamBlob(e);
  return /\bpadres\b/.test(blob) && /\bdodgers\b/.test(blob);
}

/** Live branded plates (both 200 on production). Feed-45 files are byte aliases. */
export const PADRES_HOME_PLATE = '/promos/event-padres-home.jpg';
export const PADRES_HOME_FEED_ALIAS = '/promos/event-padres-home-feed-45.jpg';
export const PADRES_RIVAL_PLATE = '/promos/event-padres-dodgers.jpg';
export const PADRES_RIVAL_FEED_ALIAS = '/promos/event-padres-rival-feed-45.jpg';

/**
 * Padres Google/Feed media. Rival plate only vs Dodgers; Petco/home and every
 * other Padres game use the home plate that already 200s. Do not invent
 * story-916 / away / big-series URLs — those 404 on the live site.
 */
export function padresEventMedia(e: UnifiedEvent): string | undefined {
  if (!isPadres(e)) return undefined;
  if (isDodgersRivalry(e)) return PADRES_RIVAL_PLATE;
  return PADRES_HOME_PLATE;
}

/** Teams whose every game becomes a Google Event (league-scoped below). */
const GOOGLE_EVENT_TEAMS = new Set(['San Diego Padres', 'Los Angeles Chargers']);

function isUsaOrMexicoWC(e: UnifiedEvent): boolean {
  if (e.league !== 'WORLDCUP') return false;
  const names = `${e.homeTeam ?? ''}|${e.awayTeam ?? ''}`.toLowerCase();
  return /\b(usa|united states|mexico)\b/.test(names);
}

function isGoogleEventTeamGame(e: UnifiedEvent): boolean {
  return (!!e.homeTeam && GOOGLE_EVENT_TEAMS.has(e.homeTeam)) ||
    (!!e.awayTeam && GOOGLE_EVENT_TEAMS.has(e.awayTeam));
}

function isGoogleEvent(e: UnifiedEvent): boolean {
  return isUsaOrMexicoWC(e) || isGoogleEventTeamGame(e) || isMondayNight(e);
}

/** PT calendar parts of an ISO timestamp. */
function ptParts(iso: string): { ymd: string; weekday: string; dateLabel: string; timeLabel: string } {
  const d = new Date(iso);
  const f = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', ...opts }).format(d);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return {
    ymd: `${get('year')}-${get('month')}-${get('day')}`,
    weekday: f({ weekday: 'short' }),
    dateLabel: f({ month: 'short', day: 'numeric', year: 'numeric' }),
    timeLabel: f({ hour: 'numeric', minute: '2-digit', hour12: true }),
  };
}

function matchup(e: UnifiedEvent): string {
  return e.awayTeam && e.homeTeam ? `${e.awayTeam} vs ${e.homeTeam}` : e.eventTitle;
}

function isChargers(e: UnifiedEvent): boolean {
  return e.homeTeam === 'Los Angeles Chargers' || e.awayTeam === 'Los Angeles Chargers';
}

/** First-match registry entry for a curated Google Event still. */
export interface EventPosterPlate {
  league?: string;
  /** Case-insensitive substring of the away team name. */
  awayIncludes?: string;
  /** Case-insensitive substring of the home team name. */
  homeIncludes?: string;
  /** Case-insensitive substring of either team name. */
  anyTeamIncludes?: string;
  media: string;
}

/**
 * Future /gameday/ plates win when registered here (first match).
 * Example once an MLB plate ships:
 * `{ league: 'MLB', awayIncludes: 'Dodgers', homeIncludes: 'Padres', media: '/gameday/mlb/dodgers-at-padres-feed-45.jpg' }`
 * Do not register NFL Week 3 live-post plates — those stay on the manual sheet path.
 */
export const GAMEDAY_EVENT_PLATES: EventPosterPlate[] = [
  // Future matchup-specific /gameday/mlb/… plates win when added here.
  // Current Padres FINALS live in STATIC_EVENT_PLATES as /promos/event-padres-*.jpg.
];

const STATIC_EVENT_PLATES: EventPosterPlate[] = [
  { league: 'MLB', awayIncludes: 'Dodgers', homeIncludes: 'Padres', media: PADRES_RIVAL_PLATE },
  { league: 'MLB', awayIncludes: 'Padres', homeIncludes: 'Dodgers', media: PADRES_RIVAL_PLATE },
  { league: 'MLB', anyTeamIncludes: 'Padres', media: PADRES_HOME_PLATE },
];

const CHARGERS_FALLBACK = '/promos/nfl-sunday-4x5.jpg';

function plateMatches(e: UnifiedEvent, plate: EventPosterPlate): boolean {
  if (plate.league && e.league !== plate.league) return false;
  const away = (e.awayTeam ?? '').toLowerCase();
  const home = (e.homeTeam ?? '').toLowerCase();
  if (plate.awayIncludes && !away.includes(plate.awayIncludes.toLowerCase())) return false;
  if (plate.homeIncludes && !home.includes(plate.homeIncludes.toLowerCase())) return false;
  if (plate.anyTeamIncludes) {
    const needle = plate.anyTeamIncludes.toLowerCase();
    if (!away.includes(needle) && !home.includes(needle)) return false;
  }
  return true;
}

function firstMatchingPlate(e: UnifiedEvent, plates: EventPosterPlate[]): string | undefined {
  return plates.find((p) => plateMatches(e, p))?.media;
}

function ogEventPoster(e: UnifiedEvent, when: string, ratio: '9x16' | '4x5' = '9x16'): string {
  const q = new URLSearchParams();
  if (e.awayTeam) q.set('away', e.awayTeam);
  if (e.homeTeam) q.set('home', e.homeTeam);
  if (e.awayLogo) q.set('aw', e.awayLogo);
  if (e.homeLogo) q.set('hm', e.homeLogo);
  if (e.league) q.set('league', e.league);
  q.set('title', matchup(e));
  q.set('when', when);
  q.set('ratio', ratio);
  q.set('social', '1');
  return `/api/og/event?${q.toString()}`;
}

/**
 * Resolve Google Event media: /gameday/ registry → Padres static plates →
 * other static /promos/ plates → Chargers fallback → OG event card
 * (WC / Monday Night only). Padres never fall through to /api/og/event.
 */
export function resolveEventPoster(
  e: UnifiedEvent,
  when: string,
  gamedayPlates: EventPosterPlate[] = GAMEDAY_EVENT_PLATES,
  ratio: '9x16' | '4x5' = '9x16',
): string {
  const gameday = firstMatchingPlate(e, gamedayPlates);
  if (gameday) return gameday;
  const padres = padresEventMedia(e);
  if (padres) return padres;
  const still = firstMatchingPlate(e, STATIC_EVENT_PLATES);
  if (still) return still;
  if (isChargers(e)) return CHARGERS_FALLBACK;
  return ogEventPoster(e, when, ratio);
}

function eventPoster(e: UnifiedEvent, when: string, ratio: '9x16' | '4x5' = '9x16'): string {
  return resolveEventPoster(e, when, GAMEDAY_EVENT_PLATES, ratio);
}

function googleEventPromo(e: UnifiedEvent): CuratedPromo {
  const start = ptParts(e.eventTimestamp);
  const end = new Date(new Date(e.eventTimestamp).getTime() + EVENT_DURATION_MS).toISOString();
  const m = matchup(e);
  const headline = `${m} — Watch at Heroes`;
  const franks = isPadres(e) ? ` ${FRIAR_FRANK_PUSH}` : '';
  const caption = `Catch ${m} at American Heroes & Brew — 16 TVs, full bar, Carlsbad Village. Kickoff ${start.timeLabel}.${franks}`;
  return {
    postType: 'google-event',
    key: `gevt-${e.id}`,
    date: start.dateLabel,
    time: EVENT_POST_TIME,
    channel: 'Google',
    media: eventPoster(e, `${start.weekday} ${start.timeLabel}`),
    headline,
    caption,
    storyCaption: caption,
    tags: TAGS,
    eventStart: e.eventTimestamp,
    eventEnd: end,
    league: e.league ?? '',
    // Local-team (Padres/Chargers) Events auto-post; Monday-Night/other Events keep the manual gate.
    autoApprove: isGoogleEventTeamGame(e),
  };
}

/**
 * Pure curation: turn a fetched event list into curated promo rows. Separated from
 * the fetch so it can be unit-tested with fixtures (the 7-day window is already
 * applied by getAllEvents before this runs).
 */
export function curatePromos(events: UnifiedEvent[]): CuratedPromo[] {
  const out: CuratedPromo[] = [];

  // Games post ONLY as Google Events (with a start + end time). No schedule/lineup
  // Story posters, no game feed posters — one Google Event per qualifying game.
  for (const e of events) {
    if (e.eventType === 'SPORTS' && isGoogleEvent(e)) out.push(googleEventPromo(e));
  }

  return out;
}

/** Fetch the live 7-day schedule and curate it. */
export async function getCuratedPromos(): Promise<CuratedPromo[]> {
  const events = await getAllEvents();
  return curatePromos(events);
}
