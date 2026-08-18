/**
 * Seasonal lead copy for the 2026 football campaign. Homepage, nav, and tests
 * share this so the World Cup cannot accidentally stay the featured season.
 */
export const SEASONAL_NAV = {
  label: 'Game Day',
  href: '/watch',
} as const;

export const FOOTBALL_SEASON = {
  eyebrow: '2026 Football Season',
  homeHeadline: 'Every NFL game on 16 TVs',
  homeBody:
    'Sundays, Thursday Night, and Monday Night Football in Carlsbad Village. Family-friendly sports bar, walk-ins welcome, no cover.',
  watchHref: '/watch',
  watchCta: 'Where to watch',
  fantasyHref: '/fantasy-football',
  fantasyCta: 'Fantasy Football',
} as const;
