/* eslint-disable @next/next/no-img-element -- next/og (Satori) renders to a PNG
   and supports only <img>; next/image is not applicable inside ImageResponse. */
import { ImageResponse } from 'next/og';
import { OG_CREST } from '@/lib/og-assets';

export const contentType = 'image/png';

const SIZE = { width: 1200, height: 630 };
const ADDRESS = '300 Carlsbad Village Dr #120, Carlsbad';
// Brand palette (red/white/blue) — replaces the retired amber theme.
const RED = '#bf0a30';
const NAVY = '#0a3161';
const BLUE = '#3a6fe0';

/**
 * Branded matchup card — the image behind the "Let's Go" share chip, curated IG feed
 * posts, and Google Events. Two team logos + Heroes crest + game date/time/location on
 * the brand red/white/blue theme with a triple keyline. Generated on demand; logos are
 * fetched server-side (no client CORS). Params fully determine the card, so a new
 * matchup/time yields a fresh URL + image.
 */
export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const away = searchParams.get('away');
  const home = searchParams.get('home');
  const awayLogo = searchParams.get('aw');
  const homeLogo = searchParams.get('hm');
  const league = searchParams.get('league') ?? '';
  const title = searchParams.get('title') ?? 'Game Day';
  const when = searchParams.get('when') ?? '';
  const social = searchParams.get('social') === '1';
  const ratio = searchParams.get('ratio');
  const size = ratio === '9x16' ? { width: 1080, height: 1920 }
    : ratio === '4x5' ? { width: 1080, height: 1350 }
    : SIZE;
  const W = size.width, H = size.height;
  const isMatchup = Boolean(away && home);
  const footer = when ? `${when}  ·  ${ADDRESS}` : ADDRESS;
  const logo = ratio ? 240 : 200;

  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative', height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(140deg, #12294f 0%, #0a1730 52%, #1a0712 100%)',
          color: '#fafafa', fontFamily: 'sans-serif', padding: ratio ? '72px 64px' : '52px 60px',
        }}
      >
        {/* triple red/white/blue keyline */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: W, height: H, display: 'flex', border: `10px solid ${NAVY}` }} />
        <div style={{ position: 'absolute', top: 10, left: 10, width: W - 20, height: H - 20, display: 'flex', border: '6px solid #ffffff' }} />
        <div style={{ position: 'absolute', top: 16, left: 16, width: W - 32, height: H - 32, display: 'flex', border: `8px solid ${RED}` }} />

        {/* brand row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <img src={OG_CREST} width={76} height={76} alt="" />
            <div style={{ display: 'flex', fontSize: 26, fontWeight: 800, letterSpacing: 2, color: '#ffffff' }}>
              AMERICAN HEROES &amp; BREW
            </div>
          </div>
          {league
            ? <div style={{ display: 'flex', fontSize: 24, fontWeight: 800, color: BLUE }}>{league}</div>
            : <div style={{ display: 'flex' }} />}
        </div>

        {/* center: matchup or single title */}
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', gap: 44 }}>
          {isMatchup ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: ratio ? 380 : 340 }}>
                {awayLogo && <img src={awayLogo} width={logo} height={logo} style={{ objectFit: 'contain' }} alt="" />}
                <div style={{ display: 'flex', fontSize: 40, fontWeight: 800, marginTop: 20, textAlign: 'center', textShadow: '0 3px 10px rgba(0,0,0,0.6)' }}>{away}</div>
              </div>
              <div style={{ display: 'flex', fontSize: 68, fontWeight: 800, color: RED, textShadow: '0 3px 10px rgba(0,0,0,0.6)' }}>VS</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: ratio ? 380 : 340 }}>
                {homeLogo && <img src={homeLogo} width={logo} height={logo} style={{ objectFit: 'contain' }} alt="" />}
                <div style={{ display: 'flex', fontSize: 40, fontWeight: 800, marginTop: 20, textAlign: 'center', textShadow: '0 3px 10px rgba(0,0,0,0.6)' }}>{home}</div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', fontSize: 76, fontWeight: 800, textAlign: 'center', maxWidth: 980, textShadow: '0 3px 12px rgba(0,0,0,0.6)' }}>{title}</div>
          )}
        </div>

        {/* footer */}
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: `4px solid ${RED}`, paddingTop: 20, gap: 6 }}>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 800, color: '#ffffff' }}>WATCH IT ON THE BIG SCREENS</div>
          <div style={{ display: 'flex', fontSize: 25, color: '#e5e7eb' }}>{footer}</div>
          {social && (
            <div style={{ display: 'flex', fontSize: 22, fontWeight: 800, color: BLUE, marginTop: 2 }}>
              @americanheroesandbrew · americanheroesandbrew.com
            </div>
          )}
          {social && (
            <div style={{ display: 'flex', fontSize: 20, color: '#9aa4b2' }}>
              #AmericanHeroesAndBrew · #CarlsbadVillage · #SportsBar · #GameDay
            </div>
          )}
        </div>
      </div>
    ),
    { ...size, headers: { 'cache-control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400' } },
  );
}
