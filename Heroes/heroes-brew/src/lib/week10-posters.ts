/**
 * FILE: week10-posters.ts
 * PURPOSE: NFL Week 10 AHAB watch-party poster registry (feed 4:5 + story 9:16).
 *
 * OVERVIEW:
 * Single source of truth for the composed Week 10 JPGs in public/gameday/week10/.
 * Powers the /watch gallery, /watch-party index, and the home "This Week" teaser.
 *
 * DEPENDENCIES:
 * - public/gameday/week10/*.jpg
 *
 * EXPORTS:
 * - Week10Poster, WEEK10_POSTERS, WEEK10_DISCLAIMER, getLocalWeek10Poster, getWeek10Poster
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Seven Week 10 matchups (Nov 12–16, 2026) with PT kickoffs and local Chargers flag
 * - Chargers at Ravens (MNF) is the local Bolt Up watch party
 *
 * RELATED FILES:
 * - src/components/Week1PosterGallery.tsx
 * - src/lib/week10-posters.test.ts
 *
 * LAST UPDATED: 2026-11-09
 * MAINTAINER: American Heroes & Brew
 */

export interface Week10Poster {
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

export const WEEK10_DISCLAIMER =
  'Fan watch-party graphic · Not an official NFL or team partnership';

const WEEK10_DIR = '/gameday/week10';

export const WEEK10_POSTERS: Week10Poster[] = [
  {
    id: 'commanders-at-giants',
    away: 'Commanders',
    home: 'Giants',
    eyebrow: 'Thursday Night Football',
    when: 'Thu Nov 12 · 5:15 PM PT · Prime',
    note: 'MetLife Stadium · Night game',
    feedSrc: `${WEEK10_DIR}/commanders-at-giants-feed-45.jpg`,
    storySrc: `${WEEK10_DIR}/commanders-at-giants-story-916.jpg`,
  },
  {
    id: 'vikings-at-packers',
    away: 'Vikings',
    home: 'Packers',
    eyebrow: 'Watch \'Em All Sunday',
    when: 'Sun Nov 15 · 10:00 AM PT · FOX',
    note: 'Lambeau Field · NFC North rivalry',
    feedSrc: `${WEEK10_DIR}/vikings-at-packers-feed-45.jpg`,
    storySrc: `${WEEK10_DIR}/vikings-at-packers-story-916.jpg`,
  },
  {
    id: 'chiefs-at-falcons',
    away: 'Chiefs',
    home: 'Falcons',
    eyebrow: 'Watch \'Em All Sunday',
    when: 'Sun Nov 15 · 10:00 AM PT · CBS',
    note: 'Mercedes-Benz Stadium · Early window',
    feedSrc: `${WEEK10_DIR}/chiefs-at-falcons-feed-45.jpg`,
    storySrc: `${WEEK10_DIR}/chiefs-at-falcons-story-916.jpg`,
  },
  {
    id: 'rams-at-cardinals',
    away: 'Rams',
    home: 'Cardinals',
    eyebrow: 'Watch \'Em All Sunday',
    when: 'Sun Nov 15 · 1:05 PM PT · CBS',
    note: 'State Farm Stadium · NFC West afternoon',
    feedSrc: `${WEEK10_DIR}/rams-at-cardinals-feed-45.jpg`,
    storySrc: `${WEEK10_DIR}/rams-at-cardinals-story-916.jpg`,
  },
  {
    id: '49ers-at-cowboys',
    away: '49ers',
    home: 'Cowboys',
    eyebrow: 'Watch \'Em All Sunday',
    when: 'Sun Nov 15 · 1:25 PM PT · FOX',
    note: 'AT&T Stadium · Afternoon window',
    feedSrc: `${WEEK10_DIR}/49ers-at-cowboys-feed-45.jpg`,
    storySrc: `${WEEK10_DIR}/49ers-at-cowboys-story-916.jpg`,
  },
  {
    id: 'steelers-at-bengals',
    away: 'Steelers',
    home: 'Bengals',
    eyebrow: 'Sunday Night Football',
    when: 'Sun Nov 15 · 5:20 PM PT · NBC',
    note: 'Paycor Stadium · Night game',
    feedSrc: `${WEEK10_DIR}/steelers-at-bengals-feed-45.jpg`,
    storySrc: `${WEEK10_DIR}/steelers-at-bengals-story-916.jpg`,
  },
  {
    id: 'chargers-at-ravens',
    away: 'Chargers',
    home: 'Ravens',
    eyebrow: 'Local · Bolt Up · Chargers on Monday Night Football',
    when: 'Mon Nov 16 · 5:15 PM PT · ESPN',
    note: 'M&T Bank Stadium · Chargers night game',
    feedSrc: `${WEEK10_DIR}/chargers-at-ravens-feed-45.jpg`,
    storySrc: `${WEEK10_DIR}/chargers-at-ravens-story-916.jpg`,
    local: true,
  },
];

export function getLocalWeek10Poster(): Week10Poster | undefined {
  return WEEK10_POSTERS.find((p) => p.local);
}

export function getWeek10Poster(id: string): Week10Poster | undefined {
  return WEEK10_POSTERS.find((p) => p.id === id);
}
