# Finish Instagram Auto-Publish — Handoff to Claude Code

Written 2026-06-14 by Cowork. Goal: make approved rows in the "Event Posters & Posts"
sheet auto-post via the `publish-due` cron. The **code is already deployed**; only the
items below remain. Run these in the `heroes` repo (has git + `VERCEL_TOKEN`).

## Already verified (don't redo)
- Prod is git-linked to `Kevin-Kurka/heroes` (master), Root Dir `Heroes/heroes-brew`. Latest deploy READY.
- Live in prod: `api/promos/publish-instagram`, `api/cron/publish-due` (cron `0 21 * * *` = 2 PM PT),
  `lib/promos-sheet.ts`, FB cross-post.
- `publish-due` reads `PROMOS_SHEET_CSV_URL`, filters `Approval=Approve` + `Posted (IG)` empty +
  `Post Date = today (PT)`, then POSTs `{imageUrl, caption}` to `publish-instagram`.
  `imageUrl = https://americanheroesandbrew.com/promos/<Image file>`; caption = Caption + "\n\n" + Hashtags.
- Two pending-but-approvable rows already in the sheet, dated Sun Jun 14 2026: `event-ufc-white-house.jpg`,
  `event-stanley-cup-final.jpg`.

## Gaps to close (in order)

### 1. Commit + deploy the new posters (Cowork already staged them in the working tree)
`heroes-brew/public/promos/` now contains:
- `event-stanley-cup-final.jpg` — **1080×1350 (4:5), IG-feed-safe** (letterboxed on navy; the tall
  full-res poster lives in `Heroes Marketing/enhanced-images/event-posts/`).
- `event-ufc-white-house.jpg` — 1080×1080.

```bash
cd Heroes/heroes-brew
git add public/promos/event-stanley-cup-final.jpg public/promos/event-ufc-white-house.jpg
git commit -m "Add Stanley Cup + UFC promo posters to /promos (IG-feed-safe ratios)"
git push origin master
```
> IG rejects feed images outside 0.8–1.91 aspect. Keep any future `/promos` poster within that range
> (the source posters with the bottom banner are ~0.70 — too tall; letterbox to 1080×1350 before publishing).

Then deploy master HEAD via REST (webhook is unreliable — see repo CLAUDE.md), poll until READY, and verify:
```bash
curl -sI https://americanheroesandbrew.com/promos/event-stanley-cup-final.jpg | head -1   # expect 200
```

### 2. Set/verify Vercel **production** env vars
Cron reads these from Vercel, not `.env.local`. Confirm each exists for `production`; add any missing
using the value from `heroes-brew/.env.local`:
`PROMOS_SECRET`, `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_USER_ID`, `CRON_SECRET`, `PROMOS_SHEET_CSV_URL`
(+ optional `FB_PAGE_ID`, `FB_PAGE_ACCESS_TOKEN`).
```bash
TOKEN=$(grep '^VERCEL_TOKEN=' .env.local | cut -d= -f2-)
TEAM=team_SrzLdmhAGbFLu0pesw86zK4L; PROJ=prj_clmgcdScsUoDptrLuzgpsDljdPGM
curl -s "https://api.vercel.com/v9/projects/$PROJ/env?teamId=$TEAM" -H "Authorization: Bearer $TOKEN" \
  | python3 -c "import sys,json;[print(e['key'],e['target']) for e in json.load(sys.stdin)['envs']]"
# add a missing one (repeat per key):
# curl -s -X POST "https://api.vercel.com/v10/projects/$PROJ/env?teamId=$TEAM" -H "Authorization: Bearer $TOKEN" \
#   -H 'Content-Type: application/json' \
#   -d '{"key":"PROMOS_SECRET","value":"<from .env.local>","type":"encrypted","target":["production"]}'
```
If you add/change any prod env var, redeploy so it takes effect.

### 3. Confirm the IG token is valid + publish-scoped
```bash
T=$(grep '^INSTAGRAM_ACCESS_TOKEN=' .env.local | cut -d= -f2-)
curl -s "https://graph.instagram.com/me?fields=id,username,account_type&access_token=$T"
# expect account_type BUSINESS or CREATOR; id should match INSTAGRAM_USER_ID
```
If 400/expired or missing publish scope, the owner must reissue it on a TRUSTED device (see
`INSTAGRAM-PUBLISH-SETUP.md` Step 0) — Cowork's Chrome is an untrusted device for the account.

### 4. Smoke-test ONE publish, then guard against the 2 PM cron double-posting
There is **no write-back** to the sheet, so `Posted (IG)` is the only idempotency gate and nothing sets it
automatically. A manual test + the 2 PM cron on the same day = **duplicate post** (this happened 6/12).
- Trigger once: `curl -s "https://americanheroesandbrew.com/api/cron/publish-due" -H "Authorization: Bearer $CRON_SECRET"`
- On success, immediately set `Posted (IG)` = today's date on any row it posted, so the scheduled cron skips it.
- Re-read the sheet + the IG account right before any retry.

### Done when
A test publish returns `{ ok: true, mediaId }`, the post shows on @americanheroesandbrew, and the row's
`Posted (IG)` is stamped.
