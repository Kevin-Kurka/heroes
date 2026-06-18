# Themed Content System v2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship motion-first themed IG content — "Food Porn 2.0" 9:16 Feed reels — on a clean `<special>-<theme>.mp4` naming scheme, managed from consolidated monthly sheet tabs that drive multiple Feed+Story posts/day on autopilot.

**Architecture:** Canvas→ffmpeg render scripts (one per theme: `scratch-render`, `slot-render`, new `foodporn-render`) output `public/promos-video/<special>-<theme>.mp4`. A standardized monthly-tab schema (read by both `promos-sheet.ts` and the Apps Script) lists one row per post; the publish route posts images, Story videos, and now Feed **Reels**. Music is upbeat royalty-free (Mixkit Free License) mixed at encode time.

**Tech Stack:** Node + `@napi-rs/canvas` + `ffmpeg`; Next.js API routes (`promos-sheet.ts`, `publish-instagram`); Google Sheets (browser-driven edits via claude-in-chrome); Vercel deploy via REST API.

**Specials/keys:** `mahalo` (Mon, Kalua sliders), `taco` (Tue), `wings` (Wed), `burgers` (Thu), `funday` (Fri). Themes: `scratcher`, `slot` (Story); `foodporn` (Feed). `-1`=scratcher, `-2`=slot in the old scheme.

---

## Phase 1 — Themed media naming

### Task 1: Rename render outputs + existing files to `<special>-<theme>.mp4`

**Files:**
- Modify: `heroes-brew/scripts/specials-video/scratch-render.mjs` (output name)
- Modify: `heroes-brew/scripts/specials-video/slot-render.mjs` (output name)
- Modify: `heroes-brew/scripts/specials-video/add-audio.mjs` (key parse)
- Rename: `heroes-brew/public/promos-video/{mahalo,taco,wings,burgers,funday}-{1,2}.mp4`

- [ ] **Step 1:** In `scratch-render.mjs`, change the output path from `${key}-${variant + 1}.mp4` to a theme name. Replace the variant scheme with a single `-scratcher` output (variant 2 was the bottom-up scratch; keep variant 0 only, or render `${key}-scratcher.mp4`). Edit the `render(key, variant)` output line to `const out = join(OUT_DIR, \`${key}-scratcher.mp4\`)` and drop the variant loop to a single variant.
- [ ] **Step 2:** In `slot-render.mjs`, change `const out = join(OUT_DIR, \`${key}-slot.mp4\`)` (already `-slot` for the preview — make it the final name, drop the promote-to-`-2` step).
- [ ] **Step 3:** In `add-audio.mjs`, change the key parse from `basename(p).replace(/-\d+\.mp4$/, '')` to `basename(p).replace(/-[a-z]+\.mp4$/i, '')` so `<special>-<theme>.mp4` → key.
- [ ] **Step 4:** Rename existing files:
```bash
cd heroes-brew/public/promos-video
for k in mahalo taco wings burgers funday; do git mv $k-1.mp4 $k-scratcher.mp4; git mv $k-2.mp4 $k-slot.mp4; done
```
- [ ] **Step 5: Verify** `ls *-scratcher.mp4 *-slot.mp4` shows 10 files; `ffprobe` one of each for 1080x1920.
- [ ] **Step 6: Commit** `git commit -m "refactor(promos): themed <special>-<theme>.mp4 video naming"`

---

## Phase 2 — Food Porn 2.0 reels (headline)

### Task 2: Build `foodporn-render.mjs`

**Files:**
- Create: `heroes-brew/scripts/specials-video/foodporn-render.mjs`
- Reuse: `public/promos-video/bg/<key>.jpg` (enhanced photos), `public/badge-clean.png`, `public/promos-video/audio/<key>.mp3` (music)

Design (build to this, verify visually):
- 1080×1920, ~6–7s, `@napi-rs/canvas` frame-by-frame → ffmpeg (same encoder flags as slot-render: h264 high, yuv420p, bt709, faststart, 44.1k AAC).
- **Layers (parallax):** (1) food photo, slow Ken-Burns zoom 1.06→1.14 + opposing drift; (2) soft dark gradient for legibility; (3) text layer drifting opposite the photo at ~0.5× rate.
- **Kinetic type:** day chip, hero word, price, deal sub-line each animate in with a back-ease pop + slight slide, staggered ~0.15s apart; a subtle accent shine sweep across the price.
- **Brand:** badge on 80% white disc, amber + RWB accents, `AMERICAN HEROES & BREW` footer.
- **Music:** per-key `audio/<key>.mp3` (upbeat royalty-free), loudnorm I=-15, fade out 0.5s. No game SFX (this is a showcase, not a game).
- `ITEMS` map reuse from slot-render (`day/name/hero/price/sub/accent`), output `public/promos-video/<key>-foodporn.mp4`.

- [ ] **Step 1:** Scaffold `foodporn-render.mjs` (copy helpers from `slot-render.mjs`: fonts, `drawCover`, `roundRect`, `clamp01`, `smooth`, `lerp`, easings, `rng`, ITEMS).
- [ ] **Step 2:** Implement the per-frame draw: background cover with Ken-Burns + pan; gradient; parallax-translated text group with staggered kinetic entrances (reuse the `popText` overshoot helper from slot-render).
- [ ] **Step 3:** Implement the audio mux (single per-key music track, loudnorm + fade).
- [ ] **Step 4: Render the burgers prototype:** `node scripts/specials-video/foodporn-render.mjs burgers`
- [ ] **Step 5: Verify** — extract frames at 10%/50%/90% (`ffmpeg select=eq(n,N)`), confirm parallax/kinetic text reads and the photo showcases; `ffprobe` 1080x1920 ~6-7s + audio 44100. Open for human approval.
- [ ] **Step 6: Iterate** on the prototype until approved (timing, type, music). **Approval gate before mass render.**
- [ ] **Step 7: Render all 5:** `for k in mahalo taco wings burgers funday; do node scripts/specials-video/foodporn-render.mjs $k; done`
- [ ] **Step 8: Verify** all 5 → `ffprobe` dims/dur/audio.
- [ ] **Step 9: Commit** `git commit -m "feat(promos): Food Porn 2.0 9:16 Feed reels (parallax + kinetic type + music)"`

---

## Phase 3 — Sheet consolidation + Reels publishing

### Task 3: Standardize the publisher schema + Feed Reels

**Files:**
- Modify: `heroes-brew/src/lib/promos-sheet.ts`
- Modify: `heroes-brew/src/app/api/promos/publish-instagram/route.ts`
- Modify: `heroes-brew/src/app/api/cron/publish-due/route.ts`

- [ ] **Step 1:** In `promos-sheet.ts`, accept `Media` as an alias for `File` (`findIdx(header, h => h==='file' || h==='media')`); add `Channel` value `Both`. Update `PromoChannel = 'Feed' | 'Story' | 'Both'`. For `Both`, the cron emits two publishes (Feed + Story).
- [ ] **Step 2:** In `promos-sheet.ts`, add `archiveBy` field (parse an `Archive By` column; informational).
- [ ] **Step 3:** In `publish-instagram/route.ts`, add a Feed-video path: when `mediaType==='feed'` and `videoUrl` present → Graph API container with `media_type=REELS`, `video_url`, then `media_publish` (mirror the Story video flow). Keep image-feed path for `.jpg/.png`.
- [ ] **Step 4:** In `publish-due/route.ts`, expand a `Both` row into a Feed publish (Reel/image) + a Story publish.
- [ ] **Step 5: Verify (typecheck/build):** `cd heroes-brew && npm run build` → passes.
- [ ] **Step 6: Commit** `git commit -m "feat(promos): Both channel + Feed Reels publishing"`

### Task 4: Consolidate the sheet (delete Story tab, auto-gen monthly rows)

**Files:** Google Sheet (browser-driven), tab `June 2026` / `July 2026`; remove `Story` tab.

- [ ] **Step 1:** Read the current `June 2026` tab columns (browser/CSV) and confirm the standardized schema: `Post Date · Post Time · Channel · Media · Headline · Caption · Tags · Approval · Posted (IG) · Archive By · Notes`. Add `Channel`/`Archive By` columns if missing.
- [ ] **Step 2:** Generate the weekday-special rows for the target month locally (a small node script computing each Mon–Fri date), producing TSV: for each weekday date a row — Story `Channel=Story Media=<key>-scratcher.mp4|-slot.mp4` (alternate by date) + Feed `Channel=Feed Media=<key>-foodporn.mp4`, OR a single `Both` row per the default; caption = daily thought; Approval=Approve; Archive By = date+45d.
- [ ] **Step 3:** Paste the generated rows into the monthly tab via the browser (keyboard-nav method: select first cell, type values + Tab/Enter; verify with screenshot — clicks drift, use keyboard).
- [ ] **Step 4:** Delete the `Story` tab (right-click tab → Delete) once the recurring rows live in the monthly tab and the publisher reads them.
- [ ] **Step 5: Verify** — fetch the monthly tab CSV; confirm rows parse via `isDueToday` logic; spot-check one date has the expected Feed+Story posts.

---

## Phase 4 — Deploy + verify

### Task 5: Ship + confirm live

- [ ] **Step 1:** Commit any remaining renders (`*-foodporn.mp4`, renamed files).
- [ ] **Step 2: Push** `env -u GITHUB_TOKEN git push origin master`.
- [ ] **Step 3: Deploy** via Vercel REST API (gitSource ref master), poll to `READY`.
- [ ] **Step 4: Verify live** — for each new `*-foodporn.mp4` and renamed file, `curl -I` HTTP 200 + content-length matches local.
- [ ] **Step 5: Reel dry-run** — POST `publish-instagram` with `mediaType=feed videoUrl=<…-foodporn.mp4>` guarded by `PROMOS_SECRET`; confirm `{ok:true, mediaId}` (a real Reel publish — do with user go-ahead).

---

## Self-review notes
- **Spec coverage:** naming (T1), food-porn reels+music (T2), Both channel + Feed Reels (T3), sheet consolidation/auto-gen/delete Story (T4), deploy+verify (T5). Archive policy = `Archive By` column (T3/T4); actual IG archiving manual (noted).
- **Domain adaptation:** render "tests" are frame-extract + `ffprobe` + human approval gates (Task 2 Step 6), not unit tests — appropriate for visual artifacts.
- **Naming consistency:** `<key>-scratcher/-slot/-foodporn.mp4` used throughout; `add-audio.mjs` key-parse updated to match (T1 S3).
- **Could split:** Phase 2 (reels) is independently shippable before Phase 3 (sheet/publisher); recommend building/approving reels first.
