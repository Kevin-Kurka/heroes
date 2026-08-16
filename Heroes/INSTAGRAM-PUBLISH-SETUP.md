# Instagram Auto-Publish — Setup Handoff

Goal: finish wiring so approved posters in the "Event Posters & Posts" Google Sheet
auto-publish to Instagram on their scheduled dates (the daily `heroes-daily-publish`
task already runs; it's blocked only on the env/token pieces below).

Last updated: 2026-06-08 (by Cowork). Owner: Kevin (kurkafund@gmail.com).

---

## Status — what's already done

- ✅ Publish route is deployed to prod. `GET https://americanheroesandbrew.com/api/promos/publish-instagram` returns **405** (route exists, POST-only).
- ✅ `PROMOS_SECRET` generated and written to local `heroes-brew/.env.local`:
  ```
  PROMOS_SECRET=2e9a3dc6dadebeb2bd846922370e8b32f076f63f6711d471cf31028e5a7cec9a
  ```
- ⛔ Not done: same `PROMOS_SECRET` in Vercel; `INSTAGRAM_ACCESS_TOKEN` with publish scope; `INSTAGRAM_USER_ID`.

---

## The exact route contract (verified from `heroes-brew/src/app/api/promos/publish-instagram/route.ts`)

- **Auth:** header `Authorization: Bearer <PROMOS_SECRET>`. Missing/mismatch → 401.
- **Body:** JSON `{ "imageUrl": "<url>", "caption": "<text>" }`.
  - `imageUrl` MUST start with `https://americanheroesandbrew.com/promos/` or `https://heroes-tau-neon.vercel.app/promos/` (else 400).
  - `caption` must be a non-empty string.
- **Server env it reads:** `PROMOS_SECRET`, `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_USER_ID`. Missing token/userId → 500.
- **Publishing API:** uses `https://graph.instagram.com` (Instagram API with Instagram Login), two-step `/{userId}/media` → `/{userId}/media_publish`. Returns `{ ok: true, mediaId }`.

> Because it uses `graph.instagram.com`, the token must be an **Instagram Login** token
> carrying `instagram_business_content_publish`. A linked Facebook Page is NOT required for
> this API path — but the IG account MUST be a **professional (Business or Creator)** account.

---

## 2026-06-08 update — device-trust blocker (READ FIRST)

Driving the "Command Center" Chrome to do the Meta-console setup failed at the Meta side:
- IG `@americanheroesandbrew` IS already professional (2.1K followers, in a Business portfolio: `business_id=485928749261686`, `asset_id=241948421094296`). Step 1 below is already satisfied.
- `developers.facebook.com` hard-walls with *"You don't have access. This feature isn't available to you yet."* under both the Page identity and the personal profile **Jenee Kurka**.
- Trying to enable 2FA returned: *"You can't make this change at the moment … using a device you don't usually use … We'll allow you to make this change after you've used this device for a while."*

**Root cause:** this Chrome is an **unrecognized device** for the account; Meta gates both 2FA changes and developer-platform access on untrusted devices. **Fix: do Step 0 below on a device the account already trusts** (the phone/computer where you normally use FB/Instagram), then hand the token to Claude Code, which finishes Steps 1–4.

## Step 0 — OWNER ONLY (Kevin/Jenee), on a TRUSTED device

These require logging into Instagram/Meta and clicking consent — Claude Code cannot do them
(and can't do them from this untrusted Chrome at all — see update above).

**A. Create the Meta app**
1. On your usual phone/computer, open https://developers.facebook.com → log in with the FB account that admins the page. If prompted, complete one-time **developer registration** (verify email/phone, accept terms).
2. **My Apps → Create App.** If asked for a use case, pick **Other**; app type **Business**. Name it e.g. `Heroes Brew Publisher`.

**B. Add the Instagram product (Instagram-Login path — matches the deployed route)**
3. App dashboard → **Add product** → **Instagram** → **Set up**.
4. Choose **"API setup with Instagram business login"** (NOT "with Facebook login" — the route uses `graph.instagram.com`).

**C. Authorize the BUSINESS IG account + generate the token**
5. In the **"Generate access tokens"** section → **Add account** → a popup opens Instagram login. **Log in as `@americanheroesandbrew`** (the business account — NOT the personal `kurkajenee`) and authorize. Ensure scopes include **`instagram_business_basic`** + **`instagram_business_content_publish`**.
6. After the account is added, click **Generate token** next to `@americanheroesandbrew` → copy the **long-lived token** (~60 days). No App Review needed to publish to this self-authorized account while the app stays in development.

**D. Hand off**
7. Paste the **long-lived token** to Claude Code. (The IG user ID is optional — Claude Code derives it from the token via `graph.instagram.com/me`.)

---

## Steps 1–4 — CLAUDE CODE (run in the `heroes` repo once Kevin provides the token)

1. **Fill local env** in `heroes-brew/.env.local`:
   ```
   INSTAGRAM_ACCESS_TOKEN=<long-lived publish-scope token>
   INSTAGRAM_USER_ID=<ig user id>
   ```
   If only the token is known, fetch the user id (Instagram Login API):
   ```bash
   curl -s "https://graph.instagram.com/me?fields=id,username,account_type&access_token=$TOKEN"
   ```
   Confirm `account_type` is BUSINESS or CREATOR.

2. **Set the three vars in Vercel (Production)** — these are NOT yet in Vercel:
   ```bash
   cd heroes-brew
   vercel env add PROMOS_SECRET production         # paste the value above
   vercel env add INSTAGRAM_ACCESS_TOKEN production # paste the publish-scope token
   vercel env add INSTAGRAM_USER_ID production      # paste the ig user id
   ```
   (Or set them in the Vercel dashboard → Project → Settings → Environment Variables.)
   Note: an `INSTAGRAM_ACCESS_TOKEN` may already exist in Vercel for the /social page —
   it's read-only and must be REPLACED with the publish-scope token.

3. **Redeploy** so prod picks up the new env (`vercel --prod` or push to main).

4. **Smoke-test** against a poster that exists at `/promos/` (verify the URL returns 200 first):
   ```bash
   SECRET=2e9a3dc6dadebeb2bd846922370e8b32f076f63f6711d471cf31028e5a7cec9a
   curl -i -X POST https://americanheroesandbrew.com/api/promos/publish-instagram \
     -H "Authorization: Bearer $SECRET" \
     -H "Content-Type: application/json" \
     -d '{"imageUrl":"https://americanheroesandbrew.com/promos/event-world-cup-hq.jpg","caption":"TEST — delete me"}'
   ```
   - `200 {"ok":true,"mediaId":"..."}` → working; delete the test post from Instagram.
   - `401` → secret mismatch between header and Vercel env.
   - `502 ... permission` → token still lacks `instagram_business_content_publish` (back to Step 0).
   - `400 imageUrl...` → the poster isn't live at `/promos/` yet.

The token is long-lived (~60 days); the existing cron `/api/cron/instagram-refresh`
(`vercel.json`, 6am on the 1st & 15th) rotates it, so no manual renewal once it's valid.

---

## Reminder about the publishing gate (so expectations are right)

The daily task only posts a row when **Approval = Approve AND Posted (IG) empty AND Post Date = today**.
As of 2026-06-08, these approved rows are **past-dated → they will NEVER auto-post** unless their
dates are moved to the future in the Sheet: NBA Finals (Jun 3), Stanley Cup (Jun 4),
Padres at Home (Jun 5), Friar Frank (Jun 6).
Approved future rows that WILL auto-post once setup is live: World Cup HQ (Jun 11),
USA Opener (Jun 12), Hero Up (Jun 13), Flag Day (Jun 14), Father's Day (Jun 21),
World Cup Knockouts (Jun 27), Padres vs Dodgers (Jun 28).
