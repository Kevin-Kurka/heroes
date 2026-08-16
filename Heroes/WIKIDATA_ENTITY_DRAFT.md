# Wikidata Entity Draft — American Heroes & Brew

A Wikidata item feeds Google's Knowledge Graph and is read by LLMs during training/retrieval — it helps AI engines be *certain which business you are*, a prerequisite for confidently recommending you (entity authority — `AI_DOMINANCE_PLAYBOOK.md` WS4).

**Honest caveat:** Wikidata accepts items that are "clearly identifiable with serious, publicly available references." A real business with a website + multiple directory listings generally qualifies, but some editors are strict about local businesses — there's a modest risk of a deletion nomination. Mitigate by including the references below. The higher-certainty entity play (already done) is the consistent NAP + on-site Restaurant schema + the Knowledge Panel; Wikidata is additive.

**To create it:** sign in at wikidata.org → "Create a new Item" → set the label/description/aliases → add the statements below (each with a reference). Or paste the QuickStatements block at the bottom into https://quickstatements.toolforge.org (fastest).

---

## Item content

- **Label (en):** American Heroes & Brew
- **Description (en):** family-friendly sports bar and restaurant in Carlsbad, California
- **Also known as (aliases):** American Heroes and Brew; AHB; American Heroes Brew

## Statements (property → value → reference)

| Property | Value | Notes / reference |
|---|---|---|
| **instance of** (P31) | restaurant (Q11707) | also add sports bar / bar (Q327333 "bar") if desired |
| **country** (P17) | United States (Q30) | |
| **located in administrative territorial entity** (P131) | Carlsbad, California (Q108101 — *verify the Q-id on Wikidata*) | |
| **coordinate location** (P625) | 33.1592675, -117.3502525 | from the business record |
| **located on street** (P669) / **street address** | 300 Carlsbad Village Drive, Suite 120 | |
| **postal code** (P281) | 92008 | |
| **official website** (P856) | https://americanheroesandbrew.com | ref: the site itself |
| **phone number** (P1329) | +1-760-994-0187 | |
| **Instagram username** (P2003) | americanheroesandbrew | https://instagram.com/americanheroesandbrew |
| **cuisine** (P2012) | American cuisine (Q188101) | burgers, sandwiches, cheesesteaks, breakfast |
| **Yelp ID** (P12054) | american-heroes-and-brew-carlsbad | https://www.yelp.com/biz/american-heroes-and-brew-carlsbad |

**Suggested references** (attach to key statements; Wikidata likes ≥1 serious source):
- Official site: https://americanheroesandbrew.com
- Visit Carlsbad directory listing (visitcarlsbad.com)
- Carlsbad Village coverage: carlsbad-village.com
- Yelp / TripAdvisor / Google Maps listings

## QuickStatements (paste into quickstatements.toolforge.org after creating the item; replace `LAST` if not auto-creating)

```
CREATE
LAST	Len	"American Heroes & Brew"
LAST	Den	"family-friendly sports bar and restaurant in Carlsbad, California"
LAST	Aen	"American Heroes and Brew"
LAST	Aen	"AHB"
LAST	P31	Q11707
LAST	P17	Q30
LAST	P625	@33.1592675/-117.3502525
LAST	P856	"https://americanheroesandbrew.com"
LAST	P1329	"+1-760-994-0187"
LAST	P2003	"americanheroesandbrew"
LAST	P2012	Q188101
LAST	P12054	"american-heroes-and-brew-carlsbad"
```

> After it's live, add the new item's Q-id to the website's Restaurant schema `sameAs` (in `structured-data.ts`) and reference it from Google Business Profile where possible, closing the entity loop.
