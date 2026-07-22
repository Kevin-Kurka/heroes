/**
 * Feed poster renderer — 4:5 (1080×1350) branded stills for the IG/FB FEED, built
 * entirely on brand-kit (v11 look) so they match the schedule/matchup cards by
 * construction: polished photo + bottom-weighted dark gradient, triple keyline,
 * frosted crest (top-left), framed kicker chip, outlined/gradient headline, and the
 * drop-shadow footer. Output JPEG (what IG feed ingests) to public/promos/<slug>-feed.jpg.
 *
 * Run: node scripts/specials-video/feed-poster-render.mjs        (renders all)
 *      node scripts/specials-video/feed-poster-render.mjs wings  (one slug)
 */
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as BK from './lib/brand-kit.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PUB = join(HERE, '..', '..', 'public');
const W = 1080, H = 1350, U = W / 200;

// Each post: polished photo + kicker chip + 1–2-line headline + subline. Accent
// alternates red/blue (v11 complementary look). slug → public/promos/<slug>-feed.jpg
const POSTS = [
  { slug: 'wings',        img: 'buffalo-wings.jpg',             kicker: 'Wing Wednesday', lines: ['Buffalo Wings'],   sub: 'Tossed to order · wells $6',            accent: 'red' },
  { slug: 'juicy-lucy',   img: 'minneapolis-juicy-lucy.jpg',    kicker: 'Burgers & Beer', lines: ['Juicy Lucy'],      sub: 'Cheese-stuffed · griddled to order',    accent: 'blue' },
  { slug: 'french-dip',   img: 'los-angeles-sandwich.jpg',      kicker: 'Hero Sandwich',  lines: ['The Los', 'Angeles'], sub: 'French dip · roast beef · au jus',   accent: 'red' },
  { slug: 'chx-sliders',  img: 'sliders.jpg',                   kicker: 'Shareables',     lines: ['Sliders'],         sub: 'Crispy chicken · bacon · all the fixings', accent: 'blue' },
  { slug: 'loaded-fries', img: 'cheesesteak-fries.jpg',         kicker: 'Loaded Fries',   lines: ['Cheesesteak', 'Fries'], sub: 'Steak · melted cheese · signature sauce', accent: 'red' },
  { slug: 'hoboken',      img: 'hoboken-sandwich.jpg',          kicker: 'Hero Sandwich',  lines: ['The Hoboken'],     sub: 'Italian deli meats · provolone · fresh', accent: 'blue' },
  { slug: 'gameday-hq',   img: 'venue.jpg',                     kicker: 'Game Day HQ',    lines: ['Watch It', 'Here'], sub: '16 TVs · cold drafts · Carlsbad Village', accent: 'red' },
  { slug: 'fried-pickles',img: 'fried-pickles.jpg',             kicker: 'Appetizers',     lines: ['Fried Pickles'],   sub: 'Crunchy · tangy · dangerously snackable', accent: 'blue' },
  { slug: 'hero-stack',   img: 'hero-sandwich-unspecified.jpg', kicker: 'Hero Sandwich',  lines: ['Stacked High'],    sub: 'Made to order · piled high',            accent: 'red' },
  { slug: 'hiring',       img: 'venue.jpg',                     kicker: 'Join the Team',  lines: ['Now Hiring'],      sub: 'All positions · apply inside or DM us', accent: 'red' },
];

const crest = await loadImage(join(PUB, 'icon-512.png'));
const only = (process.argv[2] || '').toLowerCase();

for (const p of POSTS) {
  if (only && p.slug !== only) continue;
  const bg = await loadImage(join(PUB, 'images', 'polished', p.img));
  const c = createCanvas(W, H); const ctx = c.getContext('2d');

  BK.drawPhotoBg(ctx, bg, W, H, { focusY: 0.42, scale: 1.06 });
  BK.drawFrame(ctx, W, H, U);
  BK.drawCrest(ctx, crest, 134, 134, 78); // top-left corner (feed placement)

  const twoLine = p.lines.length > 1;
  const size = twoLine ? 116 : 150;
  const hlTop = twoLine ? 838 : 936;
  BK.drawKicker(ctx, p.kicker, W / 2, hlTop - 30, { accent: p.accent, size: 40 });
  const hb = BK.drawHeadline(ctx, p.lines, W / 2, hlTop, { size, accent: p.accent, anchor: 'center', maxW: W - 150 });

  ctx.save();
  ctx.font = `600 46px "${BK.HEAD}"`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 3;
  ctx.fillStyle = '#eef2f7'; ctx.fillText(p.sub, W / 2, hb + 8);
  ctx.restore();

  BK.drawFooter(ctx, W, H, 'AMERICAN HEROES & BREW · CARLSBAD VILLAGE', 30);

  const out = join(PUB, 'promos', `${p.slug}-feed.jpg`);
  writeFileSync(out, c.toBuffer('image/jpeg', { quality: 0.9 }));
  console.log('wrote', out);
}
