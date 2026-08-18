import { describe, it, expect } from 'vitest';
import { LANDING_PAGES } from './landing-pages';
import { FAQ } from './faq';
import { getAllWatchParties } from './watch-parties';
import { getKnowledge } from './ask';
import { FOOTBALL_SEASON, SEASONAL_NAV } from './seasonal';

const LIVE_TOURNAMENT = /\b(every match live|world cup hq|today at|kickoff is today|is live on)\b/i;
const TODAY_CLAIM = /\btoday at\b/i;

function flattenPage(slug: string): string {
  const page = LANDING_PAGES[slug];
  return [
    page.metaTitle,
    page.metaDescription,
    page.h1,
    page.tagline,
    ...page.intro,
    ...page.sections.flatMap((s) => [s.heading, ...(s.body ?? []), ...(s.bullets ?? [])]),
    ...page.faqs.flatMap((f) => [f.question, f.answer]),
  ].join('\n');
}

describe('World Cup archive — truthful past tense', () => {
  it('does not claim the 2026 tournament is still live or happening today', () => {
    const blob = flattenPage('world-cup');
    expect(blob).not.toMatch(LIVE_TOURNAMENT);
    expect(blob).not.toMatch(TODAY_CLAIM);
    expect(blob.toLowerCase()).toMatch(/hosted|showed|watched|ended/);
    expect(blob).toMatch(/NFL|football/i);
  });

  it('keeps /world-cup as an archive page rather than deleting the slug', () => {
    expect(LANDING_PAGES['world-cup']?.slug).toBe('world-cup');
  });
});

describe('Watch-party matchup pages — no stale "today"', () => {
  it('archives each World Cup matchup in the past tense', () => {
    const parties = getAllWatchParties();
    expect(parties.length).toBeGreaterThan(0);
    for (const party of parties) {
      const blob = [party.tagline, ...party.intro, ...party.faqs.flatMap((f) => [f.question, f.answer])].join('\n');
      expect(blob, party.slug).not.toMatch(TODAY_CLAIM);
      expect(blob, party.slug).not.toMatch(/\btoday\b/i);
      expect(blob, party.slug).toMatch(/hosted|watched|on june|june \d/i);
    }
  });
});

describe('Seasonal surfaces lead football, not World Cup', () => {
  it('exposes a Game Day nav item pointing at /watch', () => {
    expect(SEASONAL_NAV.label).toMatch(/game day/i);
    expect(SEASONAL_NAV.href).toBe('/watch');
  });

  it('leads homepage seasonal copy with NFL game day', () => {
    expect(FOOTBALL_SEASON.homeHeadline).toMatch(/NFL|football/i);
    expect(FOOTBALL_SEASON.homeHeadline + FOOTBALL_SEASON.homeBody).not.toMatch(/world cup/i);
  });

  it('answers the soccer FAQ as a past World Cup, with football as the current lead', () => {
    const soccer = FAQ.find((f) => /world cup/i.test(f.question));
    expect(soccer).toBeDefined();
    expect(soccer!.answer).not.toMatch(/every 2026 FIFA World Cup match/i);
    expect(soccer!.answer).toMatch(/hosted|showed|watched/i);
    expect(soccer!.answer).toMatch(/NFL|football/i);
  });

  it('does not retrieve a live-tournament World Cup claim', () => {
    const live = getKnowledge().filter((e) => LIVE_TOURNAMENT.test(`${e.question} ${e.answer}`));
    expect(live).toEqual([]);
  });
});
