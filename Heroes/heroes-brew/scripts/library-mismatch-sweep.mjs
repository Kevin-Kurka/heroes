/**
 * Full-library photo mismatch sweep. Detects the systemic problems in the menu
 * image library via perceptual aHash (no manual eyeballing of hundreds of files):
 *   (1) DECOR/MURAL reused as a dish (matches the known "HERO UP" mural),
 *   (2) CROSS-ITEM DUPLICATES — the same photo used for two different dishes,
 *   (3) lists every distinct base image per item so primaries can be spot-checked.
 *
 * Scope: top-level base photos in each menu item folder (-pro.jpg + -N originals);
 * skips /library/ crop+grade variants (they inherit from their base) and -cutout.
 *
 * Usage: node scripts/library-mismatch-sweep.mjs
 */
import sharp from 'sharp';
import { readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const MENU = '/Users/kmk/Heroes/heroes-brew/public/promos-video/menu';
const IMG = /\.(jpe?g|webp|png)$/i;

async function aHash(file) {
  const buf = await sharp(file).greyscale().resize(8, 8, { fit: 'fill' }).raw().toBuffer();
  const mean = buf.reduce((a, b) => a + b, 0) / buf.length;
  let h = 0n;
  for (let i = 0; i < 64; i++) h = (h << 1n) | (buf[i] > mean ? 1n : 0n);
  return h;
}
const hamming = (a, b) => { let x = a ^ b, c = 0; while (x) { c += Number(x & 1n); x >>= 1n; } return c; };

// Collect base images (top-level of each item folder; skip library/ and cutouts).
const all = [];
for (const item of readdirSync(MENU, { withFileTypes: true })) {
  if (!item.isDirectory() || item.name === '_source') continue;
  const dir = join(MENU, item.name);
  for (const f of readdirSync(dir)) {
    if (!IMG.test(f) || /-cutout\./i.test(f)) continue;
    const file = join(dir, f);
    all.push({ item: item.name, name: f, file, hash: await aHash(file) });
  }
}
console.log(`Scanned ${all.length} base images across menu items.\n`);

// Known decor reference: the HERO UP mural (mislabeled as the burrito -pro).
const muralRef = all.find((x) => x.name === 'san-diego-california-burrito-pro.jpg');
if (muralRef) {
  console.log('=== (1) DECOR/MURAL reused as a dish (matches HERO UP mural) ===');
  const hits = all.filter((x) => x.item !== '_nonfood' && hamming(x.hash, muralRef.hash) < 8);
  for (const h of hits) console.log(`  ⚠️ ${h.item}/${h.name}`);
  if (!hits.length) console.log('  (none)');
  console.log('');
}

// Cross-item duplicates: same image used under two different item names.
console.log('=== (2) CROSS-ITEM DUPLICATES (same photo, different dishes) ===');
const seen = new Set();
let dupFound = false;
for (let i = 0; i < all.length; i++) {
  if (seen.has(i)) continue;
  const group = [i];
  for (let j = i + 1; j < all.length; j++) {
    if (!seen.has(j) && hamming(all[i].hash, all[j].hash) < 8) group.push(j);
  }
  const items = new Set(group.map((k) => all[k].item));
  if (group.length > 1 && items.size > 1) {
    dupFound = true;
    console.log('  ⚠️ duplicate group across items:');
    for (const k of group) { seen.add(k); console.log(`       ${all[k].item}/${all[k].name}`); }
  }
}
if (!dupFound) console.log('  (none)');
console.log('');

// Full inventory of distinct base images per item (for spot-check).
console.log('=== (3) DISTINCT base images per item ===');
const byItem = {};
for (const x of all) (byItem[x.item] ||= []).push(x.name);
for (const item of Object.keys(byItem).sort()) {
  console.log(`  ${item}: ${byItem[item].join(', ')}`);
}
