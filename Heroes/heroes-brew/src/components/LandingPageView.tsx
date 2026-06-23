import Link from 'next/link';
import { UtensilsCrossed, MapPin, Phone, ChevronRight, Check, MessageCircleQuestion } from 'lucide-react';
import type { Restaurant } from '@/types';
import { LANDING_PAGES, type LandingPageContent } from '@/lib/landing-pages';
import ReviewCTA from '@/components/ReviewCTA';

const DIRECTIONS_URL =
  'https://www.google.com/maps/dir//American+Heroes+%26+Brew,+300+Carlsbad+Village+Dr+STE+120,+Carlsbad,+CA+92008';

interface Props {
  page: LandingPageContent;
  restaurant: Restaurant;
}

/**
 * Server-rendered view for the high-intent landing pages (/watch, /near-legoland,
 * /breakfast, /happy-hour). Deliberately plain HTML (no client component, no
 * framer-motion) so every word — intro, sections, FAQ — is in the initial markup
 * that Google and answer engines read. The FAQ uses a native <details> accordion,
 * mirroring AboutFaqSection, and matches the page's FAQPage JSON-LD.
 */
export default function LandingPageView({ page, restaurant }: Props) {
  const tel = restaurant.phone.replace(/\D/g, '');
  const otherPages = Object.values(LANDING_PAGES).filter((p) => p.slug !== page.slug);

  return (
    <div className="relative">
      {/* subtle flag background, consistent with home/location */}
      <div className="fixed inset-0 -z-10 bg-[url('/home-bg.jpg')] bg-cover bg-center opacity-[0.07] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground drop-shadow-lg">{page.h1}</h1>
          <p className="text-accent font-medium mt-2 text-lg">{page.tagline}</p>
          <div className="mt-5 space-y-3 text-foreground/85 leading-relaxed">
            {page.intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 bg-accent text-white font-semibold px-6 py-3 rounded-sm hover:bg-accent-dim transition-colors"
            >
              <UtensilsCrossed size={18} /> View Menu
            </Link>
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-navy border border-navy text-white font-medium px-6 py-3 rounded-sm hover:bg-navy/80 transition-colors"
            >
              <MapPin size={18} /> Get Directions
            </a>
            <a
              href={`tel:${tel}`}
              className="inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground font-medium px-6 py-3 rounded-sm hover:border-accent/40 transition-colors"
            >
              <Phone size={18} /> {restaurant.phone}
            </a>
          </div>
        </header>

        {/* Content sections */}
        <div className="space-y-8">
          {page.sections.map((section) => (
            <section key={section.heading} className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold text-foreground mb-3">{section.heading}</h2>
              {section.body?.map((p, i) => (
                <p key={i} className="text-foreground/85 leading-relaxed mb-2 last:mb-0">
                  {p}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-3 space-y-2">
                  {section.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-foreground/85">
                      <Check size={18} className="text-accent shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* FAQ — page-specific; native accordion keeps every answer in the HTML
            and mirrors the page's FAQPage JSON-LD for answer engines. */}
        <section className="mt-10">
          <div className="flex items-center gap-2 mb-5">
            <MessageCircleQuestion size={20} className="text-accent" />
            <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {page.faqs.map((item) => (
              <details
                key={item.question}
                className="group bg-card border border-border rounded-lg px-5 py-4 [&_summary]:cursor-pointer"
              >
                <summary className="flex items-center justify-between gap-3 font-semibold text-foreground list-none">
                  {item.question}
                  <span className="text-accent transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                </summary>
                <p className="mt-3 pt-3 border-t border-border/50 text-foreground/80 text-sm leading-relaxed">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Review ask */}
        <div className="mt-10">
          <ReviewCTA source={`landing-${page.slug}`} />
        </div>

        {/* Cross-links to the other landing pages — internal linking for crawl + intent */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-foreground mb-4">More at American Heroes &amp; Brew</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {otherPages.map((p) => (
              <Link
                key={p.slug}
                href={`/${p.slug}`}
                className="flex items-center gap-3 bg-card border border-border rounded-md p-4 hover:border-accent/30 transition-colors group"
              >
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">{p.h1}</h3>
                  <p className="text-muted text-sm mt-0.5">{p.tagline}</p>
                </div>
                <ChevronRight size={16} className="text-muted ml-auto shrink-0 group-hover:text-accent transition-colors" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
