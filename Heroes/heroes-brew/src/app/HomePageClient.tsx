'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UtensilsCrossed, CalendarDays, MapPin, ChevronRight, Trophy } from 'lucide-react';
import { UnifiedEvent } from '@/types';
import Ticker from '@/components/Ticker';
import EventCard from '@/components/EventCard';

interface Props {
  events: UnifiedEvent[];
}

export default function HomePageClient({ events }: Props) {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background hero image */}
        <Image
          src="/hero.jpg"
          alt="American Heroes & Brew interior"
          fill
          priority
          quality={85}
          className="object-cover"
        />
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />

        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Image
              src="/logo.png"
              alt="American Heroes & Brew logo"
              width={280}
              height={100}
              className="mx-auto mb-6"
              priority
            />
            <p className="mt-4 text-foreground/80 text-lg md:text-xl max-w-md mx-auto drop-shadow-lg">
              Carlsbad&apos;s neighborhood sports bar. Great food, local craft brews, every game on the big screens.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 bg-accent text-background font-semibold px-6 py-3 rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 hover:shadow-accent/30"
            >
              <UtensilsCrossed size={18} />
              View Menu
            </Link>
            <Link
              href="/location"
              className="inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground font-medium px-6 py-3 rounded-xl hover:bg-card-hover hover:border-accent/30 transition-all"
            >
              <MapPin size={18} />
              Get Directions
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Live Ticker */}
      <Ticker events={events} />

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
            All Events <ChevronRight size={14} />
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
            { href: '/events', icon: CalendarDays, title: 'Events', desc: 'Games & holidays' },
            { href: '/location', icon: MapPin, title: 'Visit Us', desc: 'Carlsbad Village Drive' },
          ].map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <Link
                href={link.href}
                className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:border-accent/30 hover:bg-card-hover transition-all group"
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
    </div>
  );
}
