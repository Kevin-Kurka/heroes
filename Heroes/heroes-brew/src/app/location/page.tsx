import type { Metadata } from 'next';
import { getRestaurantInfo } from '@/lib/toast';
import LocationPageClient from './LocationPageClient';

export const metadata: Metadata = {
  title: 'Location & Hours | American Heroes & Brew',
  description: 'Find American Heroes & Brew at 300 Carlsbad Village Drive, Carlsbad, CA. Hours, directions, and contact info.',
};

export const revalidate = 900;

export default async function LocationPage() {
  const restaurant = await getRestaurantInfo();
  return <LocationPageClient restaurant={restaurant} />;
}
