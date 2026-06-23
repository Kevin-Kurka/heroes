/**
 * Announcement poster for the Heroes Fantasy Football League launch.
 * Branded football artwork (field + football motif) drawn on canvas with text
 * overlays — no scraped/copyrighted stock photos. Renders 4:5 (feed) and 9:16
 * (story) JPGs into public/promos/, then they get metadata-stamped.
 *
 * Run: node scripts/specials-video/fantasy-launch-render.mjs
 */
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(HERE, '..', '..', 'public');

for (const p of ['/System/Library/Fonts/Avenir Next Condensed.ttc', '/System/Library/Fonts/Avenir Next.ttc']) {
  try { GlobalFonts.registerFromPath(p); } catch { /* fall back */ }
}
const HEAD = GlobalFonts.families.some((f) => /Avenir Next Condensed/.test(f.family))
  ? 'Avenir Next Condensed'
  : (GlobalFonts.families.some((f) => /Avenir Next/.test(f.family)) ? 'Avenir Next' : 'sans-serif');

const AMBER = '#f59e0b';

function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function football(ctx, cx, cy, rx, ry, rot) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  const g = ctx.createLinearGradient(-rx, 0, rx, 0);
  g.addColorStop(0, '#6e3411'); g.addColorStop(0.5, '#9a4a18'); g.addColorStop(1, '#6e3411');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.92)';
  ctx.lineWidth = ry * 0.10; ctx.lineCap = 'round';
  for (const sx of [-rx * 0.78, rx * 0.78]) { ctx.beginPath(); ctx.moveTo(sx, -ry * 0.3); ctx.lineTo(sx, ry * 0.3); ctx.stroke(); }
  ctx.lineWidth = ry * 0.08;
  ctx.beginPath(); ctx.moveTo(-rx * 0.34, 0); ctx.lineTo(rx * 0.34, 0); ctx.stroke();
  for (let i = -3; i <= 3; i++) { const lx = i * rx * 0.11; ctx.beginPath(); ctx.moveTo(lx, -ry * 0.12); ctx.lineTo(lx, ry * 0.12); ctx.stroke(); }
  ctx.restore();
}

function pill(ctx, x, y, text, fontPx) {
  ctx.font = `800 ${fontPx}px "${HEAD}"`;
  const padX = fontPx * 0.6, h = fontPx * 1.7;
  const w = ctx.measureText(text).width + padX * 2;
  ctx.fillStyle = AMBER;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = '#19120a';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x + padX, y + h / 2 + fontPx * 0.04);
  ctx.textBaseline = 'alphabetic';
  return h;
}

async function drawPoster(W, H, badge) {
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  const M = Math.round(W * 0.07);

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#06140c'); bg.addColorStop(0.55, '#0a3d20'); bg.addColorStop(1, '#04100a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // faint yard lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 3;
  for (let y = H * 0.16; y < H; y += H * 0.07) {
    ctx.beginPath(); ctx.moveTo(M * 0.4, y); ctx.lineTo(W - M * 0.4, y); ctx.stroke();
  }

  // small football motif, top-right (low alpha, behind text zone)
  ctx.globalAlpha = 0.85;
  football(ctx, W - M - W * 0.1, H * 0.105, W * 0.1, W * 0.063, -0.35);
  ctx.globalAlpha = 1;

  // badge top-left
  if (badge) ctx.drawImage(badge, M, Math.round(H * 0.04), Math.round(W * 0.16), Math.round(W * 0.16));

  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  let y = Math.round(H * 0.20);

  // kicker
  ctx.fillStyle = AMBER;
  ctx.font = `700 ${Math.round(W * 0.033)}px "${HEAD}"`;
  ctx.fillText('AMERICAN HEROES & BREW · CARLSBAD VILLAGE', M, y);

  // headline
  const HL = Math.round(W * 0.105);
  y += Math.round(HL * 1.05);
  ctx.fillStyle = '#fff'; ctx.font = `800 ${HL}px "${HEAD}"`;
  ctx.fillText('FANTASY', M, y);
  y += HL; ctx.fillText('FOOTBALL', M, y);
  y += HL; ctx.fillStyle = AMBER; ctx.fillText('LEAGUE', M, y);

  // $100 pill (right of LEAGUE-ish, on its own row)
  y += Math.round(W * 0.06);
  pill(ctx, M, y, '$100 TO THE CHAMP', Math.round(W * 0.04));

  // tagline
  y += Math.round(W * 0.12);
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = `600 ${Math.round(W * 0.04)}px "${HEAD}"`;
  ctx.fillText('Draft at the bar · Every game on 16 TVs · Free to join', M, y);

  // two option cards
  y += Math.round(W * 0.05);
  const cardW = W - M * 2, cardH = Math.round(W * 0.135), gap = Math.round(W * 0.025);
  const cards = [
    ['JOIN A HEROES LEAGUE', '9 open spots each · we run it · pick your draft date'],
    ['BRING YOUR OWN LEAGUE', 'Draft munchies on us · live on the big screen'],
  ];
  cards.forEach((cd) => {
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    roundRect(ctx, M, y, cardW, cardH, 18); ctx.fill();
    ctx.fillStyle = AMBER; roundRect(ctx, M, y, Math.round(W * 0.016), cardH, 4); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
    ctx.font = `800 ${Math.round(W * 0.046)}px "${HEAD}"`;
    ctx.fillText(cd[0], M + W * 0.05, y + cardH * 0.44);
    ctx.fillStyle = 'rgba(255,255,255,0.78)';
    ctx.font = `500 ${Math.round(W * 0.032)}px "${HEAD}"`;
    ctx.fillText(cd[1], M + W * 0.05, y + cardH * 0.74);
    y += cardH + gap;
  });

  // footer CTA — flows right below the cards (no overlap on either aspect ratio)
  y += Math.round(W * 0.03);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.font = `800 ${Math.round(W * 0.054)}px "${HEAD}"`;
  ctx.fillText('SIGN UP NOW', W / 2, y);
  y += Math.round(W * 0.058);
  ctx.fillStyle = AMBER;
  ctx.font = `600 ${Math.round(W * 0.038)}px "${HEAD}"`;
  ctx.fillText('americanheroesandbrew.com/fantasy-football', W / 2, y);

  return c;
}

const badge = await loadImage(join(PUBLIC, 'badge-clean.png')).catch(() => null);
for (const [name, W, H] of [['fantasy-launch-4x5.jpg', 1080, 1350], ['fantasy-launch-9x16.jpg', 1080, 1920]]) {
  const canvas = await drawPoster(W, H, badge);
  writeFileSync(join(PUBLIC, 'promos', name), canvas.toBuffer('image/jpeg', 92));
  console.log('rendered', join('public/promos', name));
}
