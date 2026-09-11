/**
 * FILE: FantasyPageView.tsx
 * PURPOSE: Archived Heroes Fantasy Football League page (no live signup).
 *
 * OVERVIEW:
 * Server-rendered recap for /fantasy-football after official 2026 drafts
 * completed. Past-tense copy, prize FAQ, and watch-the-games CTAs — no join
 * forms, open-spot counts, or signup buttons.
 *
 * DEPENDENCIES:
 * - @/lib/fantasy (FANTASY, FANTASY_ARCHIVED)
 * - @/components/ReviewCTA
 *
 * EXPORTS:
 * - FantasyPageView (default)
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Archive UI when FANTASY_ARCHIVED
 * - ❌ Live Join / Register forms (closed for 2026)
 *
 * RELATED FILES:
 * - src/app/fantasy-football/page.tsx
 * - src/lib/fantasy-archive.test.ts
 *
 * LAST UPDATED: 2026-09-11
 * MAINTAINER: American Heroes & Brew
 */
import { Trophy, UtensilsCrossed, Tv, MessageCircleQuestion, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { FANTASY, FANTASY_ARCHIVED } from '@/lib/fantasy';
import ReviewCTA from '@/components/ReviewCTA';

const PERK_ICON = { trophy: Trophy, wings: UtensilsCrossed, tv: Tv } as const;

export default function FantasyPageView() {
  return (
    <div className="relative">
      <div className="fixed inset-0 -z-10 bg-[url('/home-bg.jpg')] bg-cover bg-center opacity-[0.07] pointer-events-none" />

      <div className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8">
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">American Heroes &amp; Brew</span>
          <h1 className="mt-2 text-3xl font-bold text-foreground drop-shadow-lg md:text-4xl">{FANTASY.title}</h1>
          <p className="mt-2 text-lg font-medium text-accent">{FANTASY.tagline}</p>
          {FANTASY_ARCHIVED && (
            <p className="mt-3 inline-block rounded-sm border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
              Drafts completed · Season underway
            </p>
          )}
          <div className="mt-5 space-y-3 leading-relaxed text-foreground/85">
            {FANTASY.intro.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <Link
            href="/events"
            className="mt-5 inline-flex items-center justify-center rounded-sm bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-dim"
          >
            Watch the games on the Scoreboard
          </Link>
        </header>

        <section className="mb-10">
          <h2 className="mb-5 text-2xl font-bold text-foreground">What the league includes</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {FANTASY.perks.map((p) => {
              const Icon = PERK_ICON[p.icon as keyof typeof PERK_ICON] ?? Trophy;
              return (
                <div key={p.title} className="rounded-lg border border-accent/30 bg-card p-5">
                  <div className="mb-2 inline-flex rounded-lg bg-accent/10 p-2"><Icon size={20} className="text-accent" /></div>
                  <h3 className="font-bold text-foreground">{p.title}</h3>
                  <p className="mt-1 text-sm text-foreground/80">{p.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-10 rounded-lg border border-border bg-card p-6">
          <div className="mb-2 flex items-center gap-2">
            <CalendarDays size={20} className="text-accent" />
            <h2 className="text-xl font-bold text-foreground">Come watch the season</h2>
          </div>
          <p className="text-sm leading-relaxed text-foreground/80">
            Signup is closed. The games are not — every NFL Sunday, Thursday Night, and Monday Night
            Football is on 16 TVs in Carlsbad Village. Walk-ins welcome, no cover.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/watch"
              className="inline-flex items-center justify-center rounded-sm bg-card border border-border px-5 py-2.5 font-semibold text-foreground transition-colors hover:border-accent/40"
            >
              NFL game day
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-sm bg-card border border-border px-5 py-2.5 font-semibold text-foreground transition-colors hover:border-accent/40"
            >
              This week&apos;s scoreboard
            </Link>
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-5 flex items-center gap-2">
            <MessageCircleQuestion size={20} className="text-accent" />
            <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FANTASY.faqs.map((item) => (
              <details key={item.question} className="group rounded-lg border border-border bg-card px-5 py-4 [&_summary]:cursor-pointer">
                <summary className="flex list-none items-center justify-between gap-3 font-semibold text-foreground">
                  {item.question}
                  <span className="text-xl leading-none text-accent transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 border-t border-border/50 pt-3 text-sm leading-relaxed text-foreground/80">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mb-10">
          <ReviewCTA source="fantasy-football" />
        </div>
      </div>
    </div>
  );
}
