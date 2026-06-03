import { InstagramPost } from '@/types';

const GRAPH_URL = 'https://graph.instagram.com';

/**
 * Behold.so JSON feed for @americanheroesandbrew (connected via Instagram
 * login — no Facebook). The feed URL is a public, read-only endpoint, so it's
 * safe to default here; override with BEHOLD_FEED_URL if it ever changes.
 * Behold hosts the images (behold.pictures), so they never expire.
 */
const BEHOLD_FEED =
  process.env.BEHOLD_FEED_URL ?? 'https://feeds.behold.so/HWw9TQYi878ljLKQwx7K';

const REVALIDATE = 86_400; // 24h — matches Behold free-tier daily updates

/**
 * Fetch recent Instagram posts. Prefers the Behold feed; falls back to a
 * graph.instagram.com token if one is set. Returns [] on failure so the page
 * can fall back to its curated self-hosted posts.
 */
export async function getInstagramPosts(limit = 12): Promise<InstagramPost[]> {
  if (BEHOLD_FEED) return getFromBehold(BEHOLD_FEED, limit);

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (token) return getFromGraph(token, limit);

  return [];
}

// ── Behold.so (Instagram-login feed, no Facebook) ─────────────────────────
interface BeholdSize {
  mediaUrl?: string;
}
interface BeholdPost {
  id?: string;
  caption?: string;
  prunedCaption?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  permalink?: string;
  timestamp?: string;
  mediaType?: string;
  sizes?: { small?: BeholdSize; medium?: BeholdSize; large?: BeholdSize; full?: BeholdSize };
}

async function getFromBehold(feedUrl: string, limit: number): Promise<InstagramPost[]> {
  try {
    const res = await fetch(feedUrl, { next: { revalidate: REVALIDATE } });
    if (!res.ok) {
      console.error(`Behold feed error: ${res.status}`);
      return [];
    }
    const data: unknown = await res.json();
    const posts: BeholdPost[] = Array.isArray(data)
      ? (data as BeholdPost[])
      : ((data as { posts?: BeholdPost[] }).posts ?? []);
    return posts.slice(0, limit).map(mapBeholdPost);
  } catch (err) {
    console.error('Behold fetch error:', err);
    return [];
  }
}

/** Normalise a Behold post to our InstagramPost. Prefer Behold-hosted image
 *  renditions (behold.pictures) so images never expire or hotlink-break. */
function mapBeholdPost(p: BeholdPost): InstagramPost {
  const hosted =
    p.sizes?.large?.mediaUrl ??
    p.sizes?.medium?.mediaUrl ??
    p.sizes?.full?.mediaUrl ??
    p.sizes?.small?.mediaUrl ??
    p.thumbnailUrl ??
    p.mediaUrl ??
    '';
  const rawType = (p.mediaType ?? 'IMAGE').toUpperCase();
  const media_type: InstagramPost['media_type'] =
    rawType === 'VIDEO' || rawType === 'CAROUSEL_ALBUM' ? rawType : 'IMAGE';
  return {
    id: p.id ?? p.permalink ?? hosted,
    caption: p.prunedCaption ?? p.caption,
    media_url: hosted,
    thumbnail_url: hosted,
    permalink: p.permalink ?? 'https://www.instagram.com/americanheroesandbrew/',
    timestamp: p.timestamp ?? '',
    media_type,
  };
}

// ── Instagram Graph API (graph.instagram.com token) ───────────────────────
async function getFromGraph(token: string, limit: number): Promise<InstagramPost[]> {
  try {
    const fields = 'id,caption,media_url,thumbnail_url,permalink,timestamp,media_type';
    const res = await fetch(
      `${GRAPH_URL}/me/media?fields=${fields}&limit=${limit}&access_token=${token}`,
      { next: { revalidate: REVALIDATE } }
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
 * Refresh a long-lived Instagram token (only relevant to the
 * INSTAGRAM_ACCESS_TOKEN path; Behold manages its own auth).
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
