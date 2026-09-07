/**
 * FILE: week1-posters.test.ts
 * PURPOSE: Guard Week 1 poster registry against missing assets or copy drift.
 *
 * OVERVIEW:
 * Confirms five matchups, the local Chargers flag, PT kickoff strings, and
 * that each feed/story JPEG exists on disk as a real binary (not a placeholder).
 *
 * DEPENDENCIES:
 * - ./week1-posters.ts
 * - public/gameday/week1/*.jpg
 *
 * EXPORTS:
 * - (none — Vitest suite)
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Asset + copy assertions for NFL Week 1 posters
 *
 * RELATED FILES:
 * - src/lib/week1-posters.ts
 *
 * LAST UPDATED: 2026-09-07
 * MAINTAINER: American Heroes & Brew
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { WEEK1_DISCLAIMER, WEEK1_POSTERS, getLocalWeek1Poster } from './week1-posters';

const PUBLIC = resolve(__dirname, '../../public');

function publicPath(src: string): string {
  return resolve(PUBLIC, src.replace(/^\//, ''));
}

describe('WEEK1_POSTERS', () => {
  it('lists five Week 1 matchups in kickoff order', () => {
    expect(WEEK1_POSTERS.map((p) => p.id)).toEqual([
      'patriots-at-seahawks',
      '49ers-at-rams',
      'cardinals-at-chargers',
      'cowboys-at-giants',
      'broncos-at-chiefs',
    ]);
  });

  it('flags Cardinals at Chargers as the local watch party', () => {
    const local = getLocalWeek1Poster();
    expect(local?.id).toBe('cardinals-at-chargers');
    expect(local?.when).toMatch(/1:25 PM PT/);
    expect(local?.when).toMatch(/CBS/);
    expect(WEEK1_POSTERS.filter((p) => p.local)).toHaveLength(1);
  });

  it('uses Pacific kickoff copy and the fan-graphic disclaimer', () => {
    expect(WEEK1_DISCLAIMER).toMatch(/not an official NFL/i);
    for (const poster of WEEK1_POSTERS) {
      expect(poster.when).toMatch(/PT/);
      expect(poster.feedSrc).toMatch(/-feed-45\.jpg$/);
      expect(poster.storySrc).toMatch(/-story-916\.jpg$/);
    }
  });

  it('commits real JPEG binaries for every feed and story crop', () => {
    for (const poster of WEEK1_POSTERS) {
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
});
