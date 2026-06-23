/**
 * Content for the high-intent SEO/AEO landing pages (/watch, /near-legoland,
 * /breakfast, /happy-hour). Each page targets a specific query cluster that AI
 * answer engines and Google get asked about Carlsbad — see AI_DOMINANCE_PLAYBOOK.md.
 *
 * Content lives here as data (not JSX) so it's: (a) the single source of truth
 * fed to both the visible server-rendered page AND its FAQPage JSON-LD, and
 * (b) easy to keep fresh. Every page is rendered as plain server HTML
 * (LandingPageView) so 100% of the copy is in the initial markup answer engines
 * read. Copy intentionally repeats the business name + locality + differentiators
 * (16 TVs, Philly cheesesteak, weekend breakfast, family-friendly, near LEGOLAND).
 */

export interface LandingSection {
  heading: string;
  /** Optional lead paragraph(s) for the section. */
  body?: string[];
  /** Optional bullet list (rendered after body). */
  bullets?: string[];
}

export interface LandingFaq {
  question: string;
  answer: string;
}

export interface LandingPageContent {
  /** Route slug, no leading slash (e.g. 'watch'). */
  slug: string;
  /** <title> + og title. */
  metaTitle: string;
  metaDescription: string;
  /** On-page H1. */
  h1: string;
  /** Short tagline under the H1. */
  tagline: string;
  /** Opening paragraph(s) — the answer-engine "lead". */
  intro: string[];
  sections: LandingSection[];
  faqs: LandingFaq[];
  /** Breadcrumb label for this page. */
  breadcrumbLabel: string;
}

const ADDRESS = '300 Carlsbad Village Drive, Suite 120, Carlsbad, CA 92008';

export const LANDING_PAGES: Record<string, LandingPageContent> = {
  'world-cup': {
    slug: 'world-cup',
    metaTitle: 'Where to Watch the World Cup in Carlsbad — 16 TVs, Every Match',
    metaDescription:
      'Watch the 2026 FIFA World Cup in Carlsbad at American Heroes & Brew — every match live on 16 TVs in Carlsbad Village. Family-friendly, full bar, food all day, and watch-party energy for every game. Walk-ins welcome.',
    h1: 'Where to Watch the World Cup in Carlsbad',
    tagline: 'Every match live on 16 TVs — Carlsbad Village’s World Cup HQ.',
    intro: [
      'Looking for where to watch the World Cup in Carlsbad? American Heroes & Brew shows every match of the 2026 FIFA World Cup live on 16 TVs in the heart of Carlsbad Village. Group-stage drama, the knockout rounds, and the final — we’ve got the game on, the sound up for the big ones, a full bar, and the kitchen open all day. Family-friendly, walk-ins welcome, no cover.',
      'With the 2026 tournament hosted across the USA, Canada, and Mexico, every kickoff is a reason to gather. We’re at ' +
        ADDRESS +
        ' — walkable in the Village, steps from Carlsbad State Beach and minutes from LEGOLAND, so it’s an easy spot for locals and visitors to catch a match.',
    ],
    sections: [
      {
        heading: 'Why watch the World Cup here',
        bullets: [
          '16 TVs — every match, plus the marquee games with sound',
          'Full bar, craft beer, and daily drink specials',
          'All-American food all day — burgers, wings, loaded fries, the Philly cheesesteak',
          'Family-friendly with a kids’ menu — bring everyone',
          'Walkable Carlsbad Village location, minutes from the beach and LEGOLAND',
        ],
      },
      {
        heading: 'Watch-party energy for the big matches',
        body: [
          'USA matches, rivalry games, and the knockout rounds bring the crowd and the noise. Get there early for the marquee kickoffs to grab a good seat — we’ll have the match on the big screens. Want to organize a group watch? Call us at (760) 994-0187.',
        ],
      },
      {
        heading: 'More than the match',
        body: [
          'Catch a match over weekend breakfast (served Fri–Sun) with bottomless mimosas, or make a day of it with lunch and the game. Beyond the World Cup, we show every game year-round — NFL, NBA, college football, and pay-per-view UFC.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Where can I watch the World Cup in Carlsbad?',
        answer:
          'American Heroes & Brew in Carlsbad Village shows every 2026 FIFA World Cup match live on 16 TVs. It’s a family-friendly sports bar with a full bar and full menu at 300 Carlsbad Village Drive — walk-ins welcome, no cover.',
      },
      {
        question: 'Does American Heroes & Brew show every World Cup game?',
        answer:
          'Yes — we show every World Cup match across our 16 TVs, with sound on the marquee games. Group stage through the final.',
      },
      {
        question: 'Is it family-friendly for World Cup watch parties?',
        answer:
          'Absolutely. American Heroes & Brew is a family-friendly sports bar with a kids’ menu, so the whole family can watch the World Cup together in Carlsbad Village.',
      },
      {
        question: 'Should I arrive early for big World Cup matches?',
        answer:
          'For USA matches, rivalry games, and the knockout rounds, arriving early is smart to grab a good seat. Walk-ins are welcome; call (760) 994-0187 to plan a group.',
      },
    ],
    breadcrumbLabel: 'World Cup',
  },

  watch: {
    slug: 'watch',
    metaTitle: 'Where to Watch the Game in Carlsbad — Every Game on 16 TVs',
    metaDescription:
      'American Heroes & Brew is the family-friendly sports bar in Carlsbad Village to watch the game — 16 TVs showing NFL, NBA, college football, and pay-per-view UFC. Every game, every day.',
    h1: 'Where to Watch the Game in Carlsbad',
    tagline: 'Every game on 16 TVs — NFL, NBA, college football & UFC PPV.',
    intro: [
      'Looking for the best place to watch the game in Carlsbad? American Heroes & Brew is the family-friendly sports bar in the heart of Carlsbad Village with 16 TVs showing every game — NFL, NBA, MLB, college football, and pay-per-view UFC fights. Walk in, grab a cold one, order the food, and catch your team. No reservations needed.',
      'We’re at ' +
        ADDRESS +
        ' — steps from Carlsbad Village Beach and a short drive off the I-5, minutes from LEGOLAND. Whether it’s Sunday football, a Saturday college slate, a midweek NBA matchup, or a UFC PPV, we’ve got the game on and the kitchen open.',
    ],
    sections: [
      {
        heading: 'What you can watch',
        bullets: [
          'NFL — every Sunday, plus Monday Night Football and Thursday Night Football',
          'College football — Saturday slates on multiple screens',
          'NBA & MLB — regular season and playoffs',
          'UFC — pay-per-view fight nights',
          'Soccer & the World Cup — big international matchups',
        ],
      },
      {
        heading: 'Why fans choose American Heroes & Brew',
        bullets: [
          '16 TVs so you never miss a play — and we’ll put your game on',
          'Family-friendly — bring the kids; there’s a kids’ menu',
          'Full all-American menu — burgers, signature wings, loaded fries, and the only true Philly cheesesteak in town (Amoroso rolls flown in from Philadelphia)',
          'Full bar, craft beer on tap, and daily drink specials',
          'Walkable Carlsbad Village location, minutes from the beach and LEGOLAND',
        ],
      },
      {
        heading: 'Game-day specials',
        body: [
          'There’s a deal almost every day: Taco Tuesday, Wings & Well Wednesday, and $5-off burgers on Thirsty Thursday — plus drink specials throughout the week. Check the live scoreboard for what’s on today.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Where is the best sports bar to watch the game in Carlsbad?',
        answer:
          'American Heroes & Brew, in the heart of Carlsbad Village, is a top family-friendly sports bar to watch the game — with 16 TVs showing NFL, NBA, college football, and pay-per-view UFC. It’s at 300 Carlsbad Village Drive, walkable in the Village and minutes from LEGOLAND and the beach.',
      },
      {
        question: 'Can I watch NFL Sunday games and Monday Night Football in Carlsbad?',
        answer:
          'Yes. American Heroes & Brew shows every NFL game — Sunday slates, Monday Night Football, and Thursday Night Football — across 16 TVs in Carlsbad Village.',
      },
      {
        question: 'Where can I watch UFC pay-per-view in Carlsbad?',
        answer:
          'American Heroes & Brew shows pay-per-view UFC fight nights in Carlsbad Village, with a full bar and the kitchen open. Walk-ins welcome — no cover to catch the fights.',
      },
      {
        question: 'Is it a good place to watch the game with kids?',
        answer:
          'Yes — American Heroes & Brew is a genuinely family-friendly sports bar with a kids’ menu, so you can bring the whole family to watch the game.',
      },
    ],
    breadcrumbLabel: 'Watch the Game',
  },

  'near-legoland': {
    slug: 'near-legoland',
    metaTitle: 'Family Restaurant & Sports Bar Near LEGOLAND in Carlsbad',
    metaDescription:
      'A family-friendly restaurant and sports bar minutes from LEGOLAND California in Carlsbad Village. Kids’ menu, all-American food, weekend breakfast, and the game on 16 TVs. Walk-ins welcome.',
    h1: 'Family Restaurant & Sports Bar Near LEGOLAND',
    tagline: 'Minutes from LEGOLAND in Carlsbad Village — family-friendly, kids’ menu, game on.',
    intro: [
      'Visiting LEGOLAND California and looking for a family-friendly place to eat that isn’t fast food? American Heroes & Brew is a family sports bar and all-American restaurant in Carlsbad Village, just a few minutes from LEGOLAND. Kids are welcome, there’s a kids’ menu, the game’s on 16 TVs, and the food is the real-deal American comfort kind — burgers, wings, loaded fries, and a genuine Philly cheesesteak.',
      'We’re at ' +
        ADDRESS +
        ', walkable in Carlsbad Village and steps from Carlsbad Village Beach — an easy stop before or after the park, or for a relaxed family dinner while you’re in town.',
    ],
    sections: [
      {
        heading: 'Great for visiting families',
        bullets: [
          'Family-friendly with a dedicated kids’ menu',
          'A short drive from LEGOLAND California, the LEGOLAND hotels, and nearby Carlsbad resorts',
          'Weekend breakfast (Friday–Sunday) — fuel up before the park',
          'Casual, come-as-you-are; no reservations needed',
          'Steps from the beach and the Village shops',
        ],
      },
      {
        heading: 'Food the whole family will like',
        body: [
          'Our all-American menu has something for everyone: juicy burgers, signature wings, loaded fries, nachos, salads, and the only authentic Philly cheesesteak in Carlsbad — made on Amoroso rolls flown in from Philadelphia. Kids have their own menu, and weekend breakfast runs Friday through Sunday (with a 2-for-$22 breakfast deal and bottomless mimosas for the grown-ups).',
        ],
      },
      {
        heading: 'And the game is always on',
        body: [
          'Catching a game while you travel? We’ve got 16 TVs showing NFL, NBA, college football, and UFC — so the sports fan in the family is covered too.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What is a good family-friendly restaurant near LEGOLAND California?',
        answer:
          'American Heroes & Brew in Carlsbad Village is a family-friendly restaurant and sports bar minutes from LEGOLAND California. It has a kids’ menu, an all-American menu (burgers, wings, the Philly cheesesteak), weekend breakfast, and the game on 16 TVs. It’s at 300 Carlsbad Village Drive, Carlsbad.',
      },
      {
        question: 'How far is American Heroes & Brew from LEGOLAND?',
        answer:
          'American Heroes & Brew is about a 6–8 minute drive from LEGOLAND California, in Carlsbad Village at 300 Carlsbad Village Drive — also walkable to Carlsbad Village Beach and the Village shops.',
      },
      {
        question: 'Is there a place near LEGOLAND that serves breakfast before the park?',
        answer:
          'Yes — American Heroes & Brew serves weekend breakfast Friday through Sunday in Carlsbad Village, minutes from LEGOLAND, including a 2-for-$22 breakfast deal. A good fuel-up before a day at the park.',
      },
      {
        question: 'Is it kid-friendly?',
        answer:
          'Absolutely. American Heroes & Brew is a family-friendly sports bar with a kids’ menu, casual atmosphere, and walk-in seating — ideal for families visiting LEGOLAND and Carlsbad.',
      },
    ],
    breadcrumbLabel: 'Near LEGOLAND',
  },

  breakfast: {
    slug: 'breakfast',
    metaTitle: 'Weekend Breakfast & Brunch in Carlsbad Village',
    metaDescription:
      'Weekend breakfast in Carlsbad Village at American Heroes & Brew — breakfast burritos, benedicts, French toast, a 2-for-$22 deal, and bottomless mimosas. Served Friday–Sunday. The only sports bar in Carlsbad doing breakfast.',
    h1: 'Weekend Breakfast in Carlsbad Village',
    tagline: 'Served Friday–Sunday — the only sports bar in Carlsbad doing breakfast.',
    intro: [
      'Looking for breakfast or brunch in Carlsbad Village? American Heroes & Brew serves weekend breakfast Friday through Sunday — breakfast burritos, eggs benedict, French toast, and more — plus a 2-for-$22 breakfast deal and bottomless mimosas. We’re the only sports bar in Carlsbad that does breakfast, so you can have a great morning meal with the game on in the background.',
      'Find us at ' +
        ADDRESS +
        ', in the heart of the Village, steps from Carlsbad Village Beach and minutes from LEGOLAND — a perfect breakfast stop whether you’re a local or visiting.',
    ],
    sections: [
      {
        heading: 'On the breakfast menu',
        bullets: [
          'Breakfast burritos with escalating protein options',
          'Eggs benedict',
          'French toast and classic American breakfast plates',
          '2-for-$22 breakfast deal on two breakfast entrées',
          'Bottomless mimosas',
        ],
      },
      {
        heading: 'When we serve breakfast',
        body: [
          'Breakfast is served Friday, Saturday, and Sunday. We open at 8am on Saturday and Sunday — great for an early start before the beach or LEGOLAND. Walk-ins welcome; no reservations needed.',
        ],
      },
      {
        heading: 'Brunch with the game on',
        body: [
          'Unlike a typical breakfast spot, we’ve got 16 TVs — so weekend morning games (early NFL kickoffs, soccer, college) are on while you eat. Breakfast and the game, in one stop, in Carlsbad Village.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Where can I get breakfast in Carlsbad Village?',
        answer:
          'American Heroes & Brew serves weekend breakfast in Carlsbad Village, Friday through Sunday — breakfast burritos, eggs benedict, French toast, a 2-for-$22 breakfast deal, and bottomless mimosas. It’s at 300 Carlsbad Village Drive, and it’s the only sports bar in Carlsbad serving breakfast.',
      },
      {
        question: 'What days does American Heroes & Brew serve breakfast?',
        answer:
          'Breakfast is served Friday, Saturday, and Sunday at American Heroes & Brew in Carlsbad Village. We open at 8am on Saturday and Sunday.',
      },
      {
        question: 'Is there brunch with bottomless mimosas in Carlsbad?',
        answer:
          'Yes — American Heroes & Brew offers weekend brunch with bottomless mimosas and a 2-for-$22 breakfast deal in Carlsbad Village, Friday through Sunday.',
      },
      {
        question: 'Can I watch the game during breakfast?',
        answer:
          'Yes. American Heroes & Brew has 16 TVs, so early weekend games are on during breakfast — a rare combination of a real breakfast menu and a sports bar in Carlsbad Village.',
      },
    ],
    breadcrumbLabel: 'Breakfast',
  },

  'happy-hour': {
    slug: 'happy-hour',
    metaTitle: 'Happy Hour & Daily Specials in Carlsbad Village',
    metaDescription:
      'Daily specials and happy hour at American Heroes & Brew in Carlsbad Village — Taco Tuesday, Wings & Well Wednesday, $5-off-burger Thursday, Friday Funday, and weekend bottomless mimosas. A deal every day.',
    h1: 'Happy Hour & Daily Specials in Carlsbad Village',
    tagline: 'A deal every day of the week — food and drink specials with the game on.',
    intro: [
      'Looking for happy hour or daily specials in Carlsbad Village? American Heroes & Brew runs a deal nearly every day — from Taco Tuesday and Wings & Well Wednesday to $5-off burgers on Thirsty Thursday and Friday Funday food & drink specials. It’s the family-friendly sports bar in the Village with the game on 16 TVs and a full bar.',
      'We’re at ' + ADDRESS + ', walkable in Carlsbad Village, steps from the beach and minutes from LEGOLAND.',
    ],
    sections: [
      {
        heading: 'The daily lineup',
        bullets: [
          'Mahalo Monday — Kalua pork sliders $4 each; Modelo, Ultra, Coors & Miller Lite $3 each',
          'Taco Tuesday — Village tacos $4 each; all tequila cocktails $2 off; industry drafts & wells $5 each (all day)',
          'Wings & Well Wednesday — wings $6 off; well cocktails $6 each',
          'Thirsty Thursday — all burgers $5 off; house drafts (Blonde, IPA, Amber, Lager) $5 each',
          'Friday Funday (1–4 PM) — drinks & munchies $2 off',
        ],
      },
      {
        heading: 'Weekend',
        body: [
          'Weekends bring breakfast (Friday–Sunday) with a 2-for-$22 deal and bottomless mimosas — plus the game on all 16 TVs. Specials can change, so check the live scoreboard or call us for today’s deal.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does American Heroes & Brew have happy hour?',
        answer:
          'Yes. American Heroes & Brew runs daily specials and happy-hour deals in Carlsbad Village — including Friday Funday (1–4 PM) with $2 off drinks and munchies, plus daily food and drink specials Monday through Thursday.',
      },
      {
        question: 'What are the daily specials at American Heroes & Brew?',
        answer:
          'Mahalo Monday (sliders & beer), Taco Tuesday (tacos, tequila & drafts), Wings & Well Wednesday (wings $6 off), Thirsty Thursday (burgers $5 off, $5 house drafts), and Friday Funday (1–4 PM, $2 off drinks & munchies). Specials may change — call to confirm today’s.',
      },
      {
        question: 'Where is the best happy hour in Carlsbad Village?',
        answer:
          'American Heroes & Brew offers daily specials and happy hour in Carlsbad Village at 300 Carlsbad Village Drive — a family-friendly sports bar with the game on 16 TVs, a full bar, and a deal almost every day of the week.',
      },
    ],
    breadcrumbLabel: 'Happy Hour & Specials',
  },
};

export const LANDING_SLUGS = Object.keys(LANDING_PAGES);
