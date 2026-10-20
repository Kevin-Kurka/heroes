# American Heroes & Brew — Menu / POS / Cost Refactor: Implementation Plan

**Purpose:** A full, epic-split implementation plan for a *major* refactor of the
operating chain **xtraCHEF purchases → invoices → ingredients → recipes (+prep
recipes) → Toast menu items → menus → specials & discounts**, plus the two
product changes requested: (1) rebrand **Breakfast → Brunch on weekends only
(Sat & Sun)**, and (2) add **football-friendly specials to the Daily Lineup**.
The goal is a simplified, best-practice POS with clean costing, no duplicates,
and a menu focused on what actually sells.

**Scope note — two systems, one source of truth:** The authoritative menu/cost
objects live in **Toast** and **xtraCHEF** (changed by the operator, via the
browser/computer session). This repository (`Kevin-Kurka/heroes`) renders the
**public website mirror** of the same menu. They are bridged by a **Google Sheet**
published as CSV and read by the site via `MENU_SHEET_CSV_URL`
(see `Heroes/heroes-brew/MENU-SHEET-SYNC.md`). Every epic below marks whether a
task is executed in **[TOAST]**, **[XTRACHEF]**, **[SHEET]**, or **[WEB]** (this repo).

**Last updated:** 2026-09-03
**Related files (web mirror):**
- `Heroes/heroes-brew/src/lib/menu.ts` — static menu (fallback + seed for the sheet)
- `Heroes/heroes-brew/src/lib/menu-sheet.ts` — Google-Sheet CSV → menu parser
- `Heroes/heroes-brew/src/app/HomePageClient.tsx` — `DAILY_SPECIALS` (home "Daily Lineup")
- `Heroes/heroes-brew/src/lib/curated-promos.ts` — game-day promo automation (Padres/Chargers/MNF)
- `Heroes/heroes-brew/src/lib/config.ts` — `SHOW_PRICES`, price-token scrubbing
- `Heroes/Menu_Evaluation_Heroes_Brew.md` — menu/pricing evaluation (input to Epic 4)

---

## 0. Guiding principles & guardrails (read before touching anything)

1. **Preserve sales history.** In Toast, **never hard-delete** an item/menu that
   has sales — you lose historical reporting and break menu-engineering trend
   data. **Rename in place** to keep the same GUID when an item is merely being
   re-labeled (e.g. Breakfast item → Brunch), and **archive / 86 / hide** (not
   delete) items being retired. Deleting is reserved for objects with zero
   lifetime sales and no recipe links.
2. **Data before opinions.** No item is cut, merged, or repriced until it has a
   90-day sales-mix + margin number behind the decision (Epic 1). The evaluation
   doc's recommendations are *hypotheses* to confirm against real Toast data.
3. **Cost chain integrity.** A menu item is only "done" when it traces cleanly:
   invoice unit cost → ingredient → recipe (and prep recipe) → plate cost →
   Toast item → sales category → theoretical food-cost %.
4. **One source of truth per object type.** Toast owns items/prices/modifiers;
   xtraCHEF owns cost/recipes; the **Google Sheet** is the hand-off that the
   website reads. The website must **stop duplicating** menu/specials data in
   more than one place (today it lives in *three*: `menu.ts` `Specials`,
   `HomePageClient.DAILY_SPECIALS`, and `curated-promos.ts`).
5. **Change control.** Every change batched, logged (object, before/after,
   reason, owner, date), applied off-peak, verified, and reversible. Full Toast
   menu export + xtraCHEF recipe export taken as a backup before each epic.
6. **Reversibility.** Each epic defines an explicit rollback. Toast changes are
   staged in a non-live **"_WIP"** menu/group where possible and swapped in only
   after review.

---

## Dependency map (execution order)

```
Epic 0  Foundation / guardrails / backups
   │
Epic 1  Current-state audit + 90-day sales-mix reconciliation   ← gates everything
   ├────────────────────────────┬───────────────────────────────┐
Epic 2 xtraCHEF costing     Epic 4 Toast menu taxonomy      (parallel once Epic 1 done)
(purchases→invoices→ingredients)  & item cleanup
   │                            │
Epic 3 Recipes + prep recipes ──┘  (recipes link ingredients → Toast items)
   │
Epic 5 Brunch rebrand (weekends)  ── depends on 4 (clean items) + 3 (brunch recipes/cost)
Epic 6 Football Daily-Lineup specials ── depends on 7 (discount engine) + 4
Epic 7 Discounts & specials engine ── depends on 4 (clean items/sales categories)
   │
Epic 8 Website + Sheet sync (this repo) ── mirrors 4/5/6/7 via the Sheet
   │
Epic 9 Reporting, validation, rollout, staff training, ongoing cadence
```

Epics 2 and 4 can run in parallel after Epic 1. Epic 3 needs 2. Epics 5–7 need 4
(and 5 needs 3). Epic 8 mirrors 4–7. Epic 9 closes out.

---

## Epic 0 — Foundation, guardrails & backups

**Objective:** Make the refactor safe, reversible, and auditable before any edit.

**Tasks**
- **[TOAST]** Export the full current menu (all 25 menus, groups, items,
  modifier groups, mods, prices, sales categories, tax, availability, routing).
  Store as the pre-refactor baseline.
- **[XTRACHEF]** Export current vendors, item/ingredient master, recipes, and
  prep recipes. Snapshot current theoretical vs. actual food cost.
- **[TOAST]** Confirm there is **no true sandbox**; establish the safe-edit
  pattern: build changes in a hidden **`_WIP`** menu/group, edit off-peak, and
  publish deliberately (the snapshot flagged possible "genuine unpublished
  changes" — resolve those first, see Epic 1).
- Define **naming conventions** (item, modifier, sales category, discount),
  **sales-category taxonomy**, and **tax mapping** to be used everywhere.
- Stand up the **change log** (single sheet/table) and the **decision log**
  (cut/keep/merge/reprice with the data behind it).
- **[SHEET]/[WEB]** Confirm the live Google Sheet is the agreed bridge and that
  `MENU_SHEET_CSV_URL` will be pointed at it (currently the site renders the
  static `menu.ts` fallback).

**Acceptance criteria**
- Complete, dated backups of Toast and xtraCHEF exist and are restorable.
- `_WIP` safe-edit path proven; naming/taxonomy/tax conventions documented.
- Change log + decision log live and in use.

**Owner:** Operator (Toast/xtraCHEF) + web agent for the Sheet/repo bridge.
**Rollback:** Re-import baseline export.

---

## Epic 1 — Current-state audit & sales/cost reconciliation *(gates everything)*

**Objective:** Replace assumptions with a verified map of every object and its
90-day performance. "Don't assume things are set up correctly."

**Tasks**
- **[TOAST]** Inventory every object and build a **reconciliation matrix**:
  menus → groups → items → modifier groups → mods, with price, sales category,
  tax, availability window, channel visibility (Dine-in / DoorDash / etc.),
  and printer/prep routing per item.
- **[TOAST]** Resolve the **"No Sales Category Assigned"** finding: enumerate
  the ~70 items / ~$968 and slot each into the Epic 0 taxonomy (this is also a
  reporting-integrity fix). Confirm/clear any **genuine unpublished changes**.
- **[TOAST]** Pull **90-day item-level sales** (units, net sales, % mix) and
  identify: **zero/low sellers** (bottom 10%), **duplicates / near-duplicates**,
  **price outliers**, and items with **no recipe link**.
- **[XTRACHEF]** Inventory vendors, ingredient master, invoice capture coverage,
  and existing recipes/prep recipes. Flag ingredients with **no unit cost**,
  **no recent invoice**, or **inconsistent units of measure**.
- **Cross-map** Toast items ↔ xtraCHEF recipes to expose **orphans** on both
  sides (item with no recipe; recipe with no item).
- **[WEB]** Diff the website mirror against Toast: `menu.ts` vs. live Toast menu;
  list every place the site is stale or duplicative (esp. specials, breakfast).

**Deliverables**
- Reconciliation matrix (Toast objects × attributes).
- Menu-engineering quadrant (Stars / Plow-horses / Puzzles / Dogs) from 90-day
  mix × margin — the factual basis for keep/cut/reprice.
- Gap list: uncategorized, duplicates, orphans, missing costs, unit mismatches.

**Acceptance criteria**
- 100% of active Toast items appear in the matrix with a sales category.
- Every item classified into a menu-engineering quadrant.
- Orphan/gap lists complete and signed off before Epics 2–4 start.

**Owner:** Operator + web agent (web diff). **Rollback:** N/A (read-only).

---

## Epic 2 — xtraCHEF costing backbone (purchases → invoices → ingredients)

**Objective:** A trustworthy ingredient cost layer — the base of the whole trace.

**Tasks**
- **[XTRACHEF]** Clean the **vendor** list and **ingredient/item master**:
  dedupe, standardize names, retire dead SKUs.
- **[XTRACHEF]** Normalize **units of measure** and pack sizes so purchase units
  convert cleanly to recipe units (the root cause of bad plate costs).
- **[XTRACHEF]** Close **invoice-capture gaps** from Epic 1 so every active
  ingredient has a current unit cost; set price-alert thresholds.
- **[XTRACHEF]** Record **yield/waste factors** for trimmed proteins/produce so
  costed portions reflect usable yield.

**Acceptance criteria**
- Every active ingredient has a current unit cost and a consistent UoM.
- Vendor/ingredient master deduped; conversions verified on a sample.

**Owner:** Operator (xtraCHEF). **Depends on:** Epic 1. **Rollback:** revert master edits from export.

---

## Epic 3 — Recipes & prep recipes (ingredients → recipes → prep → item cost)

**Objective:** Every sellable item has a costed recipe, with shared components as
prep recipes, linked to its Toast item.

**Tasks**
- **[XTRACHEF]** Build/verify **prep recipes** for shared components (AHB Wiz,
  Hero sauce, Kickn' BBQ, chili, aioli, coleslaw, guacamole, batters, dressings)
  so they're costed once and reused.
- **[XTRACHEF]** Build/verify **plate recipes** for every active menu item;
  attach prep recipes; compute **plate cost** and **theoretical food-cost %**.
- **[XTRACHEF]** **Standardize protein portions & costs** (the evaluation flagged
  chicken/carnitas/carne asada/pastrami priced inconsistently across nachos vs.
  burritos vs. tacos). One portion spec per protein → consistent cost → basis for
  consistent Toast modifier pricing in Epic 4.
- **[XTRACHEF→TOAST]** **Link each recipe to its Toast menu item** so cost/margin
  reporting is complete and future price changes show margin impact.

**Acceptance criteria**
- 100% of active items have a linked, costed recipe; shared components are prep
  recipes (not duplicated).
- Each protein has one portion spec and one cost, reused everywhere.
- Theoretical food-cost % available per item and per category.

**Owner:** Operator (xtraCHEF). **Depends on:** Epic 2. **Rollback:** recipe export.

---

## Epic 4 — Toast menu taxonomy & item cleanup (menu items → menus)

**Objective:** A simplified, correctly-categorized Toast menu focused on sellers,
with clean modifiers and rationalized channels. **This is the core "cleanup."**

**Tasks**
- **[TOAST]** **Sales categories & tax:** assign every item (closes the ~$968 /
  70-item gap); verify tax rate per category; verify **prep/printer routing**.
- **[TOAST]** **De-duplicate** items/modifiers found in Epic 1 — merge by
  renaming the canonical object and archiving the duplicate (preserve history).
- **[TOAST]** **Retire dogs:** 86/hide bottom-decile, no-margin items (data-driven,
  from Epic 1). Candidate examples to *confirm against data* (from the eval):
  trim 8 burgers → 5–6, trim 6 loaded-fries → 3–4, review Hummus Plate / Corn
  Dogs / Antipasto. Nothing cut without the number.
- **[TOAST]** **Standardize modifier groups & mods:** consistent required/optional
  and min/max, consistent protein add-on prices (from Epic 3 portion costs),
  consistent "choice" groups. Remove ad-hoc per-item modifiers where a shared
  group works.
- **[TOAST]** **Repricing** per the evaluation, gated by margin data (e.g. burgers,
  munchies tiering, breakfast sides floor, nachos protein sticker-shock,
  loaded-fries). Apply as a single reviewed price change set.
- **[TOAST]** **Menu/channel simplification:** reduce the **25 menus** (incl.
  DoorDash-specific) to a rationalized set. Prefer **one master menu with
  channel/day-part availability and channel price adjustments** over many
  parallel hand-maintained menus, so DoorDash and dine-in can't drift.
- **[TOAST]** **Fix typos** flagged in the evaluation (OMELETS, BAGELS, Jalapeño,
  Guinness, Caesar, Pasadena, Coastal, "topped with syrup", Biscuit) — free
  perceived-quality win.

**Acceptance criteria**
- 0 items in "No Sales Category Assigned"; tax + routing correct on every item.
- Duplicate count = 0; retired items archived (history intact), not deleted.
- Modifier groups standardized; protein add-on pricing consistent menu-wide.
- Menu/channel count reduced with documented rationale; DoorDash parity verified.

**Owner:** Operator (Toast). **Depends on:** Epic 1 (+3 for pricing). **Rollback:** `_WIP` swap-back / baseline import.

---

## Epic 5 — Brunch rebrand (weekends only: Saturday & Sunday)

**Objective:** Present **Brunch** on Sat & Sun (not "Breakfast"), using Toast
day-parts/availability rather than manual toggling — mirrored on the website.

**Tasks**
- **[TOAST]** Create a **Brunch** menu/group with **availability = Sat & Sun**
  (align with the 9 AM open on Fri–Sun; decide whether Friday stays "Breakfast"
  or joins "Brunch"). Reuse existing breakfast items by **renaming/duplicating
  into the Brunch day-part to preserve item history** where possible.
- **[TOAST]** Add brunch-appropriate items/pricing (candidates from the eval:
  Chicken & Waffles, breakfast quesadilla) once costed in Epic 3; surface
  brunch beverages (Mimosa, Bloody Mary, the existing "2 for 22" / bottomless
  mimosa) inside the Brunch day-part.
- **[SHEET]** Rename the sheet **Breakfast** tab → **Brunch** (and/or add a
  weekend note) so the site mirror follows.
- **[WEB]** Update the website mirror to match:
  - `menu.ts`: rename the `breakfast` group to **Brunch** and update the
    availability note (currently items say "Available Friday–Sunday 9am–1pm").
  - `HomePageClient.tsx`: the **"2 for 22 Breakfast"** section + "Breakfast
    served Friday – Sunday" copy → brunch wording with correct Sat/Sun (or
    Fri–Sun) framing; add a small **weekend-only day-part** helper (Pacific-time)
    so the section labels/shows correctly by day.
  - Verify hours in `getRestaurantInfo()` still reflect the 9 AM weekend open.
  - Update FAQ / structured-data / landing copy that references "breakfast"
    (`faq.ts`, `structured-data.ts`, `llms.txt`) so AEO stays consistent.
- **[WEB]** Add/adjust unit tests for the day-part logic (Vitest already present).

**Acceptance criteria**
- Toast shows Brunch only on Sat & Sun (verified by changing device date/day-part).
- Website shows "Brunch" on weekends with correct copy and hours; weekday view
  unaffected; tests pass; menu still renders from the sheet **and** static fallback.

**Owner:** Operator (Toast/Sheet) + web agent (repo). **Depends on:** Epics 3–4.
**Rollback:** revert day-part + git revert the web commit.

---

## Epic 6 — Football-friendly specials in the Daily Lineup

**Objective:** Add game-day specials (NFL Sunday, Monday Night, Chargers/Padres)
to the Daily Lineup as **real Toast discounts** and mirror them on the site,
reusing the existing game-day automation.

**Tasks**
- Decide the football special set (e.g. **Sunday Game Day** bucket/wings + pitcher
  deal; **Monday Night** special; keep the existing **Padres → Friar Franks $6 +
  $2 off Heroes drafts**, add a **Chargers** equivalent). Price/margin-check each
  against Epic 3 costs.
- **[TOAST]** Implement each as a named **discount** (Epic 7 engine) with the
  right day/day-part; avoid open/manual discounts so redemption is reportable.
- **[SHEET]/[WEB]** Add to the Daily Lineup mirror. Note the site currently
  **hardcodes** specials in `HomePageClient.DAILY_SPECIALS` (Mon–Fri;
  `todayIndex = -1` on Fri–Sun) **and** duplicates them in `menu.ts` `Specials`.
  Extend the lineup to cover **weekend/game-day** entries and drive it from **one**
  source (see Epic 8).
- **[WEB]** Leverage existing football wiring in `curated-promos.ts`
  (Chargers/Padres Google Events, NFL-Sunday schedule stories, Monday-Night
  detection via `isMondayNight`) so on-site specials and the social auto-posts
  tell the same story.

**Acceptance criteria**
- Football specials exist as reportable Toast discounts on the correct days.
- Home "Daily Lineup" shows the game-day special on weekends/game days (no more
  "come back Monday–Friday" gap on football days).
- Social automation and on-site copy match.

**Owner:** Operator (Toast) + web agent (repo). **Depends on:** Epics 4 & 7.
**Rollback:** disable discount + git revert.

---

## Epic 7 — Discounts & specials engine (best practices)

**Objective:** Replace ad-hoc discounting with a governed set of named discounts
so the Daily Lineup is consistent, auto-applied where possible, and fully
reportable (the snapshot showed **$1,383.99/wk, 4.8% of gross** in discounts with
limited visibility).

**Tasks**
- **[TOAST]** Model every recurring special (Mahalo Monday, Taco Tuesday, Wings &
  Wells, Burgers & Beer, Friday Funday, plus the new football specials) as a
  **named discount** scoped by day/day-part/menu-group; auto-apply where Toast
  supports it, else a one-tap named button (no free-form open discounts).
- **[TOAST]** Restrict open/manual discount permissions; set reason codes.
- **[TOAST]** Verify each discount reports cleanly (units, $ discounted, mix).
- Reconcile the **Tuesday $3-taco below-cost** risk the eval flagged (set a
  protein floor or fixed protein) using Epic 3 costs.

**Acceptance criteria**
- 100% of recurring specials are named, day/day-part-scoped discount objects.
- Open-discount usage trends toward ~0; weekly discount total is explainable by
  named discounts in reporting.

**Owner:** Operator (Toast). **Depends on:** Epic 4. **Rollback:** disable/rename discounts.

---

## Epic 8 — Website + Google-Sheet synchronization (this repo)

**Objective:** Make the public site a faithful, low-maintenance mirror of the
cleaned Toast menu, and **collapse the website's duplicated data sources** into a
single source of truth. This epic is executed here in `Kevin-Kurka/heroes`.

**Tasks**
- **[SHEET]** Regenerate the live sheet from the cleaned menu (use
  `/menu/printable → Download → CSV` after Epic 4, or rebuild the sheet), then
  set **`MENU_SHEET_CSV_URL`** in Vercel so `/menu` renders from Toast-aligned
  data (falls back to `menu.ts` automatically).
- **[WEB]** Update the static fallback `menu.ts` to match the cleaned menu so the
  fallback never shows stale/removed items (prices, retired items, renames,
  Brunch group, standardized modifiers).
- **[WEB]** **Unify specials into one source.** Today specials live in three
  places (`menu.ts` `Specials`, `HomePageClient.DAILY_SPECIALS`,
  `curated-promos.ts`). Introduce a single `daily-lineup` data module (or a
  sheet tab) that the home page, the menu `Specials` group, and the promo
  automation all read, so a special is defined once.
- **[WEB]** Implement the **weekend/game-day day-part** logic feeding both Brunch
  (Epic 5) and football specials (Epic 6); remove the hardcoded Mon–Fri-only
  assumption in `HomePageClient`.
- **[WEB]** Keep `SHOW_PRICES` behavior intact (prices are currently hidden on the
  public site; `stripPriceTokens` scrubs copy) — ensure new copy respects it.
- **[WEB]** Update AEO surfaces that name dishes/specials/breakfast: `faq.ts`,
  `structured-data.ts` (Menu/FAQ JSON-LD), `landing-pages.ts`, `llms.txt`,
  `watch-parties.ts`.
- **[WEB]** Tests: extend Vitest coverage for the sheet parser round-trip, the
  day-part logic, and specials rendering; run `npm run lint`, `npm test`,
  `npm run build`; verify `/menu`, `/menu/printable`, `/` render from both the
  sheet and the static fallback.

**Acceptance criteria**
- Site menu matches Toast (via sheet) with static fallback in parity.
- Specials defined exactly once; home lineup + menu specials + social agree.
- Lint/tests/build green; brunch + football specials render on the right days.

**Owner:** Web agent (this repo) + operator (sheet/env var). **Depends on:** Epics 4–7.
**Rollback:** unset `MENU_SHEET_CSV_URL` (reverts to static) + git revert.

---

## Epic 9 — Reporting, validation, rollout & ongoing cadence

**Objective:** Prove the refactor end-to-end, roll out safely, train staff, and
institutionalize menu engineering.

**Tasks**
- **Validation dashboard:** 0 uncategorized items; theoretical vs. actual
  food-cost by category within target; discount report reconciles to the named
  discounts; DoorDash/dine-in/website parity.
- **[TOAST]** Operational fixes surfaced in the snapshot that touch menu/reporting
  integrity: **record actual bank deposits daily** (so cash variance is real),
  review **Chef overtime** and remove **placeholder schedule rows**.
- **Phased rollout:** publish Toast changes off-peak in batches (taxonomy →
  pricing → menus/day-parts → discounts), verifying after each; keep the `_WIP`
  swap-back ready.
- **Staff training:** new names, day-parts (Brunch weekends), one-tap discounts,
  86/availability workflow.
- **Website go-live:** set `MENU_SHEET_CSV_URL`, verify live, mind the ISR
  revalidate window on `/menu`.
- **Ongoing cadence:** weekly menu-engineering review (mix × margin), monthly
  invoice-cost refresh in xtraCHEF, quarterly menu prune of bottom-decile items.

**Acceptance criteria**
- All prior epics' acceptance criteria verified on live data.
- Rollout complete with no reporting regressions; staff trained; cadence scheduled.

**Owner:** Operator + web agent. **Depends on:** Epics 2–8.

---

## Parking lot (raised in the snapshot, out of core menu scope)

- **Loyalty activation** and **first-party online ordering** vs. DoorDash-only:
  decide based on the dine-in-heavy (~95%) mix and low off-premise volume — a
  business decision, sequence after the menu refactor stabilizes.
- **QR table signs** and remaining **Toast setup (87% → 100%)**.

## Owner legend
- **[TOAST]** — Toast POS (operator via browser/computer session; e.g. grokBot)
- **[XTRACHEF]** — xtraCHEF (operator)
- **[SHEET]** — the shared Google Sheet bridge
- **[WEB]** — this repository (`Kevin-Kurka/heroes`), executed by a coding agent
