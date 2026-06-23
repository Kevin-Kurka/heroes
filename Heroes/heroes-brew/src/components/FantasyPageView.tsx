import { Trophy, UtensilsCrossed, Tv, Users, ClipboardList, MessageCircleQuestion, ExternalLink } from 'lucide-react';
import { FANTASY, YAHOO_FANTASY_URL, LEAGUE_CAPACITY, MAX_LEAGUES_PER_USER } from '@/lib/fantasy';
import type { LeagueAvailability } from '@/lib/fantasy-leagues';
import JoinLeagueForm from '@/components/JoinLeagueForm';
import RegisterLeagueForm from '@/components/RegisterLeagueForm';
import ReviewCTA from '@/components/ReviewCTA';

const PERK_ICON = { trophy: Trophy, wings: UtensilsCrossed, tv: Tv } as const;

/**
 * Server-rendered Heroes Fantasy Football League hub. Plain HTML for
 * info/perks/how-to/FAQ; embeds the two client signup cards (Join / Register).
 * `leagues` carries live per-league availability for the Join card.
 */
export default function FantasyPageView({ leagues }: { leagues: LeagueAvailability[] }) {
  const spotsOpen = leagues.reduce((n, l) => n + l.spotsLeft, 0);

  return (
    <div className="relative">
      <div className="fixed inset-0 -z-10 bg-[url('/home-bg.jpg')] bg-cover bg-center opacity-[0.07] pointer-events-none" />

      <div className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8">
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">American Heroes &amp; Brew</span>
          <h1 className="mt-2 text-3xl font-bold text-foreground drop-shadow-lg md:text-4xl">{FANTASY.title}</h1>
          <p className="mt-2 text-lg font-medium text-accent">{FANTASY.tagline}</p>
          <div className="mt-5 space-y-3 leading-relaxed text-foreground/85">
            {FANTASY.intro.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <a href="#signup" className="mt-5 inline-flex items-center justify-center rounded-sm bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-dim">
            Sign up — it’s free
          </a>
        </header>

        {/* Perks / rules */}
        <section className="mb-10">
          <h2 className="mb-5 text-2xl font-bold text-foreground">What you get</h2>
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

        {/* Two signup cards */}
        <section id="signup" className="mb-10 scroll-mt-20">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList size={20} className="text-accent" />
            <h2 className="text-2xl font-bold text-foreground">Sign up — pick your path</h2>
          </div>
          <div className="grid items-start gap-5 md:grid-cols-2">
            {/* Card 1: Join a Heroes league */}
            <div className="rounded-lg border border-accent/30 bg-card p-6">
              <div className="mb-1 flex items-center gap-2">
                <Users size={20} className="text-accent" />
                <h3 className="text-lg font-bold text-foreground">Join a Heroes League</h3>
              </div>
              <p className="mb-1 text-sm text-foreground/80">
                No league? Hop into one of our official Heroes leagues. Each holds {LEAGUE_CAPACITY} players — join up to {MAX_LEAGUES_PER_USER}.
                {spotsOpen > 0 ? ` ${spotsOpen} spots open right now.` : ''}
              </p>
              <p className="mb-4 text-xs text-muted">Free to join · $100 to the champ · drafts the two weekends before kickoff.</p>
              <JoinLeagueForm leagues={leagues} />
            </div>

            {/* Card 2: Register your own league */}
            <div className="rounded-lg border border-accent/30 bg-card p-6">
              <div className="mb-1 flex items-center gap-2">
                <Trophy size={20} className="text-accent" />
                <h3 className="text-lg font-bold text-foreground">Register My League</h3>
              </div>
              <p className="mb-4 text-sm text-foreground/80">
                Already a commissioner? Register your league for the $100 prize and book your draft at the bar (free munchies + big-screen draft).
              </p>
              <RegisterLeagueForm />
            </div>
          </div>
        </section>

        {/* Yahoo how-to */}
        <section className="mb-10 rounded-lg border border-border bg-card p-6">
          <h2 className="mb-2 text-xl font-bold text-foreground">Getting set up on Yahoo</h2>
          <p className="mb-4 text-foreground/85">{FANTASY.yahoo.intro}</p>
          <ol className="space-y-2">
            {FANTASY.yahoo.steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-foreground/85">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <a href={YAHOO_FANTASY_URL} target="_blank" rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-accent hover:underline">
            Open Yahoo Fantasy Football <ExternalLink size={14} />
          </a>
        </section>

        {/* FAQ */}
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
