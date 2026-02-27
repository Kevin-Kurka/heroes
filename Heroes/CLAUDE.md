# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**American Heroes & Brew** — a mobile-first, dark-themed website for a sports bar in Carlsbad, CA. Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, and framer-motion. The site auto-syncs menu/location data from the Toast POS system and aggregates sports schedules + holidays into a unified events feed.

The full product requirements document is at `/prd.md`.

## Commands

All commands run from the `heroes-brew/` directory:

```bash
cd heroes-brew
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build (validates ISR + types)
npm run lint     # ESLint with next/core-web-vitals + typescript rules
npm start        # Serve production build
```

## Architecture

### Server/Client Component Split

Every page follows the same pattern: a **server component** (`page.tsx`) fetches data at build/ISR time, then passes it as props to a **client component** (`*PageClient.tsx`) that handles interactivity.

```
src/app/menu/page.tsx          → Server: calls getMenus(), sets revalidate=900
src/app/menu/MenuPageClient.tsx → Client: sticky category nav, animated menu cards
```

Pages: `/` (home), `/menu`, `/events`, `/social`, `/location`

### ISR (Incremental Static Regeneration)

All data-driven pages use `export const revalidate = 900` (15-minute cache). External APIs are only called server-side during rebuild — never from the browser.

### Data Layer (`src/lib/`)

- **`toast.ts`** — Toast POS integration. OAuth2 client-credentials flow (`getAccessToken()`), token caching, and authenticated fetches via `toastFetch()`. Provides `getMenus()` and `getRestaurantInfo()`. Falls back to hardcoded mock data on API failure.
- **`events.ts`** — Aggregates from 3 sources in parallel (`Promise.all`):
  - MLB Stats API (`statsapi.mlb.com`) — all games for the week
  - ESPN API (`site.api.espn.com`) — NFL and NBA scoreboards
  - Nager.at Holiday API — US public holidays within 2 weeks

  All sources normalize into `UnifiedEvent` and sort chronologically.

### Type System (`src/types/index.ts`)

Core types: `UnifiedEvent` (normalized events with `EventType: 'SPORTS' | 'HOLIDAY'`), `ToastMenu`/`ToastMenuGroup`/`ToastMenuItem` (flattened from Toast's nested JSON), `ToastRestaurant`/`DaySchedule`.

### Shared Components (`src/components/`)

| Component | Purpose |
|-----------|---------|
| `TopNav` | Desktop fixed header (hidden on mobile via `hidden md:block`) |
| `BottomNav` | Mobile bottom tab bar (hidden on desktop via `md:hidden`) — thumb-zone ergonomics |
| `Ticker` | Horizontal scrolling sports marquee with CSS animation (`ticker-animate`) |
| `EventCard` | Color-coded by league (MLB red, NFL green, NBA orange) or holiday (pink). Shows live scores when available. |
| `MenuCard` | Menu item card with name, description, price |
| `PageTransition` | framer-motion fade+slide wrapper |

### Theming

Dark mode only. Custom CSS variables defined in `globals.css` `:root` and mapped to Tailwind via `@theme inline`. Key tokens: `--background`, `--card`, `--accent` (amber #f59e0b), `--sports` (blue), `--holiday` (rose). Fonts: Geist Sans + Geist Mono via `next/font`.

### Social Page

The Instagram integration uses a placeholder for an **Elfsight widget** embed (not a custom Meta Graph API integration). The widget code should replace the shimmer grid in `SocialPageClient.tsx`, and the Elfsight script goes in `layout.tsx` with `strategy="lazyOnload"`.

## Environment Variables

Required in `heroes-brew/.env.local`:

```
TOAST_API_HOST=https://ws-api.toasttab.com
TOAST_CLIENT_ID=<client_id>
TOAST_CLIENT_SECRET=<client_secret>
TOAST_RESTAURANT_GUID=<restaurant_guid>
```

The `TOAST_RESTAURANT_GUID` is currently empty — the app uses mock data until this is configured.

## Key Patterns

- Path alias: `@/*` maps to `./src/*`
- All client components are marked with `'use client'` directive
- framer-motion is used for all animations (page transitions, card entrances, hover effects, nav indicators with `layoutId`)
- Tailwind classes use the custom color tokens directly (e.g., `bg-card`, `text-accent`, `border-border`)
- Mock fallbacks exist in `toast.ts` for both menu and restaurant data — the site works without Toast credentials
