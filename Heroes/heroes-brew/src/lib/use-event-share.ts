import { useRef, useState } from 'react';
import { UnifiedEvent } from '@/types';
import {
  eventCalendarTitle,
  buildInviteText,
  buildGoogleCalendarUrl,
  buildEventImageUrl,
} from '@/lib/calendar';
import { trackEvent } from '@/lib/analytics';

/**
 * Shared "Let's Go" behaviour for a Scoreboard event, so the whole card and the
 * chip inside it trigger the exact same action and stay in sync. One tap opens
 * the native share sheet with the branded matchup image attached (lands in the
 * MMS), plus a polished text invite and a Google Calendar link. Falls back to a
 * text + calendar-link share, then to opening the calendar event + copying on
 * desktop.
 *
 * The card image is prefetched on hover/touch so the share sheet opens promptly
 * within the user gesture instead of waiting on the network.
 */
export function useEventShare(event: UnifiedEvent) {
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<File | null>(null);
  const cachedUrlRef = useRef<string | null>(null);

  // Image URL is derived from the live event data (teams, logos, date/time), so
  // it changes whenever the feed does. Keyed against the prefetched file below
  // so a refreshed/rescheduled game always shares its current card, never a
  // stale one — even if React keeps the same card instance (same event id).
  const imageUrl = buildEventImageUrl(event);

  const prefetchImage = async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    if (fileRef.current && cachedUrlRef.current === imageUrl) return;
    try {
      const res = await fetch(imageUrl);
      if (res.ok) {
        const blob = await res.blob();
        fileRef.current = new File([blob], `heroes-${event.id}.png`, { type: 'image/png' });
        cachedUrlRef.current = imageUrl;
      }
    } catch {
      // Image is a nice-to-have — the share still works without it.
    }
  };

  const share = async (): Promise<void> => {
    const title = eventCalendarTitle(event);
    const text = buildInviteText(event);
    const calendarUrl = buildGoogleCalendarUrl(event);
    trackEvent('lets_go', { event_id: event.id, league: event.league ?? 'NA' });

    if (!fileRef.current || cachedUrlRef.current !== imageUrl) await prefetchImage();
    const file = fileRef.current;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        if (file && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title, text, url: calendarUrl });
        } else {
          await navigator.share({ title, text, url: calendarUrl });
        }
      } catch {
        // User dismissed the share sheet — not an error.
      }
      return;
    }

    // Desktop fallback: open the calendar event and copy a ready-to-paste invite.
    window.open(calendarUrl, '_blank', 'noopener,noreferrer');
    try {
      await navigator.clipboard.writeText(`${text}\n${calendarUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context) — the calendar tab still opened.
    }
  };

  return { share, copied, prefetchImage };
}
