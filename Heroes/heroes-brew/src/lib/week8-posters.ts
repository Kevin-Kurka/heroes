/**
 * FILE: week8-posters.ts
 * PURPOSE: NFL Week 8 AHAB watch-party poster registry (feed 4:5 + story 9:16).
 *
 * OVERVIEW:
 * Single source of truth for the composed Week 8 JPGs in public/gameday/week8/.
 * Powers the /watch gallery, /watch-party index, and the home "This Week" teaser.
 *
 * DEPENDENCIES:
 * - public/gameday/week8/*.jpg
 *
 * EXPORTS:
 * - Week8Poster, WEEK8_POSTERS, WEEK8_DISCLAIMER, getLocalWeek8Poster, getWeek8Poster
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Seven Week 8 matchups (Oct 29–Nov 2, 2026) with PT kickoffs and local Chargers flag
 * - Chargers at Rams is the local Bolt Up watch party
 *
 * RELATED FILES:
 * - src/components/Week1PosterGallery.tsx
 * - src/lib/week8-posters.test.ts
 *
 * LAST UPDATED: 2026-10-26
 * MAINTAINER: American Heroes & Brew
 */

export interface Week8Poster {
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

export const WEEK8_DISCLAIMER =
  'Fan watch-party graphic · Not an official NFL or team partnership';

const WEEK8_DIR = '/gameday/week8';

export const WEEK8_POSTERS: Week8Poster[] = [
  {
    id: 'panthers-at-packers',
    away: 'Panthers',
    home: 'Packers',
    eyebrow: 'Thursday Night Football',
    when: 'Thu Oct 29 · 5:15 PM PT · Prime',
    note: 'Lambeau Field · Night game',
    feedSrc: `${WEEK8_DIR}/panthers-at-packers-feed-45.jpg`,
    storySrc: `${WEEK8_DIR}/panthers-at-packers-story-916.jpg`,
  },
  {
    id: 'ravens-at-bills',
    away: 'Ravens',
    home: 'Bills',
    eyebrow: 'AFC Sunday',
    when: 'Sun Nov 1 · 10:00 AM PT · CBS',
    note: 'Highmark Stadium · Early window',
    feedSrc: `${WEEK8_DIR}/ravens-at-bills-feed-45.jpg`,
    storySrc: `${WEEK8_DIR}/ravens-at-bills-story-916.jpg`,
  },
  {
    id: 'vikings-at-lions',
    away: 'Vikings',
    home: 'Lions',
    eyebrow: 'NFC North Sunday',
    when: 'Sun Nov 1 · 10:00 AM PT · FOX',
    note: 'Ford Field · NFC North',
    feedSrc: `${WEEK8_DIR}/vikings-at-lions-feed-45.jpg`,
    storySrc: `${WEEK8_DIR}/vikings-at-lions-story-916.jpg`,
  },
  {
    id: 'chargers-at-rams',
    away: 'Chargers',
    home: 'Rams',
    eyebrow: 'Local · Bolt Up · Chargers watch party',
    when: 'Sun Nov 1 · 1:05 PM PT · FOX',
    note: 'SoFi Stadium · LA showdown',
    feedSrc: `${WEEK8_DIR}/chargers-at-rams-feed-45.jpg`,
    storySrc: `${WEEK8_DIR}/chargers-at-rams-story-916.jpg`,
    local: true,
  },
  {
    id: 'chiefs-at-broncos',
    away: 'Chiefs',
    home: 'Broncos',
    eyebrow: 'AFC West Sunday',
    when: 'Sun Nov 1 · 1:25 PM PT · CBS',
    note: 'Empower Field at Mile High · AFC West',
    feedSrc: `${WEEK8_DIR}/chiefs-at-broncos-feed-45.jpg`,
    storySrc: `${WEEK8_DIR}/chiefs-at-broncos-story-916.jpg`,
  },
  {
    id: 'eagles-at-commanders',
    away: 'Eagles',
    home: 'Commanders',
    eyebrow: 'Sunday Night Football',
    when: 'Sun Nov 1 · 5:20 PM PT · NBC',
    note: 'Northwest Stadium · Night game',
    feedSrc: `${WEEK8_DIR}/eagles-at-commanders-feed-45.jpg`,
    storySrc: `${WEEK8_DIR}/eagles-at-commanders-story-916.jpg`,
  },
  {
    id: 'bears-at-seahawks',
    away: 'Bears',
    home: 'Seahawks',
    eyebrow: 'Monday Night Football',
    when: 'Mon Nov 2 · 5:15 PM PT · ESPN',
    note: 'Lumen Field · Night game',
    feedSrc: `${WEEK8_DIR}/bears-at-seahawks-feed-45.jpg`,
    storySrc: `${WEEK8_DIR}/bears-at-seahawks-story-916.jpg`,
  },
];

export function getLocalWeek8Poster(): Week8Poster | undefined {
  return WEEK8_POSTERS.find((p) => p.local);
}

export function getWeek8Poster(id: string): Week8Poster | undefined {
  return WEEK8_POSTERS.find((p) => p.id === id);
}
