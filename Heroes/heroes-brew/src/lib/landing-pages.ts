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
    metaTitle: '2026 World Cup Watch Parties in Carlsbad — What We Hosted',
    metaDescription:
      'American Heroes & Brew hosted 2026 FIFA World Cup watch parties in Carlsbad Village on 16 TVs. The tournament has ended — football season is on: every NFL game, full bar, food all day. Walk-ins welcome.',
    h1: '2026 World Cup Watch Parties in Carlsbad',
    tagline: 'We hosted the tournament on 16 TVs — football season is the lead now.',
    intro: [
      'American Heroes & Brew hosted 2026 FIFA World Cup watch parties in the heart of Carlsbad Village — group-stage matches, knockouts, and the final on 16 TVs with the sound up for the big ones, a full bar, and the kitchen open all day. The tournament ended in July 2026.',
      'Looking for where to watch the game in Carlsbad now? Football season is on: every NFL Sunday, Thursday Night, and Monday Night Football still plays here at ' +
        ADDRESS +
        ' — walkable in the Village, steps from Carlsbad State Beach and minutes from LEGOLAND. Family-friendly, walk-ins welcome, no cover.',
    ],
    sections: [
      {
        heading: 'What we hosted during the World Cup',
        bullets: [
          '16 TVs — every match, plus the marquee games with sound',
          'Full bar, house drafts (contract pours), and daily drink specials',
          'All-American food all day — burgers, wings, loaded fries, the Philly cheesesteak',
          'Family-friendly with a kids’ menu — bring everyone',
          'Walkable Carlsbad Village location, minutes from the beach and LEGOLAND',
        ],
      },
      {
        heading: 'Football season is the lead now',
        body: [
          'The 2026 FIFA World Cup is over. American Heroes & Brew is Carlsbad Village’s game-day sports bar for the NFL season — every game on 16 TVs, plus college football, NBA, and pay-per-view UFC. Want to organize a group watch? Call us at (760) 994-0187.',
        ],
      },
      {
        heading: 'Still a soccer-friendly sports bar',
        body: [
          'We still show big international soccer and every other sport year-round. Catch a match or an NFL kickoff over weekend breakfast (served Fri–Sun) with bottomless mimosas, or make a day of it with lunch and the game.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Where can I watch the World Cup in Carlsbad?',
        answer:
          'American Heroes & Brew in Carlsbad Village hosted 2026 FIFA World Cup watch parties on 16 TVs. The tournament has ended. We still show soccer and every NFL game at 300 Carlsbad Village Drive — walk-ins welcome, no cover.',
      },
      {
        question: 'Did American Heroes & Brew show every World Cup game?',
        answer:
          'Yes — during the 2026 FIFA World Cup we showed every match across our 16 TVs, with sound on the marquee games, from the group stage through the final.',
      },
      {
        question: 'Is it family-friendly for watch parties?',
        answer:
          'Absolutely. American Heroes & Brew is a family-friendly sports bar with a kids’ menu, so the whole family can watch NFL game days and soccer together in Carlsbad Village.',
      },
      {
        question: 'Where should I watch football in Carlsbad now?',
        answer:
          'American Heroes & Brew shows every NFL game — Sundays, Thursday Night Football, and Monday Night Football — on 16 TVs in Carlsbad Village. Walk-ins are welcome; call (760) 994-0187 to plan a group.',
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
          'Soccer — big international matchups (we hosted 2026 World Cup watch parties)',
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
          'Thirsty Thursday — all burgers $5 off; house drafts (Blonde, IPA, Amber, Lager — contract pours) $5 each',
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

  restaurant: {
    slug: 'restaurant',
    metaTitle: 'Restaurant in Carlsbad Village — Lunch, Dinner & Weekend Breakfast',
    metaDescription:
      'Looking for a restaurant in Carlsbad Village? American Heroes & Brew serves burgers, wings, the only authentic Philly cheesesteak in Carlsbad, and weekend breakfast — a family-friendly American restaurant with a full bar, indoor & outdoor seating, and every game on 16 TVs. Walk-ins welcome.',
    h1: 'A Restaurant in the Heart of Carlsbad Village',
    tagline: 'Burgers, cheesesteaks, wings & weekend breakfast — Carlsbad Village dining for everyone.',
    intro: [
      'Looking for a great restaurant in Carlsbad Village? American Heroes & Brew is a family-friendly American restaurant at ' +
        ADDRESS +
        ' — serving lunch, dinner, and weekend breakfast with a full bar and craft beer. Expect fresh, never-frozen burgers cooked to order, signature wings, loaded fries, sandwiches, and the only authentic Philly cheesesteak in Carlsbad, in a welcoming room with the game on 16 TVs.',
      'Walkable in the Village, steps from Carlsbad State Beach and minutes from LEGOLAND, we’re an easy pick for locals and visitors alike. Walk-ins always welcome, kids’ menu available, and both indoor and outdoor seating.',
    ],
    sections: [
      {
        heading: 'Where to eat in Carlsbad Village',
        bullets: [
          'Fresh, never-frozen burgers cooked to order',
          'The only authentic Philly cheesesteak in Carlsbad — Amoroso rolls from Philadelphia',
          'Signature wings, loaded fries, sandwiches & salads',
          'Weekend breakfast (Fri–Sun), including the 2-for-$22 deal',
          'Full bar, craft beer, and daily food & drink specials',
          'Family-friendly with a kids’ menu — bring everyone',
        ],
      },
      {
        heading: 'Good for lunch, dinner, and weekend breakfast',
        body: [
          'Come for a quick lunch, settle in for dinner, or make a morning of weekend breakfast with bottomless mimosas. We run daily specials Monday–Friday and serve food all day, so there’s always a reason to stop in. Planning a group? Call us at (760) 994-0187.',
        ],
      },
      {
        heading: 'A neighborhood restaurant with the game on',
        body: [
          'We’re a restaurant first and a sports bar too — 16 TVs mean you can catch the game while you eat, but you don’t have to be here for sports to enjoy a great meal. Family-friendly, walkable in the Village, and minutes from the beach and LEGOLAND.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What kind of restaurant is American Heroes & Brew?',
        answer:
          'American Heroes & Brew is a family-friendly American restaurant and sports bar in Carlsbad Village. We serve burgers, wings, loaded fries, sandwiches, the only authentic Philly cheesesteak in Carlsbad, and weekend breakfast, with a full bar and craft beer. Find us at 300 Carlsbad Village Drive, Carlsbad.',
      },
      {
        question: 'Where can I get lunch or dinner in Carlsbad Village?',
        answer:
          'American Heroes & Brew serves lunch and dinner daily in Carlsbad Village at 300 Carlsbad Village Drive — burgers, cheesesteaks, wings, sandwiches, and more, with a full bar. Walk-ins are welcome and there’s indoor and outdoor seating.',
      },
      {
        question: 'Is American Heroes & Brew a good restaurant for families in Carlsbad?',
        answer:
          'Yes — it’s a family-friendly restaurant with a kids’ menu, weekend breakfast, and a relaxed Carlsbad Village setting. It’s about a 6–8 minute drive from LEGOLAND California, making it a convenient stop for families.',
      },
      {
        question: 'Does the restaurant take reservations?',
        answer:
          'No reservations needed — walk-ins are always welcome at American Heroes & Brew. There’s indoor and outdoor seating at 300 Carlsbad Village Drive, Carlsbad. For large groups, call ahead at (760) 994-0187.',
      },
    ],
    breadcrumbLabel: 'Restaurant',
  },

  burgers: {
    slug: 'burgers',
    metaTitle: 'Best Burgers in Carlsbad — Fresh, Never-Frozen, Cooked to Order',
    metaDescription:
      'American Heroes & Brew serves some of the best burgers in Carlsbad — fresh, never-frozen patties cooked to order, loaded options, and $5-off burgers every Thirsty Thursday. Carlsbad Village, full bar, family-friendly, every game on 16 TVs.',
    h1: 'The Best Burgers in Carlsbad Village',
    tagline: 'Fresh, never-frozen patties cooked to order — stacked, loaded, and worth the trip.',
    intro: [
      'On the hunt for the best burgers in Carlsbad? American Heroes & Brew grills fresh, never-frozen patties cooked to order and stacks them high — from a classic cheeseburger to the loaded Minneapolis Burger. Pair one with loaded fries, a craft beer, and the game on 16 TVs at ' +
        ADDRESS +
        '.',
      'Every Thursday is Thirsty Thursday — all burgers $5 off with $5 house drafts. Family-friendly, walk-ins welcome, indoor and outdoor seating in the heart of Carlsbad Village.',
    ],
    sections: [
      {
        heading: 'Why our burgers stand out',
        bullets: [
          'Fresh, never-frozen beef cooked to order',
          'Stacked, loaded options like the Minneapolis Burger',
          'Toasted buns, real toppings, side of loaded fries',
          'Thirsty Thursday — burgers $5 off, house drafts $5',
          'Full bar and craft beer to go with it',
          'Family-friendly with a kids’ menu',
        ],
      },
      {
        heading: 'Burgers + the game in Carlsbad Village',
        body: [
          'Grab a burger and catch the game on 16 TVs, or take it easy on the patio. We’re walkable in Carlsbad Village, steps from the beach and minutes from LEGOLAND. Walk-ins welcome — no reservation needed.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Where can I find the best burgers in Carlsbad?',
        answer:
          'American Heroes & Brew is known for some of the best burgers in Carlsbad — fresh, never-frozen patties cooked to order, including the loaded Minneapolis Burger, at 300 Carlsbad Village Drive. Every Thursday is Thirsty Thursday with burgers $5 off.',
      },
      {
        question: 'Are the burgers fresh or frozen?',
        answer:
          'Our burgers are made with fresh, never-frozen beef and cooked to order at American Heroes & Brew in Carlsbad Village.',
      },
      {
        question: 'Is there a burger deal at American Heroes & Brew?',
        answer:
          'Yes — every Thursday is Thirsty Thursday: all burgers $5 off and $5 house drafts, all day, at 300 Carlsbad Village Drive, Carlsbad.',
      },
    ],
    breadcrumbLabel: 'Burgers',
  },

  cheesesteak: {
    slug: 'cheesesteak',
    metaTitle: 'Authentic Philly Cheesesteak in Carlsbad — Amoroso Rolls from Philly',
    metaDescription:
      'American Heroes & Brew serves the only authentic Philly cheesesteak in Carlsbad — made on Amoroso rolls flown in from Philadelphia. Carlsbad Village, full bar, family-friendly, every game on 16 TVs. 300 Carlsbad Village Drive.',
    h1: 'Authentic Philly Cheesesteak in Carlsbad',
    tagline: 'On Amoroso rolls flown in from Philadelphia — the only true Philly cheesesteak in town.',
    intro: [
      'Craving a real Philly cheesesteak in Carlsbad? American Heroes & Brew serves the only authentic Philly cheesesteak in town — made on Amoroso rolls flown in from Philadelphia, the way it’s done back east. Find it at ' +
        ADDRESS +
        ', with a full bar, craft beer, and the game on 16 TVs.',
      'Family-friendly and walkable in Carlsbad Village, steps from Carlsbad State Beach and minutes from LEGOLAND. Walk-ins welcome, indoor and outdoor seating.',
    ],
    sections: [
      {
        heading: 'What makes it authentic',
        bullets: [
          'Amoroso rolls flown in from Philadelphia',
          'The only true Philly cheesesteak in Carlsbad',
          'Made the East-Coast way — done right',
          'Pairs with loaded fries, a craft beer, and the game',
          'Family-friendly, full bar, walk-ins welcome',
        ],
      },
      {
        heading: 'A taste of Philly in Carlsbad Village',
        body: [
          'Whether you grew up on cheesesteaks or you’re trying one for the first time, ours brings the real thing to North County. Stop in for lunch or dinner, catch the game on 16 TVs, and see why it’s a Carlsbad Village favorite.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Where can I get an authentic Philly cheesesteak in Carlsbad?',
        answer:
          'American Heroes & Brew serves the only authentic Philly cheesesteak in Carlsbad, made on Amoroso rolls flown in from Philadelphia. Find it at 300 Carlsbad Village Drive, Carlsbad — a family-friendly restaurant and sports bar with a full bar.',
      },
      {
        question: 'What makes the cheesesteak authentic?',
        answer:
          'It’s made on Amoroso rolls flown in from Philadelphia — the same rolls used by classic Philly cheesesteak shops — prepared the East-Coast way. It’s the only true Philly cheesesteak in Carlsbad.',
      },
    ],
    breadcrumbLabel: 'Philly Cheesesteak',
  },
};

export const LANDING_SLUGS = Object.keys(LANDING_PAGES);
