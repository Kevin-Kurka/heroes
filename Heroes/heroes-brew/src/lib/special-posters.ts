/**
 * FILE: special-posters.ts
 * PURPOSE: Allowlisted Google-Event stills for Mon–Fri daily specials.
 *
 * OVERVIEW:
 * Seeded Google + Feed/Story specials use these food /promos/ JPEGs —
 * never /api/og/special and never scratcher/slot MP4s.
 * Mirrored in scripts/sheet-auto-publisher.gs SPECIAL_GOOGLE_POSTERS.
 *
 * DEPENDENCIES:
 * - public/promos/burgers-beer-thursday-gbp.jpg (Creative FINALS)
 * - public/promos/special-{taco-tuesday,wings-wednesday}.jpg
 * - public/promos/{kalua-sliders,funday}-feed.jpg (Mon/Fri until lineup pack)
 *
 * EXPORTS:
 * - SpecialPosterKey, SPECIAL_GOOGLE_POSTERS, specialGooglePoster
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Tue–Thu use Creative photo-led GBP stills
 * - ✅ Mon/Fri use existing brand-kit food stills
 *
 * RELATED FILES:
 * - scripts/sheet-auto-publisher.gs (specialPoster_)
 * - scripts/specials-video/feed-poster-render.mjs
 * - src/lib/special-posters.test.ts
 *
 * LAST UPDATED: 2026-09-17
 * MAINTAINER: American Heroes & Brew
 */

export type SpecialPosterKey = 'mahalo' | 'taco' | 'wings' | 'burgers' | 'funday';

/** Concrete /promos/ URLs the sheet seeder writes into Google Event Media. */
export const SPECIAL_GOOGLE_POSTERS: Record<SpecialPosterKey, string> = {
  mahalo: '/promos/kalua-sliders-feed.jpg',
  taco: '/promos/special-taco-tuesday.jpg',
  wings: '/promos/special-wings-wednesday.jpg',
  burgers: '/promos/burgers-beer-thursday-gbp.jpg',
  funday: '/promos/funday-feed.jpg',
};

const FALLBACK = '/promos/hero-up-watch-party.jpg';

export function specialGooglePoster(key: string): string {
  return SPECIAL_GOOGLE_POSTERS[key as SpecialPosterKey] ?? FALLBACK;
}
