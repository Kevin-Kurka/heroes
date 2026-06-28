import { NextRequest, NextResponse } from 'next/server';
import { getCuratedPromos } from '@/lib/curated-promos';

// Curation reads the live 7-day schedule on each call — never cache.
export const dynamic = 'force-dynamic';

/**
 * GET /api/promos/curate
 *
 * Returns the curated promo rows (Google Events + schedule Stories) for the rolling
 * 7-day window, ready for the Apps Script seeder to upsert into the promos sheet.
 * Guarded by PROMOS_SECRET (Bearer header), same as the other promo routes.
 * Best-effort: on any failure it returns an empty list with 200 so the seeder simply
 * seeds nothing and retries next day (never throws into the sheet workflow).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.PROMOS_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const rows = await getCuratedPromos();
    return NextResponse.json({ ok: true, count: rows.length, rows });
  } catch (e) {
    console.error('curate error:', e);
    return NextResponse.json({ ok: false, count: 0, rows: [], error: String(e) });
  }
}
