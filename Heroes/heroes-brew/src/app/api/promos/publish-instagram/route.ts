import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/promos/publish-instagram
 *
 * Publishes a promo poster from /public/promos/ to Instagram via the
 * Graph API two-step content-publishing flow:
 *   1. POST {GRAPH_URL}/{INSTAGRAM_USER_ID}/media          → creation_id
 *   2. POST {GRAPH_URL}/{INSTAGRAM_USER_ID}/media_publish   → media id
 *
 * Secured by PROMOS_SECRET (same Bearer-header pattern as the
 * CRON_SECRET guard on /api/cron/instagram-refresh, except the secret
 * is mandatory here — publishing must never run unauthenticated).
 *
 * Requires the INSTAGRAM_ACCESS_TOKEN to carry the content-publish
 * permission (instagram_content_publish / instagram_business_content_publish);
 * read-only Instagram-login tokens will be rejected by the Graph API.
 *
 * After a successful Instagram publish, the same image + caption is also
 * posted to the Facebook Page via the Pages API photo-publish endpoint
 * (POST graph.facebook.com/{FB_PAGE_ID}/photos). This requires separate
 * credentials — FB_PAGE_ID and FB_PAGE_ACCESS_TOKEN (a Page access token
 * with pages_manage_posts + pages_read_engagement); the Instagram-login
 * token above CANNOT post to a Page. If the FB vars are unset the Facebook
 * step is skipped (reported in the response) and Instagram still publishes.
 * A Facebook failure never fails the request once IG has published — it is
 * reported in the `facebook` field of the response instead.
 */

// Same Graph host the rest of the app uses (src/lib/instagram.ts)
const GRAPH_URL = 'https://graph.instagram.com';

// Facebook Pages API host (Page photo posts — separate from the IG host above)
const FB_GRAPH_URL = 'https://graph.facebook.com/v23.0';

type FacebookResult =
  | { skipped: true; reason: string }
  | { ok: true; postId: string }
  | { ok: false; error: string };

/** Only self-hosted promo posters may be published. */
const ALLOWED_IMAGE_PREFIXES = [
  'https://americanheroesandbrew.com/promos/',
  'https://heroes-tau-neon.vercel.app/promos/',
];

interface PublishBody {
  imageUrl?: unknown;
  caption?: unknown;
}

interface GraphError {
  error?: { message?: string; type?: string; code?: number };
}

export async function POST(req: NextRequest) {
  // ── Auth: Bearer PROMOS_SECRET (mirrors the cron route's guard) ──────────
  const authHeader = req.headers.get('authorization');
  const secret = process.env.PROMOS_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Validate body ────────────────────────────────────────────────────────
  let body: PublishBody;
  try {
    body = (await req.json()) as PublishBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { imageUrl, caption } = body;

  if (typeof imageUrl !== 'string' || !isAllowedImageUrl(imageUrl)) {
    return NextResponse.json(
      {
        error: `imageUrl must start with one of: ${ALLOWED_IMAGE_PREFIXES.join(', ')}`,
      },
      { status: 400 }
    );
  }

  if (typeof caption !== 'string' || caption.trim().length === 0) {
    return NextResponse.json(
      { error: 'caption must be a non-empty string' },
      { status: 400 }
    );
  }

  // ── Required Instagram credentials ───────────────────────────────────────
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!accessToken || !userId) {
    return NextResponse.json(
      { error: 'Server missing INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_USER_ID' },
      { status: 500 }
    );
  }

  // ── Step 1: create a media container ─────────────────────────────────────
  const containerRes = await fetch(`${GRAPH_URL}/${userId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      image_url: imageUrl,
      caption,
      access_token: accessToken,
    }),
  });

  const containerData = (await containerRes.json().catch(() => ({}))) as
    GraphError & { id?: string };

  if (!containerRes.ok || !containerData.id) {
    const message =
      containerData.error?.message ??
      `Media container creation failed (HTTP ${containerRes.status})`;
    console.error('Instagram media container error:', message);
    return NextResponse.json(
      { error: `Instagram Graph API: ${message}` },
      { status: 502 }
    );
  }

  // ── Step 1.5: wait for the container to finish processing ────────────────
  // media_publish fails with "Media ID is not available" when called before the
  // container is FINISHED, so poll status_code first (images are usually quick).
  const containerId = containerData.id;
  let status = '';
  for (let attempt = 0; attempt < 15; attempt++) {
    const statusRes = await fetch(
      `${GRAPH_URL}/${containerId}?fields=status_code&access_token=${encodeURIComponent(accessToken)}`
    );
    const statusData = (await statusRes.json().catch(() => ({}))) as
      GraphError & { status_code?: string };
    status = statusData.status_code ?? '';

    if (status === 'FINISHED') break;
    if (status === 'ERROR' || status === 'EXPIRED') {
      const message = statusData.error?.message ?? `container status ${status}`;
      console.error('Instagram container processing error:', message);
      return NextResponse.json(
        { error: `Instagram Graph API: ${message}` },
        { status: 502 }
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  if (status !== 'FINISHED') {
    return NextResponse.json(
      { error: 'Instagram Graph API: media container did not finish processing in time' },
      { status: 504 }
    );
  }

  // ── Step 2: publish the container ────────────────────────────────────────
  const publishRes = await fetch(`${GRAPH_URL}/${userId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      creation_id: containerData.id,
      access_token: accessToken,
    }),
  });

  const publishData = (await publishRes.json().catch(() => ({}))) as
    GraphError & { id?: string };

  if (!publishRes.ok || !publishData.id) {
    const message =
      publishData.error?.message ??
      `Media publish failed (HTTP ${publishRes.status})`;
    console.error('Instagram media publish error:', message);
    return NextResponse.json(
      { error: `Instagram Graph API: ${message}` },
      { status: 502 }
    );
  }

  // ── Step 3: cross-post the same image + caption to the Facebook Page ─────
  // Never fails the request — Instagram has already published at this point.
  const facebook = await publishToFacebookPage(imageUrl, caption);

  return NextResponse.json({ ok: true, mediaId: publishData.id, facebook });
}

function isAllowedImageUrl(url: string): boolean {
  return ALLOWED_IMAGE_PREFIXES.some((prefix) => url.startsWith(prefix));
}

/**
 * Posts a photo to the Facebook Page (single-step:
 * POST /{page-id}/photos with a hosted image URL + message).
 * Skips cleanly when FB credentials are not configured.
 */
async function publishToFacebookPage(
  imageUrl: string,
  caption: string
): Promise<FacebookResult> {
  const pageId = process.env.FB_PAGE_ID;
  const pageToken = process.env.FB_PAGE_ACCESS_TOKEN;

  if (!pageId || !pageToken) {
    return {
      skipped: true,
      reason: 'FB_PAGE_ID / FB_PAGE_ACCESS_TOKEN not set — Facebook cross-post skipped',
    };
  }

  try {
    const res = await fetch(`${FB_GRAPH_URL}/${pageId}/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        url: imageUrl,
        message: caption,
        access_token: pageToken,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as GraphError & {
      id?: string;
      post_id?: string;
    };

    if (!res.ok || !(data.post_id || data.id)) {
      const message =
        data.error?.message ?? `Page photo publish failed (HTTP ${res.status})`;
      console.error('Facebook Page publish error:', message);
      return { ok: false, error: `Facebook Pages API: ${message}` };
    }

    return { ok: true, postId: data.post_id ?? data.id! };
  } catch (err) {
    console.error('Facebook Page publish error:', err);
    return { ok: false, error: String(err) };
  }
}
