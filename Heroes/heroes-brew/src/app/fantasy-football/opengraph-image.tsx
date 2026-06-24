import { ImageResponse } from 'next/og';

export const alt = 'Fantasy Football League at American Heroes & Brew — draft at the bar, win $100';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Dedicated share card for /fantasy-football — brand red/white/blue, matches the
 *  launch reel. Pure CSS (no asset/font fetch) so the build can never fail, and no
 *  third-party player photos on a permanent site asset. */
const RED = '#e2273a';
const BLUE = '#2851a7';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #07142e 0%, #0a0a0a 55%, #2a0a11 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          padding: '56px',
          textAlign: 'center',
        }}
      >
        {/* top tricolor rule */}
        <div style={{ display: 'flex', position: 'absolute', top: 0, left: 0, width: '100%' }}>
          <div style={{ display: 'flex', width: '34%', height: 12, background: RED }} />
          <div style={{ display: 'flex', width: '33%', height: 12, background: '#ffffff' }} />
          <div style={{ display: 'flex', width: '33%', height: 12, background: BLUE }} />
        </div>

        <div style={{ display: 'flex', fontSize: 27, letterSpacing: 7, color: RED, fontWeight: 800 }}>
          AMERICAN HEROES &amp; BREW · CARLSBAD VILLAGE
        </div>

        <div style={{ display: 'flex', gap: 18, marginTop: 24, fontSize: 70, fontWeight: 800, lineHeight: 1 }}>
          <div style={{ display: 'flex', color: '#ffffff' }}>FANTASY FOOTBALL</div>
          <div style={{ display: 'flex', color: RED }}>LEAGUE</div>
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 32,
            background: BLUE,
            border: '4px solid #ffffff',
            borderRadius: 999,
            padding: '14px 42px',
            fontSize: 44,
            fontWeight: 800,
            color: '#ffffff',
          }}
        >
          $100 TO THE CHAMP
        </div>

        <div style={{ display: 'flex', marginTop: 28, fontSize: 30, color: '#dfe3ea' }}>
          Draft at the bar · Free to join · Every game on 16 TVs
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 30 }}>
          <div style={{ display: 'flex', width: 80, height: 7, background: RED, borderRadius: 4 }} />
          <div style={{ display: 'flex', width: 80, height: 7, background: '#ffffff', borderRadius: 4 }} />
          <div style={{ display: 'flex', width: 80, height: 7, background: BLUE, borderRadius: 4 }} />
        </div>

        <div style={{ display: 'flex', marginTop: 22, fontSize: 26, fontWeight: 700, color: '#ffffff' }}>
          americanheroesandbrew.com/fantasy-football
        </div>
      </div>
    ),
    { ...size }
  );
}
