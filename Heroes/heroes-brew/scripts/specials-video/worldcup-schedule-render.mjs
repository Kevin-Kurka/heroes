/**
 * World Cup daily-schedule posters — one 1080×1920 (9:16 Story) poster per game-day for
 * the rest of the FIFA World Cup 2026, rendered for American Heroes & Brew.
 *
 * Source: ESPN's public soccer scoreboard API (the same feed lib/events.ts already uses).
 * Each poster lists that day's matches with bold team flags, team names, and kickoff times
 * converted to Pacific time. Knockout fixtures whose teams aren't decided yet render as a
 * TBD placeholder card with a "follow for the matchup" reminder.
 *
 * Background: scripts/specials-video/_worldcup/stadium-bg.jpg (cover-cropped + slow-zoom-safe).
 *
 * Output:  public/promos/wc-schedule-YYYY-MM-DD.jpg   (one per game-day)
 *          scripts/specials-video/_worldcup/manifest.json   (drives the sheet wiring)
 * Run:     node scripts/specials-video/worldcup-schedule-render.mjs
 */
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(HERE, '..', '..', 'public');
const OUT_DIR = join(PUBLIC, 'promos');
const WORK = join(HERE, '_worldcup');
const FLAGS = join(WORK, 'flags');
const BG_PATH = join(WORK, 'stadium-bg.jpg');

const TZ = 'America/Los_Angeles';
const START = '20260625';
const END = '20260720';

// ── fonts ───────────────────────────────────────────────────────────────────
for (const p of ['/System/Library/Fonts/Avenir Next Condensed.ttc', '/System/Library/Fonts/Avenir Next.ttc']) {
  try { GlobalFonts.registerFromPath(p); } catch { /* fall back */ }
}
const HEAD = GlobalFonts.families.some((f) => /Avenir Next Condensed/.test(f.family))
  ? 'Avenir Next Condensed'
  : (GlobalFonts.families.some((f) => /Avenir Next/.test(f.family)) ? 'Avenir Next' : 'sans-serif');

const W = 1080, H = 1920;
const AMBER = '#f59e0b';
const WHITE = '#ffffff';
const INK = '#0b0d12';

// ── helpers ───────────────────────────────────────────────────────────────────
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const easeOut = (t) => 1 - Math.pow(1 - clamp01(t), 3);

function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCover(ctx, img, x, y, w, h, scale = 1, focusY = 0.5) {
  const ar = img.width / img.height;
  let dw = w * scale, dh = dw / ar;
  if (dh < h * scale) { dh = h * scale; dw = dh * ar; }
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) * focusY, dw, dh);
}

// shrink font until text fits maxW
function fitFont(ctx, text, weight, startPx, maxW, family = HEAD) {
  let px = startPx;
  do {
    ctx.font = `${weight} ${px}px "${family}"`;
    if (ctx.measureText(text).width <= maxW) break;
    px -= 2;
  } while (px > 12);
  return px;
}

function text(ctx, str, x, y, font, fill, { align = 'center', stroke, strokeW, shadow } = {}) {
  ctx.font = font; ctx.textAlign = align; ctx.textBaseline = 'middle';
  if (shadow) { ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = shadow; ctx.shadowOffsetY = Math.round(shadow / 4); }
  if (stroke) { ctx.lineWidth = strokeW; ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.strokeText(str, x, y); }
  ctx.fillStyle = fill; ctx.fillText(str, x, y);
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
}

// ── flag badge: dark rounded plate + flag drawn "contain" + crisp white border ──
function flagBadge(ctx, img, cx, cy, bw, bh) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5;
  roundRect(ctx, cx - bw / 2, cy - bh / 2, bw, bh, 12);
  ctx.fillStyle = '#10141c'; ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.save();
  roundRect(ctx, cx - bw / 2, cy - bh / 2, bw, bh, 12); ctx.clip();
  if (img) {
    // contain
    const ar = img.width / img.height, br = bw / bh;
    let dw = bw, dh = bh;
    if (ar > br) { dh = bw / ar; } else { dw = bh * ar; }
    ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  } else {
    text(ctx, '?', cx, cy + 2, `800 ${Math.round(bh * 0.6)}px "${HEAD}"`, '#5b667a');
  }
  ctx.restore();
  // bold white border
  roundRect(ctx, cx - bw / 2, cy - bh / 2, bw, bh, 12);
  ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.92)'; ctx.stroke();
  ctx.restore();
}

// ── data ──────────────────────────────────────────────────────────────────────
const fmtTime = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' });
const fmtDayKey = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
const fmtWeekday = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'long' });
const fmtMonthDay = new Intl.DateTimeFormat('en-US', { timeZone: TZ, month: 'long', day: 'numeric' });

// ESPN names a knockout fixture by the round that FEEDS it (e.g. "Round of 32 N Winner"
// is actually a Round of 16 match). Map the feeder text → the actual round being played.
function roundLabel(name) {
  if (/Semifinal.*Loser/i.test(name)) return 'Third-Place Match';
  if (/Semifinal.*Winner/i.test(name)) return 'Final';
  if (/Quarterfinal/i.test(name)) return 'Semifinal';
  if (/Round of 16/i.test(name)) return 'Quarterfinal';
  if (/Round of 32/i.test(name)) return 'Round of 16';
  if (/(Group|Place|Winner|Runner)/i.test(name)) return 'Round of 32';
  return ''; // group-stage match with two real teams
}

// A competitor side is undecided when it has no flag or its name is a bracket placeholder.
function sideTbd(team) {
  return !team.logo || /Group|Place|Winner|Runner|TBD|Round of|Quarterfinal|Semifinal/i.test(team.displayName || '');
}

// Compact, readable label for an undecided side (shown beside a "?" badge).
function shortDesc(n) {
  if (!n) return 'TBD';
  return n
    .replace(/Third Place Group[\sA-L/]+/i, 'Best 3rd Place')
    .replace(/Group ([A-L]) 2nd Place/i, 'Group $1 · 2nd')
    .replace(/Group ([A-L]) Winner/i, 'Group $1 · 1st')
    .replace(/([A-L]) 2nd Place/i, 'Group $1 · 2nd')
    .replace(/Round of 32 (\d+) Winner/i, 'R32 Winner $1')
    .replace(/Round of 16 (\d+) Winner/i, 'R16 Winner $1')
    .replace(/Quarterfinal (\d+) Winner/i, 'QF Winner $1')
    .replace(/Semifinal (\d+) Winner/i, 'SF Winner $1')
    .replace(/Semifinal (\d+) Loser/i, 'SF Loser $1')
    .trim();
}

async function fetchSchedule() {
  const base = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=';
  // ESPN caps a date-RANGE response at ~50 events, so fetch one day at a time and dedupe.
  const ids = new Set();
  const raw = [];
  const s = new Date(Date.UTC(2026, 5, 25)), end = new Date(Date.UTC(2026, 6, 20));
  for (let d = new Date(s); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const ds = d.toISOString().slice(0, 10).replace(/-/g, '');
    const res = await fetch(base + ds);
    if (!res.ok) continue;
    const data = await res.json();
    for (const e of data.events || []) { if (!ids.has(e.id)) { ids.add(e.id); raw.push(e); } }
  }

  const days = new Map();
  for (const e of raw) {
    const comp = e.competitions[0];
    const when = new Date(e.date);
    const dayKey = fmtDayKey.format(when); // YYYY-MM-DD in PT
    const home = comp.competitors.find((c) => c.homeAway === 'home') || comp.competitors[0];
    const away = comp.competitors.find((c) => c.homeAway === 'away') || comp.competitors[1];
    const side = (t) => {
      const tbd = sideTbd(t.team);
      return { name: tbd ? shortDesc(t.team.displayName) : t.team.displayName, logo: tbd ? '' : (t.team.logo || ''), tbd };
    };
    const g = {
      utc: e.date,
      time: fmtTime.format(when),
      home: side(home),
      away: side(away),
      venue: comp.venue?.fullName || '',
      round: roundLabel(e.name || ''),
    };
    if (!days.has(dayKey)) days.set(dayKey, { dayKey, when, games: [] });
    days.get(dayKey).games.push(g);
  }
  const out = [...days.values()].sort((a, b) => a.dayKey.localeCompare(b.dayKey));
  for (const d of out) d.games.sort((a, b) => a.utc.localeCompare(b.utc));
  return out;
}

async function cacheFlag(logo) {
  if (!logo) return null;
  const id = logo.split('/').slice(-2).join('_').replace(/[^\w.]/g, '_');
  const fp = join(FLAGS, id);
  if (!existsSync(fp)) {
    try {
      const r = await fetch(logo);
      if (!r.ok) return null;
      writeFileSync(fp, Buffer.from(await r.arrayBuffer()));
    } catch { return null; }
  }
  try { return await loadImage(fp); } catch { return null; }
}

// ── render one day ──────────────────────────────────────────────────────────────
async function renderDay(day, bg) {
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');

  // background: stadium, cover-cropped, focus slightly above center, gentle zoom for crop framing
  drawCover(ctx, bg, 0, 0, W, H, 1.18, 0.42);

  // global darken + bottom-weighted gradient so text pops
  ctx.fillStyle = 'rgba(7,9,14,0.46)'; ctx.fillRect(0, 0, W, H);
  let g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(7,9,14,0.78)');
  g.addColorStop(0.16, 'rgba(7,9,14,0.30)');
  g.addColorStop(0.62, 'rgba(7,9,14,0.34)');
  g.addColorStop(1, 'rgba(7,9,14,0.86)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // ── header ──
  // amber kicker chip
  const kick = 'FIFA WORLD CUP 2026';
  ctx.font = `800 38px "${HEAD}"`;
  const kw = ctx.measureText(kick).width + 64;
  roundRect(ctx, W / 2 - kw / 2, 96, kw, 70, 35); ctx.fillStyle = AMBER; ctx.fill();
  text(ctx, kick, W / 2, 132, `800 38px "${HEAD}"`, INK, { });

  text(ctx, 'TODAY’S SCHEDULE', W / 2, 232, `800 104px "${HEAD}"`, WHITE, { stroke: INK, strokeW: 8, shadow: 22 });

  // date line
  const weekday = fmtWeekday.format(day.when).toUpperCase();
  const monthday = fmtMonthDay.format(day.when).toUpperCase();
  text(ctx, `${weekday} · ${monthday}`, W / 2, 320, `700 50px "${HEAD}"`, AMBER, { shadow: 12 });

  // accent rule
  ctx.fillStyle = AMBER; ctx.fillRect(W / 2 - 120, 360, 240, 7);

  // ── match cards ──
  const TOP = 410, BOT = 1715;
  const region = BOT - TOP;
  const n = day.games.length;
  const gap = n > 6 ? 16 : 24;
  const maxH = n <= 1 ? 320 : (n <= 2 ? 300 : (n <= 4 ? 262 : 210));
  const cardH = Math.min(maxH, Math.floor((region - gap * (n - 1)) / n));
  const totalH = cardH * n + gap * (n - 1);
  const cardW = W - 120;
  const x0 = 60;
  let y = TOP + Math.max(0, Math.floor((region - totalH) / 2)); // center the stack

  for (const m of day.games) {
    const anyTbd = m.home.tbd || m.away.tbd;
    const knockout = !!m.round;
    // card plate
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
    roundRect(ctx, x0, y, cardW, cardH, 26);
    ctx.fillStyle = knockout ? 'rgba(18,22,31,0.78)' : 'rgba(15,19,28,0.82)';
    ctx.fill();
    ctx.restore();
    roundRect(ctx, x0, y, cardW, cardH, 26);
    ctx.lineWidth = 2; ctx.strokeStyle = knockout ? 'rgba(245,158,11,0.40)' : 'rgba(255,255,255,0.12)'; ctx.stroke();

    // left time block (with optional round tag above the time)
    const timeBoxW = 210;
    ctx.fillStyle = AMBER; ctx.fillRect(x0, y + 18, 7, cardH - 36);
    const cy = y + cardH / 2;
    if (knockout) {
      const rl = m.round.toUpperCase();
      text(ctx, rl, x0 + 30, cy - cardH * 0.24, `800 ${fitFont(ctx, rl, 800, 34, timeBoxW - 18)}px "${HEAD}"`, AMBER, { align: 'left' });
    }
    const tFs = fitFont(ctx, m.time, 800, 56, timeBoxW - 26);
    text(ctx, m.time, x0 + 30, knockout ? cy + 6 : cy - 16, `800 ${tFs}px "${HEAD}"`, WHITE, { align: 'left' });
    text(ctx, 'PT', x0 + 30, knockout ? cy + cardH * 0.26 : cy + 26, `700 30px "${HEAD}"`, AMBER, { align: 'left' });

    // right matchup zone — each side renders independently (real team or "?" placeholder)
    const zoneX = x0 + timeBoxW + 6;
    const zoneW = cardW - timeBoxW - 30;
    const zoneCx = zoneX + zoneW / 2;
    const bw = Math.min(92, Math.round(cardH * 0.42)), bh = Math.round(bw * 0.66);
    const my = anyTbd ? cy - cardH * 0.10 : cy; // lift matchup to make room for the reminder
    const nameMaxW = zoneW / 2 - bw - 64;

    // home (left-aligned, flag on the inner-left edge)
    flagBadge(ctx, m.home.tbd ? null : m.home.img, zoneX + bw / 2 + 4, my, bw, bh);
    text(ctx, m.home.name, zoneX + bw + 24, my, `800 ${fitFont(ctx, m.home.name, 800, 44, nameMaxW)}px "${HEAD}"`,
      m.home.tbd ? '#aab4c4' : WHITE, { align: 'left', shadow: 10 });
    // away (right-aligned, flag on the outer-right edge)
    flagBadge(ctx, m.away.tbd ? null : m.away.img, zoneX + zoneW - bw / 2 - 4, my, bw, bh);
    text(ctx, m.away.name, zoneX + zoneW - bw - 24, my, `800 ${fitFont(ctx, m.away.name, 800, 44, nameMaxW)}px "${HEAD}"`,
      m.away.tbd ? '#aab4c4' : WHITE, { align: 'right', shadow: 10 });
    text(ctx, 'VS', zoneCx, my, `800 38px "${HEAD}"`, AMBER, { shadow: 8 });

    if (anyTbd) {
      text(ctx, 'Matchup set by the bracket — follow for the reveal', zoneCx, cy + cardH * 0.30,
        `600 28px "${HEAD}"`, '#c7d0de', {});
    }

    y += cardH + gap;
  }

  // ── footer banner ──
  const fbY = 1740;
  g = ctx.createLinearGradient(0, fbY, W, fbY);
  g.addColorStop(0, '#b45309'); g.addColorStop(0.5, AMBER); g.addColorStop(1, '#b45309');
  roundRect(ctx, 40, fbY, W - 80, 96, 22); ctx.fillStyle = g; ctx.fill();
  text(ctx, 'WATCH EVERY MATCH AT AMERICAN HEROES & BREW', W / 2, fbY + 40, `800 ${fitFont(ctx, 'WATCH EVERY MATCH AT AMERICAN HEROES & BREW', 800, 40, W - 140)}px "${HEAD}"`, INK, {});
  text(ctx, 'Carlsbad Village  ·  @americanheroesandbrew', W / 2, fbY + 74, `600 30px "${HEAD}"`, '#1c1206', {});

  return c.toBuffer('image/jpeg', { quality: 0.92 });
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(FLAGS, { recursive: true });
  const bg = await loadImage(BG_PATH);
  const days = await fetchSchedule();
  console.log(`fetched ${days.length} game-days, ${days.reduce((s, d) => s + d.games.length, 0)} matches`);

  // preload all flags
  for (const d of days) for (const g of d.games) {
    g.home.img = await cacheFlag(g.home.logo);
    g.away.img = await cacheFlag(g.away.logo);
  }

  const manifest = [];
  for (const d of days) {
    const buf = await renderDay(d, bg);
    const file = `wc-schedule-${d.dayKey}.jpg`;
    writeFileSync(join(OUT_DIR, file), buf);

    // caption pieces for the sheet
    const lines = d.games.map((m) => {
      const tag = m.round ? `[${m.round}] ` : '';
      return `• ${tag}${m.home.name} vs ${m.away.name} · ${m.time} PT`;
    });
    const wd = fmtWeekday.format(d.when), md = fmtMonthDay.format(d.when);
    manifest.push({
      dayKey: d.dayKey,
      file,
      games: d.games.length,
      headline: `⚽ World Cup Today — ${wd}, ${md}`,
      caption: `${lines.join('\n')}\n\nEvery match on the big screens at American Heroes & Brew. Cold beer, full menu, best seats in Carlsbad Village. ⚽🍺`,
      storyCaption: `World Cup all day at Heroes ⚽ Who you got?`,
      tags: '#WorldCup2026 #FIFAWorldCup #CarlsbadVillage #AmericanHeroesAndBrew #SportsBar #WatchParty #SoccerBar',
    });
    console.log(`  ${file}  (${d.games.length} games)`);
  }
  writeFileSync(join(WORK, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\nwrote ${manifest.length} posters + manifest.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });
