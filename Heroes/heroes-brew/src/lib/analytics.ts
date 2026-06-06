import { sendGAEvent } from '@next/third-parties/google';

/**
 * Single code path for GA4 custom events. The site already loads GA via
 * <GoogleAnalytics> in layout.tsx, but that only records pageviews — without
 * explicit events we can't see which CTAs (View Menu, Get Directions, Call,
 * Review, Share, Add-to-Calendar) actually convert. Route every CTA through
 * here so the GA4 "Events" report becomes the engagement dashboard.
 *
 * Analytics must never break the UI: this no-ops on the server and swallows any
 * failure (e.g. GA blocked by an ad-blocker or not yet loaded).
 */
export function trackEvent(
  name: string,
  params: Record<string, string | number | boolean> = {},
): void {
  if (typeof window === 'undefined') return;
  try {
    sendGAEvent('event', name, params);
  } catch {
    // Swallow — a missing/blocked analytics layer should never surface to users.
  }
}
