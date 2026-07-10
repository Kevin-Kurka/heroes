import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { selectBestPerSlug } from './lib/curate.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const OUT = join(ROOT, 'public/images/polished');
const data = JSON.parse(readFileSync(join(ROOT, 'classified-photos.json'), 'utf8'));
const rows = data.classified || [];
const menuItems = data.menuItems || {};

mkdirSync(OUT, { recursive: true });

/** Consistent, subtle "pro" polish — auto-orient, cap size, gentle level + saturation,
 *  light sharpen, high-quality mozjpeg. Conservative so photos look professional
 *  without over-processing. */
async function enhance(srcPath, destPath) {
  await sharp(srcPath)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .modulate({ brightness: 1.03, saturation: 1.08 })
    .sharpen({ sigma: 0.8 })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(destPath);
}

const chosen = selectBestPerSlug(rows);
const manifest = [];
let ok = 0; const missing = [];
for (const r of chosen) {
  if (!existsSync(r.path)) { missing.push(`${r.slug} (source missing: ${r.filename})`); continue; }
  const file = `${r.slug}.jpg`;
  try {
    await enhance(r.path, join(OUT, file));
  } catch (e) { missing.push(`${r.slug} (enhance failed: ${e.message})`); continue; }
  const meta = r.itemInfo || menuItems[r.slug] || {};
  manifest.push({ slug: r.slug, file: `images/polished/${file}`, category: meta.category || 'Uncategorized',
    display: meta.display || r.slug, source: r.filename, quality: r.quality ?? 0, note: r.note || '' });
  ok++;
  console.log(`  ${file}  (q${r.quality ?? 0}, from ${r.filename})`);
}
manifest.sort((a, b) => a.slug.localeCompare(b.slug));
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));

const have = new Set(manifest.map(m => m.slug));
const gaps = Object.keys(menuItems).filter(s => !have.has(s));
console.log(`\npolished ${ok} images -> public/images/polished/`);
if (missing.length) console.log(`skipped:\n  ${missing.join('\n  ')}`);
console.log(`\nMENU ITEMS STILL NEEDING A PHOTO (${gaps.length}):\n  ${gaps.join('\n  ') || '(taxonomy not in classified-photos.json — gap list N/A)'}`);
