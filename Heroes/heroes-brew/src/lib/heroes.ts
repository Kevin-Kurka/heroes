/**
 * "Hero of the Month" program data for the /heroes page.
 *
 * On-brand community spotlight for American Heroes & Brew. A hero can be an
 * INDIVIDUAL (a customer / community member — a veteran, teacher, coach, local
 * do-gooder) or a VOCATION (a group we honor that month — nurses, first
 * responders, teachers). The page is an evergreen, citable, answer-engine-readable
 * archive that compounds for "community / veteran-friendly / family Carlsbad"
 * intent and feeds local PR + UGC + reviews (see MARKETING_DOMINATION_PLAN.md).
 *
 * Update monthly: add a new entry to the TOP of HEROES (most recent first). The
 * monthly "heroes-of-the-month" routine emails a drafted spotlight kit to make
 * this a copy-paste step. Photos (optional) live in /public/heroes/<slug>.jpg.
 */

export type HeroType = 'individual' | 'vocation';

export interface Hero {
  /** Display period, e.g. "July 2026". */
  month: string;
  /** Sort key YYYY-MM (newest first). */
  period: string;
  type: HeroType;
  /** Honoree name (individual) or group name (vocation), e.g. "Nurses". */
  name: string;
  /** Optional sub-line: role/affiliation or relationship. */
  title?: string;
  /** 1–3 sentence story / reason honored. Factual, no fabricated offers. */
  blurb: string;
  /** Optional photo at /public/heroes/<file>. */
  photo?: string;
}

export const HEROES_PROGRAM = {
  title: 'Hero of the Month',
  tagline: 'Honoring the everyday heroes of Carlsbad — one a month.',
  intro: [
    'At American Heroes & Brew, “heroes” isn’t just our name — it’s who we’re here for. Every month we spotlight a Hero of the Month: sometimes an individual from our community, sometimes a whole vocation that serves it. It’s our way of saying thank you to the people who make Carlsbad and North County a better place.',
    'A hero can be a regular who looks out for their neighbors, a veteran or first responder, a teacher or coach — or a whole profession we want to celebrate, like nurses, paramedics, or educators.',
  ],
  how: [
    'Each month we choose a Hero of the Month — an individual or a vocation.',
    'We share their story across our community — in the Village, on social, and here.',
    'Anyone can nominate a local hero (see below). Heroes and their crews are always welcome at our table.',
  ],
  /** Nomination channels (no personal email exposed publicly). Set
   *  HEROES_NOMINATION_URL in env to point at a form when one exists. */
  nominate: {
    instagram: 'https://www.instagram.com/americanheroesandbrew/',
    inStore: 'Ask any team member in the Village to nominate someone.',
  },
};

/**
 * Honorees, newest first. Seeded with a vocation spotlight (no individual’s
 * consent needed). Replace/prepend monthly. Keep blurbs factual.
 */
export const HEROES: Hero[] = [
  {
    month: 'July 2026',
    period: '2026-07',
    type: 'vocation',
    name: 'Nurses & Healthcare Workers',
    title: 'North County’s caregivers',
    blurb:
      'This month we’re raising a glass to the nurses and healthcare workers of North County San Diego — the people who show up, often overnight and over holidays, to care for our families. Thank you for everything you do. You’re always welcome at our table.',
  },
];

/** Program FAQs — mirrored into FAQPage JSON-LD for answer engines. */
export const HERO_FAQS = [
  {
    question: 'What is American Heroes & Brew’s Hero of the Month?',
    answer:
      'Hero of the Month is a community spotlight by American Heroes & Brew in Carlsbad Village. Each month we honor a local hero — either an individual community member (such as a veteran, first responder, teacher, or standout regular) or a whole vocation that serves the community (such as nurses or first responders).',
  },
  {
    question: 'How do I nominate someone for Hero of the Month?',
    answer:
      'You can nominate a local hero by messaging American Heroes & Brew on Instagram (@americanheroesandbrew) or by asking any team member in person at 300 Carlsbad Village Drive, Carlsbad.',
  },
  {
    question: 'Can a whole profession be Hero of the Month?',
    answer:
      'Yes. Some months we honor an individual, and other months we celebrate an entire vocation — like nurses, paramedics, teachers, or first responders — that serves Carlsbad and North County San Diego.',
  },
];
