# Menu Photo Library — Mismatch Audit

**Date:** 2026-06-23 · Method: perceptual-hash sweep (cross-item duplicate + decor/mural detection) across all 71 base images + visual verification of all 24 item primaries (`-pro.jpg`).

## Summary
- **71 base images** scanned across 24 menu-item folders (`public/promos-video/menu/<item>/`).
- **Cross-item duplicates: NONE** — no photo is reused for two different dishes. ✅
- **22 of 24 items: correct** — primary photo matches the dish. ✅
- **2 items fully mislabeled** (no correct photo exists in the library) — details below.

## ❌ Mislabeled items (need real replacement photos)
| Item folder | What the photos actually are | Files affected |
|---|---|---|
| `san-diego-california-burrito` | The **"HERO UP" wall mural** (decor), not a burrito | `…-1.jpg`, `…-pro.jpg` (both) |
| `margarita` | A glass of **white wine**, not a margarita | `…-1.jpg`, `…-pro.jpg` (both) |

**Impact:** low/latent today (nothing auto-posts these), but if either item is ever used for a promo or menu render it would show the wrong image. They were correctly **excluded/relabeled** in the GBP photo batches, so nothing wrong was published to the live listing.

**Fix:** supply a real photo of (1) the San Diego / California burrito and (2) a margarita. Drop them in the respective folders (or hand them over) and they'll be enhanced + metadata-stamped + added to GBP. Until then, do **not** use these two items' `-pro.jpg` for any post.

## ✅ Verified-correct items (22)
antipasto, beer, carlsbad-blt-plus, cocktails, friar-frank, hoboken-italian, house-salad, key-lime-pie, loaded-fries, mac-and-cheese, manhattan-reuben, maui-kalua-pork, minneapolis-juicy-lucy, nachos, pasadena-og-cheeseburger, philly-billy-cheesesteak, pretzel-bites, sangria, sliders-kalua-pork, tombstone-cowboy, village-tacos, wings.

## Notes
- Secondary originals (`-2`, `-03`, etc.) were hash-checked (no cross-item dupes/decor) but not all individually eyeballed; the representative `-pro` of every item was visually verified.
- Re-run anytime: `node scripts/library-mismatch-sweep.mjs`.
