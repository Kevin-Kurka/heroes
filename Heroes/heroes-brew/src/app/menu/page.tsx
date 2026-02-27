import type { Metadata } from 'next';
import { getMenus } from '@/lib/menu';
import MenuPageClient from './MenuPageClient';

export const metadata: Metadata = {
  title: 'Menu | American Heroes & Brew',
  description: 'Burgers, wings, craft brews and more at American Heroes & Brew in Carlsbad, CA.',
};

export default function MenuPage() {
  const menus = getMenus();
  return <MenuPageClient menus={menus} />;
}
