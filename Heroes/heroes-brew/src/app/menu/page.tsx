import type { Metadata } from 'next';
import { getMenus } from '@/lib/toast';
import MenuPageClient from './MenuPageClient';

export const metadata: Metadata = {
  title: 'Menu | American Heroes & Brew',
  description: 'Burgers, wings, craft brews and more at American Heroes & Brew in Carlsbad, CA.',
};

export const revalidate = 900; // ISR 15 min

export default async function MenuPage() {
  const menus = await getMenus();
  return <MenuPageClient menus={menus} />;
}
