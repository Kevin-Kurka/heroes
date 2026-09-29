'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { MapPin, Phone, Clock, Navigation, ExternalLink } from 'lucide-react';
import { Restaurant } from '@/types';
import PageTransition from '@/components/PageTransition';
import ReviewCTA from '@/components/ReviewCTA';
import VisitActions from '@/components/VisitActions';
import { DIRECTIONS_URL, PHONE_TEL } from '@/lib/visit';
import { trackEvent } from '@/lib/analytics';

interface Props {
  restaurant: Restaurant;
  /** Current weekday in Carlsbad (Pacific), computed server-side in page.tsx so
   *  the highlighted hours row is correct and hydration-safe. */
  today: string;
}

export default function LocationPageClient({ restaurant, today }: Props) {
  const mapsQuery = encodeURIComponent(
    `${restaurant.address1}${restaurant.address2 ? ', ' + restaurant.address2 : ''}, ${restaurant.city}, ${restaurant.stateCode} ${restaurant.zipCode}`,
  );
  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&q=${mapsQuery}`;

  const { scrollY } = useScroll();
  const springConfig = { stiffness: 100, damping: 30, mass: 0.5 };
  const rawBgY = useTransform(scrollY, [0, 2000], [0, 50]);
  const rawBgScale = useTransform(scrollY, [0, 2000], [1, 1.03]);
  const bgY = useSpring(rawBgY, springConfig);
  const bgScale = useSpring(rawBgScale, springConfig);

  return (
    <PageTransition>
      <motion.div
        className="fixed inset-0 -z-10 bg-[url('/location-bg.jpg')] bg-cover bg-center opacity-10 pointer-events-none"
        style={{ y: bgY, scale: bgScale, willChange: 'transform' }}
      />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-foreground drop-shadow-lg mb-4" style={{ viewTransitionName: 'page-title' }}>Find Us</h1>

        <VisitActions source="location" variant="page" />

        <div className="grid gap-6 md:grid-cols-2 mt-6">
          {/* Visit details first so address, phone, hours, and CTAs stay above the fold on mobile. */}
          <div className="flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.05, ease: [0, 0, 0.2, 1] }}
              className="bg-card/70 backdrop-blur-md border border-white/10 rounded-md p-4 space-y-3"
            >
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('get_directions', { source: 'location' })}
                className="flex items-start gap-3 group"
              >
                <div className="p-2 bg-accent/10 rounded-lg shrink-0">
                  <MapPin size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">Address</h3>
                  <p className="text-muted text-sm mt-0.5">{restaurant.address1}</p>
                  {restaurant.address2 && <p className="text-muted text-sm">{restaurant.address2}</p>}
                  <p className="text-muted text-sm">{restaurant.city}, {restaurant.stateCode} {restaurant.zipCode}</p>
                  <span className="inline-flex items-center gap-1 mt-1.5 text-xs text-accent">
                    <Navigation size={12} /> Get Directions <ExternalLink size={10} />
                  </span>
                </div>
              </a>
              <a
                href={`tel:${PHONE_TEL}`}
                onClick={() => trackEvent('call', { source: 'location' })}
                className="flex items-start gap-3 group border-t border-white/10 pt-3"
              >
                <div className="p-2 bg-accent/10 rounded-lg shrink-0">
                  <Phone size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">Phone</h3>
                  <p className="text-muted text-sm mt-0.5">{restaurant.phone}</p>
                  <span className="inline-flex items-center gap-1 mt-1.5 text-xs text-accent">
                    Tap to Call
                  </span>
                </div>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.15, ease: [0, 0, 0.2, 1] }}
              className="bg-card/70 backdrop-blur-md border border-white/10 rounded-md p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Clock size={20} className="text-accent" />
                </div>
                <h3 className="font-semibold text-foreground">Hours</h3>
              </div>
              <div className="space-y-1.5">
                {restaurant.hours.map((h) => (
                  <div
                    key={h.dayOfWeek}
                    className={`flex justify-between text-sm px-2 py-1 rounded ${
                      h.dayOfWeek === today
                        ? 'bg-accent/10 text-accent font-medium'
                        : 'text-muted'
                    }`}
                  >
                    <span>{h.dayOfWeek}</span>
                    <span className="font-mono text-xs">{h.open} – {h.close}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Kitchen may close earlier on slow nights — call ahead for last food order. Bar open during posted hours.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
            className="rounded-md overflow-hidden border border-border aspect-[4/3] md:aspect-auto md:h-full md:min-h-[360px]"
          >
            <iframe
              src={embedUrl}
              className="w-full h-full min-h-[300px]"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="American Heroes & Brew location"
            />
          </motion.div>
        </div>

        {/* Review ask — most location-page visitors are deciding whether to come
            in or have just been; prime moment to ask for a Google review. */}
        <div className="mt-6">
          <ReviewCTA source="location" />
        </div>
      </div>
    </PageTransition>
  );
}
