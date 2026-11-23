/**
 * FILE: week12-posters.ts
 * PURPOSE: NFL Week 12 AHAB watch-party poster registry (feed 4:5 + story 9:16).
 *
 * OVERVIEW:
 * Single source of truth for the composed Week 12 JPGs in public/gameday/week12/.
 * Powers the /watch gallery, /watch-party index, and the home "This Week" teaser.
 *
 * DEPENDENCIES:
 * - public/gameday/week12/*.jpg
 *
 * EXPORTS:
 * - Week12Poster, WEEK12_POSTERS, WEEK12_DISCLAIMER, getLocalWeek12Poster, getWeek12Poster
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Ten Week 12 matchups (Thanksgiving week, Wed Nov 25–Mon Nov 30, 2026) with PT kickoffs
 * - Patriots at Chargers (Sun 1:05 PM PT, CBS) is the local Bolt Up watch party
 *
 * RELATED FILES:
 * - src/components/Week1PosterGallery.tsx
 * - src/lib/week12-posters.test.ts
 *
 * LAST UPDATED: 2026-11-23
 * MAINTAINER: American Heroes & Brew
 */

export interface Week12Poster {
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

export const WEEK12_DISCLAIMER =
  'Fan watch-party graphic · Not an official NFL or team partnership';

const WEEK12_DIR = '/gameday/week12';

export const WEEK12_POSTERS: Week12Poster[] = [
  {
    id: 'packers-at-rams',
    away: 'Packers',
    home: 'Rams',
    eyebrow: 'Thanksgiving Eve',
    when: 'Wed Nov 25 · 5:00 PM PT · Netflix',
    note: 'SoFi Stadium · Thanksgiving Eve night game',
    feedSrc: `${WEEK12_DIR}/packers-at-rams-feed-45.jpg`,
    storySrc: `${WEEK12_DIR}/packers-at-rams-story-916.jpg`,
  },
  {
    id: 'bears-at-lions',
    away: 'Bears',
    home: 'Lions',
    eyebrow: 'Thanksgiving',
    when: 'Thu Nov 26 · 10:00 AM PT · CBS',
    note: 'Ford Field · Thanksgiving morning',
    feedSrc: `${WEEK12_DIR}/bears-at-lions-feed-45.jpg`,
    storySrc: `${WEEK12_DIR}/bears-at-lions-story-916.jpg`,
  },
  {
    id: 'eagles-at-cowboys',
    away: 'Eagles',
    home: 'Cowboys',
    eyebrow: 'Thanksgiving',
    when: 'Thu Nov 26 · 1:30 PM PT · FOX',
    note: 'AT&T Stadium · Thanksgiving afternoon',
    feedSrc: `${WEEK12_DIR}/eagles-at-cowboys-feed-45.jpg`,
    storySrc: `${WEEK12_DIR}/eagles-at-cowboys-story-916.jpg`,
  },
  {
    id: 'chiefs-at-bills',
    away: 'Chiefs',
    home: 'Bills',
    eyebrow: 'Thanksgiving Night Football',
    when: 'Thu Nov 26 · 5:20 PM PT · NBC',
    note: 'Highmark Stadium · Thanksgiving night',
    feedSrc: `${WEEK12_DIR}/chiefs-at-bills-feed-45.jpg`,
    storySrc: `${WEEK12_DIR}/chiefs-at-bills-story-916.jpg`,
  },
  {
    id: 'broncos-at-steelers',
    away: 'Broncos',
    home: 'Steelers',
    eyebrow: 'Black Friday',
    when: 'Fri Nov 27 · 12:00 PM PT · Prime',
    note: 'Acrisure Stadium · Black Friday',
    feedSrc: `${WEEK12_DIR}/broncos-at-steelers-feed-45.jpg`,
    storySrc: `${WEEK12_DIR}/broncos-at-steelers-story-916.jpg`,
  },
  {
    id: 'falcons-at-vikings',
    away: 'Falcons',
    home: 'Vikings',
    eyebrow: 'Watch \'Em All Sunday',
    when: 'Sun Nov 29 · 10:00 AM PT · FOX',
    note: 'U.S. Bank Stadium · Early window',
    feedSrc: `${WEEK12_DIR}/falcons-at-vikings-feed-45.jpg`,
    storySrc: `${WEEK12_DIR}/falcons-at-vikings-story-916.jpg`,
  },
  {
    id: 'patriots-at-chargers',
    away: 'Patriots',
    home: 'Chargers',
    eyebrow: 'Local · Bolt Up · Chargers watch party',
    when: 'Sun Nov 29 · 1:05 PM PT · CBS',
    note: 'SoFi Stadium · Chargers home game',
    feedSrc: `${WEEK12_DIR}/patriots-at-chargers-feed-45.jpg`,
    storySrc: `${WEEK12_DIR}/patriots-at-chargers-story-916.jpg`,
    local: true,
  },
  {
    id: 'seahawks-at-49ers',
    away: 'Seahawks',
    home: '49ers',
    eyebrow: 'Watch \'Em All Sunday',
    when: 'Sun Nov 29 · 1:25 PM PT · FOX',
    note: 'Levi\'s Stadium · NFC West afternoon',
    feedSrc: `${WEEK12_DIR}/seahawks-at-49ers-feed-45.jpg`,
    storySrc: `${WEEK12_DIR}/seahawks-at-49ers-story-916.jpg`,
  },
  {
    id: 'raiders-at-browns',
    away: 'Raiders',
    home: 'Browns',
    eyebrow: 'Sunday Night Football',
    when: 'Sun Nov 29 · 5:20 PM PT · NBC',
    note: 'Huntington Bank Field · Night game',
    feedSrc: `${WEEK12_DIR}/raiders-at-browns-feed-45.jpg`,
    storySrc: `${WEEK12_DIR}/raiders-at-browns-story-916.jpg`,
  },
  {
    id: 'panthers-at-buccaneers',
    away: 'Panthers',
    home: 'Buccaneers',
    eyebrow: 'Monday Night Football',
    when: 'Mon Nov 30 · 5:15 PM PT · ESPN',
    note: 'Raymond James Stadium · Night game',
    feedSrc: `${WEEK12_DIR}/panthers-at-buccaneers-feed-45.jpg`,
    storySrc: `${WEEK12_DIR}/panthers-at-buccaneers-story-916.jpg`,
  },
];

export function getLocalWeek12Poster(): Week12Poster | undefined {
  return WEEK12_POSTERS.find((p) => p.local);
}

export function getWeek12Poster(id: string): Week12Poster | undefined {
  return WEEK12_POSTERS.find((p) => p.id === id);
}
