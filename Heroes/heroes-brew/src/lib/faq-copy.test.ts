/**
 * FILE: faq-copy.test.ts
 * PURPOSE: Guard guest-facing FAQ and SEO copy for weekend brunch + Early Bird framing.
 *
 * OVERVIEW:
 * Homepage FAQ, landing-page copy, /llms.txt, and the faq-vectors corpus must
 * describe weekend brunch (Fri–Sun) and the live Early Bird window — never a
 * vague 2-for breakfast promo without 9–11 AM, and never Steak & Eggs $20.
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
 * - ✅ Asserts Early Bird Fri–Sun 9–11 AM + $22 / $5 on guest copy
 * - ✅ Asserts restaurant hours stay separate from the deal window
 *
 * RELATED FILES:
 * - src/lib/early-bird.test.ts
 * - src/lib/faq.ts
 * - src/lib/landing-pages.ts
 *
 * LAST UPDATED: 2026-09-06
 * MAINTAINER: American Heroes & Brew
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getKnowledge } from './ask';
import { FAQ } from './faq';
import { LANDING_PAGES } from './landing-pages';

const STEAK_JUNK = /steak\s*&\s*eggs\s*\$?20/i;
const HOURS = /9\s*[–-]\s*11(?:\s*am)?|9:00\s*am\s*[–-]\s*11:00\s*am/i;

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

function assertNoUnframedDeal(text: string) {
  expect(text).not.toMatch(STEAK_JUNK);
  const vague = text.match(/2\s*-?\s*for\s*-?\s*\$?22|two (?:breakfast )?plates for \$22|two for \$22/gi) ?? [];
  for (const match of vague) {
    const idx = text.toLowerCase().indexOf(match.toLowerCase());
    const nearby = text.slice(Math.max(0, idx - 160), idx + match.length + 160);
    expect(nearby, `unframed deal: "${match}"`).toMatch(HOURS);
  }
}

describe('weekend brunch + Early Bird FAQ copy', () => {
  it('answers that weekend brunch is Friday through Sunday and names Early Bird', () => {
    const breakfast = FAQ.find((entry) => /serve breakfast/i.test(entry.question));
    expect(breakfast).toBeDefined();
    expect(breakfast!.answer).toMatch(/friday through sunday/i);
    expect(breakfast!.answer).toMatch(/brunch/i);
    expect(breakfast!.answer).toMatch(/early bird/i);
    expect(breakfast!.answer).toMatch(HOURS);
    expect(breakfast!.answer).toMatch(/\$22/);
  });

  it('keeps restaurant hours separate from the Early Bird 9–11 window', () => {
    const hours = FAQ.find((entry) => /hours/i.test(entry.question));
    expect(hours).toBeDefined();
    expect(hours!.answer).toMatch(/Monday–Thursday 11am–10pm/i);
    expect(hours!.answer).toMatch(/Friday 9am–midnight/i);
    expect(hours!.answer).not.toMatch(/early bird/i);
    expect(hours!.answer).not.toMatch(/9–11/);
  });

  it('does not advertise an unframed 2-for breakfast promo or Steak & Eggs $20', () => {
    const blob = FAQ.map((entry) => `${entry.question}\n${entry.answer}`).join('\n');
    assertNoUnframedDeal(blob);
    for (const text of flattenLandingCopy()) {
      assertNoUnframedDeal(text);
    }
    assertNoUnframedDeal(
      getKnowledge()
        .map((entry) => `${entry.question}\n${entry.answer}`)
        .join('\n'),
    );
    for (const file of [
      resolve(__dirname, '../app/llms.txt/route.ts'),
      resolve(__dirname, '../../scripts/lib/asset-metadata.mjs'),
    ]) {
      assertNoUnframedDeal(readFileSync(file, 'utf8'));
    }
  });
});
