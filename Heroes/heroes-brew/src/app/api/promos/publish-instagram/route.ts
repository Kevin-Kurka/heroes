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
 */

// Same Graph host the rest of the app uses (src/lib/instagram.ts)
const GRAPH_URL = 'https://graph.instagram.com';

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

  return NextResponse.json({ ok: true, mediaId: publishData.id });
}

function isAllowedImageUrl(url: string): boolean {
  return ALLOWED_IMAGE_PREFIXES.some((prefix) => url.startsWith(prefix));
}
