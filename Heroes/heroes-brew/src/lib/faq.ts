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
];
