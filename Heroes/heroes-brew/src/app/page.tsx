import { getUpcomingEvents } from '@/lib/events';
import HomePageClient from './HomePageClient';

export const dynamic = 'force-dynamic';

/**
 * Index into DAILY_SPECIALS (0=Mon … 3=Thu, -1 for Fri–Sun) for *today in
 * Carlsbad's timezone*. Computed server-side so the featured special follows
 * the restaurant's day — not the visitor's browser timezone — and renders
 * correctly on first paint (no client flash). `/` is force-dynamic, so this
 * re-evaluates every request.
 */
function getPacificSpecialIndex(): number {
  const weekday = new Date().toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'long',
  });
  const index: Record<string, number> = { Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3 };
  return weekday in index ? index[weekday] : -1;
}

export default async function HomePage() {
  const events = await getUpcomingEvents(6);
  return <HomePageClient events={events} todayIndex={getPacificSpecialIndex()} />;
}
