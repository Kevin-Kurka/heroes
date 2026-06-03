import type { Metadata } from 'next';
import PageTransition from '@/components/PageTransition';
import SocialPageClient from './SocialPageClient';
import { getInstagramPosts } from '@/lib/instagram';
import { CURATED_POSTS } from '@/lib/social-posts';

export const revalidate = 86_400; // 24h — matches Behold free-tier daily updates

export const metadata: Metadata = {
  title: 'Social | American Heroes & Brew',
  description: 'Follow American Heroes & Brew on Instagram for specials, events, and vibes.',
};

/** Extract an Instagram shortcode from a permalink for de-duplication. */
function shortcode(permalink: string): string {
  return permalink.match(/\/(?:p|reel|tv)\/([^/?]+)/)?.[1] ?? permalink;
}

export default async function SocialPage() {
  // Behold's free tier returns the 6 most-recent posts; top up to 16 with the
  // curated, self-hosted set (deduped), so the grid stays full and auto-updates.
  const live = await getInstagramPosts(16);
  const seen = new Set(live.map((p) => shortcode(p.permalink)));
  const merged = [...live, ...CURATED_POSTS.filter((p) => !seen.has(shortcode(p.permalink)))].slice(0, 16);
  const posts = merged.length > 0 ? merged : CURATED_POSTS;

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
      </div>
    </PageTransition>
  );
}
