import Link from 'next/link';
import Image from 'next/image';
import { Award, Heart, Users, MessageCircleQuestion, Instagram, MapPin } from 'lucide-react';
import { HEROES, HEROES_PROGRAM, HERO_FAQS, type Hero } from '@/lib/heroes';
import ReviewCTA from '@/components/ReviewCTA';

const NOMINATE_URL = process.env.HEROES_NOMINATION_URL || HEROES_PROGRAM.nominate.instagram;

function HeroCard({ hero, featured }: { hero: Hero; featured?: boolean }) {
  const Icon = hero.type === 'vocation' ? Users : Award;
  return (
    <article
      className={`relative overflow-hidden rounded-lg border ${
        featured ? 'border-accent/40 bg-card' : 'border-border bg-card'
      } p-6`}
    >
      <div className="absolute top-0 left-0 h-full w-1 bg-accent" />
      {hero.photo && (
        <div className="mb-4 overflow-hidden rounded-md border border-white/10">
          <Image
            src={hero.photo}
            alt={`${hero.name} — American Heroes & Brew Hero of the Month, ${hero.month}`}
            width={800}
            height={600}
            className="h-auto w-full object-cover"
          />
        </div>
      )}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
          {featured ? 'Hero of the Month' : hero.month} · {hero.type === 'vocation' ? 'Vocation' : 'Community Hero'}
        </span>
      </div>
      <div className="mt-1 flex items-start gap-3">
        <div className="mt-0.5 shrink-0 rounded-lg bg-accent/10 p-2">
          <Icon size={20} className="text-accent" />
        </div>
        <div>
          <h3 className={`font-bold text-foreground ${featured ? 'text-2xl' : 'text-lg'}`}>{hero.name}</h3>
          {hero.title && <p className="text-sm text-muted">{hero.title}</p>}
        </div>
      </div>
      <p className="mt-3 leading-relaxed text-foreground/85">{hero.blurb}</p>
    </article>
  );
}

/**
 * Server-rendered "Hero of the Month" program page. Plain HTML (no client
 * component) so the program copy, current honoree, archive, and FAQ are all in
 * the initial markup for Google + answer engines. Supports individual and
 * vocation honorees from lib/heroes.ts.
 */
export default function HeroesPageView() {
  const [current, ...past] = HEROES;

  return (
    <div className="relative">
      <div className="fixed inset-0 -z-10 bg-[url('/home-bg.jpg')] bg-cover bg-center opacity-[0.07] pointer-events-none" />

      <div className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-accent fill-accent" />
            <span className="text-sm font-semibold uppercase tracking-widest text-accent">American Heroes &amp; Brew</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold text-foreground drop-shadow-lg md:text-4xl">
            {HEROES_PROGRAM.title}
          </h1>
          <p className="mt-2 text-lg font-medium text-accent">{HEROES_PROGRAM.tagline}</p>
          <div className="mt-5 space-y-3 leading-relaxed text-foreground/85">
            {HEROES_PROGRAM.intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </header>

        {/* Current hero */}
        {current && (
          <section className="mb-10">
            <HeroCard hero={current} featured />
          </section>
        )}

        {/* How it works */}
        <section className="mb-10 rounded-lg border border-border bg-card p-6">
          <h2 className="mb-3 text-xl font-bold text-foreground">How it works</h2>
          <ul className="space-y-2">
            {HEROES_PROGRAM.how.map((h) => (
              <li key={h} className="flex items-start gap-2 text-foreground/85">
                <Award size={18} className="mt-0.5 shrink-0 text-accent" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Nominate */}
        <section className="mb-10 rounded-lg border border-accent/30 bg-card p-6">
          <h2 className="mb-2 text-xl font-bold text-foreground">Nominate a hero</h2>
          <p className="mb-4 text-foreground/85">
            Know someone in Carlsbad or North County who deserves a little recognition? Nominate them — an
            individual or a whole profession.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={NOMINATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-dim"
            >
              <Instagram size={18} /> Nominate on Instagram
            </a>
            <span className="inline-flex items-center gap-2 rounded-sm border border-border px-6 py-3 text-foreground/80">
              <MapPin size={18} className="text-accent" /> Or ask us in the Village
            </span>
          </div>
        </section>

        {/* Archive */}
        {past.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-5 text-2xl font-bold text-foreground">Past Heroes</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {past.map((h) => (
                <HeroCard key={h.period + h.name} hero={h} />
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="mb-10">
          <div className="mb-5 flex items-center gap-2">
            <MessageCircleQuestion size={20} className="text-accent" />
            <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {HERO_FAQS.map((item) => (
              <details
                key={item.question}
                className="group rounded-lg border border-border bg-card px-5 py-4 [&_summary]:cursor-pointer"
              >
                <summary className="flex list-none items-center justify-between gap-3 font-semibold text-foreground">
                  {item.question}
                  <span className="text-xl leading-none text-accent transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 border-t border-border/50 pt-3 text-sm leading-relaxed text-foreground/80">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <div className="mb-10">
          <ReviewCTA source="heroes" />
        </div>
      </div>
    </div>
  );
}
