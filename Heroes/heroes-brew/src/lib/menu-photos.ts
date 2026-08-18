import type { Menu, MenuGroup, MenuItem } from '@/types';

/**
 * Honest plate photos only. Keys are normalized item/group names
 * (lowercase, punctuation stripped). Never map a lying slug — if the photo
 * does not show that dish, leave the card text-only.
 */
export const MENU_PHOTO_PATHS: Record<string, string> = {
  calamari: '/images/polished/calamari.jpg',
  'spicy chicken': '/images/polished/spicy-chicken.jpg',
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

export const KITCHEN_SPECIALS = [
  {
    id: 'starting-munchies-calamari',
    name: 'Calamari',
    description: 'Rings & tentacles, marinara + house aioli.',
    place: 'munchies' as const,
  },
  {
    id: 'mains-kitchen-specials-spicy-chicken',
    name: 'Spicy Chicken',
    description: 'Crispy chicken, bacon, melted jack.',
    place: 'kitchen-specials' as const,
  },
  {
    id: 'mains-kitchen-specials-burger-wrap',
    name: 'Burger Wrap',
    description: 'Pressed tortilla, beef, cheese.',
    place: 'kitchen-specials' as const,
  },
] as const;

const WEEKLY_SPECIALS_RE = /^(specials|daily specials|daily lineup)$/i;

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

function applyPhotos(groups: MenuGroup[]) {
  walkGroups(groups, (group, parent) => {
    // Weekly deal cards are copy, not dishes — don't attach food photos by name collision.
    if (WEEKLY_SPECIALS_RE.test(group.name) || (parent && WEEKLY_SPECIALS_RE.test(parent.name))) {
      return;
    }
    for (const item of group.items) {
      const src = photoForName(item.name);
      if (src) item.imageUrl = src;
    }
    const groupSrc = photoForName(group.name);
    if (groupSrc) {
      group.imageUrl = groupSrc;
    } else if (group.items.length === 1 && group.items[0].imageUrl) {
      group.imageUrl = group.items[0].imageUrl;
    }
  });
}

function ensureKitchenSpecials(groups: MenuGroup[]) {
  const calamari = KITCHEN_SPECIALS[0];
  if (!hasNamedItem(groups, calamari.name)) {
    const munchies = findGroup(groups, (g) => /munchies/i.test(g.name));
    const starting = findGroup(groups, (g) => /^(starting|starters)$/i.test(g.name));
    const target = munchies ?? starting;
    if (target) {
      target.items = [
        { id: calamari.id, name: calamari.name, description: calamari.description },
        ...target.items,
      ];
    } else if (groups[0]) {
      groups[0].items = [
        { id: calamari.id, name: calamari.name, description: calamari.description },
        ...groups[0].items,
      ];
    }
  }

  const mains = findGroup(groups, (g) => /^(mains?)$/i.test(g.name));
  const needed = KITCHEN_SPECIALS.filter((s) => s.place === 'kitchen-specials' && !hasNamedItem(groups, s.name));
  if (!needed.length) return;

  const newItems: MenuItem[] = needed.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
  }));

  let specials = findGroup(groups, (g) => /kitchen specials/i.test(g.name));
  if (!specials) {
    specials = {
      id: 'mains-kitchen-specials',
      name: 'Kitchen Specials',
      displayMode: 'variants',
      items: [],
    };
    if (mains) {
      mains.subGroups = [specials, ...(mains.subGroups ?? [])];
      if (!mains.displayMode) mains.displayMode = 'starters';
    } else {
      const weeklyIdx = groups.findIndex((g) => WEEKLY_SPECIALS_RE.test(g.name));
      if (weeklyIdx >= 0) groups.splice(weeklyIdx, 0, specials);
      else groups.push(specials);
    }
  }
  specials.items = [...specials.items, ...newItems];
}

/** Attach honest photos and the three live kitchen specials. Used by the public /menu. */
export function applyMenuPresentation(menus: Menu[]): Menu[] {
  const next = cloneMenus(menus);
  for (const menu of next) {
    ensureKitchenSpecials(menu.groups);
    applyPhotos(menu.groups);
  }
  return next;
}
