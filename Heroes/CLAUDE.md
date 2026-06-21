# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**American Heroes & Brew** — a mobile-first, dark-themed website for a sports bar in Carlsbad, CA. Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, and framer-motion. The site serves a curated menu + restaurant info, aggregates live sports schedules + holidays into a unified events feed, and pulls recent posts from Instagram.

**Live:** production at `https://americanheroesandbrew.com` (also `https://heroes-tau-neon.vercel.app`), deployed on Vercel from `github.com/Kevin-Kurka/heroes`.

The original product requirements document is at `/prd.md`. Note: the PRD specifies a live Toast POS menu sync, but the shipped app uses a hand-curated static menu instead (see Data Layer below) — treat the PRD as historical intent, not current behavior.

## Commands

All commands run from the `heroes-brew/` directory:

```bash
cd heroes-brew
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build (validates ISR + types)
npm run lint     # ESLint with next/core-web-vitals + typescript rules
npm start        # Serve production build
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

Pages: `/` (home), `/menu` (+ `/menu/printable`), `/events` (labeled "Scoreboard" in nav), `/social`, `/location`

### Rendering Strategy (per page — not uniform)

Rendering mode is chosen per page based on whether it touches a live external API:

- **`/` and `/events`** — `export const dynamic = 'force-dynamic'`. They call the live sports/holiday APIs (`getUpcomingEvents()` / `getAllEvents()`) on every request so scores stay current.
- **`/social`** — `export const revalidate = 900` (15-min ISR). Instagram posts are refreshed on a 15-minute cache.
- **`/menu` and `/menu/printable`** — `export const revalidate = 60`. They call `resolveMenus()`, which renders from the live Google Sheet CSV when `MENU_SHEET_CSV_URL` is set, else the bundled static menu. **`/location`** — fully static (`getRestaurantInfo()` is hardcoded).

### Data Layer (`src/lib/`)

- **`menu.ts`** — Hand-curated **static** menu + restaurant data (the fallback/seed). `getMenus(): Menu[]` and `getRestaurantInfo(): Restaurant` return hardcoded objects. No Toast/POS integration — this replaced the Toast sync in the PRD.
- **`menu-sheet.ts`** — Optional **Google Sheet sync**. `resolveMenus(): Promise<Menu[]>` fetches `MENU_SHEET_CSV_URL` (a published-CSV Google Sheet), parses it (inverse of the `/menu/printable` CSV export — columns `Tab,Section,Item,Price,Description,Option Group,Option,Option Price`), and returns it; falls back to `getMenus()` on any failure. Lets anyone with edit access to the sheet update the live menu. Setup: see `MENU-SHEET-SYNC.md`. Live sheet id: `1g0O_KjjbmMZ0NxkJ6-VQnXoz6u9tG73e55t4naxb4XI`.
- **`events.ts`** — Live. Aggregates from 3 sources in parallel (`Promise.all`), normalizing all into `UnifiedEvent` sorted chronologically:
  - MLB Stats API (`statsapi.mlb.com`) — all games for the week
  - ESPN API (`site.api.espn.com`) — NFL and NBA scoreboards
  - Nager.at Holiday API — US public holidays within 2 weeks

  Exports `getAllEvents()`, `getUpcomingEvents(limit)`, and `getAllHolidays()`.
- **`instagram.ts`** — Live Instagram **Graph API** integration. `getInstagramPosts(limit=12)` fetches recent posts via `INSTAGRAM_ACCESS_TOKEN`; `refreshInstagramToken()` rotates the long-lived token (called by the cron route below). Returns `[]` gracefully when no token is set.

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

Dark mode only. Custom CSS variables defined in `globals.css` `:root` and mapped to Tailwind via `@theme inline`. Key tokens: `--background`, `--card`, `--accent` (amber #f59e0b), `--sports` (blue), `--holiday` (rose). Fonts: Geist Sans + Geist Mono via `next/font`.

### Social Page

`/social` is server-rendered (`getInstagramPosts(12)`) and passes `InstagramPost[]` into `SocialPageClient.tsx`, which renders the grid (shimmer placeholders when the array is empty). It links to `@americanheroesandbrew`. This is a real **Instagram Graph API** integration, not the Elfsight widget the PRD originally described (the `NEXT_PUBLIC_ELFSIGHT_APP_ID` var in `.env.local` is vestigial and unused by the code).

### Instagram Token Cron

`vercel.json` registers a cron (`/api/cron/instagram-refresh`, schedule `0 6 1,15 * *` — 6am on the 1st & 15th) that calls `refreshInstagramToken()` to rotate the long-lived Instagram token before it expires. The route is guarded by `CRON_SECRET` (Vercel sends it as a Bearer header) and uses `VERCEL_TOKEN` / `VERCEL_PROJECT_ID` to write the refreshed token back into the project's env vars.

## Environment Variables

Used by the running app (set in `heroes-brew/.env.local` locally and in Vercel project settings for prod):

```
NEXT_PUBLIC_GOOGLE_MAPS_KEY=<maps_key>   # location page map
INSTAGRAM_ACCESS_TOKEN=<long_lived_token> # social page; getInstagramPosts() returns [] if unset
CRON_SECRET=<secret>                      # guards the Instagram refresh cron route
VERCEL_TOKEN=<token>                      # cron writes refreshed token back to Vercel
VERCEL_PROJECT_ID=<project_id>            # target project for the env-var write
PROMOS_SECRET=<secret>                    # guards POST /api/promos/publish-instagram (Bearer header)
INSTAGRAM_USER_ID=<ig_user_id>            # IG account id targeted by the publish route's /media calls
FB_PAGE_ID=<fb_page_id>                   # optional: Facebook Page id for the cross-post step (skipped if unset)
FB_PAGE_ACCESS_TOKEN=<page_token>         # optional: Page token w/ pages_manage_posts (the IG token CANNOT post to a Page)
MENU_SHEET_CSV_URL=<published_csv_url>    # optional: live menu from a Google Sheet (see MENU-SHEET-SYNC.md)
GOOGLE_BUSINESS_CLIENT_ID=<oauth_client_id>       # optional: Google Business Profile "Google" channel
GOOGLE_BUSINESS_CLIENT_SECRET=<oauth_client_secret>
GOOGLE_BUSINESS_REFRESH_TOKEN=<refresh_token>     # scope https://www.googleapis.com/auth/business.manage
GOOGLE_BUSINESS_ACCOUNT_ID=<gbp_account_id>       # accounts/{id}
GOOGLE_BUSINESS_LOCATION_ID=<gbp_location_id>     # locations/{id}
```

**Google Business Profile posts** (`POST /api/promos/publish-google`, guarded by `PROMOS_SECRET`): creates a GBP "local post" on the business's Search/Maps listing via `mybusiness.googleapis.com/v4/accounts/{acct}/locations/{loc}/localPosts` (refresh-token → access-token, then create). GBP posts are **image or text only** (no video). All five `GOOGLE_BUSINESS_*` vars are required or the route returns `503 not configured` and the sheet's `Google` channel is skipped (best-effort — never blocks IG/Story). The GCP project must be **approved for the Business Profile API** (gated access request) or the API 403s. The sheet publisher reaches this route via the Apps Script Script Property `GOOGLE_PUBLISH_URL`.

**Instagram publishing** (`POST /api/promos/publish-instagram`): publishes posters from `public/promos/` via the Graph API content-publishing flow (`/media` → `/media_publish`). The `INSTAGRAM_ACCESS_TOKEN` must carry the **`instagram_content_publish`** permission — if the current token is a Basic-Display/Instagram-login token without that scope, publishing will 403 and the token must be reissued via a Facebook app with the IG account linked.

**Facebook Page cross-post**: after a successful IG publish, the same route posts the image + caption to the Facebook Page via `POST graph.facebook.com/v23.0/{FB_PAGE_ID}/photos`. Requires `FB_PAGE_ID` + `FB_PAGE_ACCESS_TOKEN` (a Page access token with `pages_manage_posts` + `pages_read_engagement` from a Facebook app linked to the Page — the Instagram-login token cannot post to a Page). If unset, the FB step is skipped and reported as `facebook.skipped` in the response; an FB failure never fails the request once IG has published (reported in `facebook.error`).

No Toast credentials are used. The menu is static by default but can be driven live by a Google Sheet via `MENU_SHEET_CSV_URL` (see `MENU-SHEET-SYNC.md`). `NEXT_PUBLIC_ELFSIGHT_APP_ID` may appear in `.env.local` but is unused.

## Key Patterns

- Path alias: `@/*` maps to `./src/*`
- All client components are marked with `'use client'` directive
- framer-motion is used for all animations (page transitions, card entrances, hover effects, nav indicators with `layoutId`)
- Tailwind classes use the custom color tokens directly (e.g., `bg-card`, `text-accent`, `border-border`)
- Menu and restaurant data are hardcoded in `menu.ts` — the site renders fully without any API credentials; only `/events`, `/social`, and the location map need external services
