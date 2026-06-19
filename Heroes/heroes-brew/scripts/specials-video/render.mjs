/**
 * DEPRECATED — legacy generic poster renderer. Superseded by the themed renderers
 * `scratch-render.mjs` (-> <key>-scratcher.mp4) and `slot-render.mjs` (-> <key>-slot.mp4),
 * which produce the daily-special videos that actually ship. This file still emits the OLD
 * `<key>-<n>.mp4` naming — do NOT run it for the daily specials or it will recreate stale,
 * wrongly-named files. `npm run render:specials` now runs the themed renderers instead.
 * Kept only for reference / the generic-poster animation.
 *
 * Code-generated 9:16 Story videos for American Heroes & Brew — the always-on rotation.
 * Each recurring item (Taco Tuesday, etc.) gets N distinct variants. Data -> branded poster
 * (Canvas) -> 4s animated MP4 (FFmpeg). Output: public/promos-video/<key>-<n>.mp4 (LEGACY).
 *
 * Run:  node scripts/specials-video/render.mjs          # all items, all variants
 *       node scripts/specials-video/render.mjs taco      # one item's variants
 *
 * Requires: ffmpeg on PATH, devDependency @napi-rs/canvas.
 */
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, '..', '..', 'public', 'promos-video');
const TMP = join(HERE, '.tmp');

for (const p of ['/System/Library/Fonts/Avenir Next Condensed.ttc', '/System/Library/Fonts/Avenir Next.ttc']) {
  try { GlobalFonts.registerFromPath(p); } catch { /* fall back */ }
}
const HEAD = GlobalFonts.families.some((f) => /Avenir Next Condensed/.test(f.family))
  ? 'Avenir Next Condensed'
  : (GlobalFonts.families.some((f) => /Avenir Next/.test(f.family)) ? 'Avenir Next' : 'sans-serif');

const W = 1080, H = 1920;

// key -> recurring item. `accents` length = number of variants rendered.
// `subs` (optional) gives each variant a different sub-line for extra variety.
const ITEMS = {
  mahalo:  { kicker: 'MONDAY',    name: 'MAHALO MONDAY',  deal: 'Kalua Pork Sliders $4 ea\nSelect Cans $3', accents: ['#2dd4bf', '#14b8a6'], subs: ['Start the week right', 'Aloha pricing all day'] },
  taco:    { kicker: 'TUESDAY',   name: 'TACO TUESDAY',   deal: 'Tacos $4 ea\n$2 off Tequila',              accents: ['#fb923c', '#ef4444'], subs: ['Taco ’bout a deal', 'Tequila + tacos = Tuesday'] },
  wings:   { kicker: 'WEDNESDAY', name: 'WINGS & WELLS',  deal: 'Wings $6 off\nWells $6',                   accents: ['#f59e0b', '#eab308'], subs: ['Halfway-there happy', 'Sauce up midweek'] },
  burgers: { kicker: 'THURSDAY',  name: 'BURGERS & BEER', deal: 'Burgers $5 off\nSelect Drafts $5',         accents: ['#f97316', '#ea580c'], subs: ['Stack it high', 'Burger + brew night'] },
  funday:  { kicker: 'FRIDAY',    name: 'FRIDAY FUNDAY',  deal: '1–4PM\nDrinks & Apps $2 off',         accents: ['#fbbf24', '#f59e0b'], subs: ['Beat the rush', 'Kick off the weekend'] },
  gameday: { kicker: 'GAME DAY',  name: 'EVERY GAME',     deal: 'Every screen.\nEvery game.',               accents: ['#ef4444', '#3b82f6'], subs: ['Your seat is ready', 'Big screens, cold beer'] },
  watch:   { kicker: 'AT HEROES', name: 'YOUR SEAT AWAITS', deal: 'Every game\nBig screens',               accents: ['#22c55e', '#f59e0b'], subs: ['Come hang in the Village', 'We saved you a stool'] },
  fantasy: { kicker: 'FOOTBALL',  name: 'FANTASY HQ',     deal: 'Draft your league here\nApps on us',       accents: ['#3b82f6', '#8b5cf6'], subs: ['Football is back', 'Host your draft at Heroes'] },
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPoster(item, variant) {
  const accent = item.accents[variant];
  const sub = (item.subs && item.subs[variant]) || '';
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');

  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0b0b0d');
  g.addColorStop(1, '#17171c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // accent glow — alternate corner per variant for visible variety
  const cx = variant % 2 === 0 ? W * 0.8 : W * 0.2;
  const blob = ctx.createRadialGradient(cx, H * 0.18, 0, cx, H * 0.18, 640);
  blob.addColorStop(0, accent + '55');
  blob.addColorStop(1, '#0b0b0d00');
  ctx.fillStyle = blob;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = accent;
  roundRect(ctx, 120, 250, 360, 70, 35);
  ctx.fill();
  ctx.fillStyle = '#0b0b0d';
  ctx.font = `700 34px "${HEAD}"`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText('TODAY AT HEROES', 150, 287);

  ctx.fillStyle = '#9ca3af';
  ctx.font = `600 56px "${HEAD}"`;
  ctx.fillText(item.kicker, 120, 470);

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 150px "${HEAD}"`;
  const words = item.name.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > W - 200 && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  let ty = 620;
  for (const ln of lines) { ctx.fillText(ln, 120, ty); ty += 158; }

  if (sub) {
    ctx.fillStyle = accent;
    ctx.font = `600 44px "${HEAD}"`;
    ctx.fillText(sub, 120, ty + 6);
    ty += 70;
  }

  ctx.fillStyle = accent;
  ctx.fillRect(120, ty + 24, 200, 10);

  ctx.fillStyle = '#e5e7eb';
  ctx.font = `600 74px "${HEAD}"`;
  let dy = ty + 150;
  for (const ln of item.deal.split('\n')) { ctx.fillText(ln, 120, dy); dy += 94; }

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 58px "${HEAD}"`;
  ctx.fillText('AMERICAN HEROES & BREW', 120, H - 260);
  ctx.fillStyle = accent;
  ctx.font = `600 44px "${HEAD}"`;
  ctx.fillText('Carlsbad Village  ·  @americanheroesandbrew', 120, H - 184);

  return c.toBuffer('image/png');
}

function renderVideo(key, item, variant) {
  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(TMP, { recursive: true });
  const png = join(TMP, `${key}-${variant + 1}.png`);
  const out = join(OUT_DIR, `${key}-${variant + 1}.mp4`);
  writeFileSync(png, drawPoster(item, variant));
  execFileSync('ffmpeg', [
    '-y',
    '-i', png,
    '-f', 'lavfi', '-t', '4', '-i', 'anullsrc=r=44100:cl=stereo',
    '-filter_complex',
    "[0:v]zoompan=z='min(zoom+0.0006,1.08)':d=120:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30," +
      'fade=t=in:st=0:d=0.4,fade=t=out:st=3.5:d=0.4,format=yuv420p[v]',
    '-map', '[v]', '-map', '1:a',
    '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', '30',
    '-c:a', 'aac', '-b:a', '128k', '-t', '4', '-movflags', '+faststart',
    out,
  ], { stdio: ['ignore', 'ignore', 'inherit'] });
  return out;
}

const only = process.argv[2]?.toLowerCase();
const keys = only ? [only] : Object.keys(ITEMS);
for (const key of keys) {
  const item = ITEMS[key];
  if (!item) { console.error(`unknown item: ${key}`); process.exit(1); }
  for (let v = 0; v < item.accents.length; v++) {
    console.log('rendered', renderVideo(key, item, v));
  }
}
rmSync(TMP, { recursive: true, force: true });
