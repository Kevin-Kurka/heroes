import type { UnifiedEvent } from '@/types';
import { getAllEvents, isMondayNight } from './events';

export type PromoPostType = 'google-event' | 'schedule-story';

export interface CuratedPromo {
  /** Post classification. */
  postType: PromoPostType;
  /** Stable dedup key written into the sheet's Notes cell. */
  key: string;
  /** Sheet "Post Date" (e.g. "Jun 29, 2026"). */
  date: string;
  /** Sheet "Post Time" (e.g. "10:00 AM"). */
  time: string;
  channel: 'Google' | 'Story';
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
}

const TAGS = '#AmericanHeroesAndBrew #CarlsbadVillage #SportsBar';
const EVENT_POST_TIME = '10:00 AM';
const STORY_POST_TIME = '9:00 AM';
const EVENT_DURATION_MS = 2.5 * 60 * 60 * 1000;

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

function eventPoster(e: UnifiedEvent, when: string): string {
  const q = new URLSearchParams();
  if (e.awayTeam) q.set('away', e.awayTeam);
  if (e.homeTeam) q.set('home', e.homeTeam);
  if (e.awayLogo) q.set('aw', e.awayLogo);
  if (e.homeLogo) q.set('hm', e.homeLogo);
  if (e.league) q.set('league', e.league);
  q.set('title', matchup(e));
  q.set('when', when);
  q.set('ratio', '9x16');
  q.set('social', '1');
  return `/api/og/event?${q.toString()}`;
}

function googleEventPromo(e: UnifiedEvent): CuratedPromo {
  const start = ptParts(e.eventTimestamp);
  const end = new Date(new Date(e.eventTimestamp).getTime() + EVENT_DURATION_MS).toISOString();
  const m = matchup(e);
  const headline = `${m} — Watch at Heroes`;
  const caption = `Catch ${m} at American Heroes & Brew — 16 TVs, full bar, Carlsbad Village. Kickoff ${start.timeLabel}.`;
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
  };
}

function scheduleStoryPromo(league: 'WORLDCUP' | 'NFL', ymd: string, dateLabel: string): CuratedPromo {
  const code = league === 'WORLDCUP' ? 'WC' : 'NFL';
  const label = league === 'WORLDCUP' ? "Today's World Cup slate" : "Today's NFL slate";
  return {
    postType: 'schedule-story',
    key: `sched-${code}-${ymd}`,
    date: dateLabel,
    time: STORY_POST_TIME,
    channel: 'Story',
    media: `/api/og/schedule?league=${code}&date=${ymd}`,
    headline: '',
    caption: `${label} — every game on at American Heroes & Brew. 🍻`,
    storyCaption: `${label} on every screen 🍻 Carlsbad Village.`,
    tags: TAGS,
    league,
  };
}

/**
 * Pure curation: turn a fetched event list into curated promo rows. Separated from
 * the fetch so it can be unit-tested with fixtures (the 7-day window is already
 * applied by getAllEvents before this runs).
 */
export function curatePromos(events: UnifiedEvent[]): CuratedPromo[] {
  const out: CuratedPromo[] = [];

  // Google Events: one per qualifying game.
  for (const e of events) {
    if (e.eventType === 'SPORTS' && isGoogleEvent(e)) out.push(googleEventPromo(e));
  }

  // Schedule Stories: one per WC game-day, one per Sunday with NFL games.
  const wcDays = new Map<string, string>(); // ymd -> dateLabel
  const nflSundays = new Map<string, string>();
  for (const e of events) {
    if (e.eventType !== 'SPORTS') continue;
    const p = ptParts(e.eventTimestamp);
    if (e.league === 'WORLDCUP') wcDays.set(p.ymd, p.dateLabel);
    if (e.league === 'NFL' && p.weekday === 'Sun') nflSundays.set(p.ymd, p.dateLabel);
  }
  for (const [ymd, label] of wcDays) out.push(scheduleStoryPromo('WORLDCUP', ymd, label));
  for (const [ymd, label] of nflSundays) out.push(scheduleStoryPromo('NFL', ymd, label));

  return out;
}

/** Fetch the live 7-day schedule and curate it. */
export async function getCuratedPromos(): Promise<CuratedPromo[]> {
  const events = await getAllEvents();
  return curatePromos(events);
}
