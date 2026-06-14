import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents } from '@/lib/events';
import { buildEventStoryImageUrl, buildSocialCaption } from '@/lib/share-content';

/**
 * Cron: post an Instagram Story "watch invite" for every LOCAL-tier game happening
 * today. Pulls the live events feed (same data as /events), takes today's promoted
 * games that haven't ended, and posts a 9:16 auto matchup card to the Story via
 * /api/promos/publish-instagram (mediaType=story).
 *
 * MARQUEE games are intentionally skipped here — those get a designed Feed post
 * approved through the monthly sheet, not an auto Story invite.
 *
 * Runs once daily (morning PT). Guarded by CRON_SECRET. Idempotent by virtue of the
 * once-a-day schedule: each of today's games is invited once.
 */
export const dynamic = 'force-dynamic';

const SITE = 'https://americanheroesandbrew.com';

const ymdPT = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(d);

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const promosSecret = process.env.PROMOS_SECRET;
  if (!promosSecret) {
    return NextResponse.json({ error: 'PROMOS_SECRET not set' }, { status: 500 });
  }

  let events;
  try {
    events = await getAllEvents();
  } catch (err) {
    console.error('story-invites: failed to load events', err);
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }

  const today = ymdPT(new Date());
  const due = events.filter(
    (e) =>
      e.tier === 'LOCAL' &&
      ymdPT(new Date(e.eventTimestamp)) === today &&
      !(e.homeScore !== undefined && !e.isLive) // skip games already final
  );

  const results = [];
  for (const e of due) {
    try {
      const res = await fetch(`${SITE}/api/promos/publish-instagram`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${promosSecret}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: buildEventStoryImageUrl(e),
          caption: buildSocialCaption(e),
          mediaType: 'story',
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { mediaId?: string; error?: string };
      results.push(
        res.ok
          ? { id: e.id, ok: true, mediaId: data.mediaId }
          : { id: e.id, ok: false, error: data.error ?? `HTTP ${res.status}` }
      );
    } catch (err) {
      results.push({ id: e.id, ok: false, error: String(err) });
    }
  }

  return NextResponse.json({
    ok: true,
    checked: events.length,
    invited: due.map((e) => e.id),
    posted: results.filter((r) => r.ok).length,
    results,
  });
}
