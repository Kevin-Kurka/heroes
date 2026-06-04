import type { Metadata } from 'next';
import { getRestaurantInfo } from '@/lib/menu';
import LocationPageClient from './LocationPageClient';

export const metadata: Metadata = {
  title: 'Location & Hours in Carlsbad Village',
  description:
    'Find American Heroes & Brew at 300 Carlsbad Village Drive, Carlsbad, CA 92008. Hours, directions, parking, and contact info.',
  alternates: { canonical: '/location' },
};

// Re-evaluate per request so the highlighted "today" hours row reflects the
// real current day in Carlsbad — not the day the page was statically built.
export const dynamic = 'force-dynamic';

export default function LocationPage() {
  const restaurant = getRestaurantInfo();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    timeZone: 'America/Los_Angeles',
  });
  return <LocationPageClient restaurant={restaurant} today={today} />;
}
