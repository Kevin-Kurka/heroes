import type { Metadata } from 'next';
import { getAllEvents } from '@/lib/events';
import EventsPageClient from './EventsPageClient';

export const metadata: Metadata = {
  title: 'Events | American Heroes & Brew',
  description: 'Live sports, game schedules, and upcoming events at American Heroes & Brew in Carlsbad, CA.',
};

export const revalidate = 900;

export default async function EventsPage() {
  const events = await getAllEvents();
  return <EventsPageClient events={events} />;
}
