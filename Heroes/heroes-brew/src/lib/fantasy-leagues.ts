import { LEAGUE_CAPACITY } from './fantasy';

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
 * those are revealed only after a validated signup).
 *
 * On failure (env unset or endpoint unreachable) this returns [] — NOT the bundled
 * OFFICIAL_LEAGUES. The bundled ids are date tokens ('aug28-fri') that don't match
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
  return [];
}
