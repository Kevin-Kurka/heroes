/**
 * FILE: early-bird.ts
 * PURPOSE: Canonical TWO for $22 weekend breakfast deal facts and brunch copy.
 *
 * OVERVIEW:
 * Single source for the live Toast item TWO for $22 (Saturday–Sunday): a
 * breakfast plate with two eggs for $22. Guest copy never uses the archived
 * Early Bird brand or “two breakfast plates” mix-and-match framing. Homepage
 * lineup, /menu Brunch + Specials, /breakfast, FAQ, and /llms.txt read from
 * here so the days and meaning cannot drift.
 *
 * DEPENDENCIES:
 * - none
 *
 * EXPORTS:
 * - BRUNCH_DAYS, BRUNCH_DAYS_PROSE
 * - TWO_FOR_22, TWO_FOR_22_NAME, TWO_FOR_22_PRICE, TWO_FOR_22_DAILY_DEAL
 * - FRIDAY_FUNDAY_DEAL
 * - twoFor22MenuDescription, brunchLandingIntro, brunchFaqAnswers
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Sat–Sun TWO for $22 = two eggs; Friday Funday 1–4 PM
 * - ❌ Early Bird brand / two-plates mix-and-match (retired)
 * - ❌ $5 breakfast happy hour (not confirmed as a separate live deal)
 *
 * RELATED FILES:
 * - src/lib/menu-specials.ts
 * - src/lib/faq.ts
 * - src/lib/landing-pages.ts
 * - src/lib/early-bird.test.ts
 *
 * LAST UPDATED: 2026-09-11
 * MAINTAINER: American Heroes & Brew
 */

/** Weekend brunch service — Saturday and Sunday only. */
export const BRUNCH_DAYS = 'Saturday–Sunday';
export const BRUNCH_DAYS_PROSE = 'Saturday and Sunday';

/** Toast POS item name — guest title. Means two eggs, not two plates. */
export const TWO_FOR_22_NAME = 'TWO for $22';
export const TWO_FOR_22_PRICE = '$22';

export function twoFor22MenuDescription(): string {
  return `${BRUNCH_DAYS}. ${TWO_FOR_22_NAME} — a breakfast plate with two eggs for ${TWO_FOR_22_PRICE}.`;
}

export const TWO_FOR_22 = {
  id: 'brunch-specials-two-for-22',
  name: TWO_FOR_22_NAME,
  window: BRUNCH_DAYS,
  description: twoFor22MenuDescription(),
} as const;

/** Homepage Daily Lineup row — deal price stays visible (like weekday specials). */
export const TWO_FOR_22_DAILY_DEAL = {
  item: TWO_FOR_22_NAME,
  detail: 'Breakfast plate with two eggs',
  price: TWO_FOR_22_PRICE,
} as const;

export const FRIDAY_FUNDAY_DEAL = {
  item: 'Drinks & Munchies',
  detail: '1–4 PM',
  price: '$2 off',
} as const;

export function brunchLandingIntro(): string {
  return `Weekend breakfast at American Heroes & Brew in Carlsbad Village — ${BRUNCH_DAYS_PROSE}. ${TWO_FOR_22_NAME}: a breakfast plate with two eggs for ${TWO_FOR_22_PRICE}. The brunch menu also includes the American Hero Breakfast, Toasty Toast, Hamtown Omelette, Biscuits & Gravy, breakfast burritos, and Chilaquiles. Pair it with a mimosa, bottomless mimosas, a Bloody Mary, an Espresso Martini, or a Blueberry Muffin Shot — and catch the early games on 16 TVs. 300 Carlsbad Village Drive · walk-ins welcome · no reservations needed.`;
}

export const brunchFaqAnswers = {
  serveBreakfast:
    `Yes — brunch is served Saturday and Sunday. ${TWO_FOR_22_NAME} is a breakfast plate with two eggs for ${TWO_FOR_22_PRICE}. The menu also includes the American Hero Breakfast, Toasty Toast, Hamtown Omelette, Biscuits & Gravy, breakfast burritos, and Chilaquiles as a brunch special. Pair it with mimosas, bottomless mimosas, or a Bloody Mary, and catch the early games on 16 TVs.`,
  breakfastDeal:
    `Yes. ${TWO_FOR_22_NAME} is Saturday and Sunday — a breakfast plate with two eggs for ${TWO_FOR_22_PRICE}. We open at 9am those days.`,
  bottomlessMimosas:
    `Yes — American Heroes & Brew offers mimosas and bottomless mimosas with weekend brunch Saturday and Sunday in Carlsbad Village, alongside Bloody Marys, Sam’s Spicy Bloody Mary, micheladas, Espresso Martinis, and Blueberry Muffin Shots.`,
} as const;
