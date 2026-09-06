/**
 * FILE: early-bird.ts
 * PURPOSE: Canonical Early Bird Weekend Breakfast deal facts and guest-facing copy.
 *
 * OVERVIEW:
 * Single source for the live Toast Early Bird (Fri–Sun 9–11 AM dine-in):
 * two plates for $22 and $5 breakfast happy hour. Homepage lineup, /menu
 * Brunch + Specials, /breakfast, FAQ, and /llms.txt read from here so the
 * window and deal prices cannot drift.
 *
 * DEPENDENCIES:
 * - none
 *
 * EXPORTS:
 * - EARLY_BIRD, BREAKFAST_HAPPY_HOUR
 * - EARLY_BIRD_PLATES, EARLY_BIRD_HH_DRINKS, BRUNCH_PAIRING_DRINKS
 * - EARLY_BIRD_DAILY_DEALS
 * - earlyBirdMenuDescription, breakfastHappyHourMenuDescription
 * - earlyBirdLandingIntro, earlyBirdFaqAnswers
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Live Toast deal published 2026-09-06 12:45 PM PT
 * - ❌ Regular item prices (not part of this deal)
 *
 * RELATED FILES:
 * - src/lib/menu-specials.ts
 * - src/lib/faq.ts
 * - src/lib/landing-pages.ts
 * - src/lib/early-bird.test.ts
 *
 * LAST UPDATED: 2026-09-06
 * MAINTAINER: American Heroes & Brew
 */

export const EARLY_BIRD_NAME = 'Early Bird Weekend Breakfast';
export const EARLY_BIRD_DAYS = 'Friday–Sunday';
export const EARLY_BIRD_HOURS = '9:00 AM – 11:00 AM';
export const EARLY_BIRD_HOURS_SHORT = '9–11 AM';
export const EARLY_BIRD_SERVICE = 'dine-in';
export const EARLY_BIRD_FOOD_PRICE = '$22';
export const EARLY_BIRD_DRINK_PRICE = '$5';

/** Four plates guests may mix-and-match for the $22 deal. */
export const EARLY_BIRD_PLATES = [
  'American Hero Breakfast',
  'Toasty Toast',
  'Hamtown Omelette',
  'Biscuits & Gravy (with two eggs)',
] as const;

/** $5 breakfast happy hour — same Fri–Sun 9–11 AM dine-in window. */
export const EARLY_BIRD_HH_DRINKS = [
  'Screwdriver',
  'Tequila Sunrise',
  'Sangria',
  'Bloody Mary Shot',
] as const;

/** Regular-price brunch drinks to promote — no invented prices. */
export const BRUNCH_PAIRING_DRINKS = [
  'Mimosa',
  'bottomless mimosas',
  'Bloody Mary',
  "Sam's Spicy Bloody Mary",
  'Michelada',
  'Espresso Martini',
  'Blueberry Muffin Shot',
] as const;

const plateList = EARLY_BIRD_PLATES.join(', ');
const hhList = EARLY_BIRD_HH_DRINKS.join(', ');

export function earlyBirdMenuDescription(): string {
  return `${EARLY_BIRD_DAYS} · ${EARLY_BIRD_HOURS_SHORT} · ${EARLY_BIRD_SERVICE}. Two breakfast plates for ${EARLY_BIRD_FOOD_PRICE} — pick any two: ${plateList}.`;
}

export function breakfastHappyHourMenuDescription(): string {
  return `${EARLY_BIRD_DAYS} · ${EARLY_BIRD_HOURS_SHORT} · ${EARLY_BIRD_SERVICE}. ${EARLY_BIRD_DRINK_PRICE} ${hhList.replace(/, ([^,]+)$/, ', or $1')}.`;
}

export const EARLY_BIRD = {
  id: 'brunch-specials-early-bird',
  name: EARLY_BIRD_NAME,
  window: `${EARLY_BIRD_DAYS} · ${EARLY_BIRD_HOURS} · ${EARLY_BIRD_SERVICE}`,
  description: earlyBirdMenuDescription(),
} as const;

export const BREAKFAST_HAPPY_HOUR = {
  id: 'brunch-specials-breakfast-hh',
  name: 'Breakfast Happy Hour',
  window: `${EARLY_BIRD_DAYS} · ${EARLY_BIRD_HOURS} · ${EARLY_BIRD_SERVICE}`,
  description: breakfastHappyHourMenuDescription(),
} as const;

/** Homepage Daily Lineup rows — deal prices stay visible (like weekday specials). */
export const EARLY_BIRD_DAILY_DEALS = [
  {
    item: 'Two breakfast plates',
    detail: 'AHB Breakfast · Toasty Toast · Hamtown · Biscuits & Gravy',
    price: EARLY_BIRD_FOOD_PRICE,
  },
  {
    item: 'Breakfast happy hour',
    detail: `${hhList.replace(/, /g, ' · ')}`,
    price: EARLY_BIRD_DRINK_PRICE,
  },
] as const;

export const FRIDAY_FUNDAY_DEAL = {
  item: 'Drinks & Munchies',
  detail: '1–4 PM',
  price: '$2 off',
} as const;

export function earlyBirdLandingIntro(): string {
  return `Weekend breakfast at American Heroes & Brew in Carlsbad Village — Friday through Sunday. Early Bird (${EARLY_BIRD_HOURS_SHORT}): two breakfast plates for ${EARLY_BIRD_FOOD_PRICE} — American Hero Breakfast, Toasty Toast, Hamtown Omelette, or Biscuits & Gravy. Breakfast happy hour (${EARLY_BIRD_HOURS_SHORT}): ${EARLY_BIRD_DRINK_PRICE} Screwdriver, Tequila Sunrise, Sangria, or Bloody Mary Shot. Pair it with a mimosa, bottomless mimosas, a Bloody Mary, an Espresso Martini, or a Blueberry Muffin Shot — and catch the early games on 16 TVs. 300 Carlsbad Village Drive · walk-ins welcome · no reservations needed.`;
}

export const earlyBirdFaqAnswers = {
  serveBreakfast:
    `Yes — brunch is served Friday through Sunday. Early Bird is ${EARLY_BIRD_DAYS} ${EARLY_BIRD_HOURS_SHORT}, dine-in: choose any two from American Hero Breakfast, Toasty Toast, Hamtown Omelette, or Biscuits & Gravy (with two eggs) for ${EARLY_BIRD_FOOD_PRICE}. We also run a ${EARLY_BIRD_DRINK_PRICE} breakfast happy hour in that same window.`,
  breakfastDeal:
    `Yes. Early Bird Weekend Breakfast is ${EARLY_BIRD_DAYS}, ${EARLY_BIRD_HOURS_SHORT}, dine-in — choose any two from American Hero Breakfast, Toasty Toast, Hamtown Omelette, or Biscuits & Gravy (with two eggs) for ${EARLY_BIRD_FOOD_PRICE}. Restaurant hours stay the same (we open at 9am Friday–Sunday); the ${EARLY_BIRD_FOOD_PRICE} deal is the 9–11 AM window only.`,
  breakfastHappyHour:
    `Yes. Breakfast happy hour is ${EARLY_BIRD_DAYS}, ${EARLY_BIRD_HOURS_SHORT}, dine-in: Screwdriver, Tequila Sunrise, Sangria (Pasmosa Red Sangria), and Bloody Mary Shot for ${EARLY_BIRD_DRINK_PRICE} each.`,
  bottomlessMimosas:
    `Yes — American Heroes & Brew offers mimosas and bottomless mimosas with weekend brunch Friday through Sunday in Carlsbad Village, alongside Bloody Marys, Sam’s Spicy Bloody Mary, micheladas, Espresso Martinis, and Blueberry Muffin Shots.`,
} as const;
