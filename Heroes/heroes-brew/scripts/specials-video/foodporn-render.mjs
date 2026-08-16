/**
 * "Food Porn 2.0" — cinematic 9:16 reel showcasing a food photo with Ken-Burns motion,
 * parallax text, and kinetic (animated) typography.
 *
 * Background: full-screen food photo with Ken-Burns zoom (1.06→1.14) + horizontal drift.
 * Legibility: rgba(0,0,0,0.28) wash + top/bottom gradients.
 * Parallax: text group translates OPPOSITE the bg drift at ~0.5× for depth.
 * Kinetic Type: badge, day chip, hero word, price (with white stroke + shine sweep), sub, footer.
 * All entrances staggered ~0.15s, settled ~2.6s, hold to end with continued slow parallax.
 *
 * Output: public/promos-video/<key>-foodporn.mp4
 * Run:  node scripts/specials-video/foodporn-render.mjs burgers
 */
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(HERE, '..', '..', 'public');
const OUT_DIR = join(PUBLIC, 'promos-video');
const BG_DIR = join(OUT_DIR, 'bg');
const AUDIO_DIR = join(OUT_DIR, 'audio');
const TMP = join(HERE, '.tmp-foodporn');

// Register fonts
for (const p of ['/System/Library/Fonts/Avenir Next Condensed.ttc', '/System/Library/Fonts/Avenir Next.ttc']) {
  try { GlobalFonts.registerFromPath(p); } catch { /* fall back */ }
}
const HEAD = GlobalFonts.families.some((f) => /Avenir Next Condensed/.test(f.family))
  ? 'Avenir Next Condensed'
  : (GlobalFonts.families.some((f) => /Avenir Next/.test(f.family)) ? 'Avenir Next' : 'sans-serif');

const W = 1080, H = 1920, FPS = 30, SECONDS = 6.5;
const FRAMES = Math.round(FPS * SECONDS);

// Reuse from slot-render
const ITEMS = {
  mahalo:  { day: 'MONDAY',    name: 'MAHALO MONDAY',          hero: 'KALUA SLIDERS', price: '$4',     sub: 'Sliders $4  ·  Select Cans $3', accent: '#2dd4bf', food: 'slider' },
  taco:    { day: 'TUESDAY',   name: 'TACO TUESDAY',           hero: 'TACOS',         price: '$4',     sub: 'Tacos $4  ·  $2 off Tequila',   accent: '#fb923c', food: 'taco' },
  wings:   { day: 'WEDNESDAY', name: 'WINGS & WELL WEDNESDAY', hero: 'WINGS',         price: '$6 OFF', sub: 'Wings $6 off  ·  Wells $6',      accent: '#f59e0b', food: 'wings' },
  burgers: { day: 'THURSDAY',  name: 'THIRSTY THURSDAY',       hero: 'BURGERS',       price: '$5 OFF', sub: 'Burgers $5 off  ·  Drafts $5',   accent: '#f97316', food: 'burger' },
  funday:  { day: 'FRIDAY',    name: 'FRIDAY FUNDAY',          hero: 'HAPPY HOUR',    price: '$2 OFF', sub: '1–4PM  ·  Drinks & Apps $2 off', accent: '#fbbf24', food: 'beer' },
};
const FALLBACK_BG = { burgers: join(PUBLIC, 'hero.jpg') };

// Easing & utility functions
const clamp01 = (x) => x < 0 ? 0 : x > 1 ? 1 : x;
const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - Math.pow(1 - clamp01(t), 3);
const backOut = (t) => { t = clamp01(t); const c1 = 1.7, c3 = c1 + 1; const u = t - 1; return 1 + c3 * u * u * u + c1 * u * u; };

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function drawCover(ctx, img, scale, panX = 0, panY = 0) {
  const ir = img.width / img.height, cr = W / H; let dw, dh;
  if (ir > cr) { dh = H * scale; dw = dh * ir; } else { dw = W * scale; dh = dw / ir; }
  ctx.drawImage(img, (W - dw) / 2 + panX, (H - dh) / 2 + panY, dw, dh);
}

// Poppy entrance: overshoot scale + quick fade-in, around (cx,cy), local time td (sec)
function popText(ctx, fn, cx, cy, td) {
  if (td < 0) return;
  const e = backOut(clamp01(td / 0.42)), a = clamp01(td / 0.18);
  ctx.save(); ctx.globalAlpha = a; ctx.translate(cx, cy); ctx.scale(e, e); ctx.translate(-cx, -cy); fn(); ctx.restore();
}

// Ken-Burns + parallax background
function drawBackground(ctx, bg, sec, item) {
  // Ken-Burns: zoom from 1.06 to 1.14 over entire clip
  const zoomProgress = sec / SECONDS;
  const zoom = lerp(1.06, 1.14, easeOut(zoomProgress));

  // Horizontal drift: ±24 px back and forth
  const driftPhase = sec * 0.4; // slow oscillation
  const bgX = Math.sin(driftPhase * Math.PI) * 24; // from -24 to +24

  drawCover(ctx, bg, zoom, bgX, 0);

  // Full-screen dark wash for legibility
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fillRect(0, 0, W, H);

  // Top gradient (dark, fades down at ~42%)
  const tg = ctx.createLinearGradient(0, 0, 0, H * 0.42);
  tg.addColorStop(0, 'rgba(0,0,0,0.6)');
  tg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = tg;
  ctx.fillRect(0, 0, W, H * 0.42);

  // Bottom gradient (strong, from 56% to 100%)
  const bg2 = ctx.createLinearGradient(0, H * 0.56, 0, H);
  bg2.addColorStop(0, 'rgba(0,0,0,0)');
  bg2.addColorStop(1, 'rgba(0,0,0,0.72)');
  ctx.fillStyle = bg2;
  ctx.fillRect(0, H * 0.56, W, H * 0.44);

  return bgX;
}

// Shine sweep across price (white glow moving left→right, ~0.4s after price lands)
function drawPriceShine(ctx, sec, item) {
  const priceT = sec - 0.4; // price lands at 0.2s, shine starts ~0.4s later
  if (priceT < 0 || priceT > 0.4) return;

  const shineX = lerp(-200, W + 200, easeOut(priceT / 0.4));
  ctx.save();
  ctx.globalAlpha = 0.4 * (1 - priceT / 0.4);
  const sg = ctx.createLinearGradient(shineX - 100, 1400, shineX + 100, 1400);
  sg.addColorStop(0, 'rgba(255,255,255,0)');
  sg.addColorStop(0.5, 'rgba(255,255,255,0.8)');
  sg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sg;
  ctx.fillRect(shineX - 100, 1400, 200, 200);
  ctx.restore();
}

async function render(key) {
  const item = ITEMS[key]; if (!item) { console.error('unknown', key); process.exit(1); }
  const bgOverride = process.argv[3]; // optional explicit background path
  const bgPath = bgOverride && existsSync(bgOverride) ? bgOverride
    : existsSync(join(BG_DIR, `${key}.jpg`)) ? join(BG_DIR, `${key}.jpg`) : (FALLBACK_BG[key] || null);
  const bg = bgPath ? await loadImage(bgPath) : null;
  if (!bg) { console.error(`no background for ${key}`); process.exit(1); }

  const badge = await loadImage(join(PUBLIC, 'badge-clean.png'));

  const dir = join(TMP, key); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const canvas = createCanvas(W, H); const ctx = canvas.getContext('2d');

  for (let f = 0; f < FRAMES; f++) {
    const sec = f / FPS;
    ctx.clearRect(0, 0, W, H);

    // Background: Ken-Burns + parallax drift
    const bgX = drawBackground(ctx, bg, sec, item);

    // Parallax: text translates OPPOSITE bg drift at 0.5×
    const textOffsetX = -bgX * 0.5;
    const textOffsetY = Math.sin(sec * 0.5) * 8; // tiny vertical bob

    // Kinetic text timeline
    // Entrance stagger: badge @ 0.5s, day @ 0.65s, hero @ 0.8s, price @ 0.95s, sub @ 1.1s, footer @ 1.2s
    // All settled by ~2.6s, then hold with parallax
    const badgeT = sec - 0.5;
    const dayT = sec - 0.65;
    const heroT = sec - 0.8;
    const priceT = sec - 0.95;
    const subT = sec - 1.1;
    const footerT = sec - 1.2;

    ctx.save();
    ctx.translate(textOffsetX, textOffsetY);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Badge (80% white disc, ~220px, near top)
    popText(ctx, () => {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath();
      ctx.arc(W / 2, 330, 110, 0, 7);
      ctx.fill();
      ctx.drawImage(badge, W / 2 - 110, 330 - 110, 220, 220);
    }, W / 2, 330, badgeT);

    // Day chip (accent rounded-rect, dark text, staggered after badge)
    popText(ctx, () => {
      const cw = ctx.measureText(item.day).width + 96;
      ctx.fillStyle = item.accent;
      roundRect(ctx, W / 2 - cw / 2, 1120, cw, 84, 42);
      ctx.fill();
      ctx.fillStyle = '#0b0b0d';
      ctx.font = `800 46px "${HEAD}"`;
      ctx.fillText(item.day, W / 2, 1163);
    }, W / 2, 1163, dayT);

    // Hero word (big white text with drop shadow)
    popText(ctx, () => {
      ctx.font = `800 150px "${HEAD}"`;
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = 22;
      ctx.fillText(item.hero, W / 2, 1300);
      ctx.shadowColor = 'transparent';
    }, W / 2, 1300, heroT);

    // Price (accent fill + white stroke, ~184px)
    popText(ctx, () => {
      ctx.font = `800 184px "${HEAD}"`;
      ctx.lineJoin = 'round';
      ctx.lineWidth = 16;
      ctx.strokeStyle = '#fff';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 26;
      ctx.strokeText(item.price, W / 2, 1488);
      ctx.fillStyle = item.accent;
      ctx.fillText(item.price, W / 2, 1488);
      ctx.shadowColor = 'transparent';
    }, W / 2, 1488, priceT);

    // Sub line (light, ~50px)
    if (subT >= -0.05) {
      ctx.globalAlpha = clamp01(subT / 0.4);
      ctx.fillStyle = '#e8eaee';
      ctx.font = `600 50px "${HEAD}"`;
      ctx.fillText(item.sub, W / 2, 1628);
      ctx.globalAlpha = 1;
    }

    // Footer "AMERICAN HEROES & BREW" (~48px, white)
    if (footerT >= -0.05) {
      ctx.globalAlpha = clamp01(footerT / 0.4);
      ctx.fillStyle = '#fff';
      ctx.font = `800 48px "${HEAD}"`;
      ctx.fillText('AMERICAN HEROES & BREW', W / 2, H - 140);
      ctx.globalAlpha = 1;
    }

    ctx.restore();

    // Price shine sweep (drawn outside parallax group so it's in screen space)
    drawPriceShine(ctx, sec, item);

    writeFileSync(join(dir, `f-${String(f + 1).padStart(4, '0')}.png`), canvas.toBuffer('image/png'));
  }

  const out = join(OUT_DIR, `${key}-foodporn.mp4`);
  const codec = ['-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-c:a', 'aac', '-b:a', '160k', '-t', String(SECONDS), '-movflags', '+faststart', out];

  // Audio: per-key track or generic fallback, with loudnorm + afade out
  const music = [join(AUDIO_DIR, `${key}.mp3`), join(AUDIO_DIR, 'track.mp3')].find(existsSync);
  const ms = (s) => Math.round(s * 1000);

  if (music) {
    const aFx = `loudnorm=I=-15:TP=-1.5:LRA=11,afade=t=out:st=${SECONDS - 0.5}:d=0.5,aresample=44100`;
    execFileSync('ffmpeg', ['-y', '-framerate', String(FPS), '-i', join(dir, 'f-%04d.png'),
      '-i', music, '-af', aFx, '-map', '0:v', '-map', '1:a', ...codec],
      { stdio: ['ignore', 'ignore', 'inherit'] });
  } else {
    execFileSync('ffmpeg', ['-y', '-framerate', String(FPS), '-i', join(dir, 'f-%04d.png'),
      '-f', 'lavfi', '-t', String(SECONDS), '-i', 'anullsrc=r=44100:cl=stereo',
      '-af', 'aresample=44100',
      '-map', '0:v', '-map', '1:a', ...codec],
      { stdio: ['ignore', 'ignore', 'inherit'] });
  }

  rmSync(dir, { recursive: true, force: true });
  console.log('rendered', out);
}

const key = (process.argv[2] || 'burgers').toLowerCase();
mkdirSync(TMP, { recursive: true });
await render(key);
rmSync(TMP, { recursive: true, force: true });
