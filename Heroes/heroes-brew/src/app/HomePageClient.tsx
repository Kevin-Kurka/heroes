'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { UtensilsCrossed, CalendarDays, MapPin, ChevronRight, Trophy, Flame, Egg } from 'lucide-react';
import { UnifiedEvent } from '@/types';
import Ticker from '@/components/Ticker';
import EventCard from '@/components/EventCard';
import ReviewCTA from '@/components/ReviewCTA';
import { trackEvent } from '@/lib/analytics';

const DAILY_SPECIALS = [
  {
    day: 'Monday',
    name: 'Mahalo Monday',
    unifiedPrice: '4',
    deals: [
      { item: 'Sliders', detail: 'Kalua Pork' },
      { item: 'Beer', detail: 'Select Drafts' },
    ],
  },
  {
    day: 'Tuesday',
    name: 'Taco Tuesday',
    unifiedPrice: '4',
    deals: [
      { item: 'Tacos', detail: 'Carnitas, Carne Asada' },
      { item: 'Beer', detail: 'Modelo, Ultra' },
    ],
  },
  {
    day: 'Wednesday',
    name: 'Wings & Well Wednesday',
    unifiedPrice: '2',
    deals: [
      { item: 'Signature Wings', price: 'each' },
      { item: 'Drinks', price: 'off' },
    ],
  },
  {
    day: 'Thursday',
    name: 'Thirsty Thursday',
    unifiedPrice: '5',
    deals: [
      { item: 'Burgers', price: 'off' },
      { item: 'Select Drafts', price: 'each' },
    ],
  },
] as const;

interface Props {
  events: UnifiedEvent[];
  /** Index into DAILY_SPECIALS for today (Pacific), or -1 on Fri–Sun. Computed
   *  server-side in page.tsx so the right special shows on first paint. */
  todayIndex: number;
}

export default function HomePageClient({ events, todayIndex }: Props) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const springConfig = { stiffness: 100, damping: 30, mass: 0.5 };

  // Layer 1: Hero background — gentle parallax
  const rawHeroY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const rawHeroScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const heroY = useSpring(rawHeroY, springConfig);
  const heroScale = useSpring(rawHeroScale, springConfig);

  // Layer 2: Logo — parallax, fades on scroll
  const rawLogoY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const rawLogoScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const logoOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const logoY = useSpring(rawLogoY, springConfig);
  const logoScale = useSpring(rawLogoScale, springConfig);

  // Flag background parallax
  const { scrollY } = useScroll();
  const rawHomeBgY = useTransform(scrollY, [0, 3000], [0, 40]);
  const rawHomeBgScale = useTransform(scrollY, [0, 3000], [1, 1.03]);
  const homeBgY = useSpring(rawHomeBgY, springConfig);
  const homeBgScale = useSpring(rawHomeBgScale, springConfig);

  return (
    <div>
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Layer 1: Sandwich background — slowest parallax */}
        <motion.div
          className="absolute inset-0"
          style={{ y: heroY, scale: heroScale, willChange: 'transform' }}
        >
          <Image
            src="/hero.jpg"
            alt="American Heroes & Brew interior"
            fill
            priority
            quality={85}
            className="object-cover"
          />
        </motion.div>

        {/* Dark gradient overlay — heavier center for logo contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center_40%,rgba(0,0,0,0.45)_0%,transparent_55%)]" />

        {/* Layer 2: Hi-res logo + text content — parallax, fades on scroll */}
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
            style={{ y: logoY, scale: logoScale, opacity: logoOpacity }}
          >
            <Image
              src="/badge-clean.png"
              alt="American Heroes & Brew logo"
              width={360}
              height={361}
              priority
              className="mx-auto mb-4 w-[240px] sm:w-[300px] md:w-[360px] h-auto"
              style={{ filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.9)) drop-shadow(0 0 16px rgba(0,0,0,0.7)) drop-shadow(0 2px 30px rgba(0,0,0,0.5))' }}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1, ease: [0, 0, 0.2, 1] }}
          >
            <h2
              className="text-2xl md:text-3xl font-bold text-foreground"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.6)' }}
            >
              Best in Carlsbad
            </h2>
            <p
              className="text-foreground/80 text-base md:text-lg max-w-md mx-auto mt-1"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 4px 16px rgba(0,0,0,0.5)' }}
            >
              Everyone&apos;s favorites, all day — every day!
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15, ease: [0, 0, 0.2, 1] }}
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link
              href="/menu"
              onClick={() => trackEvent('view_menu', { source: 'home_hero' })}
              className="inline-flex items-center justify-center gap-2 bg-accent text-white font-semibold px-6 py-3 rounded-sm hover:bg-accent-dim transition-all shadow-[0_4px_16px_rgba(0,0,0,0.5),0_2px_8px_rgba(245,158,11,0.3)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.6),0_2px_12px_rgba(245,158,11,0.4)]"
            >
              <UtensilsCrossed size={18} />
              View Menu
            </Link>
            <a
              href="https://www.google.com/maps/dir//American+Heroes+%26+Brew,+300+Carlsbad+Village+Dr+STE+120,+Carlsbad,+CA+92008"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('get_directions', { source: 'home_hero' })}
              className="inline-flex items-center justify-center gap-2 bg-navy border border-navy text-white font-medium px-6 py-3 rounded-sm hover:bg-navy/80 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.6)]"
            >
              <MapPin size={18} />
              Get Directions
            </a>
          </motion.div>
        </div>
      </section>

      {/* Live Ticker */}
      <Ticker events={events} />

      {/* Flag background below ticker */}
      <div className="relative overflow-hidden">
        <motion.div
          className="absolute -top-20 inset-x-0 bottom-0 -z-10 bg-[url('/home-bg.jpg')] bg-cover bg-center opacity-10 pointer-events-none"
          style={{ y: homeBgY, scale: homeBgScale, willChange: 'transform' }}
        />

      {/* Daily Lineup */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-6">
          <Flame size={20} className="text-accent" />
          <h2 className="text-2xl font-bold text-foreground">Daily Lineup</h2>
        </div>

        {todayIndex >= 0 ? (
          <>
            {/* Today's featured special */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
              className="relative overflow-hidden bg-card border border-accent/30 rounded-lg p-6 mb-4"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Today&apos;s Special</span>
                  <h3 className="text-lg font-bold text-foreground leading-tight">
                    {DAILY_SPECIALS[todayIndex].name}
                  </h3>
                </div>
                {'unifiedPrice' in DAILY_SPECIALS[todayIndex] && (
                  <span className="text-lg font-bold text-accent">
                    {DAILY_SPECIALS[todayIndex].unifiedPrice}
                  </span>
                )}
              </div>
              <div className="border-t border-border/50 pt-3">
                <ul className="space-y-2">
                  {DAILY_SPECIALS[todayIndex].deals.map((deal) => (
                    <li key={deal.item} className="flex items-center justify-between text-sm">
                      <span className="text-foreground/90">{deal.item}{'detail' in deal && <span className="text-xs text-accent/90 ml-1">{deal.detail}</span>}</span>
                      {'price' in deal && (
                        <span className="font-semibold text-accent">{deal.price}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Other days — responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DAILY_SPECIALS.filter((_, i) => i !== todayIndex).map((special, i) => (
                <motion.div
                  key={special.day}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.06 + i * 0.06, ease: [0, 0, 0.2, 1] }}
                  className="relative overflow-hidden bg-card border border-border rounded-lg p-4"
                >
                  <div className="absolute top-0 left-0 w-0.5 h-full bg-border" />
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{special.day}</h4>
                      <p className="text-xs text-muted">{special.name}</p>
                    </div>
                    {'unifiedPrice' in special && (
                      <span className="text-xs font-semibold text-accent whitespace-nowrap">{special.unifiedPrice}</span>
                    )}
                  </div>
                  <ul className="space-y-1 border-t border-border/30 pt-2">
                    {special.deals.map((deal) => (
                      <li key={deal.item} className="flex items-center justify-between text-xs">
                        <span className="text-foreground/70">{deal.item}{'detail' in deal && <span className="text-xs text-accent/90 ml-1">{deal.detail}</span>}</span>
                        {'price' in deal && (
                          <span className="font-medium text-accent ml-2 whitespace-nowrap">{deal.price}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-muted text-sm mb-4">Come back Monday–Thursday for daily specials!</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {DAILY_SPECIALS.map((special, i) => (
                <motion.div
                  key={special.day}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.06, ease: [0, 0, 0.2, 1] }}
                  className="relative overflow-hidden bg-card border border-border rounded-lg p-4"
                >
                  <div className="absolute top-0 left-0 w-0.5 h-full bg-border" />
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{special.day}</h4>
                      <p className="text-xs text-muted">{special.name}</p>
                    </div>
                    {'unifiedPrice' in special && (
                      <span className="text-xs font-semibold text-accent whitespace-nowrap">{special.unifiedPrice}</span>
                    )}
                  </div>
                  <ul className="space-y-1 border-t border-border/30 pt-2">
                    {special.deals.map((deal) => (
                      <li key={deal.item} className="flex items-center justify-between text-xs">
                        <span className="text-foreground/70">{deal.item}{'detail' in deal && <span className="text-xs text-accent/90 ml-1">{deal.detail}</span>}</span>
                        {'price' in deal && (
                          <span className="font-medium text-accent ml-2 whitespace-nowrap">{deal.price}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* 2 for 22 Breakfast */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-6">
          <Egg size={20} className="text-accent" />
          <h2 className="text-2xl font-bold text-foreground">2 for 22 Breakfast</h2>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
          className="relative overflow-hidden bg-card border border-accent/30 rounded-lg p-6"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-foreground">2 Breakfast Entrées</h3>
            <span className="text-lg font-bold text-accent">22</span>
          </div>
          <div className="border-t border-border/50 pt-3 text-sm text-muted">
            <span>Breakfast served Friday – Sunday</span>
          </div>
        </motion.div>
      </section>

      {/* Upcoming Events Preview */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-accent" />
            <h2 className="text-2xl font-bold text-foreground">This Week</h2>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
          >
            Scoreboard <ChevronRight size={14} />
          </Link>
        </div>

        {events.length === 0 ? (
          <p className="text-muted text-center py-8">No upcoming events this week.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {events.slice(0, 4).map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section className="max-w-4xl mx-auto px-4 pb-12">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { href: '/menu', icon: UtensilsCrossed, title: 'Menu', desc: 'Burgers, brews & more' },
            { href: '/events', icon: CalendarDays, title: 'Scoreboard', desc: 'Games & holidays' },
            { href: '/location', icon: MapPin, title: 'Visit Us', desc: 'Carlsbad Village Drive' },
          ].map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 + i * 0.06, ease: [0, 0, 0.2, 1] }}
            >
              <Link
                href={link.href}
                className="flex items-center gap-4 bg-card border border-border rounded-md p-4 hover:border-accent/30 hover:bg-card-hover transition-all group"
              >
                <div className="p-2 bg-accent/10 rounded-lg">
                  <link.icon size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-muted text-sm">{link.desc}</p>
                </div>
                <ChevronRight size={16} className="text-muted ml-auto group-hover:text-accent transition-colors" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Review ask — converts happy visitors into Google reviews, the top
          local-ranking signal for "best sports bar near me". */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <ReviewCTA source="home" />
      </section>
      </div>
    </div>
  );
}
