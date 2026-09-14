/**
 * FILE: week2-posters.ts
 * PURPOSE: NFL Week 2 AHAB watch-party poster registry (feed 4:5 + story 9:16).
 *
 * OVERVIEW:
 * Single source of truth for the composed Week 2 JPGs in public/gameday/week2/.
 * Powers the /watch gallery, /watch-party index, and the home "This Week" teaser.
 *
 * DEPENDENCIES:
 * - public/gameday/week2/*.jpg
 *
 * EXPORTS:
 * - Week2Poster, WEEK2_POSTERS, WEEK2_DISCLAIMER, getLocalWeek2Poster
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Five Week 2 matchups with PT kickoffs and local Chargers flag
 *
 * RELATED FILES:
 * - src/components/Week1PosterGallery.tsx
 * - src/lib/week2-posters.test.ts
 *
 * LAST UPDATED: 2026-09-14
 * MAINTAINER: American Heroes & Brew
 */

export interface Week2Poster {
  id: string;
  away: string;
  home: string;
  eyebrow: string;
  when: string;
  note: string;
  feedSrc: string;
  storySrc: string;
  /** Local-team (Chargers) watch party — visual priority on the site. */
  local?: boolean;
}

export const WEEK2_DISCLAIMER =
  'Fan watch-party graphic · Not an official NFL or team partnership';

const WEEK2_DIR = '/gameday/week2';

export const WEEK2_POSTERS: Week2Poster[] = [
  {
    id: 'lions-at-bills',
    away: 'Lions',
    home: 'Bills',
    eyebrow: 'Thursday Night Football',
    when: 'Thu Sep 17 · 5:15 PM PT · Prime',
    note: 'Highmark Stadium · Night game',
    feedSrc: `${WEEK2_DIR}/lions-at-bills-feed-45.jpg`,
    storySrc: `${WEEK2_DIR}/lions-at-bills-story-916.jpg`,
  },
  {
    id: 'raiders-at-chargers',
    away: 'Raiders',
    home: 'Chargers',
    eyebrow: 'Local · SoFi · Carlsbad watch party',
    when: 'Sun Sep 20 · 1:05 PM PT · CBS',
    note: 'Bolt Up · AFC West at SoFi',
    feedSrc: `${WEEK2_DIR}/raiders-at-chargers-feed-45.jpg`,
    storySrc: `${WEEK2_DIR}/raiders-at-chargers-story-916.jpg`,
    local: true,
  },
  {
    id: 'commanders-at-cowboys',
    away: 'Commanders',
    home: 'Cowboys',
    eyebrow: 'NFC East · Sunday showdown',
    when: 'Sun Sep 20 · 1:25 PM PT · FOX',
    note: 'AT&T Stadium',
    feedSrc: `${WEEK2_DIR}/commanders-at-cowboys-feed-45.jpg`,
    storySrc: `${WEEK2_DIR}/commanders-at-cowboys-story-916.jpg`,
  },
  {
    id: 'colts-at-chiefs',
    away: 'Colts',
    home: 'Chiefs',
    eyebrow: 'Sunday Night Football',
    when: 'Sun Sep 20 · 5:20 PM PT · NBC',
    note: 'Arrowhead · Night game',
    feedSrc: `${WEEK2_DIR}/colts-at-chiefs-feed-45.jpg`,
    storySrc: `${WEEK2_DIR}/colts-at-chiefs-story-916.jpg`,
  },
  {
    id: 'giants-at-rams',
    away: 'Giants',
    home: 'Rams',
    eyebrow: 'Monday Night Football · SoFi',
    when: 'Mon Sep 21 · 5:15 PM PT · ESPN/ABC',
    note: 'SoFi Stadium · Night game',
    feedSrc: `${WEEK2_DIR}/giants-at-rams-feed-45.jpg`,
    storySrc: `${WEEK2_DIR}/giants-at-rams-story-916.jpg`,
  },
];

export function getLocalWeek2Poster(): Week2Poster | undefined {
  return WEEK2_POSTERS.find((p) => p.local);
}

export function getWeek2Poster(id: string): Week2Poster | undefined {
  return WEEK2_POSTERS.find((p) => p.id === id);
}
