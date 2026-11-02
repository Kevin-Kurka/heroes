/**
 * FILE: week9-posters.ts
 * PURPOSE: NFL Week 9 AHAB watch-party poster registry (feed 4:5 + story 9:16).
 *
 * OVERVIEW:
 * Single source of truth for the composed Week 9 JPGs in public/gameday/week9/.
 * Powers the /watch gallery, /watch-party index, and the home "This Week" teaser.
 *
 * DEPENDENCIES:
 * - public/gameday/week9/*.jpg
 *
 * EXPORTS:
 * - Week9Poster, WEEK9_POSTERS, WEEK9_DISCLAIMER, getLocalWeek9Poster, getWeek9Poster
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Seven Week 9 matchups (Nov 5–9, 2026) with PT kickoffs and local Chargers flag
 * - Texans at Chargers is the local Bolt Up watch party
 *
 * RELATED FILES:
 * - src/components/Week1PosterGallery.tsx
 * - src/lib/week9-posters.test.ts
 *
 * LAST UPDATED: 2026-11-02
 * MAINTAINER: American Heroes & Brew
 */

export interface Week9Poster {
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

export const WEEK9_DISCLAIMER =
  'Fan watch-party graphic · Not an official NFL or team partnership';

const WEEK9_DIR = '/gameday/week9';

export const WEEK9_POSTERS: Week9Poster[] = [
  {
    id: 'jaguars-at-ravens',
    away: 'Jaguars',
    home: 'Ravens',
    eyebrow: 'Thursday Night Football',
    when: 'Thu Nov 5 · 5:15 PM PT · Prime',
    note: 'M&T Bank Stadium · Night game',
    feedSrc: `${WEEK9_DIR}/jaguars-at-ravens-feed-45.jpg`,
    storySrc: `${WEEK9_DIR}/jaguars-at-ravens-story-916.jpg`,
  },
  {
    id: 'broncos-at-panthers',
    away: 'Broncos',
    home: 'Panthers',
    eyebrow: 'Watch \'Em All Sunday',
    when: 'Sun Nov 8 · 10:00 AM PT · CBS',
    note: 'Bank of America Stadium · Early window',
    feedSrc: `${WEEK9_DIR}/broncos-at-panthers-feed-45.jpg`,
    storySrc: `${WEEK9_DIR}/broncos-at-panthers-story-916.jpg`,
  },
  {
    id: 'giants-at-eagles',
    away: 'Giants',
    home: 'Eagles',
    eyebrow: 'NFC East Sunday',
    when: 'Sun Nov 8 · 10:00 AM PT · FOX',
    note: 'Lincoln Financial Field · NFC East rivalry',
    feedSrc: `${WEEK9_DIR}/giants-at-eagles-feed-45.jpg`,
    storySrc: `${WEEK9_DIR}/giants-at-eagles-story-916.jpg`,
  },
  {
    id: 'texans-at-chargers',
    away: 'Texans',
    home: 'Chargers',
    eyebrow: 'Local · Bolt Up · Chargers watch party',
    when: 'Sun Nov 8 · 1:05 PM PT · CBS',
    note: 'SoFi Stadium · Chargers home game',
    feedSrc: `${WEEK9_DIR}/texans-at-chargers-feed-45.jpg`,
    storySrc: `${WEEK9_DIR}/texans-at-chargers-story-916.jpg`,
    local: true,
  },
  {
    id: 'packers-at-patriots',
    away: 'Packers',
    home: 'Patriots',
    eyebrow: 'Watch \'Em All Sunday',
    when: 'Sun Nov 8 · 1:25 PM PT · FOX',
    note: 'Gillette Stadium · Afternoon window',
    feedSrc: `${WEEK9_DIR}/packers-at-patriots-feed-45.jpg`,
    storySrc: `${WEEK9_DIR}/packers-at-patriots-story-916.jpg`,
  },
  {
    id: 'buccaneers-at-bears',
    away: 'Buccaneers',
    home: 'Bears',
    eyebrow: 'Sunday Night Football',
    when: 'Sun Nov 8 · 5:20 PM PT · NBC',
    note: 'Soldier Field · Night game',
    feedSrc: `${WEEK9_DIR}/buccaneers-at-bears-feed-45.jpg`,
    storySrc: `${WEEK9_DIR}/buccaneers-at-bears-story-916.jpg`,
  },
  {
    id: 'bills-at-vikings',
    away: 'Bills',
    home: 'Vikings',
    eyebrow: 'Monday Night Football',
    when: 'Mon Nov 9 · 5:15 PM PT · ESPN',
    note: 'U.S. Bank Stadium · Night game',
    feedSrc: `${WEEK9_DIR}/bills-at-vikings-feed-45.jpg`,
    storySrc: `${WEEK9_DIR}/bills-at-vikings-story-916.jpg`,
  },
];

export function getLocalWeek9Poster(): Week9Poster | undefined {
  return WEEK9_POSTERS.find((p) => p.local);
}

export function getWeek9Poster(id: string): Week9Poster | undefined {
  return WEEK9_POSTERS.find((p) => p.id === id);
}
