# Themed Content System v2 — Design Spec

_2026-06-17 · American Heroes & Brew Instagram content pipeline_

## Goal
Expand the daily-specials content into a consistent, themed, motion-first system:
"Food Porn 2.0" animated reels for the grid, a clean themed-video naming scheme that
supports many themes per deal, and a single sheet surface (the monthly tabs) to manage
multiple Feed and/or Story posts per day on autopilot.

## Decisions (locked)
- **Food-porn 2.0 = Feed/grid format**, 9:16 vertical, posted as **Reels** (appear on grid + reels feed).
- **Story rotation stays scratcher ↔ slot** (game videos). Food-porn is **NOT** in the Story rotation.
- **All reels get music** — trending-style **upbeat royalty-free** tracks (Mixkit Free License / open, no attribution).
- Sheet: **delete the Story tab**; manage everything from the **monthly tabs**. **Auto-generate** the weekday-special rows per month.
- **Multiple posts per day** allowed (one row = one post; any number of rows per date).
- **New-post default Channel = Both (Feed + Story).** So most days have multiple Story items + Feed items.
- **Lifespan:** Story = 24h ephemeral. Feed **persists**; flagged for **archive 30–60 days** later for low-engagement / seasonal posts. (IG has no archive API — archiving is manual/app-side; the sheet tracks an `Archive By` date + status.)

## 1. Media naming + theme system
Rename all special videos to `<special>-<theme>.mp4`:
- Story themes: `mahalo-scratcher.mp4`, `mahalo-slot.mp4` (× taco/wings/burgers/funday).
- Feed theme: `mahalo-foodporn.mp4` (× all 5).
- Render scripts emit themed names: `scratch-render.mjs`→`-scratcher`, `slot-render.mjs`→`-slot`, new `foodporn-render.mjs`→`-foodporn`. Retire `-1/-2`.
- Extensible: a new theme = new render output + a sheet row referencing `<special>-<newtheme>.mp4`.

## 2. Food Porn 2.0 reels (`foodporn-render.mjs`)
9:16 cinematic showcase reels from the enhanced food photos (`bg/<key>.jpg`):
- **Parallax** — food and text layers move at different depths.
- **Pan/zoom** Ken Burns over the food.
- **Kinetic typography** — special name, deal, price animate in (slide/scale/fade), not static.
- Brand: badge, amber + RWB accents, pro sports-bar but elevated/appetizing (showcase, not a game).
- **Upbeat royalty-free music** per reel (loudnorm + fade), optional subtle sizzle SFX.
- Output `public/promos-video/<special>-foodporn.mp4`, 1080×1920.
- Prototype one day first → approve → render all 5.

## 3. Sheet consolidation (single control surface)
- **Remove** the Story tab.
- Each **monthly tab** = the control surface. One row = one post.
- **Schema** (standardized so the Vercel cron `promos-sheet.ts` AND the Apps Script agree — they currently disagree, `File` vs `Media`):
  `Post Date · Post Time · Channel · Media · Headline · Caption · Tags · Approval · Posted (IG) · Archive By · Notes`
  - `Channel`: `Feed`, `Story`, or `Both` (default `Both`).
  - `Media`: themed filename(s).
  - `Archive By`: auto-set to Post Date + 30–60 days for Feed posts (policy reminder).
- **Auto-generate** weekday-special rows for each month: every Mon=Mahalo … Fri=Funday, with Story=alternating scratcher/slot, Feed=`-foodporn`, daily-thought captions prefilled. User adds event rows freely.
- Multiple rows per date supported by the date-equals-today publish gate.

## 4. Publishing
- Extend `POST /api/promos/publish-instagram` (and the cron) to publish **video Reels to the Feed** via Graph API `media_type=REELS` (currently feed = image only). Story video already works.
- A `Both` row publishes to Feed (Reel) **and** Story.
- Rotation/selection stays data-driven (explicit rows); zero daily manual tasks once Approval + date are set.

## Phasing (each independently shippable)
1. **Rename media** + update render scripts + re-link/rename in sheet.
2. **Build `foodporn-render.mjs`** → prototype 1 → approve → render all 5 + music.
3. **Consolidate sheet** (schema + `Archive By`, auto-gen rows, delete Story tab) + **extend publisher for Reels**.
4. **Deploy + verify** (live URLs, a Reel publish dry-run).

## Out of scope / notes
- Actual IG post archiving is manual (no API); we only track `Archive By` + a status.
- "Trending" music = upbeat royalty-free stand-ins (real chart music can't be used — IG would mute API-published audio).
