/**
 * Mux the royalty-free track onto already-rendered scratch-off videos WITHOUT
 * re-encoding the video (fast). Loudness-normalized, faded in/out, trimmed to 6s.
 *
 * Track: public/promos-video/audio/track.mp3  (Mixkit "One More Dance" — Mixkit Free
 * License, no attribution required). Drop a different track at that path to swap.
 *
 * Run:  node scripts/specials-video/add-audio.mjs taco-1.mp4 taco-2.mp4 ...
 */
import { execFileSync } from 'node:child_process';
import { renameSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..', '..', 'public', 'promos-video');
const AUDIO_DIR = join(OUT, 'audio');
const SECONDS = 6;

const files = process.argv.slice(2);
if (!files.length) { console.error('usage: add-audio.mjs <file.mp4>...'); process.exit(1); }

for (const f of files) {
  const p = f.startsWith('/') ? f : join(OUT, f);
  if (!existsSync(p)) { console.error('skip (missing)', p); continue; }
  // <key>-<n>.mp4 → this day's track, else the generic track.mp3
  const key = basename(p).replace(/-\d+\.mp4$/, '');
  const AUDIO = [join(AUDIO_DIR, `${key}.mp3`), join(AUDIO_DIR, 'track.mp3')].find(existsSync);
  if (!AUDIO) { console.error('no track for', key); continue; }
  const tmp = p.replace(/\.mp4$/, '.aud.mp4');
  execFileSync('ffmpeg', [
    '-y', '-i', p, '-i', AUDIO,
    '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k',
    '-af', `afade=t=in:st=0:d=0.2,afade=t=out:st=${SECONDS - 0.6}:d=0.6,loudnorm=I=-15:TP=-1.5:LRA=11,aresample=44100`,
    '-t', String(SECONDS), '-shortest', '-movflags', '+faststart', tmp,
  ], { stdio: ['ignore', 'ignore', 'inherit'] });
  renameSync(tmp, p);
  console.log('audio +', basename(p), '←', basename(AUDIO));
}
