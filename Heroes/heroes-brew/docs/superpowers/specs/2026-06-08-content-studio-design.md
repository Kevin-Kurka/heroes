# American Heroes & Brew — In-App Content Studio (Design Spec)

Date: 2026-06-08
Status: Draft for review
Owner: Kevin Kurka (kurkafund@gmail.com)

## 1. Purpose & Goals

Replace the Google Sheet ("Event Posters & Posts") and all ad-hoc/external publishing
with a **login-gated "Content Studio" inside the website** where staff:

1. Upload restaurant photos (food, crowds, game days).
2. Use an **interactive AI image-editing chat** to enhance each photo (creative control
   stays with the human; iterate until approved). Optimized for making **food look great**.
3. Generate **on-brand posters** = enhanced photo + a fixed branded text/logo overlay,
   with AI-drafted headline / caption / hashtags the user can edit.
4. **Schedule** posts on a weekly calendar (AI proposes from upcoming events + specials).
5. **Auto-publish** approved posts to Instagram on schedule (Google Business Profile later).

### Non-goals (this spec)
- No migration of existing Sheet data ("we don't need to save data from previous stuff").
- No fully-generative posters (text rendered by image models). Brand frame is deterministic.
- GBP (Google Business Profile) publishing is designed-for but deferred to a later phase.
- No multi-tenant / multi-restaurant support.

### Success criteria
- Staff can go upload → enhance → poster → schedule → auto-post entirely in-app, behind auth.
- Posters look consistent (fixed brand frame) regardless of source photo.
- The Instagram publish path (already built & verified) is reused unchanged.
- The Sheet and any external "daily task" are fully retired.

## 2. Current State (what exists today)

- Static Next.js 16 / React 19 app on Vercel; **no auth, no database, no file storage, no AI services.**
- `POST /api/promos/publish-instagram` — verified working: container→poll→publish to
  `@americanheroesandbrew` (BUSINESS, user id `17841447701652525`). Guarded by `PROMOS_SECRET`.
- `GET /api/cron/instagram-refresh` — refreshes the long-lived IG token; needs `VERCEL_TOKEN`
  (outstanding) + `CRON_SECRET` (set) + `VERCEL_PROJECT_ID` (set) to write the new token back.
- `getAllEvents()` / `getUpcomingEvents()` (`src/lib/events.ts`) — live sports + holidays feed.
- Brand assets: `public/badge-clean.png` (logo), Geist Sans/Mono, tokens amber `#f59e0b` / navy.
- Existing posters `public/promos/event-*.jpg` define the target poster look.

## 3. Architecture Overview

```
/studio (auth-gated)
  ├─ Media Studio    → upload → AI edit chat → approve  ──┐
  ├─ Poster Composer → pick image + AI copy + overlay ────┤  writes to
  ├─ Scheduler       → weekly calendar + AI suggestions ──┘  Neon Postgres + Vercel Blob
  └─ (auth via middleware on /studio and /api/studio/*)

Vercel Cron (hourly) → /api/cron/publish-due
  → query scheduled_posts due+approved → publish to IG (existing flow) → mark posted in DB
```

New infrastructure:
- **Auth.js (NextAuth v5)** — Credentials provider, users in Neon, bcrypt hashes, JWT-cookie
  sessions. Middleware protects `/studio` + `/api/studio/*`. (Chosen over Clerk to keep the app
  self-contained / no third-party account; Clerk remains a drop-in upgrade later.)
- **Neon Postgres** — serverless Postgres (see `neon-postgres` skill). Source of truth for media,
  posters, schedule. Accessed via `@neondatabase/serverless` + a thin query layer in `src/lib/db/`.
- **Vercel Blob** — stores uploads, enhanced versions, and final posters. Posters are **public**
  (Instagram requires a public `image_url`); raw uploads may be public for simplicity in v1.
- **Claude API** (`claude-api` skill, prompt caching) — headline / caption / hashtag drafting and
  AI event suggestions. Brand voice modeled on existing captions (local, assumptive-close, address).
- **AI image-editing provider** (pluggable) — instruction-based edit: `editImage(url, instruction)`
  → new image url. Provider selection is an OPEN DECISION (§9) with criteria.
- **Poster overlay** — Satori / `@vercel/og` renders a React/SVG brand template to PNG, composited
  over the enhanced background; output uploaded to Blob.

## 4. Data Model (Neon Postgres)

All tables: `id uuid pk default gen_random_uuid()`, `created_at timestamptz default now()`,
`updated_at timestamptz`. `snake_case`. Soft-delete via `deleted_at` where useful.

- **users** — `email unique`, `password_hash`, `role` (`admin`|`editor`), `name`.
- **media_assets** — `kind` (`upload`|`enhanced`), `blob_url`, `source_asset_id` (fk, for enhanced),
  `status` (`draft`|`approved`), `created_by` (fk users), `meta jsonb` (dims, mime, alt text).
- **image_edits** — `media_asset_id` (fk), `instruction` text, `result_blob_url`, `provider`,
  `created_by`. Append-only chat/edit history; the approved result becomes an `enhanced` media_asset.
- **posters** — `media_asset_id` (fk, the approved enhanced image), `headline`, `caption`,
  `hashtags`, `template_key`, `poster_blob_url`, `status` (`draft`|`approved`), `created_by`.
- **scheduled_posts** — `poster_id` (fk), `channels text[]` (`{ig}`, later `{ig,gbp}`),
  `scheduled_at timestamptz`, `status` (`scheduled`|`publishing`|`posted`|`failed`|`canceled`),
  `posted_at`, `ig_media_id`, `error`, `approved_by` (fk), `created_by`.

Publisher idempotency: status transitions + `SELECT … FOR UPDATE SKIP LOCKED` when claiming due rows
(`scheduled`→`publishing`→`posted`/`failed`), so concurrent/duplicate cron runs can't double-post.

## 5. Subsystem Designs

### A. Auth
- Auth.js v5 Credentials provider; `src/auth.ts` config; `middleware.ts` matches `/studio/:path*`
  and `/api/studio/:path*`, redirecting unauthenticated users to `/studio/login`.
- Seed first admin via a one-off script (`scripts/create-admin.ts`) reading `ADMIN_EMAIL` /
  `ADMIN_PASSWORD` env, bcrypt-hashing into `users`. No public sign-up.
- All `/api/studio/*` handlers re-check the session server-side (defense in depth).

### B. Media Studio (upload → AI edit chat → approve)
- Upload UI (`/studio/media`): drag-drop to Vercel Blob via a signed client-upload route; create
  `media_assets(kind=upload)`.
- Per asset, an **edit chat panel**: user types an instruction → `POST /api/studio/media/:id/edit`
  → calls `editImage(currentUrl, instruction)` → stores `image_edits` row + shows result; user can
  iterate. Each turn edits the latest result (version chain). "Revert" picks an earlier version.
- **Approve** promotes the chosen result to a `media_assets(kind=enhanced, status=approved)`.
- Guardrail copy in UI: enhancements should represent the actual dish (no fabricating items) — see §8.

### C. Poster Composer
- `/studio/posters/new`: pick an approved enhanced image; choose/auto-fill event context.
- `POST /api/studio/copy` → Claude drafts `{headline, caption, hashtags}` from context + brand voice;
  user edits inline.
- Live preview: Satori template (`src/lib/poster/template.tsx`) renders headline + logo + brand frame
  over the image; `template_key` selects a style (e.g., `sporty`, `editorial` — matching the Sheet's
  Style column). `POST /api/studio/posters` composites final PNG → Blob → `posters` row.
- Approve sets `posters.status=approved`.

### D. Scheduler
- `/studio/calendar`: weekly view of `scheduled_posts`.
- **AI suggestions:** `POST /api/studio/suggest` pulls `getAllEvents()` + user-entered specials,
  asks Claude to propose a week of posts (which event, date/time, which approved poster or "needs
  poster"), returned as draft `scheduled_posts` for human approval. Nothing publishes unapproved.
- Manual create/edit: assign poster, datetime (PT), channels. Approve → `status=scheduled`.

### E. Publisher (cron)
- `vercel.json` cron `GET /api/cron/publish-due` hourly (guarded by `CRON_SECRET`).
- Claims due rows (`scheduled` & `scheduled_at<=now` & approved) with `FOR UPDATE SKIP LOCKED`,
  sets `publishing`, publishes each via the existing IG flow (refactored into
  `src/lib/instagram-publish.ts` and shared with `/api/promos/publish-instagram`), sets `posted` +
  `ig_media_id` or `failed` + `error`. GBP channel is a no-op stub until its phase.

## 6. Build Phasing

1. **Foundation + auto-publish** — Auth.js, Neon schema + query layer, Blob wiring, minimal
   Scheduler (manual rows), `publish-due` cron. Retires the Sheet end-to-end.
2. **Poster Composer** — upload + Satori brand overlay + Claude copy (manual image select).
3. **AI image-editing chat** — interactive enhancement loop + provider integration.
4. **Extras** — AI event suggestions polish, GBP channel, token-refresh completion.

Each phase ships independently and is testable on its own.

## 7. Testing
- Unit: poster compositing (snapshot of Satori output), caption prompt builder, scheduler due-query,
  publisher idempotency (claim/skip-locked), auth middleware redirects.
- Integration: upload→poster→schedule→publish with the IG Graph API mocked.
- E2E (Playwright): login gate, upload + approve, compose + schedule.
- Existing verified IG publish path is covered by the live smoke test already run.

## 8. Security & Policy
- Auth required on every `/studio` page and `/api/studio/*` route (middleware + per-handler check).
- Secrets server-only: IG token, `PROMOS_SECRET`, `CRON_SECRET`, DB URL, Blob token, AI keys. Never
  shipped to the client.
- Rate-limit AI endpoints (edit/copy/suggest) per user to bound cost.
- IG publish rate cap (25/24h) respected; publisher checks `content_publishing_limit`.
- **Food-authenticity policy:** AI edits enhance lighting/clarity/composition of the *actual* dish;
  the UI warns against adding food items/ingredients not served. Documented in the studio.
- The exposed IG token (pasted in chat during setup) should be regenerated post-launch.

## 9. Open Decisions (resolve during implementation)
- **AI image-editing provider** — candidates: Google Gemini image editing, Black Forest FLUX
  (instruction/Kontext), OpenAI image edit. Criteria: food-edit quality, $/image, latency,
  commercial ToS. Build behind `editImage()` so the provider is swappable; spike 2–3 on real photos.
- **Brand template values** — exact fonts/sizes/placement extracted from existing `event-*.jpg`;
  produce `sporty` + `editorial` variants to match the Sheet's two styles.
- **Auth provider** — ship Auth.js credentials; revisit Clerk if staff/SSO needs grow.
- **Blob privacy for raw uploads** — public in v1 for simplicity; revisit signed access if needed.

## 10. Reused / Retired
- **Reused:** IG publish flow (now `src/lib/instagram-publish.ts`), token-refresh cron, `getAllEvents()`.
- **Retired:** the "Event Posters & Posts" Google Sheet workflow, any external daily publish task,
  and the never-built sheet-write-back publisher. (The unrelated **menu** sync via `MENU_SHEET_CSV_URL`
  stays as-is — it is not part of this system.)
