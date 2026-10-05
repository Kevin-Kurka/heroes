/**
 * FILE: week5-posters.ts
 * PURPOSE: NFL Week 5 AHAB watch-party poster registry (feed 4:5 + story 9:16).
 *
 * OVERVIEW:
 * Single source of truth for the composed Week 5 JPGs in public/gameday/week5/.
 * Powers the /watch gallery, /watch-party index, and the home "This Week" teaser.
 *
 * DEPENDENCIES:
 * - public/gameday/week5/*.jpg
 *
 * EXPORTS:
 * - Week5Poster, WEEK5_POSTERS, WEEK5_DISCLAIMER, getLocalWeek5Poster, getWeek5Poster
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Six Week 5 matchups (Oct 8–12, 2026) with PT kickoffs and local Chargers flag
 *
 * RELATED FILES:
 * - src/components/Week1PosterGallery.tsx
 * - src/lib/week5-posters.test.ts
 *
 * LAST UPDATED: 2026-10-05
 * MAINTAINER: American Heroes & Brew
 */

export interface Week5Poster {
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

export const WEEK5_DISCLAIMER =
  'Fan watch-party graphic · Not an official NFL or team partnership';

const WEEK5_DIR = '/gameday/week5';

export const WEEK5_POSTERS: Week5Poster[] = [
  {
    id: 'buccaneers-at-cowboys',
    away: 'Buccaneers',
    home: 'Cowboys',
    eyebrow: 'Thursday Night Football',
    when: 'Thu Oct 8 · 5:15 PM PT · Prime',
    note: 'AT&T Stadium · Night game',
    feedSrc: `${WEEK5_DIR}/buccaneers-at-cowboys-feed-45.jpg`,
    storySrc: `${WEEK5_DIR}/buccaneers-at-cowboys-story-916.jpg`,
  },
  {
    id: 'broncos-at-chargers',
    away: 'Broncos',
    home: 'Chargers',
    eyebrow: 'Local · Chargers · Carlsbad watch party',
    when: 'Sun Oct 11 · 1:05 PM PT · CBS',
    note: 'Bolt Up · SoFi Stadium',
    feedSrc: `${WEEK5_DIR}/broncos-at-chargers-feed-45.jpg`,
    storySrc: `${WEEK5_DIR}/broncos-at-chargers-story-916.jpg`,
    local: true,
  },
  {
    id: '49ers-at-seahawks',
    away: '49ers',
    home: 'Seahawks',
    eyebrow: 'NFC West Sunday',
    when: 'Sun Oct 11 · 1:25 PM PT · FOX',
    note: 'Lumen Field · Division rivalry',
    feedSrc: `${WEEK5_DIR}/49ers-at-seahawks-feed-45.jpg`,
    storySrc: `${WEEK5_DIR}/49ers-at-seahawks-story-916.jpg`,
  },
  {
    id: 'bears-at-packers',
    away: 'Bears',
    home: 'Packers',
    eyebrow: 'NFC North Sunday',
    when: 'Sun Oct 11 · 1:25 PM PT · FOX',
    note: 'Lambeau Field · Oldest rivalry',
    feedSrc: `${WEEK5_DIR}/bears-at-packers-feed-45.jpg`,
    storySrc: `${WEEK5_DIR}/bears-at-packers-story-916.jpg`,
  },
  {
    id: 'ravens-at-falcons',
    away: 'Ravens',
    home: 'Falcons',
    eyebrow: 'Sunday Night Football',
    when: 'Sun Oct 11 · 5:20 PM PT · NBC',
    note: 'Mercedes-Benz Stadium · Night game',
    feedSrc: `${WEEK5_DIR}/ravens-at-falcons-feed-45.jpg`,
    storySrc: `${WEEK5_DIR}/ravens-at-falcons-story-916.jpg`,
  },
  {
    id: 'bills-at-rams',
    away: 'Bills',
    home: 'Rams',
    eyebrow: 'Monday Night Football',
    when: 'Mon Oct 12 · 5:15 PM PT · ESPN/ABC',
    note: 'SoFi Stadium · Night game',
    feedSrc: `${WEEK5_DIR}/bills-at-rams-feed-45.jpg`,
    storySrc: `${WEEK5_DIR}/bills-at-rams-story-916.jpg`,
  },
];

export function getLocalWeek5Poster(): Week5Poster | undefined {
  return WEEK5_POSTERS.find((p) => p.local);
}

export function getWeek5Poster(id: string): Week5Poster | undefined {
  return WEEK5_POSTERS.find((p) => p.id === id);
}
