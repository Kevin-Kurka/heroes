/**
 * FILE: special-posters.ts
 * PURPOSE: Allowlisted Google-Event stills for Mon–Fri daily specials.
 *
 * OVERVIEW:
 * GBP cannot take the scratcher/slot Story videos. Seeded Google specials
 * must use these brand-kit /promos/ JPEGs — never /api/og/special.
 * Mirrored in scripts/sheet-auto-publisher.gs SPECIAL_GOOGLE_POSTERS.
 *
 * DEPENDENCIES:
 * - public/promos/{kalua-sliders,tacos,wings,pasadena,funday}-feed.jpg
 *
 * EXPORTS:
 * - SpecialPosterKey, SPECIAL_GOOGLE_POSTERS, specialGooglePoster
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Mon–Fri mapped to existing or brand-kit feed stills
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
  taco: '/promos/tacos-feed.jpg',
  wings: '/promos/wings-feed.jpg',
  burgers: '/promos/pasadena-feed.jpg',
  funday: '/promos/funday-feed.jpg',
};

const FALLBACK = '/promos/hero-up-watch-party.jpg';

export function specialGooglePoster(key: string): string {
  return SPECIAL_GOOGLE_POSTERS[key as SpecialPosterKey] ?? FALLBACK;
}
