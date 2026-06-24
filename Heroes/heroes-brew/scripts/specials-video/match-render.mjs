/**
 * Match-hype 9:16 reel — turns a cropped match poster into a shaking, bold,
 * explode-in promo for a watch party at American Heroes & Brew.
 *
 * Top: the cropped poster art (match graphic, wrong details already chopped off below
 * the soccer ball). Bottom: dark panel with HEROES details that EXPLODE into frame
 * (big -> settle overshoot) while the whole frame shakes; layered crowd-cheer bed +
 * a boom on the headline slam.
 *
 * Output: public/promos-video/<key>-watch.mp4
 * Run:    node scripts/specials-video/match-render.mjs
 */
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(HERE, '..', '..', 'public');
const OUT_DIR = join(PUBLIC, 'promos-video');
const SFX = join(OUT_DIR, 'audio', 'sfx');
const TMP = join(HERE, '.tmp-match');

for (const p of ['/System/Library/Fonts/Avenir Next Condensed.ttc', '/System/Library/Fonts/Avenir Next.ttc']) {
  try { GlobalFonts.registerFromPath(p); } catch { /* fall back */ }
}
const HEAD = GlobalFonts.families.some((f) => /Avenir Next Condensed/.test(f.family))
  ? 'Avenir Next Condensed'
  : (GlobalFonts.families.some((f) => /Avenir Next/.test(f.family)) ? 'Avenir Next' : 'sans-serif');

const W = 1080, H = 1920, FPS = 30, SECONDS = 6;
const FRAMES = Math.round(FPS * SECONDS);
const ACCENT = '#f59e0b';

// Animation config
const CFG = {
  poster: join(HERE, '_match', 'poster.png'),
  key: 'AHB-watchparty_mexico-czechia',
  kicker: 'WATCH IT LIVE',
  bigTop: 'TODAY',
  bigTime: '6:00 PM',
  venue: 'AT AMERICAN HEROES & BREW',
  footer: 'Carlsbad Village  ·  @americanheroesandbrew',
};

// easing
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const easeOut = (t) => 1 - Math.pow(1 - clamp01(t), 3);
const backOut = (t) => { t = clamp01(t); const c1 = 2.2, c3 = c1 + 1; const u = t - 1; return 1 + c3 * u * u * u + c1 * u * u; };
const lerp = (a, b, t) => a + (b - a) * t;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

// explode-in: returns {alpha, scale} for an element triggered at `start` (seconds)
function explode(t, start, dur = 0.45) {
  if (t < start) return { alpha: 0, scale: 2.0 };
  const p = clamp01((t - start) / dur);
  const alpha = easeOut(p / 0.5);
  const scale = lerp(2.0, 1, backOut(p));
  return { alpha: clamp01(alpha), scale };
}

// camera shake — strong impulse at each slam, decaying, plus subtle idle wobble
const SLAMS = [0.0, 0.55, 1.0, 1.45];
function shake(t) {
  let amp = 4; // idle wobble
  for (const s of SLAMS) {
    if (t >= s) amp += 26 * Math.exp(-(t - s) * 9);
  }
  // deterministic pseudo-noise from time
  const x = Math.sin(t * 91.3) * Math.cos(t * 47.7);
  const y = Math.sin(t * 73.1 + 1.7) * Math.cos(t * 59.2);
  const rot = Math.sin(t * 55.0 + 0.5) * 0.5;
  return { dx: x * amp, dy: y * amp, rot: (rot * amp) / 900 };
}

function drawText(ctx, text, x, y, font, fill, { stroke, strokeW, align = 'center', shadow } = {}) {
  ctx.font = font; ctx.textAlign = align; ctx.textBaseline = 'middle';
  if (shadow) { ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = shadow; ctx.shadowOffsetY = 6; }
  if (stroke) { ctx.lineWidth = strokeW; ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.strokeText(text, x, y); }
  ctx.fillStyle = fill; ctx.fillText(text, x, y);
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
}

async function main() {
  mkdirSync(TMP, { recursive: true });
  mkdirSync(OUT_DIR, { recursive: true });
  const poster = await loadImage(CFG.poster);
  // poster is 1080 wide; place at top, scaled to width, with slight overscan zoom punch
  const pAspect = poster.height / poster.width; // ~0.787
  const posterDrawH = W * pAspect; // ~850

  for (let f = 0; f < FRAMES; f++) {
    const t = f / FPS;
    const c = createCanvas(W, H);
    const ctx = c.getContext('2d');

    // base dark fill
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0b0b0d'); g.addColorStop(1, '#141418');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    const sh = shake(t);
    ctx.save();
    // overscan + shake so the frame edges never show
    ctx.translate(W / 2 + sh.dx, H / 2 + sh.dy);
    ctx.rotate(sh.rot);
    const over = 1.05;
    ctx.scale(over, over);
    ctx.translate(-W / 2, -H / 2);

    // --- poster art at top (slow ken-burns zoom-in) ---
    const kb = 1.0 + easeOut(t / SECONDS) * 0.06;
    const drawW = W * kb, drawH = posterDrawH * kb;
    ctx.save();
    ctx.beginPath(); ctx.rect(-40, -40, W + 80, posterDrawH + 6); ctx.clip();
    ctx.drawImage(poster, (W - drawW) / 2, (posterDrawH * kb - posterDrawH) / -2, drawW, drawH);
    ctx.restore();

    // blend the hard crop edge into the dark lower panel
    const blend = ctx.createLinearGradient(0, posterDrawH - 160, 0, posterDrawH + 40);
    blend.addColorStop(0, 'rgba(11,11,13,0)');
    blend.addColorStop(1, '#0b0b0d');
    ctx.fillStyle = blend; ctx.fillRect(0, posterDrawH - 160, W, 220);

    // accent rule under the poster
    const ruleY = posterDrawH + 30;
    ctx.fillStyle = ACCENT; ctx.fillRect((W - 160) / 2, ruleY, 160, 8);

    // --- lower details panel ---
    const baseY = posterDrawH + 130;

    // kicker chip
    const eK = explode(t, 0.25, 0.4);
    if (eK.alpha > 0) {
      ctx.save();
      ctx.globalAlpha = eK.alpha;
      const chipW = 420, chipH = 84, chipX = W / 2, chipY = baseY;
      ctx.translate(chipX, chipY); ctx.scale(eK.scale, eK.scale);
      roundRect(ctx, -chipW / 2, -chipH / 2, chipW, chipH, chipH / 2);
      ctx.fillStyle = ACCENT; ctx.fill();
      drawText(ctx, CFG.kicker, 0, 2, `800 48px "${HEAD}"`, '#0b0b0d');
      ctx.restore();
    }

    // big headline: TODAY
    const eT = explode(t, 0.55, 0.45);
    if (eT.alpha > 0) {
      ctx.save(); ctx.globalAlpha = eT.alpha;
      ctx.translate(W / 2, baseY + 175); ctx.scale(eT.scale, eT.scale);
      drawText(ctx, CFG.bigTop, 0, 0, `800 170px "${HEAD}"`, '#ffffff', { stroke: '#0b0b0d', strokeW: 10, shadow: 24 });
      ctx.restore();
    }

    // big time: 6:00 PM (accent)
    const eTime = explode(t, 0.78, 0.45);
    if (eTime.alpha > 0) {
      ctx.save(); ctx.globalAlpha = eTime.alpha;
      ctx.translate(W / 2, baseY + 360); ctx.scale(eTime.scale, eTime.scale);
      drawText(ctx, CFG.bigTime, 0, 0, `800 200px "${HEAD}"`, ACCENT, { stroke: '#0b0b0d', strokeW: 12, shadow: 28 });
      ctx.restore();
    }

    // venue line
    const eV = explode(t, 1.05, 0.45);
    if (eV.alpha > 0) {
      ctx.save(); ctx.globalAlpha = eV.alpha;
      ctx.translate(W / 2, baseY + 510); ctx.scale(eV.scale, eV.scale);
      drawText(ctx, CFG.venue, 0, 0, `800 64px "${HEAD}"`, '#ffffff', { stroke: '#0b0b0d', strokeW: 6, shadow: 16 });
      ctx.restore();
    }

    // footer
    const eF = explode(t, 1.45, 0.4);
    if (eF.alpha > 0) {
      ctx.save(); ctx.globalAlpha = eF.alpha;
      drawText(ctx, CFG.footer, W / 2, baseY + 600, `600 40px "${HEAD}"`, ACCENT);
      ctx.restore();
    }

    ctx.restore(); // end overscan/shake

    writeFileSync(join(TMP, `f${String(f).padStart(4, '0')}.png`), c.toBuffer('image/png'));
    if (f % 30 === 0) process.stdout.write(`\rframe ${f}/${FRAMES}`);
  }
  process.stdout.write(`\rframes ${FRAMES}/${FRAMES} done\n`);

  const out = join(OUT_DIR, `${CFG.key}.mp4`);
  const cheer = join(SFX, 'cheer.mp3');
  const boom = join(SFX, 'boom.mp3');

  execFileSync('ffmpeg', [
    '-y',
    '-framerate', String(FPS), '-i', join(TMP, 'f%04d.png'),
    '-i', cheer,
    '-i', boom,
    '-filter_complex',
    // crowd bed full-length, fade out tail; boom on the TODAY slam (~0.55s) and time slam (~0.78s)
    '[1:a]volume=1.0,afade=t=in:st=0:d=0.2,afade=t=out:st=5.4:d=0.6[bed];' +
    '[2:a]adelay=550|550,volume=1.1[b1];' +
    '[2:a]adelay=2000|2000,volume=0.6[b2];' +
    '[bed][b1][b2]amix=inputs=3:duration=first:dropout_transition=0,volume=1.4[a]',
    '-map', '0:v', '-map', '[a]',
    '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-c:a', 'aac', '-b:a', '160k', '-t', String(SECONDS), '-movflags', '+faststart',
    out,
  ], { stdio: ['ignore', 'ignore', 'inherit'] });

  rmSync(TMP, { recursive: true, force: true });
  console.log('rendered', out);
}

main().catch((e) => { console.error(e); process.exit(1); });
