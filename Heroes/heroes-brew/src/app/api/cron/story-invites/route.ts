import { NextResponse } from 'next/server';

/**
 * DISABLED (Oct 26, 2026, per Kevin): local-game (Padres/Chargers LOCAL-tier) Instagram
 * Story invites are retired. The daily 9 AM PT cron entry was removed from vercel.json,
 * and this route now refuses to post anything. The new game-day campaign (all NFL + big
 * college football) runs through the sheet/publish pipeline instead.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    { ok: false, disabled: true, reason: 'story-invites retired Oct 26, 2026 (local-game Stories removed)' },
    { status: 410 }
  );
}
