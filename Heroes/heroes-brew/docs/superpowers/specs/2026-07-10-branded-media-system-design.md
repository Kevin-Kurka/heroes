# Branded Media System — Design Spec

_2026-07-10. Consolidates: the approved poster brand system, a shared renderer for posts **and** link-preview (OG) images, a curated/enhanced photo library, and render-at-post-time so schedule posters always reflect the live bracket._

## Problem / goals

1. **Consistent brand.** Today each poster is styled ad-hoc (WC schedule = pill chip + footer band; specials = star wordmark) and none carry the logo. We want one system across every media type.
2. **Stale/placeholder media.** Knockout schedule posters were pre-rendered with "?" because the bracket wasn't decided. They must reflect the **live** matchups at the moment they post.
3. **Broken link previews.** Every page emits the same generic OG card (`app/opengraph-image.tsx`) — confirmed live: `/`, `/menu`, `/events`, `/social`, `/happy-hour` all return `/opengraph-image`. Only `/g/[id]` and `/watch-party/[slug]` show real media. Pasted links look generic instead of showing the actual media.
4. **Photo quality.** ~131 base photos across `public/promos-video/_source{,/new,/menu2}` + `public/instagram`, partly classified in `classified-photos.json`. We want one polished, professional image per menu item / subject, deduped, in a dedicated folder feeding all media.

## Approved brand system (from the visual companion, v11 — final)

- **Crest:** the crest-only circle (`public/icon-512.png`), never the faded-flag lockup. On assets it sits on a **frosted 80%-white circle** (backdrop-blur) with a stacked drop shadow. Placement: top-center (schedule/announcement), top-left corner (specials/Google/feed), or its own **top-left row that pushes centered content down** (matchup/watch-party).
- **Border:** triple keyline framing the whole poster — navy (outer) / white / red (inner).
- **Headline type:** bold condensed, uppercase, white fill with:
  - **Thin 1.25px stroke on the outside** (painted behind the fill), red **or** blue per tile accent.
  - **Complementary gradient on the fill**, 30° axis, **10% opacity at the bottom → 0% at the top** (blue tint inside red-outlined text; red tint inside blue-outlined text).
  - **Inner shadow** so the fill reads recessed inside the stroke.
  - **Progressive blur** behind it (stacked tight→wide dark shadows) so it lifts off the photo.
- **Kickers / CTA / data cards:** framed chips (2px red/blue border, translucent accent fill) with the same progressive drop shadow; schedule rows carry a subtle accent gradient matching their border.
- **Footer:** drop-shadow **text** only (no gradient band) — `AMERICAN HEROES & BREW · CARLSBAD VILLAGE`.
- **Background:** every asset is a photo with a bottom-weighted dark gradient overlay for legibility.
- **Palette:** red `#bf0a30`, navy `#0a3161`, accent blue `#3a6fe0`, white. (Note: current OG card uses off-brand `#e2273a`/`#2851a7` — replace.)

## Media types, formats, variants

| Type | Format | Channels | Variants |
|---|---|---|---|
| Sports schedule | 9:16 | IG/FB Story | ≥2 (blue/red accent) |
| Daily special | 4:5 / 9:16 | Feed + Story | bottom-left lockup only (consistent), photo/copy/accent rotate |
| Matchup / watch party | 16:9 | share/OG + Google event | 2 (two-team / single headline), crest top-left row |
| Google Business post | 4:3 | GBP | 2, Learn-more CTA |
| IG/FB feed | 1:1 | Feed | 2 |
| Announcement / fantasy | 9:16 | Story | ≥1 |

Rotating variants keep the feed fresh; a variant picker cycles by date/hash so repeats are spaced.

## Architecture

Three units with clear boundaries:

### 1. `brand-kit` (pure module) — `scripts/specials-video/lib/brand-kit.mjs`
Single source of truth for the look: palette, fonts, and canvas draw helpers — `drawFrame()` (triple keyline), `drawCrest()` (frosted circle), `drawHeadline()` (stroke + complementary gradient fill + inner shadow + progressive blur), `drawKicker()`, `drawFooter()`, `drawPhotoBg()` (cover + gradient). Every renderer calls these so all output is identical by construction. No I/O.

### 2. Renderers
- **Canvas renderers** (existing `scripts/specials-video/*-render.mjs`) refactored to build on `brand-kit` — for the video/Story pipeline that needs @napi-rs/canvas fidelity.
- **On-demand render route** `GET /api/media/[type]` (Node runtime, @napi-rs/canvas) — renders any media type live from params + the polished photo library + (for schedule/matchup) the live ESPN feed. This is the **render-at-post-time** hook: the sheet's `Media` for schedule/matchup rows points here, so the Apps Script fetches a freshly-rendered poster at post time (permanently fixes the "?" problem — no manual re-renders).
  - Chosen over next/og (Satori): Satori can't do `-webkit-text-stroke` / gradient-clip fill / inner shadow, so it can't reproduce the approved type. @napi-rs/canvas runs on Vercel's Node runtime; bundle the crest + one font + stadium bg (small) — accept modest cold-start.

### 3. OG / link-preview images (fixes bug #3)
- Rewrite `app/opengraph-image.tsx` to the new brand system (crest + hero photo + tagline) so the fallback is on-brand.
- Add per-page OG images for the high-value pages by pointing `openGraph.images` at the render route: `/` (hero), `/menu` (food), `/events` (schedule), `/happy-hour` & landing pages (relevant food/beer), `/social`. Keep `/g/[id]` and `/watch-party` as-is (already correct).
- Result: pasting any link shows real, on-brand media instead of the generic card.

### 4. Polished photo library (fixes #4) — `public/images/polished/`
- Complete classification of all ~131 base photos into `classified-photos.json` (subject/menu-item slug, quality 1–5, note). Extend the existing file; classify the unclassified via vision.
- **Dedup/merge:** per slug keep the single highest-quality image (tie-break: resolution, composition note).
- **Enhance/polish** each survivor with `sharp` (auto-level/contrast, subtle saturation, sharpen, consistent aspect crops) → `public/images/polished/<slug>.jpg` + `polished/manifest.json` (slug → file, category, display, source).
- The polished library is the ONLY photo source for posters + OG. `brand-kit`/renderers read the manifest.

## Data flow
Google Sheet row → (schedule/matchup) `Media = /api/media/schedule?date=…` rendered live at post time from ESPN + polished bg → Apps Script posts to IG/FB/Google. Static specials/feed posters can be pre-rendered by the canvas scripts (same `brand-kit`) or also served by the route. OG: page `generateMetadata` → `openGraph.images = /api/media/og-<page>` → crawler fetches freshly-rendered card.

## Testing
- `brand-kit` unit-covered where logic exists (variant picker by date/hash; gradient/stroke math helpers).
- Golden-image check: render each type once, eyeball against the approved v11 mockup.
- OG: after deploy, fetch live `og:image` for `/`, `/menu`, `/events` and confirm each is its own render-route URL (not `/opengraph-image`), and that the URL returns 200 image.
- Schedule route: request a knockout date and confirm live teams (no "?") once decided; TBD placeholder only when genuinely undecided.

## Rollout / sequencing
1. Photo curation + enhancement → `public/images/polished/` (foundational; everything reads it).
2. `brand-kit` module + refactor one canvas renderer (schedule) onto it as the reference.
3. `/api/media/[type]` route (schedule + matchup + specials + feed + og variants).
4. Repoint sheet schedule/matchup rows at the route; verify render-at-post-time (kills the "?" rolling problem).
5. OG: rewrite default card + per-page images; verify live.
6. Refactor remaining canvas renderers onto `brand-kit`; retire the static WC manifest posters.

## Open decisions (confirm before build)
- **Renderer tech:** @napi-rs/canvas on a Node route (recommended, full fidelity) vs. keeping cron/build-time renders. Recommend the route for true render-at-post-time.
- **Curation depth now:** classify + polish all ~131 photos up front (bigger, vision-heavy) vs. curate the top ~1 per active menu item / subject first and expand later. Recommend top-per-item first so we can start posting, then backfill.
