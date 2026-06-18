/**
 * "Heroes Jackpot" — full-screen slot reels → firework reveal.
 *
 * Three reels fill the whole 9:16 frame and spin fast (motion-blurred, curved-drum
 * shading) like a real slot machine, then land on the day's win line (Heroes badge +
 * food icon + price token). On the win, the enhanced food photo BLASTS onto the screen
 * like a red/white/blue firework (sparkle bursts), settling into the special details.
 *
 * No cabinet / lever / marquee — just the reels, then the reveal.
 *
 * Output: public/promos-video/<key>-slot.mp4 (preview). Promote to <key>-2.mp4 to ship.
 * Run:  node scripts/specials-video/slot-render.mjs burgers
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
const AUDIO_DIR = join(OUT_DIR, 'audio');
const TMP = join(HERE, '.tmp-slot');

for (const p of ['/System/Library/Fonts/Avenir Next Condensed.ttc', '/System/Library/Fonts/Avenir Next.ttc']) {
  try { GlobalFonts.registerFromPath(p); } catch { /* fall back */ }
}
const HEAD = GlobalFonts.families.some((f) => /Avenir Next Condensed/.test(f.family))
  ? 'Avenir Next Condensed'
  : (GlobalFonts.families.some((f) => /Avenir Next/.test(f.family)) ? 'Avenir Next' : 'sans-serif');

const W = 1080, H = 1920, FPS = 30, SECONDS = 7.0;
const FRAMES = Math.round(FPS * SECONDS);
const NAVY = '#0b1f3a';

// timeline (sec): intro → (half) spin → HOLD on win (cha-ching) → boom → fireworks → reveal
const INTRO_END = 0.8;    // HEROES logo pulls down FAST through the bottom, revealing the reels
const SPIN_START = 0.05;  // reels spin behind the logo from the start
const REEL_STOP = [1.4, 1.7, 2.0]; // halved spin time
const WIN_HOLD = 2.55;    // reels landed → hold on the win line + cha-ching
const T_WIN = 3.4;        // end of hold → boom, transition out
const T_BLAST = 3.55;     // fireworks + photo paints on
const T_DETAILS = 3.95;   // special details settle

const ITEMS = {
  mahalo:  { day: 'MONDAY',    name: 'MAHALO MONDAY',          hero: 'KALUA SLIDERS', price: '$4',     sub: 'Sliders $4  ·  Select Cans $3', accent: '#2dd4bf', food: 'slider' },
  taco:    { day: 'TUESDAY',   name: 'TACO TUESDAY',           hero: 'TACOS',         price: '$4',     sub: 'Tacos $4  ·  $2 off Tequila',   accent: '#fb923c', food: 'taco' },
  wings:   { day: 'WEDNESDAY', name: 'WINGS & WELL WEDNESDAY', hero: 'WINGS',         price: '$6 OFF', sub: 'Wings $6 off  ·  Wells $6',      accent: '#f59e0b', food: 'wings' },
  burgers: { day: 'THURSDAY',  name: 'THIRSTY THURSDAY',       hero: 'BURGERS',       price: '$5 OFF', sub: 'Burgers $5 off  ·  Drafts $5',   accent: '#f97316', food: 'burger' },
  funday:  { day: 'FRIDAY',    name: 'FRIDAY FUNDAY',          hero: 'HAPPY HOUR',    price: '$2 OFF', sub: '1–4PM  ·  Drinks & Apps $2 off', accent: '#fbbf24', food: 'beer' },
};
const FALLBACK_BG = { burgers: join(PUBLIC, 'hero.jpg') };

const clamp01 = (x) => x < 0 ? 0 : x > 1 ? 1 : x;
const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - Math.pow(1 - clamp01(t), 3);
const backOut = (t) => { t = clamp01(t); const c1 = 1.7, c3 = c1 + 1; const u = t - 1; return 1 + c3 * u * u * u + c1 * u * u; };
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function drawCover(ctx, img, scale, panX = 0, panY = 0) {
  const ir = img.width / img.height, cr = W / H; let dw, dh;
  if (ir > cr) { dh = H * scale; dw = dh * ir; } else { dw = W * scale; dh = dw / ir; }
  ctx.drawImage(img, (W - dw) / 2 + panX, (H - dh) / 2 + panY, dw, dh);
}
// poppy entrance: overshoot scale + quick fade-in, around (cx,cy), local time td (sec)
function popText(ctx, fn, cx, cy, td) {
  if (td < 0) return;
  const e = backOut(clamp01(td / 0.42)), a = clamp01(td / 0.18);
  ctx.save(); ctx.globalAlpha = a; ctx.translate(cx, cy); ctx.scale(e, e); ctx.translate(-cx, -cy); fn(); ctx.restore();
}

// ---------- premium gold-framed reel symbols (Buffalo-style medallions) ----------
// red / white / blue concentric medallion ring (photo/badge clipped inside R*0.8)
function goldRing(ctx, R) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 9;
  ctx.fillStyle = '#c0252f'; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill();           // red outer
  ctx.restore();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, R * 0.93, 0, 7); ctx.fill();    // white
  ctx.fillStyle = '#2a5cd6'; ctx.beginPath(); ctx.arc(0, 0, R * 0.865, 0, 7); ctx.fill();   // blue
}
function gloss(ctx, R) {
  ctx.lineWidth = R * 0.05; ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.arc(0, 0, R * 0.8, 0, 7); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.beginPath(); ctx.ellipse(-R * 0.22, -R * 0.42, R * 0.5, R * 0.24, -0.5, 0, 7); ctx.fill();
}
// red/white/blue poker chips (replace the gold coins, keep the patriotic theme)
const CHIP = {
  '$3': { base: '#c0252f', fg: '#ffffff', acc: '#ffffff' },
  '$4': { base: '#f2f3f7', fg: '#0b1f3a', acc: '#c0252f' },
  '$5': { base: '#2a5cd6', fg: '#ffffff', acc: '#ffffff' },
};
function chip(ctx, R, base, fg, acc, value) {
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
  ctx.fillStyle = base; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill(); ctx.restore();
  ctx.lineWidth = R * 0.04; ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.clip();
  ctx.fillStyle = acc;
  for (let i = 0; i < 6; i++) { ctx.save(); ctx.rotate(i * Math.PI / 3); roundRect(ctx, -R * 0.13, -R, R * 0.26, R * 0.26, R * 0.05); ctx.fill(); ctx.restore(); }
  ctx.restore();
  ctx.lineWidth = R * 0.07; ctx.strokeStyle = acc; ctx.setLineDash([R * 0.2, R * 0.14]); ctx.beginPath(); ctx.arc(0, 0, R * 0.64, 0, 7); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = base; ctx.beginPath(); ctx.arc(0, 0, R * 0.5, 0, 7); ctx.fill();
  ctx.lineWidth = R * 0.04; ctx.strokeStyle = acc; ctx.beginPath(); ctx.arc(0, 0, R * 0.5, 0, 7); ctx.stroke();
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let px = R * 0.62; ctx.font = `800 ${px}px "${HEAD}"`;
  while (ctx.measureText(value).width > R * 0.88 && px > 10) { px -= 2; ctx.font = `800 ${px}px "${HEAD}"`; }
  ctx.fillText(value, 0, R * 0.02);
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.ellipse(-R * 0.26, -R * 0.34, R * 0.4, R * 0.2, -0.5, 0, 7); ctx.fill();
}
// real food photo inside a gold medallion
function medallion(ctx, img, s) {
  const R = s * 0.5; goldRing(ctx, R);
  const ri = R * 0.8;
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, ri, 0, 7); ctx.clip();
  ctx.drawImage(img, -ri, -ri, ri * 2, ri * 2);
  const vg = ctx.createRadialGradient(0, 0, ri * 0.45, 0, 0, ri); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.32)');
  ctx.fillStyle = vg; ctx.fillRect(-ri, -ri, ri * 2, ri * 2);
  ctx.restore();
  gloss(ctx, R);
}
function sym(ctx, kind, s, A) {
  if (A.foods[kind]) { medallion(ctx, A.foods[kind], s); return; }
  const R = s * 0.5;
  if (kind === 'badge') {
    goldRing(ctx, R);
    const ri = R * 0.8;
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, ri, 0, 7); ctx.clip();
    ctx.fillStyle = '#fbfbff'; ctx.fillRect(-ri, -ri, ri * 2, ri * 2);
    ctx.drawImage(A.badge, -ri * 0.96, -ri * 0.96, ri * 1.92, ri * 1.92);
    ctx.restore(); gloss(ctx, R);
  } else if (kind[0] === '$') {
    const c = CHIP[kind] || CHIP['$5']; chip(ctx, R * 0.94, c.base, c.fg, c.acc, kind);
  }
}
// landed price chip (day's deal) — red RWB poker chip
function priceToken(ctx, text, s) {
  chip(ctx, s * 0.5 * 0.94, '#c0252f', '#ffffff', '#ffffff', text);
}

const STRIP = ['badge', 'burger', 'taco', 'slider', 'wings', 'beer', '$3', '$4', '$5'];
const N = STRIP.length;
const REELW = W / 3;
const CELL = 360;             // tall symbols, ~5 visible per reel
const SPIN_SPEED = 42;        // cells/sec
const CENTER = H / 2;

function reelPos(i, sec, target) {
  const stop = REEL_STOP[i], stopDur = 0.55;
  if (sec < SPIN_START) return i * 2;
  const spun = (t) => i * 2 + (t - SPIN_START) * SPIN_SPEED;
  if (sec < stop) return spun(sec);
  const from = spun(stop);
  const to = Math.ceil(from / N) * N + target + N; // ≡ target (mod N), safely past `from`
  if (sec >= stop + stopDur) return to;
  return lerp(from, to, backOut((sec - stop) / stopDur)); // overshoot + settle onto target
}

function drawReel(ctx, i, pos, A, spinning, speed) {
  const x0 = i * REELW, cx = x0 + REELW / 2;
  ctx.save();
  ctx.beginPath(); ctx.rect(x0, 0, REELW, H); ctx.clip();
  // dark reel face (premium casino look) + curved-drum shading
  const rg = ctx.createLinearGradient(0, 0, 0, H); rg.addColorStop(0, '#142844'); rg.addColorStop(0.5, '#1c3756'); rg.addColorStop(1, '#0c1830');
  ctx.fillStyle = rg; ctx.fillRect(x0, 0, REELW, H);
  const sh = ctx.createLinearGradient(0, 0, 0, H);
  sh.addColorStop(0, 'rgba(0,0,0,0.7)'); sh.addColorStop(0.14, 'rgba(0,0,0,0.18)'); sh.addColorStop(0.5, 'rgba(255,255,255,0.07)');
  sh.addColorStop(0.86, 'rgba(0,0,0,0.18)'); sh.addColorStop(1, 'rgba(0,0,0,0.7)');
  for (let k = -3; k <= N + 3; k++) {
    let dy = ((k - pos) % N + N) % N; if (dy > N / 2) dy -= N;
    const y = CENTER + dy * CELL;
    if (y < -CELL || y > H + CELL) continue;
    const kind = STRIP[((k % N) + N) % N];
    ctx.save(); ctx.translate(cx, y);
    if (spinning) { const str = clamp01(speed / SPIN_SPEED); ctx.globalAlpha = lerp(1, 0.3, str); ctx.scale(1, 1 + str * 2.6); }
    sym(ctx, kind, 248, A);
    ctx.restore();
  }
  ctx.fillStyle = sh; ctx.fillRect(x0, 0, REELW, H);
  ctx.restore();
}

async function render(key) {
  const item = ITEMS[key]; if (!item) { console.error('unknown', key); process.exit(1); }
  const bgPath = existsSync(join(BG_DIR, `${key}.jpg`)) ? join(BG_DIR, `${key}.jpg`) : (FALLBACK_BG[key] || null);
  const bg = bgPath ? await loadImage(bgPath) : null;
  const badge = await loadImage(join(PUBLIC, 'badge-clean.png'));
  const foods = {};
  for (const k of ['burger', 'taco', 'slider', 'wings', 'beer']) foods[k] = await loadImage(join(BG_DIR, 'sym', `${k}.jpg`));
  const A = { badge, foods };
  const fi = STRIP.indexOf(item.food);
  const targets = [fi, fi, fi]; // all 3 reels land on the day's food = a clear, classic win

  // pre-seed firework bursts (RWB)
  const fr = rng(2026);
  const RWB = ['#d6273a', '#ffffff', '#2a5cd6'];
  const bursts = [];
  for (let b = 0; b < 12; b++) {
    const t0 = b === 0 ? T_BLAST : T_BLAST + 0.12 + b * 0.13 + fr() * 0.08;
    const bx = b === 0 ? W / 2 : 120 + fr() * (W - 240);
    const by = b === 0 ? H / 2 : 200 + fr() * (H - 560);
    const big = b === 0;
    const sparks = [];
    const count = big ? 150 : 80;
    for (let s = 0; s < count; s++) { const a = fr() * Math.PI * 2, v = (big ? 600 : 360) + fr() * (big ? 900 : 700); sparks.push({ a, v, col: RWB[(s + b) % 3], r: (big ? 7 : 5) + fr() * 9 }); }
    bursts.push({ t0, bx, by, sparks });
  }

  const dir = join(TMP, key); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const canvas = createCanvas(W, H); const ctx = canvas.getContext('2d');

  for (let f = 0; f < FRAMES; f++) {
    const sec = f / FPS;
    ctx.clearRect(0, 0, W, H);
    const paintT = clamp01((sec - T_BLAST) / 0.5);
    // jackpot shake — the reveal jolts in hard, then smooths out
    const shAmp = sec >= T_BLAST ? 48 * clamp01(1 - (sec - T_BLAST) / 0.85) : 0;
    const sx = Math.sin(sec * 82) * shAmp, sy = Math.cos(sec * 67) * shAmp * 0.85;

    // ----- reels (until the firework paints over them) -----
    if (sec < T_BLAST + 0.5) {
      for (let i = 0; i < 3; i++) {
        const pos = reelPos(i, sec, targets[i]);
        const spinning = sec > SPIN_START && sec < (REEL_STOP[i] + 0.5);
        const speed = spinning ? SPIN_SPEED * (sec < REEL_STOP[i] ? 1 : 0.4) : 0;
        drawReel(ctx, i, pos, A, spinning, speed);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 6;
      for (let i = 1; i < 3; i++) { ctx.beginPath(); ctx.moveTo(i * REELW, 0); ctx.lineTo(i * REELW, H); ctx.stroke(); }
      const wl = sec > WIN_HOLD ? 0.5 + 0.5 * Math.sin(sec * 34) : 0.35;
      ctx.strokeStyle = `rgba(245,158,11,${wl})`; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.moveTo(0, CENTER - CELL / 2 + 6); ctx.lineTo(W, CENTER - CELL / 2 + 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, CENTER + CELL / 2 - 6); ctx.lineTo(W, CENTER + CELL / 2 - 6); ctx.stroke();
      if (sec > T_WIN && sec < T_BLAST + 0.3) { const fl = clamp01(1 - (sec - T_WIN) / 0.4); ctx.fillStyle = `rgba(255,255,255,${fl * 0.6})`; ctx.fillRect(0, 0, W, H); }
    }

    // ----- INTRO: HEROES logo panel pulls DOWN through the bottom, revealing the reels -----
    if (sec < INTRO_END) {
      const LOGO_HOLD = 0.3; // hold the centered logo briefly, then pull down fast
      const d = sec < LOGO_HOLD ? 0 : easeOut((sec - LOGO_HOLD) / (INTRO_END - LOGO_HOLD)) * (H + 60);
      const pg = ctx.createLinearGradient(0, d, 0, H); pg.addColorStop(0, '#0e1a33'); pg.addColorStop(1, '#0a1322');
      ctx.fillStyle = pg; ctx.fillRect(0, d, W, H - d);
      ctx.fillStyle = '#c0252f'; ctx.fillRect(0, d, W, 6); ctx.fillStyle = '#fff'; ctx.fillRect(0, d + 6, W, 4); // red/white leading edge
      const ls = 380, ly = d + H * 0.46; // logo starts centered, rides the panel down
      if (ly - ls < H) {
        ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(W / 2, ly, ls * 0.52, 0, 7); ctx.fill(); ctx.restore();
        ctx.drawImage(badge, W / 2 - ls / 2, ly - ls / 2, ls, ls);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        let px = 80; ctx.font = `800 ${px}px "${HEAD}"`;
        while (ctx.measureText(item.name).width > W - 140 && px > 30) { px -= 2; ctx.font = `800 ${px}px "${HEAD}"`; }
        ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 12;
        ctx.fillText(item.name, W / 2, ly + ls * 0.82); ctx.shadowColor = 'transparent'; // more space below the logo
      }
    }

    // ----- the firework BURST PAINTS the food photo onto the screen (radial reveal) -----
    if (sec >= T_BLAST && bg) {
      const maxR = Math.hypot(W, H) / 2 + 60;
      const R = easeOut(paintT) * maxR;
      ctx.save(); ctx.translate(sx, sy); ctx.beginPath(); ctx.arc(W / 2, H / 2, R, 0, 7); ctx.clip();
      drawCover(ctx, bg, lerp(1.34, 1.06, easeOut((sec - T_BLAST) / 0.7)));
      ctx.fillStyle = 'rgba(0,0,0,0.34)'; ctx.fillRect(0, 0, W, H);
      ctx.restore();
      if (paintT > 0 && paintT < 1) {
        ctx.save(); ctx.lineWidth = 22; ctx.strokeStyle = 'rgba(255,255,255,0.92)'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 50;
        ctx.beginPath(); ctx.arc(W / 2, H / 2, R, 0, 7); ctx.stroke(); ctx.restore();
      }
    }
    // white blast flash + expanding shockwave
    if (sec >= T_BLAST) {
      const bf = clamp01(1 - (sec - T_BLAST) / 0.22); if (bf > 0) { ctx.fillStyle = `rgba(255,255,255,${bf * 0.9})`; ctx.fillRect(0, 0, W, H); }
      const st = (sec - T_BLAST) / 0.5; if (st > 0 && st < 1) { ctx.save(); ctx.globalAlpha = (1 - st) * 0.7; ctx.lineWidth = lerp(44, 4, st); ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(W / 2, H / 2, easeOut(st) * (Math.hypot(W, H) / 2), 0, 7); ctx.stroke(); ctx.restore(); }
    }

    // ----- RWB firework sparkles -----
    for (const B of bursts) {
      const lt = sec - B.t0; if (lt < 0 || lt > 1.1) continue;
      const prog = lt, fade = clamp01(1 - lt / 1.1);
      ctx.save(); ctx.globalAlpha = fade;
      // bright launch flash at the burst core
      const core = clamp01(1 - lt / 0.18);
      if (core > 0) { ctx.fillStyle = `rgba(255,255,255,${core})`; ctx.beginPath(); ctx.arc(B.bx, B.by, 60 * core, 0, 7); ctx.fill(); }
      for (const sp of B.sparks) {
        const d = sp.v * easeOut(prog);
        const x = B.bx + Math.cos(sp.a) * d, y = B.by + Math.sin(sp.a) * d + 150 * prog * prog; // gravity
        ctx.shadowColor = sp.col; ctx.shadowBlur = 18;
        ctx.fillStyle = sp.col; ctx.beginPath(); ctx.arc(x, y, sp.r * (1 - prog * 0.45), 0, 7); ctx.fill();
        // trailing spark
        ctx.globalAlpha = fade * 0.4; const d2 = sp.v * easeOut(Math.max(0, prog - 0.05));
        ctx.beginPath(); ctx.arc(B.bx + Math.cos(sp.a) * d2, B.by + Math.sin(sp.a) * d2 + 150 * (prog - 0.05) * (prog - 0.05), sp.r * 0.5, 0, 7); ctx.fill();
        ctx.globalAlpha = fade;
      }
      ctx.shadowColor = 'transparent';
      ctx.restore();
    }

    // ----- special details (poppy entrance, rides the shake) -----
    const dt = sec - T_DETAILS;
    if (dt > -0.05) {
      const a0 = clamp01(dt / 0.4);
      ctx.save(); ctx.translate(sx * 0.5, sy * 0.5); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const gg = ctx.createLinearGradient(0, H * 0.48, 0, H); gg.addColorStop(0, 'rgba(0,0,0,0)'); gg.addColorStop(1, 'rgba(0,0,0,0.82)');
      ctx.globalAlpha = a0; ctx.fillStyle = gg; ctx.fillRect(0, H * 0.48, W, H * 0.52);
      const bs = 220; ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(W / 2, 330, bs * 0.52, 0, 7); ctx.fill();
      ctx.drawImage(badge, W / 2 - bs / 2, 330 - bs / 2, bs, bs);
      ctx.globalAlpha = 1;
      popText(ctx, () => { ctx.font = `800 46px "${HEAD}"`; const cw = ctx.measureText(item.day).width + 96; ctx.fillStyle = item.accent; roundRect(ctx, W / 2 - cw / 2, 1120, cw, 84, 42); ctx.fill(); ctx.fillStyle = '#0b0b0d'; ctx.fillText(item.day, W / 2, 1163); }, W / 2, 1163, dt - 0.02);
      popText(ctx, () => { ctx.font = `800 150px "${HEAD}"`; ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 22; ctx.fillText(item.hero, W / 2, 1300); ctx.shadowColor = 'transparent'; }, W / 2, 1300, dt - 0.1);
      popText(ctx, () => { ctx.font = `800 184px "${HEAD}"`; ctx.lineJoin = 'round'; ctx.lineWidth = 16; ctx.strokeStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 26; ctx.strokeText(item.price, W / 2, 1488); ctx.fillStyle = item.accent; ctx.fillText(item.price, W / 2, 1488); ctx.shadowColor = 'transparent'; }, W / 2, 1488, dt - 0.2);
      ctx.globalAlpha = clamp01((dt - 0.34) / 0.4);
      ctx.fillStyle = '#e8eaee'; ctx.font = `600 50px "${HEAD}"`; ctx.fillText(item.sub, W / 2, 1628);
      ctx.fillStyle = '#fff'; ctx.font = `800 48px "${HEAD}"`; ctx.fillText('AMERICAN HEROES & BREW', W / 2, H - 140);
      ctx.restore();
    }

    writeFileSync(join(dir, `f-${String(f + 1).padStart(4, '0')}.png`), canvas.toBuffer('image/png'));
  }

  const out = join(OUT_DIR, `${key}-slot.mp4`);
  const codec = ['-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-c:a', 'aac', '-b:a', '192k', '-t', String(SECONDS), '-movflags', '+faststart', out];

  // Phased audio: intro voice → spin SFX → boom (win) → cheer (fireworks) → music+bass (reveal)
  const music = [join(AUDIO_DIR, `${key}.mp3`), join(AUDIO_DIR, 'track.mp3')].find(existsSync);
  const SFX = join(AUDIO_DIR, 'sfx');
  const spin = join(SFX, 'spin.mp3'), boom = join(SFX, 'boom.mp3'), cheer = join(SFX, 'cheer.mp3'), ching = join(SFX, 'ching.mp3');
  const ms = (s) => Math.round(s * 1000);
  if (music && [spin, boom, cheer, ching].every(existsSync)) {
    const fc = [
      `[1:a]volume=1.0,bass=g=9:f=95,adelay=${ms(T_BLAST)}|${ms(T_BLAST)},afade=t=out:st=${SECONDS - 0.5}:d=0.5[mus]`,
      `[2:a]volume=0.9,atrim=0:1.7,adelay=${ms(0.55)}|${ms(0.55)}[sp]`,
      `[3:a]volume=1.2,atrim=0:1.6,adelay=${ms(WIN_HOLD)}|${ms(WIN_HOLD)}[cg]`,
      `[4:a]volume=1.3,atrim=0:1.8,adelay=${ms(T_WIN)}|${ms(T_WIN)}[bm]`,
      `[5:a]volume=1.0,atrim=0:2.8,adelay=${ms(T_BLAST)}|${ms(T_BLAST)}[ch]`,
      `[6:a]volume=1.2,atrim=0:1.0,adelay=300|300[bm0]`,  // intro boom — when the logo starts moving
      `[7:a]volume=0.9,atrim=0:1.5,adelay=330|330[ch0]`,  // intro cheer
      `[mus][sp][cg][bm][ch][bm0][ch0]amix=inputs=7:normalize=0:dropout_transition=200[mx]`,
      `[mx]loudnorm=I=-15:TP=-1.5:LRA=11,aresample=44100[a]`,
    ].join(';');
    execFileSync('ffmpeg', ['-y', '-framerate', String(FPS), '-i', join(dir, 'f-%04d.png'),
      '-i', music, '-i', spin, '-i', ching, '-i', boom, '-i', cheer, '-i', boom, '-i', cheer,
      '-filter_complex', fc, '-map', '0:v', '-map', '[a]', ...codec], { stdio: ['ignore', 'ignore', 'inherit'] });
  } else {
    const aIn = music ? ['-i', music] : ['-f', 'lavfi', '-t', String(SECONDS), '-i', 'anullsrc=r=44100:cl=stereo'];
    const aFx = music ? ['-af', `loudnorm=I=-15:TP=-1.5,aresample=44100`] : [];
    execFileSync('ffmpeg', ['-y', '-framerate', String(FPS), '-i', join(dir, 'f-%04d.png'), ...aIn, ...aFx,
      '-map', '0:v', '-map', '1:a', ...codec], { stdio: ['ignore', 'ignore', 'inherit'] });
  }
  rmSync(dir, { recursive: true, force: true });
  console.log('rendered', out);
}

const key = (process.argv[2] || 'burgers').toLowerCase();
mkdirSync(TMP, { recursive: true });
await render(key);
rmSync(TMP, { recursive: true, force: true });
