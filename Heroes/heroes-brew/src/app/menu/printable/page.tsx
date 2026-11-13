import type { Metadata } from 'next';
import { getMenus } from '@/lib/menu';
import PrintableMenuClient from './PrintableMenuClient';

export const metadata: Metadata = {
  title: 'Printable Menus',
  description: 'Staff-only print-ready menus with prices. Not for public use.',
  robots: { index: false, follow: false },
};

// Staff print view of the same static menu the public /menu page renders.
export default function PrintableMenuPage() {
  const menus = getMenus();
  return <PrintableMenuClient menus={menus} />;
}
