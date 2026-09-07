/**
 * FILE: Week1PosterGallery.tsx
 * PURPOSE: NFL Week 1 watch-party poster grid with optional story lightbox.
 *
 * OVERVIEW:
 * Client island for the feed (4:5) gallery used on /watch, /watch-party, and
 * (compact) the home This Week teaser. Story 9:16 crops open in a dialog.
 *
 * DEPENDENCIES:
 * - next/image, lucide-react
 * - src/lib/week1-posters.ts
 *
 * EXPORTS:
 * - Week1PosterGallery (default)
 * - Week1HomeTeaser
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Feed grid, local Chargers emphasis, disclaimer, story lightbox
 *
 * RELATED FILES:
 * - src/lib/week1-posters.ts
 * - src/app/watch/page.tsx
 * - src/app/watch-party/page.tsx
 *
 * LAST UPDATED: 2026-09-07
 * MAINTAINER: American Heroes & Brew
 */
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, MapPin, Tv, X } from 'lucide-react';
import {
  WEEK1_DISCLAIMER,
  WEEK1_POSTERS,
  getLocalWeek1Poster,
  type Week1Poster,
} from '@/lib/week1-posters';

interface GalleryProps {
  /** Optional heading override. */
  heading?: string;
  /** Hide the intro blurb (used when the parent page already said it). */
  compact?: boolean;
}

export default function Week1PosterGallery({
  heading = 'NFL Week 1 watch parties',
  compact = false,
}: GalleryProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [story, setStory] = useState(false);
  const open = WEEK1_POSTERS.find((p) => p.id === openId) ?? null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const openPoster = (id: string) => {
    setStory(false);
    setOpenId(id);
  };

  return (
    <section id="week-1" className="bg-card border border-border rounded-lg p-6">
      <header className="mb-5">
        <p className="text-accent font-semibold tracking-wide uppercase text-sm">
          NFL Week 1 · Carlsbad Village
        </p>
        <h2 className="text-xl font-bold text-foreground mt-1">{heading}</h2>
        {!compact && (
          <p className="text-foreground/80 mt-2 leading-relaxed">
            Watch the openers on 16 TVs at American Heroes &amp; Brew — walk-ins welcome,
            300 Carlsbad Village Dr. Kickoffs in PT. Soft fan watch-party only.
          </p>
        )}
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground/70">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} className="text-accent" /> 300 Carlsbad Village Dr
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Tv size={14} className="text-accent" /> 16 TVs · walk-ins welcome
          </span>
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {WEEK1_POSTERS.map((poster) => (
          <li key={poster.id}>
            <PosterCard poster={poster} onOpen={() => openPoster(poster.id)} />
          </li>
        ))}
      </ul>

      <p className="mt-5 text-xs text-muted leading-relaxed">{WEEK1_DISCLAIMER}</p>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${open.away} at ${open.home} poster`}
          onClick={() => setOpenId(null)}
        >
          <div
            className="relative w-full max-w-md rounded-lg border border-border bg-card p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                  {open.eyebrow}
                </p>
                <p className="font-bold text-foreground">
                  {open.away} at {open.home}
                </p>
                <p className="text-sm text-foreground/70">{open.when}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                className="rounded-md border border-border p-1.5 text-muted hover:text-foreground"
                aria-label="Close poster"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => setStory(false)}
                className={`rounded-sm px-3 py-1.5 text-xs font-semibold ${
                  !story ? 'bg-accent text-white' : 'bg-card-hover text-foreground/80'
                }`}
              >
                Feed 4:5
              </button>
              <button
                type="button"
                onClick={() => setStory(true)}
                className={`rounded-sm px-3 py-1.5 text-xs font-semibold ${
                  story ? 'bg-accent text-white' : 'bg-card-hover text-foreground/80'
                }`}
              >
                Story 9:16
              </button>
            </div>
            <div className={`relative mx-auto overflow-hidden rounded-md bg-black ${story ? 'aspect-[9/16] max-h-[70vh]' : 'aspect-[4/5] max-h-[70vh]'}`}>
              <Image
                src={story ? open.storySrc : open.feedSrc}
                alt={`${open.away} at ${open.home} AHAB watch-party ${story ? 'story' : 'feed'} poster`}
                fill
                className="object-contain"
                sizes="(min-width: 480px) 28rem, 100vw"
              />
            </div>
            <p className="mt-3 text-xs text-muted">{WEEK1_DISCLAIMER}</p>
          </div>
        </div>
      )}
    </section>
  );
}

function PosterCard({ poster, onOpen }: { poster: Week1Poster; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`w-full text-left overflow-hidden rounded-lg border bg-background/40 transition-colors ${
        poster.local
          ? 'border-sports/50 ring-1 ring-sports/30 hover:border-sports'
          : 'border-border hover:border-accent/40'
      }`}
    >
      <div className="relative aspect-[4/5] bg-black">
        <Image
          src={poster.feedSrc}
          alt={`${poster.away} at ${poster.home} watch party at American Heroes & Brew — ${poster.when}`}
          fill
          className="object-cover"
          sizes="(min-width: 640px) 20rem, 100vw"
        />
        {poster.local && (
          <span className="absolute top-2 left-2 rounded-sm bg-sports px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
            Local
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">
          {poster.eyebrow}
        </p>
        <p className="mt-0.5 font-bold text-foreground">
          {poster.away} at {poster.home}
        </p>
        <p className="text-sm text-foreground/80">{poster.when}</p>
        <p className="text-xs text-muted mt-0.5">{poster.note}</p>
      </div>
    </button>
  );
}

/** Compact home-page card pointing at the /watch gallery. */
export function Week1HomeTeaser() {
  const local = getLocalWeek1Poster();
  if (!local) return null;

  return (
    <Link
      href="/watch#week-1"
      className="mb-4 flex flex-col sm:flex-row overflow-hidden rounded-lg border border-sports/40 bg-card hover:border-sports/70 transition-colors group"
    >
      <div className="relative aspect-[4/5] sm:aspect-auto sm:w-40 shrink-0 bg-black">
        <Image
          src={local.feedSrc}
          alt={`${local.away} at ${local.home} local watch party poster`}
          fill
          className="object-cover"
          sizes="160px"
        />
      </div>
      <div className="p-4 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-sports">
          Local · NFL Week 1
        </p>
        <h3 className="text-lg font-bold text-foreground mt-1 group-hover:text-accent transition-colors">
          Chargers watch party + Week 1 posters
        </h3>
        <p className="text-sm text-foreground/75 mt-1">
          {local.when}. Walk-ins welcome · 16 TVs · 300 Carlsbad Village Dr.
        </p>
        <p className="inline-flex items-center gap-1 text-sm text-accent mt-3">
          See all Week 1 posters <ChevronRight size={14} />
        </p>
      </div>
    </Link>
  );
}
