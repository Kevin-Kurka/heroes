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

const LEAGUE_OF: Record<string, string> = { WC: 'WORLDCUP', NFL: 'NFL' };
const TITLE_OF: Record<string, string> = { WC: 'WORLD CUP — TODAY', NFL: 'NFL SUNDAY' };

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
  const league = LEAGUE_OF[code] ?? 'WORLDCUP';
  const heading = TITLE_OF[code] ?? 'TODAY';
  const badge = `${origin}/badge-clean.png`;

  const all = await getAllEvents();
  const games: UnifiedEvent[] = all
    .filter((e) => e.league === league && (!date || ptYmd(e.eventTimestamp) === date))
    .sort((a, b) => new Date(a.eventTimestamp).getTime() - new Date(b.eventTimestamp).getTime())
    .slice(0, 10);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
          background: `linear-gradient(160deg, ${NAVY} 0%, #050a1a 100%)`,
          color: '#fafafa', fontFamily: 'sans-serif', padding: '90px 70px',
        }}
      >
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
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid rgba(255,255,255,0.15)', paddingBottom: 18 }}>
                <div style={{ display: 'flex', fontSize: 46, fontWeight: 700, maxWidth: 720 }}>
                  {g.awayTeam && g.homeTeam ? `${g.awayTeam} vs ${g.homeTeam}` : g.eventTitle}
                </div>
                <div style={{ display: 'flex', fontSize: 42, fontWeight: 800, color: '#ffd54a' }}>{ptTime(g.eventTimestamp)}</div>
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
