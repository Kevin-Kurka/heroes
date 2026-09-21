/**
 * FILE: week3-posters.ts
 * PURPOSE: NFL Week 3 AHAB watch-party poster registry (feed 4:5 + story 9:16).
 *
 * OVERVIEW:
 * Single source of truth for the composed Week 3 JPGs in public/gameday/week3/.
 * Powers the /watch gallery, /watch-party index, and the home "This Week" teaser.
 *
 * DEPENDENCIES:
 * - public/gameday/week3/*.jpg
 *
 * EXPORTS:
 * - Week3Poster, WEEK3_POSTERS, WEEK3_DISCLAIMER, getLocalWeek3Poster
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Five Week 3 matchups with PT kickoffs and local Chargers flag
 *
 * RELATED FILES:
 * - src/components/Week1PosterGallery.tsx
 * - src/lib/week3-posters.test.ts
 *
 * LAST UPDATED: 2026-09-21
 * MAINTAINER: American Heroes & Brew
 */

export interface Week3Poster {
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

export const WEEK3_DISCLAIMER =
  'Fan watch-party graphic · Not an official NFL or team partnership';

const WEEK3_DIR = '/gameday/week3';

export const WEEK3_POSTERS: Week3Poster[] = [
  {
    id: 'falcons-at-packers',
    away: 'Falcons',
    home: 'Packers',
    eyebrow: 'Thursday Night Football',
    when: 'Thu Sep 24 · 5:15 PM PT · Prime',
    note: 'Lambeau Field · Night game',
    feedSrc: `${WEEK3_DIR}/falcons-at-packers-feed-45.jpg`,
    storySrc: `${WEEK3_DIR}/falcons-at-packers-story-916.jpg`,
  },
  {
    id: 'chargers-at-bills',
    away: 'Chargers',
    home: 'Bills',
    eyebrow: 'Local · Chargers · Carlsbad watch party',
    when: 'Sun Sep 27 · 10:00 AM PT · FOX',
    note: 'Bolt Up · Highmark Stadium',
    feedSrc: `${WEEK3_DIR}/chargers-at-bills-feed-45.jpg`,
    storySrc: `${WEEK3_DIR}/chargers-at-bills-story-916.jpg`,
    local: true,
  },
  {
    id: 'ravens-at-cowboys',
    away: 'Ravens',
    home: 'Cowboys',
    eyebrow: 'Sunday showdown · Rio',
    when: 'Sun Sep 27 · 1:25 PM PT · CBS',
    note: 'Rio de Janeiro · International game',
    feedSrc: `${WEEK3_DIR}/ravens-at-cowboys-feed-45.jpg`,
    storySrc: `${WEEK3_DIR}/ravens-at-cowboys-story-916.jpg`,
  },
  {
    id: 'rams-at-broncos',
    away: 'Rams',
    home: 'Broncos',
    eyebrow: 'Sunday Night Football',
    when: 'Sun Sep 27 · 5:20 PM PT · NBC',
    note: 'Empower Field · Night game',
    feedSrc: `${WEEK3_DIR}/rams-at-broncos-feed-45.jpg`,
    storySrc: `${WEEK3_DIR}/rams-at-broncos-story-916.jpg`,
  },
  {
    id: 'eagles-at-bears',
    away: 'Eagles',
    home: 'Bears',
    eyebrow: 'Monday Night Football',
    when: 'Mon Sep 28 · 5:15 PM PT · ESPN/ABC',
    note: 'Soldier Field · Night game',
    feedSrc: `${WEEK3_DIR}/eagles-at-bears-feed-45.jpg`,
    storySrc: `${WEEK3_DIR}/eagles-at-bears-story-916.jpg`,
  },
];

export function getLocalWeek3Poster(): Week3Poster | undefined {
  return WEEK3_POSTERS.find((p) => p.local);
}

export function getWeek3Poster(id: string): Week3Poster | undefined {
  return WEEK3_POSTERS.find((p) => p.id === id);
}
