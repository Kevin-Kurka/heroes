/**
 * FILE: ConversionBar.tsx
 * PURPOSE: Sticky bottom Directions / Call / Order bar for visit conversion.
 *
 * OVERVIEW:
 * Sits in SiteChrome above BottomNav on mobile (and alone on desktop) so
 * Maps/social landings can get directions, call, or order on DoorDash without
 * scrolling. Hidden on print/utility routes by the parent chrome wrapper.
 *
 * DEPENDENCIES:
 * - ./VisitActions.tsx
 *
 * EXPORTS:
 * - default ConversionBar
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Sitewide sticky conversion actions
 *
 * RELATED FILES:
 * - src/components/SiteChrome.tsx
 * - src/app/layout.tsx
 *
 * LAST UPDATED: 2026-09-29
 * MAINTAINER: American Heroes & Brew
 */
import VisitActions from '@/components/VisitActions';

export default function ConversionBar() {
  return (
    <nav
      data-conversion-bar
      aria-label="Directions, call, and order"
      className="border-t border-border bg-card/95 backdrop-blur-md"
    >
      <div className="mx-auto w-full max-w-3xl md:max-w-xl md:px-2 md:py-0.5">
        <VisitActions source="conversion_bar" variant="bar" />
      </div>
    </nav>
  );
}
