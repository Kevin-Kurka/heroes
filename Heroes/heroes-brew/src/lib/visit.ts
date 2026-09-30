/**
 * FILE: visit.ts
 * PURPOSE: Canonical Directions, Call, and DoorDash URLs for conversion CTAs.
 *
 * OVERVIEW:
 * Maps/social traffic should land on one set of visit links — Google Maps
 * directions to the Carlsbad Village address, the tap-to-call tel URI, and the
 * live DoorDash storefront — so the sticky conversion bar, /location, and
 * homepage CTAs cannot drift.
 *
 * DEPENDENCIES:
 * - ./doordash.ts (DoorDash storefront URL)
 *
 * EXPORTS:
 * - DIRECTIONS_URL — Google Maps directions to 300 Carlsbad Village Dr STE 120
 * - PHONE_TEL — E.164 tel URI target (+17609940187)
 * - PHONE_DISPLAY — guest-facing phone string
 * - DOORDASH_URL — re-export of the storefront constant
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Shared visit links used by ConversionBar / VisitActions
 *
 * RELATED FILES:
 * - src/components/VisitActions.tsx
 * - src/components/ConversionBar.tsx
 * - src/lib/doordash.ts
 * - src/lib/visit.test.ts
 *
 * LAST UPDATED: 2026-09-29
 * MAINTAINER: American Heroes & Brew
 */

export { DOORDASH_URL } from './doordash';

/** Google Maps walking/driving directions to the suite. */
export const DIRECTIONS_URL =
  'https://www.google.com/maps/dir//American+Heroes+%26+Brew,+300+Carlsbad+Village+Dr+STE+120,+Carlsbad,+CA+92008';

/** E.164 number for tel: links — (760) 994-0187. */
export const PHONE_TEL = '+17609940187';

export const PHONE_DISPLAY = '(760) 994-0187';
