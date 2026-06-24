/**
 * Fantasy Football League launch REEL — full-bleed cinematic montage over
 * user-supplied NFL photos (scripts/specials-video/_nfl/*.jpg) with the
 * announcement text overlaid.
 *
 * Look: each photo FILLS the whole frame and slowly pans + zooms (Ken-Burns).
 * A per-image focal point keeps the main subject (the players' faces) in frame
 * while it moves. Photos cross-dissolve into each other. Dark top/bottom scrims
 * + text shadows keep the overlaid type crisp and legible on top of the moving
 * photo. Kinetic typography builds the announcement: headline slam, "$100 TO THE
 * CHAMP" pill with a shine sweep, rotating sub-lines, final SIGN-UP card.
 *
 * Audio: a current, popular ROYALTY-FREE track from Pixabay ("Energetic Action
 * Sport", Pixabay Content License — commercial OK, no attribution; see
 * audio/energetic-action-sport.LICENSE.txt), windowed to its full-energy section,
 * with crowd-cheer + boom SFX accents for game-day feel. No generated/synth music.
 *
 * Outputs 9:16 (Story/Reel) + 4:5 (feed) into public/promos-video/:
 *   fantasy-launch-9x16.mp4 , fantasy-launch-4x5.mp4
 * Run: node scripts/specials-video/fantasy-launch-video.mjs
 */
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const HERE = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(HERE, '..', '..', 'public');
const OUT_DIR = join(PUBLIC, 'promos-video');
const AUDIO = join(OUT_DIR, 'audio');
const NFL = join(HERE, '_nfl');
const TMP = join(HERE, '.tmp-fantasy-vid');

for (const p of ['/System/Library/Fonts/Avenir Next Condensed.ttc', '/System/Library/Fonts/Avenir Next.ttc']) {
  try { GlobalFonts.registerFromPath(p); } catch { /* fall back */ }
}
const HEAD = GlobalFonts.families.some((f) => /Avenir Next Condensed/.test(f.family))
  ? 'Avenir Next Condensed'
  : (GlobalFonts.families.some((f) => /Avenir Next/.test(f.family)) ? 'Avenir Next' : 'sans-serif');

// American Heroes & Brew badge palette — red / white / blue only (no amber).
const RED = '#e2273a';
const BLUE = '#2851a7';
const NAVY = '#0c1f4d';   // dark outline for white fills
const WHITE = '#ffffff';
const FPS = 30, DUR = 9.0, FRAMES = Math.round(FPS * DUR);
const DISS = 0.4; // quick cross-dissolve between images

// Lead with the cleanest center-subject action shots; keep faces framed via FOCAL.
const ORDER = ['josh_allen', 'cmc', 'chargers_lineup', 'raiders', 'chargers_preview', 'josh_allen2'];
const SEG = DUR / ORDER.length;
// Normalized (x,y) focal point = where the subject's face sits in each source photo.
// The frame is sized + positioned so this point lands at the on-screen safe spot
// (TARGET_X, TARGET_Y) — below the badge, above the headline — never obscured.
const FOCAL = {
  josh_allen:       { fx: 0.42, fy: 0.15 },
  cmc:              { fx: 0.42, fy: 0.20 },
  chargers_lineup:  { fx: 0.50, fy: 0.40 },
  raiders:          { fx: 0.45, fy: 0.25 },
  chargers_preview: { fx: 0.62, fy: 0.30 },
  josh_allen2:      { fx: 0.50, fy: 0.30 },
};
const TARGET_X = 0.5, TARGET_Y = 0.36; // on-screen home for the face (center band)
const ZMIN = 1.06, ZMAX = 1.30;
// zoom needed to bring this focal point to (TARGET_X, TARGET_Y) without revealing edges
function focalZoom(fy) {
  return clamp(Math.max(TARGET_Y / fy, (1 - TARGET_Y) / (1 - fy)), ZMIN, ZMAX);
}

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - Math.pow(1 - clamp01(t), 3);
const easeInOut = (t) => { t = clamp01(t); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const backOut = (t) => { t = clamp01(t); const c1 = 1.7, c3 = c1 + 1, u = t - 1; return 1 + c3 * u * u * u + c1 * u * u; };

function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function fitFont(ctx, text, weight, px, maxW) {
  let s = px;
  for (;;) { ctx.font = `${weight} ${s}px "${HEAD}"`; if (ctx.measureText(text).width <= maxW || s <= 12) break; s -= 2; }
  return s;
}
const shadowOff = (ctx) => { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; };
// Crisp outlined text: contrast stroke + drop shadow, then a clean fill on top.
function stroked(ctx, text, x, y, font, fill, stroke, lineW, blur = 16) {
  ctx.font = font;
  ctx.lineJoin = 'round'; ctx.miterLimit = 2;
  ctx.lineWidth = lineW; ctx.strokeStyle = stroke;
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = blur; ctx.shadowOffsetY = blur * 0.32;
  ctx.strokeText(text, x, y);
  shadowOff(ctx);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

// Fireworks that burst around the $100 pill when it lands. Particles are generated
// once with a seeded PRNG so the 9:16 and 4:5 renders match exactly.
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const FW_BURSTS = (() => {
  const rnd = mulberry32(20260626);
  const cols = ['#ffffff', RED, BLUE];
  const defs = [
    { t0: 1.55, fx: 0.26, fy: 0.66 },
    { t0: 1.63, fx: 0.74, fy: 0.66 },
    { t0: 1.58, fx: 0.50, fy: 0.585 },
    { t0: 2.15, fx: 0.38, fy: 0.62 },
    { t0: 2.22, fx: 0.62, fy: 0.62 },
  ];
  return defs.map((d) => {
    const n = 26, parts = [];
    for (let i = 0; i < n; i++) parts.push({ ang: (i / n) * Math.PI * 2 + rnd() * 0.18, spd: 0.55 + rnd() * 0.6, col: cols[i % 3], sz: 1 + rnd() * 1.7 });
    return { ...d, parts, life: 0.9 };
  });
})();
function drawFireworks(ctx, sec, W, H) {
  const px = W / 1080;
  for (const b of FW_BURSTS) {
    const age = sec - b.t0;
    if (age < 0 || age > b.life) continue;
    const cx = b.fx * W, cy = b.fy * H, prog = age / b.life, reach = Math.min(W, H) * 0.17;
    ctx.save();
    if (age < 0.12) { const fa = 1 - age / 0.12; ctx.globalAlpha = 0.55 * fa; ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 24 * px; ctx.beginPath(); ctx.arc(cx, cy, (reach * 0.35 * fa + 8 * px), 0, 7); ctx.fill(); }
    for (const p of b.parts) {
      const d = reach * p.spd * easeOut(prog);
      const x = cx + Math.cos(p.ang) * d;
      const y = cy + Math.sin(p.ang) * d + reach * prog * prog * 0.55;
      ctx.globalAlpha = (1 - prog) * (1 - prog);
      ctx.fillStyle = p.col; ctx.shadowColor = p.col; ctx.shadowBlur = 12 * px;
      ctx.beginPath(); ctx.arc(x, y, Math.max(0.5, p.sz * (1.5 - prog) * 2.4 * px), 0, 7); ctx.fill();
    }
    ctx.restore();
  }
  shadowOff(ctx);
}

async function loadAssets() {
  const IMG = [], BLUR = [];
  for (const key of ORDER) {
    const p = join(NFL, `${key}.jpg`);
    if (!existsSync(p)) throw new Error(`missing ${p}`);
    IMG.push(await loadImage(p));
    // soft-focus variant for the "comes into focus" entrance
    const b = await sharp(p).blur(22).jpeg({ quality: 82 }).toBuffer();
    BLUR.push(await loadImage(b));
  }
  const badge = existsSync(join(PUBLIC, 'badge-clean.png')) ? await loadImage(join(PUBLIC, 'badge-clean.png')) : null;
  return { IMG, BLUR, badge };
}

const FOCUS_T = 0.45; // seconds for an image to settle from soft→sharp

// Full-bleed "focus pull": each photo enters slightly soft + zoomed, then settles
// SHARP and steady on the subject (focal point kept centered). After settling it
// holds with a very gentle single-direction zoom — no back-and-forth panning.
// Position the photo so its focal point (fx,fy) lands at (TARGET_X,TARGET_Y) on
// screen, clamped so no frame edge is ever revealed.
function drawCoverFocal(ctx, img, W, H, scale, fx, fy, alpha) {
  const ir = img.width / img.height, cr = W / H; let w, h;
  if (ir > cr) { h = H * scale; w = h * ir; } else { w = W * scale; h = w / ir; }
  const left = clamp(W * TARGET_X - fx * w, W - w, 0);
  const top = clamp(H * TARGET_Y - fy * h, H - h, 0);
  ctx.save(); ctx.globalAlpha = alpha; ctx.drawImage(img, left, top, w, h); ctx.restore();
}
function drawImageLayer(ctx, A, idx, localTime, alpha, W, H) {
  if (alpha <= 0) return;
  const f = FOCAL[ORDER[idx]] ?? { fx: 0.5, fy: 0.32 };
  const Z = focalZoom(f.fy);
  const fp = clamp01(localTime / FOCUS_T);              // 0→1 focus settle
  const focus = easeOut(fp);
  // settle 1.07→1.0 during focus, then a gentle 1.0→1.03 push-in; keeps the face anchored
  const settle = lerp(1.07, 1.0, focus);
  const hold = lerp(1.0, 1.03, clamp01((localTime - FOCUS_T) / (SEG - FOCUS_T)));
  const scale = Z * (localTime < FOCUS_T ? settle : hold);
  drawCoverFocal(ctx, A.IMG[idx], W, H, scale, f.fx, f.fy, alpha);
  if (fp < 1 && A.BLUR[idx]) drawCoverFocal(ctx, A.BLUR[idx], W, H, scale, f.fx, f.fy, alpha * (1 - focus));
}

function drawScene(ctx, sec, A, W, H) {
  const i = Math.min(ORDER.length - 1, Math.floor(sec / SEG));
  const local = sec - i * SEG;
  drawImageLayer(ctx, A, i, local, 1, W, H);
  const into = SEG - local;
  if (i < ORDER.length - 1 && into < DISS) {
    drawImageLayer(ctx, A, i + 1, sec - (i + 1) * SEG, smooth(1 - into / DISS), W, H);
  }
  // subtle overall darken so type pops anywhere
  ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.fillRect(0, 0, W, H);
  // top scrim (badge/kicker)
  const tg = ctx.createLinearGradient(0, 0, 0, H * 0.30);
  tg.addColorStop(0, 'rgba(0,0,0,0.62)'); tg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = tg; ctx.fillRect(0, 0, W, H * 0.30);
  // strong bottom scrim (headline / pill / sub / url)
  const bgg = ctx.createLinearGradient(0, H * 0.40, 0, H);
  bgg.addColorStop(0, 'rgba(0,0,0,0)'); bgg.addColorStop(0.45, 'rgba(0,0,0,0.55)'); bgg.addColorStop(1, 'rgba(0,0,0,0.93)');
  ctx.fillStyle = bgg; ctx.fillRect(0, H * 0.40, W, H * 0.60);
  // fireworks burst around the $100 pill (drawn behind the text layer)
  drawFireworks(ctx, sec, W, H);
}

function popText(ctx, fn, cx, cy, td) {
  if (td < 0) return;
  // snappy: quick overshoot scale + fast fade + a short slide-up
  const e = backOut(clamp01(td / 0.26)), a = clamp01(td / 0.09);
  const slide = (1 - easeOut(clamp01(td / 0.26))) * 22;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(0, slide);
  ctx.translate(cx, cy); ctx.scale(e, e); ctx.translate(-cx, -cy); fn(); ctx.restore();
}
function fadeWindow(sec, start, end) {
  if (sec < start || sec > end) return 0;
  return Math.min(smooth((sec - start) / 0.35), smooth((end - sec) / 0.35));
}

function drawText(ctx, sec, A, W, H) {
  const cx = W / 2;
  const driftX = Math.sin(sec * 0.6) * (W * 0.006);
  const bob = Math.sin(sec * 0.5) * (H * 0.003);
  ctx.save();
  ctx.translate(driftX, bob);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // top-LEFT logo lockup (badge + wordmark) — keeps the whole center clear for the
  // player so faces never sit behind a centered logo.
  const introT = sec - 0.12;
  if (introT >= -0.05) {
    const la = clamp01(introT / 0.3);
    ctx.save();
    ctx.globalAlpha = la;
    const r = H * 0.044, bx = W * 0.088, by = H * 0.072;
    if (A.badge) {
      ctx.fillStyle = 'rgba(255,255,255,0.94)';
      ctx.beginPath(); ctx.arc(bx, by, r, 0, 7); ctx.fill();
      ctx.drawImage(A.badge, bx - r, by - r, r * 2, r * 2);
    }
    ctx.textAlign = 'left';
    const wx = bx + r + W * 0.022;
    const s1 = fitFont(ctx, 'AMERICAN HEROES & BREW', 800, W * 0.032, W * 0.6);
    stroked(ctx, 'AMERICAN HEROES & BREW', wx, by - H * 0.013, `800 ${s1}px "${HEAD}"`, WHITE, NAVY, Math.max(3, s1 * 0.06), 7);
    const s2 = fitFont(ctx, 'CARLSBAD VILLAGE', 700, W * 0.027, W * 0.6);
    stroked(ctx, 'CARLSBAD VILLAGE', wx, by + H * 0.02, `700 ${s2}px "${HEAD}"`, RED, WHITE, Math.max(2, s2 * 0.06), 6);
    ctx.restore();
    ctx.textAlign = 'center';
  }

  // headline slam — FANTASY FOOTBALL (white / navy outline), LEAGUE (red / white outline)
  const hl = H * 0.58, hl2 = H * 0.635;
  popText(ctx, () => {
    const s = fitFont(ctx, 'FANTASY FOOTBALL', 800, W * 0.096, W * 0.93);
    stroked(ctx, 'FANTASY FOOTBALL', cx, hl, `800 ${s}px "${HEAD}"`, WHITE, NAVY, Math.max(7, s * 0.11), 26);
  }, cx, hl, sec - 0.28);
  popText(ctx, () => {
    const s = fitFont(ctx, 'LEAGUE', 800, W * 0.096, W * 0.93);
    stroked(ctx, 'LEAGUE', cx, hl2, `800 ${s}px "${HEAD}"`, RED, WHITE, Math.max(7, s * 0.11), 26);
  }, cx, hl2, sec - 0.4);

  // $100 pill — blue fill, white border + white text, drop shadow + shine
  const pillY = H * 0.715, pillT = sec - 1.55;
  popText(ctx, () => {
    const fs = W * 0.05;
    ctx.font = `800 ${fs}px "${HEAD}"`;
    const txt = '$100 TO THE CHAMP';
    const padX = fs * 0.62, ph = fs * 1.6, pw = ctx.measureText(txt).width + padX * 2;
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 7;
    ctx.fillStyle = BLUE; roundRect(ctx, cx - pw / 2, pillY - ph / 2, pw, ph, ph / 2); ctx.fill();
    shadowOff(ctx);
    ctx.lineWidth = Math.max(3, fs * 0.09); ctx.strokeStyle = WHITE;
    roundRect(ctx, cx - pw / 2, pillY - ph / 2, pw, ph, ph / 2); ctx.stroke();
    ctx.fillStyle = WHITE; ctx.fillText(txt, cx, pillY + fs * 0.03);
  }, cx, pillY, pillT);
  const shineT = sec - 1.95;
  if (shineT >= 0 && shineT <= 0.4) {
    const sx = lerp(-W * 0.2, W * 1.2, easeOut(shineT / 0.4));
    ctx.save();
    ctx.globalAlpha = 0.55 * (1 - shineT / 0.4);
    const sg = ctx.createLinearGradient(sx - W * 0.08, 0, sx + W * 0.08, 0);
    sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.9)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sg; ctx.fillRect(sx - W * 0.08, pillY - H * 0.035, W * 0.16, H * 0.07);
    ctx.restore();
  }

  // rotating sub-lines (white / navy outline) — faster cadence
  const subY = H * 0.795;
  const lines = [
    ['Draft at the bar  ·  Every game on 16 TVs', 1.0, 3.6],
    ['Free to join  ·  9 open spots per league', 3.6, 6.0],
    ['Bring your crew — or we’ll match you up', 6.0, DUR + 0.2],
  ];
  for (const [txt, s0, s1] of lines) {
    const a = fadeWindow(sec, s0, s1);
    if (a <= 0) continue;
    ctx.globalAlpha = a;
    const s = fitFont(ctx, txt, 600, W * 0.039, W * 0.88);
    stroked(ctx, txt, cx, subY, `600 ${s}px "${HEAD}"`, WHITE, NAVY, Math.max(3, s * 0.07), 9);
    ctx.globalAlpha = 1;
  }

  // SIGN UP NOW flourish (white / red outline) + persistent URL (white / navy outline)
  const ctaT = sec - 6.6;
  if (ctaT >= 0) {
    popText(ctx, () => {
      const s = fitFont(ctx, 'SIGN UP NOW', 800, W * 0.064, W * 0.9);
      stroked(ctx, 'SIGN UP NOW', cx, H * 0.85, `800 ${s}px "${HEAD}"`, WHITE, RED, Math.max(6, s * 0.1), 18);
    }, cx, H * 0.85, ctaT);
  }
  const urlA = clamp01((sec - 1.0) / 0.4);
  if (urlA > 0) {
    ctx.globalAlpha = urlA;
    const s = fitFont(ctx, 'americanheroesandbrew.com/fantasy-football', 700, W * 0.036, W * 0.92);
    stroked(ctx, 'americanheroesandbrew.com/fantasy-football', cx, H * 0.915, `700 ${s}px "${HEAD}"`, WHITE, NAVY, Math.max(3, s * 0.06), 9);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function muxAudio(framesGlob, out) {
  const music = join(AUDIO, 'energetic-action-sport.mp3');
  const cheer = join(AUDIO, 'sfx', 'cheer.mp3');
  const boom = join(AUDIO, 'sfx', 'boom.mp3');
  const MUS_SS = 32; // full-energy window of the track
  const codec = ['-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-c:a', 'aac', '-b:a', '192k', '-t', String(DUR), '-movflags', '+faststart', out];

  if (existsSync(music) && existsSync(cheer) && existsSync(boom)) {
    const fc =
      `[1:a]volume=1.0,atrim=0:${DUR}[m];` +
      `[2:a]volume=0.5,afade=t=in:st=0:d=0.25,afade=t=out:st=2.6:d=1.0,adelay=0|0[ch];` +
      `[3:a]volume=0.85,adelay=280|280[b1];` +
      `[4:a]volume=0.95,adelay=1550|1550[b2];` +
      `[m][ch][b1][b2]amix=inputs=4:duration=first:normalize=0[s];` +
      `[s]loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=out:st=${DUR - 0.6}:d=0.6,aresample=44100[a]`;
    execFileSync('ffmpeg', ['-y', '-framerate', String(FPS), '-i', framesGlob,
      '-ss', String(MUS_SS), '-i', music, '-i', cheer, '-i', boom, '-i', boom,
      '-filter_complex', fc, '-map', '0:v', '-map', '[a]', ...codec],
      { stdio: ['ignore', 'ignore', 'inherit'] });
  } else {
    execFileSync('ffmpeg', ['-y', '-framerate', String(FPS), '-i', framesGlob,
      '-f', 'lavfi', '-t', String(DUR), '-i', 'anullsrc=r=44100:cl=stereo',
      '-map', '0:v', '-map', '1:a', ...codec],
      { stdio: ['ignore', 'ignore', 'inherit'] });
  }
}

async function renderDim(A, W, H, outName) {
  const dir = join(TMP, `${W}x${H}`); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const canvas = createCanvas(W, H); const ctx = canvas.getContext('2d');
  for (let f = 0; f < FRAMES; f++) {
    const sec = f / FPS;
    ctx.clearRect(0, 0, W, H);
    drawScene(ctx, sec, A, W, H);
    drawText(ctx, sec, A, W, H);
    writeFileSync(join(dir, `f-${String(f + 1).padStart(4, '0')}.png`), canvas.toBuffer('image/png'));
  }
  muxAudio(join(dir, 'f-%04d.png'), join(OUT_DIR, outName));
  rmSync(dir, { recursive: true, force: true });
  console.log('rendered', join(OUT_DIR, outName));
}

mkdirSync(TMP, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });
const A = await loadAssets();
await renderDim(A, 1080, 1920, 'fantasy-launch-9x16.mp4');
await renderDim(A, 1080, 1350, 'fantasy-launch-4x5.mp4');
rmSync(TMP, { recursive: true, force: true });
