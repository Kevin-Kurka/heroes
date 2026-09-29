/**
 * FILE: visit.test.ts
 * PURPOSE: Guard Directions / Call / Order URLs and conversion-bar wiring.
 *
 * OVERVIEW:
 * The sticky conversion bar only converts Maps/social traffic if the three
 * actions stay pointed at the live venue. This suite locks the URLs and
 * asserts layout + location still import them.
 *
 * DEPENDENCIES:
 * - ./visit.ts
 * - ../components/VisitActions.tsx
 * - ../components/SiteChrome.tsx
 * - ../app/layout.tsx
 * - ../app/location/LocationPageClient.tsx
 *
 * EXPORTS:
 * - (none — Vitest suite)
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Asserts tel, Maps, DoorDash slug, and chrome wiring
 *
 * RELATED FILES:
 * - src/lib/visit.ts
 * - src/components/ConversionBar.tsx
 *
 * LAST UPDATED: 2026-09-29
 * MAINTAINER: American Heroes & Brew
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DIRECTIONS_URL, DOORDASH_URL, PHONE_DISPLAY, PHONE_TEL } from './visit';

const KITCHEN_LAST_CALL =
  'Kitchen may close earlier on slow nights — call ahead for last food order. Bar open during posted hours.';

describe('visit conversion links', () => {
  it('points Directions, Call, and Order at the live venue', () => {
    expect(DIRECTIONS_URL).toContain('google.com/maps/dir');
    expect(DIRECTIONS_URL).toContain('300+Carlsbad+Village+Dr');
    expect(DIRECTIONS_URL).toContain('STE+120');
    expect(DIRECTIONS_URL).toContain('Carlsbad,+CA+92008');
    expect(PHONE_TEL).toBe('+17609940187');
    expect(PHONE_DISPLAY).toBe('(760) 994-0187');
    expect(DOORDASH_URL).toContain('doordash.com/store/american-heroes-brew-carlsbad-28400831');
  });

  it('wires the sticky bar, root layout, and location page to those links', () => {
    const actions = readFileSync(resolve(__dirname, '../components/VisitActions.tsx'), 'utf8');
    expect(actions).toContain('DIRECTIONS_URL');
    expect(actions).toContain('PHONE_TEL');
    expect(actions).toContain('DOORDASH_URL');
    expect(actions).toContain('Get Directions');
    expect(actions).toContain('Order');

    const chrome = readFileSync(resolve(__dirname, '../components/SiteChrome.tsx'), 'utf8');
    expect(chrome).toContain('ConversionBar');
    expect(chrome).toContain('/review/card');
    expect(chrome).toContain('/menu/printable');

    const layout = readFileSync(resolve(__dirname, '../app/layout.tsx'), 'utf8');
    expect(layout).toContain('SiteChrome');

    const location = readFileSync(
      resolve(__dirname, '../app/location/LocationPageClient.tsx'),
      'utf8',
    );
    expect(location).toContain('VisitActions');
    expect(location).toContain(KITCHEN_LAST_CALL);
  });
});
