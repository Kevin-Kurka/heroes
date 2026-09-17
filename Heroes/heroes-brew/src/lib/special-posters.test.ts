/**
 * FILE: special-posters.test.ts
 * PURPOSE: Guard Mon–Fri Google special stills against /api/og/special regression.
 *
 * OVERVIEW:
 * Daily-special Google Events must use allowlisted brand-kit /promos/ JPGs.
 * IG Story scratcher/slot MP4 rotation stays in the Apps Script seeder.
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
  burgers: '/promos/special-burgers-beer-thursday.jpg',
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

  it('keeps the IG Story scratcher/slot MP4 rotation unchanged', () => {
    expect(gs).toMatch(/function specialMedia_\(key, date\) \{\s*return key \+ '-' \+ \(\(weekNum_\(date\) % 2\) \? 'slot' : 'scratcher'\) \+ '\.mp4';\s*\}/);
    expect(gs).toMatch(/a\[c\.media\] = specialMedia_\(sp\.key, date\)/);
    expect(gs).toMatch(/a\[c\.media\] = specialPoster_\(sp\)/);
  });
});
