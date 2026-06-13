import { UnifiedEvent, SportLeague } from '@/types';

// San Diego / SoCal area teams to highlight
const SD_TEAMS = new Set([
  // MLB
  'San Diego Padres',
  // NFL
  'Los Angeles Chargers',
  'Los Angeles Rams',
  // NBA
  'LA Clippers',
  'Los Angeles Clippers',
  'Los Angeles Lakers',
  // NHL
  'Anaheim Ducks',
  // MLS
  'San Diego FC',
  'LA Galaxy',
  'Los Angeles FC',
  // CFB
  'San Diego State Aztecs',
  'UCLA Bruins',
  'USC Trojans',
]);

function isLocalTeam(name?: string): boolean {
  return !!name && SD_TEAMS.has(name);
}

// =====================
// ESPN scoreboard fetcher (works for all leagues)
// =====================
const ESPN_SPORTS: { sport: string; league: SportLeague }[] = [
  { sport: 'football/nfl', league: 'NFL' },
  { sport: 'basketball/nba', league: 'NBA' },
  { sport: 'hockey/nhl', league: 'NHL' },
  { sport: 'soccer/usa.1', league: 'MLS' },
  { sport: 'soccer/fifa.world', league: 'WORLDCUP' },
  { sport: 'football/college-football', league: 'CFB' },
];

async function fetchESPNScoreboard(sport: string, league: SportLeague): Promise<UnifiedEvent[]> {
  try {
    // Build date range: today through today+7
    const now = new Date();
    const end = new Date(now);
    end.setDate(now.getDate() + 7);
    const fmt = (d: Date) => d.toISOString().split('T')[0].replace(/-/g, '');
    const dates = `${fmt(now)}-${fmt(end)}`;

    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${sport}/scoreboard?dates=${dates}`,
      { cache: 'no-store' }
    );
    if (!res.ok) throw new Error(`ESPN ${league}: ${res.status}`);
    const data = await res.json();

    const events: UnifiedEvent[] = [];
    const isSoccer = sport.startsWith('soccer');
    for (const event of data.events || []) {
      const comp = event.competitions?.[0];
      const homeComp = comp?.competitors?.find((c: Record<string, unknown>) => c.homeAway === 'home');
      const awayComp = comp?.competitors?.find((c: Record<string, unknown>) => c.homeAway === 'away');

      const home = homeComp?.team?.displayName || 'Home';
      const away = awayComp?.team?.displayName || 'Away';
      const homeLogo = homeComp?.team?.logo as string | undefined;
      const awayLogo = awayComp?.team?.logo as string | undefined;

      const statusState = event.status?.type?.state;
      const statusDetail = event.status?.type?.detail || 'Scheduled';
      const isLive = statusState === 'in';
      const isFinal = statusState === 'post';

      // Only parse scores for live/final games — ESPN returns "0" for scheduled games
      const hasScoreData = isLive || isFinal;

      events.push({
        id: `${league.toLowerCase()}-${event.id}`,
        eventTimestamp: event.date,
        eventTitle: isSoccer ? `${away} vs ${home}` : `${away} @ ${home}`,
        eventType: 'SPORTS',
        league,
        displayMessage: isLive
          ? `LIVE NOW at Heroes! ${away} vs ${home}`
          : isFinal
          ? `Final: ${away} vs ${home}`
          : `Watch ${away} vs ${home} here at Heroes!`,
        venue: comp?.venue?.fullName,
        homeTeam: home,
        awayTeam: away,
        homeScore: hasScoreData ? parseInt(homeComp.score as string) : undefined,
        awayScore: hasScoreData ? parseInt(awayComp.score as string) : undefined,
        homeLogo,
        awayLogo,
        status: statusDetail,
        isLive,
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
// MLB - MLB Stats API (more detailed schedule data)
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
      { cache: 'no-store' }
    );
    if (!res.ok) throw new Error(`MLB API: ${res.status}`);
    const data = await res.json();

    const events: UnifiedEvent[] = [];
    for (const date of data.dates || []) {
      for (const game of date.games || []) {
        const home = game.teams?.home?.team?.name || 'Home';
        const away = game.teams?.away?.team?.name || 'Away';
        const homeId = game.teams?.home?.team?.id;
        const awayId = game.teams?.away?.team?.id;
        const homeLogo = homeId ? `https://midfield.mlbstatic.com/v1/team/${homeId}/spots/72` : undefined;
        const awayLogo = awayId ? `https://midfield.mlbstatic.com/v1/team/${awayId}/spots/72` : undefined;
        const detailedState = game.status?.detailedState || '';
        const isLive = detailedState === 'In Progress';
        const isFinal = detailedState === 'Final' || detailedState === 'Game Over';
        const hasScoreData = isLive || isFinal;

        events.push({
          id: `mlb-${game.gamePk}`,
          eventTimestamp: game.gameDate,
          eventTitle: `${away} @ ${home}`,
          eventType: 'SPORTS',
          league: 'MLB',
          displayMessage: isLive
            ? `LIVE NOW at Heroes! ${away} vs ${home}`
            : isFinal
            ? `Final: ${away} vs ${home}`
            : `Catch ${away} vs ${home} live on our big screens!`,
          venue: game.venue?.name,
          homeTeam: home,
          awayTeam: away,
          homeScore: hasScoreData ? game.teams?.home?.score : undefined,
          awayScore: hasScoreData ? game.teams?.away?.score : undefined,
          homeLogo,
          awayLogo,
          status: game.status?.detailedState || 'Scheduled',
          isLive,
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
// Holidays — themed cards for major celebrations
// =====================
interface HolidayDef {
  month: number; // 1-based
  day: number;
  name: string;
  emoji: string;
  theme: string; // Tailwind color base for theming
  message: string;
}

// Fixed-date holidays. Variable-date ones (Easter, Thanksgiving, etc.) are computed below.
const FIXED_HOLIDAYS: HolidayDef[] = [
  { month: 1, day: 1, name: "New Year's Day", emoji: '🎆', theme: 'amber', message: 'Ring in the New Year with craft brews & big screens!' },
  { month: 2, day: 2, name: 'Super Bowl Sunday', emoji: '🏈', theme: 'green', message: 'Super Bowl watch party! Wings, beer & the biggest game of the year.' },
  { month: 2, day: 14, name: "Valentine's Day", emoji: '❤️', theme: 'rose', message: "Date night at Heroes — craft cocktails & a game on every screen." },
  { month: 3, day: 17, name: "St. Patrick's Day", emoji: '☘️', theme: 'emerald', message: "Slainte! Green beer, Irish specials & good craic all day." },
  { month: 4, day: 20, name: '420', emoji: '🌿', theme: 'lime', message: 'Chill vibes, munchies menu & laid-back tunes all day.' },
  { month: 5, day: 5, name: 'Cinco de Mayo', emoji: '🇲🇽', theme: 'green', message: 'Margaritas, tacos & fiesta vibes — feliz Cinco de Mayo!' },
  { month: 7, day: 4, name: 'Independence Day', emoji: '🇺🇸', theme: 'blue', message: 'Red, white & brew! BBQ specials & patriotic pints.' },
  { month: 9, day: 1, name: 'Labor Day', emoji: '🍔', theme: 'sky', message: "Last cookout of summer — cold brews & hot grills." },
  { month: 10, day: 31, name: 'Halloween', emoji: '🎃', theme: 'orange', message: 'Costume contest, spooky cocktails & scary-good wings.' },
  { month: 11, day: 11, name: "Veterans Day", emoji: '🎖️', theme: 'red', message: 'Honoring our heroes — free appetizer for all veterans.' },
  { month: 12, day: 24, name: 'Christmas Eve', emoji: '🎄', theme: 'red', message: "Cozy up with holiday brews & festive bites." },
  { month: 12, day: 25, name: 'Christmas Day', emoji: '🎅', theme: 'red', message: 'Merry Christmas from the Heroes family!' },
  { month: 12, day: 31, name: "New Year's Eve", emoji: '🥂', theme: 'amber', message: "Countdown party — champagne toasts & midnight cheers!" },
];

function getNthWeekday(year: number, month: number, weekday: number, n: number): Date {
  const first = new Date(year, month - 1, 1);
  const firstWeekday = first.getDay();
  const day = 1 + ((weekday - firstWeekday + 7) % 7) + (n - 1) * 7;
  return new Date(year, month - 1, day);
}

function getLastMonday(year: number, month: number): Date {
  const last = new Date(year, month, 0); // last day of month
  const offset = (last.getDay() - 1 + 7) % 7;
  return new Date(year, month - 1, last.getDate() - offset);
}

function getVariableHolidays(year: number): HolidayDef[] {
  const holidays: (HolidayDef & { date: Date })[] = [];

  // MLK Day: 3rd Monday of January
  const mlk = getNthWeekday(year, 1, 1, 3);
  holidays.push({ date: mlk, month: mlk.getMonth() + 1, day: mlk.getDate(), name: 'MLK Day', emoji: '✊', theme: 'violet', message: 'Honoring the dream — community, unity & cold brews.' });

  // Presidents Day: 3rd Monday of February
  const pres = getNthWeekday(year, 2, 1, 3);
  holidays.push({ date: pres, month: pres.getMonth() + 1, day: pres.getDate(), name: "Presidents' Day", emoji: '🏛️', theme: 'blue', message: 'Presidential pints & patriotic specials all day.' });

  // Mother's Day: 2nd Sunday of May
  const mothers = getNthWeekday(year, 5, 0, 2);
  holidays.push({ date: mothers, month: mothers.getMonth() + 1, day: mothers.getDate(), name: "Mother's Day", emoji: '💐', theme: 'pink', message: "Treat Mom to brunch, brews & big-screen sports!" });

  // Memorial Day: Last Monday of May
  const memorial = getLastMonday(year, 5);
  holidays.push({ date: memorial, month: memorial.getMonth() + 1, day: memorial.getDate(), name: 'Memorial Day', emoji: '🇺🇸', theme: 'red', message: 'Remembering our heroes — BBQ & brew specials.' });

  // Father's Day: 3rd Sunday of June
  const fathers = getNthWeekday(year, 6, 0, 3);
  holidays.push({ date: fathers, month: fathers.getMonth() + 1, day: fathers.getDate(), name: "Father's Day", emoji: '🍺', theme: 'sky', message: "Dad's day — free pint for every father!" });

  // Thanksgiving: 4th Thursday of November
  const tgiving = getNthWeekday(year, 11, 4, 4);
  holidays.push({ date: tgiving, month: tgiving.getMonth() + 1, day: tgiving.getDate(), name: 'Thanksgiving', emoji: '🦃', theme: 'orange', message: 'Turkey, touchdowns & tap takeovers!' });

  // Black Friday: Day after Thanksgiving
  const bf = new Date(tgiving);
  bf.setDate(bf.getDate() + 1);
  holidays.push({ date: bf, month: bf.getMonth() + 1, day: bf.getDate(), name: 'Black Friday', emoji: '🛍️', theme: 'zinc', message: 'Skip the lines — refuel with wings & beer after shopping.' });

  return holidays.map(({ date: _d, ...rest }) => rest);
}

function holidayDefsToEvents(defs: HolidayDef[], year: number): UnifiedEvent[] {
  return defs
    .map((h) => {
      const d = new Date(year, h.month - 1, h.day);
      return { ...h, date: d };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(({ name, emoji, theme, message, date }) => ({
      id: `holiday-${date.toISOString().split('T')[0]}`,
      eventTimestamp: date.toISOString(),
      eventTitle: name,
      eventType: 'HOLIDAY' as const,
      displayMessage: message,
      emoji,
      holidayTheme: theme,
    }));
}

function getHolidayEvents(): UnifiedEvent[] {
  const year = new Date().getFullYear();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const twoWeeksOut = new Date(today);
  twoWeeksOut.setDate(today.getDate() + 14);

  const allDefs = [...FIXED_HOLIDAYS, ...getVariableHolidays(year)];

  const upcoming = allDefs.filter((h) => {
    const d = new Date(year, h.month - 1, h.day);
    return d >= today && d <= twoWeeksOut;
  });

  return holidayDefsToEvents(upcoming, year);
}

export function getAllHolidays(): UnifiedEvent[] {
  const year = new Date().getFullYear();
  const allDefs = [...FIXED_HOLIDAYS, ...getVariableHolidays(year)];
  return holidayDefsToEvents(allDefs, year);
}

// =====================
// Unified fetch — all leagues in parallel
// =====================
export async function getAllEvents(): Promise<UnifiedEvent[]> {
  const espnFetches = ESPN_SPORTS.map(({ sport, league }) =>
    fetchESPNScoreboard(sport, league)
  );

  const [mlb, ...espnResults] = await Promise.all([
    fetchMLBGames(),
    ...espnFetches,
  ]);

  const holidays = getHolidayEvents();

  const all = [mlb, ...espnResults, holidays].flat();

  // Deduplicate MLB (MLB Stats API + ESPN might overlap)
  const seen = new Set<string>();
  const deduped = all.filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });

  // Filter to today through today+7 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 7);
  endDate.setHours(23, 59, 59, 999);

  const filtered = deduped.filter((e) => {
    const t = new Date(e.eventTimestamp);
    return t >= today && t <= endDate;
  });

  // Sort strictly by start time
  filtered.sort((a, b) => {
    return new Date(a.eventTimestamp).getTime() - new Date(b.eventTimestamp).getTime();
  });

  return filtered;
}

export async function getUpcomingEvents(limit = 5): Promise<UnifiedEvent[]> {
  const events = await getAllEvents();
  const now = new Date();
  return events
    .filter(e => new Date(e.eventTimestamp) >= now || e.isLive)
    .slice(0, limit);
}
