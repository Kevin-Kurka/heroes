import { InstagramPost } from '@/types';

const GRAPH_URL = 'https://graph.instagram.com';

/**
 * Fetch recent posts from the authenticated Instagram Business/Creator account.
 * Returns up to `limit` posts (default 12 for a 3×4 grid).
 */
export async function getInstagramPosts(limit = 12): Promise<InstagramPost[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return [];

  try {
    const fields = 'id,caption,media_url,thumbnail_url,permalink,timestamp,media_type';
    const res = await fetch(
      `${GRAPH_URL}/me/media?fields=${fields}&limit=${limit}&access_token=${token}`,
      { next: { revalidate: 900 } } // ISR: 15 min
    );

    if (!res.ok) {
      console.error(`Instagram API error: ${res.status}`);
      return [];
    }

    const data = await res.json();
    return (data.data || []) as InstagramPost[];
  } catch (err) {
    console.error('Instagram fetch error:', err);
    return [];
  }
}

/**
 * Refresh a long-lived Instagram token. Tokens last ~60 days;
 * call this every ~30 days via cron to stay ahead of expiration.
 * Returns the new token string or null on failure.
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
