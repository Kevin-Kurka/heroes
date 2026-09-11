/**
 * FILE: early-bird.ts
 * PURPOSE: Canonical 2 Eggs for $22 and Breakfast Happy Hour weekend facts.
 *
 * OVERVIEW:
 * Single source for the live Toast guest item 2 Eggs for $22 (Saturday–Sunday).
 * Menu Designer locked print: title “2 Eggs for $22”, detail
 * “Sat–Sun · Two eggs breakfast plate for $22.” — not two plates, not Early
 * Bird, not TWO for $22 / 2 eggs any style. Breakfast Happy Hour is the same
 * Sat–Sun window. Homepage lineup, /menu Brunch + Specials, /breakfast, FAQ,
 * and /llms.txt read from here so the days and meaning cannot drift.
 *
 * DEPENDENCIES:
 * - none
 *
 * EXPORTS:
 * - BRUNCH_DAYS, BRUNCH_DAYS_PROSE
 * - TWO_FOR_22, TWO_FOR_22_NAME, TWO_FOR_22_PRICE, TWO_FOR_22_DESCRIPTION,
 *   TWO_FOR_22_PRINT, TWO_FOR_22_DAILY_DEAL
 * - BREAKFAST_HAPPY_HOUR, BREAKFAST_HH_DRINKS, BREAKFAST_HH_DAILY_DEAL
 * - FRIDAY_FUNDAY_DEAL
 * - twoFor22MenuDescription, breakfastHappyHourMenuDescription
 * - brunchLandingIntro, brunchFaqAnswers
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Sat–Sun 2 Eggs for $22 = locked Toast print; Breakfast Happy Hour $5
 * - ✅ Friday Funday 1–4 PM
 * - ❌ Early Bird brand / TWO for $22 guest name / two-plates mix-and-match
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

/** Toast published guest item name. Means two eggs, not two plates. */
export const TWO_FOR_22_NAME = '2 Eggs for $22';
export const TWO_FOR_22_PRICE = '$22';
/** Menu Designer locked guest print (title is TWO_FOR_22_NAME). */
export const TWO_FOR_22_DESCRIPTION = 'Sat–Sun · Two eggs breakfast plate for $22.';
export const TWO_FOR_22_PRINT = TWO_FOR_22_DESCRIPTION;

export function twoFor22MenuDescription(): string {
  return TWO_FOR_22_DESCRIPTION;
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
  detail: TWO_FOR_22_PRINT,
  price: TWO_FOR_22_PRICE,
} as const;

/** $5 breakfast happy hour — same Sat–Sun weekend window. */
export const BREAKFAST_HH_DRINKS = [
  'Screwdriver',
  'Tequila Sunrise',
  'Sangria',
  'Bloody Mary Shot',
] as const;

export const BREAKFAST_HAPPY_HOUR_PRICE = '$5';

const hhList = BREAKFAST_HH_DRINKS.join(', ');
const hhListOr = hhList.replace(/, ([^,]+)$/, ', or $1');

export function breakfastHappyHourMenuDescription(): string {
  return `${BRUNCH_DAYS}. ${BREAKFAST_HAPPY_HOUR_PRICE} ${hhListOr}.`;
}

export const BREAKFAST_HAPPY_HOUR = {
  id: 'brunch-specials-breakfast-hh',
  name: 'Breakfast Happy Hour',
  window: BRUNCH_DAYS,
  description: breakfastHappyHourMenuDescription(),
} as const;

export const BREAKFAST_HH_DAILY_DEAL = {
  item: 'Breakfast happy hour',
  detail: hhList.replace(/, /g, ' · '),
  price: BREAKFAST_HAPPY_HOUR_PRICE,
} as const;

export const FRIDAY_FUNDAY_DEAL = {
  item: 'Drinks & Munchies',
  detail: '1–4 PM',
  price: '$2 off',
} as const;

export function brunchLandingIntro(): string {
  return `Weekend breakfast at American Heroes & Brew in Carlsbad Village — ${BRUNCH_DAYS_PROSE}. ${TWO_FOR_22_NAME}: ${TWO_FOR_22_DESCRIPTION} Breakfast happy hour the same days: ${BREAKFAST_HAPPY_HOUR_PRICE} ${hhListOr}. The brunch menu also includes the American Hero Breakfast, Toasty Toast, Hamtown Omelette, Biscuits & Gravy, breakfast burritos, and Chilaquiles. Pair it with a mimosa, bottomless mimosas, a Bloody Mary, an Espresso Martini, or a Blueberry Muffin Shot — and catch the early games on 16 TVs. 300 Carlsbad Village Drive · walk-ins welcome · no reservations needed.`;
}

export const brunchFaqAnswers = {
  serveBreakfast:
    `Yes — brunch is served Saturday and Sunday. ${TWO_FOR_22_NAME} — ${TWO_FOR_22_DESCRIPTION} We also run a ${BREAKFAST_HAPPY_HOUR_PRICE} breakfast happy hour those same days. The menu also includes the American Hero Breakfast, Toasty Toast, Hamtown Omelette, Biscuits & Gravy, breakfast burritos, and Chilaquiles as a brunch special. Pair it with mimosas, bottomless mimosas, or a Bloody Mary, and catch the early games on 16 TVs.`,
  breakfastDeal:
    `Yes. ${TWO_FOR_22_NAME} — ${TWO_FOR_22_DESCRIPTION} We open at 9am Saturday and Sunday.`,
  breakfastHappyHour:
    `Yes. Breakfast happy hour is Saturday and Sunday: Screwdriver, Tequila Sunrise, Sangria (Pasmosa Red Sangria), and Bloody Mary Shot for ${BREAKFAST_HAPPY_HOUR_PRICE} each.`,
  bottomlessMimosas:
    `Yes — American Heroes & Brew offers mimosas and bottomless mimosas with weekend brunch Saturday and Sunday in Carlsbad Village, alongside Bloody Marys, Sam’s Spicy Bloody Mary, micheladas, Espresso Martinis, and Blueberry Muffin Shots.`,
} as const;
