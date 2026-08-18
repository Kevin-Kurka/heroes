import type { Metadata } from 'next';
import { resolveMenus } from '@/lib/menu-sheet';
import { getMenuJsonLd } from '@/lib/structured-data';
import MenuPageClient from './MenuPageClient';

export const metadata: Metadata = {
  title: 'Menu',
  description:
    'The kitchen and bar menu at American Heroes & Brew — burgers, sandwiches, wings, and weekend breakfast at the family sports bar in Carlsbad Village.',
  alternates: { canonical: '/menu' },
};

// Re-pull the live Google Sheet menu (when configured) at most once a minute.
export const revalidate = 60;

export default async function MenuPage() {
  const menus = await resolveMenus();
  return (
    <>
      <script
        type="application/ld+json"
        // schema.org/Menu built from the live (sheet-driven) menu.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getMenuJsonLd(menus)) }}
      />
      <MenuPageClient menus={menus} />
    </>
  );
}
