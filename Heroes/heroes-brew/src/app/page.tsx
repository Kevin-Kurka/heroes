import { getUpcomingEvents } from '@/lib/events';
import HomePageClient from './HomePageClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const events = await getUpcomingEvents(6);
  return <HomePageClient events={events} />;
}
