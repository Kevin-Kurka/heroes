'use client';

import { useState } from 'react';
import { CalendarPlus, Share2, Check } from 'lucide-react';
import { UnifiedEvent } from '@/types';
import { downloadEventIcs } from '@/lib/calendar';
import { trackEvent } from '@/lib/analytics';

interface Props {
  event: UnifiedEvent;
  /** Show "Add to Calendar" only for games that haven't started yet. */
  showCalendar: boolean;
}

/**
 * Per-game actions on the Scoreboard. "Add to Calendar" turns a listed game into
 * a reminder to come watch it here; "Share" lets a fan invite friends to the
 * watch party. Both are the engagement levers that make a static schedule
 * actionable — and both report to GA4 so we can see what fans actually use.
 */
export default function EventActions({ event, showCalendar }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCalendar = () => {
    downloadEventIcs(event);
    trackEvent('add_to_calendar', { event_id: event.id, league: event.league ?? 'NA' });
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/events`;
    const text =
      event.awayTeam && event.homeTeam
        ? `${event.awayTeam} vs ${event.homeTeam} on the big screens at American Heroes & Brew 🍻📺`
        : `${event.eventTitle} at American Heroes & Brew 🍻📺`;
    trackEvent('share_event', { event_id: event.id, league: event.league ?? 'NA' });

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'American Heroes & Brew', text, url });
      } catch {
        // User dismissed the native share sheet — not an error.
      }
      return;
    }
    // Desktop / no Web Share API: copy a ready-to-paste invite to the clipboard.
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (e.g. insecure context) — nothing more we can do.
    }
  };

  const btn =
    'inline-flex items-center gap-1.5 text-[11px] font-medium text-muted hover:text-accent transition-colors';

  return (
    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
      {showCalendar && (
        <button type="button" onClick={handleCalendar} className={btn} aria-label="Add this game to your calendar">
          <CalendarPlus size={13} />
          Add to Calendar
        </button>
      )}
      <button type="button" onClick={handleShare} className={btn} aria-label="Share this game">
        {copied ? <Check size={13} className="text-accent" /> : <Share2 size={13} />}
        {copied ? 'Link copied' : 'Share'}
      </button>
    </div>
  );
}
