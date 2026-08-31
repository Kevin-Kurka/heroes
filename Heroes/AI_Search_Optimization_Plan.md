# American Heroes & Brew — AI Search Optimization

_Goal: when someone asks ChatGPT, Perplexity, Gemini/Google AI Overviews, Siri, or Copilot for the "best sports bar / food near me in Carlsbad," American Heroes & Brew gets named._

How AI assistants answer "best near me": ~70% from **off-site signals** (Google Business Profile, review volume + rating, Yelp/TripAdvisor/Apple Maps, "best of Carlsbad" articles) and ~30% from **on-site structured content**. We've now built the on-site half; the off-site half is where the real ranking is won.

---

## ✅ Done — On-site (live at americanheroesandbrew.com)

- **FAQPage schema + visible FAQ** (8 Q&As) — AI engines lift these directly to answer questions about hours, games shown, breakfast, kid-friendliness, specials.
- **Menu schema** — 123 menu items + prices marked up so AI can cite specific dishes.
- **About / local-context block** — names Carlsbad Village, Carlsbad State Beach, North County San Diego, I-5 (the "near me" geography).
- **`/llms.txt`** — a plain-text brief AI crawlers read (facts, hours, menu, FAQ, links).
- **robots.txt** — explicitly welcomes GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot, Bingbot, CCBot, etc.
- **`/review`** — one-tap Google review link (see below).
- (Already had: Restaurant schema with NAP/hours/geo, sitemap, GSC verified, GA4.)

> ⚠️ We deliberately did **not** add a self-rated star score to the site — Google prohibits self-serving `aggregateRating` for restaurants and it can trigger a penalty. Real stars come from Google reviews ↓.

---

## 🎯 Off-site — the real lever (your action; I can drive the dashboards)

### 1. Reviews — the single biggest factor (you have ~3; you need volume)

With only a few reviews (and one 1-star), no AI will call you "the best." Target: **steady flow of genuine 5-star Google reviews.** A realistic first goal is 50+.

**Tools now live:**
- **One-tap review link:** `https://americanheroesandbrew.com/review` → opens the Google review box.
  - _Tap-test it once on your phone (signed into Google). If it doesn't open the review box, grab the exact link from Business Profile → "Get more reviews" and I'll swap it in._
- **Make a QR code** of that link (any free generator) → print on:
  - Table tents / "Loved it? Scan to review" cards
  - Bottom of receipts
  - A small sign at the register

**Staff ask-script (works better than any sign):**
> "If you had a good time, it would mean a lot if you scanned this and left us a quick review — it really helps a small local spot like us."
Ask at the moment of a compliment or a clean plate. Train every server to ask one table a shift.

**Reply to every review** (you already do this well — keep it up):
- _5-star, no text:_ "Thanks [name] — we appreciate you! See you for the next game. 🍻"
- _Detailed praise:_ thank them and name the thing they liked ("glad you loved the wings").
- _Negative (e.g. the 1-star):_ stay calm, brief, public: "Sorry your visit missed the mark — we'd like to make it right. Please reach us at (760) 994-0187." (Replying well turns bad reviews into trust signals.)

### 2. Directory listings — AI pulls from these (I can drive these with you)

Claim + fully complete, with **identical NAP** (below):
- **Yelp** — heavily cited by ChatGPT & Perplexity for "best near me." (biz.yelp.com)
- **Apple Business Connect** — Siri / Apple Maps / Apple Intelligence. (businessconnect.apple.com)
- **TripAdvisor** — strong for visitors/tourists in Carlsbad.
- Nice-to-have: Foursquare, OpenTable/Toast listing, Nextdoor.
- _(Skipped Bing Places per your call.)_

### 3. Local citations / PR — the pages AI trusts most

Getting named in third-party "best of" content is gold:
- Pitch local roundups: "Best sports bars in Carlsbad," "Where to watch the game in North County San Diego," Carlsbad Village guides, Visit Carlsbad, local blogs/IG food accounts.
- Offer them a hook: 16 TVs, weekend breakfast, family-friendly, daily specials, Carlsbad Village location.

---

## NAP — paste this **identically** everywhere (consistency = trust)

```
Name:     American Heroes & Brew
Address:  300 Carlsbad Village Drive, Suite 120, Carlsbad, CA 92008
Phone:    (760) 994-0187
Website:  https://americanheroesandbrew.com
Category: Sports bar (primary); Restaurant; Sandwich shop; American restaurant
Hours:    Mon–Thu 11am–10pm · Fri 9am–12am · Sat 9am–12am · Sun 9am–10pm
```

**Short description (for directories):**
> American Heroes & Brew is a family-friendly sports bar and restaurant in the heart of Carlsbad Village, North County San Diego. All-American food — burgers, signature wings, loaded fries, cheesesteaks, and weekend breakfast — plus a full bar, craft beer, and 16 TVs showing every game from the NFL and NBA to college football and UFC.

---

## Outreach blurb (for press / "best of" pitches)

> Subject: Carlsbad sports bar for your "best of" roundup
>
> Hi [name] — American Heroes & Brew is a family-friendly sports bar in the heart of Carlsbad Village (300 Carlsbad Village Dr). We've got 16 TVs for every NFL/NBA/college/UFC matchup, a full all-American menu with weekend breakfast, and daily specials. We'd love to be considered for your [Carlsbad sports bars / where to watch the game] guide — happy to host you. Menu: americanheroesandbrew.com/menu

---

## Open follow-ups
- **GBP weekend hours** — Google auto-rejected the correction (new access). Retry ~June 10: Fri 10a–12a, Sat 8a–12a, Sun 8a–10p.
- **Tap-test `/review`** on your phone; swap in the g.page link if needed.
- **Yelp** — a page already exists and is **already claimed**. Log into the owning Yelp account (try Continue with Google with the business account); if it was claimed by a prior manager, use Yelp support to recover access. Then confirm NAP/hours.
- **Apple Business Connect** (businessconnect.apple.com) — sign in with Apple ID, then I can fill the listing. Powers Siri/Apple Maps.
- **TripAdvisor** (tripadvisor.com/Owners) — claim + confirm listing.
- _All three need your login first; once you're in, I can drive the forms._
