/**
 * FILE: week8-posters.test.ts
 * PURPOSE: Guard Week 8 poster registry against missing assets or copy drift.
 *
 * OVERVIEW:
 * Confirms seven matchups, the local Chargers (Bolt Up) flag, PT kickoff strings,
 * real JPEG dimensions (feed 1080×1350, story 1080×1920), and that each
 * feed/story JPEG exists on disk as a real binary (not a placeholder).
 *
 * DEPENDENCIES:
 * - ./week8-posters.ts
 * - public/gameday/week8/*.jpg
 * - public/promos/week8-*.jpg
 *
 * EXPORTS:
 * - (none — Vitest suite)
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Asset + copy assertions for NFL Week 8 posters
 *
 * RELATED FILES:
 * - src/lib/week8-posters.ts
 *
 * LAST UPDATED: 2026-10-26
 * MAINTAINER: American Heroes & Brew
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { WEEK8_DISCLAIMER, WEEK8_POSTERS, getLocalWeek8Poster } from './week8-posters';

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

describe('WEEK8_POSTERS', () => {
  it('lists seven Week 8 matchups in kickoff order', () => {
    expect(WEEK8_POSTERS.map((p) => p.id)).toEqual([
      'panthers-at-packers',
      'ravens-at-bills',
      'vikings-at-lions',
      'chargers-at-rams',
      'chiefs-at-broncos',
      'eagles-at-commanders',
      'bears-at-seahawks',
    ]);
  });

  it('flags Chargers at Rams as the local watch party', () => {
    const local = getLocalWeek8Poster();
    expect(local?.id).toBe('chargers-at-rams');
    expect(local?.when).toMatch(/1:05 PM PT/);
    expect(local?.when).toMatch(/FOX/);
    expect(local?.eyebrow).toMatch(/Bolt Up/);
    expect(local?.eyebrow).toMatch(/Chargers/);
    expect(WEEK8_POSTERS.filter((p) => p.local)).toHaveLength(1);
  });

  it('uses Pacific kickoff copy and the fan-graphic disclaimer', () => {
    expect(WEEK8_DISCLAIMER).toMatch(/not an official NFL/i);
    for (const poster of WEEK8_POSTERS) {
      expect(poster.when).toMatch(/PT/);
      expect(poster.feedSrc).toMatch(/^\/gameday\/week8\/.+-feed-45\.jpg$/);
      expect(poster.storySrc).toMatch(/^\/gameday\/week8\/.+-story-916\.jpg$/);
    }
  });

  it('commits real JPEG binaries at the right feed (1080×1350) and story (1080×1920) sizes', () => {
    for (const poster of WEEK8_POSTERS) {
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
    for (const poster of WEEK8_POSTERS) {
      for (const kind of ['feed-45', 'story-916'] as const) {
        const promo = resolve(PUBLIC, `promos/week8-${poster.id}-${kind}.jpg`);
        const canonical = publicPath(kind === 'feed-45' ? poster.feedSrc : poster.storySrc);
        expect(existsSync(promo), `missing promo ${promo}`).toBe(true);
        expect(readFileSync(promo).equals(readFileSync(canonical))).toBe(true);
      }
    }
  });
});
