import { ImageResponse } from 'next/og';

export const alt = 'American Heroes & Brew — Best Sports Bar in Carlsbad & North County';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Branded social share card. Rendered at build/request time so every shared
 *  link (Instagram bio, Facebook, iMessage) shows a sharp preview instead of
 *  a blank box. Pure CSS — no font/asset fetch, so it never fails to build. */
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
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1207 100%)',
          color: '#fafafa',
          fontFamily: 'sans-serif',
          padding: '60px',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', fontSize: 30, letterSpacing: 8, color: '#f59e0b', fontWeight: 700 }}>
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
        <div
          style={{
            display: 'flex',
            marginTop: 48,
            fontSize: 28,
            color: '#a3a3a3',
            borderTop: '2px solid #f59e0b',
            paddingTop: 24,
          }}
        >
          Burgers · Wings · Craft Brews · Every Game on the Big Screens
        </div>
      </div>
    ),
    { ...size }
  );
}
