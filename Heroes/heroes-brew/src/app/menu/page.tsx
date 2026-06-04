import type { Metadata } from 'next';
import { getMenus } from '@/lib/menu';
import { getMenuJsonLd } from '@/lib/structured-data';
import MenuPageClient from './MenuPageClient';

export const metadata: Metadata = {
  title: 'Menu — Burgers, Wings & Craft Beer',
  description:
    'Our full menu of burgers, wings, sandwiches, and craft brews at American Heroes & Brew — the best sports bar in Carlsbad & North County.',
  alternates: { canonical: '/menu' },
};

export default function MenuPage() {
  const menus = getMenus();
  return (
    <>
      <script
        type="application/ld+json"
        // schema.org/Menu built from the curated menu (no user input).
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getMenuJsonLd()) }}
      />
      <MenuPageClient menus={menus} />
    </>
  );
}
