import { ImageResponse } from 'next/og';
import { OgCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-card';
import { OG_FOOD } from '@/lib/og-assets';

export const alt = 'The Menu — American Heroes & Brew, Carlsbad Village';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <OgCard
        photo={OG_FOOD}
        kicker="The Menu"
        headline={['Burgers, Wings', '& Craft Brews']}
        sub="Full kitchen + cold beer in Carlsbad Village"
      />
    ),
    { ...size },
  );
}
