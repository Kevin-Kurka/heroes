/**
 * FILE: week3-posters.test.ts
 * PURPOSE: Guard Week 3 poster registry against missing assets or copy drift.
 *
 * OVERVIEW:
 * Confirms five matchups, the local Chargers flag, PT kickoff strings, and
 * that each feed/story JPEG exists on disk as a real binary (not a placeholder).
 *
 * DEPENDENCIES:
 * - ./week3-posters.ts
 * - public/gameday/week3/*.jpg
 * - public/promos/week3-*.jpg
 *
 * EXPORTS:
 * - (none — Vitest suite)
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Asset + copy assertions for NFL Week 3 posters
 *
 * RELATED FILES:
 * - src/lib/week3-posters.ts
 *
 * LAST UPDATED: 2026-09-21
 * MAINTAINER: American Heroes & Brew
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { WEEK3_DISCLAIMER, WEEK3_POSTERS, getLocalWeek3Poster } from './week3-posters';

const PUBLIC = resolve(__dirname, '../../public');

function publicPath(src: string): string {
  return resolve(PUBLIC, src.replace(/^\//, ''));
}

describe('WEEK3_POSTERS', () => {
  it('lists five Week 3 matchups in kickoff order', () => {
    expect(WEEK3_POSTERS.map((p) => p.id)).toEqual([
      'falcons-at-packers',
      'chargers-at-bills',
      'ravens-at-cowboys',
      'rams-at-broncos',
      'eagles-at-bears',
    ]);
  });

  it('flags Chargers at Bills as the local watch party', () => {
    const local = getLocalWeek3Poster();
    expect(local?.id).toBe('chargers-at-bills');
    expect(local?.when).toMatch(/10:00 AM PT/);
    expect(local?.when).toMatch(/FOX/);
    expect(WEEK3_POSTERS.filter((p) => p.local)).toHaveLength(1);
  });

  it('uses Pacific kickoff copy and the fan-graphic disclaimer', () => {
    expect(WEEK3_DISCLAIMER).toMatch(/not an official NFL/i);
    for (const poster of WEEK3_POSTERS) {
      expect(poster.when).toMatch(/PT/);
      expect(poster.feedSrc).toMatch(/-feed-45\.jpg$/);
      expect(poster.storySrc).toMatch(/-story-916\.jpg$/);
    }
  });

  it('commits real JPEG binaries for every feed and story crop', () => {
    for (const poster of WEEK3_POSTERS) {
      for (const src of [poster.feedSrc, poster.storySrc]) {
        const file = publicPath(src);
        expect(existsSync(file), `missing ${src}`).toBe(true);
        const bytes = readFileSync(file);
        expect(bytes.length).toBeGreaterThan(50_000);
        expect(bytes[0]).toBe(0xff);
        expect(bytes[1]).toBe(0xd8);
        expect(bytes[2]).toBe(0xff);
      }
    }
  });

  it('mirrors feed and story crops into public/promos for the IG allowlist', () => {
    for (const poster of WEEK3_POSTERS) {
      for (const kind of ['feed-45', 'story-916'] as const) {
        const promo = resolve(PUBLIC, `promos/week3-${poster.id}-${kind}.jpg`);
        expect(existsSync(promo), `missing promo ${promo}`).toBe(true);
        const bytes = readFileSync(promo);
        expect(bytes.length).toBeGreaterThan(50_000);
        expect(bytes[0]).toBe(0xff);
        expect(bytes[1]).toBe(0xd8);
      }
    }
  });

  it('keeps official week3-prefixed copies under public/gameday/week3/', () => {
    for (const poster of WEEK3_POSTERS) {
      for (const kind of ['feed-45', 'story-916'] as const) {
        const official = resolve(PUBLIC, `gameday/week3/week3-${poster.id}-${kind}.jpg`);
        const canonical = publicPath(kind === 'feed-45' ? poster.feedSrc : poster.storySrc);
        expect(existsSync(official), `missing official ${official}`).toBe(true);
        expect(readFileSync(official).equals(readFileSync(canonical))).toBe(true);
      }
    }
  });
});
