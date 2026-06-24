/**
 * Fantasy Football League launch REEL — "Seahawks win" hype build.
 *
 * A single championship still (scripts/specials-video/_sea/seahawks_win.jpg) that
 * SHAKES with escalating intensity, overlaid with parallax confetti in Seahawks
 * colors. In sequence — each with a confetti burst, an explosion boom, and a jump
 * in shake — the Heroes badge bursts in, then the lines drop in big/bold/slanted
 * (Seahawks-style) and floating:  IT'S FANTASY SEASON → JOIN A HEROES LEAGUE NOW →
 * WIN $100.  Crowd cheering runs underneath the whole thing.
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
const SEA = join(HERE, '_sea', 'seahawks_win.jpg');
const TMP = join(HERE, '.tmp-fantasy-vid');

for (const p of ['/System/Library/Fonts/Avenir Next Condensed.ttc', '/System/Library/Fonts/Avenir Next.ttc']) {
  try { GlobalFonts.registerFromPath(p); } catch { /* fall back */ }
}
const HEAD = GlobalFonts.families.some((f) => /Avenir Next Condensed/.test(f.family))
  ? 'Avenir Next Condensed'
  : (GlobalFonts.families.some((f) => /Avenir Next/.test(f.family)) ? 'Avenir Next' : 'sans-serif');

// Seahawks palette
const NAVY = '#0b294f', NAVY_OUT = '#001129', GREEN = '#69be28', GREY = '#a5acaf', WHITE = '#ffffff';
const CONF = ['#002244', '#69be28', '#a5acaf', '#ffffff', '#3f7fc0'];
const FPS = 30, DUR = 10.0, FRAMES = Math.round(FPS * DUR);
const SLANT = -0.16; // Seahawks forward lean

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - Math.pow(1 - clamp01(t), 3);
const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const backOut = (t) => { t = clamp01(t); const c1 = 1.9, c3 = c1 + 1, u = t - 1; return 1 + c3 * u * u * u + c1 * u * u; };
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function fitFont(ctx, text, weight, px, maxW) { let s = px; for (;;) { ctx.font = `${weight} ${s}px "${HEAD}"`; if (ctx.measureText(text).width <= maxW || s <= 12) break; s -= 2; } return s; }
const shadowOff = (ctx) => { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; };
function stroked(ctx, text, x, y, font, fill, stroke, lineW, blur = 20) {
  ctx.font = font; ctx.lineJoin = 'round'; ctx.miterLimit = 2; ctx.lineWidth = lineW; ctx.strokeStyle = stroke;
  ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = blur; ctx.shadowOffsetY = blur * 0.3;
  ctx.strokeText(text, x, y); shadowOff(ctx); ctx.fillStyle = fill; ctx.fillText(text, x, y);
}

// Sequenced reveals: badge, then the three lines. Each fires a confetti burst, an
// explosion boom (in audio), and a jump in shake.
const EVENTS = [
  { t: 1.0, kind: 'logo', shake: 20, bx: 0.5, by: 0.17, seed: 11 },
  { t: 2.7, kind: 'text', shake: 18, bx: 0.5, by: 0.50, seed: 22, line: 'IT’S FANTASY SEASON', size: 0.086, fill: WHITE, stroke: NAVY_OUT },
  { t: 4.7, kind: 'text', shake: 24, bx: 0.5, by: 0.64, seed: 33, line: 'JOIN A HEROES LEAGUE NOW', size: 0.052, fill: GREEN, stroke: WHITE },
  { t: 6.7, kind: 'text', shake: 30, bx: 0.5, by: 0.785, seed: 44, line: 'WIN $100', size: 0.125, fill: WHITE, stroke: GREEN },
];
const BOOMS = EVENTS.map((e) => e.t);

async function loadAssets() {
  if (!existsSync(SEA)) throw new Error(`missing ${SEA}`);
  const IMG = await loadImage(await sharp(SEA).sharpen({ sigma: 0.8 }).jpeg({ quality: 92 }).toBuffer());
  const badge = existsSync(join(PUBLIC, 'badge-clean.png')) ? await loadImage(join(PUBLIC, 'badge-clean.png')) : null;
  return { IMG, badge };
}

// escalating camera shake + a sharp spike right after each reveal
function shakeAt(sec) {
  let amp = lerp(2.5, 13, clamp01(sec / DUR));
  for (const e of EVENTS) { const a = sec - e.t; if (a >= 0 && a < 0.28) amp = Math.max(amp, lerp(e.shake, amp, a / 0.28)); }
  const x = Math.sin(sec * 38.1) * amp + Math.sin(sec * 24.7) * amp * 0.5;
  const y = Math.cos(sec * 33.3) * amp + Math.sin(sec * 19.9) * amp * 0.5;
  const rot = Math.sin(sec * 28.5) * amp * 0.0011;
  return { x, y, rot };
}

function drawBg(ctx, sec, A, W, H) {
  const sh = shakeAt(sec), px = W / 1080, img = A.IMG;
  const Z = 1.18 * lerp(1.0, 1.05, clamp01(sec / DUR));
  const ir = img.width / img.height, cr = W / H; let w, h;
  if (ir > cr) { h = H * Z; w = h * ir; } else { w = W * Z; h = w / ir; }
  const left = W / 2 - 0.5 * w, top = H * 0.40 - 0.44 * h; // focal: trophy/player upper-center
  ctx.save();
  ctx.translate(sh.x * px, sh.y * px);
  ctx.translate(W / 2, H / 2); ctx.rotate(sh.rot); ctx.translate(-W / 2, -H / 2);
  ctx.drawImage(img, left, top, w, h);
  ctx.restore();
  // light scrims for type legibility
  const tg = ctx.createLinearGradient(0, 0, 0, H * 0.26);
  tg.addColorStop(0, 'rgba(0,10,25,0.5)'); tg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = tg; ctx.fillRect(0, 0, W, H * 0.26);
  const bgg = ctx.createLinearGradient(0, H * 0.42, 0, H);
  bgg.addColorStop(0, 'rgba(0,0,0,0)'); bgg.addColorStop(0.5, 'rgba(0,5,18,0.5)'); bgg.addColorStop(1, 'rgba(0,4,14,0.9)');
  ctx.fillStyle = bgg; ctx.fillRect(0, H * 0.42, W, H * 0.58);
}

// parallax ambient confetti (3 depth layers) — density grows through the reel
const AMBIENT = (() => { const r = mulberry32(7), a = []; for (let i = 0; i < 170; i++) a.push({ x: r(), y: r() * 1.4 - 0.4, layer: Math.floor(r() * 3), col: CONF[Math.floor(r() * CONF.length)], rot: r() * 7, rotSpd: (r() - 0.5) * 6, sway: r() * 6.28, on: i / 170 }); return a; })();
function confettiRect(ctx, x, y, size, ang, col, alpha) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(ang);
  ctx.fillStyle = col; ctx.fillRect(-size / 2, -size / 4, size, size * 0.5); ctx.restore();
}
function drawAmbient(ctx, sec, W, H) {
  const px = W / 1080, prog = sec / DUR;
  const SP = [0.05, 0.085, 0.13], SZ = [8, 12, 17], AL = [0.5, 0.75, 0.95];
  for (const p of AMBIENT) {
    if (prog < p.on * 0.6) continue; // more confetti activates over time
    const yy = ((p.y + sec * SP[p.layer]) % 1.4) - 0.2;
    const xx = p.x + Math.sin(sec * 1.2 + p.sway) * [0.012, 0.022, 0.038][p.layer];
    const x = xx * W, y = yy * H; if (y < -25 || y > H + 25) continue;
    confettiRect(ctx, x, y, SZ[p.layer] * px, p.rot + sec * p.rotSpd, p.col, AL[p.layer]);
  }
}
function drawBursts(ctx, sec, W, H) {
  const px = W / 1080;
  for (const ev of EVENTS) { const age = sec - ev.t; if (age < 0 || age > 1.8) continue;
    const r = mulberry32(ev.seed), cx = ev.bx * W, cy = ev.by * H;
    for (let i = 0; i < 50; i++) {
      const ang = r() * 6.2832, dist = (0.3 + r() * 0.95) * Math.min(W, H) * 0.55 * easeOut(Math.min(1, age / 0.9));
      const x = cx + Math.cos(ang) * dist, y = cy + Math.sin(ang) * dist + age * age * H * 0.13;
      const a = clamp01(1 - age / 1.8); if (a <= 0) continue;
      confettiRect(ctx, x, y, (7 + r() * 11) * px, r() * 7 + age * 6, CONF[Math.floor(r() * CONF.length)], a * 0.95);
    }
  }
}

function drawLogo(ctx, sec, A, W, H) {
  const ev = EVENTS[0], td = sec - ev.t; if (td < 0 || !A.badge) return;
  const pop = backOut(clamp01(td / 0.42)), a = clamp01(td / 0.14), px = W / 1080;
  const r = W * 0.115 * pop, cx = W * 0.5, cy = H * 0.155 + Math.sin(sec * 1.6) * 6 * px;
  ctx.save(); ctx.globalAlpha = a;
  ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 26 * px;
  ctx.fillStyle = 'rgba(255,255,255,0.96)'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
  shadowOff(ctx);
  ctx.drawImage(A.badge, cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
}

// big/bold/slanted Seahawks-style text that pops in and floats
function drawHypeText(ctx, ev, sec, W, H) {
  const td = sec - ev.t; if (td < 0) return;
  const pop = backOut(clamp01(td / 0.4)), a = clamp01(td / 0.13), px = W / 1080;
  const bob = Math.sin((sec - ev.t) * 2.0) * 8 * px;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(ev.bx * W, ev.by * H + bob);
  ctx.transform(1, 0, SLANT, 1, 0, 0);
  ctx.scale(pop, pop);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const s = fitFont(ctx, ev.line, 800, W * ev.size, W * 0.9);
  stroked(ctx, ev.line, 0, 0, `800 ${s}px "${HEAD}"`, ev.fill, ev.stroke, Math.max(7, s * 0.1), 22);
  ctx.restore();
}

function drawFrame(ctx, sec, A, W, H) {
  drawBg(ctx, sec, A, W, H);
  drawAmbient(ctx, sec, W, H);
  drawBursts(ctx, sec, W, H);
  drawLogo(ctx, sec, A, W, H);
  for (const ev of EVENTS) if (ev.kind === 'text') drawHypeText(ctx, ev, sec, W, H);
  // URL at the end
  const ua = clamp01((sec - 8.0) / 0.4);
  if (ua > 0) {
    const px = W / 1080;
    ctx.save(); ctx.globalAlpha = ua; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const s = fitFont(ctx, 'americanheroesandbrew.com/fantasy-football', 700, W * 0.034, W * 0.92);
    stroked(ctx, 'americanheroesandbrew.com/fantasy-football', W / 2, H * 0.92, `700 ${s}px "${HEAD}"`, WHITE, NAVY_OUT, Math.max(3, s * 0.06) * px / px, 9);
    ctx.restore();
  }
}

function muxAudio(framesGlob, out) {
  const cheer = join(AUDIO, 'sfx', 'cheer.mp3'), boom = join(AUDIO, 'sfx', 'boom.mp3');
  const codec = ['-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-c:a', 'aac', '-b:a', '192k', '-t', String(DUR), '-movflags', '+faststart', out];
  if (existsSync(cheer) && existsSync(boom)) {
    const splits = BOOMS.map((t, i) => `[x${i}]atrim=0:0.9,asetpts=PTS-STARTPTS,adelay=${Math.round(t * 1000)}|${Math.round(t * 1000)},volume=${i === 3 ? 1.2 : 1.0}[b${i}]`).join(';');
    const fc =
      `[2:a]asplit=${BOOMS.length}${BOOMS.map((_, i) => `[x${i}]`).join('')};` +
      splits + ';' +
      `[1:a]volume=1.3,aloop=loop=-1:size=2e9,atrim=0:${DUR}[ch];` +
      `[ch]${BOOMS.map((_, i) => `[b${i}]`).join('')}amix=inputs=${BOOMS.length + 1}:duration=first:normalize=0[s];` +
      `[s]loudnorm=I=-13:TP=-1.5,afade=t=out:st=${DUR - 0.7}:d=0.7,aresample=44100[a]`;
    execFileSync('ffmpeg', ['-y', '-framerate', String(FPS), '-i', framesGlob, '-i', cheer, '-i', boom,
      '-filter_complex', fc, '-map', '0:v', '-map', '[a]', ...codec], { stdio: ['ignore', 'ignore', 'inherit'] });
  } else {
    execFileSync('ffmpeg', ['-y', '-framerate', String(FPS), '-i', framesGlob, '-f', 'lavfi', '-t', String(DUR),
      '-i', 'anullsrc=r=44100:cl=stereo', '-map', '0:v', '-map', '1:a', ...codec], { stdio: ['ignore', 'ignore', 'inherit'] });
  }
}

async function renderDim(A, W, H, outName) {
  const dir = join(TMP, `${W}x${H}`); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');
  for (let f = 0; f < FRAMES; f++) {
    ctx.clearRect(0, 0, W, H);
    drawFrame(ctx, f / FPS, A, W, H);
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
