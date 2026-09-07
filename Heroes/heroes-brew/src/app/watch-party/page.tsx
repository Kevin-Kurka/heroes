/**
 * FILE: page.tsx
 * PURPOSE: /watch-party index — Week 1 NFL posters plus featured event pages.
 *
 * OVERVIEW:
 * Hub for AHAB watch parties so /watch-party is a real route (not only slugs).
 * Reuses LandingPageView patterns: plain server shell + gallery client island.
 *
 * DEPENDENCIES:
 * - @/lib/menu, @/lib/watch-parties, @/lib/week1-posters
 * - Week1PosterGallery, structured-data helpers
 *
 * EXPORTS:
 * - WatchPartyIndexPage (default)
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Week 1 gallery + links to dated /watch-party/<slug> pages
 *
 * RELATED FILES:
 * - src/app/watch/page.tsx
 * - src/app/watch-party/[slug]/page.tsx
 *
 * LAST UPDATED: 2026-09-07
 * MAINTAINER: American Heroes & Brew
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getRestaurantInfo } from '@/lib/menu';
import { getAllWatchParties } from '@/lib/watch-parties';
import { WEEK1_DISCLAIMER } from '@/lib/week1-posters';
import {
  SITE_URL,
  getWebPageJsonLd,
  getBreadcrumbJsonLd,
} from '@/lib/structured-data';
import Week1PosterGallery from '@/components/Week1PosterGallery';

const TITLE = 'Watch Parties in Carlsbad — NFL Week 1 at American Heroes & Brew';
const DESCRIPTION =
  'NFL Week 1 watch-party posters at American Heroes & Brew in Carlsbad Village — 16 TVs, walk-ins welcome, 300 Carlsbad Village Dr. Kickoffs in PT. Fan graphic, not an official NFL partnership.';
const PAGE_URL = `${SITE_URL}/watch-party`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/watch-party' },
  openGraph: {
    title: `${TITLE} | American Heroes & Brew`,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
  },
};

export const revalidate = 3600;

const PT = 'America/Los_Angeles';
function formatWhen(iso: string): string {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', timeZone: PT,
  }).format(d);
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric', minute: '2-digit', timeZone: PT, timeZoneName: 'short',
  }).format(d);
  return `${date} · ${time}`;
}

export default function WatchPartyIndexPage() {
  const restaurant = getRestaurantInfo();
  const parties = getAllWatchParties();
  const jsonLd = [
    getWebPageJsonLd({ url: PAGE_URL, name: TITLE, description: DESCRIPTION }),
    getBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Watch Parties', path: '/watch-party' },
    ]),
  ];

  return (
    <>
      {jsonLd.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}

      <div className="relative">
        <div className="fixed inset-0 -z-10 bg-[url('/home-bg.jpg')] bg-cover bg-center opacity-[0.07] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <header className="mb-8">
            <p className="text-accent font-semibold tracking-wide uppercase text-sm">
              Watch parties · Carlsbad Village
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
              Watch the game at American Heroes &amp; Brew
            </h1>
            <p className="text-lg text-foreground/80 mt-3 leading-relaxed">
              Every game on 16 TVs at {restaurant.address1} — walk-ins welcome, no cover.
              NFL Week 1 posters are below; kickoffs in PT.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <Link href="/watch" className="text-accent hover:underline">
                Where to watch the game
              </Link>
              <span className="text-muted">·</span>
              <Link href="/events" className="text-accent hover:underline">
                Live scoreboard
              </Link>
            </div>
          </header>

          <Week1PosterGallery heading="NFL Week 1 posters" />

          {parties.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Featured match pages</h2>
              <div className="grid gap-3">
                {parties.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/watch-party/${p.slug}`}
                    className="flex items-center gap-3 bg-card border border-border rounded-md p-4 hover:border-accent/30 transition-colors group"
                  >
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                        {p.matchup}
                      </h3>
                      <p className="text-muted text-sm mt-0.5">
                        {p.league} · {formatWhen(p.startDate)}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-muted ml-auto shrink-0 group-hover:text-accent" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          <p className="mt-8 text-xs text-muted">{WEEK1_DISCLAIMER}</p>
        </div>
      </div>
    </>
  );
}
