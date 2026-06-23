import { OFFICIAL_LEAGUES, type OfficialLeague } from './fantasy';

export interface LeagueAvailability extends OfficialLeague {
  count: number;
  spotsLeft: number;
  full: boolean;
}

/**
 * Per-league signup counts for the official Heroes leagues. Read from the Google
 * Sheet via an Apps Script GET endpoint (env FANTASY_COUNTS_URL) that returns a
 * JSON map { "YYYY-MM-DD": <joinCount> }. When unset or unreachable, every league
 * shows fully open (count 0) — the page still works, it just can't show fill yet.
 */
export async function getLeagueAvailability(): Promise<LeagueAvailability[]> {
  let counts: Record<string, number> = {};
  const url = process.env.FANTASY_COUNTS_URL;
  if (url) {
    try {
      const res = await fetch(url, { next: { revalidate: 120 } });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') counts = data as Record<string, number>;
      }
    } catch {
      /* fall back to all-open */
    }
  }
  return OFFICIAL_LEAGUES.map((l) => {
    const count = Math.max(0, Math.min(l.capacity, Number(counts[l.id]) || 0));
    const spotsLeft = Math.max(0, l.capacity - count);
    return { ...l, count, spotsLeft, full: spotsLeft <= 0 };
  });
}
