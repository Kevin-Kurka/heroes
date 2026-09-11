/**
 * FILE: fantasy-archive.test.ts
 * PURPOSE: Guard the archived /fantasy-football season so drafts stay closed.
 *
 * OVERVIEW:
 * Official Heroes drafts are completed and the season is underway. This suite
 * locks the past-tense archive treatment (same idea as World Cup archive copy):
 * the page stays reachable, but guest surfaces must not present live signup,
 * open-spot counts, or "join a draft" CTAs.
 *
 * DEPENDENCIES:
 * - ./fantasy.ts
 * - ../components/FantasyPageView.tsx
 * - ../app/fantasy-football/page.tsx
 * - ../app/events/EventsPageClient.tsx
 * - ../app/HomePageClient.tsx
 * - ../components/TopNav.tsx
 * - ../components/BottomNav.tsx
 * - ../components/AboutFaqSection.tsx
 * - ../app/llms.txt/route.ts
 * - ../app/api/fantasy/signup/route.ts
 *
 * EXPORTS:
 * - (none — Vitest suite)
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Archive flag, copy, page UI, scoreboard, nav/home, signup API
 *
 * RELATED FILES:
 * - src/lib/fantasy.ts
 * - src/lib/fantasy-leagues.test.ts
 *
 * LAST UPDATED: 2026-09-11
 * MAINTAINER: American Heroes & Brew
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FANTASY, FANTASY_ARCHIVED } from './fantasy';

const JOIN_CTA = /sign up now|join a draft|spots? open|pick your path|you.?re invited/i;
const OPEN_DRAFT = /jump into an official|reserve your draft|lock in prize eligibility/i;

function src(rel: string): string {
  return readFileSync(resolve(__dirname, rel), 'utf8');
}

function flattenFantasyCopy(): string {
  return [
    FANTASY.title,
    FANTASY.tagline,
    ...FANTASY.intro,
    ...FANTASY.perks.flatMap((p) => [p.title, p.body]),
    FANTASY.yahoo.intro,
    ...FANTASY.yahoo.steps,
    ...FANTASY.faqs.flatMap((f) => [f.question, f.answer]),
  ].join('\n');
}

describe('Fantasy football archive — drafts completed', () => {
  it('sets the archive flag so signup UI and the API stay closed', () => {
    expect(FANTASY_ARCHIVED).toBe(true);
  });

  it('uses past-tense archive copy instead of open-draft signup language', () => {
    const blob = flattenFantasyCopy();
    expect(blob).toMatch(/drafts? (are |were )?completed|season is underway/i);
    expect(blob).not.toMatch(JOIN_CTA);
    expect(blob).not.toMatch(OPEN_DRAFT);
    expect(blob).not.toMatch(/Labor Day weekend/i);
    expect(blob).not.toMatch(/Sat(?:urday)? Sep 5 at 4pm/);
  });

  it('keeps /fantasy-football reachable as an archive page, not a live hub', () => {
    const page = src('../app/fantasy-football/page.tsx');
    expect(page).toMatch(/canonical: '\/fantasy-football'/);
    expect(page).toMatch(/FANTASY_ARCHIVED|FantasyPageView/);
    expect(page).not.toMatch(/getLeagueAvailability/);
    expect(page).not.toMatch(/Sign up now/);
    expect(page).toMatch(/dynamic = 'force-dynamic'|revalidate = 86400/);
    expect(page).toMatch(/revalidate = 86400/);
  });

  it('FantasyPageView has no signup forms, spot counts, or join CTAs', () => {
    const view = src('../components/FantasyPageView.tsx');
    expect(view).not.toMatch(/JoinLeagueForm/);
    expect(view).not.toMatch(/RegisterLeagueForm/);
    expect(view).not.toMatch(/spotsOpen/);
    expect(view).not.toMatch(/Sign up/);
    expect(view).not.toMatch(/#signup/);
    expect(view).toMatch(/FANTASY_ARCHIVED|drafts? (are )?completed|season is underway/i);
  });

  it('rejects new signups at the API while the season is archived', () => {
    const route = src('../app/api/fantasy/signup/route.ts');
    expect(route).toMatch(/FANTASY_ARCHIVED/);
    expect(route).toMatch(/410|archived/);
  });
});

describe('Fantasy football archive — no open-draft entry points', () => {
  it('removes the fantasy-football promo from the scoreboard page', () => {
    const scoreboard = src('../app/events/EventsPageClient.tsx');
    expect(scoreboard).not.toMatch(/fantasy-football/);
    expect(scoreboard).not.toMatch(/Fantasy Football/);
    expect(scoreboard).toMatch(/Scoreboard/);
  });

  it('does not push join-a-draft CTAs from home, header, or footer nav', () => {
    const surfaces = [
      src('../app/HomePageClient.tsx'),
      src('../components/TopNav.tsx'),
      src('../components/BottomNav.tsx'),
      src('../components/AboutFaqSection.tsx'),
    ].join('\n');
    expect(surfaces).not.toMatch(/href=["']\/fantasy-football["']/);
    expect(surfaces).not.toMatch(/Join (a )?draft|Sign up.*fantasy|Fantasy Football/i);
  });

  it('describes /fantasy-football in llms.txt as a completed season, not an open join', () => {
    const llms = src('../app/llms.txt/route.ts');
    expect(llms).toMatch(/\/fantasy-football/);
    expect(llms).toMatch(/drafts completed|season underway|archived/i);
    expect(llms).not.toMatch(/Fantasy Football League \(join, draft at the bar/);
  });
});
