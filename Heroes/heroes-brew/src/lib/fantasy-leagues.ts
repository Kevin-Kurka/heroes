import { OFFICIAL_LEAGUES, LEAGUE_CAPACITY, type OfficialLeague } from './fantasy';

export interface LeagueAvailability {
  id: string;        // the League Name from the Leagues tab (key for joins/counts)
  label: string;     // formatted draft date, e.g. "Fri, Aug 28"
  time?: string;     // e.g. "4:00 PM"
  capacity: number;
  count: number;
  spotsLeft: number;
  full: boolean;
}

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

/**
 * Official Heroes league availability — sourced from the Sheet's "Leagues" tab
 * via the Apps Script GET (env FANTASY_COUNTS_URL), which returns
 * [{name, dateLabel, time, capacity, count, spotsLeft, full}] (NO share links —
 * those are revealed only after a validated signup). Falls back to the bundled
 * OFFICIAL_LEAGUES (all open) if the endpoint is unset or unreachable.
 */
export async function getLeagueAvailability(): Promise<LeagueAvailability[]> {
  const url = process.env.FANTASY_COUNTS_URL;
  if (url) {
    try {
      const res = await fetch(url, { next: { revalidate: 120 } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          return data.map((l: Record<string, unknown>) => {
            const capacity = Number(l.capacity) || LEAGUE_CAPACITY;
            const count = Math.max(0, Math.min(capacity, Number(l.count) || 0));
            const spotsLeft = Math.max(0, capacity - count);
            const time = String(l.time || '').trim();
            return {
              id: String(l.name),
              label: fmtDate(String(l.dateLabel || '')),
              time: time || undefined,
              capacity,
              count,
              spotsLeft,
              full: spotsLeft <= 0,
            };
          });
        }
      }
    } catch {
      /* fall back */
    }
  }
  return OFFICIAL_LEAGUES.map((l: OfficialLeague) => ({
    id: l.id,
    label: l.label,
    time: l.time,
    capacity: l.capacity,
    count: 0,
    spotsLeft: l.capacity,
    full: false,
  }));
}
