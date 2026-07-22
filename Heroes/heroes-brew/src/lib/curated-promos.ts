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
const STORY_POST_TIME = '9:00 AM';
const FEED_POST_TIME = '11:00 AM';
const EVENT_DURATION_MS = 2.5 * 60 * 60 * 1000;

/** The Padres game-day special, pushed on every Padres post. */
const FRIAR_FRANK_PUSH = 'Friar Franks $6 + $2 off Heroes drafts all game. 🌭🍺';

function isPadres(e: UnifiedEvent): boolean {
  return e.homeTeam === 'San Diego Padres' || e.awayTeam === 'San Diego Padres';
}

/** Teams whose every game becomes a Google Event (league-scoped below). */
const GOOGLE_EVENT_TEAMS = new Set(['San Diego Padres', 'Los Angeles Chargers']);

/** Teams whose HOME games are "biggest" and also earn an IG feed post. */
const FEED_HOME_TEAMS = new Set(['San Diego Padres', 'Los Angeles Chargers']);

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

/**
 * "Biggest" games that also earn an Instagram FEED post (matchup poster to the grid):
 * USA/Mexico World Cup games and Padres/Chargers HOME games. Narrower than isGoogleEvent
 * — Monday-Night and away games stay Event+Story only, to keep the feed from flooding.
 */
function isBiggestGame(e: UnifiedEvent): boolean {
  return isUsaOrMexicoWC(e) || (!!e.homeTeam && FEED_HOME_TEAMS.has(e.homeTeam));
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

function eventPoster(e: UnifiedEvent, when: string, ratio: '9x16' | '4x5' = '9x16'): string {
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

function feedPostPromo(e: UnifiedEvent): CuratedPromo {
  const start = ptParts(e.eventTimestamp);
  const m = matchup(e);
  return {
    postType: 'feed-post',
    key: `feed-${e.id}`,
    date: start.dateLabel,
    time: FEED_POST_TIME,
    channel: 'Feed',
    media: eventPoster(e, `${start.weekday} ${start.timeLabel}`, '4x5'),
    headline: `${m} — Game Day at Heroes`,
    caption: `Big one today: ${m}. Catch every minute at American Heroes & Brew — 16 TVs, full bar, ice-cold beer, Carlsbad Village. First pitch/kickoff ${start.timeLabel}.${isPadres(e) ? ` ${FRIAR_FRANK_PUSH}` : ''} 🇺🇸🍻`,
    storyCaption: '',
    tags: TAGS,
    league: e.league ?? '',
    // Padres/Chargers home matchups auto-post to the grid; other biggest games (WC) stay manual.
    autoApprove: isGoogleEventTeamGame(e),
  };
}

/**
 * The daily "Today at Heroes" lineup — one poster per game-day listing every game
 * on the TVs, posted to BOTH the IG Story and Google. Auto-approves (schedule-story).
 * On Padres days it carries the Friar Frank push and leads with the Padres game.
 */
function dailyLineupPromo(ymd: string, dateLabel: string, hasPadres: boolean): CuratedPromo {
  const franksCap = hasPadres ? ` Padres today — ${FRIAR_FRANK_PUSH}` : '';
  const franksStory = hasPadres ? ' Padres today — Friar Franks $6! 🌭' : '';
  return {
    postType: 'schedule-story',
    key: `sched-ALL-${ymd}`,
    date: dateLabel,
    time: STORY_POST_TIME,
    channel: 'Story, Google',
    media: `/api/og/schedule?league=ALL&date=${ymd}`,
    headline: hasPadres ? 'Padres Game Day at Heroes' : "Today's Lineup at Heroes",
    caption: `Today's lineup at American Heroes & Brew — every game, every screen. 16 TVs, full bar, Carlsbad Village.${franksCap} 🍻`,
    storyCaption: `Today's lineup on every screen 🍻 Carlsbad Village.${franksStory}`,
    tags: TAGS,
    league: 'ALL',
    autoApprove: true,
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

  // IG Feed posts: only the biggest games (USA/Mexico WC, Padres/Chargers home).
  for (const e of events) {
    if (e.eventType === 'SPORTS' && isBiggestGame(e)) out.push(feedPostPromo(e));
  }

  // Daily lineup Story + Google: one poster per game-day (any sport on the TVs),
  // leading with — and pushing Friar Frank on — Padres days.
  const gameDays = new Map<string, { label: string; padres: boolean }>();
  for (const e of events) {
    if (e.eventType !== 'SPORTS') continue;
    const p = ptParts(e.eventTimestamp);
    const cur = gameDays.get(p.ymd) ?? { label: p.dateLabel, padres: false };
    if (isPadres(e)) cur.padres = true;
    gameDays.set(p.ymd, cur);
  }
  for (const [ymd, info] of gameDays) out.push(dailyLineupPromo(ymd, info.label, info.padres));

  return out;
}

/** Fetch the live 7-day schedule and curate it. */
export async function getCuratedPromos(): Promise<CuratedPromo[]> {
  const events = await getAllEvents();
  return curatePromos(events);
}
