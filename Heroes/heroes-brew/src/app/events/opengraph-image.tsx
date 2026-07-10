import { ImageResponse } from 'next/og';
import { OgCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-card';
import { OG_HERO } from '@/lib/og-assets';

export const alt = 'Scoreboard — every game at American Heroes & Brew, Carlsbad';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <OgCard
        photo={OG_HERO}
        kicker="Scoreboard"
        headline={['Every Game,', 'Every Day']}
        sub="Watch it on the big screens at American Heroes & Brew"
      />
    ),
    { ...size },
  );
}
