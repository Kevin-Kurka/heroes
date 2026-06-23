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

const AMBER = '#f59e0b';
const FPS = 30, DUR = 9.0, FRAMES = Math.round(FPS * DUR);
const DISS = 0.55; // cross-dissolve seconds

// Lead with the cleanest center-subject action shots; keep faces framed via FOCAL.
const ORDER = ['josh_allen', 'cmc', 'chargers_lineup', 'raiders', 'chargers_preview', 'josh_allen2'];
const SEG = DUR / ORDER.length;
// normalized horizontal focal point (where the face/subject sits) per image — the
// full-bleed crop biases here so the subject stays centered through the pan.
const FOCAL = { josh_allen: 0.36, cmc: 0.5, chargers_lineup: 0.5, raiders: 0.5, chargers_preview: 0.56, josh_allen2: 0.5 };

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
const shadowOn = (ctx, blur = 10, a = 0.7) => { ctx.shadowColor = `rgba(0,0,0,${a})`; ctx.shadowBlur = blur; ctx.shadowOffsetY = blur * 0.25; };
const shadowOff = (ctx) => { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; };

async function loadAssets() {
  const IMG = [];
  for (const key of ORDER) {
    const p = join(NFL, `${key}.jpg`);
    if (!existsSync(p)) throw new Error(`missing ${p}`);
    IMG.push(await loadImage(p));
  }
  const badge = existsSync(join(PUBLIC, 'badge-clean.png')) ? await loadImage(join(PUBLIC, 'badge-clean.png')) : null;
  return { IMG, badge };
}

// Full-bleed Ken-Burns: photo fills the frame, zooms, and pans gently while the
// focal point (face) is kept toward center. Alternates zoom/pan direction per image.
function drawImageLayer(ctx, A, idx, localTime, alpha, W, H) {
  if (alpha <= 0) return;
  const img = A.IMG[idx];
  const p = clamp01(localTime / SEG);
  const fx = FOCAL[ORDER[idx]] ?? 0.5;
  const dir = idx % 2 === 0 ? 1 : -1;
  const scale = idx % 2 === 0 ? lerp(1.04, 1.16, easeInOut(p)) : lerp(1.16, 1.04, easeInOut(p));

  const ir = img.width / img.height, cr = W / H; let w, h;
  if (ir > cr) { h = H * scale; w = h * ir; } else { w = W * scale; h = w / ir; }
  const overX = w - W, overY = h - H;
  // place focal point near center, then drift horizontally a touch for motion
  let left = W / 2 - fx * w;
  const drift = dir * easeInOut(p) * Math.min(overX * 0.16, W * 0.045);
  left = clamp(left + drift, W - w, 0);
  const top = clamp((H - h) / 2 + Math.sin(p * Math.PI) * Math.min(overY * 0.10, H * 0.02), H - h, 0);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, left, top, w, h);
  ctx.restore();
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
}

function popText(ctx, fn, cx, cy, td) {
  if (td < 0) return;
  const e = backOut(clamp01(td / 0.42)), a = clamp01(td / 0.18);
  ctx.save(); ctx.globalAlpha = a; ctx.translate(cx, cy); ctx.scale(e, e); ctx.translate(-cx, -cy); fn(); ctx.restore();
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

  // badge + kicker
  const introT = sec - 0.25;
  if (A.badge) {
    popText(ctx, () => {
      const r = H * 0.05;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath(); ctx.arc(cx, H * 0.082, r, 0, 7); ctx.fill();
      ctx.drawImage(A.badge, cx - r, H * 0.082 - r, r * 2, r * 2);
    }, cx, H * 0.082, introT);
  }
  if (introT >= -0.05) {
    ctx.globalAlpha = clamp01(introT / 0.4);
    ctx.fillStyle = AMBER;
    fitFont(ctx, 'AMERICAN HEROES & BREW · CARLSBAD VILLAGE', 700, W * 0.03, W * 0.86);
    shadowOn(ctx, 8, 0.7);
    ctx.fillText('AMERICAN HEROES & BREW · CARLSBAD VILLAGE', cx, H * 0.15);
    shadowOff(ctx);
    ctx.globalAlpha = 1;
  }

  // headline slam
  const hl = H * 0.58, hl2 = H * 0.635;
  popText(ctx, () => {
    const s = fitFont(ctx, 'FANTASY FOOTBALL', 800, W * 0.094, W * 0.92);
    ctx.font = `800 ${s}px "${HEAD}"`;
    ctx.fillStyle = '#fff'; shadowOn(ctx, 26, 0.62);
    ctx.fillText('FANTASY FOOTBALL', cx, hl); shadowOff(ctx);
  }, cx, hl, sec - 0.5);
  popText(ctx, () => {
    const s = fitFont(ctx, 'LEAGUE', 800, W * 0.094, W * 0.92);
    ctx.font = `800 ${s}px "${HEAD}"`;
    ctx.fillStyle = AMBER; shadowOn(ctx, 26, 0.62);
    ctx.fillText('LEAGUE', cx, hl2); shadowOff(ctx);
  }, cx, hl2, sec - 0.68);

  // $100 pill + shine
  const pillY = H * 0.715, pillT = sec - 2.4;
  popText(ctx, () => {
    const fs = W * 0.05;
    ctx.font = `800 ${fs}px "${HEAD}"`;
    const txt = '$100 TO THE CHAMP';
    const padX = fs * 0.55, ph = fs * 1.55, pw = ctx.measureText(txt).width + padX * 2;
    shadowOn(ctx, 18, 0.45);
    ctx.fillStyle = AMBER; roundRect(ctx, cx - pw / 2, pillY - ph / 2, pw, ph, ph / 2); ctx.fill();
    shadowOff(ctx);
    ctx.fillStyle = '#19120a'; ctx.fillText(txt, cx, pillY + fs * 0.03);
  }, cx, pillY, pillT);
  const shineT = sec - 2.95;
  if (shineT >= 0 && shineT <= 0.45) {
    const sx = lerp(-W * 0.2, W * 1.2, easeOut(shineT / 0.45));
    ctx.save();
    ctx.globalAlpha = 0.5 * (1 - shineT / 0.45);
    const sg = ctx.createLinearGradient(sx - W * 0.08, 0, sx + W * 0.08, 0);
    sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.85)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sg; ctx.fillRect(sx - W * 0.08, pillY - H * 0.035, W * 0.16, H * 0.07);
    ctx.restore();
  }

  // rotating sub-lines
  const subY = H * 0.795;
  const lines = [
    ['Draft at the bar  ·  Every game on 16 TVs', 1.3, 4.3],
    ['Free to join  ·  9 open spots per league', 4.3, 6.5],
    ['Bring your crew — or we’ll match you up', 6.5, DUR + 0.2],
  ];
  for (const [txt, s0, s1] of lines) {
    const a = fadeWindow(sec, s0, s1);
    if (a <= 0) continue;
    ctx.globalAlpha = a;
    ctx.fillStyle = '#eef0f3';
    fitFont(ctx, txt, 600, W * 0.038, W * 0.88);
    shadowOn(ctx, 8, 0.7);
    ctx.fillText(txt, cx, subY);
    shadowOff(ctx);
    ctx.globalAlpha = 1;
  }

  // SIGN UP NOW flourish + persistent URL
  const ctaT = sec - 7.0;
  if (ctaT >= 0) {
    popText(ctx, () => {
      const s = fitFont(ctx, 'SIGN UP NOW', 800, W * 0.062, W * 0.9);
      ctx.font = `800 ${s}px "${HEAD}"`;
      ctx.fillStyle = '#fff'; shadowOn(ctx, 18, 0.5);
      ctx.fillText('SIGN UP NOW', cx, H * 0.85); shadowOff(ctx);
    }, cx, H * 0.85, ctaT);
  }
  const urlA = clamp01((sec - 1.3) / 0.5);
  if (urlA > 0) {
    ctx.globalAlpha = urlA;
    ctx.fillStyle = AMBER;
    fitFont(ctx, 'americanheroesandbrew.com/fantasy-football', 700, W * 0.036, W * 0.92);
    shadowOn(ctx, 8, 0.7);
    ctx.fillText('americanheroesandbrew.com/fantasy-football', cx, H * 0.915);
    shadowOff(ctx);
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
      `[2:a]volume=0.5,afade=t=in:st=0:d=0.3,afade=t=out:st=3.2:d=1.0,adelay=0|0[ch];` +
      `[3:a]volume=0.8,adelay=500|500[b1];` +
      `[4:a]volume=0.9,adelay=2400|2400[b2];` +
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
