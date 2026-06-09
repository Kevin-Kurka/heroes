import { InstagramPost } from '@/types';

const GRAPH_URL = 'https://graph.instagram.com';

const REVALIDATE = 900; // 15 min — keep the live feed current (and ahead of IG CDN URL expiry)

/** Newest-first by post timestamp. */
export function byNewest(a: InstagramPost, b: InstagramPost): number {
  return (Date.parse(b.timestamp || '') || 0) - (Date.parse(a.timestamp || '') || 0);
}

/**
 * Fetch the official account's latest posts (any media type — photos, videos,
 * carousels) live from the Instagram Graph API (graph.instagram.com).
 * Returns [] when no token is set or the fetch fails, so /social falls back to
 * its placeholder + a link to Instagram.
 */
export async function getInstagramPosts(limit = 16): Promise<InstagramPost[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return [];
  return getFromGraph(token, limit);
}

async function getFromGraph(token: string, limit: number): Promise<InstagramPost[]> {
  try {
    const fields =
      'id,caption,media_url,thumbnail_url,permalink,timestamp,media_type,like_count,comments_count';
    const res = await fetch(
      `${GRAPH_URL}/me/media?fields=${fields}&limit=${limit}&access_token=${token}`,
      { next: { revalidate: REVALIDATE } }
    );
    if (!res.ok) {
      console.error(`Instagram API error: ${res.status}`);
      return [];
    }
    const data = await res.json();
    return ((data.data || []) as InstagramPost[]).sort(byNewest).slice(0, limit);
  } catch (err) {
    console.error('Instagram fetch error:', err);
    return [];
  }
}

/**
 * Refresh the long-lived Instagram token. Called by the instagram-refresh cron
 * so the stored INSTAGRAM_ACCESS_TOKEN never expires.
 */
export async function refreshInstagramToken(): Promise<string | null> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch(
      `${GRAPH_URL}/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`
    );
    if (!res.ok) {
      const body = await res.text();
      console.error(`Instagram token refresh failed: ${res.status}`, body);
      return null;
    }
    const data = await res.json();
    return data.access_token || null;
  } catch (err) {
    console.error('Instagram token refresh error:', err);
    return null;
  }
}
