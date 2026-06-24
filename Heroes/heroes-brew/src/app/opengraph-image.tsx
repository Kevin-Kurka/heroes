import { ImageResponse } from 'next/og';

export const alt = 'American Heroes & Brew — Best Sports Bar in Carlsbad & North County';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Branded social share card — American Heroes & Brew red / white / blue (matches
 *  the badge). Rendered at build/request time so every shared link (Instagram bio,
 *  Facebook, iMessage, chat apps) shows a sharp on-brand preview. Pure CSS — no
 *  font/asset fetch, so it never fails to build. */
const RED = '#e2273a';
const BLUE = '#2851a7';

export default function OpengraphImage() {
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
          background: 'linear-gradient(135deg, #0b1a3a 0%, #0a0a0a 58%, #2a0a11 100%)',
          color: '#fafafa',
          fontFamily: 'sans-serif',
          padding: '60px',
          textAlign: 'center',
        }}
      >
        {/* top tricolor rule */}
        <div style={{ display: 'flex', position: 'absolute', top: 0, left: 0, width: '100%' }}>
          <div style={{ display: 'flex', width: '34%', height: 12, background: RED }} />
          <div style={{ display: 'flex', width: '33%', height: 12, background: '#ffffff' }} />
          <div style={{ display: 'flex', width: '33%', height: 12, background: BLUE }} />
        </div>
        <div style={{ display: 'flex', fontSize: 30, letterSpacing: 8, color: RED, fontWeight: 800 }}>
          CARLSBAD • NORTH COUNTY SAN DIEGO
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 92,
            fontWeight: 800,
            lineHeight: 1.05,
            marginTop: 28,
            color: '#ffffff',
          }}
        >
          American Heroes &amp; Brew
        </div>
        <div style={{ display: 'flex', fontSize: 42, marginTop: 28, color: '#e5e5e5' }}>
          The Best Sports Bar in North County
        </div>
        {/* red/white/blue divider */}
        <div style={{ display: 'flex', marginTop: 44, gap: 10 }}>
          <div style={{ display: 'flex', width: 90, height: 7, background: RED, borderRadius: 4 }} />
          <div style={{ display: 'flex', width: 90, height: 7, background: '#ffffff', borderRadius: 4 }} />
          <div style={{ display: 'flex', width: 90, height: 7, background: BLUE, borderRadius: 4 }} />
        </div>
        <div style={{ display: 'flex', marginTop: 24, fontSize: 28, color: '#c8ccd4' }}>
          Burgers · Wings · Craft Brews · Every Game on the Big Screens
        </div>
      </div>
    ),
    { ...size }
  );
}
