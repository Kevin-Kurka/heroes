import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

/**
 * /review — a clean, branded short link that drops customers straight into the
 * Google "write a review" box for American Heroes & Brew. Put it on receipts,
 * table tents, and a QR code; the easier it is to leave a review, the more you
 * get — and review volume is the #1 signal for "best sports bar near me" in
 * both Google and AI assistants.
 *
 * Built from the listing's Google feature ID (CID 1149048696343315110).
 * Override with REVIEW_URL in Vercel if you grab the exact g.page/r/… link from
 * Business Profile → "Get more reviews".
 */
const REVIEW_URL =
  process.env.REVIEW_URL ??
  'https://search.google.com/local/writereview?placeid=0x80dc735e008351a5:0xff23db38f2b42a6';

export function GET() {
  return NextResponse.redirect(REVIEW_URL, 302);
}
