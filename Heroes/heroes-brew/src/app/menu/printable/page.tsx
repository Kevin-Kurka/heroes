import type { Metadata } from 'next';
import { getMenus } from '@/lib/menu';
import PrintableMenuClient from './PrintableMenuClient';

export const metadata: Metadata = {
  title: 'Printable Menus',
  description: 'Staff-only print-ready menus with prices. Not for public use.',
  robots: { index: false, follow: false },
};

// The printable layout is bound to the curated static menu's group structure
// (fixed section components + ids), so it renders from the static menu — and its
// CSV/xlsx export is what seeds the live Google Sheet. The customer-facing /menu
// is the sheet-driven surface (see src/lib/menu-sheet.ts).
export default function PrintableMenuPage() {
  const menus = getMenus();
  return <PrintableMenuClient menus={menus} />;
}
