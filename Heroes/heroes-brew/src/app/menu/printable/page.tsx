import type { Metadata } from 'next';
import { getMenus } from '@/lib/menu';
import PrintableMenuClient from './PrintableMenuClient';

export const metadata: Metadata = {
  title: 'Printable Menus',
  description: 'Print-ready menu pages for staff use.',
  robots: { index: false, follow: false },
};

export default function PrintableMenuPage() {
  const menus = getMenus();
  return <PrintableMenuClient menus={menus} />;
}
