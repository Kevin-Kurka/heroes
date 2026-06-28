import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/promos/publish-google
 *
 * Publishes a Google Business Profile "local post" (the updates that show on the
 * business's Google Search / Maps listing) via the Business Profile API:
 *   POST https://mybusiness.googleapis.com/v4/accounts/{acct}/locations/{loc}/localPosts
 *
 * Secured by PROMOS_SECRET (same Bearer-header pattern as the other promo routes).
 *
 * Google Posts are IMAGE or TEXT only — there is no video local post. So the sheet
 * publisher sends the poster image for image rows, and a text-only post (summary only)
 * for video rows.
 *
 * Auth: a long-lived OAuth refresh token for the managing Google account (with the
 * `https://www.googleapis.com/auth/business.manage` scope) is exchanged for a short-lived
 * access token on each call. The project ALSO has to be approved for the Business Profile
 * API (Google's gated access request) or the API returns 403 PERMISSION_DENIED.
 *
 * Required env (all must be set, else the route reports "not configured" and the caller
 * treats Google as a best-effort/skipped channel — it never blocks IG/Story publishing):
 *   GOOGLE_BUSINESS_CLIENT_ID, GOOGLE_BUSINESS_CLIENT_SECRET, GOOGLE_BUSINESS_REFRESH_TOKEN,
 *   GOOGLE_BUSINESS_ACCOUNT_ID, GOOGLE_BUSINESS_LOCATION_ID
 */

const GBP_API = 'https://mybusiness.googleapis.com/v4';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

// Only self-hosted promo images may be posted (same allow-list spirit as the IG route).
const ALLOWED_IMAGE_PREFIXES = [
  'https://americanheroesandbrew.com/promos/',
  'https://americanheroesandbrew.com/api/og/',
  'https://heroes-tau-neon.vercel.app/promos/',
  'https://heroes-tau-neon.vercel.app/api/og/',
];

// Google Business Profile call-to-action button types (url required except CALL).
const CTA_TYPES = ['BOOK', 'ORDER', 'SHOP', 'LEARN_MORE', 'SIGN_UP', 'CALL'];

interface PublishBody {
  caption?: unknown; // post body text (summary)
  imageUrl?: unknown; // optional poster image; omitted → text-only post
  ctaType?: unknown; // optional CALL/LEARN_MORE/... ; default LEARN_MORE when ctaUrl present
  ctaUrl?: unknown; // optional button URL
  eventTitle?: unknown; // present → an EVENT post
  eventStart?: unknown; // ISO; required when eventTitle present
  eventEnd?: unknown;   // ISO; required when eventTitle present
}

const isAllowedUrl = (url: string, prefixes: string[]) => prefixes.some((p) => url.startsWith(p));

/**
 * Split an ISO timestamp into the GBP `event.schedule` date + time objects, using
 * the business's local timezone (America/Los_Angeles) wall-clock. Exported for unit tests.
 */
export function gbpDateTime(iso: string): {
  date: { year: number; month: number; day: number };
  time: { hours: number; minutes: number; seconds: number };
} {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', hour12: false,
  }).formatToParts(new Date(iso));
  const g = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return {
    date: { year: g('year'), month: g('month'), day: g('day') },
    time: { hours: g('hour') % 24, minutes: g('minute'), seconds: 0 },
  };
}

export async function POST(req: NextRequest) {
  // ── Auth: Bearer PROMOS_SECRET ────────────────────────────────────────────
  const secret = process.env.PROMOS_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Credentials (graceful when not yet set up — non-blocking for callers) ──
  const clientId = process.env.GOOGLE_BUSINESS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_BUSINESS_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_BUSINESS_REFRESH_TOKEN;
  const accountId = process.env.GOOGLE_BUSINESS_ACCOUNT_ID;
  const locationId = process.env.GOOGLE_BUSINESS_LOCATION_ID;
  if (!clientId || !clientSecret || !refreshToken || !accountId || !locationId) {
    return NextResponse.json(
      { ok: false, skipped: true, error: 'Google Business Profile not configured (missing GOOGLE_BUSINESS_* env)' },
      { status: 503 }
    );
  }

  // ── Validate body ──────────────────────────────────────────────────────────
  let body: PublishBody;
  try {
    body = (await req.json()) as PublishBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { caption, imageUrl, ctaUrl } = body;
  if (typeof caption !== 'string' || caption.trim().length === 0) {
    return NextResponse.json({ error: 'caption must be a non-empty string' }, { status: 400 });
  }
  const hasImage = typeof imageUrl === 'string' && imageUrl.length > 0;
  if (hasImage && !isAllowedUrl(imageUrl as string, ALLOWED_IMAGE_PREFIXES)) {
    return NextResponse.json(
      { error: `imageUrl must start with one of: ${ALLOWED_IMAGE_PREFIXES.join(', ')}` },
      { status: 400 }
    );
  }
  const ctaType = typeof body.ctaType === 'string' && CTA_TYPES.includes(body.ctaType)
    ? body.ctaType
    : 'LEARN_MORE';
  const hasCta = typeof ctaUrl === 'string' && ctaUrl.length > 0;

  // ── Optional EVENT fields (all-or-nothing) ─────────────────────────────────
  const { eventTitle, eventStart, eventEnd } = body;
  const anyEvent = eventTitle != null || eventStart != null || eventEnd != null;
  const isEvent =
    typeof eventTitle === 'string' && eventTitle.trim().length > 0 &&
    typeof eventStart === 'string' && !Number.isNaN(Date.parse(eventStart)) &&
    typeof eventEnd === 'string' && !Number.isNaN(Date.parse(eventEnd));
  if (anyEvent && !isEvent) {
    return NextResponse.json(
      { error: 'EVENT posts require eventTitle, eventStart (ISO), and eventEnd (ISO)' },
      { status: 400 }
    );
  }

  // ── 1) Refresh token → access token ────────────────────────────────────────
  let accessToken: string;
  try {
    const tokenRes = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });
    const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string; error_description?: string };
    if (!tokenRes.ok || !tokenData.access_token) {
      const msg = tokenData.error_description || tokenData.error || `token HTTP ${tokenRes.status}`;
      console.error('GBP token refresh error:', msg);
      return NextResponse.json({ ok: false, error: `OAuth token refresh failed: ${msg}` }, { status: 502 });
    }
    accessToken = tokenData.access_token;
  } catch (e) {
    return NextResponse.json({ ok: false, error: `OAuth token refresh threw: ${String(e)}` }, { status: 502 });
  }

  // ── 2) Create the local post ───────────────────────────────────────────────
  const post: Record<string, unknown> = {
    languageCode: 'en-US',
    summary: caption,
    topicType: isEvent ? 'EVENT' : 'STANDARD',
  };
  if (isEvent) {
    post.event = {
      title: (eventTitle as string).trim(),
      schedule: {
        startDate: gbpDateTime(eventStart as string).date,
        startTime: gbpDateTime(eventStart as string).time,
        endDate: gbpDateTime(eventEnd as string).date,
        endTime: gbpDateTime(eventEnd as string).time,
      },
    };
  }
  if (hasImage) post.media = [{ mediaFormat: 'PHOTO', sourceUrl: imageUrl }];
  if (hasCta) post.callToAction = { actionType: ctaType, url: ctaUrl };

  try {
    const url = `${GBP_API}/accounts/${accountId}/locations/${locationId}/localPosts`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    const data = (await res.json()) as { name?: string; error?: { message?: string } };
    if (!res.ok) {
      const msg = data.error?.message ?? `localPosts HTTP ${res.status}`;
      console.error('GBP localPosts.create error:', msg);
      return NextResponse.json({ ok: false, error: `Business Profile API: ${msg}` }, { status: 502 });
    }
    return NextResponse.json({ ok: true, name: data.name });
  } catch (e) {
    return NextResponse.json({ ok: false, error: `localPosts.create threw: ${String(e)}` }, { status: 502 });
  }
}
