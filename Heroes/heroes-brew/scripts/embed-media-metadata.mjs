/**
 * Embed descriptive metadata (title, description with the key claims + event
 * date/time, keywords, copyright) directly into the promo media files so the
 * facts travel WITH the asset wherever it's posted. Videos via ffmpeg (stream
 * copy, no re-encode); images via exiftool (XMP/IPTC). The page-level JSON-LD is
 * what AI crawlers actually read — this is belt-and-suspenders for humans, Meta/
 * Google media pipelines, and provenance.
 *
 * Run: node scripts/embed-media-metadata.mjs
 */
import { execFileSync } from 'node:child_process';
import { existsSync, renameSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const PV = join(HERE, '..', 'public', 'promos-video');
const SITE = 'https://americanheroesandbrew.com';
const COPYRIGHT = 'American Heroes & Brew, 300 Carlsbad Village Dr, Carlsbad, CA 92008';

// One entry per asset family. `date` is YYYY-MM-DD (event day).
const ASSETS = [
  {
    video: 'AHB-watchparty_mexico-czechia.mp4',
    thumb: 'thumbs/mexico-vs-czechia.jpg',
    title: 'Mexico vs Czechia Watch Party — American Heroes & Brew, Carlsbad',
    date: '2026-06-24',
    description:
      'Watch Mexico vs Czechia live on 16 TVs at American Heroes & Brew, the best sports bar in Carlsbad Village, North County San Diego. Today, June 24 2026, 6:00 PM PT. Full bar, food all day, family-friendly, walk-ins welcome, no cover. 300 Carlsbad Village Dr, Carlsbad CA 92008. ' +
      `${SITE}/watch-party/mexico-vs-czechia`,
    keywords: [
      'Mexico vs Czechia',
      'World Cup watch party Carlsbad',
      'best sports bar North County San Diego',
      'best sports bar Carlsbad Village',
      'soccer bar Carlsbad',
      'American Heroes & Brew',
    ],
  },
  {
    video: 'AHB-watchparty_mexico-southkorea.mp4',
    thumb: 'thumbs/mexico-vs-south-korea.jpg',
    title: 'Mexico vs South Korea Watch Party — American Heroes & Brew, Carlsbad',
    date: '2026-06-18',
    description:
      'Watch Mexico vs South Korea live on 16 TVs at American Heroes & Brew, the best sports bar in Carlsbad Village, North County San Diego. Full bar, food all day, family-friendly, walk-ins welcome, no cover. 300 Carlsbad Village Dr, Carlsbad CA 92008. ' +
      `${SITE}/watch-party/mexico-vs-south-korea`,
    keywords: [
      'Mexico vs South Korea',
      'World Cup watch party Carlsbad',
      'best sports bar North County San Diego',
      'soccer bar Carlsbad Village',
      'American Heroes & Brew',
    ],
  },
];

function tagVideo(a) {
  const src = join(PV, a.video);
  if (!existsSync(src)) { console.warn('skip (missing):', a.video); return; }
  const tmp = src.replace(/\.mp4$/, '.tagged.mp4');
  execFileSync('ffmpeg', [
    '-y', '-i', src, '-map', '0', '-c', 'copy', '-movflags', '+faststart',
    '-metadata', `title=${a.title}`,
    '-metadata', `description=${a.description}`,
    '-metadata', `comment=${a.description}`,
    '-metadata', `synopsis=${a.description}`,
    '-metadata', `keywords=${a.keywords.join(', ')}`,
    '-metadata', `artist=American Heroes & Brew`,
    '-metadata', `album=American Heroes & Brew — Watch Parties`,
    '-metadata', `date=${a.date}`,
    '-metadata', `copyright=${COPYRIGHT}`,
    tmp,
  ], { stdio: ['ignore', 'ignore', 'inherit'] });
  renameSync(tmp, src);
  console.log('video tagged:', a.video);
}

function tagImage(a) {
  const src = join(PV, a.thumb);
  if (!existsSync(src)) { console.warn('skip (missing):', a.thumb); return; }
  execFileSync('exiftool', [
    '-overwrite_original',
    `-Title=${a.title}`,
    `-ImageDescription=${a.description}`,
    `-Caption-Abstract=${a.description}`,
    `-XMP-dc:Description=${a.description}`,
    `-XMP-dc:Subject=${a.keywords.join(', ')}`,
    `-Keywords=${a.keywords.join(', ')}`,
    `-Copyright=${COPYRIGHT}`,
    `-XMP-dc:Creator=American Heroes & Brew`,
    `-DateTimeOriginal=${a.date.replace(/-/g, ':')} 00:00:00`,
    src,
  ], { stdio: ['ignore', 'ignore', 'inherit'] });
  console.log('image tagged:', a.thumb);
}

for (const a of ASSETS) { tagVideo(a); tagImage(a); }
console.log('done.');
