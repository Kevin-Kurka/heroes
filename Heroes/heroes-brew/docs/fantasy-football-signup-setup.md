# Fantasy Football Signup — how it works (LIVE)

The `/fantasy-football` hub is sheet-driven and capturing signups. Flow:
**register → add to Sheet → validate → send share link → confirm.**

## Google Sheet (id 1Nfc4gGjZRWYKSKJqACvBH15uRQBYGcdz-hzxRIAqjyI)
- **`Leagues`** (source of truth for official leagues): `League Name | Draft Date | Time | Share Link`
  (6 leagues, "American Heroes & Brew 01–06", each cap 10; Share Link = the Yahoo invite URL).
- **`Heroes League Joins`** (auto): `Submitted | Name | Email | League | DraftLabel`
- **`Registered Leagues`** (auto): `Submitted | Commissioner | League | Email | Phone | DraftDate`

## Apps Script Web App (deployed, "Anyone", execute-as-owner)
URL set in Vercel as BOTH `FANTASY_SIGNUP_URL` (POST) and `FANTASY_COUNTS_URL` (GET).
- **doGet** → reads `Leagues` + join counts → returns `[{name, dateLabel, time, capacity, count, spotsLeft, full}]`. **No share links** (they stay private).
- **doPost type:join** → validates (league exists, league < 10, email in < 3 leagues, not already in this league) → appends to `Heroes League Joins` → **emails the registrant their league's Share Link** + emails owner → returns `{ok, joined:[{name,dateLabel,time,link}], skipped}`. The join-success UI shows the link.
- **doPost type:register** → appends to `Registered Leagues` → emails owner.
- Caps: **10 players/league · 3 leagues/person · no duplicate joins.**

To edit the script: Sheet → Extensions → Apps Script → edit → Deploy → Manage deployments → edit → New version (keeps the same URL).

## App
- Leagues + availability: `src/lib/fantasy-leagues.ts` (fetches doGet; falls back to bundled `OFFICIAL_LEAGUES` in `src/lib/fantasy.ts` if the endpoint is down).
- Forms: `src/components/JoinLeagueForm.tsx` (name, email, pick up to 3 dates; reveals share link on success) + `RegisterLeagueForm.tsx`.
- Route: `src/app/api/fantasy/signup/route.ts` (forwards to Apps Script; graceful fallback if env unset).

## Notes
- No payment/buy-in (free; Heroes funds the $100 prize). Prize claimed in person on championship day.
- Yahoo = link-out only; the per-league Yahoo invite is the Share Link in the Leagues tab.
