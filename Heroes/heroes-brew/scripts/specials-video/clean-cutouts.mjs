/**
 * Clean the Vision cut-outs: keep only connected alpha components that are a real
 * subject (>= 18% of the largest), dropping stray slivers/halo specks; then trim
 * to the subject and lightly sharpen. Writes _cut_clean/<key>.png used by the reel.
 * Run: node scripts/specials-video/clean-cutouts.mjs
 */
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, '_cut'), OUT = join(HERE, '_cut_clean');
mkdirSync(OUT, { recursive: true });
const KEYS = ['josh_allen', 'cmc', 'chargers_lineup', 'raiders', 'chargers_preview', 'josh_allen2'];

for (const k of KEYS) {
  const p = join(SRC, `${k}.png`);
  if (!existsSync(p)) { console.log('skip', k); continue; }
  const { data, info } = await sharp(p).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, N = W * H;
  const label = new Int32Array(N).fill(-1);
  const areas = [];
  const stack = [];
  const a = (i) => data[i * 4 + 3];
  for (let s = 0; s < N; s++) {
    if (label[s] !== -1 || a(s) <= 40) continue;
    const id = areas.length; let area = 0; stack.length = 0; stack.push(s); label[s] = id;
    while (stack.length) {
      const c = stack.pop(); area++;
      const x = c % W, y = (c - x) / W;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const ni = ny * W + nx;
        if (label[ni] === -1 && a(ni) > 40) { label[ni] = id; stack.push(ni); }
      }
    }
    areas.push(area);
  }
  // keep only the single largest connected subject (drops stray slivers/halo bits;
  // legit multi-player shots are one connected blob so they survive intact)
  const max = Math.max(1, ...areas);
  let kept = 0; areas.forEach((ar) => { if (ar >= max) kept++; });
  for (let s = 0; s < N; s++) { const id = label[s]; if (id !== -1 && areas[id] < max) data[s * 4 + 3] = 0; }
  let buf = await sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
  try { buf = await sharp(buf).trim().sharpen({ sigma: 1 }).png().toBuffer(); }
  catch { buf = await sharp(buf).sharpen({ sigma: 1 }).png().toBuffer(); }
  await sharp(buf).toFile(join(OUT, `${k}.png`));
  console.log(`${k}: ${areas.length} components, kept largest (${max} px)`);
}
