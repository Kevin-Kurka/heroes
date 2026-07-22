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
// Each headline is the REAL menu item; each sub is that item's actual description
// (from src/lib/menu.ts). Photos verified against their source names + contents so
// the image matches the item shown.
const POSTS = [
  { slug: 'wings',        img: 'buffalo-wings.jpg',          kicker: 'Wing Wednesday', lines: ['Wings'],                sub: '8 tossed to order · Buffalo · Mango Hab · Old Bay',       accent: 'red' },
  { slug: 'juicy-lucy',   img: 'minneapolis-juicy-lucy.jpg', kicker: 'Hero Burger',    lines: ['Juicy Lucy'],           sub: '½lb patty stuffed with American cheese · Hero sauce',    accent: 'blue' },
  { slug: 'philly',       img: 'philly-billy-sandwich.jpg',  kicker: 'Philly Billy',   lines: ['Philly', 'Cheesesteak'],sub: 'Thin-sliced grilled ribeye · your choice of cheese',     accent: 'red' },
  { slug: 'kalua-sliders',img: 'kalua-pork-sliders.jpg',     kicker: 'Mahalo Monday',  lines: ['Kalua Pork', 'Sliders'],sub: '3 on a brioche bun · coleslaw & aloha sauce',            accent: 'blue' },
  { slug: 'nachos',       img: 'chicken-nachos.jpg',         kicker: 'Shareables',     lines: ['Nachos'],               sub: 'Cheddar jack · AHB Wiz · beans · jalapeños · guac',      accent: 'red' },
  { slug: 'hoboken',      img: 'hoboken-sandwich.jpg',       kicker: 'Italian Hero',   lines: ['The Hoboken'],          sub: 'Ham · salami · capicola · provolone · oil & vinegar',    accent: 'blue' },
  { slug: 'friar-frank',  img: 'friar-frank.jpg',            kicker: 'Padres Game Days',lines: ['Friar Frank'],         sub: 'Stadium dog · grilled onions & relish · $6 on game days', accent: 'red' },
  { slug: 'tacos',        img: 'village-tacos.jpg',          kicker: 'Taco Tuesday',   lines: ['Village Tacos'],        sub: '3 street tacos · carnitas · carne asada · baja fish',    accent: 'blue' },
  { slug: 'pasadena',     img: 'pasadena-burger.jpg',        kicker: 'Hero Burger',    lines: ['The Pasadena'],         sub: 'OG cheeseburger · American cheese · Hero sauce',         accent: 'red' },
  { slug: 'hiring',       img: 'venue.jpg',                  kicker: 'Join the Team',  lines: ['Now Hiring'],           sub: 'All positions · apply inside or DM us',                  accent: 'red' },
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
