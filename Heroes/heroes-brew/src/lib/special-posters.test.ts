/**
 * FILE: special-posters.test.ts
 * PURPOSE: Guard daily-lineup food stills against OG/scratcher regressions.
 *
 * OVERVIEW:
 * Google uses *-gbp.jpg; Feed/Story use *-feed.jpg / *-story.jpg.
 * JPG bytes are Kevin-approved v5-refgen plates (white logo, likeness-ref).
 * Scratcher/slot MP4s and Lucky Stars must not be seeded.
 *
 * LAST UPDATED: 2026-09-17
 * MAINTAINER: American Heroes & Brew
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  SPECIAL_GOOGLE_POSTERS,
  SPECIAL_LINEUP,
  specialFeedPoster,
  specialGooglePoster,
  specialStoryPoster,
} from './special-posters';

const ROOT = resolve(__dirname, '../..');
const PUBLIC = resolve(ROOT, 'public');
const GS = resolve(ROOT, 'scripts/sheet-auto-publisher.gs');

const EXPECTED_GBP: Record<string, string> = {
  mahalo: '/promos/daily-lineup/mahalo-monday-gbp.jpg',
  taco: '/promos/daily-lineup/taco-tuesday-gbp.jpg',
  wings: '/promos/daily-lineup/wings-wednesday-gbp.jpg',
  burgers: '/promos/daily-lineup/burgers-beer-thursday-gbp.jpg',
  funday: '/promos/daily-lineup/friday-funday-gbp.jpg',
};

describe('SPECIAL_LINEUP', () => {
  it('maps every Mon–Fri key to gbp/feed/story /promos/daily-lineup/ stills', () => {
    expect(Object.keys(SPECIAL_LINEUP).sort()).toEqual(Object.keys(EXPECTED_GBP).sort());
    for (const [key, gbp] of Object.entries(EXPECTED_GBP)) {
      expect(specialGooglePoster(key)).toBe(gbp);
      expect(SPECIAL_GOOGLE_POSTERS[key as keyof typeof SPECIAL_GOOGLE_POSTERS]).toBe(gbp);
      expect(specialFeedPoster(key)).toBe(SPECIAL_LINEUP[key as keyof typeof SPECIAL_LINEUP].feed);
      expect(specialStoryPoster(key)).toBe(SPECIAL_LINEUP[key as keyof typeof SPECIAL_LINEUP].story);
      expect(gbp).toMatch(/\/promos\/daily-lineup\/.+-gbp\.jpg$/);
      expect(specialFeedPoster(key)).toMatch(/\/promos\/daily-lineup\/.+-feed\.jpg$/);
      expect(specialStoryPoster(key)).toMatch(/\/promos\/daily-lineup\/.+-story\.jpg$/);
      expect(gbp).not.toMatch(/\/api\/og\/special/);
    }
  });

  it('commits all 15 lineup JPEGs (5 days × gbp/feed/story)', () => {
    for (const row of Object.values(SPECIAL_LINEUP)) {
      for (const src of [row.gbp, row.feed, row.story]) {
        expect(existsSync(resolve(PUBLIC, src.replace(/^\//, ''))), src).toBe(true);
      }
    }
  });
});

describe('sheet-auto-publisher.gs specials seeding contract', () => {
  const gs = readFileSync(GS, 'utf8');

  it('specialPoster_() uses the daily-lineup GBP paths', () => {
    expect(gs).not.toMatch(/function specialPoster_\([^)]*\)[^{]*\{[^}]*\/api\/og\/special/);
    for (const [key, src] of Object.entries(EXPECTED_GBP)) {
      expect(gs, key).toContain(src);
      expect(gs.match(new RegExp(`${key}\\s*:\\s*'${src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`))).toBeTruthy();
    }
  });

  it('seeds Feed and Story as food stills — not scratcher/slot MP4s', () => {
    expect(gs).not.toMatch(/return key \+ '-' \+ \(\(weekNum_\(date\) % 2\) \? 'slot' : 'scratcher'\) \+ '\.mp4'/);
    expect(gs).toMatch(/a\[c\.channel\] = 'Feed'/);
    expect(gs).toMatch(/a\[c\.channel\] = 'Story'/);
    expect(gs).toMatch(/a\[c\.channel\] = 'Google'/);
    expect(gs).toMatch(/specialFeed_\(|SPECIAL_FEED_POSTERS/);
    expect(gs).toMatch(/specialStory_\(|SPECIAL_STORY_POSTERS/);
    expect(gs).not.toMatch(/lucky-stars|scratch-style-frame|slot-style-frame/i);
  });
});
