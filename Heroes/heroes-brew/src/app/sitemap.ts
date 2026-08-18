import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/structured-data';
import { WATCH_PARTY_SLUGS } from '@/lib/watch-parties';

/** Routes exposed to search engines. /menu/printable is intentionally
 *  excluded — it's a staff print view, not a public landing page. */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/menu', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/restaurant', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/burgers', priority: 0.85, changeFrequency: 'monthly' },
    { path: '/cheesesteak', priority: 0.85, changeFrequency: 'monthly' },
    { path: '/watch', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/world-cup', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/near-legoland', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/breakfast', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/happy-hour', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/heroes', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/fantasy-football', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/events', priority: 0.8, changeFrequency: 'daily' },
    { path: '/location', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/social', priority: 0.6, changeFrequency: 'daily' },
    { path: '/llms.txt', priority: 0.5, changeFrequency: 'weekly' },
    // Per-event watch-party landing pages (one per promoted reel).
    ...WATCH_PARTY_SLUGS.map((slug) => ({
      path: `/watch-party/${slug}`,
      priority: 0.4,
      changeFrequency: 'yearly' as const,
    })),
  ];

  const lastModified = new Date();
  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
