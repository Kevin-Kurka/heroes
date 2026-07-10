// Golden render: exercises brand-kit for a 9:16 schedule poster so we can eyeball
// fidelity vs the approved v11 mockup. Writes to the session scratchpad (not the repo).
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import * as BK from '../lib/brand-kit.mjs';

const PUB = '/Users/kmk/Heroes/heroes-brew/public';
const OUT = '/private/tmp/claude-501/-Users-kmk-Heroes/8b4d56f1-e84f-40f8-9b03-895b7755219c/scratchpad/golden-schedule.jpg';
const W = 1080, H = 1920, U = W / 200;

const bg = await loadImage(`${PUB}/promos-video/_source/Bar.jpg`);
const crest = await loadImage(`${PUB}/icon-512.png`);
const c = createCanvas(W, H); const ctx = c.getContext('2d');

BK.drawPhotoBg(ctx, bg, W, H);
BK.drawFrame(ctx, W, H, U);
BK.drawCrest(ctx, crest, W / 2, 175, 82);
const afterHl = BK.drawHeadline(ctx, ["Today's", 'Schedule'], W / 2, 285, {
  size: 150, accent: 'blue', anchor: 'center', maxW: W - 220,
});

const seg = 120, rx = W / 2 - (seg * 3) / 2, ry = afterHl + 24;
ctx.fillStyle = BK.NAVY; ctx.fillRect(rx, ry, seg, 12);
ctx.fillStyle = BK.WHITE; ctx.fillRect(rx + seg, ry, seg, 12);
ctx.fillStyle = BK.RED; ctx.fillRect(rx + seg * 2, ry, seg, 12);

function row(y, time, a, b, accent) {
  const color = accent === 'blue' ? BK.BLUE : BK.RED;
  const x = 90, w = W - 180, h = 150;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 10;
  BK.roundRect(ctx, x, y, w, h, 22);
  const g = ctx.createLinearGradient(x, y, x + w, y);
  g.addColorStop(0, BK.mixHex('#0a1730', color, 0.28)); g.addColorStop(1, 'rgba(8,13,26,0.86)');
  ctx.fillStyle = g; ctx.fill();
  ctx.restore();
  BK.roundRect(ctx, x, y, w, h, 22); ctx.lineWidth = 4; ctx.strokeStyle = color; ctx.stroke();
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left'; ctx.font = `800 60px "${BK.HEAD}"`; ctx.fillStyle = color; ctx.fillText(time, x + 34, y + h / 2);
  ctx.textAlign = 'center'; ctx.fillStyle = BK.WHITE; ctx.font = `800 56px "${BK.HEAD}"`;
  ctx.fillText(`${a}  vs  ${b}`, x + w / 2 + 60, y + h / 2);
}
row(1120, '2:00', 'Norway', 'England', 'blue');
row(1300, '6:00', 'Argentina', 'Switzerland', 'blue');

BK.drawKicker(ctx, 'FIFA World Cup 2026', W / 2, 1560, { accent: 'red', size: 48 });
BK.drawFooter(ctx, W, H, 'AMERICAN HEROES & BREW · CARLSBAD VILLAGE', 36);

writeFileSync(OUT, c.toBuffer('image/jpeg', { quality: 0.92 }));
console.log('wrote', OUT);
