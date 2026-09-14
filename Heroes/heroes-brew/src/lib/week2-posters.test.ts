/**
 * FILE: week2-posters.test.ts
 * PURPOSE: Guard Week 2 poster registry against missing assets or copy drift.
 *
 * OVERVIEW:
 * Confirms five matchups, the local Chargers flag, PT kickoff strings, and
 * that each feed/story JPEG exists on disk as a real binary (not a placeholder).
 *
 * DEPENDENCIES:
 * - ./week2-posters.ts
 * - public/gameday/week2/*.jpg
 *
 * EXPORTS:
 * - (none — Vitest suite)
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Asset + copy assertions for NFL Week 2 posters
 *
 * RELATED FILES:
 * - src/lib/week2-posters.ts
 *
 * LAST UPDATED: 2026-09-14
 * MAINTAINER: American Heroes & Brew
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { WEEK2_DISCLAIMER, WEEK2_POSTERS, getLocalWeek2Poster } from './week2-posters';

const PUBLIC = resolve(__dirname, '../../public');

function publicPath(src: string): string {
  return resolve(PUBLIC, src.replace(/^\//, ''));
}

describe('WEEK2_POSTERS', () => {
  it('lists five Week 2 matchups in kickoff order', () => {
    expect(WEEK2_POSTERS.map((p) => p.id)).toEqual([
      'lions-at-bills',
      'raiders-at-chargers',
      'commanders-at-cowboys',
      'colts-at-chiefs',
      'giants-at-rams',
    ]);
  });

  it('flags Raiders at Chargers as the local watch party', () => {
    const local = getLocalWeek2Poster();
    expect(local?.id).toBe('raiders-at-chargers');
    expect(local?.when).toMatch(/1:05 PM PT/);
    expect(local?.when).toMatch(/CBS/);
    expect(WEEK2_POSTERS.filter((p) => p.local)).toHaveLength(1);
  });

  it('uses Pacific kickoff copy and the fan-graphic disclaimer', () => {
    expect(WEEK2_DISCLAIMER).toMatch(/not an official NFL/i);
    for (const poster of WEEK2_POSTERS) {
      expect(poster.when).toMatch(/PT/);
      expect(poster.feedSrc).toMatch(/-feed-45\.jpg$/);
      expect(poster.storySrc).toMatch(/-story-916\.jpg$/);
    }
  });

  it('commits real JPEG binaries for every feed and story crop', () => {
    for (const poster of WEEK2_POSTERS) {
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
    for (const poster of WEEK2_POSTERS) {
      for (const kind of ['feed-45', 'story-916'] as const) {
        const promo = resolve(PUBLIC, `promos/week2-${poster.id}-${kind}.jpg`);
        expect(existsSync(promo), `missing promo ${promo}`).toBe(true);
        const bytes = readFileSync(promo);
        expect(bytes.length).toBeGreaterThan(50_000);
        expect(bytes[0]).toBe(0xff);
        expect(bytes[1]).toBe(0xd8);
      }
    }
  });
});
