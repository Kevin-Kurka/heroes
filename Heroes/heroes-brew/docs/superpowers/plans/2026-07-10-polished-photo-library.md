# Polished Photo Library — Implementation Plan (Phase 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce one polished, professional image per subject/menu-item in `public/images/polished/` (deduped, best-of), plus a manifest, as the single photo source for all posters + OG images.

**Architecture:** Pure selection logic (`selectBestPerSlug`) picks the highest-quality entry per slug from `classified-photos.json` (this is the dedup/merge). A pipeline script enhances each survivor with `sharp` and writes it to `public/images/polished/<slug>.jpg` with a `manifest.json`. A gap report lists menu items still lacking a photo (backfill later via vision on the ~57 unclassified `_source/new` + `menu2` photos).

**Tech Stack:** Node ESM, `sharp` (installed), `vitest` (repo test runner).

This is Phase 1 of the Branded Media System spec (`docs/superpowers/specs/2026-07-10-branded-media-system-design.md`). Phases 2–5 (brand-kit, `/api/media` route, OG fix, sheet wiring) are separate plans.

---

### Task 1: Pure selection logic (dedup → best per subject)

**Files:**
- Create: `scripts/lib/curate.mjs`
- Test: `scripts/lib/curate.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// scripts/lib/curate.test.mjs
import { describe, it, expect } from 'vitest';
import { selectBestPerSlug } from './curate.mjs';

const rows = [
  { filename: 'a.jpg', slug: 'beer', quality: 3, path: '/x/a.jpg' },
  { filename: 'b.jpg', slug: 'beer', quality: 5, path: '/x/b.jpg' },   // best beer
  { filename: 'c.jpg', slug: 'beer', quality: 5, path: '/x/c.jpg' },   // tie -> stable by path
  { filename: 'd.jpg', slug: 'tacos', quality: 4, path: '/x/d.jpg' },
  { filename: 'e.jpg', slug: 'tacos', quality: null, path: '/x/e.jpg' }, // missing quality -> treated as 0
];

describe('selectBestPerSlug', () => {
  it('keeps exactly one entry per slug (dedup/merge)', () => {
    const out = selectBestPerSlug(rows);
    expect(out.map(r => r.slug).sort()).toEqual(['beer', 'tacos']);
  });
  it('picks the highest quality per slug', () => {
    const beer = selectBestPerSlug(rows).find(r => r.slug === 'beer');
    expect(beer.quality).toBe(5);
    expect(beer.filename).toBe('b.jpg'); // tie broken deterministically by path asc
  });
  it('treats missing quality as lowest', () => {
    const tacos = selectBestPerSlug(rows).find(r => r.slug === 'tacos');
    expect(tacos.filename).toBe('d.jpg');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run scripts/lib/curate.test.mjs`
Expected: FAIL — `selectBestPerSlug is not a function` / cannot find `./curate.mjs`.

- [ ] **Step 3: Write minimal implementation**

```js
// scripts/lib/curate.mjs
/** From classified rows, return exactly one row per slug: the highest quality
 *  (missing quality => 0), ties broken deterministically by path ascending.
 *  This is the dedup/merge step — many photos of one subject collapse to the best. */
export function selectBestPerSlug(rows) {
  const best = new Map();
  for (const r of rows) {
    const q = typeof r.quality === 'number' ? r.quality : 0;
    const cur = best.get(r.slug);
    if (!cur) { best.set(r.slug, r); continue; }
    const cq = typeof cur.quality === 'number' ? cur.quality : 0;
    if (q > cq || (q === cq && String(r.path) < String(cur.path))) best.set(r.slug, r);
  }
  return [...best.values()];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run scripts/lib/curate.test.mjs`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git -C /Users/kmk add Heroes/heroes-brew/scripts/lib/curate.mjs Heroes/heroes-brew/scripts/lib/curate.test.mjs
git -C /Users/kmk commit -m "feat(media): best-per-subject photo selection (dedup) for polished library"
```

---

### Task 2: Curation + enhancement pipeline

**Files:**
- Create: `scripts/curate-polished.mjs`
- Reads: `classified-photos.json`
- Writes: `public/images/polished/<slug>.jpg`, `public/images/polished/manifest.json`

- [ ] **Step 1: Write the pipeline script**

```js
// scripts/curate-polished.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { selectBestPerSlug } from './lib/curate.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const OUT = join(ROOT, 'public/images/polished');
const data = JSON.parse(readFileSync(join(ROOT, 'classified-photos.json'), 'utf8'));
const rows = data.classified || [];
const menuItems = data.menuItems || {};

mkdirSync(OUT, { recursive: true });

/** Consistent, subtle "pro" polish — auto-orient, cap size, gentle level + saturation,
 *  light sharpen, high-quality mozjpeg. Deliberately conservative so photos look
 *  professional without over-processing. */
async function enhance(srcPath, destPath) {
  await sharp(srcPath)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .modulate({ brightness: 1.03, saturation: 1.08 })
    .sharpen({ sigma: 0.8 })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(destPath);
}

const chosen = selectBestPerSlug(rows);
const manifest = [];
let ok = 0, missing = [];
for (const r of chosen) {
  if (!existsSync(r.path)) { missing.push(`${r.slug} (source missing: ${r.filename})`); continue; }
  const file = `${r.slug}.jpg`;
  await enhance(r.path, join(OUT, file));
  const meta = r.itemInfo || menuItems[r.slug] || {};
  manifest.push({ slug: r.slug, file: `images/polished/${file}`, category: meta.category || 'Uncategorized',
    display: meta.display || r.slug, source: r.filename, quality: r.quality ?? 0, note: r.note || '' });
  ok++;
  console.log(`  ${file}  (q${r.quality ?? 0}, from ${r.filename})`);
}
manifest.sort((a, b) => a.slug.localeCompare(b.slug));
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));

// gap report: menu-item slugs in the taxonomy with no polished photo
const have = new Set(manifest.map(m => m.slug));
const gaps = Object.keys(menuItems).filter(s => !have.has(s));
console.log(`\npolished ${ok} images -> public/images/polished/`);
if (missing.length) console.log(`skipped (source missing):\n  ${missing.join('\n  ')}`);
console.log(`\nMENU ITEMS STILL NEEDING A PHOTO (${gaps.length}):\n  ${gaps.join('\n  ') || '(none)'}`);
```

- [ ] **Step 2: Run the pipeline**

Run: `node scripts/curate-polished.mjs`
Expected: logs ~24 `<slug>.jpg` lines, then `polished 24 images`, then a gap list of menu items lacking photos.

- [ ] **Step 3: Verify outputs**

Run: `ls public/images/polished/*.jpg | wc -l && node -e "console.log(require('./public/images/polished/manifest.json').length)"`
Expected: file count == manifest length (~24). Then open 2–3 (`beer.jpg`, `minneapolis-juicy-lucy.jpg`, `village-tacos.jpg`) and eyeball — sharp, well-lit, no text baked in.

- [ ] **Step 4: Commit**

```bash
git -C /Users/kmk add Heroes/heroes-brew/scripts/curate-polished.mjs Heroes/heroes-brew/public/images/polished
git -C /Users/kmk commit -m "feat(media): polished photo library (best-per-subject, sharp-enhanced) + manifest"
```

---

### Task 3: Record the gap list for backfill

**Files:**
- Create: `public/images/polished/GAPS.md` (from Task 2 Step 2 output)

- [ ] **Step 1: Capture the gap report**

Paste the "MENU ITEMS STILL NEEDING A PHOTO" list from the pipeline run into `public/images/polished/GAPS.md` with a one-line header. These are the items to backfill by classifying the ~57 unclassified `_source/new` + `menu2` photos (vision pass) in a later phase.

- [ ] **Step 2: Commit**

```bash
git -C /Users/kmk add Heroes/heroes-brew/public/images/polished/GAPS.md
git -C /Users/kmk commit -m "docs(media): record photo-library gaps for backfill"
```

---

## Self-review

- **Spec coverage:** Implements spec §"Polished photo library (#4)" — classification source, dedup/merge (Task 1), enhance (Task 2), `public/images/polished/` + manifest (Task 2), gap tracking for backfill (Task 3). ✓
- **Placeholders:** none — all steps have concrete code/commands.
- **Type consistency:** `selectBestPerSlug` signature/shape matches between Task 1 and its use in Task 2; manifest fields consistent.
- **Deferred (own phases):** brand-kit, `/api/media/[type]` route, OG per-page images + default-card rewrite, sheet render-at-post-time wiring. Backfill classification of the remaining ~57 photos.
