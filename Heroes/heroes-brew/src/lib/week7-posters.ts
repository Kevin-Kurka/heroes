/**
 * FILE: week7-posters.ts
 * PURPOSE: NFL Week 7 AHAB watch-party poster registry (feed 4:5 + story 9:16).
 *
 * OVERVIEW:
 * Single source of truth for the composed Week 7 JPGs in public/gameday/week7/.
 * Powers the /watch gallery, /watch-party index, and the home "This Week" teaser.
 *
 * DEPENDENCIES:
 * - public/gameday/week7/*.jpg
 *
 * EXPORTS:
 * - Week7Poster, WEEK7_POSTERS, WEEK7_DISCLAIMER, getLocalWeek7Poster, getWeek7Poster
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Six Week 7 matchups (Oct 22–26, 2026) with PT kickoffs and local Rams flag
 * - Chargers are on bye — no Bolt Up / Chargers-local flag this week
 *
 * RELATED FILES:
 * - src/components/Week1PosterGallery.tsx
 * - src/lib/week7-posters.test.ts
 *
 * LAST UPDATED: 2026-10-19
 * MAINTAINER: American Heroes & Brew
 */

export interface Week7Poster {
  id: string;
  away: string;
  home: string;
  eyebrow: string;
  when: string;
  note: string;
  feedSrc: string;
  storySrc: string;
  /** Local-team (LA Rams) watch party — visual priority on the site. */
  local?: boolean;
}

export const WEEK7_DISCLAIMER =
  'Fan watch-party graphic · Not an official NFL or team partnership';

const WEEK7_DIR = '/gameday/week7';

export const WEEK7_POSTERS: Week7Poster[] = [
  {
    id: 'patriots-at-bears',
    away: 'Patriots',
    home: 'Bears',
    eyebrow: 'Thursday Night Football',
    when: 'Thu Oct 22 · 5:15 PM PT · Prime',
    note: 'Soldier Field · Night game',
    feedSrc: `${WEEK7_DIR}/patriots-at-bears-feed-45.jpg`,
    storySrc: `${WEEK7_DIR}/patriots-at-bears-story-916.jpg`,
  },
  {
    id: '49ers-at-falcons',
    away: '49ers',
    home: 'Falcons',
    eyebrow: 'NFC Sunday',
    when: 'Sun Oct 25 · 10:00 AM PT · FOX',
    note: 'Mercedes-Benz Stadium · Early window',
    feedSrc: `${WEEK7_DIR}/49ers-at-falcons-feed-45.jpg`,
    storySrc: `${WEEK7_DIR}/49ers-at-falcons-story-916.jpg`,
  },
  {
    id: 'rams-at-raiders',
    away: 'Rams',
    home: 'Raiders',
    eyebrow: 'Local · Rams · Carlsbad watch party',
    when: 'Sun Oct 25 · 1:25 PM PT · FOX',
    note: 'Allegiant Stadium · LA-area',
    feedSrc: `${WEEK7_DIR}/rams-at-raiders-feed-45.jpg`,
    storySrc: `${WEEK7_DIR}/rams-at-raiders-story-916.jpg`,
    local: true,
  },
  {
    id: 'packers-at-lions',
    away: 'Packers',
    home: 'Lions',
    eyebrow: 'NFC North Sunday',
    when: 'Sun Oct 25 · 1:25 PM PT · FOX',
    note: 'Ford Field · NFC North',
    feedSrc: `${WEEK7_DIR}/packers-at-lions-feed-45.jpg`,
    storySrc: `${WEEK7_DIR}/packers-at-lions-story-916.jpg`,
  },
  {
    id: 'chiefs-at-seahawks',
    away: 'Chiefs',
    home: 'Seahawks',
    eyebrow: 'Sunday Night Football',
    when: 'Sun Oct 25 · 5:20 PM PT · NBC',
    note: 'Lumen Field · Night game',
    feedSrc: `${WEEK7_DIR}/chiefs-at-seahawks-feed-45.jpg`,
    storySrc: `${WEEK7_DIR}/chiefs-at-seahawks-story-916.jpg`,
  },
  {
    id: 'cowboys-at-eagles',
    away: 'Cowboys',
    home: 'Eagles',
    eyebrow: 'Monday Night Football',
    when: 'Mon Oct 26 · 5:15 PM PT · ESPN/ABC',
    note: 'Lincoln Financial Field · Night game',
    feedSrc: `${WEEK7_DIR}/cowboys-at-eagles-feed-45.jpg`,
    storySrc: `${WEEK7_DIR}/cowboys-at-eagles-story-916.jpg`,
  },
];

export function getLocalWeek7Poster(): Week7Poster | undefined {
  return WEEK7_POSTERS.find((p) => p.local);
}

export function getWeek7Poster(id: string): Week7Poster | undefined {
  return WEEK7_POSTERS.find((p) => p.id === id);
}
