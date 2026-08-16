/**
 * Menu Item Showcase Reel — cinematic 9:16 "Food Porn 2.0" for a SINGLE menu item.
 * Background: full-screen food photo with Ken-Burns motion + horizontal parallax.
 * Text overlay: badge + NAME (white) + SUB descriptor (amber, if non-empty) + footer.
 * NO price, NO day chip, NO deal line — pure menu item showcase.
 *
 * Output: public/promos-video/<slug>-menu.mp4
 * Run:  node scripts/specials-video/menu-render.mjs philly-billy-cheesesteak [bgPathOverride]
 */
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(HERE, '..', '..', 'public');
const OUT_DIR = join(PUBLIC, 'promos-video');
const MENU_DIR = join(OUT_DIR, 'menu');
const AUDIO_DIR = join(OUT_DIR, 'audio');
const TMP = join(HERE, '.tmp-menu');

// Register fonts
for (const p of ['/System/Library/Fonts/Avenir Next Condensed.ttc', '/System/Library/Fonts/Avenir Next.ttc']) {
  try { GlobalFonts.registerFromPath(p); } catch { /* fall back */ }
}
const HEAD = GlobalFonts.families.some((f) => /Avenir Next Condensed/.test(f.family))
  ? 'Avenir Next Condensed'
  : (GlobalFonts.families.some((f) => /Avenir Next/.test(f.family)) ? 'Avenir Next' : 'sans-serif');

const W = 1080, H = 1920, FPS = 30, SECONDS = 6.5;
const FRAMES = Math.round(FPS * SECONDS);

// Menu map: slug → { name, sub }
const MENU = {
  'pasadena-og-cheeseburger': { name: 'PASADENA', sub: 'OG CHEESEBURGER' },
  'tombstone-cowboy': { name: 'TOMBSTONE', sub: 'COWBOY BURGER' },
  'minneapolis-juicy-lucy': { name: 'MINNEAPOLIS', sub: 'JUICY LUCY' },
  'carlsbad-blt-plus': { name: 'CARLSBAD', sub: 'THE BLT+' },
  'hoboken-italian': { name: 'HOBOKEN', sub: 'ITALIAN' },
  'manhattan-reuben': { name: 'MANHATTAN', sub: 'THE REUBEN' },
  'maui-kalua-pork': { name: 'MAUI', sub: 'KALUA PORK' },
  'philly-billy-cheesesteak': { name: 'PHILLY BILLY', sub: 'CHEESESTEAK' },
  'san-diego-california-burrito': { name: 'SAN DIEGO', sub: 'CALIFORNIA BURRITO' },
  'wings': { name: 'WINGS', sub: '' },
  'sliders-kalua-pork': { name: 'KALUA SLIDERS', sub: '' },
  'village-tacos': { name: 'VILLAGE TACOS', sub: '' },
  'friar-frank': { name: 'FRIAR FRANK', sub: '' },
  'nachos': { name: 'NACHOS', sub: '' },
  'loaded-fries': { name: 'LOADED FRIES', sub: '' },
  'pretzel-bites': { name: 'PRETZEL BITES', sub: '' },
  'mac-and-cheese': { name: 'MAC & CHEESE', sub: '' },
  'antipasto': { name: 'ANTIPASTO', sub: 'SALAD' },
  'house-salad': { name: 'HOUSE SALAD', sub: '' },
  'key-lime-pie': { name: 'KEY LIME PIE', sub: '' },
  'beer': { name: 'ICE COLD BEER', sub: '' },
  'cocktails': { name: 'COCKTAILS', sub: '' },
  'margarita': { name: 'MARGARITA', sub: '' },
  'sangria': { name: 'SANGRIA', sub: '' },
};

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

async function render(slug) {
  const item = MENU[slug]; if (!item) { console.error('unknown slug', slug); process.exit(1); }
  const bgOverride = process.argv[3]; // optional explicit background path
  const bgPath = bgOverride && existsSync(bgOverride) ? bgOverride
    : existsSync(join(MENU_DIR, slug, `${slug}-pro.jpg`)) ? join(MENU_DIR, slug, `${slug}-pro.jpg`)
    : (existsSync(join(PUBLIC, 'hero.jpg')) ? join(PUBLIC, 'hero.jpg') : null);
  const bg = bgPath ? await loadImage(bgPath) : null;
  if (!bg) { console.error(`no background for ${slug}`); process.exit(1); }

  const badge = await loadImage(join(PUBLIC, 'badge-clean.png'));

  const dir = join(TMP, slug); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
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
    // Entrance stagger: badge @ 0.5s, name @ 0.8s, sub @ 1.1s, footer @ 1.2s
    const badgeT = sec - 0.5;
    const nameT = sec - 0.8;
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

    // NAME (big white text, ~150px)
    popText(ctx, () => {
      ctx.font = `800 150px "${HEAD}"`;
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = 22;
      ctx.fillText(item.name, W / 2, 1300);
      ctx.shadowColor = 'transparent';
    }, W / 2, 1300, nameT);

    // SUB descriptor (amber, ~56px, only if non-empty)
    if (item.sub && subT >= -0.05) {
      ctx.globalAlpha = clamp01(subT / 0.4);
      ctx.fillStyle = '#f59e0b';
      ctx.font = `600 56px "${HEAD}"`;
      ctx.fillText(item.sub, W / 2, 1450);
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

    writeFileSync(join(dir, `f-${String(f + 1).padStart(4, '0')}.png`), canvas.toBuffer('image/png'));
  }

  const out = join(OUT_DIR, `${slug}-menu.mp4`);
  const codec = ['-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-c:a', 'aac', '-b:a', '160k', '-t', String(SECONDS), '-movflags', '+faststart', out];

  // Audio: generic track with loudnorm + afade out
  const music = join(AUDIO_DIR, 'track.mp3');

  if (existsSync(music)) {
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

const slug = (process.argv[2] || 'philly-billy-cheesesteak').toLowerCase();
mkdirSync(TMP, { recursive: true });
await render(slug);
rmSync(TMP, { recursive: true, force: true });
