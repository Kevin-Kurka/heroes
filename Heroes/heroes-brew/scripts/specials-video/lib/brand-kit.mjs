/**
 * brand-kit — the single source of truth for the American Heroes & Brew poster look
 * (approved design v11). Canvas draw helpers shared by every renderer + the render route
 * so all output is identical by construction: crest-only circle, triple red/white/blue
 * keyline, outlined headlines with a complementary gradient fill + inner-shadow +
 * progressive blur, framed kickers, drop-shadow footer text, photo + dark gradient.
 *
 * Pure drawing on a 2D context — no I/O except font registration.
 */
import { GlobalFonts } from '@napi-rs/canvas';

// ── palette (brand red/white/blue) ──────────────────────────────────────────
export const RED = '#bf0a30';
export const NAVY = '#0a3161';
export const BLUE = '#3a6fe0';
export const WHITE = '#ffffff';

// ── fonts ────────────────────────────────────────────────────────────────────
for (const p of ['/System/Library/Fonts/Avenir Next Condensed.ttc', '/System/Library/Fonts/Avenir Next.ttc']) {
  try { GlobalFonts.registerFromPath(p); } catch { /* fall back below */ }
}
export const HEAD = GlobalFonts.families?.some((f) => /Avenir Next Condensed/.test(f.family))
  ? 'Avenir Next Condensed'
  : (GlobalFonts.families?.some((f) => /Avenir Next/.test(f.family)) ? 'Avenir Next' : 'sans-serif');

// ── geometry / color utils ────────────────────────────────────────────────────
export function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** cover-draw an image into a box (like CSS background-size:cover). */
export function drawCover(ctx, img, x, y, w, h, scale = 1, focusY = 0.5) {
  const ar = img.width / img.height;
  let dw = w * scale, dh = dw / ar;
  if (dh < h * scale) { dh = h * scale; dw = dh * ar; }
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) * focusY, dw, dh);
}

/** shrink font until `text` fits `maxW`. */
export function fitFont(ctx, text, weight, startPx, maxW, family = HEAD) {
  let px = startPx;
  do { ctx.font = `${weight} ${px}px "${family}"`; if (ctx.measureText(text).width <= maxW) break; px -= 2; } while (px > 12);
  return px;
}

const hex = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
/** mix hex `a` toward hex `b` by t (0..1). */
export function mixHex(a, b, t) {
  const [ar, ag, ab] = hex(a), [br, bg, bb] = hex(b);
  const m = (x, y) => Math.round(x + (y - x) * t);
  return `rgb(${m(ar, br)},${m(ag, bg)},${m(ab, bb)})`;
}

// ── background: photo + bottom-weighted dark gradient ──────────────────────────
export function drawPhotoBg(ctx, img, W, H, { focusY = 0.45, scale = 1.06 } = {}) {
  if (img) drawCover(ctx, img, 0, 0, W, H, scale, focusY);
  else { ctx.fillStyle = '#0a1730'; ctx.fillRect(0, 0, W, H); }
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(6,10,20,0.42)');
  g.addColorStop(0.34, 'rgba(6,10,20,0.10)');
  g.addColorStop(1, 'rgba(6,10,20,0.90)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

// ── triple keyline frame (navy → white → red, inset) ───────────────────────────
export function drawFrame(ctx, W, H, unit = 1) {
  const bands = [[NAVY, 3], [WHITE, 3], [RED, 4]]; // widths scaled by unit
  let inset = 0;
  for (const [color, w] of bands) {
    const lw = w * unit;
    ctx.lineWidth = lw; ctx.strokeStyle = color;
    roundRect(ctx, inset + lw / 2, inset + lw / 2, W - inset * 2 - lw, H - inset * 2 - lw, 16 * unit);
    ctx.stroke();
    inset += lw;
  }
}

// ── crest: frosted 80%-white circle + crest image + stacked drop shadow ─────────
export function drawCrest(ctx, crestImg, cx, cy, r) {
  ctx.save();
  // stacked drop shadow (canvas draws one shadow at a time → layer two discs)
  for (const [blur, oy, a] of [[24, 9, 0.5], [11, 4, 0.7]]) {
    ctx.save();
    ctx.shadowColor = `rgba(0,0,0,${a})`; ctx.shadowBlur = blur; ctx.shadowOffsetY = oy;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fill();
    ctx.restore();
  }
  // frosted white disc (no shadow) + crest contained
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fill();
  if (crestImg) {
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    const s = r * 1.7; // crest sized to ~85% diameter
    ctx.drawImage(crestImg, cx - s / 2, cy - s / 2, s, s);
    ctx.restore();
  }
  ctx.restore();
}

// ── headline: progressive blur → outer stroke → complementary gradient fill + inner shadow
// lines: string[]; accent: 'red' | 'blue'; anchor 'center'|'left'; returns bottom y.
export function drawHeadline(ctx, lines, x, topY, { size, accent = 'red', anchor = 'center', maxW, lineGap = 0.9 } = {}) {
  const strokeColor = accent === 'blue' ? BLUE : RED;
  const complement = accent === 'blue' ? RED : BLUE; // blue-outline → red tint, red-outline → blue tint
  ctx.textAlign = anchor; ctx.textBaseline = 'alphabetic';
  let y = topY + size;
  for (const raw of lines) {
    const line = raw.toUpperCase();
    const fs = maxW ? fitFont(ctx, line, 900, size, maxW) : size;
    ctx.font = `900 ${fs}px "${HEAD}"`;

    // 1) progressive blur behind (tight → wide dark halo)
    ctx.save();
    for (const [blur, a] of [[8, 0.9], [18, 0.55]]) {
      ctx.shadowColor = `rgba(0,0,0,${a})`; ctx.shadowBlur = blur; ctx.shadowOffsetY = blur / 4;
      ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillText(line, x, y);
    }
    ctx.restore();

    // 2) outer stroke (draw 2× width, fill covers inner half → stroke sits outside)
    ctx.save();
    ctx.lineJoin = 'round'; ctx.miterLimit = 2;
    ctx.lineWidth = fs * 0.05; // ~1.25px at ~25px scaled; ~ proportional at large sizes
    ctx.strokeStyle = strokeColor; ctx.strokeText(line, x, y);
    ctx.restore();

    // 3) fill: vertical gradient = inner-shadow dark top → white → complement tint bottom
    const g = ctx.createLinearGradient(0, y - fs * 0.82, 0, y);
    g.addColorStop(0, mixHex(WHITE, '#000000', 0.18)); // recessed top edge (inner shadow)
    g.addColorStop(0.3, WHITE);
    g.addColorStop(0.7, WHITE);
    g.addColorStop(1, mixHex(WHITE, complement, 0.10)); // 10% complementary tint at bottom
    ctx.fillStyle = g; ctx.fillText(line, x, y);

    y += fs * lineGap + fs * 0.14;
  }
  return y;
}

// ── framed kicker chip (red/blue border, translucent fill, drop shadow) ─────────
export function drawKicker(ctx, label, cx, cy, { accent = 'red', size = 30 } = {}) {
  const color = accent === 'blue' ? BLUE : RED;
  ctx.font = `800 ${size}px "${HEAD}"`;
  const padX = size * 0.55, h = size * 1.55;
  const w = ctx.measureText(label.toUpperCase()).width + padX * 2;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = size * 0.4; ctx.shadowOffsetY = size * 0.12;
  roundRect(ctx, cx - w / 2, cy - h / 2, w, h, h * 0.22);
  ctx.fillStyle = accent === 'blue' ? 'rgba(58,111,224,0.30)' : 'rgba(191,10,48,0.30)'; ctx.fill();
  ctx.restore();
  roundRect(ctx, cx - w / 2, cy - h / 2, w, h, h * 0.22);
  ctx.lineWidth = Math.max(2, size * 0.07); ctx.strokeStyle = color; ctx.stroke();
  ctx.fillStyle = WHITE; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = size * 0.2;
  ctx.fillText(label.toUpperCase(), cx, cy + 1); ctx.restore();
  return { w, h };
}

// ── footer: drop-shadow text (no band) ──────────────────────────────────────────
export function drawFooter(ctx, W, H, text = 'AMERICAN HEROES & BREW · CARLSBAD VILLAGE', size = 30) {
  ctx.save();
  ctx.font = `800 ${size}px "${HEAD}"`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(0,0,0,0.95)'; ctx.shadowBlur = size * 0.5; ctx.shadowOffsetY = size * 0.1;
  ctx.fillStyle = WHITE; ctx.fillText(text, W / 2, H - size * 1.4);
  ctx.restore();
}

/** deterministic variant index for a given date key + variant count (spaces repeats). */
export function pickVariant(dateKey, n) {
  if (n <= 1) return 0;
  let h = 0; for (const c of String(dateKey)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % n;
}
