/**
 * FILE: early-bird.ts
 * PURPOSE: Weekend brunch days, Friday Funday, and brunch FAQ/landing copy.
 *
 * OVERVIEW:
 * Guest-facing brunch is Saturday–Sunday only (restaurant opens 9 AM those
 * days). This module holds that framing plus Friday Funday — not a priced
 * breakfast deal. Homepage lineup, /breakfast, FAQ, and /llms.txt read brunch
 * days from here so Friday brunch hours cannot creep back in.
 *
 * DEPENDENCIES:
 * - none
 *
 * EXPORTS:
 * - BRUNCH_DAYS, BRUNCH_DAYS_PROSE
 * - FRIDAY_FUNDAY_DEAL
 * - brunchLandingIntro, brunchFaqAnswers
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Sat–Sun brunch framing; Friday Funday 1–4 PM
 * - ❌ Early Bird / two-plates / $22 / $5 breakfast HH deal copy (retired)
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

export const FRIDAY_FUNDAY_DEAL = {
  item: 'Drinks & Munchies',
  detail: '1–4 PM',
  price: '$2 off',
} as const;

export function brunchLandingIntro(): string {
  return `Weekend breakfast at American Heroes & Brew in Carlsbad Village — ${BRUNCH_DAYS_PROSE}. The brunch menu includes the American Hero Breakfast, Toasty Toast, Hamtown Omelette, Biscuits & Gravy, breakfast burritos, and Chilaquiles. Pair it with a mimosa, bottomless mimosas, a Bloody Mary, an Espresso Martini, or a Blueberry Muffin Shot — and catch the early games on 16 TVs. 300 Carlsbad Village Drive · walk-ins welcome · no reservations needed.`;
}

export const brunchFaqAnswers = {
  serveBreakfast:
    `Yes — brunch is served Saturday and Sunday. The menu includes the American Hero Breakfast, Toasty Toast, Hamtown Omelette, Biscuits & Gravy, breakfast burritos, and Chilaquiles as a brunch special. Pair it with mimosas, bottomless mimosas, or a Bloody Mary, and catch the early games on 16 TVs.`,
  bottomlessMimosas:
    `Yes — American Heroes & Brew offers mimosas and bottomless mimosas with weekend brunch Saturday and Sunday in Carlsbad Village, alongside Bloody Marys, Sam’s Spicy Bloody Mary, micheladas, Espresso Martinis, and Blueberry Muffin Shots.`,
} as const;
