import type { Metadata } from 'next';
import { getMenus } from '@/lib/menu';
import { applyMenuPresentation } from '@/lib/menu-photos';
import { getMenuJsonLd } from '@/lib/structured-data';
import MenuPageClient from './MenuPageClient';

export const metadata: Metadata = {
  title: 'Menu',
  description:
    'Our menu rotates — items vary daily. Ask your server what\'s available today. Burgers, sandwiches, wings, and weekend breakfast at American Heroes & Brew in Carlsbad Village.',
  alternates: { canonical: '/menu' },
};

export default function MenuPage() {
  const menus = applyMenuPresentation(getMenus());
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getMenuJsonLd(menus)) }}
      />
      <MenuPageClient menus={menus} />
    </>
  );
}
