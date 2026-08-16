/* eslint-disable @next/next/no-img-element -- next/og (Satori) renders to a PNG and supports only <img>. */
import { ImageResponse } from 'next/og';
import { getAllEvents } from '@/lib/events';
import type { UnifiedEvent } from '@/types';

export const contentType = 'image/png';
export const dynamic = 'force-dynamic';

const SIZE = { width: 1080, height: 1920 };
const ADDRESS = '300 Carlsbad Village Dr #120, Carlsbad';
// American-flag theme to match the rest of the promo art.
const NAVY = '#0a1a3f';
const RED = '#b22234';

// Single-league codes → the UnifiedEvent.league value they select.
const LEAGUE_OF: Record<string, string> = {
  WC: 'WORLDCUP', NFL: 'NFL', MLB: 'MLB', NBA: 'NBA', NHL: 'NHL', MLS: 'MLS', CFB: 'CFB',
};
const TITLE_OF: Record<string, string> = {
  WC: 'WORLD CUP — TODAY', NFL: 'NFL SUNDAY', MLB: 'PADRES & MLB TODAY',
  NBA: 'NBA TODAY', NHL: 'NHL TODAY', MLS: 'MLS TODAY', CFB: 'COLLEGE FOOTBALL',
  ALL: 'TODAY AT HEROES', TODAY: 'TODAY AT HEROES',
};
// Short chips shown per row in the multi-league (ALL/TODAY) slate.
const LEAGUE_CHIP: Record<string, string> = {
  MLB: 'MLB', NFL: 'NFL', NBA: 'NBA', NHL: 'NHL', MLS: 'MLS', WORLDCUP: 'WC', CFB: 'CFB',
};

function ptYmd(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function ptTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(iso));
}

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = (searchParams.get('league') ?? 'WC').toUpperCase();
  const date = searchParams.get('date') ?? '';
  // ALL/TODAY → every sport on that date (the daily "Today at Heroes" lineup);
  // otherwise a single league's slate.
  const isAll = code === 'ALL' || code === 'TODAY';
  const league = LEAGUE_OF[code] ?? 'WORLDCUP';
  // `title` overrides the derived heading (NFL gameday events reuse this route for
  // Thursday/Monday/Thanksgiving/Kickoff slates, which aren't in TITLE_OF).
  const heading = searchParams.get('title') || TITLE_OF[code] || 'TODAY';
  const badge = `${origin}/badge-clean.png`;
  // Full-bleed night-field photo background. `bg=0` opts out (flat navy).
  const showBg = searchParams.get('bg') !== '0';
  const fieldBg = `${origin}/promos/field-bg-9x16.jpg`;

  // Local team lead the slate so the Padres/Chargers game is always at the top.
  const PRIORITY = new Set(['San Diego Padres', 'Los Angeles Chargers']);
  const isLocal = (e: UnifiedEvent) =>
    (!!e.homeTeam && PRIORITY.has(e.homeTeam)) || (!!e.awayTeam && PRIORITY.has(e.awayTeam));

  const all = await getAllEvents();
  const games: UnifiedEvent[] = all
    .filter((e) => e.eventType === 'SPORTS' && (isAll || e.league === league) && (!date || ptYmd(e.eventTimestamp) === date))
    .sort((a, b) => {
      // In the multi-league slate, surface the local team first; otherwise chronological.
      if (isAll && isLocal(a) !== isLocal(b)) return isLocal(a) ? -1 : 1;
      return new Date(a.eventTimestamp).getTime() - new Date(b.eventTimestamp).getTime();
    })
    .slice(0, isAll ? 8 : 10);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
          position: 'relative',
          background: `linear-gradient(160deg, ${NAVY} 0%, #050a1a 100%)`,
          color: '#fafafa', fontFamily: 'sans-serif', padding: '90px 70px',
        }}
      >
        {showBg && (
          <img
            src={fieldBg}
            width={SIZE.width}
            height={SIZE.height}
            alt=""
            style={{ position: 'absolute', top: 0, left: 0, objectFit: 'cover' }}
          />
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
          <img src={badge} width={96} height={96} alt="" />
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 800, letterSpacing: 4, color: '#ffffff' }}>
            AMERICAN HEROES &amp; BREW
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 900, color: RED, marginBottom: 40 }}>{heading}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26, flex: 1 }}>
          {games.length === 0 ? (
            <div style={{ display: 'flex', fontSize: 44, color: '#cbd5e1' }}>Every game. Every screen.</div>
          ) : (
            games.map((g) => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid rgba(255,255,255,0.18)', paddingBottom: 18, background: 'rgba(6,14,32,0.55)', borderRadius: 12, paddingLeft: 16, paddingRight: 16, paddingTop: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, maxWidth: 760 }}>
                  {isAll && g.league && LEAGUE_CHIP[g.league] && (
                    <div style={{ display: 'flex', fontSize: 26, fontWeight: 800, color: '#ffffff', background: RED, borderRadius: 8, padding: '4px 12px' }}>
                      {LEAGUE_CHIP[g.league]}
                    </div>
                  )}
                  <div style={{ display: 'flex', fontSize: 46, fontWeight: 700 }}>
                    {g.awayTeam && g.homeTeam ? `${g.awayTeam} vs ${g.homeTeam}` : g.eventTitle}
                  </div>
                </div>
                <div style={{ display: 'flex', fontSize: 42, fontWeight: 800, color: '#ffffff' }}>{ptTime(g.eventTimestamp)}</div>
              </div>
            ))
          )}
        </div>
        <div style={{ display: 'flex', fontSize: 34, color: '#cbd5e1', marginTop: 30 }}>
          Watch with us · {ADDRESS}
        </div>
      </div>
    ),
    SIZE,
  );
}
