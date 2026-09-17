/**
 * FILE: special-posters.test.ts
 * PURPOSE: Guard Mon–Fri Google special stills against /api/og/special regression.
 *
 * OVERVIEW:
 * Daily-special Google + Feed/Story rows must use allowlisted food /promos/ JPGs.
 * Scratcher/slot MP4s and Lucky Stars are out of scope for the specials look.
 *
 * DEPENDENCIES:
 * - ./special-posters.ts
 * - scripts/sheet-auto-publisher.gs
 * - public/promos/*-feed.jpg
 *
 * LAST UPDATED: 2026-09-17
 * MAINTAINER: American Heroes & Brew
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SPECIAL_GOOGLE_POSTERS, specialGooglePoster } from './special-posters';

const ROOT = resolve(__dirname, '../..');
const PUBLIC = resolve(ROOT, 'public');
const GS = resolve(ROOT, 'scripts/sheet-auto-publisher.gs');

const EXPECTED: Record<string, string> = {
  mahalo: '/promos/kalua-sliders-feed.jpg',
  taco: '/promos/special-taco-tuesday.jpg',
  wings: '/promos/special-wings-wednesday.jpg',
  burgers: '/promos/burgers-beer-thursday-gbp.jpg',
  funday: '/promos/funday-feed.jpg',
};

describe('SPECIAL_GOOGLE_POSTERS', () => {
  it('maps every Mon–Fri special key to a /promos/ still — never /api/og/special', () => {
    expect(Object.keys(SPECIAL_GOOGLE_POSTERS).sort()).toEqual(Object.keys(EXPECTED).sort());
    for (const [key, src] of Object.entries(EXPECTED)) {
      expect(specialGooglePoster(key)).toBe(src);
      expect(src.startsWith('/promos/')).toBe(true);
      expect(src).not.toMatch(/\/api\/og\/special/);
    }
  });

  it('points at JPEG files that exist under public/promos/', () => {
    for (const src of Object.values(EXPECTED)) {
      expect(existsSync(resolve(PUBLIC, src.replace(/^\//, ''))), src).toBe(true);
    }
  });
});

describe('sheet-auto-publisher.gs specials seeding contract', () => {
  const gs = readFileSync(GS, 'utf8');

  it('specialPoster_() uses the same allowlisted /promos/ paths', () => {
    expect(gs).not.toMatch(/function specialPoster_\([^)]*\)[^{]*\{[^}]*\/api\/og\/special/);
    expect(gs).toContain("function specialPoster_");
    for (const [key, src] of Object.entries(EXPECTED)) {
      expect(gs, key).toContain(src);
      const mapped = gs.match(new RegExp(`${key}\\s*:\\s*'${src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`));
      expect(mapped, `${key} → ${src} in SPECIAL_GOOGLE_POSTERS`).toBeTruthy();
    }
  });

  it('seeds Feed/Story with food stills — not scratcher/slot MP4s or /api/og/special', () => {
    expect(gs).not.toMatch(/return key \+ '-' \+ \(\(weekNum_\(date\) % 2\) \? 'slot' : 'scratcher'\) \+ '\.mp4'/);
    expect(gs).toMatch(/function specialMedia_\(/);
    expect(gs).toMatch(/var still = specialMedia_\(sp\.key\)/);
    expect(gs).toMatch(/a\[c\.media\] = still/);
    expect(gs).toMatch(/a\[c\.media\] = specialPoster_\(sp\)/);
    expect(gs).toMatch(/a\[c\.channel\] = 'Feed, Story'/);
    expect(gs).not.toMatch(/lucky-stars|scratch-style-frame|slot-style-frame/i);
  });
});
