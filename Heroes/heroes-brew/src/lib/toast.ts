import { ToastMenu, ToastMenuGroup, ToastMenuItem, ToastRestaurant, DaySchedule } from '@/types';

const API_HOST = process.env.TOAST_API_HOST || 'https://ws-api.toasttab.com';
const CLIENT_ID = process.env.TOAST_CLIENT_ID || '';
const CLIENT_SECRET = process.env.TOAST_CLIENT_SECRET || '';
const RESTAURANT_GUID = process.env.TOAST_RESTAURANT_GUID || '';

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token;
  }

  const res = await fetch(`${API_HOST}/authentication/v1/authentication/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      userAccessType: 'TOAST_MACHINE_CLIENT',
    }),
  });

  if (!res.ok) {
    throw new Error(`Toast auth failed: ${res.status}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.token?.accessToken || data.accessToken || data.token,
    expiresAt: Date.now() + (data.token?.expiresIn || data.expiresIn || 3600) * 1000,
  };
  return cachedToken.token;
}

async function toastFetch(endpoint: string) {
  const token = await getAccessToken();
  const res = await fetch(`${API_HOST}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Toast-Restaurant-External-ID': RESTAURANT_GUID,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 900 }, // ISR: 15 min
  });
  if (!res.ok) throw new Error(`Toast API ${endpoint}: ${res.status}`);
  return res.json();
}

// =====================
// Menu
// =====================
export async function getMenus(): Promise<ToastMenu[]> {
  try {
    const data = await toastFetch('/menus/v2/menus');
    const menus = Array.isArray(data) ? data : data.menus || [data];
    return menus.map(flattenMenu);
  } catch (err) {
    console.error('Failed to fetch menus from Toast:', err);
    return getMockMenus();
  }
}

function flattenMenu(raw: Record<string, unknown>): ToastMenu {
  const groups = ((raw.groups || raw.menuGroups || []) as Record<string, unknown>[]).map(
    (g): ToastMenuGroup => ({
      guid: (g.guid || g.id || '') as string,
      name: (g.name || 'Unnamed Group') as string,
      description: g.description as string | undefined,
      items: ((g.items || g.menuItems || []) as Record<string, unknown>[]).map(
        (item): ToastMenuItem => ({
          guid: (item.guid || item.id || '') as string,
          name: (item.name || '') as string,
          description: item.description as string | undefined,
          price: resolvePrice(item),
          imageUrl: item.imageUrl as string | undefined,
          calories: item.calories as number | undefined,
        })
      ),
    })
  );

  return {
    guid: (raw.guid || raw.id || '') as string,
    name: (raw.name || 'Menu') as string,
    groups,
  };
}

function resolvePrice(item: Record<string, unknown>): number {
  if (typeof item.price === 'number') return item.price;
  if (typeof item.price === 'string') return parseFloat(item.price) || 0;
  const rules = item.pricingRules as Record<string, unknown>[] | undefined;
  if (Array.isArray(rules) && rules.length > 0) {
    return (rules[0].price as number) || 0;
  }
  return 0;
}

// =====================
// Restaurant / Location
// =====================
export async function getRestaurantInfo(): Promise<ToastRestaurant> {
  try {
    const data = await toastFetch(`/restaurants/v1/restaurants/${RESTAURANT_GUID}`);
    const loc = data.location || data;
    const schedules = data.schedules || data.schedule || [];

    return {
      name: data.restaurantName || data.name || 'American Heroes & Brew',
      address1: loc.address1 || '300 Carlsbad Village Drive',
      address2: loc.address2 || 'Suite 101',
      city: loc.city || 'Carlsbad',
      stateCode: loc.stateCode || 'CA',
      zipCode: loc.zipCode || '92008',
      phone: data.phone || loc.phone || '(760) 994-0187',
      latitude: loc.latitude || 33.1581,
      longitude: loc.longitude || -117.3506,
      hours: parseSchedule(schedules),
    };
  } catch (err) {
    console.error('Failed to fetch restaurant info from Toast:', err);
    return getMockRestaurant();
  }
}

function parseSchedule(schedules: Record<string, unknown>[]): DaySchedule[] {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  if (!schedules || schedules.length === 0) {
    return days.map(d => ({ dayOfWeek: d, open: '11:00 AM', close: '10:00 PM' }));
  }
  return days.map(day => {
    const entry = schedules.find(
      (s) => ((s.dayOfWeek || s.scheduleName || '') as string).toLowerCase().includes(day.toLowerCase())
    );
    return {
      dayOfWeek: day,
      open: (entry?.openTime || entry?.open || '11:00 AM') as string,
      close: (entry?.closeTime || entry?.close || '10:00 PM') as string,
    };
  });
}

// =====================
// Mock Data (fallback)
// =====================
function getMockMenus(): ToastMenu[] {
  return [
    {
      guid: 'mock-menu-1',
      name: 'Main Menu',
      groups: [
        {
          guid: 'g1',
          name: 'Starters',
          items: [
            { guid: 'i1', name: 'Award Winning Curly-Q Fries', description: 'Our famous seasoned curly fries, golden and crispy.', price: 8.99 },
            { guid: 'i2', name: 'Loaded Nachos', description: 'Tri-color tortilla chips topped with queso, jalapeños, pico, sour cream & guacamole.', price: 13.99 },
            { guid: 'i3', name: 'Wings (8pc)', description: 'Tossed in your choice of sauce: Buffalo, BBQ, Garlic Parm, or Dry Rub.', price: 14.99 },
            { guid: 'i4', name: 'Bavarian Pretzel Bites', description: 'Warm soft pretzel bites with beer cheese dip.', price: 10.99 },
            { guid: 'i5', name: 'Spinach Artichoke Dip', description: 'Creamy blend of spinach, artichoke hearts, parmesan. Served with tortilla chips.', price: 11.99 },
          ],
        },
        {
          guid: 'g2',
          name: 'Burgers',
          items: [
            { guid: 'i6', name: 'The Heroes Burger', description: 'Half-pound angus patty, aged cheddar, lettuce, tomato, onion, house sauce.', price: 15.99 },
            { guid: 'i7', name: 'BBQ Bacon Smash', description: 'Double smash patty, applewood smoked bacon, cheddar, crispy onion rings, BBQ drizzle.', price: 17.99 },
            { guid: 'i8', name: 'Mushroom Swiss', description: 'Sautéed mushrooms, swiss cheese, garlic aioli on a toasted brioche bun.', price: 16.49 },
            { guid: 'i9', name: 'Spicy Jalapeño Crunch', description: 'Pepper jack, fried jalapeños, chipotle mayo, pickled onions.', price: 16.99 },
          ],
        },
        {
          guid: 'g3',
          name: 'Sandwiches & Wraps',
          items: [
            { guid: 'i10', name: 'Philly Cheesesteak', description: 'Shaved ribeye, sautéed peppers & onions, provolone on a hoagie roll.', price: 15.49 },
            { guid: 'i11', name: 'Crispy Chicken Sandwich', description: 'Buttermilk fried chicken breast, pickles, slaw, spicy mayo.', price: 14.99 },
            { guid: 'i12', name: 'Turkey Club Wrap', description: 'Roasted turkey, bacon, avocado, lettuce, tomato, ranch in a flour tortilla.', price: 13.49 },
          ],
        },
        {
          guid: 'g4',
          name: 'Brews on Tap',
          items: [
            { guid: 'i13', name: 'Pizza Port Swami\'s IPA', description: 'Local Carlsbad IPA, citrus-forward with a malty backbone.', price: 7.50 },
            { guid: 'i14', name: 'Karl Strauss Red Trolley Ale', description: 'San Diego classic — smooth amber ale with caramel notes.', price: 7.00 },
            { guid: 'i15', name: 'Stone Delicious IPA', description: 'Gluten-reduced IPA with bright tropical hop character.', price: 7.50 },
            { guid: 'i16', name: 'Modelo Especial', description: 'Crisp Mexican lager, light & refreshing.', price: 6.00 },
            { guid: 'i17', name: 'Rotating Local Tap', description: 'Ask your server for this week\'s featured local craft brew.', price: 8.00 },
          ],
        },
        {
          guid: 'g5',
          name: 'Salads',
          items: [
            { guid: 'i18', name: 'Heroes Cobb', description: 'Grilled chicken, bacon, avocado, hard-boiled egg, blue cheese crumbles, ranch.', price: 14.99 },
            { guid: 'i19', name: 'Caesar Salad', description: 'Romaine, parmesan, croutons, house caesar dressing. Add chicken +$4.', price: 11.99 },
          ],
        },
      ],
    },
  ];
}

function getMockRestaurant(): ToastRestaurant {
  return {
    name: 'American Heroes & Brew',
    address1: '300 Carlsbad Village Drive',
    address2: 'Suite 101',
    city: 'Carlsbad',
    stateCode: 'CA',
    zipCode: '92008',
    phone: '(760) 994-0187',
    latitude: 33.1581,
    longitude: -117.3506,
    hours: [
      { dayOfWeek: 'Monday', open: '11:00 AM', close: '10:00 PM' },
      { dayOfWeek: 'Tuesday', open: '11:00 AM', close: '10:00 PM' },
      { dayOfWeek: 'Wednesday', open: '11:00 AM', close: '10:00 PM' },
      { dayOfWeek: 'Thursday', open: '11:00 AM', close: '11:00 PM' },
      { dayOfWeek: 'Friday', open: '11:00 AM', close: '12:00 AM' },
      { dayOfWeek: 'Saturday', open: '9:00 AM', close: '12:00 AM' },
      { dayOfWeek: 'Sunday', open: '9:00 AM', close: '10:00 PM' },
    ],
  };
}
