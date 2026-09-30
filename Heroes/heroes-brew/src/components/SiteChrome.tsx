/**
 * FILE: SiteChrome.tsx
 * PURPOSE: Fixed bottom stack for the conversion bar plus mobile tab nav.
 *
 * OVERVIEW:
 * Root-layout chrome that keeps visit CTAs and thumb-zone navigation together,
 * with extra main-padding handled in layout.tsx. Hidden on print-only utility
 * pages (review table tent, printable menu) where a sticky bar would clash.
 *
 * DEPENDENCIES:
 * - next/navigation (usePathname)
 * - ./ConversionBar.tsx
 * - ./BottomNav.tsx
 *
 * EXPORTS:
 * - default SiteChrome
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Sitewide stack; hidden on /review/card and /menu/printable
 *
 * RELATED FILES:
 * - src/app/layout.tsx
 *
 * LAST UPDATED: 2026-09-29
 * MAINTAINER: American Heroes & Brew
 */
'use client';

import { usePathname } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import ConversionBar from '@/components/ConversionBar';

const HIDE_CHROME = new Set(['/review/card', '/menu/printable']);

export default function SiteChrome() {
  const pathname = usePathname();
  if (HIDE_CHROME.has(pathname)) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 print:hidden pb-[env(safe-area-inset-bottom)]">
      <ConversionBar />
      <BottomNav />
    </div>
  );
}
