# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**American Heroes & Brew** — a mobile-first, dark-themed website for a sports bar in Carlsbad, CA. Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, and framer-motion. Beyond the customer-facing site (curated menu, live sports/holiday events feed, Instagram), the repo has grown three cross-cutting systems worth understanding up front:

1. **AEO/SEO layer** — a fleet of query-targeted landing pages, JSON-LD structured data, a vectorized FAQ, and an `llms.txt` feed, all aimed at ranking in Google *and* AI answer engines. See **AEO / SEO** below.
2. **Content engine** — a Google-Sheet-driven, multi-channel (Instagram feed/story, Facebook, Google Business Profile) auto-publisher, plus a `@napi-rs/canvas` video/poster render pipeline. Primary driver is an Apps Script; the Next.js API routes + Vercel crons are the publish/safety-net endpoints. See **Content Engine** below.
3. **Fantasy football** — a Google-Sheet-backed signup flow at `/fantasy-football`. See **Fantasy Football** below.

**Live:** production at `https://americanheroesandbrew.com` (also `https://heroes-tau-neon.vercel.app`), deployed on Vercel from `github.com/Kevin-Kurka/heroes`.

The original product requirements document is at `/prd.md`. Note: the PRD specifies a live Toast POS menu sync, but the shipped app uses a hand-curated static menu instead (see Data Layer below) — treat the PRD as historical intent, not current behavior.

## Commands

All commands run from the `heroes-brew/` directory:

```bash
cd heroes-brew
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Production build (validates ISR + types)
npm run lint       # ESLint with next/core-web-vitals + typescript rules
npm start          # Serve production build

npm test           # Vitest (run once) — unit tests colocated as *.test.ts next to source
npm run test:watch # Vitest watch mode
npx vitest run src/lib/curated-promos.test.ts   # Run a single test file
npx vitest run -t "flags a Padres game"          # Run tests matching a name

# Content-engine render pipeline (Node scripts in scripts/specials-video/, need @napi-rs/canvas + ffmpeg)
npm run render:specials  # Render daily-special Story videos (scratch-off + slot) then stamp metadata
npm run render:scratcher # Just the scratch-off variant
npm run render:slot      # Just the slot-machine variant
npm run stamp:content    # stamp-content-metadata.mjs — embeds provenance metadata into rendered assets
```

## Deployment (READ BEFORE SHIPPING — non-obvious)

The Vercel project (`prj_clmgcdScsUoDptrLuzgpsDljdPGM`, team `team_SrzLdmhAGbFLu0pesw86zK4L`)
is git-linked to `Kevin-Kurka/heroes`, production branch `master`, **Root Directory
`Heroes/heroes-brew`**. Despite that, deploys are NOT reliable by default:

- **`git push` does NOT reliably auto-deploy** — the GitHub→Vercel webhook has been
  observed not firing. Never assume a push went live; it usually does not.
- **`vercel redeploy <url>` rebuilds a STALE frozen snapshot** (the target's last git
  commit), NOT your latest commit. Using it to ship new code silently serves old code.
  Do not use it for shipping changes.
- **`vercel --prod` from `heroes-brew/` FAILS** — it appends the project Root Directory
  again (`.../Heroes/heroes-brew/Heroes/heroes-brew`). Don't.

**The reliable way to deploy `master` HEAD to production** — trigger a build of the git
ref via the REST API (needs a Vercel token with project access, e.g. `VERCEL_TOKEN`):

```bash
TOKEN=<vercel_token>; TEAM=team_SrzLdmhAGbFLu0pesw86zK4L
curl -s -X POST "https://api.vercel.com/v13/deployments?teamId=$TEAM&forceNew=1" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"heroes","project":"prj_clmgcdScsUoDptrLuzgpsDljdPGM","target":"production",
       "gitSource":{"type":"github","org":"Kevin-Kurka","repo":"heroes","ref":"master"}}'
```

Then **poll `GET /v13/deployments/<id>` until `readyState:"READY"`** and **verify the
change is actually live on `https://americanheroesandbrew.com`** before claiming done.

**ISR cache caveat:** Vercel persists the ISR/data cache across deployments. Pages with
`export const revalidate = N` (e.g. `/social`, `/menu`) may serve the PREVIOUS build's
HTML for up to `N` seconds after a correct deploy. If a code change isn't visible, confirm
the deployed commit is correct first, then allow the revalidate window (or the page's
`force-dynamic` pages — `/`, `/events` — update immediately).

**Always verify before declaring a deploy done:** fetch the live URL and confirm the
change is present. A green build is not proof the change shipped.

## Architecture

### Server/Client Component Split

Every page follows the same pattern: a **server component** (`page.tsx`) fetches data at build/ISR time, then passes it as props to a **client component** (`*PageClient.tsx`) that handles interactivity.

```
src/app/menu/page.tsx          → Server: calls getMenus() (static data)
src/app/menu/MenuPageClient.tsx → Client: sticky category nav, animated menu cards
```

**Route map** (not every page uses the client-split pattern — the SEO landing pages render plain server HTML via `LandingPageView`/`HeroesPageView`/etc. so 100% of copy is in the initial markup for answer engines):

- **Core:** `/` (home), `/menu` (+ `/menu/printable` staff print view), `/events` (labeled "Scoreboard" in nav), `/social`, `/location`, `/fantasy-football`
- **AEO/SEO landing pages** (data from `src/lib/landing-pages.ts`): `/watch`, `/near-legoland`, `/breakfast`, `/happy-hour`, `/burgers`, `/cheesesteak`, `/restaurant`, `/world-cup`, `/heroes` (Hero of the Month), `/watch-party/[slug]` (per-event pages from `watch-parties.ts`)
- **Utility/short links:** `/g/[id]` (share landing for the "Let's Go" chip, OG image = branded matchup card), `/review` → Google review composer redirect, `/review/card` (printable table-tent QR, noindex)
- **Feeds for crawlers/assistants:** `/sitemap.xml` (`sitemap.ts`), `/robots.txt` (`robots.ts`), `/llms.txt`, `/faq-vectors.json`

### Rendering Strategy (per page — not uniform)

Rendering mode is chosen per page based on whether it touches a live external API and how fresh it must be:

- **`force-dynamic`** — `/`, `/events` (live sports/holiday APIs every request so scores stay current), and **`/fantasy-football`** (⚠️ MUST stay `force-dynamic` — an ISR fallback render breaks the live per-league count joins via an id mismatch).
- **`revalidate = 60`** — `/menu`, `/menu/printable`. Call `resolveMenus()`, which renders from the live Google Sheet CSV when `MENU_SHEET_CSV_URL` is set, else the bundled static menu.
- **`revalidate = 300`** — `/g/[id]` (the looked-up event fully determines the page, so a rescheduled game refreshes within 5 min).
- **`revalidate = 900`** — `/social` (Instagram cache, 15 min).
- **`revalidate = 3600`** — all SEO landing pages + `/watch-party/[slug]` + `/api/ask` + `/faq-vectors.json` (mostly static content; hourly is plenty).
- **Fully static** — `/location` (`getRestaurantInfo()` is hardcoded).

### Data Layer (`src/lib/`)

- **`menu.ts`** — Hand-curated **static** menu + restaurant data (the fallback/seed). `getMenus(): Menu[]` and `getRestaurantInfo(): Restaurant` return hardcoded objects. No Toast/POS integration — this replaced the Toast sync in the PRD.
- **`menu-sheet.ts`** — Optional **Google Sheet sync**. `resolveMenus(): Promise<Menu[]>` fetches `MENU_SHEET_CSV_URL` (a published-CSV Google Sheet), parses it (inverse of the `/menu/printable` CSV export — columns `Tab,Section,Item,Price,Description,Option Group,Option,Option Price`), and returns it; falls back to `getMenus()` on any failure. Lets anyone with edit access to the sheet update the live menu. Setup: see `MENU-SHEET-SYNC.md`. Live sheet id: `1g0O_KjjbmMZ0NxkJ6-VQnXoz6u9tG73e55t4naxb4XI`.
- **`events.ts`** — Live. Aggregates from 3 sources in parallel (`Promise.all`), normalizing all into `UnifiedEvent` sorted chronologically:
  - MLB Stats API (`statsapi.mlb.com`) — all games for the week
  - ESPN API (`site.api.espn.com`) — NFL and NBA scoreboards
  - Nager.at Holiday API — US public holidays within 2 weeks

  Exports `getAllEvents()`, `getUpcomingEvents(limit)`, and `getAllHolidays()`.
- **`instagram.ts`** — Live Instagram **Graph API** integration. `getInstagramPosts(limit=12)` fetches recent posts via `INSTAGRAM_ACCESS_TOKEN`; `refreshInstagramToken()` rotates the long-lived token (called by the cron route below). Returns `[]` gracefully when no token is set.
- **`social-posts.ts`** — `CURATED_POSTS`: a hand-maintained set of `@americanheroesandbrew` photos self-hosted in `public/instagram/` (never expire). Fallback for `/social` when no live IG feed is configured.
- **`hours.ts`** — TZ-safe (Pacific) open/closed computation from `DaySchedule[]`.
- **`config.ts`** — Site-wide feature flags. `SHOW_PRICES` gates every customer-facing price (+ `stripPriceTokens()` scrubs inline "+N" upcharges when hidden); `SECRET_MENU_ENABLED` gates the QR-unlocked secret menu end-to-end. Flip these to change behavior everywhere at once.
- **`secret-menu.ts`** — Off-menu items, imported **only** by `/api/secret-menu` (server-only) so they never ship in the public bundle until unlocked.
- **`office.ts`** — Dependency-free `.xlsx`/`.docx` generators (hand-built ZIP+XML) so the menu can export as native Office files with no backend.
- **`analytics.ts`** — `trackEvent()`, the single GA4 custom-event path (no-ops on server / when GA is blocked).
- **`doordash.ts`** — The one `DOORDASH_URL` storefront constant (delivery). Surfaced as an "Order DoorDash" CTA in `TopNav`, `BottomNav`, and the homepage, but **only while the bar is open**: the `src/hooks/use-doordash-available.ts` client hook gates it on `isOpenNow(getRestaurantInfo().hours)`, re-checking every 60s (starts `false` for hydration safety).

**AEO/SEO modules** (see **AEO / SEO** section):
- **`structured-data.ts`** — All JSON-LD builders (`Restaurant`, `Menu`, `FAQPage`, `Event`, `VideoObject`) + `SITE_URL` and the `sameAs` profile list (Yelp/TripAdvisor/Apple Maps) that reconciles the business entity across the web.
- **`faq.ts`** — `FAQ`: the canonical Q&A pairs, the single source shared by the visible FAQ section AND the `FAQPage` JSON-LD (Google requires them to match).
- **`ask.ts`** — Dependency-free vectorized retrieval over the FAQ + first-party "best" claims + watch parties (hashed bag-of-words embeddings, cosine match). Powers `/api/ask` and `/faq-vectors.json`.
- **`landing-pages.ts`** — Content (as data, not JSX) for the query-targeted SEO landing pages; single source for both the page and its `FAQPage` JSON-LD.
- **`watch-parties.ts`** — Registry of per-event pages at `/watch-party/<slug>`; one entry generates the page, Event + VideoObject + FAQPage JSON-LD, sitemap entry, and llms.txt context.
- **`heroes.ts`** — "Hero of the Month" program data for `/heroes` + homepage card.
- **`review.ts`** — Review-platform links + prewritten phrases for the "Leave a Review" dialog.

**Content-engine modules** (see **Content Engine** section):
- **`promos-sheet.ts`** — Reads the "Event Posters & Posts" Google Sheet (published CSV, `PROMOS_SHEET_CSV_URL`); exposes rows due to post today. No write-back (idempotency = once-daily cron + date-equals-today).
- **`curated-promos.ts`** (+ `.test.ts`) — Builds the rolling 7-day curated promo rows (Padres/USA-Mexico/Chargers/MNF as Google Events; WC-day & NFL-Sunday schedule Stories) from the live events feed. Consumed by `/api/promos/curate`.
- **`share-content.ts`** / **`calendar.ts`** — Channel-specific share text + Google-Calendar/invite links for the Scoreboard "Let's Go" chip; frames every game as "watch it at the bar" (venue as location, not the stadium).

**Fantasy modules:**
- **`fantasy.ts`** — Official Heroes-league config (6 leagues × 10, draft dates, caps) + copy for `/fantasy-football`.
- **`fantasy-leagues.ts`** — Live per-league availability, joining sheet "Leagues" tab counts to the config.

### Type System (`src/types/index.ts`)

Core types: `UnifiedEvent` (`EventType: 'SPORTS' | 'HOLIDAY'`, `SportLeague: 'MLB' | 'NFL' | 'NBA' | 'NHL' | 'MLS' | 'CFB'`); menu types `Menu` → `MenuGroup` (with nested `subGroups`, `displayMode: 'starters' | 'variants'`, `choices`, `addOns`, `basePrice`) → `MenuItem`, plus `MenuGroupChoice` / `MenuGroupAddOn`; `Restaurant` + `DaySchedule` (hours); `InstagramPost`; `NavItem`. There are **no** Toast-specific types.

### Shared Components (`src/components/`)

| Component | Purpose |
|-----------|---------|
| `TopNav` | Desktop fixed header (hidden on mobile via `hidden md:block`) |
| `BottomNav` | Mobile bottom tab bar (hidden on desktop via `md:hidden`) — thumb-zone ergonomics |
| `Ticker` | Horizontal scrolling sports marquee with CSS animation (`ticker-animate`) |
| `EventCard` | Color-coded by league (MLB red, NFL green, NBA orange) or holiday (pink). Shows live scores when available. |
| `MenuCard` | Menu item card with name, description, price |
| `VariantGroupCard` | Renders a `MenuGroup` with variant `choices`/`addOns` and a `basePrice` (used for `displayMode: 'variants'`) |
| `PageTransition` | framer-motion fade+slide wrapper |

### Theming

Dark mode only, on an **American-flag palette** (red/white/navy — NOT the amber/orange from earlier iterations). Custom CSS variables in `globals.css` `:root`, mapped to Tailwind via `@theme inline`. Key tokens: `--background` (navy `#0a0e1a`), `--card` (`#131a2b`), `--accent` (flag red `#bf0a30`, dim `#8b0722`), `--sports` (blue `#3b82f6`), `--holiday` (rose `#f43f5e`). Fonts: Geist Sans + Geist Mono via `next/font`. Default to this red/white/blue scheme for any new UI unless explicitly told otherwise.

### Social Page

`/social` is server-rendered (`getInstagramPosts(12)`) and passes `InstagramPost[]` into `SocialPageClient.tsx`, which renders the grid (shimmer placeholders when the array is empty). It links to `@americanheroesandbrew`. This is a real **Instagram Graph API** integration, not the Elfsight widget the PRD originally described (the `NEXT_PUBLIC_ELFSIGHT_APP_ID` var in `.env.local` is vestigial and unused by the code).

### API Routes (`src/app/api/`)

All routes are guarded by `CRON_SECRET` (crons) or `PROMOS_SECRET` (promo/publish) via a `Bearer` header, unless noted. OG routes are public (they render share images).

| Route | Purpose |
|-------|---------|
| `GET /api/ask?q=` | Semantic FAQ retrieval (server-side embeddings, no external API); the "answer already in context" surface. Also `POST { q }`. |
| `POST /api/promos/publish-instagram` | Publish a poster/video to IG feed or story (`/media` → poll → `/media_publish`), then cross-post to the FB Page. See Env Vars below. |
| `POST /api/promos/publish-google` | Create a Google Business Profile local post (image/text only; `topicType:EVENT` when the row carries Event start/end). |
| `GET /api/promos/curate` | Rolling 7-day curated promo rows for the Apps Script seeder (from `curated-promos.ts`). Best-effort: returns `[]` with 200 on failure. |
| `GET /api/cron/instagram-refresh` | Rotate the long-lived IG token; writes it back to Vercel env via `VERCEL_TOKEN`/`VERCEL_PROJECT_ID`. |
| `GET /api/cron/story-invites` | Post an IG Story "watch invite" for each LOCAL-tier game happening today (marquee games are skipped — those go through the sheet as designed Feed posts). |
| `GET /api/cron/publish-due` | Late-night **safety net**: publishes today's approved sheet rows the Apps Script missed. The Apps Script is the primary driver; this only catches unstamped rows (runs after all post times so it can't double-post). |
| `POST /api/fantasy/signup` | Forwards join/register signups to a Google Apps Script web app (`FANTASY_SIGNUP_URL`). |
| `POST /api/secret-menu` | Validates a lead, forwards to `SHEETS_WEBHOOK_URL`, returns the secret-menu items. |
| `GET /api/og/{event,special,schedule}` | `next/og` (Satori) PNG generators — matchup card (1200×630), GBP daily-special poster (1200×900, 4:3), schedule Story (1080×1920, 9:16). |

### Cron Jobs (`vercel.json`)

Two crons are registered (both guarded by `CRON_SECRET`):
- **`/api/cron/instagram-refresh`** — `0 6 1,15 * *` (6am on the 1st & 15th) — rotates the long-lived IG token before it expires.
- **`/api/cron/story-invites`** — `0 16 * * *` (daily) — auto Story invites for today's local games.

`/api/cron/publish-due` exists as the publish safety-net endpoint but the **primary content driver is the sheet-bound Apps Script** (`scripts/sheet-auto-publisher.gs`), which fires at each row's scheduled time and writes `Posted` back to the sheet.

### AEO / SEO

The site is built to be the answer for "best sports bar / burgers / where to watch X in Carlsbad" in both Google and AI assistants. Mechanisms:

- **Structured data** — `layout.tsx` injects `Restaurant` JSON-LD site-wide; pages add `Menu`, `FAQPage`, `Event`, and `VideoObject` JSON-LD from `structured-data.ts`. `sameAs` links (Yelp/TripAdvisor/Apple Maps/Instagram) reconcile the business entity across the web.
- **Landing pages** — query-cluster pages (`landing-pages.ts` → `/burgers`, `/breakfast`, `/near-legoland`, …) render as plain server HTML so 100% of copy is in initial markup. Copy deliberately repeats business name + locality + differentiators.
- **Watch parties** — `watch-parties.ts` drives dated, schema-rich `/watch-party/<slug>` pages that pair a promo reel with Event/VideoObject markup.
- **Machine-readable feeds** — `/llms.txt` (assistant-oriented site summary) and `/faq-vectors.json` (the FAQ corpus + embeddings) let any retrieval system load the full answer set in one fetch. Both regenerate from the same corpus the site renders, so they never drift.
- Reference strategy docs live at `/Users/kmk/Heroes/AI_DOMINANCE_PLAYBOOK.md` and siblings (`MARKETING_*`, `AI_*`). `docs/CONTENT-STRATEGY.md` covers the content engine.

### Content Engine (Sheet → social)

A Google Sheet ("Event Posters & Posts", **one tab per month**) is the source of truth for every social post — Feed posters, Story videos, daily specials, multi-channel drops. Each dated row has `Post Date | Post Time | Channel | Media | Headline | Caption | Story Caption | Tags | Approval | Posted | Notes`. `Channel` is any combo of `Feed`, `Story`, `Google`; `Media` resolves `<name>.jpg/.png` → `public/promos/`, `<name>.mp4` → `public/promos-video/`.

- **`scripts/sheet-auto-publisher.gs`** is the primary engine (Apps Script bound to the sheet): fires at each row's time, calls `/api/promos/publish-instagram` (and `/api/promos/publish-google` via Script Property `GOOGLE_PUBLISH_URL`), stamps `Posted`, emails a weekly approval digest, and runs `seedCuratedRows()` daily to upsert curated Event/Story rows from `/api/promos/curate`.
- ⚠️ **The live Apps Script can drift from the repo `.gs`** — editing the repo file does NOT deploy it. The live script must be updated by pasting the repo file into the bound Apps Script editor.
- **Render pipeline** (`scripts/specials-video/`, `@napi-rs/canvas` + ffmpeg + a Swift `cutout.swift` for subject cutouts) produces the Story videos (scratch-off/slot daily specials, World Cup schedule posters, food-porn reels, fantasy launch). `scripts/stamp-content-metadata.mjs` and `scripts/lib/asset-metadata.mjs` embed provenance metadata. Music policy: trending royalty-free only (no synth); keep source + license.

### Fantasy Football

`/fantasy-football` (⚠️ `force-dynamic` — see Rendering Strategy) offers two signups, each landing in a separate Google Sheet tab via an Apps Script web app (`FANTASY_SIGNUP_URL`), with live per-league counts read back (`FANTASY_COUNTS_URL`): **join** a Heroes league (name/email/dates) or **register** your own league (commissioner details). Caps (10/league, 3 leagues/email, no dupes) are enforced Apps-Script-side. No DB. Setup: `docs/fantasy-football-signup-setup.md`.

## Environment Variables

Used by the running app (set in `heroes-brew/.env.local` locally and in Vercel project settings for prod):

```
# Site
NEXT_PUBLIC_GOOGLE_MAPS_KEY=<maps_key>    # location page map
NEXT_PUBLIC_GA_ID=<G-XXXX>                # GA4 measurement id (analytics.ts / layout.tsx)
GOOGLE_SITE_VERIFICATION=<token>          # Search Console HTML-tag verification (omitted when unset)
MENU_SHEET_CSV_URL=<published_csv_url>    # optional: live menu from a Google Sheet (see MENU-SHEET-SYNC.md)

# Instagram / Facebook
INSTAGRAM_ACCESS_TOKEN=<long_lived_token> # social page; getInstagramPosts() returns [] if unset
INSTAGRAM_USER_ID=<ig_user_id>            # IG account id targeted by the publish route's /media calls
FB_PAGE_ID=<fb_page_id>                   # optional: Facebook Page id for the cross-post step (skipped if unset)
FB_PAGE_ACCESS_TOKEN=<page_token>         # optional: Page token w/ pages_manage_posts (the IG token CANNOT post to a Page)

# Secrets guarding routes
CRON_SECRET=<secret>                      # guards the cron routes (Vercel sends it as a Bearer header)
PROMOS_SECRET=<secret>                    # guards POST /api/promos/* (Bearer header)
VERCEL_TOKEN=<token>                      # instagram-refresh cron writes the refreshed token back to Vercel
VERCEL_PROJECT_ID=<project_id>            # target project for the env-var write

# Content engine (sheet-driven publishing)
PROMOS_SHEET_CSV_URL=<published_csv_url>  # "Event Posters & Posts" sheet; rows due to post today

# Google Business Profile "Google" channel
GOOGLE_BUSINESS_CLIENT_ID=<oauth_client_id>
GOOGLE_BUSINESS_CLIENT_SECRET=<oauth_client_secret>
GOOGLE_BUSINESS_REFRESH_TOKEN=<refresh_token>     # scope https://www.googleapis.com/auth/business.manage
GOOGLE_BUSINESS_ACCOUNT_ID=<gbp_account_id>       # accounts/{id} or bare {id} — route strips the prefix
GOOGLE_BUSINESS_LOCATION_ID=<gbp_location_id>     # locations/{id} or bare {id} — route strips the prefix

# Google Apps Script web apps (lead/signup capture — graceful fallback if unset)
FANTASY_SIGNUP_URL=<apps_script_url>      # /api/fantasy/signup target
FANTASY_COUNTS_URL=<apps_script_url>      # live per-league counts read-back
SHEETS_WEBHOOK_URL=<apps_script_url>      # /api/secret-menu lead capture
REVIEW_URL=<google_review_url>            # override the /review redirect target
HEROES_NOMINATION_URL=<apps_script_url>   # Hero-of-the-Month nomination capture
```

**Google Business Profile posts** (`POST /api/promos/publish-google`, guarded by `PROMOS_SECRET`): creates a GBP "local post" on the business's Search/Maps listing via `mybusiness.googleapis.com/v4/accounts/{acct}/locations/{loc}/localPosts` (refresh-token → access-token, then create). GBP posts are **image or text only** (no video). All five `GOOGLE_BUSINESS_*` vars are required or the route returns `503 not configured` and the sheet's `Google` channel is skipped (best-effort — never blocks IG/Story). The GCP project must be **approved for the Business Profile API** (gated access request) or the API 403s. The sheet publisher reaches this route via the Apps Script Script Property `GOOGLE_PUBLISH_URL`.

**Instagram publishing** (`POST /api/promos/publish-instagram`): publishes posters from `public/promos/` via the Graph API content-publishing flow (`/media` → `/media_publish`). The `INSTAGRAM_ACCESS_TOKEN` must carry the **`instagram_content_publish`** permission — if the current token is a Basic-Display/Instagram-login token without that scope, publishing will 403 and the token must be reissued via a Facebook app with the IG account linked.

**Facebook Page cross-post**: after a successful IG publish, the same route posts the image + caption to the Facebook Page via `POST graph.facebook.com/v23.0/{FB_PAGE_ID}/photos`. Requires `FB_PAGE_ID` + `FB_PAGE_ACCESS_TOKEN` (a Page access token with `pages_manage_posts` + `pages_read_engagement` from a Facebook app linked to the Page — the Instagram-login token cannot post to a Page). If unset, the FB step is skipped and reported as `facebook.skipped` in the response; an FB failure never fails the request once IG has published (reported in `facebook.error`).

**Auto-curated Events:** `GET /api/promos/curate` (guarded by `PROMOS_SECRET`) returns the rolling 7-day curated promo rows — WC USA/Mexico, Padres, Chargers, and Monday-Night games as Google **Events**, plus WC-day and NFL-Sunday schedule **Stories** (poster from `/api/og/schedule`). The Apps Script `seedCuratedRows()` daily trigger upserts these into the month tab (deduped by key in Notes); Google Event rows seed unapproved (manual Approve), Stories auto-approve. `publish-google` emits `topicType:EVENT` when a row carries Event Start/End. Spec: `docs/superpowers/specs/2026-06-28-google-event-curation-design.md`.

No Toast credentials are used. The menu is static by default but can be driven live by a Google Sheet via `MENU_SHEET_CSV_URL` (see `MENU-SHEET-SYNC.md`). `NEXT_PUBLIC_ELFSIGHT_APP_ID` may appear in `.env.local` but is unused.

## Key Patterns

- Path alias: `@/*` maps to `./src/*`
- All client components are marked with `'use client'` directive
- framer-motion is used for all animations (page transitions, card entrances, hover effects, nav indicators with `layoutId`)
- Tailwind classes use the custom color tokens directly (e.g., `bg-card`, `text-accent`, `border-border`)
- Menu and restaurant data are hardcoded in `menu.ts` — the site renders fully without any API credentials; only `/events`, `/social`, and the location map need external services
