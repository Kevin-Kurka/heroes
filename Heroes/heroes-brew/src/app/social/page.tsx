import type { Metadata } from 'next';
import PageTransition from '@/components/PageTransition';
import SocialPageClient from './SocialPageClient';
import { getInstagramPosts } from '@/lib/instagram';
import { INSTAGRAM_PERMALINKS } from '@/lib/social-config';

export const revalidate = 900; // ISR: 15 min

export const metadata: Metadata = {
  title: 'Social | American Heroes & Brew',
  description: 'Follow American Heroes & Brew on Instagram for specials, events, and vibes.',
};

export default async function SocialPage() {
  const posts = await getInstagramPosts(12);

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground drop-shadow-lg">Social</h1>
          <p className="text-muted text-sm mt-1">
            Follow us on Instagram for the latest from Heroes.
          </p>
        </div>
        <SocialPageClient posts={posts} permalinks={INSTAGRAM_PERMALINKS} />
      </div>
    </PageTransition>
  );
}
