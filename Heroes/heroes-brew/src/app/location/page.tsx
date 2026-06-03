import type { Metadata } from 'next';
import { getRestaurantInfo } from '@/lib/menu';
import LocationPageClient from './LocationPageClient';

export const metadata: Metadata = {
  title: 'Location & Hours in Carlsbad Village',
  description:
    'Find American Heroes & Brew at 300 Carlsbad Village Drive, Carlsbad, CA 92008. Hours, directions, parking, and contact info.',
  alternates: { canonical: '/location' },
};

export default function LocationPage() {
  const restaurant = getRestaurantInfo();
  return <LocationPageClient restaurant={restaurant} />;
}
