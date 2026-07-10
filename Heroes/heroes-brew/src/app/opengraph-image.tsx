import { ImageResponse } from 'next/og';
import { OgCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-card';
import { OG_HERO } from '@/lib/og-assets';

export const alt = 'American Heroes & Brew — Best Sports Bar in Carlsbad & North County';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Site-wide branded share card — crest + real venue photo + red/white/blue keyline.
 *  Cascades to every page that doesn't set its own image, so pasted links show an
 *  on-brand preview (not the old generic text card). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <OgCard
        photo={OG_HERO}
        kicker="Carlsbad Village"
        headline={['American Heroes', '& Brew']}
        sub="The best sports bar in North County — every game on the big screens"
      />
    ),
    { ...size },
  );
}
