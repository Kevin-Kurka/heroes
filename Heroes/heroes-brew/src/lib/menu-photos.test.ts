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
  CRUNCHWRAPS,
  HOGZILLA,
  HOME_SPECIALS,
  KITCHEN_SPECIALS,
  MENU_PHOTO_PATHS,
  OREO_CHURROS,
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

describe('photo allowlist', () => {
  it('maps only honest dish names', () => {
    expect(photoForName('Calamari')).toBe('/images/polished/calamari.jpg');
    expect(photoForName('Spicy Chicken')).toBe('/images/polished/spicy-chicken.jpg');
    expect(photoForName('Cheeseburger Crunchwrap')).toBe('/images/polished/burger-wrap.jpg');
    expect(photoForName('Burger Wrap')).toBe('/images/polished/burger-wrap.jpg');
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
    expect(photoForName('Cheeseburger Crunchwrap')).toBe('/images/polished/burger-wrap.jpg');
    expect(photoForName('Oreo Churros')).toBe('/images/polished/oreo-churros.jpg');
  });

  it('puts Oreo Churros on Sweets without attaching that plate to ice-cream churros', () => {
    const presented = applyMenuPresentation(getMenus());
    const sweets = presented[0].groups.find((g) => /^(sweets?|sweet stuff)$/i.test(g.name));
    const oreo = sweets?.items.find((item) => photoKey(item.name) === 'oreo churros');
    expect(oreo?.name).toBe(OREO_CHURROS.name);
    expect(oreo?.description).toBe(OREO_CHURROS.description);
    expect(oreo?.imageUrl).toBeUndefined();
    expect(oreo?.price).toBeUndefined();
    expect(oreo?.description).not.toMatch(/ice cream/i);
    expect(sweets?.items.filter((item) => photoKey(item.name) === 'oreo churros')).toHaveLength(1);
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

  it('applies recipe copy on the presented menu and on matching group cards', () => {
    const presented = applyMenuPresentation(getMenus());
    const rows = flattenItems(presented);
    const byName = (name: string) => rows.find(({ item }) => photoKey(item.name) === photoKey(name))?.item;
    expect(byName('Philly Cheesesteak (Philly Billy)')?.description).toBe(
      'Classic Philly cheesesteak — thin-sliced ribeye on a toasted Amoroso roll, with your choice of white American, provolone, or Whiz.',
    );
    expect(byName('Nachos')?.description).toBe(
      'Crisp chips piled high with beans, guacamole, melted cheese, Cheez Whiz, cilantro-lime crema, pico, and jalapeños.',
    );
    expect(byName('Pasadena (The OG Cheeseburger)')?.description).toBe(
      'A quarter-pound patty with shredded lettuce, tomato, pickle, red onion, AHB Hero sauce, and your choice of cheese on a toasted brioche bun.',
    );
    expect(byName('Hoboken (Italian)')?.description).toBe(
      'Ham, salami, capicola, mortadella, and provolone with lettuce, tomato, red onion, oil, vinegar, and oregano on an Italian roll.',
    );
    expect(byName('Carlsbad (BLT+)')?.description).toBe(
      'Grilled chicken breast, bacon, avocado, lettuce, tomato, and roasted garlic aioli on a toasted brioche bun.',
    );
    expect(byName('Manhattan (Reuben)')?.description).toMatch(/pickles|dark-ale mustard|Reuben/i);
    expect(byName('Austin (Jalapeno)')?.description).toMatch(/Cheez Whiz|jalapeño popper/i);
    expect(byName('Hogzilla')?.description).toBe(HOGZILLA.description);
    expect(byName('Crunchwraps')?.description).toBe(CRUNCHWRAPS.description);
    expect(byName('Chilaquiles')?.description).toBe(CHILAQUILES.description);
    expect(byName('Antipasto')?.description).toMatch(/Italian vinaigrette/);

    const mains = presented[0].groups.find((g) => g.name === 'Mains');
    const starting = presented[0].groups.find((g) => g.name === 'Starting');
    const nachos = starting?.subGroups?.find((g) => g.name === 'Nachos');
    const sliders = starting?.subGroups?.find((g) => g.name === 'Sliders');
    const philly = mains?.subGroups?.find((g) => /philly/i.test(g.name));
    expect(nachos?.description).toBe(copyForName('Nachos'));
    expect(sliders?.description).toBe(copyForName('Sliders'));
    expect(philly?.description).toBe(copyForName('Philly Billy'));

    const brunchCarne = rows.find(({ group, item }) => group === 'SD Burrito' && item.name === 'Carne Asada');
    expect(brunchCarne).toBeUndefined();
  });
});

function walkGroups(groups: Menu['groups'], visit: (group: Menu['groups'][number]) => void) {
  for (const group of groups) {
    visit(group);
    if (group.subGroups) walkGroups(group.subGroups, visit);
  }
}

describe('SD Burrito public shape', () => {
  it('reads as one burrito with six meat choices and no Note chip', () => {
    const presented = applyMenuPresentation(getMenus());
    let burrito: Menu['groups'][number] | undefined;
    walkGroups(presented[0].groups, (group) => {
      if (group.name === 'SD Burrito') burrito = group;
    });
    expect(burrito).toBeTruthy();
    expect(burrito?.description).toMatch(/scrambled eggs/i);
    expect(burrito?.description).toMatch(/guacamole/i);
    expect(burrito?.description).toMatch(/pico de gallo/i);
    expect(burrito?.description).toMatch(/fries/i);
    expect(burrito?.description).toMatch(/jack|cheddar/i);
    expect(burrito?.choices?.some((c) => /^note$/i.test(c.label))).toBe(false);
    const meat = burrito?.choices?.find((c) => /meat|protein/i.test(c.label));
    expect(meat?.options).toEqual(['Sausage', 'Bacon', 'Chicken', 'Carnitas', 'Carne Asada', 'Pastrami']);
    expect(burrito?.items.every((item) => item.name === 'SD Burrito' || !item.description)).toBe(true);
  });

  it('keeps priced protein items on the printable static source', () => {
    let burrito: Menu['groups'][number] | undefined;
    walkGroups(getMenus()[0].groups, (group) => {
      if (group.name === 'SD Burrito') burrito = group;
    });
    expect(burrito?.items.map((item) => item.name)).toEqual([
      'Sausage',
      'Bacon',
      'Chicken',
      'Carnitas',
      'Carne Asada',
      'Pastrami',
    ]);
    expect(burrito?.items.every((item) => item.price != null)).toBe(true);
    expect(burrito?.choices?.some((c) => /^note$/i.test(c.label))).toBeFalsy();
    expect(burrito?.description).toMatch(/scrambled eggs/i);
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

  it('folds Plates hours and sides into the group description', () => {
    const presented = applyMenuPresentation(getMenus());
    let plates: Menu['groups'][number] | undefined;
    walkGroups(presented[0].groups, (group) => {
      if (group.name === 'Plates') plates = group;
    });
    expect(plates?.description).toMatch(/Friday/i);
    expect(plates?.description).toMatch(/hashbrown/i);
    expect(plates?.description).toMatch(/fruit/i);
    const ahb = plates?.items.find((item) => /american hero breakfast/i.test(item.name));
    const fallbrook = plates?.items.find((item) => /fallbrook/i.test(item.name));
    expect(ahb?.description).toMatch(/hashbrown|egg/i);
    expect(ahb?.description).not.toMatch(/\$|\+\s*\d|taylor pork|potato cake/i);
    expect(fallbrook?.description).toMatch(/amish/i);
    expect(fallbrook?.description).not.toMatch(/\$|\+\s*\d|add bacon|add egg/i);
    expect(plates?.choices?.some((c) => /^note$/i.test(c.label))).toBeFalsy();
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

  it('uses the Toast Fish Taco line and never prints tartar', () => {
    expect(copyForName('Fish Taco')).toBe(FISH_TACO);
    expect(copyForName('Baja Fish')).toBe(FISH_TACO);
    expect(copyForName('Village Tacos')).toBe(
      'Three tacos, topped with onion, cilantro, and queso fresco. Served with refried beans and chips.',
    );
    expect(copyForName('Chicken Taco')).toBe(
      'Seasoned chicken taco topped with onion, cilantro, and queso fresco.',
    );
    expect(copyForName('Portland')).toMatch(/spinach wrap/i);

    const presented = applyMenuPresentation(getMenus());
    const blob = JSON.stringify(presented);
    expect(blob).not.toMatch(/tartar/i);
    expect(blob).toMatch(/cilantro-lime crema/i);

    let village: Menu['groups'][number] | undefined;
    walkGroups(presented[0].groups, (group) => {
      if (group.name === 'Village Tacos') village = group;
    });
    const fishChoice = village?.choices
      ?.flatMap((choice) => choice.options)
      .find((option) => /baja fish/i.test(option));
    expect(fishChoice).toMatch(/cilantro-lime crema/i);
    expect(fishChoice).not.toMatch(/tartar/i);
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
    expect(rows.find(({ item }) => item.name === 'Fish Taco')?.item.description).toBe(FISH_TACO);
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
    expect(byName('Irish Coffee')?.description).toMatch(/whiskey|cream/i);
    expect(byName('Mimosa')?.description).not.toMatch(/\$|\+\s*\d/);
    expect(byName('Modelo')?.description).toMatch(/pilsner|lager|crisp/i);
    expect(byName('Michelob Ultra')?.description).toMatch(/light/i);
    expect(byName('Miller Lite')?.description).toMatch(/light|pilsner/i);
    expect(byName('Coors Banquet')?.description).toMatch(/lager|golden|rocky mountain/i);
    expect(byName('Guinness')?.description).toMatch(/stout|creamy|irish/i);
    expect(byName('High Noon')?.description).toMatch(/vodka|juice|seltzer/i);
    expect(byName('Sun Cruiser Tea')?.description).toMatch(/tea|vodka/i);
    expect(byName('Nutrl Watermelon')?.description).toMatch(/watermelon|vodka/i);
    expect(byName('White Claw')?.description).toMatch(/black cherry/i);
    expect(byName('White Claw')?.description).toMatch(/mango/i);
    expect(byName('Corona N/A')?.description).toMatch(/non-alcoholic|non alcoholic|alcohol-free/i);
    expect(byName('Athletic Lite N/A')?.description).toMatch(/non-alcoholic|non alcoholic|alcohol-free/i);
  });

  it('covers nearly every public item with an appetizing description', () => {
    const presented = applyMenuPresentation(getMenus());
    const missing = flattenItems(presented)
      .filter(({ group, item }) => {
        if (group === 'SD Burrito' && item.name !== 'SD Burrito') return false;
        return !item.description?.trim();
      })
      .map(({ group, item }) => `${group}/${item.name}`);
    expect(missing).toEqual([]);
  });

  it('spells Chilaquiles correctly and never calls the bar a brewery', () => {
    const presented = applyMenuPresentation(getMenus());
    const blob = JSON.stringify(presented);
    expect(blob).toMatch(/Chilaquiles/);
    expect(blob).not.toMatch(/chiliquiles/i);
    expect(blob).not.toMatch(/brewery/i);
  });
});

describe('applyMenuPresentation', () => {
  it('adds the kitchen specials without attaching plates', () => {
    const presented = applyMenuPresentation(getMenus());
    const items = flattenItems(presented).map(({ item }) => item);
    for (const special of KITCHEN_SPECIALS) {
      const found = items.find((item) => photoKey(item.name) === photoKey(special.name));
      expect(found, special.name).toBeTruthy();
      expect(found?.description).toBe(special.description);
      expect(found?.imageUrl).toBeUndefined();
      expect(found?.price).toBeUndefined();
    }
  });

  it('puts Spicy Chicken under Hero Sandwiches with the existing description', () => {
    const presented = applyMenuPresentation(getMenus());
    const mains = presented[0].groups.find((g) => g.name === 'Mains');
    const heroes = mains?.subGroups?.find((g) => g.name === 'Hero Sandwiches');
    const kitchen = mains?.subGroups?.find((g) => g.name === 'Kitchen Specials');
    const spicy = heroes?.items.find((item) => photoKey(item.name) === photoKey(SPICY_CHICKEN.name));
    expect(spicy?.name).toBe('Spicy Chicken');
    expect(spicy?.description).toBe(SPICY_CHICKEN.description);
    expect(spicy?.imageUrl).toBeUndefined();
    expect(kitchen?.items.some((item) => photoKey(item.name) === 'spicy chicken')).toBe(false);
    expect(flattenItems(presented).filter(({ item }) => photoKey(item.name) === 'spicy chicken')).toHaveLength(1);
  });

  it('keeps Kitchen Specials as Hogzilla and one Crunchwraps special', () => {
    const presented = applyMenuPresentation(getMenus());
    const mains = presented[0].groups.find((g) => g.name === 'Mains');
    const kitchen = mains?.subGroups?.find((g) => g.name === 'Kitchen Specials');
    const crunchSection = mains?.subGroups?.find((g) => /crunch\s*wraps?/i.test(g.name));
    expect(crunchSection).toBeUndefined();
    expect(kitchen?.items.map((item) => item.name)).toEqual(['Hogzilla', 'Crunchwraps']);
    expect(kitchen?.items.map((item) => item.description)).toEqual([
      HOGZILLA.description,
      CRUNCHWRAPS.description,
    ]);
    expect(CRUNCHWRAPS.proteins).toEqual(['Carne Asada', 'Carnitas', 'Chicken']);
    expect(kitchen?.items.every((item) => item.price == null)).toBe(true);
    expect(kitchen?.items.every((item) => item.imageUrl == null)).toBe(true);

    const rows = flattenItems(presented);
    expect(rows.filter(({ item }) => photoKey(item.name) === 'burger wrap')).toHaveLength(0);
    expect(rows.filter(({ item }) => photoKey(item.name) === 'cheeseburger crunchwrap')).toHaveLength(0);
    expect(rows.filter(({ item }) => photoKey(item.name) === 'carnitas crunchwrap')).toHaveLength(0);
    expect(rows.filter(({ item }) => photoKey(item.name) === 'carne asada crunchwrap')).toHaveLength(0);
    expect(kitchen?.items.filter((item) => photoKey(item.name) === 'crunchwraps')).toHaveLength(1);
  });

  it('renames the Breakfast tab to Brunch and adds Chilaquiles', () => {
    const presented = applyMenuPresentation(getMenus());
    const tabs = presented[0].groups.map((g) => g.name);
    expect(tabs).toContain('Brunch');
    expect(tabs).not.toContain('Breakfast');
    const brunch = presented[0].groups.find((g) => g.name === 'Brunch');
    expect(brunch?.id).toBe('brunch');
    const specials = brunch?.subGroups?.find((g) => g.name === 'Brunch Specials');
    const chilaquiles = specials?.items.find((item) => item.name === 'Chilaquiles');
    expect(chilaquiles?.name).toBe('Chilaquiles');
    expect(chilaquiles?.description).toBe(CHILAQUILES.description);
    expect(chilaquiles?.description).toMatch(/salsa|crema|egg|tortilla/i);
    expect(chilaquiles?.price).toBeUndefined();
    expect(chilaquiles?.imageUrl).toBeUndefined();
    expect(flattenItems(presented).filter(({ item }) => photoKey(item.name) === 'chilaquiles').length).toBeGreaterThanOrEqual(1);
  });

  it('does not invent photos for quarantined dishes on the live menu', () => {
    const presented = applyMenuPresentation(getMenus());
    const items = flattenItems(presented);
    const byName = (name: string) => items.find(({ item }) => photoKey(item.name) === photoKey(name))?.item;
    expect(byName('Hummus Plate')?.imageUrl).toBeUndefined();
    expect(byName('Fried Pickles')?.imageUrl).toBeUndefined();
    expect(byName('Corn Dogs')?.imageUrl).toBeUndefined();
    expect(byName('Mozzarella Sticks')?.imageUrl).toBeUndefined();
    expect(byName('Jalapeno Poppers')?.imageUrl).toBeUndefined();
    expect(byName('San Diego (California Burrito)')?.imageUrl).toBeUndefined();
    expect(byName('Los Angeles (French Dip)')?.imageUrl).toBeUndefined();
    expect(byName('Cobb')?.imageUrl).toBeUndefined();
    expect(byName('House Salad')?.imageUrl).toBeUndefined();
    expect(byName('Cheesesteak')?.imageUrl).toBeUndefined();
  });

  it('injects missing specials into a sheet-shaped menu that lacks them', () => {
    const sparse: Menu[] = [{
      id: 'menu-live',
      name: 'Menu',
      groups: [
        {
          id: 'starting',
          name: 'Starting',
          displayMode: 'starters',
          items: [],
          subGroups: [
            {
              id: 'starting-munchies',
              name: 'Munchies',
              items: [{ id: 'hummus', name: 'Hummus Plate', description: 'Red pepper hummus.', price: 12 }],
            },
          ],
        },
        {
          id: 'mains',
          name: 'Mains',
          displayMode: 'starters',
          items: [],
          subGroups: [
            {
              id: 'mains-hero-sandwiches',
              name: 'Hero Sandwiches',
              items: [{ id: 'hoboken', name: 'Hoboken (Italian)', description: 'Italian hero.', price: 22 }],
            },
          ],
        },
      ],
    }];
    const presented = applyMenuPresentation(sparse);
    const names = flattenItems(presented).map(({ item }) => item.name);
    expect(names).toContain('Calamari');
    expect(names).toContain('Spicy Chicken');
    expect(names).toContain('Hogzilla');
    expect(names).toContain('Crunchwraps');
    expect(names).toContain('Chilaquiles');
    expect(names).not.toContain('Burger Wrap');
    expect(names).not.toContain('Cheeseburger Crunchwrap');
    expect(names.filter((n) => n === 'Calamari')).toHaveLength(1);
    expect(names.filter((n) => n === 'Spicy Chicken')).toHaveLength(1);
    const rows = flattenItems(presented);
    expect(rows.find(({ item }) => item.name === 'Spicy Chicken')?.group).toBe('Hero Sandwiches');
    expect(rows.filter(({ item }) => item.name === 'Hogzilla').map(({ group }) => group)).toEqual(
      expect.arrayContaining(['Kitchen Specials', 'Kitchen']),
    );
    expect(rows.filter(({ item }) => item.name === 'Crunchwraps').map(({ group }) => group)).toEqual(
      expect.arrayContaining(['Kitchen Specials', 'Kitchen']),
    );
    expect(presented[0].groups.some((g) => g.name === 'Brunch')).toBe(true);
  });

  it('moves leftover Spicy Chicken onto Heroes and retires old wrap SKUs', () => {
    const leftover: Menu[] = [{
      id: 'menu-live',
      name: 'Menu',
      groups: [
        {
          id: 'breakfast',
          name: 'Breakfast',
          displayMode: 'starters',
          items: [],
          subGroups: [
            {
              id: 'breakfast-plates',
              name: 'Plates',
              items: [{ id: 'breakfast-plates-i0', name: 'American Hero Breakfast' }],
            },
          ],
        },
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
                { id: 'mains-kitchen-specials-spicy-chicken', name: 'Spicy Chicken', description: 'Crispy chicken, bacon, melted jack.' },
                { id: 'mains-kitchen-specials-burger-wrap', name: 'Burger Wrap', description: 'Pressed tortilla, beef, cheese.' },
              ],
            },
            {
              id: 'mains-crunch-wraps',
              name: 'Crunch Wraps',
              items: [
                { id: 'mains-crunch-wraps-cheeseburger', name: 'Cheeseburger Crunchwrap', description: 'Pressed tortilla, beef, cheese.' },
                { id: 'mains-crunch-wraps-carnitas', name: 'Carnitas Crunchwrap', description: 'Pressed tortilla, carnitas, cheese.' },
              ],
            },
          ],
        },
      ],
    }];
    const presented = applyMenuPresentation(leftover);
    const rows = flattenItems(presented);
    const names = rows.map(({ item }) => item.name);
    expect(names).toContain('Hogzilla');
    expect(names).toContain('Crunchwraps');
    expect(names).toContain('Spicy Chicken');
    expect(names).toContain('Chilaquiles');
    expect(names).not.toContain('Burger Wrap');
    expect(names).not.toContain('Cheeseburger Crunchwrap');
    expect(names).not.toContain('Carnitas Crunchwrap');
    expect(names.filter((n) => n === 'Spicy Chicken')).toHaveLength(1);

    expect(rows.find(({ item }) => item.name === 'Spicy Chicken')?.group).toBe('Hero Sandwiches');
    expect(rows.filter(({ item }) => item.name === 'Crunchwraps').map(({ group }) => group)).toEqual(
      expect.arrayContaining(['Kitchen Specials']),
    );
    expect(rows.filter(({ group, item }) => group === 'Kitchen Specials' && item.name === 'Spicy Chicken')).toHaveLength(0);
    expect(presented[0].groups.find((g) => g.name === 'Mains')?.subGroups?.some((g) => /crunch\s*wraps?/i.test(g.name))).toBe(false);
    expect(presented[0].groups.some((g) => g.name === 'Brunch')).toBe(true);
    expect(presented[0].groups.some((g) => g.name === 'Breakfast')).toBe(false);
  });

  it('does not duplicate specials already on the static menu', () => {
    const presented = applyMenuPresentation(getMenus());
    const names = flattenItems(presented).map(({ item }) => photoKey(item.name));
    expect(names.filter((n) => n === 'calamari')).toHaveLength(1);
    expect(names.filter((n) => n === 'spicy chicken')).toHaveLength(1);
    expect(names.filter((n) => n === 'cheeseburger crunchwrap')).toHaveLength(0);
    expect(names.filter((n) => n === 'burger wrap')).toHaveLength(0);
  });

  it('puts Hogzilla, Crunchwraps, and Chilaquiles on the Specials tab first', () => {
    const presented = applyMenuPresentation(getMenus());
    const specials = presented[0].groups.find((g) => g.name === 'Specials');
    const kitchen = specials?.subGroups?.find((g) => /kitchen|featured/i.test(g.name));
    expect(kitchen?.items.map((item) => item.name)).toEqual(['Hogzilla', 'Crunchwraps', 'Chilaquiles']);
    expect(kitchen?.items.map((item) => item.description)).toEqual([
      HOGZILLA.description,
      CRUNCHWRAPS.description,
      CHILAQUILES.description,
    ]);
    expect(kitchen?.items.every((item) => item.price == null)).toBe(true);
    expect(kitchen?.items.every((item) => item.imageUrl == null)).toBe(true);
    expect(specials?.items[0]?.name).toBe('Mahalo Monday');
    expect(flattenItems(presented).filter(({ item }) => photoKey(item.name) === 'hogzilla')).toHaveLength(2);
    expect(flattenItems(presented).filter(({ item }) => photoKey(item.name) === 'crunchwraps')).toHaveLength(2);
    expect(flattenItems(presented).filter(({ item }) => photoKey(item.name) === 'chilaquiles')).toHaveLength(2);
  });
});

describe('public menu prices', () => {
  it('keeps staff prices on the static source but never renders them publicly', () => {
    expect(SHOW_PRICES).toBe(false);
    const presented = applyMenuPresentation(getMenus());
    const pasadena = flattenItems(presented).find(({ item }) => item.name.startsWith('Pasadena'))?.item;
    expect(pasadena?.price).toBe(18);
    const weekly = flattenItems(presented).find(({ item }) => item.name === 'Mahalo Monday')?.item;
    expect(weekly?.description).toMatch(/\$/);
    expect(stripPriceTokens(weekly?.description ?? '')).not.toMatch(/\$|\+\d/);
  });

  it('strips every public description so no $ or +N remains', () => {
    const presented = applyMenuPresentation(getMenus());
    for (const { item, group } of flattenItems(presented)) {
      if (item.description) {
        expect(stripPriceTokens(item.description), `${group}/${item.name}`).not.toMatch(/\$|\+\s*\d/);
      }
    }
  });

  it('omits offers from menu JSON-LD while prices are hidden', () => {
    const json = getMenuJsonLd(applyMenuPresentation(getMenus()));
    const blob = JSON.stringify(json);
    expect(blob).not.toContain('"offers"');
    expect(blob).not.toMatch(/\$\d/);
    expect(blob).toContain('Calamari');
    expect(blob).toContain('Spicy Chicken');
    expect(blob).toContain('Hogzilla');
    expect(blob).toContain('Crunchwraps');
    expect(blob).toContain('Chilaquiles');
    expect(blob).not.toContain('Cheeseburger Crunchwrap');
    expect(blob).not.toContain('Burger Wrap');
  });
});

describe('home specials', () => {
  it('keeps Hogzilla, Chilaquiles, and Crunchwraps as unpriced kitchen cards', () => {
    expect(HOME_SPECIALS.map((s) => s.name)).toEqual(['Hogzilla', 'Chilaquiles', 'Crunchwraps']);
    expect(HOME_SPECIALS.map((s) => s.description)).toEqual([
      HOGZILLA.description,
      CHILAQUILES.description,
      CRUNCHWRAPS.description,
    ]);
    for (const special of HOME_SPECIALS) {
      expect(special.description).not.toMatch(/\$|\b22\b|price/i);
    }

    const home = readFileSync(resolve(__dirname, '../app/HomePageClient.tsx'), 'utf8');
    expect(home).toContain('HOME_SPECIALS');
    expect(home).toContain('EARLY_BIRD_DAILY_DEALS');
    expect(home).toContain('grid-cols-1 sm:grid-cols-3');
    expect(home).toContain('bg-card');
    expect(home).toContain('border-border');
    expect(home).toMatch(/Early Bird/);
    expect(home).not.toMatch(/2 Breakfast Entrées/);
    expect(home).not.toMatch(/Steak & Eggs/);
  });
});
