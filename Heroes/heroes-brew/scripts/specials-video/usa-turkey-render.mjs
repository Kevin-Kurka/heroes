/**
 * USA v TÜRKİYE watch-party hype reel (9:16) for American Heroes & Brew.
 *
 * Top: the Team-USA poster art. Bottom: dark panel whose BOLD details EXPLODE into
 * frame (pop-and-settle bounce) while the whole frame shakes; red/white/blue
 * FIREWORKS burst across the sky on the audio slams, over a layered crowd-cheer bed
 * with booms on the big slams. Drives people to Heroes TONIGHT at 7:00 PM.
 *
 * Self-contained: derives its poster + blurred background from the source webp via
 * ffmpeg, so the only input is public/promos-video/_source/new/Team-USA.webp.
 *
 * Output: public/promos-video/AHB-watchparty_usa-turkey.mp4
 * Run:    node scripts/specials-video/usa-turkey-render.mjs
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
const SRC = join(OUT_DIR, '_source', 'new', 'usa-turkey-hero.webp');
const ASSET = join(HERE, '_usa');
const TMP = join(HERE, '.tmp-usa');

for (const p of ['/System/Library/Fonts/Avenir Next Condensed.ttc', '/System/Library/Fonts/Avenir Next.ttc']) {
  try { GlobalFonts.registerFromPath(p); } catch { /* fall back */ }
}
const HEAD = GlobalFonts.families.some((f) => /Avenir Next Condensed/.test(f.family))
  ? 'Avenir Next Condensed'
  : (GlobalFonts.families.some((f) => /Avenir Next/.test(f.family)) ? 'Avenir Next' : 'sans-serif');

const W = 1080, H = 1920, FPS = 30, SECONDS = 7;
const FRAMES = Math.round(FPS * SECONDS);

// Flag palette — USA (navy/white/red, left) + Türkiye (red/white, right).
const US_NAVY = '#0a3161';
const US_RED = '#b31942';
const TR_RED = '#e30a17';
const WHITE = '#ffffff';
// left→right flag gradient stops used across the big text + accent rule
const FLAG_STOPS = [[0, US_NAVY], [0.32, WHITE], [0.62, US_RED], [1, TR_RED]];
// gold + saturated red/blue read against the bright poster; white kept rare (it vanishes on light bg)
const FW_COLORS = [[255, 190, 45], [227, 10, 23], [40, 110, 235], [255, 190, 45], [255, 255, 255]];

const CFG = {
  key: 'AHB-watchparty_usa-turkey',
  kicker: 'WATCH IT LIVE',
  matchup: 'USA  v  TÜRKİYE',
  bigTop: 'TONIGHT',
  bigTime: '7:00 PM',
  venue: 'AT AMERICAN HEROES & BREW',
  footer: 'Carlsbad Village  ·  @americanheroesandbrew',
};

// easing
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const easeOut = (t) => 1 - Math.pow(1 - clamp01(t), 3);
const lerp = (a, b, t) => a + (b - a) * t;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

// element is FULLY VISIBLE from frame 0 (alpha 1, scale 1) so the first frame is a
// complete poster — no blank intro that reads as unfinished on Instagram. At `start`
// it does a quick pop-and-settle bounce for emphasis (timed to the shake + audio hits).
function bounce(t, start, dur = 0.42) {
  if (t < start) return { alpha: 1, scale: 1 };
  const p = clamp01((t - start) / dur);
  const pulse = Math.sin(p * Math.PI) * (1 - p) * 0.22; // peak ~+16%, settles to 1
  return { alpha: 1, scale: 1 + pulse };
}

// camera shake — strong impulse at each slam, decaying, plus subtle idle wobble
const SLAMS = [0.0, 0.5, 0.8, 1.1, 1.45];
function shake(t) {
  let amp = 4; // idle wobble
  for (const s of SLAMS) {
    if (t >= s) amp += 24 * Math.exp(-(t - s) * 9);
  }
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

// --- fireworks ----------------------------------------------------------------
// Deterministic shells generated once (each frame renders independently, so all
// randomness is seeded). A shell launches a streak, then bursts into gravity-driven
// sparks that fade over their life. Bursts are timed to the audio booms.
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const GRAV = 540; // px/s^2

function buildFireworks() {
  const rnd = mulberry32(0xC0FFEE);
  const bursts = [0.5, 0.8, 1.1, 1.9, 2.6, 3.4, 4.2, 5.0, 5.7, 6.2];
  const shells = [];
  for (const tb of bursts) {
    const bx = lerp(140, W - 140, rnd());
    const by = lerp(470, 1000, rnd());          // darker transition band + over the text → visible
    const color = FW_COLORS[Math.floor(rnd() * FW_COLORS.length)];
    const life = lerp(1.2, 1.8, rnd());
    const n = 40 + Math.floor(rnd() * 16);
    const launchY = H * 0.74;                    // streak rises from lower panel
    const parts = [];
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + rnd() * 0.16;
      const sp = lerp(340, 620, rnd());
      parts.push({ vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, r: lerp(3.0, 5.6, rnd()) });
    }
    shells.push({ tb, bx, by, color, life, parts, launchY });
  }
  return shells;
}

function drawFireworks(ctx, shells, t) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const s of shells) {
    const dt = t - s.tb;
    const launchLead = 0.34;
    // rising launch streak before the burst
    if (dt < 0 && dt > -launchLead) {
      const p = 1 + dt / launchLead; // 0→1 rising
      const y = lerp(s.launchY, s.by, easeOut(p));
      const [r, g, b] = s.color;
      ctx.globalAlpha = 0.8 * p;
      const gr = ctx.createRadialGradient(s.bx, y, 0, s.bx, y, 10);
      gr.addColorStop(0, `rgba(${r},${g},${b},1)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(s.bx, y, 10, 0, Math.PI * 2); ctx.fill();
      continue;
    }
    if (dt < 0 || dt > s.life) continue;
    const lifeFrac = dt / s.life;
    const [r, g, b] = s.color;
    // bright flash at the instant of burst
    if (dt < 0.08) {
      ctx.globalAlpha = (1 - dt / 0.08) * 0.9;
      const fr = ctx.createRadialGradient(s.bx, s.by, 0, s.bx, s.by, 90);
      fr.addColorStop(0, 'rgba(255,255,255,0.95)'); fr.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = fr; ctx.beginPath(); ctx.arc(s.bx, s.by, 90, 0, Math.PI * 2); ctx.fill();
    }
    const alpha = Math.pow(1 - lifeFrac, 1.5);
    for (const p of s.parts) {
      const x = s.bx + p.vx * dt;
      const y = s.by + p.vy * dt + 0.5 * GRAV * dt * dt;
      const rad = p.r * (1 - lifeFrac * 0.5);
      ctx.globalAlpha = Math.min(1, alpha * 1.25);
      const gr = ctx.createRadialGradient(x, y, 0, x, y, rad * 3.0);
      gr.addColorStop(0, `rgba(255,255,255,${0.9 * alpha})`);
      gr.addColorStop(0.3, `rgba(${r},${g},${b},0.95)`);
      gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, rad * 3.0, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

function prepAssets() {
  mkdirSync(ASSET, { recursive: true });
  const poster = join(ASSET, 'poster.png');
  const bg = join(ASSET, 'bg-blur.jpg');
  // poster (the sharp hero): clip the SIDES of the 1920x1080 source to the tightest box
  // that still holds all three players, so it runs as large as possible full-bleed across
  // the top. crop=W:H:x:y — keep x 90..1830 (the player span), full height.
  execFileSync('ffmpeg', ['-y', '-i', SRC, '-vf', 'crop=1740:1080:90:0,scale=1080:-2', poster], { stdio: ['ignore', 'ignore', 'inherit'] });
  // blurred full-frame bg from the UNCROPPED shot (carries the flag/skyline colour down the
  // whole frame so it reads full-screen), darkened for legibility.
  execFileSync('ffmpeg', ['-y', '-i', SRC, '-vf',
    'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=42:2,eq=brightness=-0.06:saturation=1.05',
    bg], { stdio: ['ignore', 'ignore', 'inherit'] });
  return { poster, bg };
}

async function main() {
  mkdirSync(TMP, { recursive: true });
  mkdirSync(OUT_DIR, { recursive: true });
  const { poster: posterPath, bg: bgPath } = prepAssets();
  const poster = await loadImage(posterPath);
  const bg = await loadImage(bgPath);
  const shells = buildFireworks();

  const pAspect = poster.height / poster.width;
  const posterDrawH = W * pAspect; // ~608

  // Pre-feather the sharp poster so it melts into the blurred bg as one image.
  const FEATHER = 200;
  const pf = createCanvas(W, Math.ceil(posterDrawH));
  const pfx = pf.getContext('2d');
  pfx.drawImage(poster, 0, 0, W, posterDrawH);
  pfx.globalCompositeOperation = 'destination-out';
  const fade = pfx.createLinearGradient(0, posterDrawH - FEATHER, 0, posterDrawH);
  fade.addColorStop(0, 'rgba(0,0,0,0)'); fade.addColorStop(1, 'rgba(0,0,0,1)');
  pfx.fillStyle = fade; pfx.fillRect(0, posterDrawH - FEATHER, W, FEATHER);
  pfx.globalCompositeOperation = 'source-over';

  // centre the condensed copy block in the band below the full-bleed hero
  const baseY = posterDrawH + Math.max(150, (H - posterDrawH - 690) / 2);

  for (let f = 0; f < FRAMES; f++) {
    const t = f / FPS;
    const c = createCanvas(W, H);
    const ctx = c.getContext('2d');

    const sh = shake(t);
    ctx.save();
    ctx.translate(W / 2 + sh.dx, H / 2 + sh.dy);
    ctx.rotate(sh.rot);
    const over = 1.06;
    ctx.scale(over, over);
    ctx.translate(-W / 2, -H / 2);

    const kb = 1.0 + easeOut(t / SECONDS) * 0.05;

    // blurred full-frame background (continuation of the poster)
    drawCoverTop(ctx, bg, 0, 0, W, H, kb);

    // darken lower half where the text sits
    const dark = ctx.createLinearGradient(0, H * 0.40, 0, H);
    dark.addColorStop(0, 'rgba(8,10,14,0)');
    dark.addColorStop(0.5, 'rgba(8,10,14,0.5)');
    dark.addColorStop(1, 'rgba(8,10,14,0.78)');
    ctx.fillStyle = dark; ctx.fillRect(0, H * 0.40, W, H * 0.60);

    // sharp poster on top, feathered into the bg
    const drawW = W * kb, drawH = posterDrawH * kb;
    ctx.drawImage(pf, (W - drawW) / 2, 0, drawW, drawH);

    // FIREWORKS across the sky (over the poster, behind the lower text)
    drawFireworks(ctx, shells, t);

    // flag-gradient accent rule under the poster art
    const ruleY = posterDrawH + 24;
    const rw = 240;
    const rg = ctx.createLinearGradient((W - rw) / 2, 0, (W + rw) / 2, 0);
    for (const [s, col] of FLAG_STOPS) rg.addColorStop(s, col);
    ctx.fillStyle = rg; ctx.fillRect((W - rw) / 2, ruleY, rw, 9);

    // kicker chip (navy, white text)
    const eK = bounce(t, 0.25, 0.4);
    {
      ctx.save(); ctx.globalAlpha = eK.alpha;
      const chipW = 440, chipH = 84, chipY = baseY;
      ctx.translate(W / 2, chipY); ctx.scale(eK.scale, eK.scale);
      ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
      roundRect(ctx, -chipW / 2, -chipH / 2, chipW, chipH, chipH / 2);
      ctx.fillStyle = US_NAVY; ctx.fill();
      ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      drawText(ctx, CFG.kicker, 0, 2, `800 48px "${HEAD}"`, WHITE);
      ctx.restore();
    }

    // matchup line: USA v TÜRKİYE (flag gradient)
    const eM = bounce(t, 0.5, 0.45);
    {
      ctx.save(); ctx.globalAlpha = eM.alpha;
      ctx.translate(W / 2, baseY + 120); ctx.scale(eM.scale, eM.scale);
      drawText(ctx, CFG.matchup, 0, 0, `800 80px "${HEAD}"`, 'FLAG', { stroke: '#0b0b0d', strokeW: 8, shadow: 20 });
      ctx.restore();
    }

    // big headline: TONIGHT (white, red stroke)
    const eT = bounce(t, 0.8, 0.45);
    {
      ctx.save(); ctx.globalAlpha = eT.alpha;
      ctx.translate(W / 2, baseY + 268); ctx.scale(eT.scale, eT.scale);
      drawText(ctx, CFG.bigTop, 0, 0, `800 138px "${HEAD}"`, WHITE, { stroke: TR_RED, strokeW: 9, shadow: 24 });
      ctx.restore();
    }

    // big time: 7:00 PM (flag gradient)
    const eTime = bounce(t, 1.1, 0.45);
    {
      ctx.save(); ctx.globalAlpha = eTime.alpha;
      ctx.translate(W / 2, baseY + 448); ctx.scale(eTime.scale, eTime.scale);
      drawText(ctx, CFG.bigTime, 0, 0, `800 180px "${HEAD}"`, 'FLAG', { stroke: '#0b0b0d', strokeW: 12, shadow: 28 });
      ctx.restore();
    }

    // venue line (white, dark stroke)
    const eV = bounce(t, 1.4, 0.45);
    {
      ctx.save(); ctx.globalAlpha = eV.alpha;
      ctx.translate(W / 2, baseY + 590); ctx.scale(eV.scale, eV.scale);
      drawText(ctx, CFG.venue, 0, 0, `800 56px "${HEAD}"`, WHITE, { stroke: '#0b0b0d', strokeW: 7, shadow: 16 });
      ctx.restore();
    }

    // footer (flag gradient)
    const eF = bounce(t, 1.7, 0.4);
    {
      ctx.save(); ctx.globalAlpha = eF.alpha;
      drawText(ctx, CFG.footer, W / 2, baseY + 668, `600 38px "${HEAD}"`, 'FLAG', { shadow: 10 });
      ctx.restore();
    }

    ctx.restore(); // end overscan/shake

    writeFileSync(join(TMP, `f${String(f).padStart(4, '0')}.png`), c.toBuffer('image/png'));
    if (f % 30 === 0) process.stdout.write(`\rframe ${f}/${FRAMES}`);
  }
  process.stdout.write(`\rframes ${FRAMES}/${FRAMES} done\n`);

  const out = join(OUT_DIR, `${CFG.key}.mp4`);
  const poster1 = join(OUT_DIR, `${CFG.key}-poster.jpg`); // still for Google/GBP (image-only)
  const cheer = join(SFX, 'cheer.mp3');
  const boom = join(SFX, 'boom.mp3');

  execFileSync('ffmpeg', [
    '-y',
    '-framerate', String(FPS), '-i', join(TMP, 'f%04d.png'),
    '-i', cheer,
    '-i', boom,
    '-filter_complex',
    // crowd bed full-length, fade tail; booms on the big slams + fireworks finale
    '[1:a]volume=1.0,afade=t=in:st=0:d=0.2,afade=t=out:st=6.2:d=0.8[bed];' +
    '[2:a]adelay=800|800,volume=1.1[b1];' +
    '[2:a]adelay=1100|1100,volume=1.1[b2];' +
    '[2:a]adelay=2600|2600,volume=0.7[b3];' +
    '[2:a]adelay=4200|4200,volume=0.7[b4];' +
    '[2:a]adelay=5700|5700,volume=0.8[b5];' +
    '[bed][b1][b2][b3][b4][b5]amix=inputs=6:duration=first:dropout_transition=0,volume=1.5[a]',
    '-map', '0:v', '-map', '[a]',
    '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-c:a', 'aac', '-b:a', '160k', '-t', String(SECONDS), '-movflags', '+faststart',
    out,
  ], { stdio: ['ignore', 'ignore', 'inherit'] });

  // export a still poster (frame at the 7:00 PM slam) for the Google/GBP image post
  const stillFrame = Math.round(1.6 * FPS);
  execFileSync('ffmpeg', ['-y', '-i', join(TMP, `f${String(stillFrame).padStart(4, '0')}.png`),
    '-q:v', '2', poster1], { stdio: ['ignore', 'ignore', 'inherit'] });

  rmSync(TMP, { recursive: true, force: true });
  console.log('rendered', out);
  console.log('poster', poster1);
}

main().catch((e) => { console.error(e); process.exit(1); });
