import type { Metadata } from 'next';
import PageTransition from '@/components/PageTransition';
import SocialPageClient from './SocialPageClient';
import { getInstagramPosts } from '@/lib/instagram';
import ReviewCTA from '@/components/ReviewCTA';

export const revalidate = 900; // 15 min — live Instagram feed

export const metadata: Metadata = {
  title: 'Follow Us on Instagram',
  description:
    "Follow @americanheroesandbrew for daily specials, game-day events, and the vibe at Carlsbad's best sports bar.",
  alternates: { canonical: '/social' },
};

export default async function SocialPage() {
  // The official account's latest 16 posts, live from the Instagram Graph API.
  const posts = await getInstagramPosts(16);

  return (
    <PageTransition>
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
