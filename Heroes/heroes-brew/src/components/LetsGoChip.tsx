'use client';

import { useState } from 'react';
import { PartyPopper, Check } from 'lucide-react';
import { UnifiedEvent } from '@/types';
import { eventCalendarTitle, buildInviteText, buildGoogleCalendarUrl } from '@/lib/calendar';
import { trackEvent } from '@/lib/analytics';

/**
 * One-tap "Let's Go" — invite friends and add the game to a calendar in a single
 * action. Shares a polished text invite (title, date/time range, location) plus
 * a Google Calendar link with the full event baked in. Modern messaging renders
 * this natively, so no .ics attachment is needed: the native share sheet reaches
 * Messages, Mail, and WhatsApp, and the user picks friends from their own
 * contacts. Desktop falls back to opening the calendar event + copying the invite.
 */
export default function LetsGoChip({ event }: { event: UnifiedEvent }) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const title = eventCalendarTitle(event);
    const text = buildInviteText(event);
    const calendarUrl = buildGoogleCalendarUrl(event);
    trackEvent('lets_go', { event_id: event.id, league: event.league ?? 'NA' });

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
      await navigator.clipboard.writeText(`${text}\n${calendarUrl}`);
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
