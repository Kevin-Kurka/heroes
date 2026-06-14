/**
 * Code-generated 9:16 special-of-the-day Story videos for American Heroes & Brew.
 *
 * Data → branded poster (Canvas) → 4s animated MP4 (FFmpeg Ken-Burns + fades).
 * Mirrors the daily specials in src/lib/menu.ts. Output:
 *   public/promos-video/special-<weekday>.mp4   (1080×1920, H.264/AAC)
 *
 * Run:  node scripts/specials-video/render.mjs           # all 7 days
 *       node scripts/specials-video/render.mjs tuesday   # one day
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

// Register a condensed system face for a sporty headline; fall back silently.
for (const p of ['/System/Library/Fonts/Avenir Next Condensed.ttc', '/System/Library/Fonts/Avenir Next.ttc']) {
  try { GlobalFonts.registerFromPath(p); } catch { /* fall back to default sans */ }
}
const HEAD = GlobalFonts.families.some((f) => /Avenir Next Condensed/.test(f.family))
  ? 'Avenir Next Condensed'
  : (GlobalFonts.families.some((f) => /Avenir Next/.test(f.family)) ? 'Avenir Next' : 'sans-serif');

const W = 1080, H = 1920;

// weekday → content. accent drives the brand pop per day.
const SPECIALS = {
  monday:    { day: 'MONDAY',    name: 'MAHALO MONDAY',    deal: 'Kalua Pork Sliders $4 ea\nSelect Cans $3',      accent: '#2dd4bf' },
  tuesday:   { day: 'TUESDAY',   name: 'TACO TUESDAY',     deal: 'Tacos $4 ea\n$2 off Tequila',                   accent: '#fb923c' },
  wednesday: { day: 'WEDNESDAY', name: 'WINGS & WELLS',    deal: 'Wings $6 off\nWells $6',                        accent: '#f59e0b' },
  thursday:  { day: 'THURSDAY',  name: 'BURGERS & BEER',   deal: 'Burgers $5 off\nSelect Drafts $5',              accent: '#f97316' },
  friday:    { day: 'FRIDAY',    name: 'FRIDAY FUNDAY',    deal: '1–4PM\nDrinks & Apps $2 off',                   accent: '#fbbf24' },
  saturday:  { day: 'SATURDAY',  name: 'GAME DAY',         deal: 'Every game. Every screen.\nFriar Franks $6',    accent: '#ef4444' },
  sunday:    { day: 'SUNDAY',    name: 'FOOTBALL HQ',      deal: 'Sunday on the big screens\nDrafts & wings',     accent: '#3b82f6' },
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

function drawPoster(spec) {
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');

  // Background gradient
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0b0b0d');
  g.addColorStop(1, '#17171c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Accent glow blob
  const blob = ctx.createRadialGradient(W * 0.8, H * 0.18, 0, W * 0.8, H * 0.18, 620);
  blob.addColorStop(0, spec.accent + '55');
  blob.addColorStop(1, '#0b0b0d00');
  ctx.fillStyle = blob;
  ctx.fillRect(0, 0, W, H);

  // Kicker
  ctx.fillStyle = spec.accent;
  roundRect(ctx, 120, 250, 360, 70, 35);
  ctx.fill();
  ctx.fillStyle = '#0b0b0d';
  ctx.font = `700 34px "${HEAD}"`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText('TODAY AT HEROES', 150, 287);

  // Weekday label
  ctx.fillStyle = '#9ca3af';
  ctx.font = `600 56px "${HEAD}"`;
  ctx.fillText(spec.day, 120, 470);

  // Big special name (wrap on spaces, up to 2 lines)
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 168px "${HEAD}"`;
  const words = spec.name.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > W - 200 && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  let ty = 640;
  for (const ln of lines) { ctx.fillText(ln, 120, ty); ty += 170; }

  // Accent divider
  ctx.fillStyle = spec.accent;
  ctx.fillRect(120, ty + 20, 200, 10);

  // Deal text (multi-line)
  ctx.fillStyle = '#e5e7eb';
  ctx.font = `600 76px "${HEAD}"`;
  let dy = ty + 140;
  for (const ln of spec.deal.split('\n')) { ctx.fillText(ln, 120, dy); dy += 96; }

  // Footer
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 60px "${HEAD}"`;
  ctx.fillText('AMERICAN HEROES & BREW', 120, H - 260);
  ctx.fillStyle = spec.accent;
  ctx.font = `600 46px "${HEAD}"`;
  ctx.fillText('Carlsbad Village  ·  @americanheroesandbrew', 120, H - 180);

  return c.toBuffer('image/png');
}

function renderVideo(weekday, spec) {
  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(TMP, { recursive: true });
  const png = join(TMP, `${weekday}.png`);
  const out = join(OUT_DIR, `special-${weekday}.mp4`);
  writeFileSync(png, drawPoster(spec));

  // 4s Ken-Burns zoom + in/out fades, silent stereo audio track (IG video needs audio).
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
const days = only ? [only] : Object.keys(SPECIALS);
for (const d of days) {
  if (!SPECIALS[d]) { console.error(`unknown weekday: ${d}`); process.exit(1); }
  const out = renderVideo(d, SPECIALS[d]);
  console.log('rendered', out);
}
rmSync(TMP, { recursive: true, force: true });
