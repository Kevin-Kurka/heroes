'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { MapPin, Phone, Clock, Navigation, ExternalLink } from 'lucide-react';
import { Restaurant } from '@/types';
import PageTransition from '@/components/PageTransition';

interface Props {
  restaurant: Restaurant;
}

export default function LocationPageClient({ restaurant }: Props) {
  const fullAddress = `${restaurant.address1}${restaurant.address2 ? ', ' + restaurant.address2 : ''}, ${restaurant.city}, ${restaurant.stateCode} ${restaurant.zipCode}`;
  const mapsQuery = encodeURIComponent(fullAddress);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&q=${mapsQuery}`;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

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
        <h1 className="text-3xl font-bold text-foreground drop-shadow-lg mb-6" style={{ viewTransitionName: 'page-title' }}>Find Us</h1>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
            className="rounded-md overflow-hidden border border-border aspect-[4/3] md:aspect-auto md:h-full"
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

          {/* Info cards */}
          <div className="flex flex-col gap-4">
            {/* Address */}
            <motion.a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.05, ease: [0, 0, 0.2, 1] }}
              whileHover={{ scale: 1.01 }}
              className="flex items-start gap-4 bg-card/70 backdrop-blur-md border border-white/10 rounded-md p-4 hover:border-accent/30 transition-colors group"
            >
              <div className="p-2 bg-accent/10 rounded-lg shrink-0">
                <MapPin size={20} className="text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">Address</h3>
                <p className="text-muted text-sm mt-0.5">{restaurant.address1}</p>
                {restaurant.address2 && <p className="text-muted text-sm">{restaurant.address2}</p>}
                <p className="text-muted text-sm">{restaurant.city}, {restaurant.stateCode} {restaurant.zipCode}</p>
                <span className="inline-flex items-center gap-1 mt-2 text-xs text-accent">
                  <Navigation size={12} /> Get Directions <ExternalLink size={10} />
                </span>
              </div>
            </motion.a>

            {/* Phone */}
            <motion.a
              href={`tel:${restaurant.phone.replace(/\D/g, '')}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1, ease: [0, 0, 0.2, 1] }}
              whileHover={{ scale: 1.01 }}
              className="flex items-start gap-4 bg-card/70 backdrop-blur-md border border-white/10 rounded-md p-4 hover:border-accent/30 transition-colors group"
            >
              <div className="p-2 bg-accent/10 rounded-lg shrink-0">
                <Phone size={20} className="text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">Phone</h3>
                <p className="text-muted text-sm mt-0.5">{restaurant.phone}</p>
                <span className="inline-flex items-center gap-1 mt-2 text-xs text-accent">
                  Tap to Call
                </span>
              </div>
            </motion.a>

            {/* Hours */}
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
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
