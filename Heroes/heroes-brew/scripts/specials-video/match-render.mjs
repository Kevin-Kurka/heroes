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

// Flag palette — Mexico (green/white/red, left) + Czechia (blue/white/red, right),
// mirroring the poster's left→right split.
const MX_GREEN = '#1f9e4b';
const MX_RED = '#e11d2a';
const CZ_BLUE = '#1f5fd6';
const WHITE = '#ffffff';
// left→right flag gradient stops used across the big text + accent rule
const FLAG_STOPS = [[0, MX_GREEN], [0.34, WHITE], [0.62, MX_RED], [1, CZ_BLUE]];

// Animation config
const CFG = {
  poster: join(HERE, '_match', 'poster.png'),
  bg: join(HERE, '_match', 'bg-blur.jpg'),
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

// bounce: the element is FULLY VISIBLE from the first frame (alpha 1, scale 1) so
// the very first frame is the complete poster — no blank/blurred intro that reads
// as unfinished on Instagram. At `start` it does a quick pop-and-settle bounce for
// emphasis (timed to the camera shake + audio hits).
function bounce(t, start, dur = 0.42) {
  if (t < start) return { alpha: 1, scale: 1 };
  const p = clamp01((t - start) / dur);
  const pulse = Math.sin(p * Math.PI) * (1 - p) * 0.22; // peak ~+16%, settles to 1
  return { alpha: 1, scale: 1 + pulse };
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

// horizontal flag gradient sized to the text width, centered at x
function flagGradient(ctx, x, font, text) {
  ctx.font = font;
  const w = ctx.measureText(text).width;
  const grad = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  for (const [stop, col] of FLAG_STOPS) grad.addColorStop(stop, col);
  return grad;
}

// draw an image to fully cover (w,h) preserving aspect, anchored at top
function drawCoverTop(ctx, img, x, y, w, h, scale = 1) {
  const ar = img.width / img.height;
  let dw = w * scale, dh = dw / ar;
  if (dh < h * scale) { dh = h * scale; dw = dh * ar; }
  ctx.drawImage(img, x + (w - dw) / 2, y, dw, dh);
}

function drawText(ctx, text, x, y, font, fill, { stroke, strokeW, align = 'center', shadow } = {}) {
  ctx.font = font; ctx.textAlign = align; ctx.textBaseline = 'middle';
  if (shadow) { ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = shadow; ctx.shadowOffsetY = 6; }
  if (stroke) { ctx.lineWidth = strokeW; ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.strokeText(text, x, y); }
  ctx.fillStyle = (fill === 'FLAG') ? flagGradient(ctx, x, font, text) : fill;
  ctx.fillText(text, x, y);
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
}

async function main() {
  mkdirSync(TMP, { recursive: true });
  mkdirSync(OUT_DIR, { recursive: true });
  const poster = await loadImage(CFG.poster);
  const bg = await loadImage(CFG.bg);
  // poster is 1080 wide; place at top, scaled to width
  const pAspect = poster.height / poster.width; // ~0.787
  const posterDrawH = W * pAspect; // ~850

  // Pre-feather the sharp poster: draw it, then erase the bottom strip with a
  // vertical alpha gradient so it melts into the blurred bg — one continuous image.
  const FEATHER = 220;
  const pf = createCanvas(W, Math.ceil(posterDrawH));
  const pfx = pf.getContext('2d');
  pfx.drawImage(poster, 0, 0, W, posterDrawH);
  pfx.globalCompositeOperation = 'destination-out';
  const fade = pfx.createLinearGradient(0, posterDrawH - FEATHER, 0, posterDrawH);
  fade.addColorStop(0, 'rgba(0,0,0,0)'); fade.addColorStop(1, 'rgba(0,0,0,1)');
  pfx.fillStyle = fade; pfx.fillRect(0, posterDrawH - FEATHER, W, FEATHER);
  pfx.globalCompositeOperation = 'source-over';

  for (let f = 0; f < FRAMES; f++) {
    const t = f / FPS;
    const c = createCanvas(W, H);
    const ctx = c.getContext('2d');

    const sh = shake(t);
    ctx.save();
    // overscan + shake so the frame edges never show
    ctx.translate(W / 2 + sh.dx, H / 2 + sh.dy);
    ctx.rotate(sh.rot);
    const over = 1.06;
    ctx.scale(over, over);
    ctx.translate(-W / 2, -H / 2);

    // shared slow zoom keeps bg + poster moving together (continuous)
    const kb = 1.0 + easeOut(t / SECONDS) * 0.05;

    // --- blurred full-frame background (continuation of the poster) ---
    drawCoverTop(ctx, bg, 0, 0, W, H, kb);

    // legibility: darken the lower half where the text sits
    const dark = ctx.createLinearGradient(0, H * 0.42, 0, H);
    dark.addColorStop(0, 'rgba(8,10,14,0)');
    dark.addColorStop(0.55, 'rgba(8,10,14,0.45)');
    dark.addColorStop(1, 'rgba(8,10,14,0.72)');
    ctx.fillStyle = dark; ctx.fillRect(0, H * 0.42, W, H * 0.58);

    // --- sharp poster on top, feathered into the bg ---
    const drawW = W * kb, drawH = posterDrawH * kb;
    ctx.drawImage(pf, (W - drawW) / 2, 0, drawW, drawH);

    // flag-gradient accent rule under the poster art
    const ruleY = posterDrawH + 26;
    const rw = 240;
    const rg = ctx.createLinearGradient((W - rw) / 2, 0, (W + rw) / 2, 0);
    for (const [s, col] of FLAG_STOPS) rg.addColorStop(s, col);
    ctx.fillStyle = rg; ctx.fillRect((W - rw) / 2, ruleY, rw, 9);

    // --- lower details ---
    const baseY = posterDrawH + 130;

    // kicker chip (Mexico green, white text)
    const eK = bounce(t, 0.25, 0.4);
    if (eK.alpha > 0) {
      ctx.save();
      ctx.globalAlpha = eK.alpha;
      const chipW = 420, chipH = 84, chipX = W / 2, chipY = baseY;
      ctx.translate(chipX, chipY); ctx.scale(eK.scale, eK.scale);
      ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
      roundRect(ctx, -chipW / 2, -chipH / 2, chipW, chipH, chipH / 2);
      ctx.fillStyle = MX_GREEN; ctx.fill();
      ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      drawText(ctx, CFG.kicker, 0, 2, `800 48px "${HEAD}"`, WHITE);
      ctx.restore();
    }

    // big headline: TODAY (white, red stroke)
    const eT = bounce(t, 0.55, 0.45);
    if (eT.alpha > 0) {
      ctx.save(); ctx.globalAlpha = eT.alpha;
      ctx.translate(W / 2, baseY + 175); ctx.scale(eT.scale, eT.scale);
      drawText(ctx, CFG.bigTop, 0, 0, `800 170px "${HEAD}"`, WHITE, { stroke: MX_RED, strokeW: 10, shadow: 26 });
      ctx.restore();
    }

    // big time: 6:00 PM (flag gradient: green→white→red→blue)
    const eTime = bounce(t, 0.78, 0.45);
    if (eTime.alpha > 0) {
      ctx.save(); ctx.globalAlpha = eTime.alpha;
      ctx.translate(W / 2, baseY + 360); ctx.scale(eTime.scale, eTime.scale);
      drawText(ctx, CFG.bigTime, 0, 0, `800 200px "${HEAD}"`, 'FLAG', { stroke: '#0b0b0d', strokeW: 13, shadow: 30 });
      ctx.restore();
    }

    // venue line (white, dark stroke)
    const eV = bounce(t, 1.05, 0.45);
    if (eV.alpha > 0) {
      ctx.save(); ctx.globalAlpha = eV.alpha;
      ctx.translate(W / 2, baseY + 510); ctx.scale(eV.scale, eV.scale);
      drawText(ctx, CFG.venue, 0, 0, `800 64px "${HEAD}"`, WHITE, { stroke: '#0b0b0d', strokeW: 7, shadow: 18 });
      ctx.restore();
    }

    // footer (flag gradient)
    const eF = bounce(t, 1.45, 0.4);
    if (eF.alpha > 0) {
      ctx.save(); ctx.globalAlpha = eF.alpha;
      drawText(ctx, CFG.footer, W / 2, baseY + 600, `600 40px "${HEAD}"`, 'FLAG', { shadow: 10 });
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
