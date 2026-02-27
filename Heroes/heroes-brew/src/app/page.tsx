import { getUpcomingEvents } from '@/lib/events';
import HomePageClient from './HomePageClient';

export const revalidate = 900;

export default async function HomePage() {
  const events = await getUpcomingEvents(6);
  return <HomePageClient events={events} />;
}
