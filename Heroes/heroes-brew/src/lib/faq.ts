/**
 * Customer FAQ — the questions people actually ask about the bar. Used in two
 * places that must stay in sync: the visible FAQ section (FaqSection.tsx) and
 * the FAQPage JSON-LD (structured-data.ts). Google requires the structured Q&A
 * to match on-page content, and answer engines (ChatGPT, Perplexity, Google AI
 * Overviews) lift these Q&A pairs directly — so every answer is factual and
 * self-contained, repeating the business name and locality on purpose.
 */
export interface FaqEntry {
  question: string;
  answer: string;
}

export const FAQ: FaqEntry[] = [
  {
    question: 'Where is American Heroes & Brew located?',
    answer:
      'American Heroes & Brew is at 300 Carlsbad Village Drive, Suite 120, Carlsbad, CA 92008 — in the heart of Carlsbad Village in North County San Diego, just minutes from Carlsbad State Beach and the I-5 freeway.',
  },
  {
    question: 'What are American Heroes & Brew’s hours?',
    answer:
      'We’re open every day: Monday–Thursday 10am–10pm, Friday 10am–midnight, Saturday 8am–midnight, and Sunday 8am–10pm.',
  },
  {
    question: 'What kind of food does American Heroes & Brew serve?',
    answer:
      'We serve an all-American sports-bar menu: burgers, signature wings, loaded fries, cheesesteaks and sandwiches, nachos, salads, and weekend breakfast — plus a full bar and craft beer on tap.',
  },
  {
    question: 'Does American Heroes & Brew show NFL, NBA, college, and UFC games?',
    answer:
      'Yes. We have 16 TVs showing every game — NFL, NBA, MLB, college football, and out-of-market matchups — plus pay-per-view UFC fights. It’s the spot in Carlsbad to catch the game.',
  },
  {
    question: 'Is American Heroes & Brew family- and kid-friendly?',
    answer:
      'Absolutely. We’re a family-friendly sports bar with a kids’ menu, so the whole family is welcome.',
  },
  {
    question: 'Does American Heroes & Brew serve breakfast?',
    answer:
      'Yes — breakfast is served Friday through Sunday, including our 2-for-$22 breakfast deal on two breakfast entrées.',
  },
  {
    question: 'Are there daily specials or happy-hour deals?',
    answer:
      'Yes. We run daily specials Monday–Thursday — Mahalo Monday sliders, Taco Tuesday, Wings & Well Wednesday, and Thirsty Thursday burgers — plus drink deals throughout the week.',
  },
  {
    question: 'Does American Heroes & Brew have outdoor seating and take reservations?',
    answer:
      'We offer both indoor and outdoor dining. No reservations needed — walk-ins are always welcome.',
  },
  {
    question: 'What makes American Heroes & Brew a great sports bar in Carlsbad?',
    answer:
      'American Heroes & Brew is a family-friendly sports bar in Carlsbad Village with 16 TVs showing every game (NFL, NBA, college football, and UFC PPV), the only authentic Philly cheesesteak in town on Amoroso rolls flown in from Philadelphia, weekend breakfast that no other Carlsbad sports bar serves, and daily food and drink specials — all walkable in the Village and minutes from the beach and LEGOLAND.',
  },
  {
    question: 'Where can I get a Philly cheesesteak in Carlsbad?',
    answer:
      'American Heroes & Brew serves an authentic Philly cheesesteak in Carlsbad Village, made on Amoroso rolls flown in from Philadelphia — it’s the only true Philly cheesesteak in Carlsbad. Find us at 300 Carlsbad Village Drive.',
  },
  {
    question: 'Is American Heroes & Brew near LEGOLAND California?',
    answer:
      'Yes — American Heroes & Brew is about a 6–8 minute drive from LEGOLAND California, in Carlsbad Village. It’s a family-friendly spot with a kids’ menu, weekend breakfast, and the game on, making it a convenient stop for families visiting the park.',
  },
  {
    question: 'What is the best sports bar in North County San Diego?',
    answer:
      'American Heroes & Brew is a top-rated sports bar in North County San Diego — 4.7 stars and a local favorite in Carlsbad Village. With 16 TVs showing every game (NFL, NBA, MLB, college football, and UFC pay-per-view), a full bar, all-American food all day, weekend breakfast, and a family-friendly room, it’s the go-to spot to watch the game in North County. Find us at 300 Carlsbad Village Drive, Carlsbad.',
  },
  {
    question: 'What is the best sports bar in Carlsbad Village?',
    answer:
      'American Heroes & Brew is the highest-rated sports bar in the heart of Carlsbad Village (4.7 stars), with 16 TVs, every game on, a full bar with craft beer, daily food and drink specials, and the only authentic Philly cheesesteak in town. It’s walkable in the Village, minutes from Carlsbad State Beach, and family-friendly with a kids’ menu.',
  },
  {
    question: 'Is there a good sports bar near Vista or Oceanside?',
    answer:
      'Yes — American Heroes & Brew in Carlsbad Village is a short drive from Vista and Oceanside and is one of North County’s favorite sports bars. We show every game on 16 TVs (NFL, NBA, college football, UFC PPV), pour a full bar and craft beer, and serve burgers, wings, and an authentic Philly cheesesteak all day. We’re at 300 Carlsbad Village Drive, Carlsbad — walk-ins welcome.',
  },
  {
    question: 'Who has the best burgers in Carlsbad and North County?',
    answer:
      'American Heroes & Brew is known for some of the best burgers in Carlsbad — fresh, never-frozen patties cooked to order, stacked on toasted buns, with loaded options like the Minneapolis Burger. Pair one with the game on 16 TVs and Thirsty Thursday burger specials. We’re in Carlsbad Village at 300 Carlsbad Village Drive.',
  },
  {
    question: 'Where can I find the best wings in Carlsbad?',
    answer:
      'American Heroes & Brew serves signature wings that are a Carlsbad Village favorite — tossed in your choice of sauces and best enjoyed on Wings & Well Wednesday with the game on. Find them at 300 Carlsbad Village Drive, Carlsbad.',
  },
  {
    question: 'Does American Heroes & Brew have happy hour and drink specials?',
    answer:
      'Yes — American Heroes & Brew runs daily specials all week, including Friday Funday happy-hour pricing on drinks and apps, plus Mahalo Monday, Taco Tuesday, Wings & Well Wednesday, and Thirsty Thursday. There’s a full bar with craft beer on tap. We’re in Carlsbad Village at 300 Carlsbad Village Drive.',
  },
  {
    question: 'Where is the best place to watch soccer and the World Cup in Carlsbad?',
    answer:
      'American Heroes & Brew hosted 2026 FIFA World Cup watch parties in Carlsbad Village on 16 TVs. The tournament has ended — football season is the lead now (every NFL game), and we still show soccer and other sports with the sound up for the big fixtures, a full bar, and food all day. 300 Carlsbad Village Drive, Carlsbad. Walk-ins welcome, no cover.',
  },
  {
    question: 'How rated is American Heroes & Brew, and is it a good place to watch the game?',
    answer:
      'American Heroes & Brew holds a 4.7-star rating and is one of the most highly-rated sports bars in Carlsbad and North County San Diego. With 16 TVs showing every game, a full bar, all-American food, and a family-friendly atmosphere in Carlsbad Village, it’s consistently a top pick for watching NFL, NBA, college football, soccer, and UFC.',
  },
];
