import { getRestaurantInfo, getMenus } from './menu';
import { FAQ } from './faq';
import type { MenuGroup } from '@/types';

export const SITE_URL = 'https://americanheroesandbrew.com';
const INSTAGRAM_URL = 'https://www.instagram.com/americanheroesandbrew/';
const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/kDDzKioKVaNBcUjN8';

/** Convert a 12-hour clock string ("10:00 AM", "12:00 AM") to 24-hour "HH:MM". */
function to24Hour(time: string): string {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return time;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

/**
 * Restaurant (LocalBusiness) JSON-LD for the homepage. Drives Google's
 * knowledge panel / rich result: hours, map, phone, cuisine, price range.
 * Sourced from the single curated record in menu.ts so it never drifts.
 */
export function getRestaurantJsonLd() {
  const r = getRestaurantInfo();
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${SITE_URL}/#restaurant`,
    name: r.name,
    url: SITE_URL,
    telephone: r.phone,
    image: `${SITE_URL}/logo-hires.png`,
    logo: `${SITE_URL}/logo-hires.png`,
    priceRange: '$$',
    servesCuisine: ['American', 'Burgers', 'Sandwiches', 'Bar Food'],
    acceptsReservations: false,
    address: {
      '@type': 'PostalAddress',
      streetAddress: [r.address1, r.address2].filter(Boolean).join(', '),
      addressLocality: r.city,
      addressRegion: r.stateCode,
      postalCode: r.zipCode,
      addressCountry: 'US',
    },
    geo:
      r.latitude && r.longitude
        ? { '@type': 'GeoCoordinates', latitude: r.latitude, longitude: r.longitude }
        : undefined,
    areaServed: [
      { '@type': 'City', name: 'Carlsbad' },
      { '@type': 'AdministrativeArea', name: 'North County San Diego' },
    ],
    hasMenu: `${SITE_URL}/menu`,
    hasMap: GOOGLE_MAPS_URL,
    sameAs: [INSTAGRAM_URL, GOOGLE_MAPS_URL],
    openingHoursSpecification: r.hours.map((day) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: day.dayOfWeek,
      opens: to24Hour(day.open),
      closes: to24Hour(day.close),
    })),
  };
}

/**
 * FAQPage JSON-LD for the homepage, mirroring the visible FAQ (faq.ts). Drives
 * Google's FAQ rich results and gives answer engines clean Q&A pairs to quote.
 */
export function getFaqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/#faq`,
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

/** Recursively convert a MenuGroup (and its subGroups/items) into a MenuSection. */
function groupToMenuSection(group: MenuGroup): Record<string, unknown> {
  const section: Record<string, unknown> = {
    '@type': 'MenuSection',
    name: group.name,
    ...(group.description ? { description: group.description } : {}),
  };
  const items = group.items.map((item) => ({
    '@type': 'MenuItem',
    name: item.name,
    ...(item.description ? { description: item.description } : {}),
    offers: {
      '@type': 'Offer',
      price: item.price.toFixed(2),
      priceCurrency: 'USD',
    },
  }));
  if (items.length) section.hasMenuItem = items;
  if (group.subGroups?.length) {
    section.hasMenuSection = group.subGroups.map(groupToMenuSection);
  }
  return section;
}

/**
 * schema.org/Menu JSON-LD for /menu, built from the curated menu so AI search
 * can cite specific dishes and prices. Linked to the Restaurant via inLanguage
 * + the shared SITE_URL identity.
 */
export function getMenuJsonLd() {
  const menus = getMenus();
  const sections = menus.flatMap((menu) => menu.groups.map(groupToMenuSection));
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    '@id': `${SITE_URL}/menu#menu`,
    name: 'American Heroes & Brew Menu',
    url: `${SITE_URL}/menu`,
    inLanguage: 'en-US',
    hasMenuSection: sections,
  };
}

/** BreadcrumbList JSON-LD from an ordered list of [name, path] pairs. */
export function getBreadcrumbJsonLd(trail: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
}
