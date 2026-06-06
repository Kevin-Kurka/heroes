# Live Menu — Google Sheet Sync

The menu can be driven by a **Google Sheet** so anyone you share the sheet with
(with edit access) can update the live website menu — no code, no deploy.

## How it works

- `/menu` and `/menu/printable` fetch a published CSV of the sheet at request time
  (ISR, revalidated hourly), parse it, and render it.
- If `MENU_SHEET_CSV_URL` is unset or the fetch fails, the site falls back to the
  bundled static menu in `src/lib/menu.ts` — so the site never breaks.
- Parsing lives in `src/lib/menu-sheet.ts` (`resolveMenus()`), the inverse of the
  CSV the `/menu/printable` **Download → CSV** button produces.

## Sheet columns

| Column | Meaning |
|--------|---------|
| **Tab** | Menu tab (Starters, Burgers, Drinks, …) |
| **Section** | Sub-group within a tab (e.g. Starters → *Sliders*). Leave blank for items directly under a tab. |
| **Item** | Item name. Fill this row's Price/Description; leave Option columns blank. |
| **Price** | Item price (number only, e.g. `18`). |
| **Description** | Item description. |
| **Option Group** | For an option row: the group label — a choice name (*Select*, *Drink*), `Add`/`Sides` for paid add-ons, or `Mod` for mods. |
| **Option** | The option name (leave Item blank on these rows). |
| **Option Price** | `+3`, `5`, etc. for paid add-ons/mods. Leave blank for free choices. |

Rules the parser applies per item group:
- Items that all share one price **and** have options → render as a variant card with a base price.
- An option group with **no** prices → a free choice list (e.g. pick a side).
- An option group **with** prices → paid add-ons; `Mod`-labelled → mods.

## One-time setup (owner)

The live sheet already exists, seeded with the current menu:

**American Heroes & Brew — Live Menu**
`https://docs.google.com/spreadsheets/d/1g0O_KjjbmMZ0NxkJ6-VQnXoz6u9tG73e55t4naxb4XI/edit`

1. **Let the website read it.** In the sheet: **File → Share → Publish to web →**
   choose the sheet, format **Comma-separated values (.csv)**, **Publish**. Copy the
   `…/pub?output=csv` URL.
   *(Alternative: Share → General access → "Anyone with the link: Viewer", then use*
   `https://docs.google.com/spreadsheets/d/1g0O_KjjbmMZ0NxkJ6-VQnXoz6u9tG73e55t4naxb4XI/gviz/tq?tqx=out:csv`.)*
2. **Point the site at it.** In Vercel → Project → Settings → Environment Variables,
   add `MENU_SHEET_CSV_URL` = the URL from step 1. Redeploy (or wait for the hourly
   revalidate).
3. **Let staff edit it.** In the sheet: **Share** → add the people who should be able
   to update the menu as **Editor**. Their edits go live within ~an hour (publish
   cache + ISR).

## Editing the menu

Just edit cells in the sheet — change a price, rename an item, add a row for a new
item (fill Tab/Section/Item/Price), or add option rows. Keep the header row intact.
To reset the sheet from the current site menu, use **/menu/printable → Download →
CSV** and paste it in.
