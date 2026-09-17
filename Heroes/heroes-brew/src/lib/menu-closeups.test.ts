/**
 * FILE: menu-closeups.test.ts
 * PURPOSE: Guard the Phase 1 menu-closeup library against missing crops.
 *
 * OVERVIEW:
 * Asserts all 31 v5-refgen slugs ship hero-1200.jpg + feed-45.jpg under
 * public/promos/menu-closeups/{slug}/ so IG/GBP can publish from the allowlist.
 *
 * DEPENDENCIES:
 * - public/promos/menu-closeups/{slug}/hero-1200.jpg
 * - public/promos/menu-closeups/{slug}/feed-45.jpg
 *
 * EXPORTS:
 * - (none — Vitest suite)
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Asset existence + JPEG magic for 31 Phase 1 slugs
 *
 * RELATED FILES:
 * - public/promos/menu-closeups/README.md
 *
 * LAST UPDATED: 2026-09-17
 * MAINTAINER: American Heroes & Brew
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const PUBLIC = resolve(__dirname, '../../public');
const DIR = resolve(PUBLIC, 'promos/menu-closeups');

const MENU_CLOSEUP_SLUGS = [
  'antipasto',
  'beer',
  'calamari',
  'carlsbad-blt-plus',
  'cobb',
  'cocktails',
  'corn-dogs',
  'friar-frank',
  'fried-pickles',
  'hoboken-italian',
  'house-salad',
  'hummus-plate',
  'jalapeno-poppers',
  'key-lime-pie',
  'loaded-fries',
  'los-angeles-french-dip',
  'mac-and-cheese',
  'manhattan-reuben',
  'maui-kalua-pork',
  'minneapolis-juicy-lucy',
  'mozzarella-sticks',
  'nachos',
  'pasadena-og-cheeseburger',
  'philly-billy-cheesesteak',
  'pretzel-bites',
  'san-diego-california-burrito',
  'sangria',
  'sliders-kalua-pork',
  'tombstone-cowboy',
  'village-tacos',
  'wings',
] as const;

describe('menu closeup library', () => {
  it('lists 31 Phase 1 slugs', () => {
    expect(MENU_CLOSEUP_SLUGS).toHaveLength(31);
  });

  it('commits real JPEG binaries for hero-1200 and feed-45', () => {
    for (const slug of MENU_CLOSEUP_SLUGS) {
      for (const name of ['hero-1200.jpg', 'feed-45.jpg'] as const) {
        const file = resolve(DIR, slug, name);
        expect(existsSync(file), `missing ${slug}/${name}`).toBe(true);
        const bytes = readFileSync(file);
        expect(bytes.length, `${slug}/${name} too small`).toBeGreaterThan(50_000);
        expect(bytes[0]).toBe(0xff);
        expect(bytes[1]).toBe(0xd8);
        expect(bytes[2]).toBe(0xff);
      }
    }
  });
});
