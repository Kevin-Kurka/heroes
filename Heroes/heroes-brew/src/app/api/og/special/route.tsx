/* eslint-disable @next/next/no-img-element -- next/og (Satori) renders to a PNG
   and supports only <img>; next/image is not applicable inside ImageResponse. */
import { ImageResponse } from 'next/og';

export const contentType = 'image/png';

// 4:3 — Google Business Profile's preferred local-post image ratio. The daily-special
// Google Events use this poster; the IG Story keeps the scratch-off/slot video.
const SIZE = { width: 1200, height: 900 };
const ADDRESS = '300 Carlsbad Village Dr #120, Carlsbad';

/**
 * Branded daily-special poster — the image baked into each special's Google Business
 * Profile Event (Mahalo Monday, Taco Tuesday, …). Fully query-driven so the special
 * copy lives in one place (the sheet publisher's SPECIALS map):
 *   ?title=Taco%20Tuesday&deal=%244%20Tacos%20%2B%20Tequila&day=Tuesday&hours=11a%E2%80%9310p
 * Generated on demand and cached for a day.
 */
export function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const title = searchParams.get('title') ?? 'Daily Special';
  const deal = searchParams.get('deal') ?? '';
  const day = searchParams.get('day') ?? '';
  const hours = searchParams.get('hours') ?? '';
  const badge = `${origin}/badge-clean.png`;
  const footerBits = [day && `Every ${day}`, hours].filter(Boolean).join('  ·  ');

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
          padding: '64px 72px',
        }}
      >
        {/* Brand row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <img src={badge} width={76} height={76} alt="" />
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 800, letterSpacing: 3, color: '#f59e0b' }}>
            AMERICAN HEROES &amp; BREW
          </div>
        </div>

        {/* Center: special name + deal */}
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', fontSize: 84, fontWeight: 800, textAlign: 'center', maxWidth: 1040, lineHeight: 1.05 }}>
            {title}
          </div>
          {deal ? (
            <div style={{ display: 'flex', fontSize: 56, fontWeight: 800, color: '#f59e0b', marginTop: 28, textAlign: 'center' }}>
              {deal}
            </div>
          ) : (
            <div style={{ display: 'flex' }} />
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '3px solid #f59e0b', paddingTop: 22, gap: 6 }}>
          {footerBits ? (
            <div style={{ display: 'flex', fontSize: 32, fontWeight: 800, color: '#ffffff' }}>{footerBits}</div>
          ) : (
            <div style={{ display: 'flex' }} />
          )}
          <div style={{ display: 'flex', fontSize: 26, color: '#e5e5e5' }}>{ADDRESS}</div>
        </div>
      </div>
    ),
    { ...SIZE, headers: { 'cache-control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400' } },
  );
}
