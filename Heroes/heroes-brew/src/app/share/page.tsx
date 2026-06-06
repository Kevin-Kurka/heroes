/* eslint-disable @next/next/no-img-element -- team logos are dynamic remote URLs
   (ESPN/MLB); next/image adds no value for a one-off share landing. */
import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarPlus, Navigation, ListChecks, UtensilsCrossed } from 'lucide-react';
import { SITE_URL } from '@/lib/structured-data';
import { buildGoogleCalendarUrl } from '@/lib/calendar';
import type { UnifiedEvent } from '@/types';

type SearchParams = Record<string, string | string[] | undefined>;

const MAPS_URL =
  'https://www.google.com/maps/dir//American+Heroes+%26+Brew,+300+Carlsbad+Village+Dr+STE+120,+Carlsbad,+CA+92008';
const IMAGE_KEYS = ['title', 'when', 'away', 'home', 'aw', 'hm', 'league'] as const;

function str(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/** Rebuild the /api/og/event query from the landing params (excludes ts). */
function imageQuery(sp: SearchParams): string {
  const p = new URLSearchParams();
  for (const key of IMAGE_KEYS) {
    const v = str(sp[key]);
    if (v) p.set(key, v);
  }
  return p.toString();
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const away = str(sp.away);
  const home = str(sp.home);
  const when = str(sp.when);
  const title = str(sp.title) ?? 'Game Day at American Heroes & Brew';
  const headline = away && home ? `Watch ${away} vs ${home} at American Heroes & Brew` : title;
  const description = when
    ? `${when} · 300 Carlsbad Village Dr, Carlsbad. Every game on the big screens — let's go!`
    : 'Carlsbad & North County\'s go-to sports bar. Every game on the big screens.';
  const image = `${SITE_URL}/api/og/event?${imageQuery(sp)}`;

  return {
    title: headline,
    description,
    alternates: { canonical: '/events' },
    openGraph: {
      title: headline,
      description,
      url: `${SITE_URL}/share`,
      siteName: 'American Heroes & Brew',
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: headline }],
    },
    twitter: { card: 'summary_large_image', title: headline, description, images: [image] },
  };
}

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const away = str(sp.away);
  const home = str(sp.home);
  const awayLogo = str(sp.aw);
  const homeLogo = str(sp.hm);
  const league = str(sp.league);
  const when = str(sp.when);
  const title = str(sp.title);
  const ts = str(sp.ts);
  const isMatchup = Boolean(away && home);

  // Reconstruct a minimal event so we can reuse the calendar-link builder.
  const calendarUrl =
    ts && title
      ? buildGoogleCalendarUrl({
          id: '',
          eventType: isMatchup ? 'SPORTS' : 'HOLIDAY',
          eventTimestamp: ts,
          eventTitle: title,
          displayMessage: '',
          awayTeam: away,
          homeTeam: home,
          league: league as UnifiedEvent['league'],
        })
      : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="rounded-xl border border-accent/30 bg-card/70 backdrop-blur-md p-6 sm:p-8 text-center">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
          {league ? `${league} · Watch Party` : 'Watch Party'}
        </div>

        {isMatchup ? (
          <div className="mt-6 flex items-center justify-center gap-5">
            <div className="flex flex-col items-center w-28">
              {awayLogo && <img src={awayLogo} alt="" className="w-16 h-16 object-contain" />}
              <span className="text-sm font-semibold text-foreground mt-2">{away}</span>
            </div>
            <span className="text-2xl font-extrabold text-accent">VS</span>
            <div className="flex flex-col items-center w-28">
              {homeLogo && <img src={homeLogo} alt="" className="w-16 h-16 object-contain" />}
              <span className="text-sm font-semibold text-foreground mt-2">{home}</span>
            </div>
          </div>
        ) : (
          <h1 className="mt-4 text-2xl font-extrabold text-foreground">{title ?? 'Game Day'}</h1>
        )}

        <p className="mt-6 text-base font-semibold text-foreground">
          {isMatchup ? 'Catch it on the big screens at American Heroes & Brew' : 'Join us at American Heroes & Brew'}
        </p>
        {when && <p className="mt-1 text-sm text-muted">{when}</p>}
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
