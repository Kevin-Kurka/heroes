'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Instagram, ExternalLink, Play } from 'lucide-react';
import { InstagramPost } from '@/types';

interface Props {
  posts: InstagramPost[];
}

export default function SocialPageClient({ posts }: Props) {
  const { scrollY } = useScroll();
  const springConfig = { stiffness: 100, damping: 30, mass: 0.5 };
  const rawBgY = useTransform(scrollY, [0, 2000], [0, 50]);
  const rawBgScale = useTransform(scrollY, [0, 2000], [1, 1.03]);
  const bgY = useSpring(rawBgY, springConfig);
  const bgScale = useSpring(rawBgScale, springConfig);

  return (
    <div className="relative">
      <motion.div
        className="fixed inset-0 -z-10 bg-[url('/social-bg.jpg')] bg-cover bg-center opacity-10 pointer-events-none"
        style={{ y: bgY, scale: bgScale, willChange: 'transform' }}
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

      {/* Instagram Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {posts.map((post, i) => (
            <motion.a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: i * 0.03, ease: [0, 0, 0.2, 1] }}
              className="group relative aspect-square rounded-md overflow-hidden bg-card/70 backdrop-blur-md border border-white/10 hover:border-purple-500/40 transition-all"
            >
              <img
                src={post.media_type === 'VIDEO' ? (post.thumbnail_url || post.media_url) : post.media_url}
                alt={post.caption?.slice(0, 100) || 'Instagram post'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />

              {/* Video indicator */}
              {post.media_type === 'VIDEO' && (
                <div className="absolute top-2 right-2 p-1 bg-black/60 rounded-full">
                  <Play size={14} className="text-white fill-white" />
                </div>
              )}

              {/* Carousel indicator */}
              {post.media_type === 'CAROUSEL_ALBUM' && (
                <div className="absolute top-2 right-2 flex gap-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                </div>
              )}

              {/* Hover overlay with caption */}
              {post.caption && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
                  <p className="text-white text-xs line-clamp-3 leading-relaxed">
                    {post.caption}
                  </p>
                </div>
              )}
            </motion.a>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-hidden">
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
              Our latest Instagram posts will appear here soon.
            </p>
            <a
              href="https://www.instagram.com/americanheroesandbrew/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-400 text-xs mt-1 inline-block hover:underline"
            >
              In the meantime, follow @americanheroesandbrew →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
