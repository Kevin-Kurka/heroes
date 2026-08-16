# NFL Gameday Google Events — auto-seed the whole 2026 season

_Spec written 2026-08-14. Implement in `heroes-brew/src/lib/curated-promos.ts` (+ a small
`/api/og/schedule` tweak). Approved by Boss 2026-08-14 as part of the football-season campaign._

## Goal

Every NFL gameday of the 2026 season shows up on the American Heroes & Brew Google Business
Profile as an **EVENT local post** carrying that day's **full slate**, seeded automatically by
the existing `seedCuratedRows()` daily Apps Script trigger. No hand-written sheet rows.

**Season window:** Wed **Sep 9, 2026** (Kickoff Game, Patriots–Seahawks) → Sun **Jan 10, 2027**
(end of Week 18). 18 Sundays: Sep 13, 20, 27 · Oct 4, 11, 18, 25 · Nov 1, 8, 15, 22, 29 ·
Dec 6, 13, 20, 27 · Jan 3, 10.

## What exists today

- `curatePromos(events)` turns the live 7-day `getAllEvents()` feed into `CuratedPromo[]`.
- `isGoogleEvent(e)` = USA/Mexico World Cup **OR** a Padres/Chargers game **OR** `isMondayNight(e)`.
- Each qualifying game becomes **one** `google-event` promo — `postType: 'google-event'`,
  `channel: 'Google'`, media `/api/og/event?...` (matchup card), `eventStart`/`eventEnd`
  (+2.5h), Notes key `gevt-<id>`.
- `autoApprove` is `true` only for Padres/Chargers games; Monday-Night and WC keep the manual gate.
- `GET /api/promos/curate` returns these rows; `seedCuratedRows()` upserts them into the month
  tab, deduped by the Notes key.
- `/api/og/schedule?league=NFL&date=YYYY-MM-DD` already renders a 1080×1920 poster of that day's
  **full NFL slate** (SoCal teams pinned to the top), titled `NFL SUNDAY`.

## What to build

### 1. A day-level NFL promo (not per-game)

A Sunday has ~14 games. Do **not** emit 14 events. Emit **one event per NFL gameday**, whose
poster is the full slate.

Add to `curated-promos.ts`:

```ts
const NFL_SEASON_START = '2026-09-09';   // PT ymd, inclusive
const NFL_SEASON_END   = '2027-01-10';   // PT ymd, inclusive

interface NflDaySpec {
  /** PT weekday from ptParts().weekday */
  weekday: 'Sun' | 'Mon' | 'Thu' | 'Wed';
  headline: string;
  /** PT wall-clock event window, 24h */
  startH: number;
  endH: number;
  /** Poster heading override passed to /api/og/schedule */
  title: string;
}

const NFL_DAYS: Record<string, NflDaySpec> = {
  Sun: { weekday: 'Sun', headline: 'NFL Sunday at Heroes — Every Game, 16 TVs', startH: 9,  endH: 20, title: 'NFL SUNDAY' },
  Thu: { weekday: 'Thu', headline: 'Thursday Night Football at Heroes',         startH: 17, endH: 21, title: 'THURSDAY NIGHT FOOTBALL' },
  Mon: { weekday: 'Mon', headline: 'Monday Night Football at Heroes',           startH: 17, endH: 21, title: 'MONDAY NIGHT FOOTBALL' },
};
```

Plus two one-off overrides keyed by PT ymd:

```ts
const NFL_SPECIAL_DAYS: Record<string, NflDaySpec> = {
  '2026-09-09': { weekday: 'Wed', headline: 'NFL Kickoff Night at Heroes — Patriots vs Seahawks', startH: 16, endH: 21, title: 'NFL KICKOFF NIGHT' },
  '2026-11-26': { weekday: 'Thu', headline: 'Thanksgiving Football at Heroes — All Three Games',  startH: 9,  endH: 20, title: 'THANKSGIVING FOOTBALL' },
};
```

### 2. Grouping logic

In `curatePromos()`, after the existing per-game loop:

1. Filter `events` to `e.league === 'NFL'`.
2. Group by `ptParts(e.eventTimestamp).ymd`.
3. Drop any ymd outside `[NFL_SEASON_START, NFL_SEASON_END]` (string compare is safe on `YYYY-MM-DD`).
4. For each remaining ymd, resolve the spec: `NFL_SPECIAL_DAYS[ymd] ?? NFL_DAYS[weekday]`.
   No spec (e.g. a Saturday Week-16 game) → skip.
5. Emit one promo:

```ts
{
  postType: 'google-event',
  key: `gnfl-${ymd}`,                       // distinct from the per-game `gevt-` keys
  date: dateLabel,                           // e.g. "Sep 13, 2026"
  time: '9:00 AM',                           // seeded/posted in the morning
  channel: 'Google',
  media: `/api/og/schedule?league=NFL&date=${ymd}&title=${encodeURIComponent(spec.title)}`,
  headline: spec.headline,
  caption: `${games.length} games, 16 TVs, full bar. ${slateLine} Every NFL game, every week at American Heroes & Brew — 300 Carlsbad Village Dr, Carlsbad. Grab a table at americanheroesandbrew.com`,
  storyCaption: '',
  tags: TAGS,
  eventStart: ptIso(ymd, spec.startH),       // e.g. 2026-09-13T09:00:00-07:00
  eventEnd:   ptIso(ymd, spec.endH),
  league: 'NFL',
  autoApprove: true,                         // ← see "Approval" below
}
```

`slateLine` = the first 3 matchups, e.g. `"Chargers vs Raiders · Cowboys vs Eagles · Bills vs Chiefs and more."`
Keep the whole caption under ~1,450 chars (GBP local-post summary cap is 1,500).

**`ptIso(ymd, hour)`** must emit the correct offset — `-07:00` (PDT) through Sat Oct 31, 2026,
`-08:00` (PST) from Sun Nov 1, 2026. Don't hardcode `-07:00`; derive it, or the November–January
events land an hour off. Unit-test the DST boundary (Nov 1 is itself an NFL Sunday).

### 3. Don't double-post on Chargers days

A Chargers game already emits its own `gevt-` matchup event. That's intentional and worth keeping —
it names the matchup, which the day-slate poster doesn't headline. On those days GBP gets two posts
(day slate at 9:00 AM, Chargers matchup at 10:00 AM). If that reads as too much in practice, the
one-line fix is to skip the `gevt-` promo when a `gnfl-` promo exists for the same ymd.

### 4. `/api/og/schedule` — accept a `title` override

`src/app/api/og/schedule/route.tsx` currently derives its heading from `TITLE_OF[code]`. Add:

```ts
const heading = searchParams.get('title') ?? TITLE_OF[code] ?? 'TODAY';
```

Everything else (league filter, SoCal pinning, PT formatting) already works for `league=NFL`.

⚠️ The route is `force-dynamic` and fetches live data at render time. That's correct here — the
poster is fetched by GBP when the post is created on the morning of the gameday, so the slate is
current. It does mean a poster URL rendered on a non-gameday returns an empty slate; don't
pre-fetch these for preview.

### 5. Approval

`autoApprove: true` on all NFL gameday events. ~53 events across the season — routing each one
through the manual Approval gate would bury Jenee. Boss approved the rule 2026-08-14; Jenee
approves the *rule* once rather than 53 rows. This also means flipping the existing
`isMondayNight` promos from `autoApprove: false` to `true` (they're now covered by the `Mon` day
spec — remove `isMondayNight` from `isGoogleEvent` so Monday games don't emit both a per-game and
a day event).

### 6. Month tabs

`seedCuratedRows()` writes into the tab named for the row's month. Tabs **October 2026**,
**November 2026**, **December 2026**, **January 2027** don't exist yet. Either:

- have the seeder create a missing month tab by duplicating the previous month and clearing
  `A2:M<last>` (duplicate, don't `insertSheet` — a fresh sheet loses the Channel/Approval
  dropdowns), or
- create the four tabs by hand before Oct 1.

The first is worth the ~20 lines; it removes a recurring manual step forever.

## Tests

Extend `src/lib/curated-promos.test.ts`:

- a Sunday with 13 NFL games → exactly **one** `gnfl-` promo, `eventStart` 09:00 PT, `autoApprove` true
- a Sunday game outside the season window (e.g. preseason Aug 23) → **no** `gnfl-` promo
- Nov 1, 2026 (DST change + NFL Sunday) → `eventStart` carries `-08:00`
- Sep 9, 2026 → the Kickoff Night headline, not a generic Wednesday (and no spec for other Wednesdays)
- Nov 26, 2026 → Thanksgiving headline with the 09:00–20:00 window, not the TNF window
- a Monday with two games → one promo, not two

## Ship

Per repo `CLAUDE.md`: `git push` does **not** reliably deploy. Trigger a production build of
`master` HEAD via the Vercel REST API, poll `readyState:"READY"`, then verify
`https://americanheroesandbrew.com/api/promos/curate` returns the `gnfl-` rows before calling it
done. Then confirm the first seeded row lands in the September tab.
