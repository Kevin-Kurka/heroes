import { getRestaurantInfo } from './menu';
import { FAQ } from './faq';
import { SHOW_PRICES, stripPriceTokens } from './config';
import type { Menu, MenuGroup } from '@/types';
import type { WatchParty } from './watch-parties';

export const SITE_URL = 'https://americanheroesandbrew.com';
const INSTAGRAM_URL = 'https://www.instagram.com/americanheroesandbrew/';
const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/kDDzKioKVaNBcUjN8';
// Official third-party profiles. Listing them as `sameAs` reconciles the entity
// across the web so search + answer engines are confident which business this is
// (a prerequisite for them to recommend it). Keep these verified and exact.
const YELP_URL = 'https://www.yelp.com/biz/american-heroes-and-brew-carlsbad';
const TRIPADVISOR_URL =
  'https://www.tripadvisor.com/Restaurant_Review-g32171-d23520498-Reviews-American_Heroes_Brew-Carlsbad_California.html';
const APPLE_MAPS_URL = 'https://maps.apple.com/place?place-id=IB43E54C8B7A7E734';

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
    sameAs: [INSTAGRAM_URL, GOOGLE_MAPS_URL, YELP_URL, TRIPADVISOR_URL, APPLE_MAPS_URL],
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

/**
 * Generic FAQPage JSON-LD from any Q&A list (used by the landing pages, which
 * each carry their own page-specific FAQ). Same shape as getFaqJsonLd but the
 * @id is namespaced to the page so multiple FAQ blocks can coexist site-wide.
 */
export function getGenericFaqJsonLd(
  faqs: ReadonlyArray<{ question: string; answer: string }>,
  pageUrl: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

/**
 * WebPage JSON-LD that ties a landing page to the Restaurant entity (via `about`
 * + `isPartOf`). Gives answer engines an explicit "this page is about American
 * Heroes & Brew" signal so on-page content is attributed to the business entity.
 */
export function getWebPageJsonLd(opts: {
  url: string;
  name: string;
  description: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${opts.url}#webpage`,
    url: opts.url,
    name: opts.name,
    description: opts.description,
    about: { '@id': `${SITE_URL}/#restaurant` },
    primaryImageOfPage: `${SITE_URL}/logo-hires.png`,
  };
}

/**
 * Build schema.org `performer` entries for a sports event. Google's Event rich
 * result wants a performer; for a watch party the performers are the competing
 * teams. Returns two SportsTeam performers when both sides are known, otherwise
 * a single PerformingGroup derived from the matchup/title so the field is never
 * missing. Splits "Away vs Home" / "Away @ Home" titles as a fallback.
 */
function buildPerformers(opts: {
  homeTeam?: string;
  awayTeam?: string;
  title?: string;
}): Array<Record<string, string>> {
  const { homeTeam, awayTeam, title } = opts;
  if (awayTeam && homeTeam) {
    return [
      { '@type': 'SportsTeam', name: awayTeam },
      { '@type': 'SportsTeam', name: homeTeam },
    ];
  }
  const parts = title
    ?.split(/\s+(?:vs\.?|@|at)\s+/i)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts && parts.length === 2) {
    return parts.map((name) => ({ '@type': 'SportsTeam', name }));
  }
  return [{ '@type': 'PerformingGroup', name: title || 'Live Sports' }];
}

/** Add `hours` to an ISO date-time string, returning a new ISO string (or null). */
function addHoursIso(start: string, hours: number): string | null {
  const t = Date.parse(start);
  if (!Number.isFinite(t)) return null;
  return new Date(t + hours * 3_600_000).toISOString();
}

/** Free, no-cover admission Offer for a watch party at the venue. */
function freeWatchPartyOffer(url: string): Record<string, string> {
  return {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url,
  };
}

/**
 * Watch-party Event JSON-LD for the live games on /events. Each upcoming sports
 * game is modeled as an Event *hosted at* American Heroes & Brew — i.e. a public
 * watch party — so Google/AI event surfaces can answer "where to watch [game] in
 * Carlsbad". Bounded to upcoming SPORTS events; past games and holidays are
 * excluded. Returns null when there's nothing upcoming (caller skips the script).
 */
export function getWatchPartyEventsJsonLd(events: ReadonlyArray<{
  id: string;
  eventTimestamp: string;
  eventTitle: string;
  eventType: string;
  homeTeam?: string;
  awayTeam?: string;
}>) {
  const r = getRestaurantInfo();
  const now = Date.now();
  const upcoming = events
    .filter((e) => e.eventType === 'SPORTS')
    .filter((e) => {
      const t = Date.parse(e.eventTimestamp);
      return Number.isFinite(t) && t >= now;
    })
    .slice(0, 12);
  if (!upcoming.length) return null;

  const location = {
    '@type': 'Restaurant',
    '@id': `${SITE_URL}/#restaurant`,
    name: r.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: [r.address1, r.address2].filter(Boolean).join(', '),
      addressLocality: r.city,
      addressRegion: r.stateCode,
      postalCode: r.zipCode,
      addressCountry: 'US',
    },
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${SITE_URL}/events#watch-parties`,
    name: 'Upcoming game-day watch parties at American Heroes & Brew',
    itemListElement: upcoming.map((e, i) => {
      const matchup =
        e.awayTeam && e.homeTeam ? `${e.awayTeam} vs ${e.homeTeam}` : e.eventTitle;
      // Sports broadcasts have no clean end; ~3h covers a full game + overtime.
      const endDate = addHoursIso(e.eventTimestamp, 3);
      const eventUrl = `${SITE_URL}/events`;
      return {
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Event',
          name: `Watch ${matchup} at American Heroes & Brew`,
          description: `Catch ${matchup} on 16 TVs at American Heroes & Brew, the family-friendly sports bar in Carlsbad Village. Every game, every day.`,
          startDate: e.eventTimestamp,
          ...(endDate ? { endDate } : {}),
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          eventStatus: 'https://schema.org/EventScheduled',
          location,
          performer: buildPerformers({
            homeTeam: e.homeTeam,
            awayTeam: e.awayTeam,
            title: e.eventTitle,
          }),
          organizer: { '@id': `${SITE_URL}/#restaurant` },
          offers: freeWatchPartyOffer(eventUrl),
          image: `${SITE_URL}/logo-hires.png`,
          url: eventUrl,
        },
      };
    }),
  };
}

/** Recursively convert a MenuGroup (and its subGroups/items) into a MenuSection. */
function groupToMenuSection(group: MenuGroup): Record<string, unknown> {
  const description = group.description ? stripPriceTokens(group.description) : undefined;
  const section: Record<string, unknown> = {
    '@type': 'MenuSection',
    name: group.name,
    ...(description ? { description } : {}),
  };
  const items = group.items.map((item) => {
    const itemDesc = item.description ? stripPriceTokens(item.description) : undefined;
    const node: Record<string, unknown> = {
      '@type': 'MenuItem',
      name: item.name,
      ...(itemDesc ? { description: itemDesc } : {}),
      ...(item.imageUrl ? { image: `${SITE_URL}${item.imageUrl}` } : {}),
    };
    if (SHOW_PRICES && item.price != null) {
      node.offers = {
        '@type': 'Offer',
        price: item.price.toFixed(2),
        priceCurrency: 'USD',
      };
    }
    return node;
  });
  if (items.length) section.hasMenuItem = items;
  if (group.subGroups?.length) {
    section.hasMenuSection = group.subGroups.map(groupToMenuSection);
  }
  return section;
}

/**
 * schema.org/Menu JSON-LD for /menu, built from the curated menu so AI search
 * can cite specific dishes. Prices are omitted while SHOW_PRICES is false.
 */
export function getMenuJsonLd(menus: Menu[]) {
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

/**
 * VideoObject JSON-LD for a promo reel (the watch-party videos). This is what
 * lets answer engines and Google Video surface the clip with its name,
 * description, thumbnail, upload date, and — crucially — the date/time of the
 * event it promotes, so "where to watch <matchup>" resolves to this video and
 * this venue. `uploadDate` defaults to the event's start date.
 */
export function getVideoObjectJsonLd(party: WatchParty) {
  const pageUrl = `${SITE_URL}/watch-party/${party.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': `${pageUrl}#video`,
    name: `${party.matchup} Watch Party at American Heroes & Brew — Carlsbad`,
    description:
      `Watch ${party.matchup} (${party.league}) live on 16 TVs at American Heroes & Brew, ` +
      `the family-friendly sports bar in Carlsbad Village, North County San Diego. ` +
      `Full bar, food all day, walk-ins welcome.`,
    thumbnailUrl: [`${SITE_URL}/promos-video/thumbs/${party.thumbFile}`],
    uploadDate: party.startDate,
    contentUrl: `${SITE_URL}/promos-video/${party.videoFile}`,
    embedUrl: pageUrl,
    regionsAllowed: 'US',
    publisher: { '@id': `${SITE_URL}/#restaurant` },
    about: { '@id': `${SITE_URL}/#restaurant` },
    keywords: party.keywords.join(', '),
  };
}

/**
 * Single watch-party Event JSON-LD for a /watch-party/<slug> page. Models the
 * game as a public watch party HOSTED AT American Heroes & Brew with the exact
 * start/end date-time, so event + AI surfaces can answer "what time / where to
 * watch <matchup> in Carlsbad". `offers` is a free, no-cover admission.
 */
export function getWatchPartyEventJsonLd(party: WatchParty) {
  const r = getRestaurantInfo();
  const pageUrl = `${SITE_URL}/watch-party/${party.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${pageUrl}#event`,
    name: `Watch ${party.matchup} at American Heroes & Brew`,
    description:
      `${party.matchup} (${party.league}) live on 16 TVs at American Heroes & Brew in Carlsbad Village. ` +
      `Family-friendly sports bar, full bar, food all day. Walk-ins welcome, no cover.`,
    startDate: party.startDate,
    endDate: party.endDate,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    sport: party.sport,
    performer: buildPerformers({ title: party.matchup }),
    image: [`${SITE_URL}/promos-video/thumbs/${party.thumbFile}`],
    location: {
      '@type': 'Restaurant',
      '@id': `${SITE_URL}/#restaurant`,
      name: r.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: [r.address1, r.address2].filter(Boolean).join(', '),
        addressLocality: r.city,
        addressRegion: r.stateCode,
        postalCode: r.zipCode,
        addressCountry: 'US',
      },
    },
    organizer: { '@id': `${SITE_URL}/#restaurant` },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: pageUrl,
    },
    url: pageUrl,
    subjectOf: { '@id': `${pageUrl}#video` },
  };
}
