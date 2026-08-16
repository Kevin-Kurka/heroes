# American Heroes & Brew — Marketing, SEO & AI-Visibility Strategy

**Date:** June 22, 2026
**Owner:** Kevin Kurka
**Goal:** More people in seats. Get found by humans (traditional + local SEO) and by AI assistants (ChatGPT, Perplexity, Gemini, Google AI Overviews, Siri/Apple Intelligence), and convert the **summer tourist surge** now while building **durable, compounding authority** for the year-round base.

> This strategy is grounded in (a) a verified deep-research pass (sources + adversarial fact-check in the Appendix), (b) live competitive recon (June 2026), and (c) the site's actual shipped infrastructure. Marketing-blog "stats" that failed verification were discarded — only confirmed findings are used.

---

## 0. Executive Summary

American Heroes & Brew is already doing the hard technical work most local restaurants skip: live structured data (Restaurant + FAQ + Menu schema), an `/llms.txt` brief, AI-crawler-friendly `robots.txt`, GSC/GA4, automated Instagram/Facebook posting, and a Google Business Profile auto-posting pipeline (awaiting Google API approval, ~early July). The foundation is strong.

The growth is **not** going to come from more on-site schema. It comes from three levers the research says actually move local + AI visibility:

1. **Reviews — velocity, on Google specifically.** Google holds ~96% of restaurant review volume and is the dominant signal AI engines and the Local Pack read. Heroes has a strong rating (4.7★) and a real Yelp base (449), but must drive a *steady, ongoing flow* of fresh **Google** reviews — the tourist surge is the fuel.
2. **Third-party "best of" authority.** AI assistants quote listicles and local guides. Heroes is *missing* from the exact pages that rank for "where to watch the game in Carlsbad" (e.g., Patch's 8-venue list). Getting cited there is higher-leverage than any on-site change.
3. **Tourist interception.** Carlsbad draws ~4M visitors/yr ($1.7B spend), led by LEGOLAND families staying multi-day, 6–8 min away. They decide where to eat *on their phone, in-market*. We intercept them with high-intent landing pages, GBP, reviews, and a small geo-targeted paid budget.

Positioning that wins (because we can't out-scale Draft Republic): **"Carlsbad Village's family-friendly game-day spot — every game on 16 TVs, the only Philly cheesesteak in town, and the only weekend breakfast in the sports-bar category."**

---

## 1. Situation Analysis — Where We Are

### 1.1 Assets already shipped (don't rebuild — leverage)
- **Website** (Next.js, americanheroesandbrew.com): Restaurant/FAQ/Menu/Breadcrumb JSON-LD, `/llms.txt`, AI-bot `robots.txt`, sitemap, one-tap `/review` link, live events/scoreboard, social feed.
- **Analytics:** GSC verified, GA4 live.
- **Automation:** Daily IG + FB auto-publish from the promos sheet (2pm PT); GBP Local-Post auto-posting **built**, gated on Google Business Profile API approval (support case open, expected ~Jul 2–6).
- **Menu/pricing analysis** complete (B- grade; ~$2–3/check left on the table — see `Menu_Evaluation_Heroes_Brew.md`).

### 1.2 Verified competitive landscape (live, June 2026)
| Venue | Positioning | Scale signal | Takeaway for us |
|---|---|---|---|
| **Draft Republic** (Avenida Encinas) | Mega sports-bar: 70+ TVs, LED wall, golf sims, 100+ taps | **~1,678 Yelp reviews** | Can't out-scale. Out-niche on family/breakfast/Philly + Village walkability. |
| **Park 101** (Village) | Rooftop, "North County's game-day HQ," BBQ, big screens | Major, strong brand | Owns "rooftop/big-screen." We own "every-game + family + breakfast." |
| **Le Papagayo, Barrel Republic, Hennessey's, Coyote's, Grand Ave B&G, BJ's, Yard House, Dave & Buster's** | Mixed casual / sports | Varies | These are the names that appear in "best of" guides — the citation set we must join. |
| **American Heroes & Brew** | Family-friendly Village sports bar; 16 TVs; Philly cheesesteak; weekend breakfast | **4.7★; 449 Yelp; ~672 aggregate (RestaurantGuru)** | Strong rating, under-marketed story. Absent from key listicles. |

### 1.3 The gaps (this is the work)
1. **Google review velocity** — rating is great; need a *system* that reliably adds fresh Google reviews every week, especially from summer visitors.
2. **Not in the "best of" citation set** — missing from Patch's "Best places to watch the game in Carlsbad"; only a passing *beer* mention (not "game-watching") in the Carlsbad Village guide.
3. **No high-intent landing pages** for the queries tourists & locals actually type/ask ("watch [NFL/UFC/World Cup] in Carlsbad," "sports bar near LEGOLAND," "Carlsbad Village breakfast," "happy hour Carlsbad Village").
4. **No Event/watch-party structured data** on `/events` — we publish games but don't mark them up for Google/AI event surfaces.
5. **Directory coverage incomplete** — Yelp/TripAdvisor/Apple Business Connect not all claimed/optimized with identical NAP; tourist directories (Visit Carlsbad, LEGOLAND-area guides) under-leveraged.
6. **No owned audience** — no email/SMS capture to bring one-time visitors and tourists back (or convert "I'll come back next trip").
7. **Brand story under-told** — the differentiators (16 TVs / family / Philly / breakfast) aren't landing in third-party coverage or ads.

---

## 2. The Two Audiences (Demographics-Driven)

Heroes serves two distinct markets that require different plays. The summer tourist play is a **quick-win sprint**; the local play is the **compounding base**.

### Audience A — Summer Tourists (quick-win, now → Labor Day)
**Who:** LEGOLAND families (kids ~2–12) on multi-day stays; beachgoers; Village day-trippers. Carlsbad = #2 tourism market in San Diego County, ~4M visitors/yr, LEGOLAND ~40% of the draw. They lodge nearby (LEGOLAND Hotel, Omni La Costa, Grand Pacific, MarBrisa, Westin/Cape Rey) and are 6–8 min away.
**How they decide:** in-market, on mobile — Google Maps / "near me," AI assistant ("good family restaurant near LEGOLAND"), Yelp/TripAdvisor, hotel concierge & racks. **Decision is made the day-of.**
**What wins them:** top-of-Maps presence + fresh reviews + "family-friendly" and "kids menu" attributes + a tourist-intent landing page + a reason to choose us (game on, breakfast before the park, Philly cheesesteak they can't get at home). High intent, low loyalty → **capture the review and the email before they leave.**

### Audience B — Locals & Regulars (durable base)
**Who:** Carlsbad/North County residents, the after-work crowd, game-day regulars, weekend-breakfast families.
**How they decide:** habit, daily specials, "where's the game on," Instagram, word of mouth.
**What wins them:** the daily-specials engine (already strong), watch-party events, loyalty/email, consistent social, and being *the* answer when a local asks AI/Google "best sports bar in Carlsbad."

> **Seasonality note:** the tourist sprint (summer) overlaps the slowest part of the sports calendar (MLB only until Sept). Lean tourist/breakfast/family/UFC-PPV + World Cup summer 2026 buzz now; pivot hard to NFL/CFB game-day in September when locals + football return together.

---

## 3. Strategic Thesis & Positioning

**Thesis:** We win local + AI search not by proximity (research shows proximity has ~0 correlation with *ranking* in AI answers — content quality, authority, and reviews dominate) but by being the **best-documented, best-reviewed, most-cited** family game-day spot in Carlsbad Village.

**Positioning line (use everywhere):**
> *American Heroes & Brew — Carlsbad Village's family-friendly game-day spot. Every game on 16 TVs, the only true Philly cheesesteak in town, and weekend breakfast no other sports bar serves. Walkable in the Village, minutes from LEGOLAND and the beach.*

**Three proof pillars** (repeat in ads, listings, pages, pitches):
1. **Every game, family-friendly** — 16 TVs, NFL/NBA/CFB/UFC, kids welcome (Draft Republic/Park 101 skew adult/party).
2. **The Philly** — Amoroso rolls flown in; genuinely unique in Carlsbad.
3. **Weekend breakfast** — we own mornings in the sports-bar category.

---

## 4. The Growth Engine — Channel Plan

Ordered by leverage. Each channel lists the play and what I will build/run.

### 4.1 Reviews Engine — the foundation (Google-first)
- **Target:** a steady **8–12 net-new Google reviews/month**, sustained. Rating ≥4.6. Respond to **100%** within 48h.
- **Capture system:** table-tent + receipt QR → `/review` (one tap to the Google box). Server ask-script at the moment of a compliment/clean plate. A small "Loved it? Scan to review" card at the register.
- **Tourist twist:** train staff to ask visitors specifically ("visiting Carlsbad? a quick review helps families find us") — tourists leave detailed, keyword-rich reviews ("near LEGOLAND," "kids loved it," "watched the game") that are *gold* for AI/local relevance.
- **Response protocol:** thank + name the thing they liked (feeds keywords); handle negatives calmly and publicly. (Heroes already does this well.)
- **Build:** verify the live Google review count + the `/review` deep link resolves to the Google write box; generate printable QR table-tents; add a post-visit review nudge to any receipt/QR touchpoint.

### 4.2 AI-Search Visibility (Answer Engine Optimization)
Research-backed signals AI engines actually use: **review volume/quality, third-party citations (Yelp/TripAdvisor/Apple/"best of" lists), and clean structured content** — *not* proximity.
- Keep `/llms.txt`, FAQ schema, Menu schema fresh (already live).
- **Add Event/watch-party schema** to `/events` so AI/Google can cite "watch [game] at Heroes on [date]."
- **Add high-intent FAQ entries** that mirror real AI prompts ("family-friendly sports bar near LEGOLAND," "where to watch UFC in Carlsbad," "sports bar with breakfast in Carlsbad").
- **Expand `areaServed` + `sameAs`** to include LEGOLAND/Carlsbad State Beach/Village and Yelp/TripAdvisor/Apple/Facebook profiles (entity reconciliation helps AI trust the listing).
- **Win citations** (§4.4) — the single biggest AI lever.
- **Build:** event JSON-LD, expanded FAQ + schema, content pages (§4.3).

### 4.3 Traditional & Local SEO + Google Business Profile
- **GBP (do at API approval + now manually):** primary category "Sports bar"; secondary Restaurant/Sandwich shop/Breakfast; set attributes (Good for kids, Good for watching sports, Serves breakfast, Outdoor seating if any, Free Wi-Fi); upload fresh photos weekly; post weekly (auto once approved); seed Q&A with our own FAQ; confirm weekend hours.
- **High-intent landing pages** (new, indexable, schema'd):
  - `/watch` — "Where to Watch the Game in Carlsbad" (NFL/NBA/CFB/UFC/World Cup; updateable game list).
  - `/legoland` (or `/near-legoland`) — "Family Restaurant & Sports Bar Near LEGOLAND."
  - `/breakfast` — "Weekend Breakfast in Carlsbad Village."
  - `/happy-hour` — specials by day (the daily-lineup engine, SEO-ified).
- **On-page:** title/meta tuned to these queries; internal links from home/menu; breadcrumb schema (already have the helper).
- **Build:** the four landing pages + schema + nav/links.

### 4.4 Local PR & "Best Of" Citations (highest AI leverage)
- **Get into the lists AI quotes.** Pitch, with a clear hook (16 TVs, family-friendly, weekend breakfast, the Philly, Village location):
  - **Patch Carlsbad** — get added to "best places to watch the game" (we're absent).
  - **Carlsbad Village Association blog** — upgrade from a beer mention to a featured game-day/breakfast spot.
  - **Visit Carlsbad / visitcarlsbad.com directory** — ensure a complete, optimized listing (tourist-facing).
  - **San Diego Magazine, Patch, North County local blogs/IG food accounts** — "best sports bars / where to watch the game / family-friendly Carlsbad" roundups.
  - **LEGOLAND-area & hotel concierge** lists, "things to do near LEGOLAND" content.
- **Build:** ready-to-send pitch templates + a press/fact one-sheet (NAP, hooks, photos, links) — reusable for every outreach.

### 4.5 Social & UGC
- Keep the daily IG/FB auto-publish running. Skew summer content to **tourist + family + breakfast + game-day**; tag location + Carlsbad/LEGOLAND/Village hashtags.
- **UGC flywheel:** encourage check-ins/tags (a small in-house sign: "Tag @americanheroesandbrew"); repost guest content; run a light summer "post your game-day plate" prompt.
- Short-form video of the Philly, breakfast, packed game-day room (the food-porn render pipeline already exists in-repo).

### 4.6 Owned Audience — Email/SMS
- **Capture** at point of sale / via a "join for a free app on game day" or "kids eat free Tuesday" offer; QR on table-tents alongside the review QR.
- **Use:** game-day reminders, weekly specials, "back-to-football" September push, tourist "come back next trip" follow-up.
- Lightweight (e.g., a simple email tool); this is the cheapest repeat-visit lever and we own it.

### 4.7 Events & Promotions Calendar (in-seat drivers)
- **Summer (now):** World Cup 2026 watch buzz, UFC PPV nights, "Breakfast before LEGOLAND," kids-eat-free weekday, bottomless-mimosa brunch (already have).
- **Fall pivot (Sept):** NFL/CFB game-day anchors — Thursday $5-off burgers, Sunday Football, watch-party promotion; market as "every game, family-friendly."
- Each event → a promo poster (existing pipeline) → IG/FB/GBP auto-post + the `/watch` and `/events` pages.

### 4.8 Paid Media — ~$300–800/mo (tourist-interception first)
Small budget → concentrate, don't spread. Recommended split:
- **~50% Google (Search + Maps/Local / Performance Max-local):** bid on in-market intent — "sports bar near me / Carlsbad," "restaurant near LEGOLAND," "where to watch [game] Carlsbad," "breakfast Carlsbad Village." Maps ads put us at the top of the decision surface tourists use. Drives calls/directions/visits.
- **~35% Meta (IG/FB) geo + interest:** radius around LEGOLAND/hotels/beach + interests (sports, family travel, LEGOLAND); creative = game-day + family + breakfast; objective = traffic/visits + event awareness. Boost the best-performing organic posts.
- **~15% retargeting:** website visitors + social engagers → "this weekend at Heroes" / "game on today."
- **Measure:** GA4 + GBP insights (calls, direction requests, clicks); track cost-per-visit-action, not vanity reach. Start at the low end (~$300–400) tourist-targeted; scale what converts into football season.

---

## 5. Summer Tourist Quick-Win Sprint (Now → Labor Day)

Run in parallel, fastest payback first:
1. **GBP tune-up + photo refresh + attributes** (today; manual now, automated at API approval).
2. **Review blitz** — table-tent QR live, staff ask-script, tourist-specific ask. Goal: visible velocity bump within 30 days.
3. **`/legoland` + `/watch` + `/breakfast` landing pages** live and indexed.
4. **Pitch the listicles** (Patch, Carlsbad Village, Visit Carlsbad) — get cited before peak season.
5. **Paid sprint** — $300–400/mo Google Maps + Meta geo around LEGOLAND/hotels; "family game-day / breakfast near LEGOLAND."
6. **Email/SMS capture** live so summer one-timers become fall regulars.
7. **Directory NAP sweep** — Yelp/TripAdvisor/Apple/Visit Carlsbad identical + optimized.

---

## 6. 90-Day Roadmap

| Phase | Window | Focus | Key deliverables | Primary KPI |
|---|---|---|---|---|
| **P1 — Foundation & tourist sprint** | Wk 1–3 | Reviews + GBP + tourist pages + listicle pitches | Review QR system; GBP optimized; `/legoland`,`/watch`,`/breakfast` live; pitch emails sent; NAP swept | Google reviews/mo ↑; Maps actions ↑ |
| **P2 — Authority & paid** | Wk 4–8 | Citations land; paid sprint; email capture; event/`happy-hour` pages | Listicle placements; paid campaigns live; email list started; Event schema on `/events` | Citations won; cost-per-action; list size |
| **P3 — Compounding & football pivot** | Wk 9–13 | NFL/CFB game-day engine; content cadence; optimize paid | Game-day promo calendar; social/UGC cadence; scale winning ads | Repeat visits; review volume; organic + AI mentions |

**Cadence after 90 days:** weekly (reviews, GBP post, social, respond-to-all); monthly (KPI review, listicle outreach, ad optimization, one new content page); seasonal (sports-calendar pivots, tourist vs. local emphasis).

---

## 7. Measurement — KPI Dashboard

Track monthly (GA4 + GBP Insights + manual AI checks):
- **Reviews:** net-new Google reviews/mo (target 8–12), avg rating (≥4.6), response rate (100%).
- **Local/GBP:** Maps impressions, calls, direction requests, website clicks, "discovery" vs "direct" searches.
- **Organic SEO:** GSC impressions/clicks for target queries; landing-page rankings.
- **AI visibility:** monthly manual prompt check — ask ChatGPT/Perplexity/Gemini/Google AI Overview "best family sports bar in Carlsbad / where to watch the game near LEGOLAND" → is Heroes named? (track yes/no + position over time).
- **Citations:** # of "best of"/guide pages featuring Heroes.
- **Paid:** spend, clicks, cost-per-action (call/direction/visit), event RSVPs.
- **Owned:** email/SMS list size + open/visit attribution.
- **Social:** reach, saves, profile visits, tagged UGC count.

---

## 8. Execution Backlog (what I build)

**On-site (I implement & deploy):**
- [ ] `/watch` — "Where to Watch the Game in Carlsbad" page + schema.
- [ ] `/legoland` — "Family Sports Bar Near LEGOLAND" tourist page + schema.
- [ ] `/breakfast` — "Weekend Breakfast in Carlsbad Village" page + schema.
- [ ] `/happy-hour` (or `/specials`) — daily-lineup SEO page + schema.
- [ ] **Event/watch-party JSON-LD** on `/events`.
- [ ] Expand `areaServed` (LEGOLAND, Carlsbad State Beach, Village) + `sameAs` (Yelp/TripAdvisor/Apple/Facebook) in `structured-data.ts`.
- [ ] Tourist + game-day + breakfast **FAQ entries** (mirror real AI prompts) in `faq.ts`.
- [ ] Update `/llms.txt` + home copy with the positioning line and proof pillars.
- [ ] Internal links + nav to new pages; titles/meta tuned.

**Assets (I create):**
- [ ] Printable **review QR table-tents** + register card → `/review`.
- [ ] **Press one-sheet** + **listicle pitch templates** (Patch, Carlsbad Village, Visit Carlsbad, SD Mag, blogs).
- [ ] Paid-campaign starter brief (keywords, geo radius, audiences, creative angles, budget split).
- [ ] Email/SMS capture plan + first 3 campaigns (game-day, breakfast/LEGOLAND, football kickoff).

**Needs you (login/credentials/approval):**
- [ ] GBP API approval (in progress) → activate auto-posting per `GBP-ACTIVATION-HANDOFF.md`.
- [ ] Claim/confirm Yelp, TripAdvisor, Apple Business Connect (logins).
- [ ] Approve/fund the paid budget + ad account access.
- [ ] Pick an email/SMS tool.

---

## Appendix A — Verified Research Findings (with sources)

Only claims that survived 3-vote adversarial verification are listed. (16 of 25 candidate claims — mostly unsourced marketing-blog stats — were discarded.)

1. **Carlsbad = #2 tourism market in San Diego County; ~4M visitors/yr; ~$1.7B visitor spend; LEGOLAND ~40% of the draw.** *(NBC San Diego / Visit Carlsbad, May 2025.)*
2. **Carlsbad Village is walkable (<1 mi to beach), 6–8 min from LEGOLAND; anchors multi-day family stays** (LEGOLAND Hotel, Omni, Grand Pacific, MarBrisa, etc.). *(LEGOLAND official guide; geo-verified.)*
3. **In AI search (ChatGPT/Perplexity/Google AI Overviews), proximity has ~0 correlation (r≈0.001) with *ranking position*; content quality, relevance, authority dominate.** Proximity still gates *appearance*, not rank. *(LocalFalcon whitepaper, May 2025 — 60K simulations, 4,423 businesses.)*
4. **Google ≈ 96% of restaurant review volume** — the dominant review/visibility channel. *(BlackBox Intelligence, 2025 — medium confidence.)*
5. **Casual-dining restaurants routinely exceed ~400 cumulative Google reviews; fast-casual averages <5 new/mo — review velocity is underinvested and high-impact.** *(BlackBox Intelligence, 2025.)*
6. **LEGOLAND draws families with kids ~2–12 (60+ attractions + SEA LIFE + Water Park), anchoring multi-day stays** — the primary summer tourist segment. *(LEGOLAND official.)*

**Live competitive recon (June 2026):** Heroes 4.7★ / 449 Yelp / ~672 aggregate (RestaurantGuru); Draft Republic ~1,678 Yelp; Park 101 "North County's game-day HQ." Heroes **absent** from Patch's "8 Best Places to Watch the Big Game in Carlsbad"; only a passing *beer* mention in the Carlsbad Village Super Bowl guide. *(Yelp, RestaurantGuru, Patch, carlsbad-village.com.)*

## Appendix B — Open Questions / Audit Items
- Exact **current Google review count + monthly velocity** for Heroes and each competitor (audit live).
- Which sources ChatGPT/Perplexity/Gemini actually cite for "best sports bar in Carlsbad" (run the monthly prompt check).
- Realistic CPMs/CPCs for Carlsbad restaurant geo-targeting (validate after first paid month).
- Seasonal visitor distribution (size the summer vs. football emphasis).

---

*Sources (deep-research, verified): NBC San Diego/10News, LEGOLAND.com, LocalFalcon, BlackBox Intelligence; competitive recon: Yelp, RestaurantGuru, Patch Carlsbad, carlsbad-village.com, Visit Carlsbad. Full claim-by-claim verification log retained from the research run.*
