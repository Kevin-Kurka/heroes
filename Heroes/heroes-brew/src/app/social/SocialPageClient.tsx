'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Instagram, ExternalLink } from 'lucide-react';

const elfsightAppId = process.env.NEXT_PUBLIC_ELFSIGHT_APP_ID;

export default function SocialPageClient() {
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 1000], ['0%', '30%']);
  const bgScale = useTransform(scrollY, [0, 1000], [1, 1.1]);

  return (
    <div className="relative">
      <motion.div
        className="fixed inset-0 -z-10 bg-[url('/social-bg.jpg')] bg-cover bg-center opacity-10 pointer-events-none"
        style={{ y: bgY, scale: bgScale }}
      />
      {/* Instagram CTA */}
      <motion.a
        href="https://www.instagram.com/americanheroesandbrew/"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
        whileHover={{ scale: 1.01 }}
        className="flex items-center gap-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-md p-4 mb-6 group"
      >
        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md">
          <Instagram size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground group-hover:text-pink-400 transition-colors">
            @americanheroesandbrew
          </h3>
          <p className="text-muted text-sm">Follow us for specials, events & vibes</p>
        </div>
        <ExternalLink size={16} className="text-muted group-hover:text-pink-400 transition-colors" />
      </motion.a>

      {/* Elfsight Widget or Placeholder */}
      <div className="rounded-md border border-border overflow-hidden">
        {elfsightAppId ? (
          <div className={`elfsight-app-${elfsightAppId}`} data-elfsight-app-lazy />
        ) : (
          <div className="p-8 text-center">
            <div className="grid grid-cols-3 gap-2 mb-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15, delay: i * 0.03, ease: [0, 0, 0.2, 1] }}
                  className="aspect-square rounded-lg shimmer"
                />
              ))}
            </div>
            <p className="text-muted text-sm">
              Instagram feed will appear here once Elfsight widget is configured.
            </p>
            <p className="text-muted/60 text-xs mt-1">
              Set NEXT_PUBLIC_ELFSIGHT_APP_ID in .env.local to enable.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
