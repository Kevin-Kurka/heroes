import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Phone, UtensilsCrossed } from 'lucide-react';
import InviteActions from '@/components/InviteActions';
import { getRestaurantInfo } from '@/lib/menu';
import { FAQ } from '@/lib/faq';
import {
  WATCH_PARTY_SLUGS,
  getWatchParty,
  isPastWatchParty,
  type WatchParty,
} from '@/lib/watch-parties';
import {
  SITE_URL,
  getWebPageJsonLd,
  getGenericFaqJsonLd,
  getBreadcrumbJsonLd,
  getVideoObjectJsonLd,
  getWatchPartyEventJsonLd,
} from '@/lib/structured-data';

/** Pre-render every watch-party page at build time. */
export function generateStaticParams() {
  return WATCH_PARTY_SLUGS.map((slug) => ({ slug }));
}

type Params = { params: Promise<{ slug: string }> };

const PT = 'America/Los_Angeles';
function formatWhen(iso: string): string {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: PT,
  }).format(d);
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric', minute: '2-digit', timeZone: PT, timeZoneName: 'short',
  }).format(d);
  return `${date} · ${time}`;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const party = getWatchParty(slug);
  if (!party) return {};
  const past = isPastWatchParty(party);
  const title = past
    ? `${party.matchup} Watch Party in Carlsbad — ${party.league}`
    : `Watch ${party.matchup} in Carlsbad — ${party.league} Watch Party`;
  const description = past
    ? `American Heroes & Brew hosted ${party.matchup} on 16 TVs in Carlsbad Village. ${formatWhen(party.startDate)}. Football season is on — every NFL game, full bar, walk-ins welcome.`
    : `Watch ${party.matchup} live on 16 TVs at American Heroes & Brew in Carlsbad Village. ${formatWhen(party.startDate)}. Full bar, food all day, family-friendly, walk-ins welcome.`;
  const url = `${SITE_URL}/watch-party/${party.slug}`;
  return {
    title,
    description,
    alternates: { canonical: `/watch-party/${party.slug}` },
    openGraph: {
      title: `${title} | American Heroes & Brew`,
      description,
      url,
      type: 'video.other',
      videos: [{ url: `${SITE_URL}/promos-video/${party.videoFile}` }],
      images: [`${SITE_URL}/promos-video/thumbs/${party.thumbFile}`],
    },
  };
}

const WHY_HERE = [
  '16 TVs — every match, with the sound up for the big games',
  'Full bar, house drafts (contract pours), and daily drink specials',
  'All-American food all day — burgers, signature wings, the authentic Philly cheesesteak',
  'Family-friendly with a kids’ menu — bring everyone',
  'Walkable in Carlsbad Village, minutes from the beach and LEGOLAND',
  'No cover, no reservation — walk-ins always welcome',
];

export default async function WatchPartyPage({ params }: Params) {
  const { slug } = await params;
  const party: WatchParty | undefined = getWatchParty(slug);
  if (!party) notFound();

  const r = getRestaurantInfo();
  const url = `${SITE_URL}/watch-party/${party.slug}`;
  const past = isPastWatchParty(party);
  const allFaqs = [...party.faqs, ...FAQ];
  const tel = r.phone.replace(/\D/g, '');
  const directionsUrl =
    'https://www.google.com/maps/dir//American+Heroes+%26+Brew,+300+Carlsbad+Village+Dr+STE+120,+Carlsbad,+CA+92008';
  const shareText = past
    ? `${party.matchup} watch party recap at American Heroes & Brew — ${formatWhen(party.startDate)}. Catch NFL game days on 16 TVs.`
    : `${party.matchup} on 16 TVs at American Heroes & Brew — ${formatWhen(party.startDate)}. Let's go! 🍻`;

  const jsonLd = [
    getWebPageJsonLd({
      url,
      name: `Watch ${party.matchup} in Carlsbad — American Heroes & Brew`,
      description: `${party.matchup} (${party.league}) live on 16 TVs at American Heroes & Brew in Carlsbad Village. ${formatWhen(party.startDate)}.`,
    }),
    getWatchPartyEventJsonLd(party),
    getVideoObjectJsonLd(party),
    getGenericFaqJsonLd(allFaqs, url),
    getBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Watch Parties', path: '/events' },
      { name: party.matchup, path: `/watch-party/${party.slug}` },
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

      <article className="mx-auto max-w-3xl px-4 py-10 md:py-16">
        <nav className="text-sm text-foreground/50 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-accent">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/events" className="hover:text-accent">Watch Parties</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground/80">{party.matchup}</span>
        </nav>

        <header className="mb-8">
          <p className="text-accent font-semibold tracking-wide uppercase text-sm">
            {party.league} Watch Party · Carlsbad Village
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-2 leading-tight">
            {past ? `${party.matchup} Watch Party in Carlsbad` : `Where to Watch ${party.matchup} in Carlsbad`}
          </h1>
          <p className="text-lg text-foreground/70 mt-3">{party.tagline}</p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-card px-4 py-2 text-foreground/90 font-semibold">
            🗓️ {formatWhen(party.startDate)}
          </p>
        </header>

        {/* Primary calls to action — get them in the door, then invite the crew. */}
        <section className="mb-8 rounded-xl border border-accent/30 bg-accent/5 p-5">
          <p className="text-lg font-bold text-foreground mb-4">
            {past
              ? 'This watch party is over. Catch NFL game days and the next matchup here. 🏈'
              : 'Round up your crew and get down here. 🍻'}
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-3">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-accent text-white font-bold px-6 py-3 rounded-sm hover:bg-accent-dim transition-colors text-lg"
            >
              <MapPin size={20} /> Let&apos;s Go — Get Directions
            </a>
            <a
              href={`tel:${tel}`}
              className="inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground font-semibold px-6 py-3 rounded-sm hover:border-accent/40 transition-colors"
            >
              <Phone size={18} /> Call {r.phone}
            </a>
            <Link
              href={past ? '/watch' : '/menu'}
              className="inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground font-semibold px-6 py-3 rounded-sm hover:border-accent/40 transition-colors"
            >
              <UtensilsCrossed size={18} /> {past ? 'NFL Game Day' : 'See the Menu'}
            </Link>
          </div>
          <InviteActions
            shareTitle={past ? `${party.matchup} at American Heroes & Brew` : `Watch ${party.matchup} at American Heroes & Brew`}
            shareText={shareText}
            shareUrl={url}
            calendar={past ? undefined : {
              title: `Watch ${party.matchup} at American Heroes & Brew`,
              startISO: party.startDate,
              endISO: party.endDate,
              details: `${party.matchup} (${party.league}) live on 16 TVs at American Heroes & Brew, Carlsbad Village. Walk-ins welcome, no cover. ${url}`,
            }}
          />
        </section>

        <div className="rounded-xl overflow-hidden bg-card mb-8 shadow-lg">
          <video
            controls
            playsInline
            preload="metadata"
            poster={`/promos-video/thumbs/${party.thumbFile}`}
            className="w-full aspect-[9/16] max-h-[80vh] mx-auto bg-black"
          >
            <source src={`/promos-video/${party.videoFile}`} type="video/mp4" />
            Watch {party.matchup} at American Heroes &amp; Brew in Carlsbad Village.
          </video>
        </div>

        <section className="prose-invert space-y-4 text-foreground/85 leading-relaxed">
          {party.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Why watch {party.matchup} here</h2>
          <ul className="space-y-2 text-foreground/85">
            {WHY_HERE.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-accent">✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 rounded-xl bg-card p-6">
          <h2 className="text-2xl font-bold mb-2">American Heroes &amp; Brew</h2>
          <p className="text-foreground/80">{r.address1}{r.address2 ? `, ${r.address2}` : ''}, {r.city}, {r.stateCode} {r.zipCode}</p>
          <p className="text-foreground/80 mt-1">
            <a href={`tel:${r.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-accent">{r.phone}</a>
          </p>
          <p className="text-foreground/60 mt-3 text-sm">
            Family-friendly sports bar in Carlsbad Village, North County San Diego · 16 TVs · full bar · food all day · walk-ins welcome.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/menu" className="rounded-lg bg-accent px-4 py-2 font-semibold text-black">See the menu</Link>
            <Link href="/location" className="rounded-lg border border-border px-4 py-2 font-semibold">Directions &amp; hours</Link>
            <Link href="/events" className="rounded-lg border border-border px-4 py-2 font-semibold">All watch parties</Link>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Frequently asked questions</h2>
          <dl className="space-y-5">
            {allFaqs.map((f, i) => (
              <div key={i}>
                <dt className="font-semibold text-foreground">{f.question}</dt>
                <dd className="text-foreground/75 mt-1">{f.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      </article>
    </>
  );
}

// Archived matchup pages are static recaps; daily rebuild is enough.
export const revalidate = 86400;
