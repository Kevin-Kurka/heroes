/**
 * "Heroes Fantasy Football League" content + official-league config for
 * /fantasy-football.
 *
 * Two paths, two separate signup cards (separate Google Sheet tabs):
 *  - JOIN a Heroes league  → name, email, pick an official draft date (cap 10/league)
 *  - REGISTER your league  → commissioner name, league name, email, phone, draft date
 *
 * Official Heroes leagues: 6 leagues × 10 players, drafting the two weekends
 * before the 2026 NFL kickoff and ending on Labor Day weekend — Fridays at 4pm,
 * plus Saturdays and Sundays. Signups land in a Google Sheet via Apps Script
 * (env FANTASY_SIGNUP_URL); live per-league counts read back via FANTASY_COUNTS_URL.
 * See docs/fantasy-football-signup-setup.md.
 */

export const YAHOO_FANTASY_URL = 'https://football.fantasysports.yahoo.com/';

/** A draft slot = one official Heroes league (10 players). `id` is the date key
 *  (YYYY-MM-DD) used everywhere (form value, Sheet column, counts map). */
export interface OfficialLeague {
  id: string;        // 'YYYY-MM-DD'
  label: string;     // 'Fri, Aug 28'
  time?: string;     // '4:00 PM' (Fridays); blank = day-of time confirmed after signup
  capacity: number;  // 10
}

export const LEAGUE_CAPACITY = 10;
/** A player can be in at most this many official Heroes leagues. */
export const MAX_LEAGUES_PER_USER = 3;

/** 6 leagues over the two weekends before kickoff, ending Labor Day weekend 2026.
 *  `id` is intentionally a non-date token (e.g. 'aug28-fri') so Google Sheets
 *  stores it as plain text and doesn't auto-convert it to a Date — which would
 *  break the per-league counts/caps keyed on this id. */
export const OFFICIAL_LEAGUES: OfficialLeague[] = [
  { id: 'aug28-fri', label: 'Fri, Aug 28', time: '4:00 PM', capacity: 10 },
  { id: 'aug29-sat', label: 'Sat, Aug 29', time: '4:00 PM', capacity: 10 },
  { id: 'aug30-sun', label: 'Sun, Aug 30', time: '3:00 PM', capacity: 10 },
  { id: 'sep04-fri', label: 'Fri, Sep 4', time: '4:00 PM', capacity: 10 },
  { id: 'sep05-sat', label: 'Sat, Sep 5', time: '4:00 PM', capacity: 10 },
  { id: 'sep06-sun', label: 'Sun, Sep 6 (Labor Day wknd)', time: '3:00 PM', capacity: 10 },
];

export function leagueDateText(l: OfficialLeague): string {
  return l.time ? `${l.label} · ${l.time}` : l.label;
}

export const FANTASY = {
  title: 'Heroes Fantasy Football League',
  tagline: 'Draft at the bar. Win a $100 gift card. Every game on the big screens.',
  intro: [
    'American Heroes & Brew is running a Fantasy Football League for the season — and you’re invited. Jump into an official Heroes league or bring your own crew. Either way: prizes, draft-day perks, and every game on 16 TVs all season.',
    'Free to join — we cover the prize. Pick your path below.',
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
      title: 'Draft at Heroes = free munchies',
      body:
        'Host your draft at American Heroes & Brew and we’ll put out draft-day munchies on us. Gather the league over wings and cold beer.',
    },
    {
      icon: 'tv',
      title: 'Your draft on the big screen',
      body:
        'Drafting here? We’ll stream it live on one of our TVs so the whole bar feels every pick. Live drafts hit different on the big screen.',
    },
  ],

  yahoo: {
    intro:
      'Our leagues run on Yahoo Fantasy — free and easy. Set up your team on Yahoo, then sign up with us below to lock in prize eligibility and your draft.',
    steps: [
      'Create or join a free league at football.fantasysports.yahoo.com.',
      'Pick American Heroes & Brew as your draft spot for the munchies + big-screen draft.',
      'Sign up here so we can register you for the $100 prize and reserve your draft date.',
    ],
  },

  faqs: [
    {
      question: 'How do I join the Heroes Fantasy Football League?',
      answer:
        'Pick a path on this page: join an official American Heroes & Brew league (choose one of our draft dates) or register your own league. It’s free — we cover the prize.',
    },
    {
      question: 'When are the official Heroes league drafts?',
      answer:
        'Official Heroes leagues draft the two weekends before the NFL season — Fridays and Saturdays at 4pm, Sundays at 3pm — wrapping up on Labor Day weekend. Each league is capped at 10 players, so spots fill up. You pick your draft date when you sign up.',
    },
    {
      question: 'What does the winner get?',
      answer:
        'Each league’s champion wins a $100 American Heroes & Brew gift card. The winner must be present in person at the bar on championship day to claim it.',
    },
    {
      question: 'Can my own league draft at American Heroes & Brew?',
      answer:
        'Yes. Register your league here, then host your draft at the bar — commissioners get free draft munchies and we’ll stream the live draft on one of our TVs.',
    },
    {
      question: 'Is there an entry fee?',
      answer:
        'No. The Heroes Fantasy Football League is free to join — American Heroes & Brew provides the prize.',
    },
  ],
};
