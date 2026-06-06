import type { Metadata } from 'next';
import { resolveMenus } from '@/lib/menu-sheet';
import PrintableMenuClient from './PrintableMenuClient';

export const metadata: Metadata = {
  title: 'Printable Menus',
  description: 'Print-ready menu pages for staff use.',
  robots: { index: false, follow: false },
};

export const revalidate = 60;

export default async function PrintableMenuPage() {
  const menus = await resolveMenus();
  return <PrintableMenuClient menus={menus} />;
}
