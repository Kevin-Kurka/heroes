/**
 * FILE: week7-posters.test.ts
 * PURPOSE: Guard Week 7 poster registry against missing assets or copy drift.
 *
 * OVERVIEW:
 * Confirms six matchups, the local Rams (LA-area) flag, PT kickoff strings,
 * real JPEG dimensions (feed 1080×1350, story 1080×1920), and that each
 * feed/story JPEG exists on disk as a real binary (not a placeholder).
 *
 * DEPENDENCIES:
 * - ./week7-posters.ts
 * - public/gameday/week7/*.jpg
 * - public/promos/week7-*.jpg
 *
 * EXPORTS:
 * - (none — Vitest suite)
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Asset + copy assertions for NFL Week 7 posters
 *
 * RELATED FILES:
 * - src/lib/week7-posters.ts
 *
 * LAST UPDATED: 2026-10-19
 * MAINTAINER: American Heroes & Brew
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { WEEK7_DISCLAIMER, WEEK7_POSTERS, getLocalWeek7Poster } from './week7-posters';

const PUBLIC = resolve(__dirname, '../../public');

function publicPath(src: string): string {
  return resolve(PUBLIC, src.replace(/^\//, ''));
}

/** Read SOF width/height from a JPEG buffer (no extra image libs). */
function jpegDimensions(bytes: Buffer): { width: number; height: number } {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw new Error('not a JPEG');
  }
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    if (marker === 0x00 || marker === 0xff) {
      offset += 1;
      continue;
    }
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      offset += 2;
      continue;
    }
    const size = bytes.readUInt16BE(offset + 2);
    const isSof =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);
    if (isSof) {
      return {
        height: bytes.readUInt16BE(offset + 5),
        width: bytes.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + size;
  }
  throw new Error('JPEG SOF not found');
}

describe('WEEK7_POSTERS', () => {
  it('lists six Week 7 matchups in kickoff order', () => {
    expect(WEEK7_POSTERS.map((p) => p.id)).toEqual([
      'patriots-at-bears',
      '49ers-at-falcons',
      'rams-at-raiders',
      'packers-at-lions',
      'chiefs-at-seahawks',
      'cowboys-at-eagles',
    ]);
  });

  it('flags Rams at Raiders as the local LA-area watch party', () => {
    const local = getLocalWeek7Poster();
    expect(local?.id).toBe('rams-at-raiders');
    expect(local?.when).toMatch(/1:25 PM PT/);
    expect(local?.when).toMatch(/FOX/);
    expect(WEEK7_POSTERS.filter((p) => p.local)).toHaveLength(1);
  });

  it('does not use Chargers or Bolt Up copy on any Week 7 poster', () => {
    for (const poster of WEEK7_POSTERS) {
      const blob = `${poster.eyebrow} ${poster.note} ${poster.away} ${poster.home} ${poster.when}`;
      expect(blob).not.toMatch(/chargers/i);
      expect(blob).not.toMatch(/bolt up/i);
    }
  });

  it('uses Pacific kickoff copy and the fan-graphic disclaimer', () => {
    expect(WEEK7_DISCLAIMER).toMatch(/not an official NFL/i);
    for (const poster of WEEK7_POSTERS) {
      expect(poster.when).toMatch(/PT/);
      expect(poster.feedSrc).toMatch(/^\/gameday\/week7\/.+-feed-45\.jpg$/);
      expect(poster.storySrc).toMatch(/^\/gameday\/week7\/.+-story-916\.jpg$/);
    }
  });

  it('commits real JPEG binaries at the right feed (1080×1350) and story (1080×1920) sizes', () => {
    for (const poster of WEEK7_POSTERS) {
      for (const src of [poster.feedSrc, poster.storySrc]) {
        const file = publicPath(src);
        expect(existsSync(file), `missing ${src}`).toBe(true);
        const bytes = readFileSync(file);
        expect(bytes.length).toBeGreaterThan(50_000);
        expect(bytes[0]).toBe(0xff);
        expect(bytes[1]).toBe(0xd8);
        expect(bytes[2]).toBe(0xff);
        const { width, height } = jpegDimensions(bytes);
        if (src.endsWith('-feed-45.jpg')) {
          expect({ width, height }).toEqual({ width: 1080, height: 1350 });
        } else {
          expect({ width, height }).toEqual({ width: 1080, height: 1920 });
        }
      }
    }
  });

  it('mirrors identical feed and story crops into public/promos for the IG allowlist', () => {
    for (const poster of WEEK7_POSTERS) {
      for (const kind of ['feed-45', 'story-916'] as const) {
        const promo = resolve(PUBLIC, `promos/week7-${poster.id}-${kind}.jpg`);
        const canonical = publicPath(kind === 'feed-45' ? poster.feedSrc : poster.storySrc);
        expect(existsSync(promo), `missing promo ${promo}`).toBe(true);
        expect(readFileSync(promo).equals(readFileSync(canonical))).toBe(true);
      }
    }
  });
});
