import type { Metadata } from 'next';
import PageTransition from '@/components/PageTransition';
import SocialPageClient from './SocialPageClient';
import { getInstagramPosts } from '@/lib/instagram';
import ReviewCTA from '@/components/ReviewCTA';
import {
  SITE_URL,
  getWebPageJsonLd,
  getFaqJsonLd,
  getVideoObjectJsonLd,
} from '@/lib/structured-data';
import { getAllWatchParties } from '@/lib/watch-parties';

// Render fresh each request so code/feed changes show immediately; the Instagram
// fetch itself is cached 15 min (see instagram.ts) so we don't hammer the API.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Follow Us on Instagram',
  description:
    "Follow @americanheroesandbrew for daily specials, game-day events, and the vibe at Carlsbad's best sports bar.",
  alternates: { canonical: '/social' },
};

export default async function SocialPage() {
  // The official account's latest 16 posts, live from the Instagram Graph API.
  const posts = await getInstagramPosts(16);

  // Structured data: tie the page to the business entity, carry the full FAQ so
  // answer engines that land here get every answer, and describe the promo reels
  // as VideoObjects (each linked to its watch-party event).
  const jsonLd = [
    getWebPageJsonLd({
      url: `${SITE_URL}/social`,
      name: 'American Heroes & Brew on Instagram — Carlsbad Village Sports Bar',
      description:
        'Daily specials, game-day watch parties, and the vibe at American Heroes & Brew, the top-rated sports bar in Carlsbad Village, North County San Diego.',
    }),
    getFaqJsonLd(),
    ...getAllWatchParties().map((w) => getVideoObjectJsonLd(w)),
  ];

  return (
    <PageTransition>
      {jsonLd.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground drop-shadow-lg">Social</h1>
          <p className="text-muted text-sm mt-1">
            Follow us on Instagram for the latest from Heroes.
          </p>
        </div>
        <SocialPageClient posts={posts} />

        {/* Review ask — social visitors are warm fans; one tap to Google reviews. */}
        <div className="mt-8">
          <ReviewCTA source="social" />
        </div>
      </div>
    </PageTransition>
  );
}
