# Content Strategy — American Heroes & Brew

How we keep Instagram + Facebook active with the least manual work. Two channels:
**Feed** (permanent, designed posters / reels) and **Story** (24h, casual + auto-generated).

> **One sheet, one tab per month, one row per post.** There is no separate "Story" tab
> anymore (retired June 2026). Everything — Feed posters, Story videos, the recurring daily
> specials, and multi-channel drops — lives as a dated row in that month's tab. Want two posts
> on the same day? Add two rows with the same `Post Date`. Want one media to hit both channels?
> Set `Channel = Feed, Story`.

## Post types & cadence

| # | Category | Channel | Cadence | Source / asset | Approval |
|---|----------|---------|---------|----------------|----------|
| 1 | **Daily Special** | Story (video) | Mon–Fri | `public/promos-video/<key>-{scratcher,slot}.mp4`, auto-seeded into the month tab | Pre-approved (auto-seed) |
| 2 | **Local Game Invite** | Story (image) | Each local-team game day | Auto matchup card (`/api/og/event?ratio=9x16`) for today's `LOCAL`-tier games | Automatic |
| 3 | **Marquee Event** | Feed (+FB) | ~1–3 / week | Designed poster in `public/promos/`, row in the month tab | Jenee approves in sheet |
| 4 | **Holiday / Theme** | Feed (+FB) | As they land | Designed poster, row in the month tab | Jenee approves in sheet |
| 5 | **Evergreen / Brand** | Feed (+FB) | ~weekly | Designed poster / reel (fantasy, watch-party HQ, menu highlights) | Jenee approves in sheet |
| 6 | **Event Reel** | Feed, Story | Big match / event days | 9:16 reel in `public/promos-video/` (e.g. `AHB-watchparty_<matchup>.mp4`) | Jenee approves in sheet |

**Weekly rhythm:** 1 special Story/day (Mon–Fri, auto) + local-game Story invites as games
occur + ~2–3 Feed posts/week. Jenee approves the whole week from one email.

## What's automatic vs manual

- **Automatic (no action):** the Mon–Fri daily special Story (auto-seeded into the month tab),
  local-game Story invites, publishing of any approved row at its scheduled time, the weekly
  approval email, poster thumbnails on the website event cards.
- **Manual (you):** create designed posters/reels for Marquee/Holiday/Evergreen/Event, drop the
  file in `public/promos/` (image) or `public/promos-video/` (video), **commit + deploy**, then
  add a row in the month tab; Jenee sets `Approval = Approve`.

## The monthly sheet ("Event Posters & Posts")

One **tab per month**, named like `July 2026`. Ten columns (matched by header name — order
doesn't matter):

`Post Date` · `Post Time` · `Channel` · `Media` · `Headline` · `Caption` · `Story Caption` · `Tags` · `Approval` · `Posted` · `Notes`

| Column | What it does |
|--------|--------------|
| **Post Date** | The day it posts. `6/28/2026` or `Jun 28, 2026`. |
| **Post Time** | Time of day (PT). `11:00 AM` / `4:30 PM`. The publisher re-arms at each row's time. |
| **Channel** | `Feed`, `Story`, or both `Feed, Story`. For `Feed, Story` it posts to **each** (the common case — most content goes to both). |
| **Media** | One filename. `*.jpg`/`*.png` → `/promos/`; `*.mp4`/`*.mov` → `/promos-video/`. A full `https://…` URL also works. |
| **Headline** | Optional bold opener for the **feed** post. Goes first in the feed caption. Leave **blank** for casual posts. |
| **Caption** | The **feed / post** caption — what shows on the IG grid post + the Facebook cross-post (e.g. *"$4 street tacos + the World Cup on every screen…"*). |
| **Story Caption** | The casual **"what's on your mind"** line for the **Story** (e.g. *"I want some tacos! 🌮"*). Used when the row posts to the Story; **if blank, the Story falls back to `Caption`.** So a `Feed, Story` row sends `Caption` to the feed and `Story Caption` to the story. *(IG Stories don't visibly render a caption — this is stored/sent for FB + records.)* |
| **Tags** | Hashtags, appended last (to both the feed and story caption). |
| **Approval** | `Approve` publishes; `Polish` sends the row to the AI revision routine (uses `Notes`). |
| **Posted** | Stamped automatically after a successful post so the row never repeats. Leave empty. |
| **Notes** | Free notes; also the instruction the `Polish` routine reads when revising. |

**Feed caption = `Headline` + `Caption` + `Tags`. Story caption = `Story Caption` + `Tags`** (each
separated by a blank line, blanks skipped). A `Feed, Story` row posts each to its own channel; if
`Story Caption` is blank the story reuses the feed caption. Story-only specials just fill `Caption`.

A row publishes when **Approval = `Approve`**, **Posted** is empty, and its **Post Date/Time** is
now-or-earlier today. Multiple rows can share a date — they all post at their own times.

### Add a Feed post (designed poster)
1. Put the poster (1080×1350 or 1080×1080 JPG) in `heroes-brew/public/promos/`, commit, **deploy**.
2. In the current month tab, add a row: `Post Date`, `Post Time`, `Channel = Feed`,
   `Media = <name>.jpg`, a `Headline`, a `Caption`, `Tags`.
3. Jenee sets `Approval = Approve`. It posts at the scheduled time (IG + Facebook).

### Add an Event reel to Feed **and** Story (the common case)
1. Put the 9:16 reel (1080×1920 H.264/AAC MP4) in `public/promos-video/`, commit, **deploy**, and
   confirm the file is live (see *Media* below).
2. Add a row: `Channel = Feed, Story`, `Media = <name>.mp4`, `Caption` = the full **feed** post
   caption, `Story Caption` = the casual "what's on your mind" line for the **story**, `Tags`.
   The feed post gets `Caption`; the story gets `Story Caption` (leave it blank to reuse `Caption`).
   (IG Reels loop by design; Stories play once.)
3. `Approval = Approve`. It posts a Reel to the Feed **and** the video to the Story.

### The recurring daily specials (auto)
The Mon–Fri specials are **seeded automatically** into the current month tab by the Apps Script
(`seedTodaySpecial`, daily 8 AM) — one `Story` row per weekday, pre-approved, with the casual
caption. You don't add these by hand. To pre-fill a stretch of dates (e.g. set up a new month),
run `backfillSpecials()` once — it fills the current + next month and is safe to re-run.

| Day | Key / video | Caption ("what's on your mind") |
|-----|-------------|----------------------------------|
| Mon | `mahalo-{scratcher,slot}.mp4` | Sliders on my mind 🤙 Mahalo Monday at Heroes. |
| Tue | `taco-{scratcher,slot}.mp4` | I want some tacos! 🌮 Taco Tuesday at Heroes. |
| Wed | `wings-{scratcher,slot}.mp4` | Wing it — it's Humpday 🍗 Wings & Wells Wednesday at Heroes. |
| Thu | `burgers-{scratcher,slot}.mp4` | Burger o'clock 🍔🍺 Burgers & Beer Thursday at Heroes. |
| Fri | `funday-{scratcher,slot}.mp4` | Cheers to Friday! 🍻 Friday Funday at Heroes. |

The filename names both the special and its **theme**: `-scratcher` (lotto scratch-off) or
`-slot` (Heroes Jackpot slot machine). The theme alternates by week so it's never identical two
weeks running. Edit the captions/times/keys in the `SPECIALS` map at the top of
`scripts/sheet-auto-publisher.gs`.

### "Polish" — AI revision (Approval dropdown)
Set **Approval = `Polish`** and write what you want changed in **Notes** (e.g. "punchier, mention
happy hour"). A Claude Code agent reads the flagged rows via the Apps Script web app
(`doGet`/`doPost`, `POLISH_SECRET`), rewrites Headline/Caption/Tags using the Notes as guidance,
writes the result back, and clears Approval so Jenee re-reviews — no paid API.

**Run-on-demand only (not scheduled).** The polish agent is the `heroes-polish` cloud routine, and
it is **disabled** on purpose — a cloud routine can only run on a cron or a manual trigger, it
cannot watch the sheet for an edit, so leaving it on a schedule meant it ran every hour and pinged
even when nothing was flagged. Do **not** re-enable the cron. When you flag rows `Polish`, run the
review once on demand: open https://claude.ai/code/routines/trig_01EGSqfdQC4cGRP6FqH4Lr4E and click
**Run now** (or ask Claude Code to run it). It exits immediately with "no rows to polish" if nothing
is flagged.

## Media — where files live, how to name them, how to add new ones

**Every `Media` value resolves to a public URL on the live site:**

| File type | Folder in repo | Live URL |
|-----------|----------------|----------|
| Poster image | `heroes-brew/public/promos/<name>.jpg` | `https://americanheroesandbrew.com/promos/<name>.jpg` |
| Video / reel | `heroes-brew/public/promos-video/<name>.mp4` | `https://americanheroesandbrew.com/promos-video/<name>.mp4` |

So a row with `Media = event-padres-dodgers.jpg` posts the file at
`/promos/event-padres-dodgers.jpg`; `Media = AHB-watchparty_mexico-southkorea.mp4` posts
`/promos-video/AHB-watchparty_mexico-southkorea.mp4`. **The publisher fetches the file from the
live site**, so a `Media` link only works once the file is committed **and deployed**.

**Naming conventions (keep links readable + collision-free):**
- Daily specials: `<key>-<theme>.mp4` where key ∈ `mahalo|taco|wings|burgers|funday` and theme ∈
  `scratcher|slot` (e.g. `mahalo-scratcher.mp4`, `taco-slot.mp4`).
- Designed event posters: `event-<slug>.jpg` (e.g. `event-padres-dodgers.jpg`, `event-flag-day.jpg`).
- Evergreen/brand: descriptive slug (`fantasy-draft-hq.jpg`, `hero-up-watch-party.jpg`).
- Event reels: `AHB-<theme>_<matchup>.mp4` (e.g. `AHB-watchparty_mexico-southkorea.mp4`).
- All lower-kebab-case; no spaces (spaces break the URL).

**Adding new media — the checklist:**
1. Drop the file in the right folder (`public/promos/` for images, `public/promos-video/` for video).
2. Spec check: posters 1080×1350 or 1080×1080 JPG; reels/stories 1080×1920 H.264/AAC MP4.
3. `git add` the file, commit, push, and **deploy to production** (see `heroes-brew/CLAUDE.md` —
   the GitHub→Vercel webhook is unreliable; deploy `master` via the Vercel REST API, poll to READY).
4. **Verify the link is live:** `curl -I https://americanheroesandbrew.com/promos-video/<name>.mp4`
   → `HTTP 200` + `content-type: video/mp4` (or `image/jpeg` for `/promos/<name>.jpg`).
5. Only then add the sheet row and set `Approval = Approve` — otherwise the publisher 404s the
   media when it tries to post.

## Regenerating the daily-special / story videos

The two daily-special themes are rendered by separate scripts, each emitting the themed
`<key>-<theme>.mp4` name directly. Edit each script's `ITEMS` data, then:

```bash
cd heroes-brew
npm run render:specials          # all 5 keys → <key>-scratcher.mp4 AND <key>-slot.mp4
npm run render:scratcher         # just the scratch-off halves (scratch-render.mjs)
npm run render:slot              # just the slot-machine halves (slot-render.mjs)
node scripts/specials-video/scratch-render.mjs taco   # one key
```

Commit the updated MP4s and deploy, then re-run `linkifyMedia` if you added new filenames.
Videos are 1080×1920 H.264/AAC (IG Story/Reel spec). Backgrounds live in
`public/promos-video/bg/`; `add-audio.mjs` / `enhance-bg.mjs` are helpers.
(`render.mjs` is the **deprecated** legacy generic renderer — it still emits the old `<key>-<n>.mp4`
naming, so don't run it for the specials. `foodporn-render.mjs` / `menu-render.mjs` are separate
Feed-content renderers.)

## Automation map

| Piece | Where | Trigger |
|-------|-------|---------|
| Sheet publisher (Feed/Story, image/video, multi-channel) | `scripts/sheet-auto-publisher.gs` (`publishDue`) | Fires at each row's scheduled time; re-arms on any sheet edit; daily 11 PM catch-up |
| Daily special auto-seed → month tab | same Apps Script (`seedTodaySpecial`) | Daily 8 AM — enable once with `enableSpecials()` |
| Backfill specials into current + next month | same Apps Script (`backfillSpecials`) | Run once by hand to pre-fill |
| Weekly approval digest → Jenee | same Apps Script (`weeklyDigest`) | Weekly (Mon 9 AM) |
| Local-game Story invites | `/api/cron/story-invites` | Vercel cron, daily 9 AM PT (`0 16 * * *` UTC) |
| IG token refresh | `/api/cron/instagram-refresh` | 1st & 15th, 6 AM |
| Publish endpoint (IG feed/story + FB) | `/api/promos/publish-instagram` | Called by the publisher |

> The old Vercel `publish-due` cron and the separate `Story` tab / `postStoryRotation` rotation
> are **retired** — superseded by the consolidated month-tab model above. `src/lib/promos-sheet.ts`
> (read by the now-unscheduled `publish-due` route) is kept only as a legacy reader.

## Apps Script setup (one time)

See the header of `scripts/sheet-auto-publisher.gs`. In short: paste it into the sheet's Apps
Script editor (Time zone = America/Los_Angeles), set Script Properties (`PUBLISH_URL`,
`PROMOS_SECRET`, `SITE`, `DIGEST_TO`, `DIGEST_DOW`, `POLISH_SECRET`), run `setupMonthlyTabs`, run
`setup`, run `enableSpecials`, then run `backfillSpecials` once. For Polish, also
Deploy → New deployment → Web app (execute as me, access: anyone with the link) and give the
routine that `/exec` URL.

## Google Business Profile posts (the `Google` channel)

Add `Google` to a row's **Channel** (e.g. `Feed, Story, Google`) to also post to the business's
Google Search/Maps listing. Posting goes through `/api/promos/publish-google` →
`mybusiness.googleapis.com/v4/.../localPosts`. Google posts are **image or text only** (no video),
so video rows post text-only there; image rows include the poster. Each post gets a "Learn more →
website" button. The Google channel is **best-effort** — a Google failure is logged but never blocks
the IG/Story `Posted` stamp — and it's **skipped entirely until configured**.

**One-time activation (gated — Google must approve API access):**
1. **GCP project + API:** in a Google Cloud project (signed in as the GBP manager,
   `kurkafund@gmail.com`), enable the **Google Business Profile / "Google My Business" API**.
2. **Request API access:** submit Google's Business Profile API **access request form** (the API
   returns `403 PERMISSION_DENIED` until the project is approved — this is a review, allow days).
3. **OAuth refresh token:** create an OAuth 2.0 client, then mint a **refresh token** for the GBP
   account with scope `https://www.googleapis.com/auth/business.manage` (one consent screen).
4. **IDs:** get the `accounts/{ACCOUNT_ID}` and `locations/{LOCATION_ID}` (via the Account
   Management / Business Information APIs, or the account/location picker).
5. **Vercel env** on project `heroes`: `GOOGLE_BUSINESS_CLIENT_ID`, `GOOGLE_BUSINESS_CLIENT_SECRET`,
   `GOOGLE_BUSINESS_REFRESH_TOKEN`, `GOOGLE_BUSINESS_ACCOUNT_ID`, `GOOGLE_BUSINESS_LOCATION_ID`; redeploy.
6. **Apps Script:** set Script Property `GOOGLE_PUBLISH_URL = https://americanheroesandbrew.com/api/promos/publish-google`.
   Until this property is set, the `Google` channel is silently skipped (safe).

## Marquee vs Local

- **Marquee** (designed Feed post): championships, followed-team (Padres/Chargers/Raiders) playoff
  games, Monday Night Football — or anything you tag `Marquee` in the sheet. The sheet tag wins.
- **Local** (auto Story invite): any other game involving a local SoCal team. Posted to the Story
  automatically by the `story-invites` cron — no row needed.

## Known follow-ups

- The 9:16 auto Story-invite card is intentionally simple; a richer tall layout would lift
  engagement. Designed posters/reels remain the path for Marquee.
- Auto-seeding Marquee Feed rows into the sheet from the live events feed (so Jenee only approves)
  would require Sheets write access from the server; today Marquee posters are added by hand.
- Facebook Page cross-post is blocked on Page ownership/admin access (IG works); see project notes.
