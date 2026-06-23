/**
 * Stamp standardized AI/SEO metadata into American Heroes & Brew social content.
 *
 * Sweeps the generated-content directories (promo posters + promo videos) and
 * embeds title, AI-readable description, keywords, creator, copyright, the
 * Carlsbad Village location + GPS, and a source URL into each file via
 * scripts/lib/asset-metadata.mjs. Idempotent — files already carrying the marker
 * are skipped unless --force.
 *
 * This is the "keep it fresh as we generate content" step: it runs automatically
 * after every render batch (chained in package.json render scripts) and can be
 * run any time to backfill or re-stamp.
 *
 * Usage:
 *   node scripts/stamp-content-metadata.mjs                 # stamp new files in default dirs
 *   node scripts/stamp-content-metadata.mjs --force         # re-stamp everything
 *   node scripts/stamp-content-metadata.mjs path/to/file…   # stamp specific files
 *
 * Requires exiftool on PATH (`brew install exiftool`).
 */
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { embedMetadata, isStamped } from './lib/asset-metadata.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(HERE, '..', 'public');

// Default content roots (generated social assets only).
const DEFAULT_DIRS = [join(PUBLIC, 'promos'), join(PUBLIC, 'promos-video')];

const MEDIA_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mov', '.m4v']);

const args = process.argv.slice(2);
const force = args.includes('--force');
const explicit = args.filter((a) => !a.startsWith('--'));

/** Recursively collect media files under a directory. */
function walk(dir, acc) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      // Skip raw source/working folders — only stamp finished assets.
      if (/^(_source|\.tmp|tmp|audio)$/i.test(entry)) continue;
      walk(full, acc);
    } else if (MEDIA_EXT.has(extname(entry).toLowerCase())) {
      acc.push(full);
    }
  }
  return acc;
}

const files = explicit.length
  ? explicit
  : DEFAULT_DIRS.flatMap((d) => walk(d, []));

if (!files.length) {
  console.log('No media files found to stamp.');
  process.exit(0);
}

let stamped = 0;
let skipped = 0;
let failed = 0;

for (const file of files) {
  try {
    if (!force && isStamped(file)) {
      skipped++;
      continue;
    }
    const { title } = embedMetadata(file);
    stamped++;
    console.log(`✓ ${file.replace(PUBLIC + '/', '')}  —  ${title}`);
  } catch (err) {
    failed++;
    console.error(`✗ ${file}: ${err.message.split('\n')[0]}`);
  }
}

console.log(`\nDone. Stamped ${stamped}, skipped ${skipped} (already stamped), failed ${failed}.`);
if (failed) process.exit(1);
