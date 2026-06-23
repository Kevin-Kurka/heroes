import type { Metadata } from 'next';
import { getAllEvents, getAllHolidays } from '@/lib/events';
import { getWatchPartyEventsJsonLd } from '@/lib/structured-data';
import EventsPageClient from './EventsPageClient';

export const metadata: Metadata = {
  title: 'Scoreboard — Every Game, Every Day',
  description:
    'Live scores, game schedules, and upcoming events on the big screens at American Heroes & Brew in Carlsbad. Catch every game.',
  alternates: { canonical: '/events' },
};

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const events = await getAllEvents();
  const allHolidays = getAllHolidays();
  // Model upcoming games as public watch-party Events hosted at the bar so Google
  // / AI event surfaces can answer "where to watch [game] in Carlsbad". Null when
  // nothing is upcoming.
  const watchParties = getWatchPartyEventsJsonLd(events);
  return (
    <>
      {watchParties && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(watchParties) }}
        />
      )}
      <EventsPageClient events={events} allHolidays={allHolidays} />
    </>
  );
}
