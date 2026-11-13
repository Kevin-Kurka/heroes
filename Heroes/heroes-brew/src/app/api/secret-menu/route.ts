import { NextResponse } from 'next/server';
import { SECRET_MENU_ITEMS, SECRET_MENU_NOTE } from '@/lib/secret-menu';

export const runtime = 'nodejs';

interface Body {
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Secret-menu unlock. Validates the lead (name + an email or phone), forwards it
 * to the Google Sheets Apps Script web app (SHEETS_WEBHOOK_URL), then returns the
 * off-menu items. The Sheets write never blocks the unlock — a guest who gives
 * their info always gets the menu, even if logging hiccups.
 */
export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const name = (body.name ?? '').trim();
  const email = (body.email ?? '').trim();
  const phone = (body.phone ?? '').trim();
  const source = (body.source ?? 'secret-menu').trim();

  if (!name) {
    return NextResponse.json({ ok: false, error: 'Please enter your name.' }, { status: 400 });
  }
  if (!email && !phone) {
    return NextResponse.json({ ok: false, error: 'Add an email or phone number.' }, { status: 400 });
  }
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'That email looks off — check it?' }, { status: 400 });
  }

  const webhook = process.env.SHEETS_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ timestamp: new Date().toISOString(), name, email, phone, source }),
      });
    } catch (err) {
      console.error('Secret menu: Sheets webhook failed', err);
    }
  } else {
    console.warn('Secret menu signup (SHEETS_WEBHOOK_URL unset):', { name, email, phone, source });
  }

  return NextResponse.json({ ok: true, items: SECRET_MENU_ITEMS, note: SECRET_MENU_NOTE });
}
