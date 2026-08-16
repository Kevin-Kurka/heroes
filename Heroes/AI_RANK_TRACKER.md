# American Heroes & Brew — AI-Rank Tracker

The instrument panel for the AI Search Domination engine (`AI_DOMINANCE_PLAYBOOK.md`). Run monthly. Each run: ask the target queries on each AI surface, record whether Heroes is **named**, its **position**, the **sentence** used, and the **sources cited**. Watch the position distribution climb over time and attribute movement to workstreams (reviews, citations, content, entity).

## Method
- **Surfaces:** Perplexity, ChatGPT, Gemini, Claude, Google AI Overviews. (Perplexity is the easiest no-login proxy and a pure answer engine — always run it; add the others as logins allow.)
- **Scoring per query:** `1st` / `top-set` (named in the lead group) / `mentioned` (named but bottom) / `absent`.
- **Also capture:** competitor set + their review counts (reveals the volume gap), and which sources/guides the AI cited (reveals citation targets).
- **Cadence:** monthly. Log deltas + the likely cause.

---

## Baseline — 2026-06-22 (Perplexity)

| Query | Result | Heroes | Competitors shown (rating / #reviews) | Diagnosis |
|---|---|---|---|---|
| "best sports bar in Carlsbad to watch the game" | Places module, 7 venues | **mentioned, #7 of 7** — *highest rating 4.7* | PCH Sports Bar 4.6(481), Yard House 4.4(**2,337**), Rookies 4.2(797), Hennessey's 4.4, Fat Joe's 4.4, Grand Ave B&G 4.5 | Best rating, last place → **review volume** is the gap. Also pulled Oceanside venues for a Carlsbad query. |
| "family friendly restaurant near LEGOLAND with kids" | Places module, 8 venues | **absent** | Islands 4.4(1,986), Dini's 4.5(1,891), Windmill Food Hall 4.4(1,587), Green Dragon 4.5, The Landings, Canyons, Lobster Lab 4.8, Surf Up Chicken 4.9 | Proximity (Palomar Airport Rd cluster) + volume. Need geo content + reviews mentioning LEGOLAND/family. |
| "best Philly cheesesteak in Carlsbad California" | Places module, 8 venues | **mentioned, #8 of 8** — *rating 4.7* | Don's Country Kitchen 4.7(1,859), Eris Food Co. 4.8(647), The Cheesesteak Grill 4.6(499), Señor Grubby's 4.4, Hennessey's 4.4, Larry's Beach Club 4.3, PCH Sports Bar 4.6 | Signature differentiator ranking last. Mostly Oceanside winners. **Review volume + "cheesesteak" keyword in reviews.** |
| "best breakfast in Carlsbad Village" | Prose answer + citations (10 sources) | **absent** | Village Kitchen & Pie Shoppe, Beach Plum Kitchen, Shorehouse Kitchen, Swami's Cafe | Citation-driven, not Places. We serve breakfast (category-unique) but aren't in the cited guides. **Get into breakfast "best of" guides + breakfast reviews.** |

### Baseline takeaways
1. **Rating is already a strength (4.7 — best in nearly every set). The lever is review VOLUME + recency, on Google.** Competitors winning have 1,500–2,300+ reviews.
2. **Places-module queries** (sports bar, cheesesteak): Heroes appears but last → pure volume problem; climbing requires steady review velocity.
3. **Prose/citation queries** (breakfast) and **proximity queries** (LEGOLAND): Heroes absent → requires **earned citations in the guides AIs quote** + geo-specific content + keyword-rich reviews.
4. **Geographic leakage:** Perplexity treats "Carlsbad" loosely and surfaces Oceanside venues — reinforces that we must dominate the *Carlsbad-specific* corpus so the AI anchors us to the city.

### Pending baseline (run when logins available)
- [ ] ChatGPT — same 4 queries
- [ ] Gemini — same 4 queries
- [ ] Claude — same 4 queries
- [ ] Google AI Overviews — same 4 queries (note which sources it cites)
- [ ] Add bar/happy-hour cluster query

---

## Progress log
_(append one block per monthly run — record movement and the workstream that likely caused it)_

- **2026-06-22** — Baseline set (Perplexity). Heroes: sports bar #7/7, cheesesteak #8/8, LEGOLAND absent, breakfast absent. Strength = rating; gap = volume + citations. Engine workstreams initiated.
