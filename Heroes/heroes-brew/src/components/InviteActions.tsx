'use client';

import { useState } from 'react';
import { Share2, CalendarPlus, Instagram, Facebook } from 'lucide-react';

const IG_URL = 'https://www.instagram.com/americanheroesandbrew/';
const FB_URL = 'https://www.facebook.com/AmericanHeroesAndBrew';
const ADDRESS = 'American Heroes & Brew, 300 Carlsbad Village Dr STE 120, Carlsbad, CA 92008';

interface CalendarEvent {
  title: string;
  /** ISO-8601 with offset, e.g. 2026-06-24T18:00:00-07:00 */
  startISO: string;
  endISO: string;
  details: string;
}

interface Props {
  shareTitle: string;
  shareText: string;
  shareUrl: string;
  /** When present, renders an "Add to Calendar" button (Google Calendar). */
  calendar?: CalendarEvent;
}

function googleCalendarUrl(c: CalendarEvent): string {
  const fmt = (iso: string) =>
    new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: c.title,
    dates: `${fmt(c.startISO)}/${fmt(c.endISO)}`,
    location: ADDRESS,
    details: c.details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Engagement actions for a landing/watch-party page — the "get people in the
 * door" layer the Google "Learn more" button lands on. Invite Friends uses the
 * native share sheet (with a clipboard fallback), plus add-to-calendar and
 * social follow. Client component; the surrounding page stays server-rendered.
 */
export default function InviteActions({ shareTitle, shareText, shareUrl, calendar }: Props) {
  const [msg, setMsg] = useState<string | null>(null);

  async function invite() {
    const data = { title: shareTitle, text: shareText, url: shareUrl };
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share(data);
        return;
      } catch {
        return; // user cancelled the share sheet
      }
    }
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setMsg('Link copied — text it to your crew! 🎉');
      setTimeout(() => setMsg(null), 2600);
    } catch {
      setMsg(shareUrl);
    }
  }

  const btn =
    'inline-flex items-center justify-center gap-2 font-semibold px-6 py-3 rounded-sm transition-colors';

  return (
    <div>
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <button onClick={invite} className={`${btn} bg-accent text-white hover:bg-accent-dim`}>
          <Share2 size={18} /> Invite Friends
        </button>
        {calendar && (
          <a
            href={googleCalendarUrl(calendar)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btn} bg-card border border-border text-foreground hover:border-accent/40`}
          >
            <CalendarPlus size={18} /> Add to Calendar
          </a>
        )}
        <a
          href={IG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btn} bg-card border border-border text-foreground hover:border-accent/40`}
        >
          <Instagram size={18} /> Follow
        </a>
        <a
          href={FB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btn} bg-card border border-border text-foreground hover:border-accent/40`}
        >
          <Facebook size={18} /> Facebook
        </a>
      </div>
      {msg && <p className="text-accent text-sm mt-2" role="status">{msg}</p>}
    </div>
  );
}
