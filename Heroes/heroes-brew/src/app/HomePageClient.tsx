'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { UtensilsCrossed, CalendarDays, MapPin, ChevronRight, Trophy, Flame, Heart } from 'lucide-react';
import { UnifiedEvent } from '@/types';
import Ticker from '@/components/Ticker';
import EventCard from '@/components/EventCard';
import ReviewCTA from '@/components/ReviewCTA';
import InstagramEmbed from '@/components/InstagramEmbed';
import { getCurrentHero } from '@/lib/heroes';
import DoorDashIcon from '@/components/DoorDashIcon';
import { trackEvent } from '@/lib/analytics';
import { DOORDASH_URL } from '@/lib/doordash';
import { useDoorDashAvailable } from '@/hooks/use-doordash-available';
import { EARLY_BIRD_DAILY_DEALS, EARLY_BIRD_HOURS_SHORT, FRIDAY_FUNDAY_DEAL } from '@/lib/early-bird';
import { HOME_SPECIALS } from '@/lib/menu-specials';

const DAILY_SPECIALS = [
  {
    day: 'Monday',
    name: 'Mahalo Monday',
    deals: [
      { item: 'Kalua Pork Sliders', price: '$4 ea' },
      { item: 'Modelo · Ultra · Coors · Miller Lite', price: '$3 ea' },
    ],
  },
  {
    day: 'Tuesday',
    name: 'Taco Tuesday',
    deals: [
      { item: 'Village Tacos', price: '$4 ea' },
      { item: 'All Tequila Cocktails', price: '$2 off' },
      { item: 'Industry Drafts or Wells', detail: 'All day', price: '$5 ea' },
    ],
  },
  {
    day: 'Wednesday',
    name: 'Wings & Well Wednesday',
    deals: [
      { item: 'Wings', price: '$6 off' },
      { item: 'Well Cocktails', price: '$6 ea' },
    ],
  },
  {
    day: 'Thursday',
    name: 'Thirsty Thursday',
    deals: [
      { item: 'All Burgers', price: '$5 off' },
      { item: 'House Drafts', detail: 'Blonde · IPA · Amber · Lager', price: '$5 ea' },
    ],
  },
  {
    day: 'Friday',
    name: 'Early Bird & Friday Funday',
    deals: [
      { item: 'Two breakfast plates', detail: `${EARLY_BIRD_HOURS_SHORT} dine-in`, price: '$22' },
      { item: 'Breakfast happy hour', detail: EARLY_BIRD_HOURS_SHORT, price: '$5' },
      FRIDAY_FUNDAY_DEAL,
    ],
  },
  {
    day: 'Saturday',
    name: 'Early Bird Weekend Breakfast',
    time: EARLY_BIRD_HOURS_SHORT,
    deals: EARLY_BIRD_DAILY_DEALS,
  },
  {
    day: 'Sunday',
    name: 'Early Bird Weekend Breakfast',
    time: EARLY_BIRD_HOURS_SHORT,
    deals: EARLY_BIRD_DAILY_DEALS,
  },
] as const;

interface Props {
  events: UnifiedEvent[];
  /** Index into DAILY_SPECIALS for today (Pacific), 0=Mon … 6=Sun. Computed
   *  server-side in page.tsx so the right special shows on first paint. */
  todayIndex: number;
}

export default function HomePageClient({ events, todayIndex }: Props) {
  const heroRef = useRef<HTMLElement>(null);
  const doordashAvailable = useDoorDashAvailable();
  // Hero of the Month — only rendered when one has been chosen (lib/heroes.ts).
  const currentHero = getCurrentHero();
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
              North County&apos;s Best Sports Bar
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
            <div className="flex w-full sm:w-auto rounded-sm overflow-hidden border border-accent shadow-[0_4px_16px_rgba(0,0,0,0.5),0_2px_8px_rgba(245,158,11,0.3)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.6),0_2px_12px_rgba(245,158,11,0.4)] transition-all">
              <Link
                href="/menu"
                onClick={() => trackEvent('view_menu', { source: 'home_hero' })}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-accent text-white font-semibold px-6 py-3 hover:bg-accent-dim transition-colors"
              >
                <UtensilsCrossed size={18} />
                View Menu
              </Link>
              {doordashAvailable && (
                <a
                  href={DOORDASH_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Order on DoorDash"
                  title="Order delivery on DoorDash"
                  onClick={() => trackEvent('order_doordash', { source: 'home_hero' })}
                  className="shrink-0 inline-flex items-center justify-center px-4 py-3 text-white bg-accent-dim hover:bg-accent transition-colors border-l border-white/15"
                >
                  <DoorDashIcon size={20} />
                </a>
              )}
            </div>
            <a
              href="https://www.google.com/maps/dir//American+Heroes+%26+Brew,+300+Carlsbad+Village+Dr+STE+120,+Carlsbad,+CA+92008"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('get_directions', { source: 'home_hero' })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-navy border border-navy text-white font-medium px-6 py-3 rounded-sm hover:bg-navy/80 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.6)]"
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
                    {DAILY_SPECIALS[todayIndex]?.name ?? DAILY_SPECIALS[0].name}
                  </h3>
                </div>
                {DAILY_SPECIALS[todayIndex] && 'time' in DAILY_SPECIALS[todayIndex] && (
                  <span className="text-xs font-bold text-accent whitespace-nowrap">
                    {DAILY_SPECIALS[todayIndex].time}
                  </span>
                )}
              </div>
              <div className="border-t border-border/50 pt-3">
                <ul className="space-y-2">
                  {(DAILY_SPECIALS[todayIndex] ?? DAILY_SPECIALS[0]).deals.map((deal) => (
                    <li key={deal.item} className="flex items-center justify-between text-sm gap-3">
                      <span className="text-foreground/90">{deal.item}{'detail' in deal && deal.detail ? <span className="text-xs text-accent/90 ml-1">{deal.detail}</span> : null}</span>
                      <span className="font-semibold text-accent whitespace-nowrap">{deal.price}</span>
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
                    {'time' in special && special.time && (
                      <span className="text-xs font-semibold text-accent whitespace-nowrap">{special.time}</span>
                    )}
                  </div>
                  <ul className="space-y-1 border-t border-border/30 pt-2">
                    {special.deals.map((deal) => (
                      <li key={deal.item} className="flex items-center justify-between text-xs gap-2">
                        <span className="text-foreground/70">{deal.item}{'detail' in deal && deal.detail ? <span className="text-xs text-accent/90 ml-1">{deal.detail}</span> : null}</span>
                        <span className="font-medium text-accent ml-2 whitespace-nowrap">{deal.price}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </>
      </section>

      {/* Hero of the Month — only when one has been chosen; shows the IG post
          that nominated them. Sits with the weekly lineup as fresh content. */}
      {currentHero && (
        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center gap-2 mb-6">
            <Heart size={20} className="text-accent fill-accent" />
            <h2 className="text-2xl font-bold text-foreground">Hero of the Month</h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
            className="relative overflow-hidden bg-card border border-accent/30 rounded-lg p-6"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
              {currentHero.month} · Community Hero
            </span>
            <h3 className="text-xl font-bold text-foreground leading-tight mt-1">{currentHero.name}</h3>
            {currentHero.title && <p className="text-sm text-muted">{currentHero.title}</p>}
            <p className="mt-3 text-foreground/85 leading-relaxed">{currentHero.blurb}</p>
            {currentHero.igPostUrl && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
                  Nominated by the community
                </p>
                <InstagramEmbed url={currentHero.igPostUrl} />
              </div>
            )}
            <Link
              href="/heroes"
              className="mt-4 inline-flex items-center gap-1 text-accent font-semibold text-sm hover:underline"
            >
              About Hero of the Month <ChevronRight size={16} />
            </Link>
          </motion.div>
        </section>
      )}

      {/* Kitchen & brunch specials — no public prices */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-6">
          <Flame size={20} className="text-accent" />
          <h2 className="text-2xl font-bold text-foreground">Specials</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {HOME_SPECIALS.map((special, i) => (
            <motion.div
              key={special.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.06, ease: [0, 0, 0.2, 1] }}
              className="relative overflow-hidden bg-card border border-border rounded-lg p-4"
            >
              <div className="absolute top-0 left-0 w-0.5 h-full bg-border" />
              <h3 className="font-semibold text-foreground text-sm">{special.name}</h3>
              <p className="text-xs text-muted mt-1">{special.description}</p>
            </motion.div>
          ))}
        </div>
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
