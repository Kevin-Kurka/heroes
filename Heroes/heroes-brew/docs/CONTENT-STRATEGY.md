# Content Strategy — American Heroes & Brew

How we keep Instagram + Facebook active with the least manual work. Two channels:
**Feed** (permanent, designed posters) and **Story** (24h, mostly auto-generated).

## Post types & cadence

| # | Category | Channel | Cadence | Source / asset | Approval |
|---|----------|---------|---------|----------------|----------|
| 1 | **Daily Special** | Story (3–6s video) | Every day | `public/promos-video/special-<weekday>.mp4`, code-generated from the specials data | Pre-approved (rotation) |
| 2 | **Local Game Invite** | Story (image) | Each local-team game day | Auto matchup card (`/api/og/event?ratio=9x16`) for today's `LOCAL`-tier games | Automatic |
| 3 | **Marquee Event** | Feed (+FB) | ~1–3 / week | Designed poster in `public/promos/`, scheduled in the monthly sheet | Jenee approves in sheet |
| 4 | **Holiday / Theme** | Feed (+FB) | As they land | Designed poster, scheduled in the sheet | Jenee approves in sheet |
| 5 | **Evergreen / Brand** | Feed (+FB) | ~weekly | Designed poster (fantasy, watch-party HQ, menu highlights) | Jenee approves in sheet |

**Weekly rhythm:** 1 special Story/day + local-game Story invites as games occur +
~2–3 Feed posts/week. Jenee approves the whole week from one email.

## What's automatic vs manual

- **Automatic (no action):** daily special Story (rotation), local-game Story invites,
  publishing of any approved sheet row at its scheduled time, the weekly approval email,
  poster thumbnails on the website event cards.
- **Manual (you):** create designed posters for Marquee/Holiday/Evergreen and drop them in
  `public/promos/`; add a row in the month tab; Jenee sets `Approval = Approve`.

## Marquee vs Local

- **Marquee** (designed Feed post): championships, followed-team (Padres/Chargers/Raiders)
  playoff games, Monday Night Football — or anything you tag `Marquee` in the sheet. The
  sheet tag is authoritative.
- **Local** (auto Story invite): any other game involving a local SoCal team. Posted to the
  Story automatically by the `story-invites` cron — no row needed.

## The monthly sheet ("Event Posters & Posts")

One **tab per month**, named like `July 2026`. Ten columns:

`Post Date` · `Post Time` · `Channel` · `Media` · `Headline` · `Caption` · `Tags` · `Approval` · `Posted` · `Notes`

- **Channel** = `Feed`, `Story`, or both (`Feed, Story`) — posts to each. (Set up as a dropdown.)
- **Media** = one filename: `*.jpg`/`*.png` → `public/promos/`; `*.mp4` → `public/promos-video/`
  (type detected from the extension; a full URL also works).
- **Headline / Caption / Tags** combine into the IG caption (headline, then caption, then tags).
- A row publishes when **Approval = `Approve`**, **Posted** is empty, and its **Post Date/Time**
  is now-or-past today. After it posts, the script stamps `Posted` so it never repeats.

### Add a Feed post (designed poster)
1. Put the poster (1080×1350 or 1080×1080, JPG) in `heroes-brew/public/promos/`, commit, deploy.
2. In the current month tab, add a row: `Post Date`, `Post Time`, `Channel=Feed`, `Media=<name>.jpg`,
   `Headline`, `Caption`, `Tags`.
3. Jenee sets `Approval=Approve`. It posts at the scheduled time (IG + Facebook).

### "Polish" — AI revision (Approval dropdown)
Set **Approval = `Polish`** and write what you want changed in **Notes** (e.g. "punchier, mention
happy hour"). A Claude Code routine picks it up, rewrites Headline/Caption/Tags using the Notes as
guidance, writes the result back into the row, and clears Approval so Jenee re-reviews. Powered by
the Apps Script web app (`doGet`/`doPost`, `POLISH_SECRET`) — no paid API.

## Automation map

| Piece | Where | Trigger |
|-------|-------|---------|
| Sheet publisher (Feed/Story, image/video) | `scripts/sheet-auto-publisher.gs` (bound Apps Script) | Fires at each post's scheduled time; re-arms on any sheet edit; daily 11 PM catch-up |
| Weekly approval digest → Jenee | same Apps Script (`weeklyDigest`) | Weekly (Mon 9 AM) |
| Daily special Story rotation | same Apps Script (`seedTodaySpecial`) | Daily 8 AM — **enable with `enableSpecials()`** once videos are deployed |
| Local-game Story invites | `/api/cron/story-invites` | Vercel cron, daily 9 AM PT |
| IG token refresh | `/api/cron/instagram-refresh` | 1st & 15th, 6 AM |
| Publish endpoint (IG feed/story + FB) | `/api/promos/publish-instagram` | Called by the above |

## Regenerating the special videos

Specials change? Edit the data in `scripts/specials-video/render.mjs`, then:

```bash
cd heroes-brew
npm run render:specials          # all 7 days → public/promos-video/special-<weekday>.mp4
npm run render:specials tuesday  # just one
```

Commit the updated MP4s and deploy. Videos are 1080×1920 H.264/AAC, ~4s (IG Story spec).

## Apps Script setup (one time)

See the header of `scripts/sheet-auto-publisher.gs`. In short: paste it into the sheet's
Apps Script editor, set Script Properties (`PUBLISH_URL`, `PROMOS_SECRET`, `SITE`,
`DIGEST_TO`, `DIGEST_DOW`), run `setupMonthlyTabs`, run `setup`, then `enableSpecials`
after the special videos are live.

## Known follow-ups

- The 9:16 auto Story-invite card is intentionally simple; a richer tall layout would lift
  engagement. Designed posters remain the path for Marquee.
- Auto-seeding Marquee Feed rows into the sheet from the live events feed (so Jenee only
  approves) would require Sheets write access from the server; today Marquee posters are
  added to the sheet by hand.
