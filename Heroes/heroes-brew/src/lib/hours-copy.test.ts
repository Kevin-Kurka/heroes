/**
 * FILE: hours-copy.test.ts
 * PURPOSE: Guard the kitchen last-call note next to posted hours.
 *
 * OVERVIEW:
 * Guests (and answer engines) should see the same soft GBP disclaimer wherever
 * restaurant hours are listed — location page, FAQ, and /llms.txt — without a
 * separate kitchen-hours table.
 *
 * DEPENDENCIES:
 * - ./faq.ts
 * - ../app/location/LocationPageClient.tsx
 * - ../app/llms.txt/route.ts
 *
 * EXPORTS:
 * - (none — Vitest suite)
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Asserts the exact GBP kitchen last-call sentence on hours surfaces
 *
 * RELATED FILES:
 * - src/lib/faq.ts
 * - src/app/location/LocationPageClient.tsx
 * - src/app/llms.txt/route.ts
 *
 * LAST UPDATED: 2026-09-19
 * MAINTAINER: American Heroes & Brew
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FAQ } from './faq';

const KITCHEN_LAST_CALL =
  'Kitchen may close earlier on slow nights — call ahead for last food order. Bar open during posted hours.';

describe('kitchen last-call disclaimer', () => {
  it('uses the same GBP sentence on location hours, FAQ hours, and llms.txt', () => {
    const hoursFaq = FAQ.find((entry) => /hours/i.test(entry.question));
    expect(hoursFaq).toBeDefined();
    expect(hoursFaq!.answer).toContain(KITCHEN_LAST_CALL);

    const location = readFileSync(
      resolve(__dirname, '../app/location/LocationPageClient.tsx'),
      'utf8',
    );
    expect(location).toContain(KITCHEN_LAST_CALL);

    const llms = readFileSync(resolve(__dirname, '../app/llms.txt/route.ts'), 'utf8');
    expect(llms).toContain(KITCHEN_LAST_CALL);
  });
});
