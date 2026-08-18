import 'server-only';
import { Menu, MenuGroup, MenuGroupAddOn, MenuGroupChoice, MenuItem } from '@/types';
import { getMenus } from './menu';
import { applyMenuPresentation } from './menu-photos';
import { SECRET_MENU_ITEMS } from './secret-menu';

/**
 * Google Sheet → live menu sync.
 *
 * The menu can be driven by a Google Sheet so anyone with edit access to the
 * sheet can update the live site. The sheet uses the same columns the printable
 * page exports:
 *
 *   Tab | Section | Item | Price | Description | Option Group | Option | Option Price
 *
 * Set `MENU_SHEET_CSV_URL` to the sheet's published / "anyone with link" CSV URL
 * and the menu pages will render from it (falling back to the bundled static menu
 * in src/lib/menu.ts whenever the URL is unset or the fetch fails).
 *
 * A tab named "Secret" / "Secret Menu" is treated specially: it is editable in the
 * sheet but NEVER surfaced on any public page — `resolveMenus()` strips it out, and
 * only `resolveSecretMenuItems()` (used by the gated /api/secret-menu route) reads
 * it. This module is `server-only` so secret items can never reach a client bundle.
 */

const SECRET_TAB_RE = /^secret(\s*menu)?$/i;
const isSecretTab = (name: string) => SECRET_TAB_RE.test(name.trim());
const flattenItems = (g: MenuGroup): MenuItem[] => [
  ...g.items,
  ...(g.subGroups?.flatMap(flattenItems) ?? []),
];

const SHEET_REVALIDATE_SECONDS = 60;

/** Minimal RFC-4180 CSV parser (handles quotes, escaped quotes, CRLF). */
export function parseCsv(text: string): string[][] {
  const s = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inQuotes) {
      if (ch === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') inQuotes = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else field += ch;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function slug(...parts: string[]): string {
  return (
    parts
      .join('-')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'x'
  );
}

function toPrice(raw: string): number {
  const n = Number(raw.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

interface Leaf {
  items: MenuItem[];
  choiceOrder: string[];
  choices: Record<string, string[]>;
  addOns: MenuGroupAddOn[];
  addOnLabel?: string;
  mods: MenuGroupAddOn[];
}
interface TabAcc {
  name: string;
  sectionOrder: string[]; // '' = items directly under the tab
  sections: Record<string, Leaf>;
}

const newLeaf = (): Leaf => ({ items: [], choiceOrder: [], choices: {}, addOns: [], mods: [] });

/** Parse the exported CSV grid back into the app's Menu[] structure. */
export function parseMenuRows(rows: string[][]): Menu[] {
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name);
  const cTab = col('tab');
  const cSection = col('section');
  const cItem = col('item');
  const cPrice = col('price');
  const cDesc = col('description');
  const cGroup = col('option group');
  const cOption = col('option');
  const cOptPrice = col('option price');
  if (cTab < 0 || cItem < 0) return []; // unexpected schema — fall back to static

  const at = (r: string[], i: number) => (i >= 0 && i < r.length ? r[i].trim() : '');

  const tabs: TabAcc[] = [];
  const tabIndex = new Map<string, TabAcc>();
  const getTab = (name: string): TabAcc => {
    let t = tabIndex.get(name);
    if (!t) {
      t = { name, sectionOrder: [], sections: {} };
      tabIndex.set(name, t);
      tabs.push(t);
    }
    return t;
  };
  const getLeaf = (t: TabAcc, section: string): Leaf => {
    if (!(section in t.sections)) {
      t.sections[section] = newLeaf();
      t.sectionOrder.push(section);
    }
    return t.sections[section];
  };

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const tabName = at(r, cTab);
    if (!tabName) continue;
    const leaf = getLeaf(getTab(tabName), at(r, cSection));
    const item = at(r, cItem);
    const option = at(r, cOption);

    if (item) {
      leaf.items.push({
        id: '',
        name: item,
        description: at(r, cDesc) || undefined,
        price: toPrice(at(r, cPrice)),
      });
    } else if (option) {
      const group = at(r, cGroup) || 'Options';
      const optPrice = at(r, cOptPrice);
      if (optPrice) {
        if (/^mod/i.test(group)) leaf.mods.push({ name: option, price: optPrice });
        else {
          leaf.addOns.push({ name: option, price: optPrice });
          if (!leaf.addOnLabel) leaf.addOnLabel = group;
        }
      } else {
        if (!(group in leaf.choices)) { leaf.choices[group] = []; leaf.choiceOrder.push(group); }
        leaf.choices[group].push(option);
      }
    }
  }

  return [{ id: 'menu-live', name: 'Menu', groups: tabs.map(tabToGroup).filter((g) => g.items.length || g.subGroups?.length) }];
}

function leafToGroup(leaf: Leaf, id: string, name: string): MenuGroup {
  leaf.items.forEach((it, i) => { it.id = `${id}-i${i}`; });
  const choices: MenuGroupChoice[] = leaf.choiceOrder.map((label) => ({ label, options: leaf.choices[label] }));
  const samePrice = leaf.items.length > 0 && leaf.items.every((it) => it.price === leaf.items[0].price);
  const hasOptions = choices.length > 0 || leaf.addOns.length > 0;
  const group: MenuGroup = { id, name, items: leaf.items };
  if (choices.length) group.choices = choices;
  if (leaf.addOns.length) { group.addOns = leaf.addOns; group.addOnLabel = leaf.addOnLabel; }
  if (leaf.mods.length) group.mods = leaf.mods;
  // A shared base price + options renders as a variant card (pills + choices).
  if (samePrice && hasOptions) { group.basePrice = leaf.items[0].price; group.displayMode = 'variants'; }
  // VariantGroupCard renders single-item sections from the group header only
  // (it hides the item grid when items.length === 1), so hoist the lone item's
  // price and blurb onto the group or they never show on the page.
  if (leaf.items.length === 1) {
    if (group.basePrice == null) group.basePrice = leaf.items[0].price;
    if (leaf.items[0].description) group.description = leaf.items[0].description;
  }
  return group;
}

function tabToGroup(tab: TabAcc): MenuGroup {
  const sections = tab.sectionOrder.filter((s) => s !== '');
  const direct = tab.sections[''];
  const id = slug(tab.name);

  if (sections.length === 0) {
    // Tab holds items directly — render the leaf as the tab itself.
    const g = leafToGroup(direct ?? newLeaf(), id, tab.name);
    // A lone leaf with options needs variant mode to surface its choices.
    if ((g.choices?.length || g.addOns?.length) && !g.displayMode) g.displayMode = 'variants';
    return g;
  }

  // Tab has sections — render each as a card (starters layout).
  const subGroups: MenuGroup[] = sections.map((s) => {
    const sg = leafToGroup(tab.sections[s], slug(tab.name, s), s);
    sg.displayMode = 'variants';
    return sg;
  });
  const group: MenuGroup = { id, name: tab.name, items: [], subGroups, displayMode: 'starters' };
  if (direct && direct.addOns.length) { group.addOns = direct.addOns; group.addOnLabel = direct.addOnLabel; }
  return group;
}

/** Fetch + parse the menu from the configured Google Sheet CSV URL. */
export async function fetchMenusFromSheet(): Promise<Menu[] | null> {
  const url = process.env.MENU_SHEET_CSV_URL;
  if (!url) return null;
  try {
    const res = await fetch(url, { next: { revalidate: SHEET_REVALIDATE_SECONDS } });
    if (!res.ok) return null;
    const menus = parseMenuRows(parseCsv(await res.text()));
    return menus[0]?.groups.length ? menus : null;
  } catch {
    return null;
  }
}

/** Live PUBLIC menu — sheet when configured (minus the Secret tab), else static. */
export async function resolveMenus(): Promise<Menu[]> {
  const sheet = await fetchMenusFromSheet();
  if (!sheet) return applyMenuPresentation(getMenus());
  const groups = sheet[0].groups.filter((g) => !isSecretTab(g.name));
  return applyMenuPresentation([{ ...sheet[0], groups }]);
}

/**
 * Secret-menu items from the sheet's "Secret"/"Secret Menu" tab (server-only,
 * used by the gated /api/secret-menu route). Falls back to the static list.
 */
export async function resolveSecretMenuItems(): Promise<MenuItem[]> {
  const sheet = await fetchMenusFromSheet();
  const items = (sheet?.[0]?.groups ?? []).filter((g) => isSecretTab(g.name)).flatMap(flattenItems);
  return items.length ? items : SECRET_MENU_ITEMS;
}
