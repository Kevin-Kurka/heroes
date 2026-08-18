import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getMenus } from './menu';
import { getMenuJsonLd } from './structured-data';
import { SHOW_PRICES, stripPriceTokens } from './config';
import {
  applyMenuPresentation,
  BLOCKED_PHOTO_KEYS,
  CRUNCH_WRAPS,
  KITCHEN_SPECIALS,
  MENU_PHOTO_PATHS,
  OREO_CHURROS,
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

  it('uses a full-bleed photo with a dark wash instead of a 400px inset', () => {
    const menuCard = readFileSync(resolve(__dirname, '../components/MenuCard.tsx'), 'utf8');
    const variant = readFileSync(resolve(__dirname, '../components/VariantGroupCard.tsx'), 'utf8');
    expect(menuCard).toContain('sizes={PHOTO_SIZES}');
    expect(menuCard).toContain('(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 520px');
    expect(menuCard).toContain('from-black/95 via-black/85 to-black/70');
    expect(menuCard).toContain('group-hover:from-black/92');
    expect(menuCard).toContain('text-white/90');
    expect(menuCard).toContain('PHOTO_TEXT_SHADOW');
    expect(menuCard).toContain('drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]');
    expect(menuCard).toContain('drop-shadow-[0_2px_6px_rgba(0,0,0,0.75)]');
    expect(menuCard).not.toContain('PHOTO_TEXT_PANEL');
    expect(menuCard).not.toContain('bg-black/35');
    expect(menuCard).toContain('object-cover object-[center_68%]');
    expect(menuCard).not.toContain('md:max-w-[400px]');
    expect(menuCard).not.toContain('group-hover:scale');
    expect(menuCard).toContain('{item.imageUrl && <DishBackdrop');
    expect(variant).toContain('DishBackdrop');
    expect(variant).toContain('usePhotoBackdrop && heroSrc && <DishBackdrop');
    expect(variant).toContain('PHOTO_TEXT_SHADOW');
    expect(variant).not.toContain('PHOTO_TEXT_PANEL');
  });

  it('does not force an image onto text-only cards', () => {
    const presented = applyMenuPresentation(getMenus());
    const rows = flattenItems(presented);
    const byName = (name: string) => rows.find(({ item }) => photoKey(item.name) === photoKey(name))?.item;
    expect(byName('Tenders')?.imageUrl).toBeUndefined();
    expect(byName('Carnitas Crunchwrap')?.imageUrl).toBeUndefined();
    expect(byName('Carne Asada Crunchwrap')?.imageUrl).toBeUndefined();
    expect(byName('Hummus Plate')?.imageUrl).toBeUndefined();
    expect(byName('Cheeseburger Crunchwrap')?.imageUrl).toBe('/images/polished/burger-wrap.jpg');
  });

  it('puts Oreo Churros on Sweets with its own plate, not the ice-cream churros', () => {
    const presented = applyMenuPresentation(getMenus());
    const sweets = presented[0].groups.find((g) => /^(sweets?|sweet stuff)$/i.test(g.name));
    const oreo = sweets?.items.find((item) => photoKey(item.name) === 'oreo churros');
    expect(oreo?.name).toBe(OREO_CHURROS.name);
    expect(oreo?.description).toBe(OREO_CHURROS.description);
    expect(oreo?.imageUrl).toBe('/images/polished/oreo-churros.jpg');
    expect(oreo?.price).toBeUndefined();
    expect(oreo?.description).not.toMatch(/ice cream/i);
    expect(sweets?.items.filter((item) => photoKey(item.name) === 'oreo churros')).toHaveLength(1);

    const rows = flattenItems(presented);
    const churrosIceCream = rows.find(({ item }) => photoKey(item.name) === 'churros with vanilla ice cream');
    expect(churrosIceCream?.item.imageUrl).toBeUndefined();
    expect(photoForName('Churros')).toBeUndefined();
  });
});

describe('kitchen recipe copy', () => {
  it('resolves guest lines for philly, nachos, pasadena, and hoboken', () => {
    expect(copyForName('Philly Cheesesteak (Philly Billy)')).toBe(
      'Shaved ribeye, grilled onions, mushrooms, red pepper relish, cherry peppers, and melted provolone on an Amoroso roll.',
    );
    expect(copyForName('Philly Billy')).toBe(copyForName('Philadelphia'));
    expect(copyForName('Nachos')).toBe(
      'Crisp chips piled with beans, guacamole, melted cheese, Cheez Whiz, cilantro-lime crema, pico, and jalapeños.',
    );
    expect(copyForName('Pasadena (The OG Cheeseburger)')).toBe(
      'American cheese, lettuce, onion, pickles, tomato, and hero sauce on a brioche bun.',
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
      'Shaved ribeye, grilled onions, mushrooms, red pepper relish, cherry peppers, and melted provolone on an Amoroso roll.',
    );
    expect(byName('Nachos')?.description).toBe(
      'Crisp chips piled with beans, guacamole, melted cheese, Cheez Whiz, cilantro-lime crema, pico, and jalapeños.',
    );
    expect(byName('Pasadena (The OG Cheeseburger)')?.description).toBe(
      'American cheese, lettuce, onion, pickles, tomato, and hero sauce on a brioche bun.',
    );
    expect(byName('Hoboken (Italian)')?.description).toBe(
      'Ham, salami, capicola, mortadella, and provolone with lettuce, tomato, red onion, oil, vinegar, and oregano on an Italian roll.',
    );
    expect(byName('Cheeseburger Crunchwrap')?.description).toBe('Pressed tortilla, beef, cheese.');
    expect(byName('Carnitas Crunchwrap')?.description).toBe('Pressed tortilla, carnitas, cheese.');
    expect(byName('Antipasto')?.description).toMatch(/Italian vinaigrette/);

    const mains = presented[0].groups.find((g) => g.name === 'Mains');
    const starting = presented[0].groups.find((g) => g.name === 'Starting');
    const nachos = starting?.subGroups?.find((g) => g.name === 'Nachos');
    const sliders = starting?.subGroups?.find((g) => g.name === 'Sliders');
    const philly = mains?.subGroups?.find((g) => /philly/i.test(g.name));
    expect(nachos?.description).toBe(copyForName('Nachos'));
    expect(sliders?.description).toBe(copyForName('Sliders'));
    expect(philly?.description).toBe(copyForName('Philly Billy'));

    const breakfastCarne = rows.find(({ group, item }) => group === 'SD Burrito' && item.name === 'Carne Asada');
    expect(breakfastCarne?.item.description).toBeUndefined();
  });
});

describe('applyMenuPresentation', () => {
  it('adds the kitchen specials with honest photos', () => {
    const presented = applyMenuPresentation(getMenus());
    const items = flattenItems(presented).map(({ item }) => item);
    for (const special of KITCHEN_SPECIALS) {
      const found = items.find((item) => photoKey(item.name) === photoKey(special.name));
      expect(found, special.name).toBeTruthy();
      expect(found?.description).toBe(special.description);
      expect(found?.imageUrl).toMatch(/^\/images\/polished\//);
      expect(found?.price).toBeUndefined();
    }
  });

  it('puts Crunch Wraps on Mains and retires leftover Burger Wrap', () => {
    const presented = applyMenuPresentation(getMenus());
    const mains = presented[0].groups.find((g) => g.name === 'Mains');
    const crunch = mains?.subGroups?.find((g) => g.name === 'Crunch Wraps');
    const kitchen = mains?.subGroups?.find((g) => g.name === 'Kitchen Specials');
    expect(crunch).toBeTruthy();
    expect(crunch?.items.map((item) => item.name)).toEqual([
      'Cheeseburger Crunchwrap',
      'Carnitas Crunchwrap',
      'Carne Asada Crunchwrap',
    ]);
    expect(crunch?.items.map((item) => item.description)).toEqual([
      'Pressed tortilla, beef, cheese.',
      'Pressed tortilla, carnitas, cheese.',
      'Pressed tortilla, carne asada, cheese.',
    ]);
    expect(crunch?.items.every((item) => item.price == null)).toBe(true);

    const rows = flattenItems(presented);
    expect(rows.filter(({ item }) => photoKey(item.name) === 'burger wrap')).toHaveLength(0);
    expect(rows.filter(({ item }) => photoKey(item.name) === 'cheeseburger crunchwrap')).toHaveLength(1);
    expect(kitchen?.items.some((item) => /wrap/i.test(item.name))).toBe(false);

    const cheese = crunch?.items.find((item) => item.name === 'Cheeseburger Crunchwrap');
    expect(cheese?.imageUrl).toBe('/images/polished/burger-wrap.jpg');
    expect(crunch?.items.find((item) => item.name === 'Carnitas Crunchwrap')?.imageUrl).toBeUndefined();
    expect(crunch?.items.find((item) => item.name === 'Carne Asada Crunchwrap')?.imageUrl).toBeUndefined();
    expect(crunch?.imageUrl).toBeUndefined();
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
    expect(names).toContain('Cheeseburger Crunchwrap');
    expect(names).toContain('Carnitas Crunchwrap');
    expect(names).toContain('Carne Asada Crunchwrap');
    expect(names).not.toContain('Burger Wrap');
    expect(names.filter((n) => n === 'Calamari')).toHaveLength(1);
    expect(names.filter((n) => n === 'Cheeseburger Crunchwrap')).toHaveLength(1);
  });

  it('migrates a leftover Burger Wrap kitchen special into Crunch Wraps once', () => {
    const leftover: Menu[] = [{
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
                { id: 'mains-kitchen-specials-spicy-chicken', name: 'Spicy Chicken', description: 'Crispy chicken, bacon, melted jack.' },
                { id: 'mains-kitchen-specials-burger-wrap', name: 'Burger Wrap', description: 'Pressed tortilla, beef, cheese.' },
              ],
            },
          ],
        },
      ],
    }];
    const presented = applyMenuPresentation(leftover);
    const rows = flattenItems(presented);
    const names = rows.map(({ item }) => item.name);
    expect(names).toContain('Cheeseburger Crunchwrap');
    expect(names).toContain('Carnitas Crunchwrap');
    expect(names).toContain('Carne Asada Crunchwrap');
    expect(names).not.toContain('Burger Wrap');
    expect(names.filter((n) => n === 'Cheeseburger Crunchwrap')).toHaveLength(1);

    const cheese = rows.find(({ item }) => item.name === 'Cheeseburger Crunchwrap');
    expect(cheese?.group).toBe('Crunch Wraps');
    expect(cheese?.item.imageUrl).toBe('/images/polished/burger-wrap.jpg');
    expect(rows.find(({ item }) => item.name === 'Carnitas Crunchwrap')?.item.imageUrl).toBeUndefined();
    expect(rows.find(({ item }) => item.name === 'Carne Asada Crunchwrap')?.item.imageUrl).toBeUndefined();
    expect(rows.filter(({ group, item }) => group === 'Kitchen Specials' && /wrap/i.test(item.name))).toHaveLength(0);
  });

  it('does not duplicate specials already on the static menu', () => {
    const presented = applyMenuPresentation(getMenus());
    const names = flattenItems(presented).map(({ item }) => photoKey(item.name));
    expect(names.filter((n) => n === 'calamari')).toHaveLength(1);
    expect(names.filter((n) => n === 'spicy chicken')).toHaveLength(1);
    expect(names.filter((n) => n === 'cheeseburger crunchwrap')).toHaveLength(1);
    expect(names.filter((n) => n === 'carnitas crunchwrap')).toHaveLength(1);
    expect(names.filter((n) => n === 'carne asada crunchwrap')).toHaveLength(1);
    expect(names.filter((n) => n === 'burger wrap')).toHaveLength(0);
    for (const wrap of CRUNCH_WRAPS) {
      expect(names.filter((n) => n === photoKey(wrap.name))).toHaveLength(1);
    }
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
    expect(blob).toContain('Cheeseburger Crunchwrap');
    expect(blob).toContain('Carnitas Crunchwrap');
    expect(blob).toContain('Carne Asada Crunchwrap');
    expect(blob).not.toContain('Burger Wrap');
  });
});
