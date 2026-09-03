/**
 * FILE: menu-specials.ts
 * PURPOSE: Canonical public-menu specials copy (Kevin's list only).
 *
 * OVERVIEW:
 * Shared names and short descriptions for kitchen, hero, brunch, and home
 * specials. Presentation and the homepage both read from here so they cannot drift.
 *
 * DEPENDENCIES:
 * - none
 *
 * EXPORTS:
 * - SPICY_CHICKEN, HOGZILLA, CRUNCHWRAPS, CHILAQUILES
 * - HOME_SPECIALS
 * - CALAMARI, OREO_CHURROS (shared inject ids)
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Current specials: Hogzilla, Crunchwraps, Chilaquiles; Spicy Chicken as a hero
 *
 * LAST UPDATED: 2026-09-03
 * MAINTAINER: American Heroes & Brew
 */

export const CALAMARI = {
  id: 'starting-munchies-calamari',
  name: 'Calamari',
  description: 'Crisp rings and tentacles with marinara and house aioli.',
} as const;

export const SPICY_CHICKEN = {
  id: 'mains-hero-sandwiches-spicy-chicken',
  name: 'Spicy Chicken',
  description: 'Crispy chicken, smoky bacon, and melted jack.',
} as const;

export const HOGZILLA = {
  id: 'mains-kitchen-specials-hogzilla',
  name: 'Hogzilla',
  description:
    'Carolina BBQ pulled pork stacked with ham, bacon, crisp coleslaw, and fried pickle chips on a toasted brioche bun.',
} as const;

export const CRUNCHWRAPS = {
  id: 'mains-kitchen-specials-crunchwraps',
  name: 'Crunchwraps',
  description: 'Golden, pressed wraps — Carne Asada, Carnitas, or Chicken.',
  proteins: ['Carne Asada', 'Carnitas', 'Chicken'],
} as const;

export const CHILAQUILES = {
  id: 'brunch-specials-chilaquiles',
  name: 'Chilaquiles',
  description: 'A weekend brunch favorite from the kitchen.',
} as const;

export const OREO_CHURROS = {
  id: 'sweets-oreo-churros',
  name: 'Oreo Churros',
  description: 'Warm Oreo-dusted churros with chocolate and caramel for dipping.',
} as const;

/** Kitchen food specials shared by home, /menu Specials, and Mains. */
export const FOOD_SPECIALS = [HOGZILLA, CRUNCHWRAPS, CHILAQUILES] as const;

/** Homepage featured specials — no prices. */
export const HOME_SPECIALS = [
  { name: HOGZILLA.name, description: HOGZILLA.description },
  { name: CHILAQUILES.name, description: CHILAQUILES.description },
  { name: CRUNCHWRAPS.name, description: CRUNCHWRAPS.description },
] as const;
