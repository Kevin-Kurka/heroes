import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/structured-data';

/** Routes exposed to search engines. /menu/printable is intentionally
 *  excluded — it's a staff print view, not a public landing page. */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/menu', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/events', priority: 0.8, changeFrequency: 'daily' },
    { path: '/location', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/social', priority: 0.6, changeFrequency: 'daily' },
  ];

  const lastModified = new Date();
  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
