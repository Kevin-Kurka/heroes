/* eslint-disable @next/next/no-img-element -- team logos are dynamic remote URLs
   (ESPN/MLB); next/image adds no value for a one-off share landing. */
import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarPlus, Navigation, ListChecks, UtensilsCrossed } from 'lucide-react';
import { SITE_URL } from '@/lib/structured-data';
import { getAllEvents, getAllHolidays } from '@/lib/events';
import { buildGoogleCalendarUrl, formatEventWhen, eventCalendarTitle } from '@/lib/calendar';
import { buildEventImagePath, MAPS_URL } from '@/lib/share-content';
import type { UnifiedEvent } from '@/types';

// Re-fetch the feed at most every 5 minutes; the looked-up event fully determines
// the page, so a changed/rescheduled game refreshes within that window.
export const revalidate = 300;

/** Find a shared event by id across sports + holidays. Returns null if the game
 *  has rotated out of the feed window (link then degrades to a generic landing). */
async function findEvent(id: string): Promise<UnifiedEvent | null> {
  try {
    const [events, holidays] = await Promise.all([getAllEvents(), Promise.resolve(getAllHolidays())]);
    return [...events, ...holidays].find((e) => e.id === id) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await findEvent(id);
  if (!event) {
    return {
      title: 'Game Day at American Heroes & Brew',
      description: 'Carlsbad & North County\'s go-to sports bar. Every game on the big screens.',
      alternates: { canonical: '/events' },
    };
  }

  const headline = eventCalendarTitle(event).replace(' @ ', ' at ');
  const description = `${formatEventWhen(event)} · 300 Carlsbad Village Dr, Carlsbad. Every game on the big screens — let's go!`;
  const image = `${SITE_URL}${buildEventImagePath(event)}`;

  return {
    title: headline,
    description,
    alternates: { canonical: '/events' },
    openGraph: {
      title: headline,
      description,
      url: `${SITE_URL}/g/${id}`,
      siteName: 'American Heroes & Brew',
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: headline }],
    },
    twitter: { card: 'summary_large_image', title: headline, description, images: [image] },
  };
}

export default async function GameSharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await findEvent(id);
  const isMatchup = Boolean(event?.awayTeam && event?.homeTeam);
  const calendarUrl = event ? buildGoogleCalendarUrl(event) : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="rounded-xl border border-accent/30 bg-card/70 backdrop-blur-md p-6 sm:p-8 text-center">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
          {event?.league ? `${event.league} · Watch Party` : 'Watch Party'}
        </div>

        {event && isMatchup ? (
          <div className="mt-6 flex items-center justify-center gap-5">
            <div className="flex flex-col items-center w-28">
              {event.awayLogo && <img src={event.awayLogo} alt="" className="w-16 h-16 object-contain" />}
              <span className="text-sm font-semibold text-foreground mt-2">{event.awayTeam}</span>
            </div>
            <span className="text-2xl font-extrabold text-accent">VS</span>
            <div className="flex flex-col items-center w-28">
              {event.homeLogo && <img src={event.homeLogo} alt="" className="w-16 h-16 object-contain" />}
              <span className="text-sm font-semibold text-foreground mt-2">{event.homeTeam}</span>
            </div>
          </div>
        ) : (
          <h1 className="mt-4 text-2xl font-extrabold text-foreground">
            {event?.eventTitle ?? 'Every Game, Every Day'}
          </h1>
        )}

        <p className="mt-6 text-base font-semibold text-foreground">
          {event ? 'Catch it on the big screens at American Heroes & Brew' : 'Catch every game at American Heroes & Brew'}
        </p>
        {event && <p className="mt-1 text-sm text-muted">{formatEventWhen(event)}</p>}
        <p className="text-sm text-muted">300 Carlsbad Village Dr #120, Carlsbad · Carlsbad Village</p>

        <div className="mt-7 grid grid-cols-2 gap-3">
          {calendarUrl && (
            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-accent text-white font-semibold px-4 py-3 rounded-md hover:bg-accent-dim transition-colors"
            >
              <CalendarPlus size={18} /> Add to Calendar
            </a>
          )}
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-navy text-white font-medium px-4 py-3 rounded-md hover:bg-navy/80 transition-colors"
          >
            <Navigation size={18} /> Directions
          </a>
          <Link
            href="/events"
            className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-foreground font-medium px-4 py-3 rounded-md hover:bg-white/10 transition-colors"
          >
            <ListChecks size={18} /> All Games
          </Link>
          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-foreground font-medium px-4 py-3 rounded-md hover:bg-white/10 transition-colors"
          >
            <UtensilsCrossed size={18} /> View Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
