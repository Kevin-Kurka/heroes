/**
 * FILE: week1-posters.ts
 * PURPOSE: NFL Week 1 AHAB watch-party poster registry (feed 4:5 + story 9:16).
 *
 * OVERVIEW:
 * Single source of truth for the composed Week 1 JPGs in public/gameday/week1/.
 * Powers the /watch gallery, /watch-party index, and the home "This Week" teaser.
 *
 * DEPENDENCIES:
 * - public/gameday/week1/*.jpg
 *
 * EXPORTS:
 * - Week1Poster, WEEK1_POSTERS, WEEK1_DISCLAIMER, getLocalWeek1Poster
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Five Week 1 matchups with PT kickoffs and local Chargers flag
 *
 * RELATED FILES:
 * - src/components/Week1PosterGallery.tsx
 * - src/lib/week1-posters.test.ts
 *
 * LAST UPDATED: 2026-09-07
 * MAINTAINER: American Heroes & Brew
 */

export interface Week1Poster {
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

export const WEEK1_DISCLAIMER =
  'Fan watch-party graphic · Not an official NFL or team partnership';

const WEEK1_DIR = '/gameday/week1';

export const WEEK1_POSTERS: Week1Poster[] = [
  {
    id: 'patriots-at-seahawks',
    away: 'Patriots',
    home: 'Seahawks',
    eyebrow: 'NFL Kickoff · Season opener',
    when: 'Wed Sep 9 · 5:20 PM PT · NBC',
    note: 'Super Bowl rematch · Lumen Field',
    feedSrc: `${WEEK1_DIR}/patriots-at-seahawks-feed-45.jpg`,
    storySrc: `${WEEK1_DIR}/patriots-at-seahawks-story-916.jpg`,
  },
  {
    id: '49ers-at-rams',
    away: '49ers',
    home: 'Rams',
    eyebrow: 'NFC West · Melbourne · Netflix',
    when: 'Thu Sep 10 · 5:35 PM PT · Netflix',
    note: 'Australia · Melbourne Cricket Ground',
    feedSrc: `${WEEK1_DIR}/49ers-at-rams-feed-45.jpg`,
    storySrc: `${WEEK1_DIR}/49ers-at-rams-story-916.jpg`,
  },
  {
    id: 'cardinals-at-chargers',
    away: 'Cardinals',
    home: 'Chargers',
    eyebrow: 'Local · SoFi · Carlsbad watch party',
    when: 'Sun Sep 13 · 1:25 PM PT · CBS',
    note: 'Bolt Up · Week 1 at SoFi',
    feedSrc: `${WEEK1_DIR}/cardinals-at-chargers-feed-45.jpg`,
    storySrc: `${WEEK1_DIR}/cardinals-at-chargers-story-916.jpg`,
    local: true,
  },
  {
    id: 'cowboys-at-giants',
    away: 'Cowboys',
    home: 'Giants',
    eyebrow: 'Sunday Night Football',
    when: 'Sun Sep 13 · 5:20 PM PT · NBC',
    note: 'MetLife Stadium',
    feedSrc: `${WEEK1_DIR}/cowboys-at-giants-feed-45.jpg`,
    storySrc: `${WEEK1_DIR}/cowboys-at-giants-story-916.jpg`,
  },
  {
    id: 'broncos-at-chiefs',
    away: 'Broncos',
    home: 'Chiefs',
    eyebrow: 'Monday Night Football',
    when: 'Mon Sep 14 · 5:15 PM PT · ESPN/ABC',
    note: 'Arrowhead · Night game',
    feedSrc: `${WEEK1_DIR}/broncos-at-chiefs-feed-45.jpg`,
    storySrc: `${WEEK1_DIR}/broncos-at-chiefs-story-916.jpg`,
  },
];

export function getLocalWeek1Poster(): Week1Poster | undefined {
  return WEEK1_POSTERS.find((p) => p.local);
}

export function getWeek1Poster(id: string): Week1Poster | undefined {
  return WEEK1_POSTERS.find((p) => p.id === id);
}
