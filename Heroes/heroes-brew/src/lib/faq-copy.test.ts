/**
 * FILE: faq-copy.test.ts
 * PURPOSE: Guard guest-facing FAQ and SEO copy from advertising the retired 2-for-$22 breakfast deal.
 *
 * OVERVIEW:
 * Homepage FAQ, landing-page copy, /llms.txt, and the faq-vectors corpus must
 * describe weekend brunch (Fri–Sun) without a priced 2-for breakfast promo.
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
 * - ✅ Asserts no guest-facing 2-for-$22 / 2-for-22 breakfast-deal copy
 * - ✅ Asserts the breakfast FAQ still answers Fri–Sun brunch hours
 *
 * RELATED FILES:
 * - src/lib/faq.ts
 * - src/lib/landing-pages.ts
 *
 * LAST UPDATED: 2026-09-03
 * MAINTAINER: American Heroes & Brew
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getKnowledge } from './ask';
import { FAQ } from './faq';
import { LANDING_PAGES } from './landing-pages';

const RETIRED_DEAL = /2\s*-?\s*for\s*-?\s*\$?22|two for \$?22/i;

function flattenLandingCopy(): string[] {
  return Object.values(LANDING_PAGES).flatMap((page) => [
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
  ]);
}

describe('retired 2-for-$22 breakfast deal', () => {
  it('does not appear in the homepage FAQ', () => {
    const blob = FAQ.map((entry) => `${entry.question}\n${entry.answer}`).join('\n');
    expect(blob).not.toMatch(RETIRED_DEAL);
  });

  it('still answers that weekend brunch is Friday through Sunday', () => {
    const breakfast = FAQ.find((entry) => /serve breakfast/i.test(entry.question));
    expect(breakfast).toBeDefined();
    expect(breakfast!.answer).toMatch(/friday through sunday/i);
    expect(breakfast!.answer).toMatch(/brunch/i);
    expect(breakfast!.answer).not.toMatch(RETIRED_DEAL);
  });

  it('does not appear in SEO landing-page copy', () => {
    for (const text of flattenLandingCopy()) {
      expect(text).not.toMatch(RETIRED_DEAL);
    }
  });

  it('does not appear in the FAQ retrieval corpus used by faq-vectors.json', () => {
    const blob = getKnowledge()
      .map((entry) => `${entry.question}\n${entry.answer}`)
      .join('\n');
    expect(blob).not.toMatch(RETIRED_DEAL);
  });

  it('does not appear in llms.txt or breakfast asset metadata', () => {
    const files = [
      resolve(__dirname, '../app/llms.txt/route.ts'),
      resolve(__dirname, '../../scripts/lib/asset-metadata.mjs'),
    ];
    for (const file of files) {
      expect(readFileSync(file, 'utf8')).not.toMatch(RETIRED_DEAL);
    }
  });
});
