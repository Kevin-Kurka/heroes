# Auto-curated Sports Events → Google + Schedule Stories — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Auto-curate key games (WC USA/Mexico, MLB Padres, NFL Chargers + Monday Night) into Google Business Profile **Event** posts, and daily schedule **Stories** (WC days, NFL Sundays), all seeded into the existing promos sheet with no weekly manual upkeep.

**Architecture:** A new curation layer sits on top of the existing sheet-driven pipeline. Pure TypeScript rules in `src/lib/curated-promos.ts` (unit-tested with fixtures) are exposed via a guarded `/api/promos/curate` route. A new Apps Script daily trigger calls it and upserts deduped rows. `publish-google` gains an `EVENT` topicType; a new `/api/og/schedule` route renders schedule posters on demand. Live Google output remains gated on the pending GBP API approval.

**Tech Stack:** Next.js 16 (App Router) route handlers, TypeScript (strict), `next/og` `ImageResponse`, Vitest, Google Apps Script (`.gs`).

**Spec:** `docs/superpowers/specs/2026-06-28-google-event-curation-design.md`

All paths are relative to `heroes-brew/` unless noted. Run all commands from `heroes-brew/`.

---

## File Structure

- Create: `vitest.config.ts` — test runner config.
- Modify: `src/lib/events.ts` — export `isMondayNight`; no logic change.
- Create: `src/lib/curated-promos.ts` — curation types, pure `curatePromos()`, builders, `getCuratedPromos()` fetch wrapper.
- Create: `src/lib/curated-promos.test.ts` — unit tests (fixtures).
- Modify: `src/app/api/promos/publish-google/route.ts` — add `EVENT` topicType + `gbpDateTime` helper.
- Create: `src/app/api/promos/publish-google/gbp-datetime.test.ts` — unit test for the date helper.
- Create: `src/app/api/promos/curate/route.ts` — guarded curate endpoint.
- Create: `src/app/api/og/schedule/route.tsx` — 1080×1920 schedule poster.
- Modify: `heroes-brew/scripts/sheet-auto-publisher.gs` — `seedCuratedRows()`, `Event Start`/`Event End` columns, Google EVENT dispatch, daily trigger.
- Modify: `CLAUDE.md` (Heroes) — document the curate route + EVENT posts (one paragraph).

---

## Task 1: Add Vitest test infrastructure

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (scripts + devDependencies)

- [ ] **Step 1: Install vitest**

Run: `npm i -D vitest`
Expected: adds `vitest` to devDependencies, no errors.

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
});
```

- [ ] **Step 3: Add the test script to `package.json`**

In the `"scripts"` block add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Add a smoke test to confirm the runner works**

Create `src/lib/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('vitest', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run it**

Run: `npm test`
Expected: PASS, 1 test passed.

- [ ] **Step 6: Delete the smoke test and commit**

```bash
rm src/lib/smoke.test.ts
git add heroes-brew/package.json heroes-brew/package-lock.json heroes-brew/vitest.config.ts
git commit -m "test(promos): add vitest test runner"
```

---

## Task 2: Export `isMondayNight` from events.ts

**Files:**
- Modify: `src/lib/events.ts` (the `function isMondayNight` declaration, ~line 76)

- [ ] **Step 1: Add the `export` keyword**

Change:

```ts
/** True when the event kicks off on a Monday evening (PT) — i.e. Monday Night Football. */
function isMondayNight(e: UnifiedEvent): boolean {
```

to:

```ts
/** True when the event kicks off on a Monday evening (PT) — i.e. Monday Night Football. */
export function isMondayNight(e: UnifiedEvent): boolean {
```

- [ ] **Step 2: Verify the build still type-checks**

Run: `npm run lint`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add heroes-brew/src/lib/events.ts
git commit -m "refactor(events): export isMondayNight for curation reuse"
```

---

## Task 3: Curation types + pure `curatePromos()` (TDD)

**Files:**
- Create: `src/lib/curated-promos.ts`
- Test: `src/lib/curated-promos.test.ts`

The pure function takes an already-fetched `UnifiedEvent[]` so it is unit-testable without live APIs. `getCuratedPromos()` (Task 4) wraps it with the fetch.

- [ ] **Step 1: Write the failing test**

Create `src/lib/curated-promos.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { curatePromos } from './curated-promos';
import type { UnifiedEvent } from '@/types';

function ev(p: Partial<UnifiedEvent>): UnifiedEvent {
  return {
    id: p.id ?? 'x',
    eventTimestamp: p.eventTimestamp ?? '2026-06-29T19:00:00-07:00',
    eventTitle: p.eventTitle ?? 'Game',
    eventType: 'SPORTS',
    displayMessage: '',
    ...p,
  };
}

describe('curatePromos — Google Events', () => {
  it('flags a Padres game as a google-event', () => {
    const out = curatePromos([ev({ id: 'mlb-1', league: 'MLB', homeTeam: 'San Diego Padres', awayTeam: 'Los Angeles Dodgers' })]);
    const e = out.find((p) => p.key.includes('mlb-1'));
    expect(e?.postType).toBe('google-event');
    expect(e?.channel).toBe('Google');
    expect(e?.eventStart).toBeTruthy();
    expect(e?.eventEnd).toBeTruthy();
  });

  it('flags a USA World Cup game as a google-event', () => {
    const out = curatePromos([ev({ id: 'wc-1', league: 'WORLDCUP', homeTeam: 'United States', awayTeam: 'Wales' })]);
    expect(out.find((p) => p.key.includes('wc-1'))?.postType).toBe('google-event');
  });

  it('flags a Mexico World Cup game as a google-event', () => {
    const out = curatePromos([ev({ id: 'wc-2', league: 'WORLDCUP', homeTeam: 'Mexico', awayTeam: 'Poland' })]);
    expect(out.find((p) => p.key.includes('wc-2'))?.postType).toBe('google-event');
  });

  it('flags a Chargers game as a google-event', () => {
    const out = curatePromos([ev({ id: 'nfl-1', league: 'NFL', homeTeam: 'Los Angeles Chargers', awayTeam: 'Denver Broncos' })]);
    expect(out.find((p) => p.key.includes('nfl-1'))?.postType).toBe('google-event');
  });

  it('flags a Monday Night NFL game as a google-event even without a followed team', () => {
    // 2026-06-29 is a Monday; 19:00 PT is evening.
    const out = curatePromos([ev({ id: 'nfl-2', league: 'NFL', homeTeam: 'Buffalo Bills', awayTeam: 'New York Jets', eventTimestamp: '2026-06-29T19:00:00-07:00' })]);
    expect(out.find((p) => p.key.includes('nfl-2'))?.postType).toBe('google-event');
  });

  it('does NOT flag a non-followed MLB game', () => {
    const out = curatePromos([ev({ id: 'mlb-9', league: 'MLB', homeTeam: 'New York Yankees', awayTeam: 'Boston Red Sox' })]);
    expect(out.find((p) => p.key.includes('mlb-9') && p.postType === 'google-event')).toBeUndefined();
  });

  it('does NOT flag a non-USA/Mexico World Cup game as a google-event', () => {
    const out = curatePromos([ev({ id: 'wc-9', league: 'WORLDCUP', homeTeam: 'Brazil', awayTeam: 'Serbia' })]);
    expect(out.find((p) => p.key.includes('wc-9') && p.postType === 'google-event')).toBeUndefined();
  });
});

describe('curatePromos — Schedule Stories', () => {
  it('emits one WC schedule story per game-day', () => {
    const out = curatePromos([
      ev({ id: 'wc-a', league: 'WORLDCUP', homeTeam: 'Brazil', awayTeam: 'Serbia', eventTimestamp: '2026-06-29T11:00:00-07:00' }),
      ev({ id: 'wc-b', league: 'WORLDCUP', homeTeam: 'France', awayTeam: 'Denmark', eventTimestamp: '2026-06-29T14:00:00-07:00' }),
    ]);
    const stories = out.filter((p) => p.postType === 'schedule-story' && p.league === 'WORLDCUP');
    expect(stories).toHaveLength(1);
    expect(stories[0].media).toContain('/api/og/schedule');
    expect(stories[0].media).toContain('league=WC');
    expect(stories[0].media).toContain('date=2026-06-29');
    expect(stories[0].channel).toBe('Story');
  });

  it('emits an NFL schedule story only on a Sunday with NFL games', () => {
    // 2026-06-28 is a Sunday.
    const out = curatePromos([
      ev({ id: 'nfl-s', league: 'NFL', homeTeam: 'Dallas Cowboys', awayTeam: 'Green Bay Packers', eventTimestamp: '2026-06-28T13:00:00-07:00' }),
    ]);
    const stories = out.filter((p) => p.postType === 'schedule-story' && p.league === 'NFL');
    expect(stories).toHaveLength(1);
    expect(stories[0].media).toContain('league=NFL');
  });

  it('does NOT emit an NFL schedule story for a non-Sunday NFL game', () => {
    // 2026-06-29 is a Monday.
    const out = curatePromos([
      ev({ id: 'nfl-m', league: 'NFL', homeTeam: 'Dallas Cowboys', awayTeam: 'Green Bay Packers', eventTimestamp: '2026-06-29T19:00:00-07:00' }),
    ]);
    expect(out.filter((p) => p.postType === 'schedule-story' && p.league === 'NFL')).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/curated-promos.test.ts`
Expected: FAIL — `Cannot find module './curated-promos'`.

- [ ] **Step 3: Implement `src/lib/curated-promos.ts`**

```ts
import type { UnifiedEvent } from '@/types';
import { getAllEvents, isMondayNight } from './events';

export type PromoPostType = 'google-event' | 'schedule-story';

export interface CuratedPromo {
  /** Post classification. */
  postType: PromoPostType;
  /** Stable dedup key written into the sheet's Notes cell. */
  key: string;
  /** Sheet "Post Date" (e.g. "Jun 29, 2026"). */
  date: string;
  /** Sheet "Post Time" (e.g. "10:00 AM"). */
  time: string;
  channel: 'Google' | 'Story';
  /** Poster URL path (relative to the site origin). */
  media: string;
  headline: string;
  caption: string;
  storyCaption: string;
  tags: string;
  /** ISO start (PT offset) — google-event only. */
  eventStart?: string;
  /** ISO end (PT offset) — google-event only. */
  eventEnd?: string;
  /** SportLeague string of the source event(s). */
  league: string;
}

const TAGS = '#AmericanHeroesAndBrew #CarlsbadVillage #SportsBar';
const EVENT_POST_TIME = '10:00 AM';
const STORY_POST_TIME = '9:00 AM';
const EVENT_DURATION_MS = 2.5 * 60 * 60 * 1000;

/** Teams whose every game becomes a Google Event (league-scoped below). */
const GOOGLE_EVENT_TEAMS = new Set(['San Diego Padres', 'Los Angeles Chargers']);

function isUsaOrMexicoWC(e: UnifiedEvent): boolean {
  if (e.league !== 'WORLDCUP') return false;
  const names = `${e.homeTeam ?? ''}|${e.awayTeam ?? ''}`.toLowerCase();
  return /\b(usa|united states|mexico)\b/.test(names);
}

function isGoogleEventTeamGame(e: UnifiedEvent): boolean {
  return (!!e.homeTeam && GOOGLE_EVENT_TEAMS.has(e.homeTeam)) ||
    (!!e.awayTeam && GOOGLE_EVENT_TEAMS.has(e.awayTeam));
}

function isGoogleEvent(e: UnifiedEvent): boolean {
  return isUsaOrMexicoWC(e) || isGoogleEventTeamGame(e) || isMondayNight(e);
}

/** PT calendar parts of an ISO timestamp. */
function ptParts(iso: string): { ymd: string; weekday: string; dateLabel: string; timeLabel: string } {
  const d = new Date(iso);
  const f = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', ...opts }).format(d);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return {
    ymd: `${get('year')}-${get('month')}-${get('day')}`,
    weekday: f({ weekday: 'short' }),
    dateLabel: f({ month: 'short', day: 'numeric', year: 'numeric' }),
    timeLabel: f({ hour: 'numeric', minute: '2-digit', hour12: true }),
  };
}

function matchup(e: UnifiedEvent): string {
  return e.awayTeam && e.homeTeam ? `${e.awayTeam} vs ${e.homeTeam}` : e.eventTitle;
}

function eventPoster(e: UnifiedEvent, when: string): string {
  const q = new URLSearchParams();
  if (e.awayTeam) q.set('away', e.awayTeam);
  if (e.homeTeam) q.set('home', e.homeTeam);
  if (e.awayLogo) q.set('aw', e.awayLogo);
  if (e.homeLogo) q.set('hm', e.homeLogo);
  if (e.league) q.set('league', e.league);
  q.set('title', matchup(e));
  q.set('when', when);
  q.set('ratio', '9x16');
  q.set('social', '1');
  return `/api/og/event?${q.toString()}`;
}

function googleEventPromo(e: UnifiedEvent): CuratedPromo {
  const start = ptParts(e.eventTimestamp);
  const end = new Date(new Date(e.eventTimestamp).getTime() + EVENT_DURATION_MS).toISOString();
  const m = matchup(e);
  const headline = `${m} — Watch at Heroes`;
  const caption = `Catch ${m} at American Heroes & Brew — 16 TVs, full bar, Carlsbad Village. Kickoff ${start.timeLabel}.`;
  return {
    postType: 'google-event',
    key: `gevt-${e.id}`,
    date: start.dateLabel,
    time: EVENT_POST_TIME,
    channel: 'Google',
    media: eventPoster(e, `${start.weekday} ${start.timeLabel}`),
    headline,
    caption,
    storyCaption: caption,
    tags: TAGS,
    eventStart: e.eventTimestamp,
    eventEnd: end,
    league: e.league ?? '',
  };
}

function scheduleStoryPromo(league: 'WORLDCUP' | 'NFL', ymd: string, dateLabel: string): CuratedPromo {
  const code = league === 'WORLDCUP' ? 'WC' : 'NFL';
  const label = league === 'WORLDCUP' ? "Today's World Cup slate" : "Today's NFL slate";
  return {
    postType: 'schedule-story',
    key: `sched-${code}-${ymd}`,
    date: dateLabel,
    time: STORY_POST_TIME,
    channel: 'Story',
    media: `/api/og/schedule?league=${code}&date=${ymd}`,
    headline: '',
    caption: `${label} — every game on at American Heroes & Brew. 🍻`,
    storyCaption: `${label} on every screen 🍻 Carlsbad Village.`,
    tags: TAGS,
    league,
  };
}

/**
 * Pure curation: turn a fetched event list into curated promo rows. Separated from
 * the fetch so it can be unit-tested with fixtures (the 7-day window is already
 * applied by getAllEvents before this runs).
 */
export function curatePromos(events: UnifiedEvent[]): CuratedPromo[] {
  const out: CuratedPromo[] = [];

  // Google Events: one per qualifying game.
  for (const e of events) {
    if (e.eventType === 'SPORTS' && isGoogleEvent(e)) out.push(googleEventPromo(e));
  }

  // Schedule Stories: one per WC game-day, one per Sunday with NFL games.
  const wcDays = new Map<string, string>(); // ymd -> dateLabel
  const nflSundays = new Map<string, string>();
  for (const e of events) {
    if (e.eventType !== 'SPORTS') continue;
    const p = ptParts(e.eventTimestamp);
    if (e.league === 'WORLDCUP') wcDays.set(p.ymd, p.dateLabel);
    if (e.league === 'NFL' && p.weekday === 'Sun') nflSundays.set(p.ymd, p.dateLabel);
  }
  for (const [ymd, label] of wcDays) out.push(scheduleStoryPromo('WORLDCUP', ymd, label));
  for (const [ymd, label] of nflSundays) out.push(scheduleStoryPromo('NFL', ymd, label));

  return out;
}

/** Fetch the live 7-day schedule and curate it. */
export async function getCuratedPromos(): Promise<CuratedPromo[]> {
  const events = await getAllEvents();
  return curatePromos(events);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/lib/curated-promos.test.ts`
Expected: PASS — all tests green.

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: no new errors.

- [ ] **Step 6: Commit**

```bash
git add heroes-brew/src/lib/curated-promos.ts heroes-brew/src/lib/curated-promos.test.ts
git commit -m "feat(promos): curation rules for Google Events + schedule Stories"
```

---

## Task 4: `publish-google` EVENT topicType (TDD on the date helper)

**Files:**
- Modify: `src/app/api/promos/publish-google/route.ts`
- Test: `src/app/api/promos/publish-google/gbp-datetime.test.ts`

GBP's `event.schedule` needs split date/time objects in the **business's local (PT)** wall-clock. We extract a pure helper and test it; the route wiring is verified by build + manual curl.

- [ ] **Step 1: Write the failing test**

Create `src/app/api/promos/publish-google/gbp-datetime.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { gbpDateTime } from './route';

describe('gbpDateTime', () => {
  it('splits an ISO timestamp into PT date + time objects', () => {
    const r = gbpDateTime('2026-06-29T19:10:00-07:00');
    expect(r.date).toEqual({ year: 2026, month: 6, day: 29 });
    expect(r.time).toEqual({ hours: 19, minutes: 10, seconds: 0 });
  });

  it('converts a UTC timestamp into PT wall-clock', () => {
    // 2026-06-30T02:00:00Z == 2026-06-29 19:00 PT
    const r = gbpDateTime('2026-06-30T02:00:00Z');
    expect(r.date).toEqual({ year: 2026, month: 6, day: 29 });
    expect(r.time.hours).toBe(19);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/app/api/promos/publish-google/gbp-datetime.test.ts`
Expected: FAIL — `gbpDateTime` is not exported / not defined.

- [ ] **Step 3: Add the helper + EVENT support to `route.ts`**

Add this exported helper near the top of `src/app/api/promos/publish-google/route.ts` (after the constants, before `POST`):

```ts
/**
 * Split an ISO timestamp into the GBP `event.schedule` date + time objects, using
 * the business's local timezone (America/Los_Angeles) wall-clock. Exported for unit tests.
 */
export function gbpDateTime(iso: string): {
  date: { year: number; month: number; day: number };
  time: { hours: number; minutes: number; seconds: number };
} {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', hour12: false,
  }).formatToParts(new Date(iso));
  const g = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return {
    date: { year: g('year'), month: g('month'), day: g('day') },
    time: { hours: g('hour') % 24, minutes: g('minute'), seconds: 0 },
  };
}
```

Extend the `PublishBody` interface with the event fields:

```ts
interface PublishBody {
  caption?: unknown;
  imageUrl?: unknown;
  ctaType?: unknown;
  ctaUrl?: unknown;
  eventTitle?: unknown; // present → an EVENT post
  eventStart?: unknown; // ISO; required when eventTitle present
  eventEnd?: unknown;   // ISO; required when eventTitle present
}
```

After the existing `ctaType`/`hasCta` parsing (just before "1) Refresh token"), add event-field validation:

```ts
  // ── Optional EVENT fields (all-or-nothing) ─────────────────────────────────
  const { eventTitle, eventStart, eventEnd } = body;
  const anyEvent = eventTitle != null || eventStart != null || eventEnd != null;
  const isEvent =
    typeof eventTitle === 'string' && eventTitle.trim().length > 0 &&
    typeof eventStart === 'string' && !Number.isNaN(Date.parse(eventStart)) &&
    typeof eventEnd === 'string' && !Number.isNaN(Date.parse(eventEnd));
  if (anyEvent && !isEvent) {
    return NextResponse.json(
      { error: 'EVENT posts require eventTitle, eventStart (ISO), and eventEnd (ISO)' },
      { status: 400 }
    );
  }
```

In the post-body builder, replace:

```ts
  const post: Record<string, unknown> = {
    languageCode: 'en-US',
    summary: caption,
    topicType: 'STANDARD',
  };
```

with:

```ts
  const post: Record<string, unknown> = {
    languageCode: 'en-US',
    summary: caption,
    topicType: isEvent ? 'EVENT' : 'STANDARD',
  };
  if (isEvent) {
    post.event = {
      title: (eventTitle as string).trim(),
      schedule: {
        startDate: gbpDateTime(eventStart as string).date,
        startTime: gbpDateTime(eventStart as string).time,
        endDate: gbpDateTime(eventEnd as string).date,
        endTime: gbpDateTime(eventEnd as string).time,
      },
    };
  }
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/app/api/promos/publish-google/gbp-datetime.test.ts`
Expected: PASS.

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: no new errors.

- [ ] **Step 6: Commit**

```bash
git add heroes-brew/src/app/api/promos/publish-google/route.ts heroes-brew/src/app/api/promos/publish-google/gbp-datetime.test.ts
git commit -m "feat(promos): publish-google supports EVENT topicType"
```

---

## Task 5: `/api/promos/curate` route

**Files:**
- Create: `src/app/api/promos/curate/route.ts`

- [ ] **Step 1: Implement the route**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getCuratedPromos } from '@/lib/curated-promos';

// Curation reads the live 7-day schedule on each call — never cache.
export const dynamic = 'force-dynamic';

/**
 * GET /api/promos/curate
 *
 * Returns the curated promo rows (Google Events + schedule Stories) for the rolling
 * 7-day window, ready for the Apps Script seeder to upsert into the promos sheet.
 * Guarded by PROMOS_SECRET (Bearer header), same as the other promo routes.
 * Best-effort: on any failure it returns an empty list with 200 so the seeder simply
 * seeds nothing and retries next day (never throws into the sheet workflow).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.PROMOS_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const rows = await getCuratedPromos();
    return NextResponse.json({ ok: true, count: rows.length, rows });
  } catch (e) {
    console.error('curate error:', e);
    return NextResponse.json({ ok: false, count: 0, rows: [], error: String(e) });
  }
}
```

- [ ] **Step 2: Verify it builds and is wired**

Run: `npm run build`
Expected: build succeeds and the route `/api/promos/curate` appears in the route list.

- [ ] **Step 3: Manually verify auth + shape (dev server)**

Run (in one shell): `npm run dev`
Then: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/promos/curate`
Expected: `401` (no Bearer header). With a valid `PROMOS_SECRET` from `.env.local`:
`curl -s -H "Authorization: Bearer $PROMOS_SECRET" http://localhost:3000/api/promos/curate | head -c 400`
Expected: JSON `{"ok":true,"count":N,"rows":[...]}` (rows reflect whatever's in the live 7-day window).

- [ ] **Step 4: Commit**

```bash
git add heroes-brew/src/app/api/promos/curate/route.ts
git commit -m "feat(promos): add guarded /api/promos/curate route"
```

---

## Task 6: `/api/og/schedule` daily-slate poster

**Files:**
- Create: `src/app/api/og/schedule/route.tsx`

Renders a 1080×1920 Story poster listing the day's games for one league, fetched server-side from the same events feed. Mirrors the styling approach of `src/app/api/og/event/route.tsx`.

- [ ] **Step 1: Implement the route**

```tsx
/* eslint-disable @next/next/no-img-element -- next/og (Satori) renders to a PNG and supports only <img>. */
import { ImageResponse } from 'next/og';
import { getAllEvents } from '@/lib/events';
import type { UnifiedEvent } from '@/types';

export const contentType = 'image/png';
export const dynamic = 'force-dynamic';

const SIZE = { width: 1080, height: 1920 };
const ADDRESS = '300 Carlsbad Village Dr #120, Carlsbad';
// American-flag theme to match the rest of the promo art.
const NAVY = '#0a1a3f';
const RED = '#b22234';

const LEAGUE_OF: Record<string, string> = { WC: 'WORLDCUP', NFL: 'NFL' };
const TITLE_OF: Record<string, string> = { WC: 'WORLD CUP — TODAY', NFL: 'NFL SUNDAY' };

function ptYmd(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function ptTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(iso));
}

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = (searchParams.get('league') ?? 'WC').toUpperCase();
  const date = searchParams.get('date') ?? '';
  const league = LEAGUE_OF[code] ?? 'WORLDCUP';
  const heading = TITLE_OF[code] ?? 'TODAY';
  const badge = `${origin}/badge-clean.png`;

  const all = await getAllEvents();
  const games: UnifiedEvent[] = all
    .filter((e) => e.league === league && (!date || ptYmd(e.eventTimestamp) === date))
    .sort((a, b) => new Date(a.eventTimestamp).getTime() - new Date(b.eventTimestamp).getTime())
    .slice(0, 10);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
          background: `linear-gradient(160deg, ${NAVY} 0%, #050a1a 100%)`,
          color: '#fafafa', fontFamily: 'sans-serif', padding: '90px 70px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
          <img src={badge} width={96} height={96} alt="" />
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 800, letterSpacing: 4, color: '#ffffff' }}>
            AMERICAN HEROES &amp; BREW
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 900, color: RED, marginBottom: 40 }}>{heading}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26, flex: 1 }}>
          {games.length === 0 ? (
            <div style={{ display: 'flex', fontSize: 44, color: '#cbd5e1' }}>Every game. Every screen.</div>
          ) : (
            games.map((g) => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid rgba(255,255,255,0.15)', paddingBottom: 18 }}>
                <div style={{ display: 'flex', fontSize: 46, fontWeight: 700, maxWidth: 720 }}>
                  {g.awayTeam && g.homeTeam ? `${g.awayTeam} vs ${g.homeTeam}` : g.eventTitle}
                </div>
                <div style={{ display: 'flex', fontSize: 42, fontWeight: 800, color: '#ffd54a' }}>{ptTime(g.eventTimestamp)}</div>
              </div>
            ))
          )}
        </div>
        <div style={{ display: 'flex', fontSize: 34, color: '#cbd5e1', marginTop: 30 }}>
          Watch with us · {ADDRESS}
        </div>
      </div>
    ),
    SIZE,
  );
}
```

`ImageResponse` takes `(element, options)`; `SIZE` (`{ width, height }`) is a valid options object, matching how `/api/og/event` passes its `size`.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: build succeeds; `/api/og/schedule` appears in the route list.

- [ ] **Step 3: Manually eyeball the poster**

With `npm run dev` running, open in a browser:
`http://localhost:3000/api/og/schedule?league=WC&date=2026-06-29`
Expected: a 1080×1920 red/white/navy poster listing that day's WC games (or "Every game. Every screen." if none in the live window).

- [ ] **Step 4: Commit**

```bash
git add heroes-brew/src/app/api/og/schedule/route.tsx
git commit -m "feat(promos): dynamic /api/og/schedule daily-slate poster"
```

---

## Task 7: Apps Script — seed curated rows + EVENT dispatch

**Files:**
- Modify: `heroes-brew/scripts/sheet-auto-publisher.gs`

> This file is the source-of-truth copy; the LIVE Apps Script must be updated by pasting the repo file into the bound editor (per project memory on publisher drift). The final task covers that deploy step.

- [ ] **Step 1: Extend `cols_` to find the event columns**

In `cols_`, add two entries to the returned object (after `notes`):

```js
    notes: find(function (h) { return h.indexOf('note') === 0; }),
    eventStart: find(function (h) { return h.indexOf('event start') === 0; }),
    eventEnd: find(function (h) { return h.indexOf('event end') === 0; })
```

- [ ] **Step 2: Capture event fields + raw headline in `rows_`**

In `rows_`, where each row object is built (the object with `channels`, `storyCaption`, etc.), add:

```js
        headline: get(c.headline),
        eventStart: c.eventStart >= 0 ? String(r[c.eventStart] || '').trim() : '',
        eventEnd: c.eventEnd >= 0 ? String(r[c.eventEnd] || '').trim() : '',
        noteKey: c.notes >= 0 ? String(r[c.notes] || '').trim() : '',
```

(Keep the existing fields; just add these.)

- [ ] **Step 3: Add EVENT fields to the Google payload**

Replace `googlePayloadFor_` with:

```js
function googlePayloadFor_(row, site) {
  var p = { caption: row.igCaption, ctaType: 'LEARN_MORE', ctaUrl: site };
  if (!row.isVideo) p.imageUrl = mediaUrl_(row, site);
  if (row.eventStart && row.eventEnd) {
    p.eventTitle = row.headline || 'Game Day at American Heroes & Brew';
    p.eventStart = row.eventStart;
    p.eventEnd = row.eventEnd;
  }
  return p;
}
```

- [ ] **Step 4: Add the idempotent `Event Start` / `Event End` columns helper**

Add near `addStoryCaptionColumn`:

```js
// One-time/idempotent: add `Event Start` and `Event End` columns (after Notes) to every
// month tab that lacks them. Used by Google EVENT posts.
function addEventColumns() {
  monthSheets_().forEach(function (sh) {
    var header = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0]
      .map(function (h) { return String(h).trim().toLowerCase(); });
    ['Event Start', 'Event End'].forEach(function (name) {
      if (header.indexOf(name.toLowerCase()) >= 0) return;
      var after = sh.getLastColumn();
      sh.insertColumnAfter(after);
      sh.getRange(1, after + 1).setValue(name);
      header.push(name.toLowerCase());
    });
  });
}
```

- [ ] **Step 5: Add `seedCuratedRows()` + dedup**

Add these functions (mirroring `seedSpecialOn_` idempotency):

```js
var CURATE_FN = 'seedCuratedRows';

// True if a row already covers this curated item: same key in Notes, OR (for schedule
// stories) an existing row on the same date whose media looks like a schedule poster
// (covers the pre-existing manually-seeded WC story rows).
function curatedExists_(values, c, item, tz) {
  var itemDate = item.date; // already "MMM d, yyyy"
  for (var i = 1; i < values.length; i++) {
    var note = c.notes >= 0 ? String(values[i][c.notes] || '').trim() : '';
    if (note === item.key) return true;
    if (item.postType === 'schedule-story') {
      var media = c.media >= 0 ? String(values[i][c.media] || '').trim().toLowerCase() : '';
      var w = parseWhen_(c.date >= 0 ? values[i][c.date] : '', c.time >= 0 ? values[i][c.time] : '');
      var sameDay = w && Utilities.formatDate(w, tz, 'MMM d, yyyy') === itemDate;
      if (sameDay && (media.indexOf('schedule') >= 0)) return true;
    }
  }
  return false;
}

function seedCuratedRows() {
  var props = props_();
  var site = props.getProperty('SITE') || 'https://americanheroesandbrew.com';
  var secret = props.getProperty('PROMOS_SECRET');
  if (!secret) return;
  var res = UrlFetchApp.fetch(site + '/api/promos/curate', {
    method: 'get',
    headers: { Authorization: 'Bearer ' + secret },
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200) return;
  var data = JSON.parse(res.getContentText() || '{}');
  var rows = (data && data.rows) || [];
  if (!rows.length) return;

  var sh = currentMonthSheet_();
  var tz = Session.getScriptTimeZone();
  var header = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var c = cols_(header);
  if (c.media < 0 || c.date < 0) return;
  var values = sh.getDataRange().getDisplayValues();

  rows.forEach(function (item) {
    if (curatedExists_(values, c, item, tz)) return;
    var rowArr = [];
    for (var j = 0; j < header.length; j++) rowArr.push('');
    if (c.date >= 0) rowArr[c.date] = item.date;
    if (c.time >= 0) rowArr[c.time] = item.time;
    if (c.channel >= 0) rowArr[c.channel] = item.channel;
    if (c.media >= 0) rowArr[c.media] = item.media;
    if (c.headline >= 0) rowArr[c.headline] = item.headline || '';
    if (c.cap >= 0) rowArr[c.cap] = item.caption || '';
    if (c.storyCap >= 0) rowArr[c.storyCap] = item.storyCaption || '';
    if (c.tags >= 0) rowArr[c.tags] = item.tags || '';
    // Google Events need manual approval; schedule Stories auto-approve (like daily specials).
    if (c.appr >= 0) rowArr[c.appr] = (item.postType === 'schedule-story') ? 'Approve' : '';
    if (c.notes >= 0) rowArr[c.notes] = item.key;
    if (c.eventStart >= 0 && item.eventStart) rowArr[c.eventStart] = item.eventStart;
    if (c.eventEnd >= 0 && item.eventEnd) rowArr[c.eventEnd] = item.eventEnd;
    sh.appendRow(rowArr);
    if (c.media >= 0) linkifyMediaCell_(sh.getRange(sh.getLastRow(), c.media + 1), site);
    // Keep our in-memory snapshot current so repeated items in one run dedup correctly.
    var appended = []; for (var k = 0; k < header.length; k++) appended.push(rowArr[k]);
    values.push(appended);
  });
}
```

- [ ] **Step 6: Sanity-check the file parses (lint by eye / brace match)**

Run: `node --check heroes-brew/scripts/sheet-auto-publisher.gs`
Expected: no syntax errors. (Apps Script is ES5-ish JS; `node --check` validates syntax. If it flags Apps Script globals that's fine — it only checks parse, not references.)

- [ ] **Step 7: Commit**

```bash
git add heroes-brew/scripts/sheet-auto-publisher.gs
git commit -m "feat(promos): Apps Script seeds curated Events + Stories, EVENT dispatch"
```

---

## Task 8: Daily trigger + deploy notes + docs

**Files:**
- Modify: `heroes-brew/scripts/sheet-auto-publisher.gs` (trigger installer)
- Modify: `CLAUDE.md` (Heroes — Environment / publishing section)

- [ ] **Step 1: Add a daily trigger installer for `seedCuratedRows`**

Add this function (run once from the Apps Script editor after pasting):

```js
// Install a once-daily trigger (≈ 6 AM PT) that seeds the next 7 days of curated rows.
function installCurateTrigger() {
  clearTriggers_(CURATE_FN);
  ScriptApp.newTrigger(CURATE_FN).timeBased().atHour(6).everyDays(1).inTimezone('America/Los_Angeles').create();
}
```

- [ ] **Step 2: Document the curate route + EVENT posts in `CLAUDE.md`**

Add a short paragraph under the Google Business Profile section of `/Users/kmk/Heroes/CLAUDE.md`:

```markdown
**Auto-curated Events:** `GET /api/promos/curate` (guarded by `PROMOS_SECRET`) returns the
rolling 7-day curated promo rows — WC USA/Mexico, Padres, Chargers, and Monday-Night games
as Google **Events**, plus WC-day and NFL-Sunday schedule **Stories** (poster from
`/api/og/schedule`). The Apps Script `seedCuratedRows()` daily trigger upserts these into
the month tab (deduped by key in Notes); Google Event rows seed unapproved (manual Approve),
Stories auto-approve. `publish-google` emits `topicType:EVENT` when a row carries Event
Start/End. Spec: `docs/superpowers/specs/2026-06-28-google-event-curation-design.md`.
```

- [ ] **Step 3: Run the full test suite + build**

Run: `npm test && npm run build`
Expected: all tests pass; build succeeds.

- [ ] **Step 4: Commit**

```bash
git add heroes-brew/scripts/sheet-auto-publisher.gs CLAUDE.md
git commit -m "feat(promos): daily curate trigger + docs"
```

- [ ] **Step 5: Manual deploy steps (require the live sheet — do NOT skip; report to user)**

These cannot be automated from here and must be done in the signed-in browser / Apps Script editor:

1. Open the bound Apps Script editor for the "Event Posters & Posts" sheet.
2. Paste the full updated `sheet-auto-publisher.gs` over the Monaco editor contents (repo is source of truth — per the publisher-drift memory).
3. Run `addEventColumns` once (adds the `Event Start` / `Event End` columns).
4. Run `installCurateTrigger` once (installs the daily 6 AM PT trigger).
5. Confirm Script Property `PROMOS_SECRET` is set (already used by other routes).
6. Deploy the Next app to production (Vercel REST API per `CLAUDE.md`) so `/api/promos/curate` and `/api/og/schedule` are live, then verify both URLs respond.

- [ ] **Step 6: Push + open PR + merge** (per the user's git workflow)

```bash
cd /Users/kmk/Heroes
git push origin HEAD
gh pr create --fill && gh pr merge --merge
```

---

## Remaining external blocker (call out to the user, do not attempt to resolve)

Google Event posts go **live only after** the GBP API gated-access approval lands (submitted 2026-06-22, pending) and the five `GOOGLE_BUSINESS_*` env vars are set on the Vercel project. Until then every curated Google row is seeded and approvable, but `publish-google` returns `503 not configured` and the Google channel is skipped (IG/Story unaffected). NFL Events/Stories will not produce rows until the NFL season (Sept 2026) enters the 7-day window.

## Self-Review notes

- **Spec coverage:** USA/Mexico (Task 3) ✓, Padres (Task 3) ✓, Chargers + MNF (Task 3) ✓, WC-day + NFL-Sunday stories (Task 3) ✓, EVENT route (Task 4) ✓, curate route (Task 5) ✓, dynamic schedule poster replacing ffmpeg render (Task 6) ✓, Apps Script seeder + dedup + columns + approval policy (Task 7) ✓, daily trigger + docs + deploy (Task 8) ✓, external blocker called out ✓.
- **Type consistency:** `CuratedPromo` fields produced in Task 3 are consumed verbatim by the curate route (Task 5) and the Apps Script seeder (Task 7: `item.postType/date/time/channel/media/headline/caption/storyCaption/tags/key/eventStart/eventEnd`). `gbpDateTime` (Task 4) returns `{date,time}` consumed in the same task's post builder.
