import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getMenus } from './menu';
import { getMenuJsonLd } from './structured-data';
import { SHOW_PRICES, stripPriceTokens } from './config';
import {
  applyMenuPresentation,
  BLOCKED_PHOTO_KEYS,
  CHILAQUILES,
  HOGZILLA,
  HOME_SPECIALS,
  KITCHEN_SPECIALS,
  MENU_PHOTO_PATHS,
  SPICY_CHICKEN,
  photoForName,
  photoKey,
} from './menu-photos';
import { copyForName } from './menu-copy';
import type { Menu, MenuItem } from '@/types';

const PUBLIC_ROOT = resolve(__dirname, '../../public');
const RECROPPED_PLATES = [
  'philly-billy-sandwich.jpg',
  'pasadena-burger.jpg',
  'manhattan-sandwich.jpg',
  'carlsbad-sandwich.jpg',
  'hoboken-sandwich.jpg',
  'minneapolis-juicy-lucy.jpg',
  'chicken-nachos.jpg',
  'friar-frank.jpg',
  'village-tacos.jpg',
  'kalua-pork-sliders.jpg',
  'buffalo-wings.jpg',
  'pretzel-bites.jpg',
  'mac-and-cheese.jpg',
  'antipasto-salad.jpg',
  'key-lime-pie.jpg',
  'calamari.jpg',
  'spicy-chicken.jpg',
  'burger-wrap.jpg',
  'cocktails.jpg',
] as const;

function jpegSize(filePath: string) {
  const buf = readFileSync(filePath);
  let offset = 2;
  while (offset < buf.length) {
    if (buf[offset] !== 0xff) break;
    const marker = buf[offset + 1];
    const length = buf.readUInt16BE(offset + 2);
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  throw new Error(`no JPEG size in ${filePath}`);
}

function flattenItems(menus: Menu[]) {
  const items: Array<{ group: string; item: MenuItem }> = [];
  const walk = (groups: Menu['groups']) => {
    for (const g of groups) {
      items.push(...g.items.map((item) => ({ group: g.name, item })));
      if (g.subGroups) walk(g.subGroups);
    }
  };
  for (const menu of menus) walk(menu.groups);
  return items;
}

const CRUNCHWRAP_RE = /crunch\s*-?\s*wraps?|burger\s*wraps?/i;

function crunchwrapHits(menus: Menu[]) {
  const hits: string[] = [];
  const walk = (groups: Menu['groups']) => {
    for (const g of groups) {
      if (CRUNCHWRAP_RE.test(g.name)) hits.push(`group:${g.name}`);
      for (const item of g.items) {
        if (CRUNCHWRAP_RE.test(item.name) || CRUNCHWRAP_RE.test(item.description ?? '')) {
          hits.push(`${g.name}/${item.name}`);
        }
      }
      if (g.subGroups) walk(g.subGroups);
    }
  };
  for (const menu of menus) walk(menu.groups);
  return hits;
}

describe('crunchwraps are off the menu', () => {
  it('never appear in the static menu source', () => {
    expect(crunchwrapHits(getMenus())).toEqual([]);
  });

  it('never appear in the presented public menu', () => {
    expect(crunchwrapHits(applyMenuPresentation(getMenus()))).toEqual([]);
  });

  it('are stripped when the live sheet still sends them', () => {
    const sheet: Menu[] = [{
      id: 'menu-live',
      name: 'Menu',
      groups: [
        {
          id: 'mains',
          name: 'Mains',
          displayMode: 'starters',
          items: [],
          subGroups: [
            {
              id: 'mains-kitchen-specials',
              name: 'Kitchen Specials',
              items: [
                { id: 'mains-kitchen-specials-hogzilla', name: 'Hogzilla', description: 'Pulled pork.' },
                { id: 'mains-kitchen-specials-crunchwraps', name: 'Crunchwraps', description: 'Golden, pressed wraps.' },
              ],
            },
            {
              id: 'mains-crunch-wraps',
              name: 'Crunch Wraps',
              items: [{ id: 'mains-crunch-wraps-chicken', name: 'Chicken Crunchwrap', description: 'Pressed.' }],
            },
          ],
        },
        {
          id: 'specials',
          name: 'Specials',
          items: [],
          subGroups: [
            {
              id: 'specials-kitchen',
              name: 'Kitchen',
              items: [
                { id: 'specials-kitchen-crunchwraps', name: 'Crunchwraps', description: 'Golden, pressed wraps.' },
                { id: 'specials-kitchen-crunch-wrap', name: 'Crunch Wrap', description: 'Pressed.' },
              ],
            },
          ],
        },
      ],
    }];
    const presented = applyMenuPresentation(sheet);
    expect(crunchwrapHits(presented)).toEqual([]);
    expect(flattenItems(presented).map(({ item }) => item.name)).toContain('Hogzilla');
  });

  it('are not on the homepage, in recipe copy, or in exported specials', () => {
    expect(HOME_SPECIALS.some((s) => CRUNCHWRAP_RE.test(s.name))).toBe(false);
    expect(KITCHEN_SPECIALS.some((s) => CRUNCHWRAP_RE.test(s.name))).toBe(false);
    expect(copyForName('Crunchwraps')).toBeUndefined();
    expect(photoForName('Cheeseburger Crunchwrap')).toBeUndefined();
    expect(photoForName('Burger Wrap')).toBeUndefined();
  });
});

describe('photo allowlist', () => {
  it('maps only honest dish names', () => {
    expect(photoForName('Calamari')).toBe('/images/polished/calamari.jpg');
    expect(photoForName('Spicy Chicken')).toBe('/images/polished/spicy-chicken.jpg');
    expect(photoForName('Cheeseburger Crunchwrap')).toBeUndefined();
    expect(photoForName('Burger Wrap')).toBeUndefined();
    expect(photoForName('Carnitas Crunchwrap')).toBeUndefined();
    expect(photoForName('Carne Asada Crunchwrap')).toBeUndefined();
    expect(photoForName('Hoboken (Italian)')).toBe('/images/polished/hoboken-sandwich.jpg');
    expect(photoForName('Minneapolis (Juicy Lucy)')).toBe('/images/polished/minneapolis-juicy-lucy.jpg');
    expect(photoForName('Philly Cheesesteak (Philly Billy)')).toBe('/images/polished/philly-billy-sandwich.jpg');
    expect(photoForName('Pasadena (The OG Cheeseburger)')).toBe('/images/polished/pasadena-burger.jpg');
    expect(photoForName('Village Tacos')).toBe('/images/polished/village-tacos.jpg');
    expect(photoForName('Pretzel Bites')).toBe('/images/polished/pretzel-bites.jpg');
    expect(photoForName('Mac & Cheese')).toBe('/images/polished/mac-and-cheese.jpg');
    expect(photoForName('Carlsbad (BLT+)')).toBe('/images/polished/carlsbad-sandwich.jpg');
    expect(photoForName('Manhattan (Reuben)')).toBe('/images/polished/manhattan-sandwich.jpg');
    expect(photoForName('Antipasto')).toBe('/images/polished/antipasto-salad.jpg');
    expect(photoForName('Wings')).toBe('/images/polished/buffalo-wings.jpg');
    expect(photoForName('Friar Frank')).toBe('/images/polished/friar-frank.jpg');
    expect(photoForName('Oreo Churros')).toBe('/images/polished/oreo-churros.jpg');
    expect(photoForName('Oreo Churro')).toBe('/images/polished/oreo-churros.jpg');
    expect(photoForName('Churros')).toBeUndefined();
    expect(photoForName('Churros with Vanilla Ice Cream')).toBeUndefined();
  });

  it('never assigns a photo to quarantined / lying slugs', () => {
    const blocked = [
      'Margaritas',
      'San Diego (California Burrito)',
      'Fried Pickles',
      'Hummus Plate',
      'Mozzarella Sticks',
      'Jalapeno Poppers',
      'Corn Dogs',
      'Cobb',
      'House Salad',
      'Los Angeles (French Dip)',
      'Loaded Waffle Fries',
      'Cheesesteak',
    ];
    for (const name of blocked) {
      expect(photoForName(name), name).toBeUndefined();
    }
    for (const key of BLOCKED_PHOTO_KEYS) {
      expect(photoForName(key), key).toBeUndefined();
    }
  });

  it('keeps allowlisted plates at the same filenames after the tight recrop', () => {
    const unique = [...new Set(Object.values(MENU_PHOTO_PATHS))];
    for (const rel of unique) {
      // TODO: drop this skip after Kevin's attached oreo-churros.jpg bytes are committed.
      if (rel.endsWith('/oreo-churros.jpg')) continue;
      expect(existsSync(resolve(PUBLIC_ROOT, rel.slice(1))), rel).toBe(true);
    }
    for (const name of RECROPPED_PLATES) {
      const file = resolve(PUBLIC_ROOT, 'images/polished', name);
      expect(existsSync(file), name).toBe(true);
      const { width, height } = jpegSize(file);
      expect(width, name).toBeLessThanOrEqual(800);
      expect(height, name).toBeLessThanOrEqual(450);
      expect([width, height], name).not.toEqual([1600, 900]);
      expect(width / height, name).toBeCloseTo(16 / 9, 1);
      expect(statSync(file).size, name).toBeLessThan(300 * 1024);
    }
    expect(jpegSize(resolve(PUBLIC_ROOT, 'images/polished/beer.jpg'))).toEqual({
      width: 360,
      height: 360,
    });
  });

  it('renders public menu cards as standardized text-only chrome', () => {
    const menuCard = readFileSync(resolve(__dirname, '../components/MenuCard.tsx'), 'utf8');
    const variant = readFileSync(resolve(__dirname, '../components/VariantGroupCard.tsx'), 'utf8');
    const menuPage = readFileSync(resolve(__dirname, '../app/menu/MenuPageClient.tsx'), 'utf8');
    expect(menuCard).toContain('bg-white/5');
    expect(menuCard).toContain('rounded-xl');
    expect(menuCard).toContain('text-foreground');
    expect(menuCard).toContain('text-muted');
    expect(menuCard).not.toMatch(/\bborder\b/);
    expect(menuCard).not.toContain('bg-card/70');
    expect(menuCard).not.toContain('DishBackdrop');
    expect(menuCard).not.toContain('next/image');
    expect(menuCard).not.toContain('imageUrl');
    expect(menuCard).not.toContain('from-black/');
    expect(menuCard).not.toContain('md:max-w-[400px]');
    expect(variant).toContain('bg-card/70');
    expect(variant).toContain('bg-card-elevated/60');
    expect(variant).toContain('border-white/[0.06]');
    expect(variant).toContain('bg-white/5');
    expect(variant).not.toContain('DishBackdrop');
    expect(variant).not.toContain('next/image');
    expect(variant).not.toContain('imageUrl');
    expect(menuPage).toContain('bg-card/70');
    expect(menuPage).toContain('bg-white/5');
  });

  it('does not attach plates to the public menu', () => {
    const presented = applyMenuPresentation(getMenus());
    const rows = flattenItems(presented);
    for (const { item, group } of rows) {
      expect(item.imageUrl, `${group}/${item.name}`).toBeUndefined();
    }
    for (const menu of presented) {
      const walk = (groups: typeof menu.groups) => {
        for (const g of groups) {
          expect(g.imageUrl, g.name).toBeUndefined();
          if (g.subGroups) walk(g.subGroups);
        }
      };
      walk(menu.groups);
    }
    expect(photoForName('Oreo Churros')).toBe('/images/polished/oreo-churros.jpg');
  });

  it('does not keep Cheesecake on the printed food menu', () => {
    const presented = applyMenuPresentation(getMenus());
    expect(presented[0].groups.find((g) => g.name === 'Sweets')).toBeUndefined();
    expect(flattenItems(presented).some(({ item }) => photoKey(item.name) === 'cheesecake')).toBe(false);
    expect(flattenItems(presented).some(({ item }) => photoKey(item.name) === 'oreo churros')).toBe(false);
    // Photo allowlist still maps Oreo Churros for matching leftover names; not on the printed menu.
    expect(photoForName('Oreo Churros')).toBe('/images/polished/oreo-churros.jpg');
    expect(photoForName('Churros')).toBeUndefined();
    expect(photoForName('Churros with Vanilla Ice Cream')).toBeUndefined();
  });
});

describe('kitchen recipe copy', () => {
  it('resolves guest lines for philly, nachos, pasadena, and hoboken', () => {
    expect(copyForName('Philly Cheesesteak (Philly Billy)')).toBe(
      'Classic Philly cheesesteak — thin-sliced ribeye on a toasted Amoroso roll, with your choice of white American, provolone, or Whiz.',
    );
    expect(copyForName('Philly Billy')).toBe(copyForName('Philadelphia'));
    expect(copyForName('Nachos')).toBe(
      'Crisp chips piled high with beans, guacamole, melted cheese, Cheez Whiz, cilantro-lime crema, pico, and jalapeños.',
    );
    expect(copyForName('Pasadena (The OG Cheeseburger)')).toBe(
      'A quarter-pound patty with shredded lettuce, tomato, pickle, red onion, AHB Hero sauce, and your choice of cheese on a toasted brioche bun.',
    );
    expect(copyForName('Hoboken (Italian)')).toBe(
      'Ham, salami, capicola, mortadella, and provolone with lettuce, tomato, red onion, oil, vinegar, and oregano on an Italian roll.',
    );
  });

  it('keeps sheet descriptions on matching dish names after presentation', () => {
    const presented = applyMenuPresentation(getMenus());
    const rows = flattenItems(presented);
    const byName = (name: string) => rows.find(({ item }) => photoKey(item.name) === photoKey(name))?.item;
    // Sheet sync owns guest copy — non-empty sheet descriptions are not overwritten.
    expect(byName('Philly Cheesesteak')?.description).toMatch(/Amoroso|ribeye|whiz/i);
    expect(byName('Nachos')).toBeUndefined();
    expect(byName('Pasadena')?.description).toMatch(/Hero sauce|cheeseburger|gourmet bun/i);
    expect(byName('Hoboken')?.description).toMatch(/capicola|salami|provolone/i);
    expect(byName('Carlsbad')?.description).toMatch(/BLT|avocado|bacon|chicken/i);
    expect(byName('Manhattan')?.description).toMatch(/Reuben|pastrami|sauerkraut|Swiss/i);
    expect(byName('Austin')?.description).toMatch(/jalape|whiz|Hero sauce/i);
    expect(byName('Nashville')?.description).toMatch(/fried chicken|bacon|jalape/i);
    expect(byName('Spicy Chicken')).toBeUndefined();
    expect(byName('Crunchwraps')).toBeUndefined();
    expect(byName('Chilaquiles')).toBeUndefined();
    expect(byName('Hogzilla')).toBeUndefined();
    expect(byName('Emerald City')?.price).toBe(8);
    expect(byName('Emerald City')?.description).toMatch(/cream cheese|sriracha/i);

    const tabs = presented[0].groups.map((g) => g.name);
    expect(tabs[0]).toBe('Drinks');
    expect(tabs).toContain('Starters');
    expect(tabs).toContain('Wings');
    expect(tabs).not.toContain('Sweets');
    expect(tabs).toContain('Kids');
    expect(tabs).not.toContain('Food');
    expect(rows.find(({ group }) => group === 'SD Burrito')).toBeUndefined();
  });
});

function walkGroups(groups: Menu['groups'], visit: (group: Menu['groups'][number]) => void) {
  for (const group of groups) {
    visit(group);
    if (group.subGroups) walkGroups(group.subGroups, visit);
  }
}

describe('SD Burrito public shape', () => {
  it('is not on the sheet-synced public menu', () => {
    const presented = applyMenuPresentation(getMenus());
    let burrito: Menu['groups'][number] | undefined;
    walkGroups(presented[0].groups, (group) => {
      if (group.name === 'SD Burrito') burrito = group;
    });
    expect(burrito).toBeUndefined();
  });

  it('still folds leftover sheet SD Burrito protein rows into choices', () => {
    const leftover: Menu[] = [{
      id: 'menu-live',
      name: 'Menu',
      groups: [
        {
          id: 'brunch',
          name: 'Brunch',
          displayMode: 'starters',
          items: [],
          subGroups: [
            {
              id: 'brunch-sd-burrito',
              name: 'SD Burrito',
              description: 'Scrambled eggs, guacamole, pico de gallo, fries, jack and cheddar.',
              items: [
                { id: 'sd-sausage', name: 'Sausage', price: 16 },
                { id: 'sd-bacon', name: 'Bacon', price: 16 },
                { id: 'sd-chicken', name: 'Chicken', price: 16 },
                { id: 'sd-carnitas', name: 'Carnitas', price: 17 },
                { id: 'sd-carne', name: 'Carne Asada', price: 18 },
                { id: 'sd-pastrami', name: 'Pastrami', price: 18 },
              ],
              choices: [{ label: 'Note', options: ['Add cheese +2'] }],
            },
          ],
        },
      ],
    }];
    const presented = applyMenuPresentation(leftover);
    let burrito: Menu['groups'][number] | undefined;
    walkGroups(presented[0].groups, (group) => {
      if (group.name === 'SD Burrito') burrito = group;
    });
    expect(burrito).toBeTruthy();
    expect(burrito?.choices?.some((c) => /^note$/i.test(c.label))).toBe(false);
    const meat = burrito?.choices?.find((c) => /meat|protein|choose/i.test(c.label));
    expect(meat?.options?.length).toBeGreaterThanOrEqual(6);
  });
});

describe('public menu notes and headers', () => {
  it('removes every Note-labeled choice from the presented menu', () => {
    const presented = applyMenuPresentation(getMenus());
    const labels: string[] = [];
    walkGroups(presented[0].groups, (group) => {
      for (const choice of group.choices ?? []) labels.push(choice.label);
    });
    expect(labels.filter((label) => /^note$/i.test(label))).toEqual([]);
    expect(readFileSync(resolve(__dirname, './menu.ts'), 'utf8')).not.toMatch(/label:\s*['"]Note['"]/);
  });

  it('has no Brunch Plates section on the sheet-synced menu', () => {
    const presented = applyMenuPresentation(getMenus());
    let plates: Menu['groups'][number] | undefined;
    walkGroups(presented[0].groups, (group) => {
      if (group.name === 'Plates') plates = group;
    });
    expect(plates).toBeUndefined();
    expect(presented[0].groups.map((g) => g.name)[0]).toBe('Drinks');
    expect(presented[0].groups.map((g) => g.name)).toContain('Soup & Salad');
    expect(presented[0].groups.map((g) => g.name)).not.toContain('Sweets');
    expect(presented[0].groups.map((g) => g.name)).toContain('Kids');
    expect(presented[0].groups.map((g) => g.name)).not.toContain('Food');
  });

  it('makes public section headers and category tabs ALL CAPS and smaller', () => {
    const variant = readFileSync(resolve(__dirname, '../components/VariantGroupCard.tsx'), 'utf8');
    const menuPage = readFileSync(resolve(__dirname, '../app/menu/MenuPageClient.tsx'), 'utf8');
    expect(variant).toMatch(/<h2 className="[^"]*uppercase[^"]*"/);
    expect(variant).toMatch(/<h2 className="[^"]*text-sm[^"]*sm:text-base/);
    expect(variant).not.toMatch(/<h2 className="text-lg font-semibold tracking-tight/);
    expect(menuPage).toMatch(/<h1[\s\S]*?className="mt-2 text-4xl font-semibold tracking-tight text-foreground"/);
    expect(menuPage).not.toMatch(/<h1[^>]*uppercase/);
    expect(menuPage).toMatch(/rounded-full[^"]*uppercase/);
    expect(menuPage).toMatch(/text-\[11px\]/);
  });
});

describe('Toast fish taco / cilantro-lime crema', () => {
  const FISH_TACO =
    'Crispy fish taco with cabbage, pico de gallo, queso fresco, cilantro, and cilantro-lime crema.';

  it('uses the Toast Fish Taco line and never prints tartar on the sheet menu', () => {
    expect(copyForName('Fish Taco')).toBe(FISH_TACO);
    expect(copyForName('Baja Fish')).toBe(FISH_TACO);
    expect(copyForName('Village Tacos')).toBe(
      'Three tacos, topped with onion, cilantro, and queso fresco. Served with refried beans and chips.',
    );
    expect(copyForName('Chicken Taco')).toBe(
      'Seasoned chicken taco topped with onion, cilantro, and queso fresco.',
    );

    const presented = applyMenuPresentation(getMenus());
    const blob = JSON.stringify(presented);
    expect(blob).not.toMatch(/tartar/i);
    // Sheet copy keeps cilantro-lime crema language on nachos / loaded fries.
    expect(blob).toMatch(/cilantro-lime crema/i);
    expect(blob).not.toMatch(/Village Tacos/);
  });

  it('rewrites leftover sheet tartar on Baja Fish choice labels', () => {
    const leftover: Menu[] = [{
      id: 'menu-live',
      name: 'Menu',
      groups: [
        {
          id: 'mains',
          name: 'Mains',
          items: [],
          subGroups: [
            {
              id: 'mains-village-tacos',
              name: 'Village Tacos',
              items: [{ id: 'fish', name: 'Fish Taco', description: 'Crisp fish with chipotle tartar sauce.' }],
              choices: [
                {
                  label: 'Pick Your Tacos',
                  options: ['Baja Fish — Cabbage, Pico de Gallo, Chipotle Tartar Sauce'],
                },
              ],
            },
          ],
        },
      ],
    }];
    const presented = applyMenuPresentation(leftover);
    const blob = JSON.stringify(presented);
    expect(blob).not.toMatch(/tartar/i);
    const rows = flattenItems(presented);
    // Sheet sync keeps non-empty descriptions; tartar scrub still rewrites in place.
    expect(rows.find(({ item }) => item.name === 'Fish Taco')?.item.description).toBe(
      'Crisp fish with cilantro-lime crema.',
    );
    let village: Menu['groups'][number] | undefined;
    walkGroups(presented[0].groups, (group) => {
      if (group.name === 'Village Tacos') village = group;
    });
    expect(village?.choices?.[0]?.options[0]).toMatch(/Cilantro-Lime Crema/);
  });
});

describe('guest-facing descriptions', () => {
  it('gives bottles and cans manufacturer-based blurbs', () => {
    const presented = applyMenuPresentation(getMenus());
    const rows = flattenItems(presented);
    const byName = (name: string) => rows.find(({ item }) => photoKey(item.name) === photoKey(name))?.item;
    expect(byName('Cadillac Margarita')?.description).toMatch(/Casa Azul|tequila|lime/i);
    expect(byName('Heroes Old Fashioned')?.description).toMatch(/Bulleit|bourbon|bitters/i);
    expect(byName('Modelo')?.description).toMatch(/pilsner|lager|crisp/i);
    expect(byName('Michelob Ultra')?.description).toMatch(/light/i);
    expect(byName('Miller Lite')?.description).toMatch(/light|pilsner/i);
    expect(byName('Coors Banquet')?.description).toMatch(/lager|golden|colorado/i);
    expect(byName('Guinness')?.description).toMatch(/stout|creamy|irish/i);
    expect(byName('High Noon')?.description).toMatch(/vodka|juice|seltzer/i);
    expect(byName('Sun Cruiser Tea')?.description).toMatch(/tea|vodka/i);
    expect(byName('Nütrl Watermelon')?.description ?? byName('Nutrl Watermelon')?.description).toMatch(/watermelon|vodka/i);
    expect(byName('White Claw')?.description).toMatch(/black cherry|mango|seltzer/i);
    expect(byName('Athletic Lite')?.description).toMatch(/non-alcoholic|non alcoholic|alcohol-free|light/i);
    expect(byName('Irish Coffee')).toBeUndefined();
    expect(byName('Mimosa')).toBeUndefined();
    expect(byName('Corona N/A')).toBeUndefined();
  });

  it('covers nearly every public item with an appetizing description', () => {
    const presented = applyMenuPresentation(getMenus());
    // Sheet leaves some Sides descriptions blank on purpose — allow those only.
    const missing = flattenItems(presented)
      .filter(({ group, item }) => {
        if (group === 'Sides') return false;
        return !item.description?.trim();
      })
      .map(({ group, item }) => `${group}/${item.name}`);
    expect(missing).toEqual([]);
  });

  it('never calls the bar a brewery and does not invent Chilaquiles on the sheet menu', () => {
    const presented = applyMenuPresentation(getMenus());
    const blob = JSON.stringify(presented);
    expect(blob).not.toMatch(/Chilaquiles/);
    expect(blob).not.toMatch(/chiliquiles/i);
    expect(blob).not.toMatch(/brewery/i);
  });
});

describe('applyMenuPresentation', () => {
  it('keeps Drinks + per-section food tabs without injecting kitchen/brunch specials', () => {
    const presented = applyMenuPresentation(getMenus());
    const tabs = presented[0].groups.map((g) => g.name);
    expect(tabs).toEqual([
      'Drinks',
      'Starters',
      'Burgers',
      'Wings',
      'Heroes',
      'Load \'Em Up',
      'Soup & Salad',
      'Hot Dogs',
      'Sides',
      'Kids',
    ]);
    const names = flattenItems(presented).map(({ item }) => item.name);
    expect(names).toContain('Nashville');
    expect(names).not.toContain('Spicy Chicken');
    expect(names).toContain('Pasadena');
    expect(names).not.toContain('Cheesecake');
    expect(names).toContain('Emerald City');
    expect(names).not.toContain('Hogzilla');
    expect(names).not.toContain('Chilaquiles');
    expect(names).not.toContain('Oreo Churros');
    expect(names).not.toContain('Crunchwraps');
    expect(names).not.toContain('2 Eggs for $22');
    expect(crunchwrapHits(presented)).toEqual([]);
  });

  it('puts Nashville under the Heroes tab with the printed fried-chicken description', () => {
    const presented = applyMenuPresentation(getMenus());
    const heroes = presented[0].groups.find((g) => g.name === 'Heroes');
    const nashville = heroes?.items.find((item) => photoKey(item.name) === 'nashville');
    expect(nashville?.name).toBe('Nashville');
    expect(nashville?.description).toMatch(/fried chicken|bacon|jalape/i);
    expect(nashville?.imageUrl).toBeUndefined();
    expect(nashville?.price).toBe(24);
    expect(flattenItems(presented).filter(({ item }) => photoKey(item.name) === 'nashville')).toHaveLength(1);
    expect(flattenItems(presented).filter(({ item }) => photoKey(item.name) === 'spicy chicken')).toHaveLength(0);
  });

  it('does not invent a Kitchen Specials or Brunch tab', () => {
    const presented = applyMenuPresentation(getMenus());
    expect(presented[0].groups.some((g) => /kitchen specials/i.test(g.name))).toBe(false);
    expect(presented[0].groups.some((g) => g.name === 'Brunch')).toBe(false);
    expect(presented[0].groups.some((g) => g.name === 'Specials')).toBe(false);
    expect(crunchwrapHits(presented)).toEqual([]);
  });

  it('keeps Soft Drinks under Drinks and drops the Sweets tab', () => {
    const presented = applyMenuPresentation(getMenus());
    const drinks = presented[0].groups.find((g) => g.name === 'Drinks');
    const soft = drinks?.subGroups?.find((g) => /soft drinks/i.test(g.name));
    expect(soft?.items.map((i) => i.name)).toEqual(['Sodas']);
    expect(presented[0].groups.find((g) => g.name === 'Sweets')).toBeUndefined();
  });

  it('does not invent photos for quarantined dishes on the live menu', () => {
    const presented = applyMenuPresentation(getMenus());
    const items = flattenItems(presented);
    const byName = (name: string) => items.find(({ item }) => photoKey(item.name) === photoKey(name))?.item;
    expect(byName('Hummus Plate')?.imageUrl).toBeUndefined();
    expect(byName('Fried Pickles')?.imageUrl).toBeUndefined();
    expect(byName('Mozzarella Sticks')?.imageUrl).toBeUndefined();
    expect(byName('Cobb')?.imageUrl).toBeUndefined();
  });

  it('strips crunchwrap leftovers from a sheet-shaped menu without injecting specials', () => {
    const sparse: Menu[] = [{
      id: 'menu-live',
      name: 'Menu',
      groups: [
        {
          id: 'food',
          name: 'Food',
          displayMode: 'starters',
          items: [],
          subGroups: [
            {
              id: 'food-heroes',
              name: 'Heroes',
              items: [
                { id: 'hoboken', name: 'Hoboken', description: 'Italian hero.', price: 22 },
                { id: 'spicy', name: 'Spicy Chicken', description: SPICY_CHICKEN.description, price: 24 },
              ],
            },
            {
              id: 'food-crunch',
              name: 'Crunch Wraps',
              items: [
                { id: 'cw', name: 'Cheeseburger Crunchwrap', description: 'Pressed.' },
                { id: 'bw', name: 'Burger Wrap', description: 'Pressed.' },
              ],
            },
          ],
        },
      ],
    }];
    const presented = applyMenuPresentation(sparse);
    const names = flattenItems(presented).map(({ item }) => item.name);
    expect(names).toContain('Spicy Chicken');
    expect(names).toContain('Hoboken');
    expect(names).not.toContain('Crunchwraps');
    expect(names).not.toContain('Cheeseburger Crunchwrap');
    expect(names).not.toContain('Burger Wrap');
    expect(names).not.toContain('Hogzilla');
    expect(names).not.toContain('Chilaquiles');
    expect(crunchwrapHits(presented)).toEqual([]);
    expect(presented[0].groups.some((g) => g.name === 'Brunch')).toBe(false);
  });

  it('retires leftover wrap SKUs without moving Spicy Chicken off Heroes', () => {
    const leftover: Menu[] = [{
      id: 'menu-live',
      name: 'Menu',
      groups: [
        {
          id: 'food',
          name: 'Food',
          displayMode: 'starters',
          items: [],
          subGroups: [
            {
              id: 'food-heroes',
              name: 'Heroes',
              items: [
                { id: 'spicy', name: 'Spicy Chicken', description: 'Crispy chicken, bacon, melted jack.', price: 24 },
              ],
            },
            {
              id: 'food-crunch',
              name: 'Crunch Wraps',
              items: [
                { id: 'cw', name: 'Cheeseburger Crunchwrap', description: 'Pressed tortilla, beef, cheese.' },
                { id: 'carnitas', name: 'Carnitas Crunchwrap', description: 'Pressed tortilla, carnitas, cheese.' },
              ],
            },
          ],
        },
      ],
    }];
    const presented = applyMenuPresentation(leftover);
    const rows = flattenItems(presented);
    const names = rows.map(({ item }) => item.name);
    expect(names).toContain('Spicy Chicken');
    expect(names).not.toContain('Cheeseburger Crunchwrap');
    expect(names).not.toContain('Carnitas Crunchwrap');
    expect(names).not.toContain('Hogzilla');
    expect(names.filter((n) => n === 'Spicy Chicken')).toHaveLength(1);
    expect(rows.find(({ item }) => item.name === 'Spicy Chicken')?.group).toBe('Heroes');
    expect(crunchwrapHits(presented)).toEqual([]);
  });

  it('does not duplicate sheet items after presentation', () => {
    const presented = applyMenuPresentation(getMenus());
    const names = flattenItems(presented).map(({ item }) => photoKey(item.name));
    expect(names.filter((n) => n === 'spicy chicken')).toHaveLength(0);
    expect(names.filter((n) => n === 'nashville')).toHaveLength(1);
    expect(names.filter((n) => n === 'pasadena')).toHaveLength(1);
    expect(names.filter((n) => n === 'cheesecake')).toHaveLength(0);
    expect(names.filter((n) => n === 'cheeseburger crunchwrap')).toHaveLength(0);
    expect(names.filter((n) => n === 'hogzilla')).toHaveLength(0);
  });
});

describe('public menu prices', () => {
  it('keeps sheet prices in data but hides them on the public menu', () => {
    expect(SHOW_PRICES).toBe(false);
    const presented = applyMenuPresentation(getMenus());
    const pasadena = flattenItems(presented).find(({ item }) => item.name === 'Pasadena')?.item;
    expect(pasadena?.price).toBe(18);
    const emerald = flattenItems(presented).find(({ item }) => item.name === 'Emerald City')?.item;
    expect(emerald?.price).toBe(8);
    const tap = flattenItems(presented).find(({ item }) => item.name === 'AHB Amber')?.item;
    expect(tap?.price).toBe(8);
    expect(tap?.priceLabel).toMatch(/8\s*\/\s*30/);
    const soup = flattenItems(presented).find(({ item }) => item.name === 'Soup of the Day')?.item;
    expect(soup?.price).toBe(8);
    expect(soup?.priceLabel).toMatch(/Cup 8 \/ Bowl 14 \/ Bread Boule 16/);
  });

  it('strips upcharge language from public copy while prices are hidden', () => {
    const presented = applyMenuPresentation(getMenus());
    const philly = flattenItems(presented).find(({ item }) => item.name === 'Philly Cheesesteak')?.item;
    // raw data still has +1; public strip removes it
    expect(philly?.description).toMatch(/\+\s*1/);
    expect(stripPriceTokens(philly?.description ?? '')).not.toMatch(/\$|\+\s*\d/);
  });

  it('omits offers from menu JSON-LD while prices are hidden', () => {
    const json = getMenuJsonLd(applyMenuPresentation(getMenus()));
    const blob = JSON.stringify(json);
    expect(blob).not.toContain('"offers"');
    expect(blob).toContain('Pasadena');
    expect(blob).toContain('Nashville');
    expect(blob).not.toContain('Spicy Chicken');
    expect(blob).not.toContain('Cheesecake');
    expect(blob).toContain('Emerald City');
    expect(blob).toContain('Kids');
    expect(blob).not.toContain('Hogzilla');
    expect(blob).not.toContain('Chilaquiles');
    expect(blob).not.toMatch(CRUNCHWRAP_RE);
  });
});

describe('home specials', () => {
  it('keeps Hogzilla and Chilaquiles as unpriced kitchen cards', () => {
    expect(HOME_SPECIALS.map((s) => s.name)).toEqual(['Hogzilla', 'Chilaquiles']);
    expect(HOME_SPECIALS.map((s) => s.description)).toEqual([
      HOGZILLA.description,
      CHILAQUILES.description,
    ]);
    for (const special of HOME_SPECIALS) {
      expect(special.description).not.toMatch(/\$|\b22\b|price/i);
    }

    const home = readFileSync(resolve(__dirname, '../app/HomePageClient.tsx'), 'utf8');
    expect(home).toContain('HOME_SPECIALS');
    expect(home).toContain('FRIDAY_FUNDAY_DEAL');
    expect(home).toContain('grid-cols-1 sm:grid-cols-3');
    // Specials grid columns track the card count so two cards don't leave an empty slot.
    expect(home).toMatch(/sm:grid-cols-2 gap-3">\s*\{HOME_SPECIALS\.map/);
    expect(home).toContain('bg-card');
    expect(home).toContain('border-border');
    expect(home).toMatch(/Weekend Brunch/);
    expect(home).toMatch(/2 Eggs for \$22|TWO_FOR_22_DAILY_DEAL/);
    expect(home).not.toMatch(/Early Bird/);
    expect(home).not.toMatch(/2 Breakfast Entrées/);
    expect(home).not.toMatch(/two breakfast plates/i);
    expect(home).not.toMatch(/Steak & Eggs/);
  });
});
