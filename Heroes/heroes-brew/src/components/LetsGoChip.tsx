'use client';

import { useState } from 'react';
import { PartyPopper, Check } from 'lucide-react';
import { UnifiedEvent } from '@/types';
import { buildEventIcs, eventCalendarTitle, buildInviteText, buildGoogleCalendarUrl } from '@/lib/calendar';
import { trackEvent } from '@/lib/analytics';

/**
 * One-tap "Let's Go" — invite friends AND add the game to a calendar in a single
 * action. We prefer sharing the actual .ics invite through the device's native
 * share sheet, so one tap reaches Messages, Mail, WhatsApp and the Calendar app,
 * and the user picks friends from their own contacts. Falls back to a text+link
 * share, then to opening the calendar event + copying the invite on desktop.
 */
export default function LetsGoChip({ event }: { event: UnifiedEvent }) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const title = eventCalendarTitle(event);
    const text = buildInviteText(event);
    const calendarUrl = buildGoogleCalendarUrl(event);
    trackEvent('lets_go', { event_id: event.id, league: event.league ?? 'NA' });

    // Best path (mobile): share the calendar invite file itself.
    try {
      const file = new File([buildEventIcs(event)], `heroes-${event.id}.ics`, {
        type: 'text/calendar',
      });
      if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title, text });
        return;
      }
    } catch {
      // File/canShare unsupported, or the user dismissed the sheet — fall through.
    }

    // Next best: share text + a calendar link friends can one-tap add.
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url: calendarUrl });
      } catch {
        // User dismissed the share sheet — not an error.
      }
      return;
    }

    // Desktop fallback: open the calendar event and copy a ready-to-paste invite.
    window.open(calendarUrl, '_blank', 'noopener,noreferrer');
    try {
      await navigator.clipboard.writeText(`${text} ${calendarUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context) — the calendar tab still opened.
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Invite friends and add this game to your calendar"
      className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/15 px-2.5 py-1 text-[11px] font-semibold text-accent hover:bg-accent/25 transition-colors"
    >
      {copied ? <Check size={12} /> : <PartyPopper size={12} />}
      {copied ? 'Copied' : "Let's Go"}
    </button>
  );
}
