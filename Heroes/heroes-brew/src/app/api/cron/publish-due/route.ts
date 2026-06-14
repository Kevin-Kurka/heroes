import { NextRequest, NextResponse } from 'next/server';
import { fetchPromoRows, isDueToday } from '@/lib/promos-sheet';

/**
 * Cron: publish today's approved promo posters to Instagram.
 *
 * Reads the published-CSV Google Sheet (PROMOS_SHEET_CSV_URL), finds rows due
 * today (Approval=Approve, Posted (IG) empty, Post Date=today PT), and posts each
 * through the already-verified /api/promos/publish-instagram endpoint (reusing its
 * image-prefix validation + container→poll→publish flow).
 *
 * Guarded by CRON_SECRET (Vercel sends it as a Bearer header for vercel.json crons).
 *
 * Role: late-night SAFETY NET (schedule 0 6 * * * ≈ 11 PM PT). The primary driver is
 * the sheet-bound Apps Script (scripts/sheet-auto-publisher.gs), which fires at each
 * post's exact time and writes Posted (IG) back. This cron only catches rows the Apps
 * Script missed entirely (still unstamped) — running after all daily post times means it
 * cannot double-post a row the Apps Script already stamped. See promos-sheet.ts.
 */
export const dynamic = 'force-dynamic';

const SITE = 'https://americanheroesandbrew.com';

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const csvUrl = process.env.PROMOS_SHEET_CSV_URL;
  const promosSecret = process.env.PROMOS_SECRET;
  if (!csvUrl) {
    return NextResponse.json({ error: 'PROMOS_SHEET_CSV_URL not set' }, { status: 500 });
  }
  if (!promosSecret) {
    return NextResponse.json({ error: 'PROMOS_SECRET not set' }, { status: 500 });
  }

  let rows;
  try {
    rows = await fetchPromoRows(csvUrl);
  } catch (err) {
    console.error('publish-due: failed to read promos sheet', err);
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }

  const due = rows.filter((r) => isDueToday(r));

  const results = [];
  for (const row of due) {
    try {
      const payload: Record<string, string> = {
        caption: row.igCaption,
        mediaType: row.channel === 'Story' ? 'story' : 'feed',
      };
      if (row.media === 'video' && row.videoUrl) {
        payload.videoUrl = row.videoUrl;
        if (row.imageUrl) payload.imageUrl = row.imageUrl;
      } else {
        payload.imageUrl = row.imageUrl;
      }
      const res = await fetch(`${SITE}/api/promos/publish-instagram`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${promosSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        mediaId?: string;
        error?: string;
        facebook?: unknown;
      };
      results.push(
        res.ok
          ? { post: row.post, imageFile: row.imageFile, ok: true, mediaId: data.mediaId, facebook: data.facebook }
          : { post: row.post, imageFile: row.imageFile, ok: false, error: data.error ?? `HTTP ${res.status}` }
      );
    } catch (err) {
      results.push({ post: row.post, imageFile: row.imageFile, ok: false, error: String(err) });
    }
  }

  return NextResponse.json({
    ok: true,
    checked: rows.length,
    dueToday: due.map((r) => r.post),
    published: results.filter((r) => r.ok).length,
    results,
  });
}
