/**
 * FILE: early-bird.test.ts
 * PURPOSE: Guard the live Toast guest item 2 Eggs for $22 — two eggs
 * breakfast plate, Saturday–Sunday only — and keep Early Bird / TWO for $22
 * / two-plates framing off guest copy.
 *
 * OVERVIEW:
 * Carlsbad Toast published guest name `2 Eggs for $22` with description
 * `Two eggs breakfast plate for $22.` Early Bird is POS-group only (rename
 * to Brunch on display). Homepage lineup, FAQ, landing pages, /menu brunch
 * specials, and /llms.txt must stay in sync. Hours stay: Fri 11am; Sat–Sun 9am.
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
 * - ✅ Asserts 2 Eggs for $22 + Toast description + Sat–Sun on guest surfaces
 * - ✅ Forbids Early Bird brand, TWO for $22 guest name, two-plates, Friday brunch
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
import { publicMenuCopy } from './config';
import {
  BREAKFAST_HAPPY_HOUR,
  BREAKFAST_HH_DAILY_DEAL,
  BREAKFAST_HH_DRINKS,
  BRUNCH_DAYS,
  BRUNCH_DAYS_PROSE,
  TWO_FOR_22,
  TWO_FOR_22_DAILY_DEAL,
  TWO_FOR_22_DESCRIPTION,
  TWO_FOR_22_NAME,
  TWO_FOR_22_PRINT,
  breakfastHappyHourMenuDescription,
  brunchFaqAnswers,
  brunchLandingIntro,
  twoFor22MenuDescription,
} from './early-bird';
import { FAQ } from './faq';
import { LANDING_PAGES } from './landing-pages';
import { getMenus, getRestaurantInfo } from './menu';
import { applyMenuPresentation } from './menu-photos';
import { getRestaurantJsonLd } from './structured-data';

const SAT_SUN = /saturday\s*[–-]\s*sunday|saturday and sunday|saturday through sunday|sat\s*[–-]\s*sun/i;
const FRIDAY_BRUNCH = /friday\s*[–-]\s*sunday|friday through sunday|fri\s*[–-]\s*sun|friday,\s*saturday,\s*and sunday/i;
const FRIDAY_9AM_OPEN = /friday\s+9(?::00)?\s*am|open at 9am friday/i;
const TWO_EGGS_DEAL = /2 eggs for \$?22/i;
const TWO_EGGS = /two eggs breakfast plate/i;
const RETIRED_GUEST_NAME = /\bTWO for \$?22\b/;
const FORBIDDEN_BRAND = /early bird/i;
const FORBIDDEN_TWO_PLATES =
  /two breakfast plates|two plates for \$22|pick any two|mix-?and-?match two|two breakfasts/i;

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

function assertTwoEggsDeal(text: string, label: string) {
  expect(text, `${label} names 2 Eggs for $22`).toMatch(TWO_EGGS_DEAL);
  expect(text, `${label} uses Toast description`).toMatch(TWO_EGGS);
  expect(text, `${label} is Sat–Sun`).toMatch(SAT_SUN);
  expect(text, `${label} must not say TWO for $22`).not.toMatch(RETIRED_GUEST_NAME);
  expect(text, `${label} must not say Early Bird`).not.toMatch(FORBIDDEN_BRAND);
  expect(text, `${label} must not use two-plates framing`).not.toMatch(FORBIDDEN_TWO_PLATES);
  expect(text, `${label} must not restore Friday brunch`).not.toMatch(FRIDAY_BRUNCH);
}

describe('2 Eggs for $22 canonical facts', () => {
  it('is 2 Eggs for $22 — Toast plate copy, Saturday–Sunday, no Early Bird brand', () => {
    expect(TWO_FOR_22_NAME).toBe('2 Eggs for $22');
    expect(TWO_FOR_22.name).toBe('2 Eggs for $22');
    expect(TWO_FOR_22_DESCRIPTION).toBe('Two eggs breakfast plate for $22.');
    expect(BRUNCH_DAYS).toBe('Saturday–Sunday');
    expect(BRUNCH_DAYS_PROSE).toBe('Saturday and Sunday');
    expect(TWO_FOR_22_PRINT).toBe('Sat–Sun');
    expect(TWO_FOR_22_DAILY_DEAL).toEqual({
      item: '2 Eggs for $22',
      detail: 'Sat–Sun',
      price: '$22',
    });
    expect(BREAKFAST_HAPPY_HOUR.name).toBe('Breakfast Happy Hour');
    expect(BREAKFAST_HH_DRINKS).toEqual([
      'Screwdriver',
      'Tequila Sunrise',
      'Sangria',
      'Bloody Mary Shot',
    ]);
    expect(BREAKFAST_HH_DAILY_DEAL.price).toBe('$5');

    const food = twoFor22MenuDescription();
    const intro = brunchLandingIntro();
    assertTwoEggsDeal(`${food}\n${intro}`, 'canonical copy');
    expect(food).toBe('Two eggs breakfast plate for $22.');
    expect(breakfastHappyHourMenuDescription()).toMatch(/saturday\s*[–-]\s*sunday/i);
    expect(breakfastHappyHourMenuDescription()).toMatch(/\$5/);
    expect(breakfastHappyHourMenuDescription()).toMatch(/screwdriver/i);
    expect(intro).toMatch(/16 tvs/i);
    expect(intro).toMatch(/walk-ins welcome/i);
    expect(brunchFaqAnswers.serveBreakfast).toMatch(/saturday and sunday/i);
    expect(brunchFaqAnswers.breakfastDeal).toMatch(TWO_EGGS_DEAL);
    expect(brunchFaqAnswers.breakfastDeal).toMatch(TWO_EGGS);
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

describe('2 Eggs for $22 on guest-facing surfaces', () => {
  it('keeps Early Bird brand, TWO for $22, and two-plates framing off every guest surface', () => {
    for (const { label, text } of guestSurfaces()) {
      expect(text, label).not.toMatch(FORBIDDEN_BRAND);
      expect(text, label).not.toMatch(RETIRED_GUEST_NAME);
      expect(text, label).not.toMatch(FORBIDDEN_TWO_PLATES);
      expect(text, label).not.toMatch(FRIDAY_BRUNCH);
      expect(text, label).not.toMatch(FRIDAY_9AM_OPEN);
    }
  });

  it('answers breakfast-deal questions with 2 Eggs for $22 / Toast plate copy', () => {
    const blob = FAQ.map((entry) => `${entry.question}\n${entry.answer}`).join('\n');
    assertTwoEggsDeal(blob, 'homepage FAQ');

    const deal = FAQ.find((entry) => /breakfast deal/i.test(entry.question));
    expect(deal).toBeDefined();
    expect(deal!.answer).toMatch(TWO_EGGS_DEAL);
    expect(deal!.answer).toMatch(TWO_EGGS);
    expect(deal!.answer).toMatch(SAT_SUN);

    const hh = FAQ.find((entry) => /breakfast happy hour/i.test(entry.question));
    expect(hh).toBeDefined();
    expect(hh!.answer).toMatch(/\$5 each/i);
    expect(hh!.answer).toMatch(/saturday and sunday/i);

    const breakfast = FAQ.find((entry) => /serve breakfast/i.test(entry.question));
    expect(breakfast!.answer).toMatch(/saturday and sunday/i);
    expect(breakfast!.answer).toMatch(TWO_EGGS_DEAL);

    const hours = FAQ.find((entry) => /hours/i.test(entry.question));
    expect(hours!.answer).toMatch(/Friday 11am–midnight/i);
    expect(hours!.answer).not.toMatch(/Friday 9am/i);
    expect(hours!.answer).not.toMatch(FORBIDDEN_BRAND);
  });

  it('puts 2 Eggs for $22 on /breakfast and the /happy-hour weekend section', () => {
    const breakfast = LANDING_PAGES.breakfast;
    assertTwoEggsDeal(
      [
        breakfast.metaDescription,
        breakfast.tagline,
        ...breakfast.intro,
        ...breakfast.sections.flatMap((s) => [...(s.body ?? []), ...(s.bullets ?? [])]),
        ...breakfast.faqs.map((f) => `${f.question}\n${f.answer}`),
      ].join('\n'),
      '/breakfast',
    );
    expect(breakfast.faqs.some((f) => /breakfast deal/i.test(f.question))).toBe(true);
    expect(breakfast.faqs.some((f) => /breakfast happy hour/i.test(f.question))).toBe(true);
    expect(breakfast.faqs.find((f) => /bottomless mimosas/i.test(f.question))?.answer).toMatch(
      /bottomless mimosas/i,
    );

    const happyHour = LANDING_PAGES['happy-hour'];
    assertTwoEggsDeal(
      [...(happyHour.sections.find((s) => /weekend/i.test(s.heading))?.body ?? [])].join('\n'),
      '/happy-hour weekend',
    );
  });

  it('shows 2 Eggs for $22 on Brunch Specials and the Specials tab', () => {
    const presented = applyMenuPresentation(getMenus());
    const brunch = presented[0].groups.find((g) => g.name === 'Brunch');
    const brunchSpecials = brunch?.subGroups?.find((g) => g.name === 'Brunch Specials');
    const names = brunchSpecials?.items.map((item) => item.name) ?? [];
    expect(names[0]).toBe(TWO_FOR_22.name);
    expect(names).toContain('Chilaquiles');
    expect(names.join(' ')).not.toMatch(FORBIDDEN_BRAND);

    const deal = brunchSpecials?.items.find((item) => item.name === TWO_FOR_22.name);
    expect(deal?.description).toBe(twoFor22MenuDescription());
    expect(publicMenuCopy(deal?.description, deal?.name)).toMatch(/\$22/);
    expect(publicMenuCopy(deal?.description, deal?.name)).toBe(TWO_FOR_22_DESCRIPTION);
    expect(names[1]).toBe(BREAKFAST_HAPPY_HOUR.name);
    const hh = brunchSpecials?.items.find((item) => item.name === BREAKFAST_HAPPY_HOUR.name);
    expect(hh?.description).toBe(breakfastHappyHourMenuDescription());
    expect(publicMenuCopy(hh?.description, hh?.name)).toMatch(/\$5/);
    expect(deal?.imageUrl).toBeUndefined();

    const specials = presented[0].groups.find((g) => g.name === 'Specials');
    const weekly = specials?.items.find((item) => /2 eggs for \$22/i.test(item.name));
    expect(weekly).toBeDefined();
    expect(weekly?.name).toBe(TWO_FOR_22.name);
    expect(weekly?.description).toBe(TWO_FOR_22_DESCRIPTION);
    expect(TWO_FOR_22.window).toMatch(SAT_SUN);
    expect(specials?.items.map((item) => item.name).join('\n')).toMatch(/friday funday/i);
  });

  it('renames a Toast EARLY BIRD group and keeps 2 Eggs for $22, dropping retired Early Bird item names', () => {
    const seeded = getMenus();
    const brunch = seeded[0].groups.find((g) => g.name === 'Brunch');
    brunch?.subGroups?.unshift({
      id: 'toast-early-bird',
      name: 'EARLY BIRD',
      items: [
        { id: 'toast-two-for-22', name: 'TWO for $22', description: 'old sheet line' },
        { id: 'retired-early-bird', name: 'Early Bird Weekend Breakfast', description: 'Two plates for $22.' },
      ],
    });
    const presented = applyMenuPresentation(seeded);
    const presentedBrunch = presented[0].groups.find((g) => g.name === 'Brunch');
    const groupNames = presentedBrunch?.subGroups?.map((g) => g.name).join('\n') ?? '';
    expect(groupNames).not.toMatch(FORBIDDEN_BRAND);
    const names = presentedBrunch?.subGroups?.flatMap((g) => g.items.map((item) => item.name)).join('\n') ?? '';
    expect(names).toMatch(/2 Eggs for \$22/);
    expect(names).not.toMatch(FORBIDDEN_BRAND);
    expect(names).toMatch(/Chilaquiles/);
  });

  it('canonicalizes sheet TWO for $22 aliases to 2 Eggs for $22 and folds EARLY BIRD into Brunch', () => {
    const seeded = getMenus();
    seeded[0].groups.push({
      id: 'toast-early-bird-tab',
      name: 'EARLY BIRD',
      items: [
        { id: 'sheet-two', name: '2 for $22', description: 'Pick any two plates for $22.' },
      ],
    });
    const plates = seeded[0].groups
      .find((g) => g.name === 'Brunch')
      ?.subGroups?.find((g) => g.name === 'Plates');
    plates?.items.push({
      id: 'sheet-two-on-plates',
      name: 'TWO for $22',
      description: 'Two breakfast plates mix-and-match for $22.',
    });

    const presented = applyMenuPresentation(seeded);
    const blob = JSON.stringify(presented);
    expect(blob).not.toMatch(FORBIDDEN_BRAND);
    expect(blob).not.toMatch(FORBIDDEN_TWO_PLATES);
    expect(presented[0].groups.map((g) => g.name).join('\n')).not.toMatch(FORBIDDEN_BRAND);

    const twoFor22 = presented[0].groups
      .flatMap((g) => [g, ...(g.subGroups ?? [])])
      .flatMap((g) => g.items)
      .filter((item) => /2 eggs for \$22/i.test(item.name));
    expect(twoFor22.length).toBeGreaterThan(0);
    for (const item of twoFor22) {
      expect(item.name).toBe(TWO_FOR_22.name);
      expect(item.description).toBe(twoFor22MenuDescription());
    }
  });

  it('features 2 Eggs for $22 on Sat–Sun Daily Lineup and Friday Funday alone on Friday', () => {
    const home = readFileSync(resolve(__dirname, '../app/HomePageClient.tsx'), 'utf8');
    const page = readFileSync(resolve(__dirname, '../app/page.tsx'), 'utf8');
    expect(home).toContain('FRIDAY_FUNDAY_DEAL');
    expect(home).toContain('TWO_FOR_22_DAILY_DEAL');
    expect(home).toContain('BREAKFAST_HH_DAILY_DEAL');
    expect(home).not.toMatch(FORBIDDEN_BRAND);
    expect(home).not.toMatch(FORBIDDEN_TWO_PLATES);
    expect(home).not.toMatch(/Come back Monday–Friday for daily specials/);
    const fridayBlock = home.match(/day:\s*'Friday'[\s\S]*?(?=day:\s*'Saturday')/)?.[0] ?? '';
    expect(fridayBlock).toMatch(/Friday Funday/);
    expect(fridayBlock).toContain('FRIDAY_FUNDAY_DEAL');
    expect(fridayBlock).not.toMatch(/2 Eggs for \$22|TWO for \$22|Weekend Brunch|breakfast/i);
    expect(home).toMatch(/day:\s*'Saturday'[\s\S]*TWO_FOR_22_DAILY_DEAL/);
    expect(home).toMatch(/day:\s*'Sunday'[\s\S]*TWO_FOR_22_DAILY_DEAL/);
    expect(home).toMatch(/time:\s*'Opens 9 AM'/);
    expect(page).toMatch(/Saturday:\s*5/);
    expect(page).toMatch(/Sunday:\s*6/);
  });

  it('lists 2 Eggs for $22 in llms.txt and breakfast asset metadata', () => {
    const llms = readFileSync(resolve(__dirname, '../app/llms.txt/route.ts'), 'utf8');
    const assets = readFileSync(resolve(__dirname, '../../scripts/lib/asset-metadata.mjs'), 'utf8');
    assertTwoEggsDeal(llms, 'llms.txt');
    assertTwoEggsDeal(assets, 'asset metadata');
  });

  it('keeps the FAQ retrieval corpus aligned with 2 Eggs for $22', () => {
    const blob = getKnowledge()
      .map((entry) => `${entry.question}\n${entry.answer}`)
      .join('\n');
    assertTwoEggsDeal(blob, 'faq-vectors corpus');
  });
});
