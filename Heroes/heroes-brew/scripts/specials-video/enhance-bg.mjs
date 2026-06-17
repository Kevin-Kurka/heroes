/**
 * Enhance a source food photo into a 9:16 scratch-off background.
 *
 * Auto-orients (EXIF), smart-crops to 1080x1920 (focuses on the salient subject),
 * boosts saturation/contrast for appetite appeal, sharpens, and writes
 * public/promos-video/bg/<key>.jpg.
 *
 * Run:  node scripts/specials-video/enhance-bg.mjs <input-image> <key> [position]
 *       node scripts/specials-video/enhance-bg.mjs public/promos-video/_source/Minnealopous-Burger.jpg burgers
 *       position: center (default) | top | bottom | attention   — which part to keep when cropping
 */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const BG_DIR = join(HERE, '..', '..', 'public', 'promos-video', 'bg');

const [input, key, pos = 'center'] = process.argv.slice(2);
if (!input || !key) { console.error('usage: enhance-bg.mjs <input-image> <key> [position]'); process.exit(1); }
const position = pos === 'attention' ? sharp.strategy.attention : pos;

const out = join(BG_DIR, `${key}.jpg`);
await sharp(input)
  .rotate()                                                   // honor EXIF orientation
  .resize(1080, 1920, { fit: 'cover', position })
  .modulate({ saturation: 1.26, brightness: 1.04 })           // richer, more appetizing color
  .linear(1.14, -14)                                          // punchier contrast
  .clahe({ width: 160, height: 160, maxSlope: 2 })            // local contrast → "pro" depth
  .sharpen({ sigma: 1.3, m1: 1, m2: 2 })                      // crisp detail without halos
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(out);
console.log('wrote', out);
