import { getUpcomingEvents } from '@/lib/events';
import { getFaqJsonLd } from '@/lib/structured-data';
import HomePageClient from './HomePageClient';
import AboutFaqSection from '@/components/AboutFaqSection';

export const dynamic = 'force-dynamic';

/**
 * Index into DAILY_SPECIALS (0=Mon … 6=Sun) for *today in Carlsbad's
 * timezone*. Computed server-side so the featured special follows the
 * restaurant's day — not the visitor's browser timezone — and renders
 * correctly on first paint (no client flash). `/` is force-dynamic, so this
 * re-evaluates every request.
 */
function getPacificSpecialIndex(): number {
  const weekday = new Date().toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'long',
  });
  const index: Record<string, number> = {
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5,
    Sunday: 6,
  };
  return weekday in index ? index[weekday] : 0;
}

export default async function HomePage() {
  const events = await getUpcomingEvents(6);
  return (
    <>
      <script
        type="application/ld+json"
        // FAQ rich-result data; mirrors the visible FAQ (no user input).
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getFaqJsonLd()) }}
      />
      <HomePageClient events={events} todayIndex={getPacificSpecialIndex()} />
      <AboutFaqSection />
    </>
  );
}
