/**
 * FILE: fantasy.ts
 * PURPOSE: Heroes Fantasy Football League copy + official-league config.
 *
 * OVERVIEW:
 * Guest-facing copy for /fantasy-football. Official 2026 drafts are completed
 * and the season is underway — FANTASY_ARCHIVED gates signup UI and the API.
 * Bundled OFFICIAL_LEAGUES stay as historical draft-slot config.
 *
 * DEPENDENCIES:
 * - none
 *
 * EXPORTS:
 * - FANTASY_ARCHIVED, YAHOO_FANTASY_URL, OfficialLeague, LEAGUE_CAPACITY,
 *   MAX_LEAGUES_PER_USER, OFFICIAL_LEAGUES, leagueDateText, FANTASY
 *
 * IMPLEMENTATION STATUS:
 * - ✅ 2026 season archived (drafts completed, no open signup)
 * - ✅ Historical Labor Day weekend 2026 draft slots retained
 *
 * RELATED FILES:
 * - src/lib/fantasy-leagues.ts
 * - src/lib/fantasy-archive.test.ts
 * - src/components/FantasyPageView.tsx
 *
 * LAST UPDATED: 2026-09-11
 * MAINTAINER: American Heroes & Brew
 */

/** Official Heroes drafts are done for 2026. Flip to false to reopen signup. */
export const FANTASY_ARCHIVED = true;

export const YAHOO_FANTASY_URL = 'https://football.fantasysports.yahoo.com/';

/** A draft slot = one official Heroes league (10 players). `id` is a non-date
 *  token (bundled config / form value). Live joins key on the Sheet league name. */
export interface OfficialLeague {
  id: string;        // 'sep05-sat'
  label: string;     // 'Sat, Sep 5'
  time?: string;     // '4:00 PM'
  capacity: number;  // 10
}

export const LEAGUE_CAPACITY = 9; // 9 open spots per league — the commissioner takes the 10th
/** A player can be in at most this many official Heroes leagues. */
export const MAX_LEAGUES_PER_USER = 3;

/** Completed official drafts, Labor Day weekend 2026 (historical). */
export const OFFICIAL_LEAGUES: OfficialLeague[] = [
  { id: 'sep05-sat', label: 'Sat, Sep 5', time: '4:00 PM', capacity: 10 },
  { id: 'sep06-sun', label: 'Sun, Sep 6', time: '3:00 PM', capacity: 10 },
];

export function leagueDateText(l: OfficialLeague): string {
  return l.time ? `${l.label} · ${l.time}` : l.label;
}

export const FANTASY = {
  title: 'Heroes Fantasy Football League',
  tagline: 'Drafts are completed. The 2026 season is underway.',
  intro: [
    'American Heroes & Brew hosted official Fantasy Football drafts at the bar. Every league is filled and the season is underway — catch every NFL game on 16 TVs in Carlsbad Village.',
    'League champions still win a $100 American Heroes & Brew gift card, claimed in person at the bar on championship day.',
  ],

  perks: [
    {
      icon: 'trophy',
      title: '$100 gift card to the winner',
      body:
        'Each league’s champion wins a $100 American Heroes & Brew gift card. Winners must claim it in person at the bar on championship day.',
    },
    {
      icon: 'wings',
      title: 'Drafts hosted at Heroes',
      body:
        'Leagues drafted at American Heroes & Brew over wings and cold beer, with draft-day munchies on the house.',
    },
    {
      icon: 'tv',
      title: 'Every game on the big screens',
      body:
        'The season is on. Watch every NFL kickoff on 16 TVs — Sundays, Thursday Night, and Monday Night Football.',
    },
  ],

  yahoo: {
    intro:
      'Heroes leagues run on Yahoo Fantasy. Drafts are completed for 2026; managers play out the season there.',
    steps: [
      'Leagues were set up on Yahoo Fantasy before the season.',
      'Managers drafted at American Heroes & Brew or on Yahoo.',
      'Come watch the games here — every NFL matchup on 16 TVs.',
    ],
  },

  faqs: [
    {
      question: 'How do I join the Heroes Fantasy Football League?',
      answer:
        'Drafts are completed and signup is closed for the 2026 season. Come watch every NFL game on 16 TVs in Carlsbad Village — walk-ins welcome, no cover.',
    },
    {
      question: 'When were the official Heroes league drafts?',
      answer:
        'Official Heroes drafts ran in early September 2026 and are now completed. The season is underway.',
    },
    {
      question: 'What does the winner get?',
      answer:
        'Each league’s champion wins a $100 American Heroes & Brew gift card. The winner must be present in person at the bar on championship day to claim it.',
    },
    {
      question: 'Can my own league draft at American Heroes & Brew?',
      answer:
        'The 2026 draft window is closed. Bring the league in to watch games all season — 16 TVs, full bar, walk-ins welcome.',
    },
    {
      question: 'Is there an entry fee?',
      answer:
        'No. The Heroes Fantasy Football League was free to enter — American Heroes & Brew provides the prize.',
    },
  ],
};
