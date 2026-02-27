import type { Metadata } from 'next';
import { getRestaurantInfo } from '@/lib/menu';
import LocationPageClient from './LocationPageClient';

export const metadata: Metadata = {
  title: 'Location & Hours | American Heroes & Brew',
  description: 'Find American Heroes & Brew at 300 Carlsbad Village Drive, Carlsbad, CA. Hours, directions, and contact info.',
};

export default function LocationPage() {
  const restaurant = getRestaurantInfo();
  return <LocationPageClient restaurant={restaurant} />;
}
