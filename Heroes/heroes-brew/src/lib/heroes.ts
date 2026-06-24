/**
 * "Hero of the Month" program data for the /heroes page + homepage card.
 *
 * NEW MODEL (community-voted, no discount): each month we post a "Tag Your Hero"
 * call on Instagram. People TAG the local person who deserves recognition — a
 * friend, neighbor, coach, veteran, teacher, first responder, standout regular.
 * The most-tagged / most-loved nominee becomes that month's Hero of the Month and
 * is celebrated across our channels (and featured here). It's pure recognition —
 * about a real person who shows up for the community, not a discount.
 *
 * Update monthly: add the winner to the TOP of HEROES (most recent first) with the
 * Instagram post that nominated/announced them (`igPostUrl`) so the page + homepage
 * card can embed it. Photos (optional) live in /public/heroes/<file>. The monthly
 * "heroes-of-the-month" routine emails a copy-paste kit to make this one step.
 * Until a winner is added, HEROES is empty — the featured card and homepage card
 * stay hidden and the page shows the program + how-to-nominate.
 */

export interface Hero {
  /** Display period, e.g. "August 2026". */
  month: string;
  /** Sort key YYYY-MM (newest first). */
  period: string;
  /** Honoree's name. */
  name: string;
  /** Optional sub-line: role/affiliation or why they're known locally. */
  title?: string;
  /** 1–3 sentence story / reason honored. Factual, no fabricated offers. */
  blurb: string;
  /** Optional photo at /public/heroes/<file>. */
  photo?: string;
  /**
   * Permalink to the Instagram post that nominated/announced this hero
   * (https://www.instagram.com/p/<code>/ or /reel/<code>/). Rendered as an
   * embed on the /heroes page and the homepage card.
   */
  igPostUrl?: string;
}

export const HEROES_PROGRAM = {
  title: 'Hero of the Month',
  tagline: 'Tag the local hero who deserves it — the most-loved nominee wins.',
  intro: [
    'At American Heroes & Brew, “heroes” isn’t just our name — it’s who we’re here for. Every month we hand the spotlight to the community: you tell us who the real local heroes are, and we celebrate the one you rally behind.',
    'A hero is a real person who shows up for Carlsbad and North County — a friend who’s always there, a neighbor, a coach, a teacher, a veteran or first responder, the regular who makes everyone’s day better. No discount, no gimmick — just recognition for someone who earns it.',
  ],
  how: [
    'Each month we post a “Tag Your Hero” call on our Instagram (@americanheroesandbrew).',
    'Tag the local hero you want to honor — and like the nominations you love.',
    'The most-tagged, most-loved nominee becomes our Hero of the Month.',
    'We celebrate them across our channels and right here — and they’re always welcome at our table.',
  ],
  /** Nomination is via the monthly Instagram post (tag + like). No public email. */
  nominate: {
    instagram: 'https://www.instagram.com/americanheroesandbrew/',
    inStore: 'Or tell any team member in the Village who deserves it.',
  },
};

/**
 * Winners, newest first. EMPTY until the first month's voting closes — add the
 * winner here with their `igPostUrl` (the nomination/announcement post) and an
 * optional photo. Keep blurbs factual and celebratory.
 */
export const HEROES: Hero[] = [];

/** The current Hero of the Month, or null if none has been chosen yet. */
export function getCurrentHero(): Hero | null {
  return HEROES.length > 0 ? HEROES[0] : null;
}

/** Program FAQs — mirrored into FAQPage JSON-LD for answer engines. */
export const HERO_FAQS = [
  {
    question: 'What is American Heroes & Brew’s Hero of the Month?',
    answer:
      'Hero of the Month is a community-voted spotlight by American Heroes & Brew in Carlsbad Village. Each month we post a “Tag Your Hero” call on Instagram, the community tags and likes their nominees, and the most-loved local hero — a friend, neighbor, coach, teacher, veteran, or first responder — is celebrated as that month’s Hero of the Month. It’s recognition, not a discount.',
  },
  {
    question: 'How do I nominate someone for Hero of the Month?',
    answer:
      'Watch for our monthly “Tag Your Hero” post on Instagram (@americanheroesandbrew) and tag the local person who deserves it — then like the nominees you support. The most-tagged, most-loved nominee wins. You can also tell any team member in person at 300 Carlsbad Village Drive, Carlsbad.',
  },
  {
    question: 'How is the Hero of the Month chosen?',
    answer:
      'It’s decided by the community on Instagram. Each month the local hero who gets the most tags and likes on our “Tag Your Hero” post becomes the Hero of the Month — so the people of Carlsbad and North County pick who gets the spotlight.',
  },
];
