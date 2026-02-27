import { UnifiedEvent, SportLeague } from '@/types';

// San Diego / SoCal area teams to highlight
const SD_TEAMS = new Set([
  // MLB
  'San Diego Padres',
  // NFL
  'Los Angeles Chargers',
  // NBA
  'LA Clippers',
  'Los Angeles Clippers',
]);

function isLocalTeam(name?: string): boolean {
  return !!name && SD_TEAMS.has(name);
}

// =====================
// MLB - All games for the week
// =====================
async function fetchMLBGames(): Promise<UnifiedEvent[]> {
  try {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 7);

    const startStr = today.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const res = await fetch(
      `https://statsapi.mlb.com/api/v1/schedule?sportId=1&startDate=${startStr}&endDate=${endStr}&hydrate=team`,
      { next: { revalidate: 900 } }
    );
    if (!res.ok) throw new Error(`MLB API: ${res.status}`);
    const data = await res.json();

    const events: UnifiedEvent[] = [];
    for (const date of data.dates || []) {
      for (const game of date.games || []) {
        const home = game.teams?.home?.team?.name || 'Home';
        const away = game.teams?.away?.team?.name || 'Away';
        events.push({
          id: `mlb-${game.gamePk}`,
          eventTimestamp: game.gameDate,
          eventTitle: `${away} @ ${home}`,
          eventType: 'SPORTS',
          league: 'MLB',
          displayMessage: `Catch ${away} vs ${home} live on our big screens!`,
          venue: game.venue?.name,
          homeTeam: home,
          awayTeam: away,
          status: game.status?.detailedState || 'Scheduled',
          isLive: game.status?.detailedState === 'In Progress',
          highlighted: isLocalTeam(home) || isLocalTeam(away),
        });
      }
    }
    return events;
  } catch (err) {
    console.error('MLB fetch error:', err);
    return [];
  }
}

// =====================
// NFL - Using ESPN public API
// =====================
async function fetchNFLGames(): Promise<UnifiedEvent[]> {
  return fetchESPNGames('football/nfl', 'NFL');
}

// =====================
// NBA - Using ESPN public API
// =====================
async function fetchNBAGames(): Promise<UnifiedEvent[]> {
  return fetchESPNGames('basketball/nba', 'NBA');
}

async function fetchESPNGames(sport: string, league: SportLeague): Promise<UnifiedEvent[]> {
  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${sport}/scoreboard`,
      { next: { revalidate: 900 } }
    );
    if (!res.ok) throw new Error(`ESPN ${league} API: ${res.status}`);
    const data = await res.json();

    const events: UnifiedEvent[] = [];
    for (const event of data.events || []) {
      const comp = event.competitions?.[0];
      const homeComp = comp?.competitors?.find((c: Record<string, unknown>) => c.homeAway === 'home');
      const awayComp = comp?.competitors?.find((c: Record<string, unknown>) => c.homeAway === 'away');
      const home = homeComp?.team?.displayName || 'Home';
      const away = awayComp?.team?.displayName || 'Away';

      events.push({
        id: `${league.toLowerCase()}-${event.id}`,
        eventTimestamp: event.date,
        eventTitle: `${away} @ ${home}`,
        eventType: 'SPORTS',
        league,
        displayMessage: `Watch ${away} vs ${home} here at Heroes!`,
        venue: comp?.venue?.fullName,
        homeTeam: home,
        awayTeam: away,
        homeScore: homeComp?.score ? parseInt(homeComp.score) : undefined,
        awayScore: awayComp?.score ? parseInt(awayComp.score) : undefined,
        status: event.status?.type?.detail || 'Scheduled',
        isLive: event.status?.type?.state === 'in',
        highlighted: isLocalTeam(home) || isLocalTeam(away),
      });
    }
    return events;
  } catch (err) {
    console.error(`${league} fetch error:`, err);
    return [];
  }
}

// =====================
// Holidays
// =====================
async function fetchHolidays(): Promise<UnifiedEvent[]> {
  try {
    const year = new Date().getFullYear();
    const res = await fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/US`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) throw new Error(`Holiday API: ${res.status}`);
    const data = await res.json();

    const today = new Date();
    const twoWeeksOut = new Date(today);
    twoWeeksOut.setDate(today.getDate() + 14);

    return (data as Record<string, unknown>[])
      .filter((h) => {
        const d = new Date(h.date as string);
        return d >= today && d <= twoWeeksOut;
      })
      .map((h) => ({
        id: `holiday-${h.date}`,
        eventTimestamp: new Date(h.date as string).toISOString(),
        eventTitle: h.localName as string || h.name as string,
        eventType: 'HOLIDAY' as const,
        displayMessage: `Celebrate ${h.localName || h.name} with us! Special menu & drinks.`,
      }));
  } catch (err) {
    console.error('Holiday fetch error:', err);
    return [];
  }
}

// =====================
// Unified fetch
// =====================
export async function getAllEvents(): Promise<UnifiedEvent[]> {
  const [mlb, nfl, nba, holidays] = await Promise.all([
    fetchMLBGames(),
    fetchNFLGames(),
    fetchNBAGames(),
    fetchHolidays(),
  ]);

  const all = [...mlb, ...nfl, ...nba, ...holidays];
  all.sort((a, b) => new Date(a.eventTimestamp).getTime() - new Date(b.eventTimestamp).getTime());
  return all;
}

export async function getUpcomingEvents(limit = 5): Promise<UnifiedEvent[]> {
  const events = await getAllEvents();
  const now = new Date();
  return events
    .filter(e => new Date(e.eventTimestamp) >= now || e.isLive)
    .slice(0, limit);
}
