import { getRestaurantInfo } from '@/lib/menu';
import { resolveMenus } from '@/lib/menu-sheet';
import { FAQ } from '@/lib/faq';
import { SITE_URL } from '@/lib/structured-data';

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

  const body = `# American Heroes & Brew

> A family-friendly sports bar and restaurant in the heart of Carlsbad Village,
> North County San Diego. All-American food (burgers, wings, loaded fries,
> cheesesteaks, weekend breakfast), a full bar and craft beer, and 16 TVs
> showing every game — NFL, NBA, college football, and UFC.

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
- Mon: Mahalo Monday (Kalua pork sliders & draft deals)
- Tue: Taco Tuesday
- Wed: Wings & Well Wednesday
- Thu: Thirsty Thursday (burger & draft deals)
- Breakfast: served Fri–Sun, incl. 2-for-$22 breakfast

## FAQ
${faq}

## Pages
- Home: ${SITE_URL}/
- Menu: ${SITE_URL}/menu
- Scoreboard (live games & events): ${SITE_URL}/events
- Location & hours: ${SITE_URL}/location
- Social: ${SITE_URL}/social
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
