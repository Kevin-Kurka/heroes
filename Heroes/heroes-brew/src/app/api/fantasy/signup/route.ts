import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/fantasy/signup
 *
 * Receives a Heroes Fantasy Football League signup and forwards it to a Google
 * Apps Script Web App (env FANTASY_SIGNUP_URL) that appends a row to a Google
 * Sheet and emails the owner — same lightweight pattern as the promos pipeline.
 * No database. If FANTASY_SIGNUP_URL is unset, responds 200 with
 * {ok:false, configured:false} so the form can show a graceful "DM us" fallback
 * instead of erroring. See docs/fantasy-football-signup-setup.md.
 */

const FIELDS = ['name', 'contact', 'mode', 'leagueName', 'players', 'hostDraft', 'draftDate', 'message'] as const;
type Field = (typeof FIELDS)[number];

function clean(v: unknown, max = 500): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }

  const data: Record<Field, string> = {} as Record<Field, string>;
  for (const f of FIELDS) data[f] = clean(body[f]);

  // Minimal validation: need a name and some way to reach them.
  if (!data.name || !data.contact) {
    return NextResponse.json({ ok: false, error: 'Name and contact are required.' }, { status: 422 });
  }

  const endpoint = process.env.FANTASY_SIGNUP_URL;
  if (!endpoint) {
    // Not wired to a Sheet yet — tell the client to show the fallback CTA.
    return NextResponse.json({ ok: false, configured: false });
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, submittedAt: new Date().toISOString(), source: 'fantasy-football' }),
    });
    if (!res.ok) throw new Error(`sheet endpoint ${res.status}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('fantasy signup forward failed:', err);
    return NextResponse.json({ ok: false, error: 'Could not submit right now.' }, { status: 502 });
  }
}
