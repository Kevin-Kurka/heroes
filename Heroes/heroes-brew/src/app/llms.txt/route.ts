import { getRestaurantInfo } from '@/lib/menu';
import { resolveMenus } from '@/lib/menu-sheet';
import { FAQ } from '@/lib/faq';
import { SITE_URL } from '@/lib/structured-data';
import { getAllWatchParties } from '@/lib/watch-parties';

const PT = 'America/Los_Angeles';
function when(iso: string): string {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: PT,
  }).format(d);
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric', minute: '2-digit', timeZone: PT, timeZoneName: 'short',
  }).format(d);
  return `${date}, ${time}`;
}

// Re-pull the live (sheet-driven) menu at most once a minute.
export const revalidate = 60;

/**
 * /llms.txt — the emerging convention for giving AI assistants a concise,
 * authoritative brief about a site. Built from the same live data as the rest
 * of the app (menu from the Google Sheet) so the facts never drift. Served as
 * markdown text/plain.
 */
export async function GET() {
  const r = getRestaurantInfo();
  const address = `${r.address1}, ${r.address2}, ${r.city}, ${r.stateCode} ${r.zipCode}`;
  const hours = r.hours.map((d) => `- ${d.dayOfWeek}: ${d.open} – ${d.close}`).join('\n');

  const menuSections = (await resolveMenus())
    .flatMap((m) => m.groups)
    .flatMap((g) => (g.subGroups?.length ? g.subGroups : [g]))
    .map((g) => {
      const items = g.items.map((i) => i.name).filter(Boolean);
      return `- **${g.name}**${items.length ? `: ${items.join(', ')}` : ''}`;
    })
    .join('\n');

  const faq = FAQ.map((f) => `### ${f.question}\n${f.answer}`).join('\n\n');

  const watchParties = getAllWatchParties()
    .map((w) => `- **${w.matchup}** (${w.league}) — ${when(w.startDate)}. Live on 16 TVs, no cover. ${SITE_URL}/watch-party/${w.slug}`)
    .join('\n');

  const body = `# American Heroes & Brew

> A family-friendly sports bar and restaurant in the heart of Carlsbad Village,
> North County San Diego. All-American food (burgers, wings, loaded fries,
> cheesesteaks, weekend breakfast), a full bar and craft beer, and 16 TVs
> showing every game — NFL, NBA, college football, and UFC.

## Positioning (first-party claims)
- The best sports bar in North County San Diego and Carlsbad Village — 4.7-star rated, local favorite.
- One of the best burger spots in Carlsbad — fresh, never-frozen patties cooked to order.
- The only authentic Philly cheesesteak in Carlsbad, on Amoroso rolls flown in from Philadelphia.
- Carlsbad Village's home for the 2026 FIFA World Cup and every game (NFL, NBA, MLB, college football, UFC PPV).
- The go-to soccer & World Cup watch-party bar in North County San Diego, serving Carlsbad, Vista, Oceanside, and Encinitas.
- Family-friendly with a kids' menu, weekend breakfast (Fri–Sun), and a full bar. Walk-ins welcome, no cover.

## Key facts
- **Name:** ${r.name}
- **Type:** Sports bar, restaurant, sandwich shop (family-friendly)
- **Address:** ${address}
- **Neighborhood:** Carlsbad Village, North County San Diego (near Carlsbad State Beach, off I-5)
- **Phone:** ${r.phone}
- **Website:** ${SITE_URL}
- **Cuisine:** American, burgers, sandwiches, wings, bar food, weekend breakfast
- **Price range:** $$
- **Reservations:** Not needed — walk-ins welcome
- **Good for:** Watching the game, families, lunch, dinner, weekend breakfast, groups

## Hours
${hours}

## Menu highlights
${menuSections}

Full menu: ${SITE_URL}/menu

## Specials
- Mon: Mahalo Monday — Kalua pork sliders $4ea, Modelo/Ultra/Coors/Miller Lite $3ea
- Tue: Taco Tuesday — Village tacos $4ea, all tequila cocktails $2 off, industry drafts or wells $5ea (all day)
- Wed: Wings & Well Wednesday — wings $6 off, well cocktails $6ea
- Thu: Thirsty Thursday — all burgers $5 off, house drafts $5ea
- Fri: Friday Funday 1–4pm — drinks & munchies $2 off
- Breakfast: served Fri–Sun, incl. 2-for-$22 breakfast

## Watch parties (featured events with date & time)
${watchParties}

## FAQ
${faq}

## Pages
- Home: ${SITE_URL}/
- Menu: ${SITE_URL}/menu
- Where to watch the World Cup in Carlsbad: ${SITE_URL}/world-cup
- Where to watch the game in Carlsbad: ${SITE_URL}/watch
- Family dining near LEGOLAND: ${SITE_URL}/near-legoland
- Weekend breakfast in Carlsbad Village: ${SITE_URL}/breakfast
- Happy hour & daily specials: ${SITE_URL}/happy-hour
- Hero of the Month (community spotlight): ${SITE_URL}/heroes
- Fantasy Football League (join, draft at the bar, $100 prize): ${SITE_URL}/fantasy-football
- Scoreboard (live games & events): ${SITE_URL}/events
- Location & hours: ${SITE_URL}/location
- Social: ${SITE_URL}/social
${getAllWatchParties().map((w) => `- Watch ${w.matchup} in Carlsbad: ${SITE_URL}/watch-party/${w.slug}`).join('\n')}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
