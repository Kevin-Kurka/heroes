/**
 * FILE: early-bird.test.ts
 * PURPOSE: Guard the live Early Bird Weekend Breakfast deal — $22 plates and $5 HH
 * must appear with the Fri–Sun 9–11 AM dine-in window on guest surfaces.
 *
 * OVERVIEW:
 * Replaces the retired vague “2-for-$22 breakfast” claim with the published
 * Toast Early Bird window. Homepage lineup, FAQ, landing pages, /menu brunch
 * specials, and /llms.txt must stay in sync.
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
 * - ✅ Asserts window + $22 / $5 + four plates + $5 drinks
 * - ✅ Forbids Steak & Eggs $20 and vague deal-without-window copy
 *
 * RELATED FILES:
 * - src/lib/early-bird.ts
 * - src/lib/faq-copy.test.ts
 *
 * LAST UPDATED: 2026-09-06
 * MAINTAINER: American Heroes & Brew
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getKnowledge } from './ask';
import { publicMenuCopy } from './config';
import {
  BREAKFAST_HAPPY_HOUR,
  BRUNCH_PAIRING_DRINKS,
  EARLY_BIRD,
  EARLY_BIRD_DAILY_DEALS,
  EARLY_BIRD_HH_DRINKS,
  EARLY_BIRD_PLATES,
  breakfastHappyHourMenuDescription,
  earlyBirdFaqAnswers,
  earlyBirdLandingIntro,
  earlyBirdMenuDescription,
} from './early-bird';
import { FAQ } from './faq';
import { LANDING_PAGES } from './landing-pages';
import { getMenus } from './menu';
import { applyMenuPresentation } from './menu-photos';

const WINDOW = /friday\s*[–-]\s*sunday|friday through sunday|fri\s*[–-]\s*sun/i;
const HOURS = /9\s*[–-]\s*11(?:\s*am)?|9:00\s*am\s*[–-]\s*11:00\s*am/i;
const FOOD_PRICE = /\$22/;
const DRINK_PRICE = /\$5/;
const DINE_IN = /dine-?in/i;
const STEAK_JUNK = /steak\s*&\s*eggs\s*\$?20/i;

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

function assertFramedDeal(text: string, label: string) {
  expect(text, `${label} names Early Bird`).toMatch(/early bird/i);
  expect(text, `${label} has Fri–Sun`).toMatch(WINDOW);
  expect(text, `${label} has 9–11 window`).toMatch(HOURS);
  expect(text, `${label} shows $22`).toMatch(FOOD_PRICE);
  expect(text, `${label} shows $5`).toMatch(DRINK_PRICE);
  expect(text, `${label} is dine-in`).toMatch(DINE_IN);
  expect(text, `${label} lists American Hero Breakfast`).toMatch(/american hero breakfast|ahb breakfast/i);
  expect(text, `${label} lists Toasty Toast`).toMatch(/toasty toast/i);
  expect(text, `${label} lists Hamtown`).toMatch(/hamtown/i);
  expect(text, `${label} lists Biscuits & Gravy`).toMatch(/biscuit/i);
  expect(text, `${label} lists Screwdriver`).toMatch(/screwdriver/i);
  expect(text, `${label} lists Tequila Sunrise`).toMatch(/tequila sunrise/i);
  expect(text, `${label} lists Sangria`).toMatch(/sangria/i);
  expect(text, `${label} lists Bloody Mary Shot`).toMatch(/bloody mary shot/i);
  expect(text, `${label} must not revive Steak & Eggs $20`).not.toMatch(STEAK_JUNK);
}

describe('Early Bird canonical facts', () => {
  it('matches the live Toast deal — four plates for $22, $5 HH, Fri–Sun 9–11 dine-in', () => {
    expect(EARLY_BIRD.name).toBe('Early Bird Weekend Breakfast');
    expect(BREAKFAST_HAPPY_HOUR.name).toBe('Breakfast Happy Hour');
    expect(EARLY_BIRD_PLATES).toEqual([
      'American Hero Breakfast',
      'Toasty Toast',
      'Hamtown Omelette',
      'Biscuits & Gravy (with two eggs)',
    ]);
    expect(EARLY_BIRD_HH_DRINKS).toEqual([
      'Screwdriver',
      'Tequila Sunrise',
      'Sangria',
      'Bloody Mary Shot',
    ]);
    expect(EARLY_BIRD_DAILY_DEALS.map((d) => d.price)).toEqual(['$22', '$5']);
    expect(BRUNCH_PAIRING_DRINKS).toEqual(expect.arrayContaining([
      'Mimosa',
      'bottomless mimosas',
      'Bloody Mary',
      "Sam's Spicy Bloody Mary",
      'Michelada',
      'Espresso Martini',
      'Blueberry Muffin Shot',
    ]));

    const food = earlyBirdMenuDescription();
    const drinks = breakfastHappyHourMenuDescription();
    const intro = earlyBirdLandingIntro();
    assertFramedDeal(`${food}\n${drinks}\n${intro}`, 'canonical copy');
    expect(food).toMatch(/pick any two/i);
    expect(intro).toMatch(/16 tvs/i);
    expect(intro).toMatch(/walk-ins welcome/i);
  });

  it('keeps restaurant open-hours language out of the deal window strings', () => {
    expect(earlyBirdMenuDescription()).not.toMatch(/midnight|11am–10pm|11:00 AM/i);
    expect(earlyBirdFaqAnswers.breakfastDeal).toMatch(/open at 9am/i);
    expect(earlyBirdFaqAnswers.breakfastDeal).toMatch(/9–11 AM window only/i);
  });
});

describe('Early Bird on guest-facing surfaces', () => {
  it('answers breakfast-deal and breakfast-HH questions on the homepage FAQ', () => {
    const blob = FAQ.map((entry) => `${entry.question}\n${entry.answer}`).join('\n');
    assertFramedDeal(blob, 'homepage FAQ');

    const deal = FAQ.find((entry) => /breakfast deal/i.test(entry.question));
    expect(deal).toBeDefined();
    expect(deal!.answer).toMatch(/choose any two/i);
    expect(deal!.answer).toMatch(FOOD_PRICE);

    const hh = FAQ.find((entry) => /breakfast happy hour/i.test(entry.question));
    expect(hh).toBeDefined();
    expect(hh!.answer).toMatch(/\$5 each/i);

    const hours = FAQ.find((entry) => /hours/i.test(entry.question));
    expect(hours!.answer).toMatch(/Friday 9am–midnight/i);
    expect(hours!.answer).not.toMatch(/early bird/i);
  });

  it('puts the framed deal on /breakfast and /happy-hour landing copy', () => {
    const breakfast = LANDING_PAGES.breakfast;
    assertFramedDeal(
      [
        breakfast.metaDescription,
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
    assertFramedDeal(
      [...(happyHour.sections.find((s) => /weekend/i.test(s.heading))?.body ?? [])].join('\n'),
      '/happy-hour weekend',
    );
  });

  it('does not advertise a 2-for-$22 breakfast without the 9–11 window', () => {
    const surfaces = [
      FAQ.map((e) => `${e.question}\n${e.answer}`).join('\n'),
      flattenLandingCopy(),
      getKnowledge().map((e) => `${e.question}\n${e.answer}`).join('\n'),
    ];
    for (const text of surfaces) {
      const vague = text.match(/2\s*-?\s*for\s*-?\s*\$?22|two (?:breakfast )?plates for \$22|two for \$22/gi) ?? [];
      for (const match of vague) {
        const idx = text.toLowerCase().indexOf(match.toLowerCase());
        const nearby = text.slice(Math.max(0, idx - 160), idx + match.length + 160);
        expect(nearby, `unframed deal: "${match}"`).toMatch(HOURS);
      }
      expect(text).not.toMatch(STEAK_JUNK);
    }
  });

  it('shows Early Bird on the Brunch Specials and Specials tab', () => {
    const presented = applyMenuPresentation(getMenus());
    const brunch = presented[0].groups.find((g) => g.name === 'Brunch');
    const brunchSpecials = brunch?.subGroups?.find((g) => g.name === 'Brunch Specials');
    const names = brunchSpecials?.items.map((item) => item.name) ?? [];
    expect(names[0]).toBe(EARLY_BIRD.name);
    expect(names[1]).toBe(BREAKFAST_HAPPY_HOUR.name);
    expect(names).toContain('Chilaquiles');

    const early = brunchSpecials?.items.find((item) => item.name === EARLY_BIRD.name);
    const hh = brunchSpecials?.items.find((item) => item.name === BREAKFAST_HAPPY_HOUR.name);
    expect(early?.description).toBe(earlyBirdMenuDescription());
    expect(hh?.description).toBe(breakfastHappyHourMenuDescription());
    expect(publicMenuCopy(early?.description, early?.name)).toMatch(/\$22/);
    expect(publicMenuCopy(hh?.description, hh?.name)).toMatch(/\$5/);
    expect(early?.imageUrl).toBeUndefined();
    expect(hh?.imageUrl).toBeUndefined();

    const specials = presented[0].groups.find((g) => g.name === 'Specials');
    const weekly = specials?.items.find((item) => /early bird/i.test(item.name));
    expect(weekly).toBeDefined();
    expect(weekly?.description).toMatch(HOURS);
    expect(weekly?.description).toMatch(FOOD_PRICE);
  });

  it('features Fri–Sun Early Bird in the homepage Daily Lineup', () => {
    const home = readFileSync(resolve(__dirname, '../app/HomePageClient.tsx'), 'utf8');
    const page = readFileSync(resolve(__dirname, '../app/page.tsx'), 'utf8');
    expect(home).toMatch(/Early Bird/);
    expect(home).toMatch(/EARLY_BIRD_HOURS_SHORT|9–11 AM/);
    expect(home).toMatch(/\$22/);
    expect(home).toMatch(/\$5/);
    expect(home).toMatch(/Saturday/);
    expect(home).toMatch(/Sunday/);
    expect(home).toContain('EARLY_BIRD_DAILY_DEALS');
    expect(home).not.toMatch(/Come back Monday–Friday for daily specials/);
    expect(page).toMatch(/Saturday:\s*5/);
    expect(page).toMatch(/Sunday:\s*6/);
  });

  it('lists the framed deal in llms.txt and breakfast asset metadata', () => {
    const llms = readFileSync(resolve(__dirname, '../app/llms.txt/route.ts'), 'utf8');
    const assets = readFileSync(resolve(__dirname, '../../scripts/lib/asset-metadata.mjs'), 'utf8');
    assertFramedDeal(llms, 'llms.txt');
    expect(assets).toMatch(/early bird/i);
    expect(assets).toMatch(HOURS);
    expect(assets).toMatch(FOOD_PRICE);
  });

  it('keeps the FAQ retrieval corpus aligned with the live deal', () => {
    const blob = getKnowledge()
      .map((entry) => `${entry.question}\n${entry.answer}`)
      .join('\n');
    assertFramedDeal(blob, 'faq-vectors corpus');
  });
});
