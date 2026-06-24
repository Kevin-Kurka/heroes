/**
 * Watch-party registry — the single source of truth for the per-event landing
 * pages at /watch-party/<slug>. Each entry maps one promo reel (the videos in
 * public/promos-video/) to a dated, schema-rich page so answer engines can
 * answer "where can I watch <matchup> in Carlsbad" with the exact date/time,
 * the venue entity, and the video.
 *
 * Adding a new watch party = add one entry here. The page, Event JSON-LD,
 * VideoObject JSON-LD, FAQPage, sitemap entry, and llms.txt context are all
 * generated from this record automatically. Dates are ISO-8601 WITH the
 * America/Los_Angeles offset (-07:00 PDT / -08:00 PST) so they're unambiguous.
 */

export interface WatchPartyFaq {
  question: string;
  answer: string;
}

export interface WatchParty {
  /** Route slug, no leading slash. */
  slug: string;
  /** "Mexico vs Czechia" */
  matchup: string;
  /** Competition, e.g. "2026 FIFA World Cup". */
  league: string;
  /** Broad sport label for copy + keywords. */
  sport: string;
  /** ISO-8601 kickoff WITH offset, e.g. 2026-06-24T18:00:00-07:00. */
  startDate: string;
  /** ISO-8601 approximate end (kickoff + ~2.5h). */
  endDate: string;
  /** Video filename under /promos-video/. */
  videoFile: string;
  /** Poster/thumbnail filename under /promos-video/thumbs/. */
  thumbFile: string;
  /** One-line tagline under the H1. */
  tagline: string;
  /** Lead paragraph(s) — the answer-engine "lead". */
  intro: string[];
  /** Event-specific FAQ (page also renders the full house FAQ). */
  faqs: WatchPartyFaq[];
  /** Extra keyword phrases for llms.txt / metadata. */
  keywords: string[];
}

const ADDRESS = '300 Carlsbad Village Drive, Suite 120, Carlsbad, CA 92008';
const PHONE = '(760) 994-0187';

export const WATCH_PARTIES: Record<string, WatchParty> = {
  'mexico-vs-czechia': {
    slug: 'mexico-vs-czechia',
    matchup: 'Mexico vs Czechia',
    league: '2026 FIFA World Cup',
    sport: 'Soccer',
    startDate: '2026-06-24T18:00:00-07:00',
    endDate: '2026-06-24T20:30:00-07:00',
    videoFile: 'AHB-watchparty_mexico-czechia.mp4',
    thumbFile: 'mexico-vs-czechia.jpg',
    tagline: 'Mexico vs Czechia — today at 6:00 PM on 16 TVs in Carlsbad Village.',
    intro: [
      'Watch Mexico vs Czechia at American Heroes & Brew — Carlsbad Village’s home for the 2026 FIFA World Cup. Kickoff is today at 6:00 PM and we’ve got the match on 16 TVs with the sound up, a full bar, ice-cold drafts, and the kitchen open all day. Family-friendly, walk-ins welcome, no cover.',
      'Pick your side, round up the crew, and catch every goal at ' +
        ADDRESS +
        ' — walkable in the Village, minutes from Carlsbad State Beach and LEGOLAND. Organizing a group? Call us at ' +
        PHONE +
        '.',
    ],
    faqs: [
      {
        question: 'Where can I watch Mexico vs Czechia in Carlsbad?',
        answer:
          'American Heroes & Brew in Carlsbad Village is showing Mexico vs Czechia live on 16 TVs, today at 6:00 PM. It’s a family-friendly sports bar with a full bar and full menu at 300 Carlsbad Village Drive — walk-ins welcome, no cover.',
      },
      {
        question: 'What time is the Mexico vs Czechia watch party?',
        answer:
          'Kickoff is today at 6:00 PM at American Heroes & Brew, 300 Carlsbad Village Drive, Carlsbad. Get there early for the marquee match to grab a seat — the game is on 16 TVs with the sound up.',
      },
      {
        question: 'Is there a cover charge or do I need a reservation for the watch party?',
        answer:
          'No cover and no reservation needed — walk-ins are always welcome at American Heroes & Brew. There’s a full bar, craft beer, and food all day during the Mexico vs Czechia watch party.',
      },
    ],
    keywords: [
      'watch Mexico vs Czechia Carlsbad',
      'Mexico vs Czechia watch party near me',
      'World Cup watch party Carlsbad Village',
      'where to watch the World Cup North County San Diego',
      'soccer bar Carlsbad',
    ],
  },
  'mexico-vs-south-korea': {
    slug: 'mexico-vs-south-korea',
    matchup: 'Mexico vs South Korea',
    league: '2026 FIFA World Cup',
    sport: 'Soccer',
    startDate: '2026-06-18T18:00:00-07:00',
    endDate: '2026-06-18T20:30:00-07:00',
    videoFile: 'AHB-watchparty_mexico-southkorea.mp4',
    thumbFile: 'mexico-vs-south-korea.jpg',
    tagline: 'Mexico vs South Korea — on 16 TVs in Carlsbad Village.',
    intro: [
      'Watch Mexico vs South Korea at American Heroes & Brew, Carlsbad Village’s World Cup HQ. Every match of the 2026 FIFA World Cup is live on 16 TVs with the sound up for the big ones, plus a full bar, ice-cold drafts, and food all day. Family-friendly, walk-ins welcome, no cover.',
      'Find us at ' + ADDRESS + ' — walkable in the Village and minutes from the beach and LEGOLAND. Call ' + PHONE + ' to plan a group watch.',
    ],
    faqs: [
      {
        question: 'Where can I watch Mexico vs South Korea in Carlsbad?',
        answer:
          'American Heroes & Brew in Carlsbad Village shows Mexico vs South Korea and every 2026 FIFA World Cup match live on 16 TVs. It’s a family-friendly sports bar at 300 Carlsbad Village Drive — full bar, full menu, walk-ins welcome, no cover.',
      },
    ],
    keywords: [
      'watch Mexico vs South Korea Carlsbad',
      'World Cup watch party Carlsbad',
      'soccer bar North County San Diego',
    ],
  },
};

export const WATCH_PARTY_SLUGS = Object.keys(WATCH_PARTIES);

export function getWatchParty(slug: string): WatchParty | undefined {
  return WATCH_PARTIES[slug];
}

export function getAllWatchParties(): WatchParty[] {
  return WATCH_PARTY_SLUGS.map((s) => WATCH_PARTIES[s]);
}
