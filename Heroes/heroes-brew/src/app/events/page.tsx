import type { Metadata } from 'next';
import { getAllEvents, getAllHolidays } from '@/lib/events';
import EventsPageClient from './EventsPageClient';

export const metadata: Metadata = {
  title: 'Scoreboard | American Heroes & Brew',
  description: 'Live sports, game schedules, and upcoming events at American Heroes & Brew in Carlsbad, CA.',
};

export const revalidate = 900;

export default async function EventsPage() {
  const events = await getAllEvents();
  const allHolidays = getAllHolidays();
  return <EventsPageClient events={events} allHolidays={allHolidays} />;
}
