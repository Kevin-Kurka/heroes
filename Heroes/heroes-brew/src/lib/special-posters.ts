/**
 * FILE: special-posters.ts
 * PURPOSE: Real-food daily-lineup stills for Google + IG specials.
 *
 * OVERVIEW:
 * Mon–Fri lineup uses Creative food photos under /promos/daily-lineup/.
 * Google Events use *-gbp.jpg; Feed uses *-feed.jpg; Story uses *-story.jpg.
 * Never /api/og/special. Never scratcher/slot MP4s or Lucky Stars.
 *
 * DEPENDENCIES:
 * - public/promos/daily-lineup/{mahalo-monday,taco-tuesday,wings-wednesday,
 *   burgers-beer-thursday,friday-funday}-{gbp,feed,story}.jpg
 *
 * EXPORTS:
 * - SpecialPosterKey, SpecialLineupStill, SPECIAL_LINEUP
 * - SPECIAL_GOOGLE_POSTERS, specialGooglePoster, specialFeedPoster, specialStoryPoster
 *
 * IMPLEMENTATION STATUS:
 * - ✅ v2 menu-library stills: all 5 GBP; Thu+Tue feed/story shipped
 * - ✅ Mon/Wed/Fri feed+story are v2 GBP copies until dedicated crops land
 *
 * RELATED FILES:
 * - scripts/sheet-auto-publisher.gs
 * - src/lib/special-posters.test.ts
 *
 * LAST UPDATED: 2026-09-17
 * MAINTAINER: American Heroes & Brew
 */

export type SpecialPosterKey = 'mahalo' | 'taco' | 'wings' | 'burgers' | 'funday';

export interface SpecialLineupStill {
  gbp: string;
  feed: string;
  story: string;
}

const DIR = '/promos/daily-lineup';

export const SPECIAL_LINEUP: Record<SpecialPosterKey, SpecialLineupStill> = {
  mahalo: {
    gbp: `${DIR}/mahalo-monday-gbp.jpg`,
    feed: `${DIR}/mahalo-monday-feed.jpg`,
    story: `${DIR}/mahalo-monday-story.jpg`,
  },
  taco: {
    gbp: `${DIR}/taco-tuesday-gbp.jpg`,
    feed: `${DIR}/taco-tuesday-feed.jpg`,
    story: `${DIR}/taco-tuesday-story.jpg`,
  },
  wings: {
    gbp: `${DIR}/wings-wednesday-gbp.jpg`,
    feed: `${DIR}/wings-wednesday-feed.jpg`,
    story: `${DIR}/wings-wednesday-story.jpg`,
  },
  burgers: {
    gbp: `${DIR}/burgers-beer-thursday-gbp.jpg`,
    feed: `${DIR}/burgers-beer-thursday-feed.jpg`,
    story: `${DIR}/burgers-beer-thursday-story.jpg`,
  },
  funday: {
    gbp: `${DIR}/friday-funday-gbp.jpg`,
    feed: `${DIR}/friday-funday-feed.jpg`,
    story: `${DIR}/friday-funday-story.jpg`,
  },
};

/** Google Event Media — always the GBP square. */
export const SPECIAL_GOOGLE_POSTERS: Record<SpecialPosterKey, string> = {
  mahalo: SPECIAL_LINEUP.mahalo.gbp,
  taco: SPECIAL_LINEUP.taco.gbp,
  wings: SPECIAL_LINEUP.wings.gbp,
  burgers: SPECIAL_LINEUP.burgers.gbp,
  funday: SPECIAL_LINEUP.funday.gbp,
};

const FALLBACK = '/promos/hero-up-watch-party.jpg';

export function specialGooglePoster(key: string): string {
  return SPECIAL_GOOGLE_POSTERS[key as SpecialPosterKey] ?? FALLBACK;
}

export function specialFeedPoster(key: string): string {
  return SPECIAL_LINEUP[key as SpecialPosterKey]?.feed ?? FALLBACK;
}

export function specialStoryPoster(key: string): string {
  return SPECIAL_LINEUP[key as SpecialPosterKey]?.story ?? FALLBACK;
}
