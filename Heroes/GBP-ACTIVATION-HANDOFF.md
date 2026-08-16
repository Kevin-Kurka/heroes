# Google Business Profile Auto-Posting — Activation Handoff

_Last updated 2026-06-22. Picks up the GBP "Google channel" auto-posting work._

**Goal:** let approved rows in the "Event Posters & Posts" sheet (channel `Google`) auto-post
to the American Heroes & Brew Google Business Profile as Local Posts, the same way the
`Feed`/`Story` channels post to Instagram/Facebook. The **code is built & deployed** (commit
`ae02718`); everything below is config + credentials, gated on a Google API approval.

---

## Status snapshot

| Item | Status |
|------|--------|
| Route `POST /api/promos/publish-google` (OAuth refresh → v4 `localPosts`) | ✅ deployed (returns `503 not configured` until creds set) |
| Sheet publisher `Google` channel (best-effort, never blocks IG/Story) | ✅ in repo `.gs`; **NOT yet pasted into the LIVE bound Apps Script** |
| GCP project | ✅ `heroes-gbp` · **project number `287691366713`** |
| Business Profile APIs enabled (Account Mgmt, Business Info, Performance) | ✅ via Cloud Shell `gcloud services enable` |
| Legacy `mybusiness.googleapis.com` (v4 `localPosts`) | ⛔ won't enable until access approved (`PERMISSION_DENIED`) — expected |
| **API access request** | ✅ **submitted 2026-06-22 · support case `2-5722000041279` · review ~7–10 business days (expect ~Jul 2–6)** |
| OAuth consent screen (External, Testing, test user `kurkafund@gmail.com`) | ✅ |
| OAuth client "Heroes GBP Publisher" (Web app, redirect `https://developers.google.com/oauthplayground`) | ✅ |
| **`GOOGLE_BUSINESS_CLIENT_ID`** | `287691366713-p3s9hsm1gban4uh4ne196t123d9bqe9a.apps.googleusercontent.com` |
| Client secret | shown once at creation; **not saved** — reset it at activation (no token tied to it yet, so reset is free) |
| Refresh token / account+location IDs / Vercel env / Apps Script paste | ⏳ deferred to activation |

All five `GOOGLE_BUSINESS_*` vars must be set or the route returns `503 not configured`
and the sheet's `Google` channel is skipped (best-effort — never blocks IG/Story).

---

## ⚠️ Key constraints (don't relearn the hard way)

1. **Access is gated.** Even the "new" Business Profile APIs (Account Mgmt / Business Info)
   that *enabled* successfully will **403 on real calls** until the access request is approved.
   So account/location-ID lookup is also blocked until then.
2. **Testing-mode refresh tokens expire in 7 days** — shorter than the approval wait. The live
   daily cron needs a token that never expires. → **Publish the app to "In production"**
   (Auth Platform → Audience → *Publish app*) before minting the refresh token. `business.manage`
   is a sensitive scope, so production shows an "unverified app" warning at consent; the owner /
   test user can proceed anyway, and the token then doesn't expire.
3. **Check approval status** anytime: GCP Console → Business Profile API → Quotas.
   **0 QPM = not approved yet · 300 QPM = approved.**
4. **Console gotcha (claude-in-chrome):** the GCP **API-Library detail panel** reliably
   "Failed to load" in the controlled browser, but the **console shell, Cloud Shell, and the
   Google Auth Platform pages (`console.cloud.google.com/auth/...`) load fine.** Enable APIs via
   **Cloud Shell `gcloud`** instead of fighting the Library panel.
5. **Credential custody:** the claude-in-chrome harness auto-redacts secret values on read
   (client secret, etc.). Move secrets via **browser clipboard copy→paste** (e.g. OAuth Playground
   → Vercel env field) so they never need to pass through the agent's context.

---

## Activation runbook (do AT approval, ideally one session)

Signed in as `kurkafund@gmail.com` (GBP manager + owner of project `heroes-gbp`):

1. **Confirm approval:** GCP Console → Business Profile API → Quotas shows **300 QPM**.
2. **Publish the OAuth app to Production:** `console.cloud.google.com/auth/audience?project=heroes-gbp`
   → **Publish app** (so the refresh token won't expire).
3. **(Optional) reset the client secret** on the client `Heroes GBP Publisher`
   (`console.cloud.google.com/auth/clients?project=heroes-gbp`) and copy the fresh secret.
4. **Mint the refresh token** at <https://developers.google.com/oauthplayground>:
   gear ⚙️ → "Use your own OAuth credentials" → paste Client ID + secret → in the left box enter
   scope `https://www.googleapis.com/auth/business.manage` → **Authorize APIs** → sign in / **Allow**
   (accept the unverified-app warning) → **Exchange authorization code for tokens** → copy the
   **refresh token**.
5. **Fetch account + location IDs** (Playground can call these once approved, or use curl with an
   access token):
   - `GET https://mybusiness.googleapis.com/v4/accounts` → grab `accounts/{ACCOUNT_ID}`
   - `GET https://mybusiness.googleapis.com/v4/accounts/{ACCOUNT_ID}/locations` → grab `locations/{LOCATION_ID}`
6. **Set the 5 Vercel env vars** (project `heroes`, target **production**), then redeploy master HEAD
   via the Vercel REST API (webhook unreliable — see repo `CLAUDE.md`) and verify live:
   - `GOOGLE_BUSINESS_CLIENT_ID` = `287691366713-p3s9hsm1gban4uh4ne196t123d9bqe9a.apps.googleusercontent.com`
   - `GOOGLE_BUSINESS_CLIENT_SECRET` = _(from step 3/creation)_
   - `GOOGLE_BUSINESS_REFRESH_TOKEN` = _(from step 4)_
   - `GOOGLE_BUSINESS_ACCOUNT_ID` = `accounts/{ACCOUNT_ID}` _(step 5)_
   - `GOOGLE_BUSINESS_LOCATION_ID` = `locations/{LOCATION_ID}` _(step 5)_
7. **Smoke-test the route:** `POST /api/promos/publish-google` with the `PROMOS_SECRET` Bearer header —
   expect a created post (no longer `503`). Confirm it appears on the Google listing
   (Search/Maps → Posts).
8. **Wire the sheet:** set Apps Script Script Property
   `GOOGLE_PUBLISH_URL = https://americanheroesandbrew.com/api/promos/publish-google`, and **paste the
   `Google` channel code from the repo `.gs` into the LIVE bound Apps Script** (it's only in the repo
   copy so far). Add `Google` to a test row's Channel (e.g. `Feed, Story, Google`) and run a real post.

> GBP Local Posts are **image-or-text only** (no video) — video rows post text-only. Posts get a
> `LEARN_MORE` button → the website.

---

## Pointers
- Route: `heroes-brew/src/app/api/promos/publish-google/route.ts`
- Sheet publisher (with `Google` channel): the repo `.gs` (`sheet-auto-publisher.gs`)
- Env var reference + GBP notes: repo `CLAUDE.md` (Environment Variables section)
- Cross-session state: `~/.claude/projects/-Users-kmk/memory/heroes-google-setup.md`
