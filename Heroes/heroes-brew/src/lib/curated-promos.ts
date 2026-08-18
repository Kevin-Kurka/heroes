import type { UnifiedEvent } from '@/types';
import { getAllEvents } from './events';

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
   * True for Padres matchup Events and in-season NFL gameday Events.
   */
  autoApprove: boolean;
}

const TAGS = '#AmericanHeroesAndBrew #CarlsbadVillage #SportsBar';
const EVENT_POST_TIME = '10:00 AM';
const NFL_POST_TIME = '9:00 AM';
const EVENT_DURATION_MS = 2.5 * 60 * 60 * 1000;
const TZ = 'America/Los_Angeles';

/** Inclusive PT calendar window for 2026 regular-season NFL gameday Events. */
const NFL_SEASON_START = '2026-09-09';
const NFL_SEASON_END = '2027-01-10';

interface NflDaySpec {
  weekday: 'Sun' | 'Mon' | 'Thu' | 'Wed';
  headline: string;
  startH: number;
  endH: number;
  title: string;
}

const NFL_DAYS: Record<string, NflDaySpec> = {
  Sun: { weekday: 'Sun', headline: 'NFL Sunday at Heroes — Every Game, 16 TVs', startH: 9, endH: 20, title: 'NFL SUNDAY' },
  Thu: { weekday: 'Thu', headline: 'Thursday Night Football at Heroes', startH: 17, endH: 21, title: 'THURSDAY NIGHT FOOTBALL' },
  Mon: { weekday: 'Mon', headline: 'Monday Night Football at Heroes', startH: 17, endH: 21, title: 'MONDAY NIGHT FOOTBALL' },
};

/** Dated exceptions from the official 2026 NFL schedule (nfl.com). */
const NFL_SPECIAL_DAYS: Record<string, NflDaySpec> = {
  '2026-09-09': {
    weekday: 'Wed',
    headline: 'NFL Kickoff Night at Heroes — Patriots vs Seahawks',
    startH: 16,
    endH: 21,
    title: 'NFL KICKOFF NIGHT',
  },
  '2026-11-26': {
    weekday: 'Thu',
    headline: 'Thanksgiving Football at Heroes — All Three Games',
    startH: 9,
    endH: 20,
    title: 'THANKSGIVING FOOTBALL',
  },
};

/** The Padres game-day special, pushed on every Padres post. */
const FRIAR_FRANK_PUSH = 'Friar Franks $6 + $2 off Heroes drafts all game. 🌭🍺';

function isPadres(e: UnifiedEvent): boolean {
  return e.homeTeam === 'San Diego Padres' || e.awayTeam === 'San Diego Padres';
}

/** Teams whose every game becomes a Google Event outside the NFL gameday collapse. */
const GOOGLE_EVENT_TEAMS = new Set(['San Diego Padres', 'Los Angeles Chargers']);

function isGoogleEventTeamGame(e: UnifiedEvent): boolean {
  return (!!e.homeTeam && GOOGLE_EVENT_TEAMS.has(e.homeTeam)) ||
    (!!e.awayTeam && GOOGLE_EVENT_TEAMS.has(e.awayTeam));
}

/** Matchup-level Events only — NFL regular-season days use gnfl- instead. */
function isMatchupGoogleEvent(e: UnifiedEvent): boolean {
  return isGoogleEventTeamGame(e);
}

/** PT calendar parts of an ISO timestamp. */
function ptParts(iso: string): { ymd: string; weekday: string; dateLabel: string; timeLabel: string } {
  const d = new Date(iso);
  const f = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-US', { timeZone: TZ, ...opts }).format(d);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return {
    ymd: `${get('year')}-${get('month')}-${get('day')}`,
    weekday: f({ weekday: 'short' }),
    dateLabel: f({ month: 'short', day: 'numeric', year: 'numeric' }),
    timeLabel: f({ hour: 'numeric', minute: '2-digit', hour12: true }),
  };
}

/**
 * ISO-8601 timestamp for a Pacific wall-clock hour on a PT calendar day.
 * Derives -07:00 / -08:00 from America/Los_Angeles (do not hardcode DST).
 */
export function ptIso(ymd: string, hour: number): string {
  const [year, month, day] = ymd.split('-').map(Number);
  for (const offsetH of [7, 8]) {
    const instant = new Date(Date.UTC(year, month - 1, day, hour + offsetH, 0, 0));
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hour12: false,
    }).formatToParts(instant);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
    const hourPart = get('hour') === '24' ? '00' : get('hour');
    if (`${get('year')}-${get('month')}-${get('day')}` === ymd && Number(hourPart) === hour) {
      return `${ymd}T${String(hour).padStart(2, '0')}:00:00-${String(offsetH).padStart(2, '0')}:00`;
    }
  }
  throw new Error(`ptIso: could not resolve ${ymd} ${hour}:00 PT`);
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
    autoApprove: isGoogleEventTeamGame(e),
  };
}

function slateLine(games: UnifiedEvent[]): string {
  const priority = new Set(['Los Angeles Chargers']);
  const sorted = [...games].sort((a, b) => {
    const aP = priority.has(a.homeTeam ?? '') || priority.has(a.awayTeam ?? '');
    const bP = priority.has(b.homeTeam ?? '') || priority.has(b.awayTeam ?? '');
    if (aP !== bP) return aP ? -1 : 1;
    return new Date(a.eventTimestamp).getTime() - new Date(b.eventTimestamp).getTime();
  });
  const names = sorted.slice(0, 3).map(matchup);
  const more = sorted.length > 3 ? ' and more.' : '.';
  return `${names.join(' · ')}${more}`;
}

function nflDayPromo(ymd: string, games: UnifiedEvent[], spec: NflDaySpec): CuratedPromo {
  const dateLabel = ptParts(games[0].eventTimestamp).dateLabel;
  const title = encodeURIComponent(spec.title);
  const caption =
    `${games.length} games, 16 TVs, full bar. ${slateLine(games)} Every NFL game, every week at American Heroes & Brew — 300 Carlsbad Village Dr, Carlsbad. Grab a table at americanheroesandbrew.com`;
  return {
    postType: 'google-event',
    key: `gnfl-${ymd}`,
    date: dateLabel,
    time: NFL_POST_TIME,
    channel: 'Google',
    media: `/api/og/schedule?league=NFL&date=${ymd}&title=${title}`,
    headline: spec.headline,
    caption,
    storyCaption: '',
    tags: TAGS,
    eventStart: ptIso(ymd, spec.startH),
    eventEnd: ptIso(ymd, spec.endH),
    league: 'NFL',
    autoApprove: true,
  };
}

function nflGamedayPromos(events: UnifiedEvent[]): CuratedPromo[] {
  const byDay = new Map<string, UnifiedEvent[]>();
  for (const e of events) {
    if (e.eventType !== 'SPORTS' || e.league !== 'NFL') continue;
    const { ymd } = ptParts(e.eventTimestamp);
    if (ymd < NFL_SEASON_START || ymd > NFL_SEASON_END) continue;
    const list = byDay.get(ymd) ?? [];
    list.push(e);
    byDay.set(ymd, list);
  }

  const out: CuratedPromo[] = [];
  const seen = new Set<string>();
  for (const [ymd, games] of byDay) {
    if (seen.has(ymd)) continue;
    seen.add(ymd);
    const weekday = ptParts(games[0].eventTimestamp).weekday;
    const spec = NFL_SPECIAL_DAYS[ymd] ?? NFL_DAYS[weekday];
    if (!spec) continue;
    out.push(nflDayPromo(ymd, games, spec));
  }
  return out;
}

/**
 * Pure curation: turn a fetched event list into curated promo rows. Separated from
 * the fetch so it can be unit-tested with fixtures (the 7-day window is already
 * applied by getAllEvents before this runs).
 *
 * NFL regular-season days emit exactly one Google Event (`gnfl-YYYY-MM-DD`).
 * Padres (and off-window Chargers) still emit per-matchup `gevt-` rows.
 */
export function curatePromos(events: UnifiedEvent[]): CuratedPromo[] {
  const dayPromos = nflGamedayPromos(events);
  const nflDayYmds = new Set(dayPromos.map((p) => p.key.slice('gnfl-'.length)));
  const used = new Set(dayPromos.map((p) => p.key));
  const out: CuratedPromo[] = [...dayPromos];

  for (const e of events) {
    if (e.eventType !== 'SPORTS' || !isMatchupGoogleEvent(e)) continue;
    if (e.league === 'NFL' && nflDayYmds.has(ptParts(e.eventTimestamp).ymd)) continue;
    const promo = googleEventPromo(e);
    if (used.has(promo.key)) continue;
    used.add(promo.key);
    out.push(promo);
  }

  return out;
}

/** Fetch the live 7-day schedule and curate it. */
export async function getCuratedPromos(): Promise<CuratedPromo[]> {
  const events = await getAllEvents();
  return curatePromos(events);
}
