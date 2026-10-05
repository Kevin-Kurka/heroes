/**
 * FILE: week5-posters.test.ts
 * PURPOSE: Guard Week 5 poster registry against missing assets or copy drift.
 *
 * OVERVIEW:
 * Confirms six matchups, the local Chargers flag, PT kickoff strings, and
 * that each feed/story JPEG exists on disk as a real binary (not a placeholder).
 *
 * DEPENDENCIES:
 * - ./week5-posters.ts
 * - public/gameday/week5/*.jpg
 * - public/promos/week5-*.jpg
 *
 * EXPORTS:
 * - (none — Vitest suite)
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Asset + copy assertions for NFL Week 5 posters
 *
 * RELATED FILES:
 * - src/lib/week5-posters.ts
 *
 * LAST UPDATED: 2026-10-05
 * MAINTAINER: American Heroes & Brew
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { WEEK5_DISCLAIMER, WEEK5_POSTERS, getLocalWeek5Poster } from './week5-posters';

const PUBLIC = resolve(__dirname, '../../public');

function publicPath(src: string): string {
  return resolve(PUBLIC, src.replace(/^\//, ''));
}

describe('WEEK5_POSTERS', () => {
  it('lists six Week 5 matchups in kickoff order', () => {
    expect(WEEK5_POSTERS.map((p) => p.id)).toEqual([
      'buccaneers-at-cowboys',
      'broncos-at-chargers',
      '49ers-at-seahawks',
      'bears-at-packers',
      'ravens-at-falcons',
      'bills-at-rams',
    ]);
  });

  it('flags Broncos at Chargers as the local watch party', () => {
    const local = getLocalWeek5Poster();
    expect(local?.id).toBe('broncos-at-chargers');
    expect(local?.when).toMatch(/1:05 PM PT/);
    expect(local?.when).toMatch(/CBS/);
    expect(WEEK5_POSTERS.filter((p) => p.local)).toHaveLength(1);
  });

  it('uses Pacific kickoff copy and the fan-graphic disclaimer', () => {
    expect(WEEK5_DISCLAIMER).toMatch(/not an official NFL/i);
    for (const poster of WEEK5_POSTERS) {
      expect(poster.when).toMatch(/PT/);
      expect(poster.feedSrc).toMatch(/^\/gameday\/week5\/.+-feed-45\.jpg$/);
      expect(poster.storySrc).toMatch(/^\/gameday\/week5\/.+-story-916\.jpg$/);
    }
  });

  it('commits real JPEG binaries for every feed and story crop', () => {
    for (const poster of WEEK5_POSTERS) {
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

  it('mirrors identical feed and story crops into public/promos for the IG allowlist', () => {
    for (const poster of WEEK5_POSTERS) {
      for (const kind of ['feed-45', 'story-916'] as const) {
        const promo = resolve(PUBLIC, `promos/week5-${poster.id}-${kind}.jpg`);
        const canonical = publicPath(kind === 'feed-45' ? poster.feedSrc : poster.storySrc);
        expect(existsSync(promo), `missing promo ${promo}`).toBe(true);
        expect(readFileSync(promo).equals(readFileSync(canonical))).toBe(true);
      }
    }
  });
});
