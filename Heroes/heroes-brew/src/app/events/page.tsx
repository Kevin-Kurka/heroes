import type { Metadata } from 'next';
import { getAllEvents, getAllHolidays } from '@/lib/events';
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
  return <EventsPageClient events={events} allHolidays={allHolidays} />;
}
