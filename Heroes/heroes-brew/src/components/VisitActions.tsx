/**
 * FILE: VisitActions.tsx
 * PURPOSE: Shared Directions / Call / Order buttons for conversion surfaces.
 *
 * OVERVIEW:
 * One three-action row used by the sticky conversion bar and the /location
 * page so Maps and social traffic always see the same visit paths, styled with
 * the existing flag-red / navy / card tokens.
 *
 * DEPENDENCIES:
 * - lucide-react (MapPin, Phone)
 * - ./DoorDashIcon.tsx
 * - ../lib/visit.ts
 * - ../lib/analytics.ts
 *
 * EXPORTS:
 * - default VisitActions
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Bar (compact sticky) and page (above-fold) variants
 *
 * RELATED FILES:
 * - src/components/ConversionBar.tsx
 * - src/app/location/LocationPageClient.tsx
 *
 * LAST UPDATED: 2026-09-29
 * MAINTAINER: American Heroes & Brew
 */
'use client';

import { MapPin, Phone } from 'lucide-react';
import DoorDashIcon from '@/components/DoorDashIcon';
import { trackEvent } from '@/lib/analytics';
import { DIRECTIONS_URL, DOORDASH_URL, PHONE_TEL } from '@/lib/visit';

interface Props {
  /** GA source label, e.g. conversion_bar or location. */
  source: string;
  /** Compact icon stack for the sticky bar; larger row for page heroes. */
  variant?: 'bar' | 'page';
}

export default function VisitActions({ source, variant = 'bar' }: Props) {
  const isBar = variant === 'bar';
  const rowClass = isBar
    ? 'grid grid-cols-3 gap-1.5 px-2 py-1.5'
    : 'grid grid-cols-3 gap-2';
  const btnBase = isBar
    ? 'inline-flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-sm px-1 py-1.5 text-[11px] font-semibold leading-none'
    : 'inline-flex min-h-12 items-center justify-center gap-1.5 rounded-sm px-2 py-3 text-sm font-semibold';

  return (
    <div className={rowClass} role="group" aria-label="Visit American Heroes & Brew">
      <a
        href={DIRECTIONS_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Get Directions"
        onClick={() => trackEvent('get_directions', { source })}
        className={`${btnBase} bg-navy text-white hover:bg-navy/80 transition-colors`}
      >
        <MapPin size={isBar ? 16 : 18} />
        {isBar ? 'Directions' : 'Get Directions'}
      </a>
      <a
        href={`tel:${PHONE_TEL}`}
        aria-label="Call (760) 994-0187"
        onClick={() => trackEvent('call', { source })}
        className={`${btnBase} bg-card border border-border text-foreground hover:border-accent/40 transition-colors`}
      >
        <Phone size={isBar ? 16 : 18} />
        Call
      </a>
      <a
        href={DOORDASH_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Order on DoorDash"
        onClick={() => trackEvent('order_doordash', { source })}
        className={`${btnBase} bg-accent text-white hover:bg-accent-dim transition-colors`}
      >
        <DoorDashIcon size={isBar ? 14 : 16} />
        Order
      </a>
    </div>
  );
}
