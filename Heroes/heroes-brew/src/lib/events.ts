import { UnifiedEvent, SportLeague } from '@/types';

// Headline teams the bar actively follows — their games are MARQUEE-tier (designed
// Feed posts), the rest of the local teams below become LOCAL-tier Story invites.
const FOLLOWED_TEAMS = new Set([
  'San Diego Padres',
  'Los Angeles Chargers',
  'Las Vegas Raiders',
]);

// Words in a title/status that signal a championship-caliber event → MARQUEE.
const MARQUEE_KEYWORDS = /super bowl|world series|stanley cup|finals?|championship|playoff|wild ?card|world cup/i;

// MLB team primary brand colors (MLB Stats API gives no colors; ESPN leagues do).
const MLB_COLORS: Record<string, string> = {
  'Arizona Diamondbacks': '#A71930', 'Atlanta Braves': '#CE1141', 'Baltimore Orioles': '#DF4601',
  'Boston Red Sox': '#BD3039', 'Chicago Cubs': '#0E3386', 'Chicago White Sox': '#27251F',
  'Cincinnati Reds': '#C6011F', 'Cleveland Guardians': '#00385D', 'Colorado Rockies': '#333366',
  'Detroit Tigers': '#0C2340', 'Houston Astros': '#002D62', 'Kansas City Royals': '#004687',
  'Los Angeles Angels': '#BA0021', 'Los Angeles Dodgers': '#005A9C', 'Miami Marlins': '#00A3E0',
  'Milwaukee Brewers': '#12284B', 'Minnesota Twins': '#002B5C', 'New York Mets': '#002D72',
  'New York Yankees': '#003087', 'Athletics': '#003831', 'Oakland Athletics': '#003831',
  'Philadelphia Phillies': '#E81828', 'Pittsburgh Pirates': '#FDB827', 'San Diego Padres': '#FFC425',
  'San Francisco Giants': '#FD5A1E', 'Seattle Mariners': '#0C2C56', 'St. Louis Cardinals': '#C41E3A',
  'Tampa Bay Rays': '#092C5C', 'Texas Rangers': '#003278', 'Toronto Blue Jays': '#134A8E',
  'Washington Nationals': '#AB0003',
};

// MLB team secondary colors — chosen to contrast each primary (used for marquee text).
const MLB_ALT_COLORS: Record<string, string> = {
  'Arizona Diamondbacks': '#E3D4AD', 'Atlanta Braves': '#FFFFFF', 'Baltimore Orioles': '#000000',
  'Boston Red Sox': '#FFFFFF', 'Chicago Cubs': '#CC3433', 'Chicago White Sox': '#C4CED4',
  'Cincinnati Reds': '#000000', 'Cleveland Guardians': '#E31937', 'Colorado Rockies': '#C4CED4',
  'Detroit Tigers': '#FA4616', 'Houston Astros': '#EB6E1F', 'Kansas City Royals': '#BD9B60',
  'Los Angeles Angels': '#FFFFFF', 'Los Angeles Dodgers': '#EF3E42', 'Miami Marlins': '#000000',
  'Milwaukee Brewers': '#FFC52F', 'Minnesota Twins': '#D31145', 'New York Mets': '#FF5910',
  'New York Yankees': '#FFFFFF', 'Athletics': '#EFB21E', 'Oakland Athletics': '#EFB21E',
  'Philadelphia Phillies': '#FFFFFF', 'Pittsburgh Pirates': '#27251F', 'San Diego Padres': '#2F241D',
  'San Francisco Giants': '#27251F', 'Seattle Mariners': '#005C5C', 'St. Louis Cardinals': '#FEDB00',
  'Tampa Bay Rays': '#8FBCE6', 'Texas Rangers': '#C0111F', 'Toronto Blue Jays': '#FFFFFF',
  'Washington Nationals': '#FFFFFF',
};

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

function isFollowedTeam(name?: string): boolean {
  return !!name && FOLLOWED_TEAMS.has(name);
}

/** True when the event kicks off on a Monday evening (PT) — i.e. Monday Night Football. */
export function isMondayNight(e: UnifiedEvent): boolean {
  if (e.league !== 'NFL') return false;
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'short',
    hour: 'numeric',
    hour12: false,
  }).formatToParts(new Date(e.eventTimestamp));
  const weekday = parts.find((p) => p.type === 'weekday')?.value;
  const hour = Number(parts.find((p) => p.type === 'hour')?.value);
  return weekday === 'Mon' && hour >= 16;
}

/** A game we promote: a local SoCal team OR a followed team (Padres/Chargers/Raiders). */
function isPromotable(e: UnifiedEvent): boolean {
  return !!e.highlighted || isFollowedTeam(e.homeTeam) || isFollowedTeam(e.awayTeam);
}

/**
 * Marketing tier. MARQUEE is reserved for the big stuff we can actually detect —
 * Monday Night Football and championship-keyword games (Finals, World Series, etc.).
 * Regular games involving a promoted team are LOCAL (Story-invite material). The
 * sheet's manual Marquee tag remains authoritative for publishing; playoff rounds
 * aren't exposed by the schedule APIs, so the website only flags what it can prove.
 */
function classifyTier(e: UnifiedEvent): 'MARQUEE' | 'LOCAL' | undefined {
  if (e.eventType !== 'SPORTS') {
    return MARQUEE_KEYWORDS.test(e.eventTitle) ? 'MARQUEE' : undefined;
  }
  // Every game involving a followed team (Padres/Chargers/Raiders) is MARQUEE,
  // plus Monday Night Football and championship-keyword games we can detect.
  const isMarquee =
    isFollowedTeam(e.homeTeam) ||
    isFollowedTeam(e.awayTeam) ||
    isMondayNight(e) ||
    MARQUEE_KEYWORDS.test(`${e.eventTitle} ${e.status ?? ''}`);
  if (isMarquee && isPromotable(e)) return 'MARQUEE';
  return isPromotable(e) ? 'LOCAL' : undefined;
}

/** Tag an event with its marketing tier (MARQUEE games get an accent treatment in the UI). */
function decorateEvent(e: UnifiedEvent): UnifiedEvent {
  return { ...e, tier: classifyTier(e) };
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
      const homeColor = homeComp?.team?.color ? `#${homeComp.team.color}` : undefined;
      const awayColor = awayComp?.team?.color ? `#${awayComp.team.color}` : undefined;
      const homeAltColor = homeComp?.team?.alternateColor ? `#${homeComp.team.alternateColor}` : undefined;
      const awayAltColor = awayComp?.team?.alternateColor ? `#${awayComp.team.alternateColor}` : undefined;

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
        homeColor,
        awayColor,
        homeAltColor,
        awayAltColor,
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
          homeColor: MLB_COLORS[home],
          awayColor: MLB_COLORS[away],
          homeAltColor: MLB_ALT_COLORS[home],
          awayAltColor: MLB_ALT_COLORS[away],
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
  { month: 1, day: 1, name: "New Year's Day", emoji: '🎆', theme: 'amber', message: 'Ring in the New Year with house drafts & big screens!' },
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
      // Anchor at NOON UTC, not local midnight. A local-midnight Date serialized with
      // toISOString() becomes T00:00:00Z on the UTC production server, which renders as the
      // PREVIOUS day once EventCard formats it in America/Los_Angeles (UTC-7/-8) — making every
      // holiday show one day early. Noon UTC (≈5am PT) keeps the calendar day correct in PT.
      const d = new Date(Date.UTC(year, h.month - 1, h.day, 12, 0, 0));
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

  return filtered.map(decorateEvent);
}

export async function getUpcomingEvents(limit = 5): Promise<UnifiedEvent[]> {
  const events = await getAllEvents();
  const now = new Date();
  return events
    .filter(e => new Date(e.eventTimestamp) >= now || e.isLive)
    .slice(0, limit);
}
