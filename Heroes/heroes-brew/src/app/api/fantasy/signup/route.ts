import { NextRequest, NextResponse } from 'next/server';
import { MAX_LEAGUES_PER_USER } from '@/lib/fantasy';

/**
 * POST /api/fantasy/signup
 *
 * Two signup types, forwarded to a Google Apps Script Web App (env
 * FANTASY_SIGNUP_URL) that writes to SEPARATE Sheet tabs and emails the owner:
 *   - type 'join'     → name, email, leagueIds[] (1–3), draftDates[]  → "Heroes League Joins" tab
 *   - type 'register' → name (commissioner), leagueName, email, phone, draftDate → "Registered Leagues" tab
 * Apps Script enforces the caps (10 players/league, 3 leagues/email, no dupes).
 * No DB. If FANTASY_SIGNUP_URL is unset → {ok:false, configured:false} so the
 * form shows a graceful DM/call fallback. See docs/fantasy-football-signup-setup.md.
 */

function s(v: unknown, max = 300): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }

  const type = s(body.type) === 'register' ? 'register' : 'join';
  let payload: Record<string, unknown>;

  if (type === 'join') {
    const name = s(body.name);
    const email = s(body.email);
    const leagueIds = Array.isArray(body.leagueIds) ? body.leagueIds.map((x) => s(x, 80)).filter(Boolean) : [];
    const draftDates = Array.isArray(body.draftDates) ? body.draftDates.map((x) => s(x, 60)) : [];
    if (!name || !email) return NextResponse.json({ ok: false, error: 'Name and email are required.' }, { status: 422 });
    if (!leagueIds.length) return NextResponse.json({ ok: false, error: 'Pick at least one draft date.' }, { status: 422 });
    if (leagueIds.length > MAX_LEAGUES_PER_USER)
      return NextResponse.json({ ok: false, error: `You can join up to ${MAX_LEAGUES_PER_USER} leagues.` }, { status: 422 });
    payload = { type, name, email, leagueIds, draftDates };
  } else {
    const name = s(body.name);
    const leagueName = s(body.leagueName);
    const email = s(body.email);
    const phone = s(body.phone, 40);
    const draftDate = s(body.draftDate, 40);
    if (!name || !leagueName || !email) return NextResponse.json({ ok: false, error: 'Name, league name, and email are required.' }, { status: 422 });
    payload = { type, name, leagueName, email, phone, draftDate };
  }

  const endpoint = process.env.FANTASY_SIGNUP_URL;
  if (!endpoint) return NextResponse.json({ ok: false, configured: false });

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, submittedAt: new Date().toISOString(), source: 'fantasy-football' }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      // Apps Script may reject (league full / over 3-league limit / dupe).
      return NextResponse.json({ ok: false, full: !!data.full, error: data.error || 'Could not complete signup.' }, { status: 200 });
    }
    return NextResponse.json({ ok: true, joined: data.joined, skipped: data.skipped });
  } catch (err) {
    console.error('fantasy signup forward failed:', err);
    return NextResponse.json({ ok: false, error: 'Could not submit right now.' }, { status: 502 });
  }
}
