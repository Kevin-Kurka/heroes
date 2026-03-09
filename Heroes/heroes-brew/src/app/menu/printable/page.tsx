import type { Metadata } from 'next';
import { getMenus } from '@/lib/menu';
import PrintableMenuClient from './PrintableMenuClient';

export const metadata: Metadata = {
  title: 'Printable Menus | American Heroes & Brew',
  description: 'Print-ready menu pages for staff use.',
};

export default function PrintableMenuPage() {
  const menus = getMenus();
  return <PrintableMenuClient menus={menus} />;
}
