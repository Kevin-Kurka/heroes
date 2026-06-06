/* eslint-disable @next/next/no-img-element -- next/og (Satori) renders to a PNG
   and supports only <img>; next/image is not applicable inside ImageResponse. */
import { ImageResponse } from 'next/og';

export const contentType = 'image/png';

const SIZE = { width: 1200, height: 630 };
const ADDRESS = '300 Carlsbad Village Dr #120, Carlsbad';

/**
 * Branded matchup card shared via the "Let's Go" chip — the image that lands in
 * the MMS. Renders the two team logos, the Heroes badge, and the game's date,
 * time, and location over the bar's dark/amber theme. Generated on demand and
 * cached for a day (effectively pre-generated: the first share warms the CDN,
 * the rest are instant). Logos are fetched server-side, so there are no
 * client-side CORS/tainted-canvas problems.
 */
export function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const away = searchParams.get('away');
  const home = searchParams.get('home');
  const awayLogo = searchParams.get('aw');
  const homeLogo = searchParams.get('hm');
  const league = searchParams.get('league') ?? '';
  const title = searchParams.get('title') ?? 'Game Day';
  const when = searchParams.get('when') ?? '';
  const badge = `${origin}/badge-clean.png`;
  const isMatchup = Boolean(away && home);
  const footer = when ? `${when}  ·  ${ADDRESS}` : ADDRESS;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1207 100%)',
          color: '#fafafa',
          fontFamily: 'sans-serif',
          padding: '56px 64px',
        }}
      >
        {/* Brand row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <img src={badge} width={68} height={68} alt="" />
            <div style={{ display: 'flex', fontSize: 26, fontWeight: 800, letterSpacing: 3, color: '#f59e0b' }}>
              AMERICAN HEROES &amp; BREW
            </div>
          </div>
          {league ? (
            <div style={{ display: 'flex', fontSize: 24, fontWeight: 700, color: '#a3a3a3' }}>{league}</div>
          ) : (
            <div style={{ display: 'flex' }} />
          )}
        </div>

        {/* Center: matchup or single title */}
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', gap: 40 }}>
          {isMatchup && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 340 }}>
              {awayLogo && <img src={awayLogo} width={200} height={200} style={{ objectFit: 'contain' }} alt="" />}
              <div style={{ display: 'flex', fontSize: 38, fontWeight: 700, marginTop: 20, textAlign: 'center' }}>{away}</div>
            </div>
          )}
          {isMatchup && <div style={{ display: 'flex', fontSize: 64, fontWeight: 800, color: '#f59e0b' }}>VS</div>}
          {isMatchup && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 340 }}>
              {homeLogo && <img src={homeLogo} width={200} height={200} style={{ objectFit: 'contain' }} alt="" />}
              <div style={{ display: 'flex', fontSize: 38, fontWeight: 700, marginTop: 20, textAlign: 'center' }}>{home}</div>
            </div>
          )}
          {!isMatchup && (
            <div style={{ display: 'flex', fontSize: 72, fontWeight: 800, textAlign: 'center', maxWidth: 1000 }}>{title}</div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '3px solid #f59e0b', paddingTop: 22, gap: 8 }}>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 800, color: '#ffffff' }}>WATCH IT ON THE BIG SCREENS</div>
          <div style={{ display: 'flex', fontSize: 26, color: '#e5e5e5' }}>{footer}</div>
        </div>
      </div>
    ),
    // The URL params fully determine the card, so a changed feed (new matchup,
    // rescheduled time) yields a new URL and a fresh image. Cache per-URL for
    // speed; stale-while-revalidate lets a future card-design change refresh too.
    { ...SIZE, headers: { 'cache-control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400' } },
  );
}
