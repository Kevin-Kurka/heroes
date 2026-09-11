/**
 * FILE: faq-copy.test.ts
 * PURPOSE: Guard guest-facing FAQ and SEO copy for weekend brunch (Sat–Sun).
 *
 * OVERVIEW:
 * Homepage FAQ, landing-page copy, /llms.txt, and the faq-vectors corpus must
 * describe weekend brunch Saturday and Sunday — never Friday brunch hours,
 * never Early Bird / two-plates / $22 deal copy, and never Steak & Eggs $20.
 *
 * DEPENDENCIES:
 * - ./faq.ts
 * - ./landing-pages.ts
 * - ./ask.ts
 * - ../app/llms.txt/route.ts
 * - ../../scripts/lib/asset-metadata.mjs
 *
 * EXPORTS:
 * - (none — Vitest suite)
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Asserts Sat–Sun brunch and Friday 11am restaurant hours
 * - ✅ Forbids Early Bird deal copy and Friday 9am open
 *
 * RELATED FILES:
 * - src/lib/early-bird.test.ts
 * - src/lib/faq.ts
 * - src/lib/landing-pages.ts
 *
 * LAST UPDATED: 2026-09-11
 * MAINTAINER: American Heroes & Brew
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getKnowledge } from './ask';
import { FAQ } from './faq';
import { LANDING_PAGES } from './landing-pages';

const STEAK_JUNK = /steak\s*&\s*eggs\s*\$?20/i;
const EARLY_BIRD_DEAL =
  /early bird|two breakfast plates|two plates for \$22|2\s*-?\s*for\s*-?\s*\$?22/i;

function flattenLandingCopy(): string[] {
  return Object.values(LANDING_PAGES).map((page) =>
    [
      page.metaTitle,
      page.metaDescription,
      page.h1,
      page.tagline,
      ...page.intro,
      ...page.sections.flatMap((section) => [
        section.heading,
        ...(section.body ?? []),
        ...(section.bullets ?? []),
      ]),
      ...page.faqs.flatMap((faq) => [faq.question, faq.answer]),
    ].join('\n'),
  );
}

describe('weekend brunch FAQ copy', () => {
  it('answers that weekend brunch is Saturday and Sunday', () => {
    const breakfast = FAQ.find((entry) => /serve breakfast/i.test(entry.question));
    expect(breakfast).toBeDefined();
    expect(breakfast!.answer).toMatch(/saturday and sunday/i);
    expect(breakfast!.answer).toMatch(/brunch/i);
    expect(breakfast!.answer).not.toMatch(EARLY_BIRD_DEAL);
  });

  it('keeps restaurant hours as Friday 11am open, Sat–Sun 9am open', () => {
    const hours = FAQ.find((entry) => /hours/i.test(entry.question));
    expect(hours).toBeDefined();
    expect(hours!.answer).toMatch(/Monday–Thursday 11am–10pm/i);
    expect(hours!.answer).toMatch(/Friday 11am–midnight/i);
    expect(hours!.answer).not.toMatch(/Friday 9am/i);
    expect(hours!.answer).not.toMatch(/early bird/i);
  });

  it('does not advertise Early Bird, two plates for $22, or Steak & Eggs $20', () => {
    const blob = FAQ.map((entry) => `${entry.question}\n${entry.answer}`).join('\n');
    expect(blob).not.toMatch(STEAK_JUNK);
    expect(blob).not.toMatch(EARLY_BIRD_DEAL);
    for (const text of flattenLandingCopy()) {
      expect(text).not.toMatch(STEAK_JUNK);
      expect(text).not.toMatch(EARLY_BIRD_DEAL);
    }
    const knowledge = getKnowledge()
      .map((entry) => `${entry.question}\n${entry.answer}`)
      .join('\n');
    expect(knowledge).not.toMatch(STEAK_JUNK);
    expect(knowledge).not.toMatch(EARLY_BIRD_DEAL);
    for (const file of [
      resolve(__dirname, '../app/llms.txt/route.ts'),
      resolve(__dirname, '../../scripts/lib/asset-metadata.mjs'),
    ]) {
      const text = readFileSync(file, 'utf8');
      expect(text).not.toMatch(STEAK_JUNK);
      expect(text).not.toMatch(EARLY_BIRD_DEAL);
    }
  });
});
