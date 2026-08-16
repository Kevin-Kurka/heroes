/**
 * Find UNIQUE food/drink photos across the menu image library (deduping the
 * near-identical crop/filter variants via perceptual aHash), enhance them, embed
 * proper item metadata, and stage a clean batch for Google Business Profile.
 *
 * Skips items already uploaded (batch 1), the raw crop/grade variants in /library/,
 * cutouts, and non-food. One representative enhanced photo per unique dish/drink.
 *
 * Usage: node scripts/dedupe-enhance-photos.mjs
 * Requires: sharp, exiftool (via asset-metadata.mjs).
 */
import sharp from 'sharp';
import { readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { embedMetadata } from '/Users/kmk/Heroes/heroes-brew/scripts/lib/asset-metadata.mjs';

const MENU = '/Users/kmk/Heroes/heroes-brew/public/promos-video/menu';
const OUT = '/Users/kmk/Heroes/marketing-assets/gbp-photos-batch2';
mkdirSync(OUT, { recursive: true });

// Already uploaded in batch 1 — skip these items.
const UPLOADED = new Set([
  'philly-billy-cheesesteak', 'pasadena-og-cheeseburger', 'minneapolis-juicy-lucy',
  'wings', 'village-tacos', 'loaded-fries', 'nachos', 'mac-and-cheese',
]);

// Pretty display names (override the slug humanizer where needed).
const NAMES = {
  'carlsbad-blt-plus': 'Carlsbad BLT+', 'san-diego-california-burrito': 'San Diego California Burrito',
  'manhattan-reuben': 'Manhattan Reuben', 'hoboken-italian': 'Hoboken Italian Sub',
  'friar-frank': 'Friar Frank', 'maui-kalua-pork': 'Maui Kalua Pork',
  'sliders-kalua-pork': 'Kalua Pork Sliders', 'tombstone-cowboy': 'Tombstone Cowboy Burger',
  'house-salad': 'House Salad', 'key-lime-pie': 'Key Lime Pie', 'pretzel-bites': 'Pretzel Bites',
  'antipasto': 'Antipasto', 'beer': 'Craft Beer', 'cocktails': 'Cocktails',
  'margarita': 'Margarita', 'sangria': 'Sangria',
};
const nameFor = (slug) => NAMES[slug] || slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// ── perceptual average-hash (64-bit) for dedup ──
async function aHash(file) {
  const buf = await sharp(file).greyscale().resize(8, 8, { fit: 'fill' }).raw().toBuffer();
  const mean = buf.reduce((a, b) => a + b, 0) / buf.length;
  let h = 0n;
  for (let i = 0; i < 64; i++) h = (h << 1n) | (buf[i] > mean ? 1n : 0n);
  return h;
}
const hamming = (a, b) => { let x = a ^ b, c = 0; while (x) { c += Number(x & 1n); x >>= 1n; } return c; };

// ── collect ONE best candidate per non-uploaded item: prefer -pro.jpg, else -1 original ──
const items = readdirSync(MENU, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_') && !UPLOADED.has(d.name))
  .map((d) => d.name);

const candidates = [];
for (const slug of items) {
  const dir = join(MENU, slug);
  const pro = join(dir, `${slug}-pro.jpg`);
  let pick = existsSync(pro) ? pro : null;
  if (!pick) {
    for (const ext of ['jpeg', 'jpg', 'webp']) {
      const o = join(dir, `${slug}-1.${ext}`);
      if (existsSync(o)) { pick = o; break; }
    }
  }
  if (pick) candidates.push({ slug, file: pick, isPro: pick.endsWith('-pro.jpg') });
}

// ── dedup across candidates (hamming < 8 = near-duplicate) ──
const kept = [];
for (const c of candidates) {
  c.hash = await aHash(c.file);
  const dup = kept.find((k) => hamming(k.hash, c.hash) < 8);
  if (dup) { console.log(`dup-skip: ${c.slug} ~ ${dup.slug}`); continue; }
  kept.push(c);
}

// ── enhance (if not already a pro master) + stamp metadata + stage ──
let n = 0;
for (const c of kept) {
  const display = nameFor(c.slug);
  const outFile = join(OUT, `${String(++n).padStart(2, '0')}-${c.slug}.jpg`);
  if (c.isPro) {
    // already enhanced — just normalize size/quality into the batch
    await sharp(c.file).resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 90 }).toFile(outFile);
  } else {
    // enhance a raw original: tasteful saturation/brightness/contrast + sharpen
    await sharp(c.file).rotate()
      .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
      .modulate({ brightness: 1.04, saturation: 1.12 })
      .linear(1.08, -10).sharpen({ sigma: 0.8 })
      .jpeg({ quality: 90 }).toFile(outFile);
  }
  embedMetadata(outFile, {
    title: `${display} — American Heroes & Brew`,
    description: `${display} at American Heroes & Brew, the family-friendly sports bar and restaurant in Carlsbad Village.`,
    keywords: [display, 'Carlsbad menu', 'Carlsbad Village food'],
  });
  console.log(`staged: ${outFile}  (${c.isPro ? 'pro' : 'enhanced'})`);
}
console.log(`\nDone. ${kept.length} unique photos staged to ${OUT} (deduped from ${candidates.length} candidates).`);
