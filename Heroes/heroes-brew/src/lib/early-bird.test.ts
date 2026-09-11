/**
 * FILE: early-bird.test.ts
 * PURPOSE: Guard weekend brunch (Sat–Sun) and restaurant hours — and forbid
 * retired Early Bird / two-plates / $22 deal copy on guest surfaces.
 *
 * OVERVIEW:
 * Kevin retired the Early Bird Weekend Breakfast promo. Homepage lineup, FAQ,
 * landing pages, /menu brunch specials, and /llms.txt must describe Sat–Sun
 * brunch without deal branding. Friday opens at 11am; Friday Funday stays.
 *
 * DEPENDENCIES:
 * - ./early-bird.ts
 * - ./faq.ts
 * - ./landing-pages.ts
 * - ./ask.ts
 * - ./menu.ts
 * - ./menu-photos.ts
 * - ../app/llms.txt/route.ts
 * - ../app/HomePageClient.tsx
 * - ../app/page.tsx
 *
 * EXPORTS:
 * - (none — Vitest suite)
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Asserts Sat–Sun brunch, Friday 11am open, no Early Bird deal copy
 *
 * RELATED FILES:
 * - src/lib/early-bird.ts
 * - src/lib/faq-copy.test.ts
 *
 * LAST UPDATED: 2026-09-11
 * MAINTAINER: American Heroes & Brew
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getKnowledge } from './ask';
import { BRUNCH_DAYS, BRUNCH_DAYS_PROSE, brunchFaqAnswers, brunchLandingIntro } from './early-bird';
import { FAQ } from './faq';
import { LANDING_PAGES } from './landing-pages';
import { getMenus, getRestaurantInfo } from './menu';
import { applyMenuPresentation } from './menu-photos';
import { getRestaurantJsonLd } from './structured-data';

const SAT_SUN = /saturday\s*[–-]\s*sunday|saturday and sunday|saturday through sunday|sat\s*[–-]\s*sun/i;
const FRIDAY_BRUNCH = /friday\s*[–-]\s*sunday|friday through sunday|fri\s*[–-]\s*sun|friday,\s*saturday,\s*and sunday/i;
const FRIDAY_9AM_OPEN = /friday\s+9(?::00)?\s*am|open at 9am friday/i;
const EARLY_BIRD_DEAL =
  /early bird|two breakfast plates|two plates for \$22|2\s*-?\s*for\s*-?\s*\$?22/i;

function flattenLandingCopy(): string {
  return Object.values(LANDING_PAGES)
    .flatMap((page) => [
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
    ])
    .join('\n');
}

function guestSurfaces(): { label: string; text: string }[] {
  return [
    { label: 'canonical brunch copy', text: `${brunchLandingIntro()}\n${Object.values(brunchFaqAnswers).join('\n')}` },
    { label: 'homepage FAQ', text: FAQ.map((e) => `${e.question}\n${e.answer}`).join('\n') },
    { label: 'landing pages', text: flattenLandingCopy() },
    { label: 'faq-vectors corpus', text: getKnowledge().map((e) => `${e.question}\n${e.answer}`).join('\n') },
    { label: 'llms.txt', text: readFileSync(resolve(__dirname, '../app/llms.txt/route.ts'), 'utf8') },
    { label: 'asset metadata', text: readFileSync(resolve(__dirname, '../../scripts/lib/asset-metadata.mjs'), 'utf8') },
    { label: 'homepage client', text: readFileSync(resolve(__dirname, '../app/HomePageClient.tsx'), 'utf8') },
  ];
}

describe('weekend brunch canonical facts', () => {
  it('frames brunch as Saturday and Sunday only', () => {
    expect(BRUNCH_DAYS).toBe('Saturday–Sunday');
    expect(BRUNCH_DAYS_PROSE).toBe('Saturday and Sunday');
    expect(brunchLandingIntro()).toMatch(SAT_SUN);
    expect(brunchLandingIntro()).toMatch(/american hero breakfast/i);
    expect(brunchLandingIntro()).toMatch(/toasty toast/i);
    expect(brunchLandingIntro()).toMatch(/16 tvs/i);
    expect(brunchFaqAnswers.serveBreakfast).toMatch(/saturday and sunday/i);
    expect(brunchFaqAnswers.bottomlessMimosas).toMatch(/bottomless mimosas/i);
  });

  it('posts restaurant hours Mon–Fri 11am open, Sat–Sun 9am open', () => {
    expect(getRestaurantInfo().hours).toEqual([
      { dayOfWeek: 'Monday', open: '11:00 AM', close: '10:00 PM' },
      { dayOfWeek: 'Tuesday', open: '11:00 AM', close: '10:00 PM' },
      { dayOfWeek: 'Wednesday', open: '11:00 AM', close: '10:00 PM' },
      { dayOfWeek: 'Thursday', open: '11:00 AM', close: '10:00 PM' },
      { dayOfWeek: 'Friday', open: '11:00 AM', close: '12:00 AM' },
      { dayOfWeek: 'Saturday', open: '9:00 AM', close: '12:00 AM' },
      { dayOfWeek: 'Sunday', open: '9:00 AM', close: '10:00 PM' },
    ]);
    const friday = getRestaurantJsonLd().openingHoursSpecification.find(
      (d: { dayOfWeek: string }) => d.dayOfWeek === 'Friday',
    );
    expect(friday).toMatchObject({ opens: '11:00', closes: '00:00' });
  });
});

describe('no Early Bird deal on guest-facing surfaces', () => {
  it('has zero Early Bird, two-breakfast-plates, or $22 two-plate copy', () => {
    for (const { label, text } of guestSurfaces()) {
      expect(text, label).not.toMatch(EARLY_BIRD_DEAL);
      expect(text, label).not.toMatch(FRIDAY_BRUNCH);
      expect(text, label).not.toMatch(FRIDAY_9AM_OPEN);
    }
  });

  it('answers brunch as Saturday and Sunday on the homepage FAQ', () => {
    const breakfast = FAQ.find((entry) => /serve breakfast/i.test(entry.question));
    expect(breakfast).toBeDefined();
    expect(breakfast!.answer).toMatch(/saturday and sunday/i);
    expect(breakfast!.answer).toMatch(/brunch/i);
    expect(FAQ.some((entry) => /breakfast deal/i.test(entry.question))).toBe(false);
    expect(FAQ.some((entry) => /breakfast happy hour/i.test(entry.question))).toBe(false);

    const hours = FAQ.find((entry) => /hours/i.test(entry.question));
    expect(hours!.answer).toMatch(/Friday 11am–midnight/i);
    expect(hours!.answer).not.toMatch(/Friday 9am/i);
    expect(hours!.answer).not.toMatch(/early bird/i);
  });

  it('keeps Chilaquiles on Brunch Specials and drops Early Bird menu rows', () => {
    const seeded = getMenus();
    seeded[0].groups
      .find((g) => g.name === 'Brunch')
      ?.subGroups?.find((g) => g.name === 'Brunch Specials')
      ?.items.unshift({
        id: 'retired-early-bird',
        name: 'Early Bird Weekend Breakfast',
        description: 'Two plates for $22.',
      });
    const presented = applyMenuPresentation(seeded);
    const brunch = presented[0].groups.find((g) => g.name === 'Brunch');
    const brunchSpecials = brunch?.subGroups?.find((g) => g.name === 'Brunch Specials');
    const names = brunchSpecials?.items.map((item) => item.name) ?? [];
    expect(names).toContain('Chilaquiles');
    expect(names.join(' ')).not.toMatch(EARLY_BIRD_DEAL);

    const specials = presented[0].groups.find((g) => g.name === 'Specials');
    const weekly = specials?.items.map((item) => item.name).join('\n') ?? '';
    expect(weekly).toMatch(/friday funday/i);
    expect(weekly).not.toMatch(EARLY_BIRD_DEAL);
  });

  it('shows Friday Funday alone on Friday and Weekend Brunch on Sat–Sun', () => {
    const home = readFileSync(resolve(__dirname, '../app/HomePageClient.tsx'), 'utf8');
    const page = readFileSync(resolve(__dirname, '../app/page.tsx'), 'utf8');
    expect(home).toContain('FRIDAY_FUNDAY_DEAL');
    expect(home).not.toMatch(EARLY_BIRD_DEAL);
    expect(home).not.toMatch(/Come back Monday–Friday for daily specials/);
    const fridayBlock = home.match(/day:\s*'Friday'[\s\S]*?(?=day:\s*'Saturday')/)?.[0] ?? '';
    expect(fridayBlock).toMatch(/Friday Funday/);
    expect(fridayBlock).toContain('FRIDAY_FUNDAY_DEAL');
    expect(fridayBlock).not.toMatch(/Early Bird|breakfast|Weekend Brunch/i);
    expect(home).toMatch(/day:\s*'Saturday'[\s\S]*Weekend Brunch/);
    expect(home).toMatch(/day:\s*'Sunday'[\s\S]*Weekend Brunch/);
    expect(home).toMatch(/time:\s*'Opens 9 AM'/);
    expect(page).toMatch(/Saturday:\s*5/);
    expect(page).toMatch(/Sunday:\s*6/);
  });
});
