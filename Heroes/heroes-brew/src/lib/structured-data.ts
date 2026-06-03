import { getRestaurantInfo } from './menu';

export const SITE_URL = 'https://americanheroesandbrew.com';
const INSTAGRAM_URL = 'https://www.instagram.com/americanheroesandbrew/';

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
    sameAs: [INSTAGRAM_URL],
    openingHoursSpecification: r.hours.map((day) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: day.dayOfWeek,
      opens: to24Hour(day.open),
      closes: to24Hour(day.close),
    })),
  };
}
