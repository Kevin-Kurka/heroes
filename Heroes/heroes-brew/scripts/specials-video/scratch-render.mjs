/**
 * Lotto-scratch-off 9:16 Story videos for American Heroes & Brew.
 *
 * Concept: a branded scratcher ticket — the Heroes badge (the homepage
 * /badge-clean.png) on a metallic foil printed with "DAILY SPECIAL · SCRATCH TO
 * REVEAL" microtext and an amber ticket frame, over a high-quality food photo.
 * A coin scratches the foil away along a natural, hand-like path (leaving streaky
 * edges + shavings) to reveal the photo, then the day's special PUNCHES IN —
 * the price pops with an overshoot, accent glow, and a shine sweep.
 *
 * Pipeline: @napi-rs/canvas renders every frame (incremental scratch mask for
 * speed) -> ffmpeg encodes a 1080x1920 ~6s H.264/AAC MP4 with a silent track.
 * Output: public/promos-video/<key>-<variant>.mp4  (overwrites the Story files).
 *
 * Backgrounds: public/promos-video/bg/<key>.jpg per day. Falls back to FALLBACK_BG
 * (or a gradient) so a prototype can render before real photos are loaded.
 *
 * Run:  node scripts/specials-video/scratch-render.mjs            # all days, both variants
 *       node scripts/specials-video/scratch-render.mjs taco       # one day, both variants
 *       node scripts/specials-video/scratch-render.mjs burgers 1  # one day, one variant (1-based)
 *
 * Requires: ffmpeg on PATH, devDependency @napi-rs/canvas.
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
const AUDIO_DIR = join(OUT_DIR, 'audio'); // per-day <key>.mp3, else track.mp3, else silent
const TMP = join(HERE, '.tmp-scratch');

for (const p of ['/System/Library/Fonts/Avenir Next Condensed.ttc', '/System/Library/Fonts/Avenir Next.ttc']) {
  try { GlobalFonts.registerFromPath(p); } catch { /* fall back */ }
}
const HEAD = GlobalFonts.families.some((f) => /Avenir Next Condensed/.test(f.family))
  ? 'Avenir Next Condensed'
  : (GlobalFonts.families.some((f) => /Avenir Next/.test(f.family)) ? 'Avenir Next' : 'sans-serif');

const W = 1080, H = 1920, FPS = 30, SECONDS = 6;
const FRAMES = FPS * SECONDS;
const AMBER = '#f59e0b';

// Scratch timeline (seconds): hold → scratch → reveal pop → hold.
const SCRATCH_START = 0.55;
const SCRATCH_END = 3.45;
const COIN_R = 86;
const STEP = 9; // px between scratch stamps

// Foil ticket panel + the area the coin actually covers.
const PANEL = { x: 44, y: 44, w: W - 88, h: H - 88, r: 58 };
const INNER = { x: PANEL.x + 46, y: PANEL.y + 46, w: PANEL.w - 92, h: PANEL.h - 92 };

const ITEMS = {
  mahalo:  { day: 'MONDAY',    hero: 'KALUA SLIDERS', price: '$4',     sub: 'Sliders $4  ·  Select Cans $3', accents: ['#2dd4bf', '#14b8a6'], taglines: ['Start the week right', 'Aloha pricing all day'] },
  taco:    { day: 'TUESDAY',   hero: 'TACOS',         price: '$4',     sub: 'Tacos $4  ·  $2 off Tequila',   accents: ['#fb923c', '#ef4444'], taglines: ['Taco ’bout a deal', 'Tequila + tacos'] },
  wings:   { day: 'WEDNESDAY', hero: 'WINGS',         price: '$6 OFF', sub: 'Wings $6 off  ·  Wells $6',      accents: ['#f59e0b', '#eab308'], taglines: ['Halfway there, Happy Humpday', 'Sauce up midweek'] },
  burgers: { day: 'THURSDAY',  hero: 'BURGERS',       price: '$5 OFF', sub: 'Burgers $5 off  ·  Drafts $5',   accents: ['#f97316', '#ea580c'], taglines: ['Stack it high', 'Burger + brew night'] },
  funday:  { day: 'FRIDAY',    hero: 'HAPPY HOUR',    price: '$2 OFF', sub: '1–4PM  ·  Drinks & Apps $2 off', accents: ['#fbbf24', '#f59e0b'], taglines: ['Beat the rush', 'Kick off the weekend'] },
};

const FALLBACK_BG = { burgers: join(PUBLIC, 'hero.jpg') };

// ---------- helpers ----------
function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const clamp01 = (x) => x < 0 ? 0 : x > 1 ? 1 : x;
const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const lerp = (a, b, t) => a + (b - a) * t;
// damped single bounce (emphasis) — 0 at the ends, quick overshoot then settle.
function bounce(t) { if (t <= 0 || t >= 1) return 0; return Math.exp(-3 * t) * Math.sin(t * Math.PI * 3) * 0.2; }

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function fitFont(ctx, text, maxW, startPx, weight = 800) {
  let px = startPx;
  do { ctx.font = `${weight} ${px}px "${HEAD}"`; if (ctx.measureText(text).width <= maxW) break; px -= 6; } while (px > 40);
  return px;
}

// Hand-like scratch path: a back-and-forth sweep generated horizontally, then
// ROTATED ~20° so the coin travels DIAGONALLY, with a slight per-stroke curve
// (bow) like a real hand. The covered region is a tilted rectangle inset from the
// panel, so the axis-aligned corners keep their foil (realistic unscratched bits).
function buildPath(variant) {
  const r = rng(hashStr('path') + variant + 1);
  const cx = PANEL.x + PANEL.w / 2, cy = PANEL.y + PANEL.h / 2;
  // Right-handed slant: strokes run bottom-left → top-right ("/"), the natural
  // diagonal of a right hand. Same lean for both variants; variety comes from
  // scratching top-down (v1) vs bottom-up (v2) below.
  const ang = -(20 * Math.PI / 180);
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const halfW = INNER.w * 0.54;
  const halfH = INNER.h * 0.52;
  const rowGap = COIN_R * 1.35; // < core width, so adjacent rows overlap
  const rows = Math.ceil((2 * halfH) / rowGap);
  const pts = [];
  for (let k = 0; k <= rows; k++) {
    const ly = -halfH + Math.min(k * rowGap, 2 * halfH);
    const ltr = k % 2 === 0;
    const segs = 32;
    for (let s = 0; s <= segs; s++) {
      const tt = s / segs;
      const lx = ltr ? -halfW + tt * 2 * halfW : halfW - tt * 2 * halfW;
      const lyy = ly + Math.sin(tt * Math.PI) * (ltr ? 1 : -1) * 30; // slight curve
      pts.push({
        x: cx + (lx * ca - lyy * sa) + (r() - 0.5) * 14,
        y: cy + (lx * sa + lyy * ca) + (r() - 0.5) * 10,
      });
    }
  }
  return pts;
}
function cumulative(pts) { const cl = [0]; for (let i = 1; i < pts.length; i++) cl[i] = cl[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); return cl; }
function pointAt(pts, cl, dist) {
  const total = cl[cl.length - 1];
  const d = Math.max(0, Math.min(total, dist));
  let i = 1; while (i < cl.length && cl[i] < d) i++;
  if (i >= cl.length) return pts[pts.length - 1];
  const t = (d - cl[i - 1]) / Math.max(1e-6, cl[i] - cl[i - 1]);
  return { x: lerp(pts[i - 1].x, pts[i].x, t), y: lerp(pts[i - 1].y, pts[i].y, t) };
}

function drawCover(ctx, img, scale, panX, panY = 0) {
  const ir = img.width / img.height, cr = W / H;
  let dw, dh;
  if (ir > cr) { dh = H * scale; dw = dh * ir; } else { dw = W * scale; dh = dw / ir; }
  ctx.drawImage(img, (W - dw) / 2 + panX, (H - dh) / 2 + panY, dw, dh);
}

function drawCoin(ctx, x, y, r, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 28; ctx.shadowOffsetY = 13;
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.15, 0, 0, r);
  g.addColorStop(0, '#fdfefe'); g.addColorStop(0.45, '#d2d7df'); g.addColorStop(0.82, '#9aa1ad'); g.addColorStop(1, '#6d7480');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = r * 0.1; ctx.strokeStyle = 'rgba(120,128,140,0.85)'; ctx.beginPath(); ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(108,116,128,0.5)'; ctx.lineWidth = 2;
  for (let i = 0; i < 44; i++) { const a = (i / 44) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.85); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.ellipse(-r * 0.28, -r * 0.34, r * 0.42, r * 0.22, -0.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ---------- branded foil ticket (built once per video) ----------
function buildFoilBase(item, variant, badge) {
  const f = createCanvas(W, H);
  const fx = f.getContext('2d');
  fx.save();
  roundRect(fx, PANEL.x, PANEL.y, PANEL.w, PANEL.h, PANEL.r);
  fx.clip();

  // metallic base
  const g = fx.createLinearGradient(0, PANEL.y, 0, PANEL.y + PANEL.h);
  g.addColorStop(0, '#edf0f4'); g.addColorStop(0.25, '#c2c8d2'); g.addColorStop(0.5, '#eef1f6'); g.addColorStop(0.75, '#bac1cc'); g.addColorStop(1, '#dde2e9');
  fx.fillStyle = g; fx.fillRect(0, 0, W, H);
  // diagonal sheen
  const sh = fx.createLinearGradient(0, 0, W, H);
  sh.addColorStop(0.30, 'rgba(255,255,255,0)'); sh.addColorStop(0.5, 'rgba(255,255,255,0.55)'); sh.addColorStop(0.70, 'rgba(255,255,255,0)');
  fx.fillStyle = sh; fx.fillRect(0, 0, W, H);
  // brushed-metal lines
  const r = rng(hashStr(item.day) + variant + 1);
  fx.globalAlpha = 0.045; fx.strokeStyle = '#5b6270'; fx.lineWidth = 1;
  for (let i = 0; i < 280; i++) { const y = PANEL.y + r() * PANEL.h; fx.beginPath(); fx.moveTo(PANEL.x, y); fx.lineTo(PANEL.x + PANEL.w, y); fx.stroke(); }
  fx.globalAlpha = 1;

  // diagonal "DAILY SPECIAL · SCRATCH TO REVEAL" microtext (scratcher hallmark)
  fx.save();
  fx.translate(W / 2, H / 2); fx.rotate(-22 * Math.PI / 180);
  fx.font = `700 28px "${HEAD}"`; fx.textAlign = 'left'; fx.textBaseline = 'middle';
  const tile = 'DAILY SPECIAL  ·  SCRATCH TO REVEAL  ·  ';
  const tileW = fx.measureText(tile).width;
  for (let yy = -H; yy <= H; yy += 50) {
    const offset = ((yy / 50) % 2) * (tileW / 2);
    for (let xx = -W - tileW; xx <= W; xx += tileW) {
      fx.fillStyle = 'rgba(255,255,255,0.10)'; fx.fillText(tile, xx + offset + 1, yy + 1);
      fx.fillStyle = 'rgba(74,82,96,0.12)'; fx.fillText(tile, xx + offset, yy);
    }
  }
  fx.restore();
  fx.restore();

  // amber ticket frame (inside the panel)
  roundRect(fx, PANEL.x + 16, PANEL.y + 16, PANEL.w - 32, PANEL.h - 32, PANEL.r - 14);
  fx.lineWidth = 9; fx.strokeStyle = AMBER; fx.stroke();
  roundRect(fx, PANEL.x + 27, PANEL.y + 27, PANEL.w - 54, PANEL.h - 54, PANEL.r - 24);
  fx.lineWidth = 2; fx.strokeStyle = 'rgba(40,44,54,0.35)'; fx.stroke();

  fx.textAlign = 'center'; fx.textBaseline = 'middle';

  // header label
  fx.fillStyle = AMBER;
  const head = 'DAILY SPECIAL';
  fx.font = `800 50px "${HEAD}"`;
  const hw = fx.measureText(head).width + 70;
  roundRect(fx, W / 2 - hw / 2, PANEL.y + 96, hw, 78, 39); fx.fill();
  fx.fillStyle = '#1a1207'; fx.fillText(head, W / 2, PANEL.y + 136);

  // badge (homepage logo) + CTA
  const bs = 430;
  fx.save(); fx.shadowColor = 'rgba(40,44,54,0.28)'; fx.shadowBlur = 16; fx.shadowOffsetY = 6;
  fx.drawImage(badge, W / 2 - bs / 2, H * 0.40 - bs / 2, bs, bs);
  fx.restore();

  fx.fillStyle = 'rgba(60,66,80,0.85)';
  fx.font = `800 54px "${HEAD}"`;
  fx.fillText('S C R A T C H   H E R E', W / 2, H * 0.40 + bs / 2 + 60);
  fx.fillStyle = 'rgba(60,66,80,0.55)';
  fx.font = `600 36px "${HEAD}"`;
  fx.fillText('use a coin · reveal your deal', W / 2, H * 0.40 + bs / 2 + 116);

  // footer brand on the foil
  fx.fillStyle = 'rgba(60,66,80,0.6)';
  fx.font = `700 34px "${HEAD}"`;
  fx.fillText('@americanheroesandbrew', W / 2, PANEL.y + PANEL.h - 80);

  return f;
}

// ---------- streaky coin scratch (stamped into a persistent mask) ----------
function scratchStamp(mx, x, y, ang, coinR, rnd) {
  const dx = Math.cos(ang), dy = Math.sin(ang);
  const nx = -dy, ny = dx;
  mx.lineCap = 'round';
  // solid core — the coin fully removes the foil it passes over (contiguous swath)
  mx.globalAlpha = 1;
  mx.lineWidth = coinR * 1.7;
  mx.beginPath();
  mx.moveTo(x - dx * 3, y - dy * 3);
  mx.lineTo(x + dx * 3, y + dy * 3);
  mx.stroke();
  // streaky striations just past the core edges (parallel to motion) → ragged edge
  const seg = coinR * 1.4;
  for (let i = 0; i < 6; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const off = coinR * (0.85 + rnd() * 0.55) * side;
    mx.globalAlpha = 0.35 + rnd() * 0.5;
    mx.lineWidth = 2 + rnd() * 5;
    mx.beginPath();
    mx.moveTo(x + nx * off - dx * seg * 0.5, y + ny * off - dy * seg * 0.5);
    mx.lineTo(x + nx * off + dx * seg * 0.5, y + ny * off + dy * seg * 0.5);
    mx.stroke();
  }
  mx.globalAlpha = 1;
}
function addScratch(mx, fromDist, toDist, pts, cl, rnd) {
  mx.strokeStyle = '#fff';
  for (let d = Math.max(0, fromDist); d < toDist; d += STEP) {
    const p = pointAt(pts, cl, d);
    const p2 = pointAt(pts, cl, d + 2);
    scratchStamp(mx, p.x, p.y, Math.atan2(p2.y - p.y, p2.x - p.x), COIN_R, rnd);
  }
}

// ---------- the promo (printed UNDER the foil, revealed as you scratch) ----------
// Everything is drawn statically so it shows through the scratched area. The only
// motion is the PRICE, which bounces (+ glow + shine) the moment scratching ends.
function drawPrize(ctx, item, variant, badge, sec) {
  const accent = item.accents[variant];
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

  // small badge on a 50% white disc so the logo reads over the photo
  const bs = 240;
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath(); ctx.arc(W / 2, 360, bs * 0.52, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.drawImage(badge, W / 2 - bs / 2, 360 - bs / 2, bs, bs);

  // day chip
  ctx.font = `800 46px "${HEAD}"`;
  const cw = ctx.measureText(item.day).width + 96;
  ctx.fillStyle = accent; roundRect(ctx, W / 2 - cw / 2, 702, cw, 86, 43); ctx.fill();
  ctx.fillStyle = '#0b0b0d'; ctx.fillText(item.day, W / 2, 747);

  // hero word
  fitFont(ctx, item.hero, W - 220, 168, 800);
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 6;
  ctx.fillText(item.hero, W / 2, 940); ctx.shadowColor = 'transparent';

  // PRICE — revealed by the scratch, then bounces once scratching completes
  const cy = 1190;
  const pricePx = fitFont(ctx, item.price, W - 240, 300, 800);
  const pw = ctx.measureText(item.price).width;
  const since = sec - SCRATCH_END;
  // accent glow flash at the moment of completion
  const glow = clamp01(1 - since / 0.5);
  if (since > -0.02 && glow > 0) {
    const rg = ctx.createRadialGradient(W / 2, cy, 0, W / 2, cy, 520);
    rg.addColorStop(0, accent + Math.round(glow * 140).toString(16).padStart(2, '0'));
    rg.addColorStop(1, accent + '00');
    ctx.save(); ctx.globalAlpha = glow; ctx.fillStyle = rg; ctx.fillRect(0, cy - 360, W, 720); ctx.restore();
  }
  const scale = 1 + bounce(since / 0.7);
  const strokeA = clamp01(since / 0.3); // white outline ramps in once the price pops
  ctx.save(); ctx.translate(W / 2, cy); ctx.scale(scale, scale); ctx.translate(-W / 2, -cy);
  // white outline behind the fill — a halo that ramps in as the price pops
  if (strokeA > 0) {
    ctx.save();
    ctx.globalAlpha = strokeA;
    ctx.lineJoin = 'round'; ctx.lineWidth = pricePx * 0.11; ctx.strokeStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 8;
    ctx.strokeText(item.price, W / 2, cy);
    ctx.restore();
  }
  // accent fill on top
  ctx.fillStyle = accent;
  ctx.shadowColor = strokeA > 0 ? 'transparent' : 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 30; ctx.shadowOffsetY = 8;
  ctx.fillText(item.price, W / 2, cy); ctx.shadowColor = 'transparent';
  ctx.restore();
  // shine sweep just after completion
  const shT = (since - 0.06) / 0.45;
  if (shT > 0 && shT < 1) {
    ctx.save();
    ctx.beginPath(); ctx.rect(W / 2 - pw / 2 - 20, cy - 130, pw + 40, 260); ctx.clip();
    const sx = lerp(W / 2 - pw / 2 - 200, W / 2 + pw / 2 + 200, shT);
    const lg = ctx.createLinearGradient(sx - 120, 0, sx + 120, 0);
    lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, 'rgba(255,255,255,0.7)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = lg; ctx.fillRect(W / 2 - pw / 2 - 20, cy - 130, pw + 40, 260);
    ctx.restore();
  }

  // accent rule
  ctx.fillStyle = accent; ctx.fillRect(W / 2 - 90, 1336, 180, 8);

  // sub line
  ctx.fillStyle = '#e8eaee'; ctx.font = `600 56px "${HEAD}"`;
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 14; ctx.fillText(item.sub, W / 2, 1430); ctx.shadowColor = 'transparent';

  // tagline
  ctx.fillStyle = accent; ctx.font = `600 44px "${HEAD}"`; ctx.fillText(item.taglines[variant], W / 2, 1520);

  // footer brand
  ctx.fillStyle = '#ffffff'; ctx.font = `800 56px "${HEAD}"`;
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 14; ctx.fillText('AMERICAN HEROES & BREW', W / 2, H - 240); ctx.shadowColor = 'transparent';
  ctx.fillStyle = accent; ctx.font = `600 38px "${HEAD}"`; ctx.fillText('Carlsbad Village · @americanheroesandbrew', W / 2, H - 162);
}

// ---------- render one video ----------
async function render(key, variant) {
  const item = ITEMS[key];
  if (!item) { console.error(`unknown item: ${key}`); process.exit(1); }

  const bgPath = existsSync(join(BG_DIR, `${key}.jpg`)) ? join(BG_DIR, `${key}.jpg`)
    : existsSync(join(BG_DIR, `${key}.png`)) ? join(BG_DIR, `${key}.png`)
    : FALLBACK_BG[key] && existsSync(FALLBACK_BG[key]) ? FALLBACK_BG[key] : null;
  const bg = bgPath ? await loadImage(bgPath) : null;
  const badge = await loadImage(join(PUBLIC, 'badge-clean.png'));
  const pts = buildPath(variant);
  const cl = cumulative(pts);
  const total = cl[cl.length - 1];
  const baseFoil = buildFoilBase(item, variant, badge);

  // persistent scratch mask (white = removed foil)
  const mask = createCanvas(W, H);
  const mctx = mask.getContext('2d');
  const srnd = rng(hashStr(key + 'scratch') + variant + 1);
  let prevDist = 0;

  const dir = join(TMP, `${key}-${variant + 1}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const tmp = createCanvas(W, H);
  const tctx = tmp.getContext('2d');

  for (let frame = 0; frame < FRAMES; frame++) {
    const sec = frame / FPS;
    const sp = smooth((sec - SCRATCH_START) / (SCRATCH_END - SCRATCH_START));
    const scratchDist = sp * total;
    if (scratchDist > prevDist) { addScratch(mctx, prevDist, scratchDist, pts, cl, srnd); prevDist = scratchDist; }

    ctx.clearRect(0, 0, W, H);
    // background — slow Ken Burns zoom + drift (the far parallax layer)
    ctx.fillStyle = '#0b0b0d'; ctx.fillRect(0, 0, W, H);
    const t = frame / (FRAMES - 1);
    const zoom = lerp(1.07, 1.14, t);
    const bgX = (variant === 1 ? -1 : 1) * lerp(-16, 16, t);
    const bgY = lerp(-26, 26, t);
    if (bg) drawCover(ctx, bg, zoom, bgX, bgY);
    ctx.fillStyle = 'rgba(0,0,0,0.30)'; ctx.fillRect(0, 0, W, H);
    let gg = ctx.createLinearGradient(0, 0, 0, H * 0.42); gg.addColorStop(0, 'rgba(0,0,0,0.7)'); gg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H * 0.42);
    gg = ctx.createLinearGradient(0, H * 0.56, 0, H); gg.addColorStop(0, 'rgba(0,0,0,0)'); gg.addColorStop(1, 'rgba(0,0,0,0.8)'); ctx.fillStyle = gg; ctx.fillRect(0, H * 0.56, W, H * 0.44);

    // promo text is printed UNDER the foil (shows through as the card is scratched).
    // It drifts opposite the photo at a smaller rate → parallax depth between text & burger.
    ctx.save();
    ctx.translate(-bgX * 0.45, -bgY * 0.55);
    drawPrize(ctx, item, variant, badge, sec);
    ctx.restore();

    // foil (base minus scratched mask) — alpha stays 1 so corners keep their foil
    tctx.clearRect(0, 0, W, H);
    tctx.globalCompositeOperation = 'source-over';
    tctx.drawImage(baseFoil, 0, 0);
    tctx.globalCompositeOperation = 'destination-out';
    tctx.drawImage(mask, 0, 0);
    tctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(tmp, 0, 0);

    // coin + shavings while scratching
    if (sp > 0 && sp < 1) {
      const tip = pointAt(pts, cl, scratchDist);
      const fr = rng(hashStr(key) * 7 + frame);
      ctx.fillStyle = 'rgba(225,228,233,0.85)';
      for (let i = 0; i < 16; i++) { const a = fr() * Math.PI * 2, rr = fr() * 95; ctx.beginPath(); ctx.arc(tip.x + Math.cos(a) * rr, tip.y + Math.sin(a) * rr, 1 + fr() * 3, 0, Math.PI * 2); ctx.fill(); }
      const nxt = pointAt(pts, cl, scratchDist + 4);
      drawCoin(ctx, tip.x, tip.y, COIN_R, Math.atan2(nxt.y - tip.y, nxt.x - tip.x) + Math.PI / 2);
    }

    writeFileSync(join(dir, `f-${String(frame + 1).padStart(4, '0')}.png`), canvas.toBuffer('image/png'));
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const out = join(OUT_DIR, `${key}-${variant + 1}.mp4`);
  // Audio: this day's track (audio/<key>.mp3), else the generic track.mp3, else silent.
  const audioPath = [join(AUDIO_DIR, `${key}.mp3`), join(AUDIO_DIR, 'track.mp3')].find(existsSync);
  const hasAudio = !!audioPath;
  const audioIn = hasAudio
    ? ['-i', audioPath]
    : ['-f', 'lavfi', '-t', String(SECONDS), '-i', 'anullsrc=r=44100:cl=stereo'];
  const audioFx = hasAudio
    ? ['-af', `afade=t=in:st=0:d=0.2,afade=t=out:st=${SECONDS - 0.6}:d=0.6,loudnorm=I=-15:TP=-1.5:LRA=11,aresample=44100`]
    : [];
  execFileSync('ffmpeg', [
    '-y',
    '-framerate', String(FPS), '-i', join(dir, 'f-%04d.png'),
    ...audioIn,
    // No fades: first frame is the branded foil, last frame holds the full reveal.
    '-vf', 'format=yuv420p',
    ...audioFx,
    '-map', '0:v', '-map', '1:a',
    '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-c:a', 'aac', '-b:a', '160k', '-t', String(SECONDS), '-shortest', '-movflags', '+faststart',
    out,
  ], { stdio: ['ignore', 'ignore', 'inherit'] });
  rmSync(dir, { recursive: true, force: true });
  console.log('rendered', out, bgPath ? `(bg: ${bgPath.replace(PUBLIC, '')})` : '(no bg — gradient)');
  return out;
}

const onlyKey = process.argv[2]?.toLowerCase();
const onlyVariant = process.argv[3] ? parseInt(process.argv[3], 10) - 1 : null;
const keys = onlyKey ? [onlyKey] : Object.keys(ITEMS);
mkdirSync(TMP, { recursive: true });
for (const key of keys) {
  const variants = onlyVariant != null ? [onlyVariant] : [0, 1];
  for (const v of variants) await render(key, v);
}
rmSync(TMP, { recursive: true, force: true });
