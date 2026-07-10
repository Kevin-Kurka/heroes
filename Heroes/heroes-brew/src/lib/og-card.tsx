/* Shared on-brand OG / social-share card, rendered by next/og (Satori). Fixes the
 * "generic preview" problem: pages point their openGraph.images at this instead of the
 * old text-only card. Satori-safe CSS only (flexbox, linear-gradient, textShadow, img).
 * Assets are inlined base64 (see og-assets.ts) so it never depends on a runtime fetch. */
import { OG_CREST } from './og-assets';

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

const RED = '#bf0a30';
const NAVY = '#0a3161';

export function OgCard({
  photo,
  kicker,
  headline,
  sub,
}: {
  photo: string;
  kicker: string;
  headline: string[];
  sub: string;
}) {
  return (
    <div style={{ position: 'relative', display: 'flex', width: '100%', height: '100%', fontFamily: 'sans-serif' }}>
      {/* photo background */}
      <img
        src={photo}
        width={1200}
        height={630}
        style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630, objectFit: 'cover' }}
      />
      {/* darkening gradient for legibility */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, width: 1200, height: 630, display: 'flex',
          backgroundImage: 'linear-gradient(180deg, rgba(6,10,20,0.35) 0%, rgba(6,10,20,0.30) 32%, rgba(6,10,20,0.9) 100%)',
        }}
      />
      {/* triple red/white/blue keyline */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630, display: 'flex', border: `10px solid ${NAVY}` }} />
      <div style={{ position: 'absolute', top: 10, left: 10, width: 1180, height: 610, display: 'flex', border: '6px solid #ffffff' }} />
      <div style={{ position: 'absolute', top: 16, left: 16, width: 1168, height: 598, display: 'flex', border: `8px solid ${RED}` }} />
      {/* crest, top-left */}
      <img src={OG_CREST} width={132} height={132} style={{ position: 'absolute', top: 46, left: 46, width: 132, height: 132 }} />
      {/* content, bottom-left */}
      <div style={{ position: 'absolute', left: 58, right: 58, bottom: 54, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex', alignSelf: 'flex-start', fontSize: 28, fontWeight: 800, letterSpacing: 2,
            color: '#ffffff', padding: '6px 16px', borderRadius: 8, border: `3px solid ${RED}`,
            backgroundColor: 'rgba(191,10,48,0.32)',
          }}
        >
          {kicker.toUpperCase()}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 16 }}>
          {headline.map((line, i) => (
            <div
              key={i}
              style={{ display: 'flex', fontSize: 78, fontWeight: 800, color: '#ffffff', lineHeight: 1.02, textShadow: '0 4px 16px rgba(0,0,0,0.8)' }}
            >
              {line}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', fontSize: 31, color: '#e7ebf2', marginTop: 16, textShadow: '0 2px 10px rgba(0,0,0,0.85)' }}>
          {sub}
        </div>
      </div>
    </div>
  );
}
