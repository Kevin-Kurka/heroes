# Auto-curated Sports Events → Google Business Profile + Schedule Stories

**Date:** 2026-06-28
**Status:** Approved (design)
**Author:** Claude (brainstormed with Kevin Kurka)

## Problem

The bar wants its key games posted **as Google Business Profile Events** (which render
on the Search/Maps listing with a date + time), plus daily schedule **Stories** on
Instagram/Facebook. Today nothing reaches Google: the `publish-google` route exists but
(a) only posts `topicType: STANDARD` (generic updates, not Events) and (b) is dark
because the GBP API gated-access approval is still pending. Curation is also manual.

## Goals

Auto-curate, with **no weekly manual upkeep**, a rolling 7-day horizon of:

| Trigger | Post type | Channel |
|---|---|---|
| World Cup game involving **USA or Mexico** | Google Event | Google |
| **Padres** game (MLB) | Google Event | Google |
| **Chargers** game (NFL) | Google Event | Google |
| NFL **Monday Night** game | Google Event | Google |
| Each **World Cup game-day** | Schedule Story | Story (IG/FB) |
| Each **Sunday with NFL games** | Schedule Story | Story (IG/FB) |

MLB is **Padres-only**; there is no MLB schedule Story. NFL Events/Stories will not fire
until the season starts (Sept 2026) but are built now.

## Non-goals

- Posting *every* game (explicitly rejected — spam risk on the listing).
- Posting curated Events to the IG **Feed** (Google-only for now; Feed can be added later).
- Migrating the existing manually-seeded WC Story rows already in the sheet through 7/19.

## Hard external blocker (unchanged by this work)

Everything here is buildable and testable now, but **live Google output waits on the GBP
API gated-access approval** (submitted 2026-06-22, no decision yet) plus setting the
`GOOGLE_BUSINESS_*` env vars on the Vercel project. Once approved, immediate live output:
**WC USA/Mexico + Padres** Google Events (both in-season now). NFL Events wait for September.

## Architecture

A single new **curation layer** on top of the existing sheet-driven pipeline. The Feed /
Story / daily-special flow is unchanged; this adds a curation source and an EVENT post type.

```
schedule APIs ──► events.ts (curation rules, TS/tested)
                      │
                      ▼
            /api/promos/curate  (PROMOS_SECRET) ──► JSON rows for next 7 days
                      │
                      ▼
   Apps Script  seedCuratedRows()  (daily trigger) ──► upserts rows into month tab (deduped)
                      │
                      ▼
            publishDue() (existing) ──► publish-google (EVENT) / publish-instagram (Story)
                      │
   posters served dynamically: /api/og/event (matchup) · /api/og/schedule (daily slate)
```

Design constraint: the source schedule APIs (ESPN, MLB Stats) only return a rolling
**today→+7 day** window, so the generator runs on a daily trigger over that horizon —
matching the existing `seedTodaySpecial` daily-trigger pattern.

## Components

### 1. Curation rules — `src/lib/events.ts`

Add a curation function (working name `getCuratedPromos()`) returning items over the 7-day
window, each tagged with a `postType` and the fields needed to build a sheet row.

- **USA/Mexico detection:** new helper matching WC (`league === 'WORLDCUP'`) games whose
  `homeTeam`/`awayTeam` is the USA or Mexico men's national team (match on "USA" /
  "United States" and "Mexico"). Verify exact team-name strings ESPN returns for the
  `soccer/fifa.world` scoreboard before finalizing the matcher.
- **Padres / Chargers:** reuse existing `FOLLOWED_TEAMS` membership, scoped per league.
- **Monday Night:** reuse existing `isMondayNight(e)`.
- **WC game-day / NFL Sunday:** group the window's games by PT calendar day; emit one
  `schedule-story` item per WC game-day and per Sunday that has ≥1 NFL game.

Each curated item carries: `postType` (`'google-event' | 'schedule-story'`), PT date,
PT time, title/matchup, ISO start, ISO end (kickoff + ~2.5h for events; day bounds for
stories), `league`, poster URL, caption, story caption, and a stable dedup `key`.

Unit-tested against fixture schedules (no live API in tests).

### 2. `publish-google` EVENT upgrade — `src/app/api/promos/publish-google/route.ts`

Add optional body fields `eventTitle`, `eventStart`, `eventEnd`.
- When all present → `topicType: 'EVENT'` with `event.title` + `event.schedule`
  (`startDate`/`startTime`, `endDate`/`endTime` in the GBP shape).
- When absent → current `topicType: 'STANDARD'` behavior, byte-for-byte unchanged.
- Poster `media` image and `callToAction` preserved in both modes.
- Validation: if any of the three event fields is present, all three are required and
  must parse as dates, else `400`.

### 3. `/api/promos/curate` route — `src/app/api/promos/curate/route.ts`

- Guarded by `PROMOS_SECRET` (same Bearer pattern as the other promo routes).
- Calls the curation function and returns ready-to-write rows:
  `{ date, time, channel, media, headline, caption, storyCaption, tags, eventTitle,
  eventStart, eventEnd, key }`.
- `channel`: `'Google'` for events, `'Story'` for schedule stories.
- `media`: `/api/og/event?...` for events; `/api/og/schedule?league=…&date=…` for stories.
- Never throws on partial source-API failure — returns whatever it could curate (the
  Apps Script treats curation as best-effort, mirroring the Google channel's best-effort
  contract).

### 4. Dynamic schedule poster — `src/app/api/og/schedule/route.tsx`

New 1080×1920 `ImageResponse` route (same `@vercel/og` tech as `/api/og/event`) rendering
the day's slate for `?league=WC|NFL&date=YYYY-MM-DD`. **Replaces the manual
`worldcup-schedule-render.mjs` ffmpeg step for new dates** so the pipeline is fully
hands-off (no machine-side rendering). Styled to the American-flag red/white/blue theme to
match the existing WC poster look. The `.mjs` renderers remain in-repo but leave the auto
path; existing seeded WC rows (≤ 7/19) are untouched and keep their `wc-schedule-*.jpg`.

### 5. Apps Script `seedCuratedRows()` — `heroes-brew/scripts/sheet-auto-publisher.gs`

- New function on a **daily trigger** (alongside `seedTodaySpecial`).
- Calls `/api/promos/curate`, upserts rows into the current month tab.
- **Dedup by `key` stored in the Notes cell**, reusing the `seedSpecialOn_` idempotency
  pattern (run twice → no duplicate rows). Must also skip dates already covered by the
  existing manually-seeded WC Story rows.
- Adds two optional columns `Event Start` / `Event End` the way `addStoryCaptionColumn`
  added `Story Caption` (idempotent). `publishDue` / `googlePayloadFor_` pass these through
  to the EVENT route when the row's channel is Google and the fields are set.
- **Approval policy:** Google Event rows seed with **blank Approval (manual Approve
  required)** — outward-facing, owner stays in control. Schedule Story rows seed as
  `Approve` (auto), matching the daily-special behavior. Single constant to flip if events
  should auto-approve later.

### 6. `publishDue` / `googlePayloadFor_` dispatch

When a due, approved Google row carries `Event Start`/`Event End`, include
`eventTitle`/`eventStart`/`eventEnd` in the Google payload so the route posts an EVENT.
Rows without those fields still post STANDARD. Google failure never blocks the IG/Story
Posted stamp (existing best-effort contract preserved).

## Data flow (end to end)

1. Daily trigger → `seedCuratedRows()` → `GET /api/promos/curate`.
2. Route → `events.ts` curation over the 7-day window → JSON rows.
3. Apps Script upserts deduped rows: Google Events (blank Approval), Stories (Approve).
4. Owner approves Event rows (or auto for Stories).
5. `publishDue` posts due+approved rows: `publish-google` (EVENT, with poster) /
   `publish-instagram` (Story, with schedule poster).
6. Posters render on demand from `/api/og/event` and `/api/og/schedule`.

## Error handling

- Curate route: partial source-API failure → return what's available; total failure →
  empty list + logged error; Apps Script seeds nothing and retries next day.
- EVENT route: missing/invalid event fields → `400`; GBP API 403 (unapproved) → `502`
  surfaced in the publisher's best-effort Google result, never blocking IG/Story.
- Idempotent upsert prevents duplicate rows on repeated triggers.

## Testing

- **Unit (events.ts):** fixture schedules → assert USA/Mexico/Padres/Chargers/MNF tagged
  `google-event`; WC days + NFL Sundays tagged `schedule-story`; everything else excluded.
- **EVENT route:** STANDARD vs EVENT payload shape; field-validation 400s.
- **Curate route:** well-formed rows; auth required.
- **Idempotency:** simulate double seed → no duplicate rows (Apps Script logic review +
  key-dedup unit coverage where feasible).
- **Manual:** open `/api/og/event` and `/api/og/schedule` and eyeball both posters.

## Open items to verify during implementation

- Exact ESPN team-name strings for USA / Mexico on the `soccer/fifa.world` feed.
- GBP `event.schedule` JSON shape (date+time sub-objects) against current API docs.
- Whether `@vercel/og` is already a dependency (it powers `/api/og/event`, so likely yes).
