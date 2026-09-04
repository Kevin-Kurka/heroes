/**
 * FILE: fantasy-leagues.ts
 * PURPOSE: Live official Heroes league availability for /fantasy-football.
 *
 * OVERVIEW:
 * Fetches the Apps Script GET (FANTASY_COUNTS_URL) and maps sheet rows into
 * LeagueAvailability. Past draft datetimes are dropped in America/Los_Angeles
 * so the Join form and open-spot total only reflect upcoming leagues.
 *
 * DEPENDENCIES:
 * - ./fantasy.ts (LEAGUE_CAPACITY)
 * - process.env.FANTASY_COUNTS_URL
 *
 * EXPORTS:
 * - LeagueAvailability
 * - isUpcomingDraft
 * - filterUpcomingLeagues
 * - getLeagueAvailability
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Sheet fetch + mapping
 * - ✅ Past-draft filter in America/Los_Angeles
 * - ❌ Does not invent signup counts when the endpoint is down (returns [])
 *
 * RELATED FILES:
 * - src/lib/fantasy.ts
 * - src/lib/fantasy-leagues.test.ts
 * - docs/fantasy-football-signup-setup.md
 *
 * LAST UPDATED: 2026-09-04
 * MAINTAINER: American Heroes & Brew
 */
import { LEAGUE_CAPACITY } from './fantasy';

export interface LeagueAvailability {
  id: string;        // the League Name from the Leagues tab (key for joins/counts)
  label: string;     // formatted draft date, e.g. "Fri, Sep 4"
  time?: string;     // e.g. "4:00 PM"
  capacity: number;
  count: number;
  spotsLeft: number;
  full: boolean;
}

const DRAFT_TZ = 'America/Los_Angeles';

const MONTHS: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

type WallClock = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

/** Format a sheet date like "8/28/26" → "Fri, Aug 28". Returns input unchanged if unparseable. */
function fmtDate(s: string): string {
  const m = String(s).match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return s;
  let y = parseInt(m[3], 10);
  if (y < 100) y += 2000;
  const dt = new Date(y, parseInt(m[1], 10) - 1, parseInt(m[2], 10));
  if (isNaN(dt.getTime())) return s;
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function pacificWallClock(now: Date): WallClock {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: DRAFT_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '0';
  let hour = parseInt(get('hour'), 10);
  if (hour === 24) hour = 0;
  return {
    year: parseInt(get('year'), 10),
    month: parseInt(get('month'), 10),
    day: parseInt(get('day'), 10),
    hour,
    minute: parseInt(get('minute'), 10),
    second: parseInt(get('second'), 10),
  };
}

function parseDraftTime(time?: string): { hour: number; minute: number; second: number } | null {
  const t = String(time || '').trim();
  if (!t) return null;
  const m = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  const minute = parseInt(m[2] ?? '0', 10);
  const meridiem = m[3].toUpperCase();
  if (meridiem === 'PM' && hour !== 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;
  return { hour, minute, second: 0 };
}

function parseDraftDate(dateLabel: string, now: Date): { year: number; month: number; day: number } | null {
  const s = String(dateLabel || '').trim();
  if (!s) return null;

  const slash = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (slash) {
    let year = parseInt(slash[3], 10);
    if (year < 100) year += 2000;
    return { year, month: parseInt(slash[1], 10), day: parseInt(slash[2], 10) };
  }

  const named = s.match(
    /(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\w*,?\s+)?(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{2,4}))?/i,
  );
  if (!named) return null;
  const month = MONTHS[named[1].toLowerCase()];
  if (!month) return null;
  const day = parseInt(named[2], 10);
  let year = named[3] ? parseInt(named[3], 10) : pacificWallClock(now).year;
  if (year < 100) year += 2000;
  return { year, month, day };
}

function compareWall(a: WallClock, b: WallClock): number {
  return (
    a.year - b.year ||
    a.month - b.month ||
    a.day - b.day ||
    a.hour - b.hour ||
    a.minute - b.minute ||
    a.second - b.second
  );
}

/** True when the draft datetime is still upcoming in America/Los_Angeles. */
export function isUpcomingDraft(
  dateLabel: string,
  time?: string,
  now: Date = new Date(),
): boolean {
  const date = parseDraftDate(dateLabel, now);
  if (!date) return true;
  const parsedTime = parseDraftTime(time);
  const draft: WallClock = parsedTime
    ? { ...date, ...parsedTime }
    : { ...date, hour: 23, minute: 59, second: 59 };
  return compareWall(draft, pacificWallClock(now)) >= 0;
}

export function filterUpcomingLeagues<T extends { label: string; time?: string }>(
  leagues: T[],
  now: Date = new Date(),
): T[] {
  return leagues.filter((league) => isUpcomingDraft(league.label, league.time, now));
}

/**
 * Official Heroes league availability — sourced from the Sheet's "Leagues" tab
 * via the Apps Script GET (env FANTASY_COUNTS_URL), which returns
 * [{name, dateLabel, time, capacity, count, spotsLeft, full}] (NO share links —
 * those are revealed only after a validated signup).
 *
 * After mapping, leagues whose draft datetime is already past in
 * America/Los_Angeles are dropped so open-spot totals exclude completed drafts.
 *
 * On failure (env unset or endpoint unreachable) this returns [] — NOT the bundled
 * OFFICIAL_LEAGUES. The bundled ids are date tokens ('sep04-3pm') that don't match
 * the Sheet's league names, so a join made against them is always rejected by the
 * Apps Script. Rendering an empty list makes the Join form show its graceful
 * "reach out to us" state instead of an unjoinable form. The page is force-dynamic,
 * so a transient failure self-heals on the next request rather than being cached.
 */
export async function getLeagueAvailability(): Promise<LeagueAvailability[]> {
  const url = process.env.FANTASY_COUNTS_URL;
  if (url) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          const mapped = data.map((l: Record<string, unknown>) => {
            const capacity = Number(l.capacity) || LEAGUE_CAPACITY;
            const count = Math.max(0, Math.min(capacity, Number(l.count) || 0));
            const spotsLeft = Math.max(0, capacity - count);
            const time = String(l.time || '').trim();
            const dateLabel = String(l.dateLabel || '');
            return {
              id: String(l.name),
              label: fmtDate(dateLabel),
              time: time || undefined,
              capacity,
              count,
              spotsLeft,
              full: spotsLeft <= 0,
            };
          });
          // Prefer the raw sheet dateLabel (keeps the year) when filtering.
          return mapped.filter((league, idx) => {
            const raw = String(data[idx]?.dateLabel || '');
            return isUpcomingDraft(raw || league.label, league.time);
          });
        }
      }
    } catch {
      /* fall back */
    }
  }
  return [];
}
