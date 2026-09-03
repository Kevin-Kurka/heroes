import type { Menu, MenuGroup, MenuItem } from '@/types';
import { copyForName, shouldReplaceDescription } from './menu-copy';
import {
  CALAMARI,
  CHILAQUILES,
  CRUNCHWRAPS,
  HOGZILLA,
  OREO_CHURROS,
  SPICY_CHICKEN,
} from './menu-specials';

export { CALAMARI, CHILAQUILES, CRUNCHWRAPS, HOGZILLA, OREO_CHURROS, SPICY_CHICKEN };
export { HOME_SPECIALS } from './menu-specials';

/**
 * Honest plate photos only. Keys are normalized item/group names
 * (lowercase, punctuation stripped). Never map a lying slug — if the photo
 * does not show that dish, leave the card text-only.
 */
export const MENU_PHOTO_PATHS: Record<string, string> = {
  calamari: '/images/polished/calamari.jpg',
  'spicy chicken': '/images/polished/spicy-chicken.jpg',
  'cheeseburger crunchwrap': '/images/polished/burger-wrap.jpg',
  'burger wrap': '/images/polished/burger-wrap.jpg',
  hoboken: '/images/polished/hoboken-sandwich.jpg',
  'hoboken italian': '/images/polished/hoboken-sandwich.jpg',
  nachos: '/images/polished/chicken-nachos.jpg',
  minneapolis: '/images/polished/minneapolis-juicy-lucy.jpg',
  'minneapolis juicy lucy': '/images/polished/minneapolis-juicy-lucy.jpg',
  'juicy lucy': '/images/polished/minneapolis-juicy-lucy.jpg',
  'philly cheesesteak': '/images/polished/philly-billy-sandwich.jpg',
  'philly cheesesteak philly billy': '/images/polished/philly-billy-sandwich.jpg',
  'philly billy': '/images/polished/philly-billy-sandwich.jpg',
  pasadena: '/images/polished/pasadena-burger.jpg',
  'pasadena the og cheeseburger': '/images/polished/pasadena-burger.jpg',
  'friar frank': '/images/polished/friar-frank.jpg',
  'village tacos': '/images/polished/village-tacos.jpg',
  sliders: '/images/polished/kalua-pork-sliders.jpg',
  'kalua pork sliders': '/images/polished/kalua-pork-sliders.jpg',
  wings: '/images/polished/buffalo-wings.jpg',
  'pretzel bites': '/images/polished/pretzel-bites.jpg',
  'mac cheese': '/images/polished/mac-and-cheese.jpg',
  carlsbad: '/images/polished/carlsbad-sandwich.jpg',
  'carlsbad blt': '/images/polished/carlsbad-sandwich.jpg',
  manhattan: '/images/polished/manhattan-sandwich.jpg',
  'manhattan reuben': '/images/polished/manhattan-sandwich.jpg',
  antipasto: '/images/polished/antipasto-salad.jpg',
  'homemade key lime pie': '/images/polished/key-lime-pie.jpg',
  'key lime pie': '/images/polished/key-lime-pie.jpg',
  draft: '/images/polished/beer.jpg',
  cocktails: '/images/polished/cocktails.jpg',
  // TODO: commit Kevin's attached 800x450 kitchen JPEG as public/images/polished/oreo-churros.jpg
  // (attachment bytes were not available to this agent — do not invent a substitute plate).
  'oreo churros': '/images/polished/oreo-churros.jpg',
  'oreo churro': '/images/polished/oreo-churros.jpg',
};

/**
 * Quarantined / mislabeled assets. These names must never receive a photo,
 * even if a similarly named file exists in public/images/polished/.
 */
export const BLOCKED_PHOTO_KEYS = [
  'margaritas',
  'san diego',
  'san diego california burrito',
  'fried pickles',
  'hummus plate',
  'mozzarella sticks',
  'jalapeno poppers',
  'corn dogs',
  'cobb',
  'cobb salad',
  'house salad',
  'los angeles',
  'los angeles french dip',
  'sliders turkey',
  'loaded waffle fries',
  'cheesesteak fries',
  'cheesesteak',
  'event promo',
] as const;

/** Injected kitchen-board specials. Calamari stays on Munchies. */
export const KITCHEN_SPECIALS = [
  { ...CALAMARI, place: 'munchies' as const },
  { ...HOGZILLA, place: 'kitchen-specials' as const },
  { ...CRUNCHWRAPS, place: 'kitchen-specials' as const },
] as const;

const WEEKLY_SPECIALS_RE = /^(specials|daily specials|daily lineup)$/i;
const LEGACY_WRAP_KEYS = new Set([
  'burger wrap',
  'cheeseburger crunchwrap',
  'carnitas crunchwrap',
  'carne asada crunchwrap',
]);

export function photoKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function photoForName(name: string): string | undefined {
  const key = photoKey(name);
  if (!key) return undefined;
  if ((BLOCKED_PHOTO_KEYS as readonly string[]).includes(key)) return undefined;
  return MENU_PHOTO_PATHS[key];
}

function cloneMenus(menus: Menu[]): Menu[] {
  return JSON.parse(JSON.stringify(menus)) as Menu[];
}

function walkGroups(groups: MenuGroup[], visit: (g: MenuGroup, parent?: MenuGroup) => void, parent?: MenuGroup) {
  for (const g of groups) {
    visit(g, parent);
    if (g.subGroups?.length) walkGroups(g.subGroups, visit, g);
  }
}

function allItems(groups: MenuGroup[]): MenuItem[] {
  const items: MenuItem[] = [];
  walkGroups(groups, (g) => items.push(...g.items));
  return items;
}

function hasNamedItem(groups: MenuGroup[], name: string): boolean {
  const key = photoKey(name);
  return allItems(groups).some((item) => photoKey(item.name) === key);
}

function findGroup(groups: MenuGroup[], pred: (g: MenuGroup) => boolean): MenuGroup | undefined {
  let found: MenuGroup | undefined;
  walkGroups(groups, (g) => {
    if (!found && pred(g)) found = g;
  });
  return found;
}

function applyDescriptions(groups: MenuGroup[]) {
  walkGroups(groups, (group, parent) => {
    if (WEEKLY_SPECIALS_RE.test(group.name) || (parent && WEEKLY_SPECIALS_RE.test(parent.name))) {
      return;
    }

    const groupCopy = copyForName(group.name);
    if (groupCopy) group.description = groupCopy;

    for (const item of group.items) {
      if (!shouldReplaceDescription(item.name, item.description)) continue;
      const copy = copyForName(item.name, group.name);
      if (copy) item.description = copy;
    }
  });
}

/** Public /menu is text-only. Allowlisted paths stay in MENU_PHOTO_PATHS for later use. */
function stripPublicPhotos(groups: MenuGroup[]) {
  walkGroups(groups, (group) => {
    delete group.imageUrl;
    for (const item of group.items) delete item.imageUrl;
  });
}

function asItem(special: { id: string; name: string; description: string }): MenuItem {
  return { id: special.id, name: special.name, description: special.description };
}

function ensureCalamari(groups: MenuGroup[]) {
  if (hasNamedItem(groups, CALAMARI.name)) return;
  const munchies = findGroup(groups, (g) => /munchies/i.test(g.name));
  const starting = findGroup(groups, (g) => /^(starting|starters)$/i.test(g.name));
  const target = munchies ?? starting;
  if (target) {
    target.items = [asItem(CALAMARI), ...target.items];
  } else if (groups[0]) {
    groups[0].items = [asItem(CALAMARI), ...groups[0].items];
  }
}

function ensureKitchenSpecialsGroup(groups: MenuGroup[]): MenuGroup {
  let specials = findGroup(groups, (g) => /kitchen specials/i.test(g.name));
  if (specials) return specials;

  specials = {
    id: 'mains-kitchen-specials',
    name: 'Kitchen Specials',
    displayMode: 'variants',
    items: [],
  };
  const mains = findGroup(groups, (g) => /^(mains?)$/i.test(g.name));
  if (mains) {
    mains.subGroups = [specials, ...(mains.subGroups ?? [])];
    if (!mains.displayMode) mains.displayMode = 'starters';
  } else {
    const weeklyIdx = groups.findIndex((g) => WEEKLY_SPECIALS_RE.test(g.name));
    if (weeklyIdx >= 0) groups.splice(weeklyIdx, 0, specials);
    else groups.push(specials);
  }
  return specials;
}

function ensureHeroSandwichesGroup(groups: MenuGroup[]): MenuGroup {
  let heroes = findGroup(groups, (g) => /hero sandwiches/i.test(g.name));
  if (heroes) return heroes;

  heroes = {
    id: 'mains-hero-sandwiches',
    name: 'Hero Sandwiches',
    displayMode: 'variants',
    items: [],
  };
  const mains = findGroup(groups, (g) => /^(mains?)$/i.test(g.name));
  if (mains) {
    const subs = mains.subGroups ?? [];
    const kitchenIdx = subs.findIndex((g) => /kitchen specials/i.test(g.name));
    mains.subGroups = kitchenIdx >= 0
      ? [...subs.slice(0, kitchenIdx + 1), heroes, ...subs.slice(kitchenIdx + 1)]
      : [heroes, ...subs];
    if (!mains.displayMode) mains.displayMode = 'starters';
  } else {
    groups.push(heroes);
  }
  return heroes;
}

/** Kitchen Specials = Hogzilla + Crunchwraps only. */
function ensureKitchenSpecials(groups: MenuGroup[]) {
  ensureCalamari(groups);
  const specials = ensureKitchenSpecialsGroup(groups);
  const keep = new Set([photoKey(HOGZILLA.name), photoKey(CRUNCHWRAPS.name)]);

  specials.items = specials.items.filter((item) => keep.has(photoKey(item.name)));

  if (!specials.items.some((item) => photoKey(item.name) === photoKey(HOGZILLA.name))) {
    specials.items.push(asItem(HOGZILLA));
  }
  if (!specials.items.some((item) => photoKey(item.name) === photoKey(CRUNCHWRAPS.name))) {
    specials.items.push(asItem(CRUNCHWRAPS));
  }

  specials.items = [HOGZILLA, CRUNCHWRAPS]
    .map((wanted) => specials.items.find((item) => photoKey(item.name) === photoKey(wanted.name)))
    .filter((item): item is MenuItem => Boolean(item))
    .map((item) => {
      if (photoKey(item.name) === photoKey(HOGZILLA.name)) {
        return { ...item, name: HOGZILLA.name, description: item.description?.trim() || HOGZILLA.description };
      }
      return {
        ...item,
        name: CRUNCHWRAPS.name,
        description: item.description?.trim() || CRUNCHWRAPS.description,
      };
    });
}

function takeNamedItem(groups: MenuGroup[], name: string): MenuItem | undefined {
  const key = photoKey(name);
  let taken: MenuItem | undefined;
  walkGroups(groups, (group) => {
    const idx = group.items.findIndex((item) => photoKey(item.name) === key);
    if (idx >= 0 && !taken) {
      [taken] = group.items.splice(idx, 1);
    }
  });
  return taken;
}

/** Spicy Chicken lives under Hero Sandwiches — never duplicated. */
function ensureSpicyChickenOnHeroes(groups: MenuGroup[]) {
  const existing = takeNamedItem(groups, SPICY_CHICKEN.name);
  const heroes = ensureHeroSandwichesGroup(groups);
  if (heroes.items.some((item) => photoKey(item.name) === photoKey(SPICY_CHICKEN.name))) return;
  heroes.items.push(
    existing
      ? { ...existing, name: SPICY_CHICKEN.name, description: existing.description?.trim() || SPICY_CHICKEN.description }
      : asItem(SPICY_CHICKEN),
  );
}

function isLegacyCrunchSection(name: string): boolean {
  return /^(crunch\s*wraps?|burger wraps?)$/i.test(name.trim());
}

/** Drop the old Mains Crunch Wraps section and leftover wrap SKUs. */
function retireLegacyCrunchWraps(groups: MenuGroup[]) {
  const strip = (list: MenuGroup[]): MenuGroup[] =>
    list
      .filter((group) => !isLegacyCrunchSection(group.name))
      .map((group) => {
        group.items = group.items.filter((item) => !LEGACY_WRAP_KEYS.has(photoKey(item.name)));
        if (group.subGroups?.length) group.subGroups = strip(group.subGroups);
        return group;
      });

  const next = strip(groups);
  groups.splice(0, groups.length, ...next);
}

function ensureBrunchGroup(groups: MenuGroup[]): MenuGroup {
  walkGroups(groups, (group) => {
    if (/^breakfast$/i.test(group.name)) group.name = 'Brunch';
    if (group.id === 'breakfast') group.id = 'brunch';
  });

  let brunch = findGroup(groups, (g) => /^(brunch|breakfast)$/i.test(g.name));
  if (brunch) {
    brunch.name = 'Brunch';
    if (brunch.id === 'breakfast') brunch.id = 'brunch';
    return brunch;
  }

  brunch = {
    id: 'brunch',
    name: 'Brunch',
    displayMode: 'starters',
    items: [],
    subGroups: [],
  };
  const drinksIdx = groups.findIndex((g) => /^(drinks|specials)$/i.test(g.name));
  if (drinksIdx >= 0) groups.splice(drinksIdx, 0, brunch);
  else groups.push(brunch);
  return brunch;
}

function ensureChilaquiles(groups: MenuGroup[]) {
  const brunch = ensureBrunchGroup(groups);
  if (hasNamedItem(groups, CHILAQUILES.name)) return;

  let specials = brunch.subGroups?.find((g) => /brunch specials/i.test(g.name));
  if (!specials) {
    specials = {
      id: 'brunch-specials',
      name: 'Brunch Specials',
      displayMode: 'variants',
      items: [],
    };
    brunch.subGroups = [specials, ...(brunch.subGroups ?? [])];
    brunch.displayMode = 'starters';
  }
  specials.items = [asItem(CHILAQUILES), ...specials.items];
}

function ensureOreoChurros(groups: MenuGroup[]) {
  if (hasNamedItem(groups, OREO_CHURROS.name)) return;
  let sweets = findGroup(groups, (g) => /^(sweets?|sweet stuff)$/i.test(g.name));
  if (!sweets) {
    sweets = { id: 'sweets', name: 'Sweets', items: [] };
    const weeklyIdx = groups.findIndex((g) => WEEKLY_SPECIALS_RE.test(g.name));
    if (weeklyIdx >= 0) groups.splice(weeklyIdx, 0, sweets);
    else groups.push(sweets);
  }
  sweets.items = [
    ...sweets.items,
    { id: OREO_CHURROS.id, name: OREO_CHURROS.name, description: OREO_CHURROS.description },
  ];
}

/** Kitchen specials, brunch rename, recipe copy. Public /menu stays text-only. */
export function applyMenuPresentation(menus: Menu[]): Menu[] {
  const next = cloneMenus(menus);
  for (const menu of next) {
    retireLegacyCrunchWraps(menu.groups);
    ensureSpicyChickenOnHeroes(menu.groups);
    ensureKitchenSpecials(menu.groups);
    ensureChilaquiles(menu.groups);
    ensureOreoChurros(menu.groups);
    applyDescriptions(menu.groups);
    stripPublicPhotos(menu.groups);
  }
  return next;
}
