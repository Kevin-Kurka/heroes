import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

/**
 * /review — a clean, branded short link that drops customers straight into the
 * Google "write a review" box for American Heroes & Brew. Put it on receipts,
 * table tents, and a QR code; the easier it is to leave a review, the more you
 * get — and review volume is the #1 signal for "best sports bar near me" in
 * both Google and AI assistants.
 *
 * Points at the canonical Google "write a review" composer via the place's stable
 * Place ID. We previously used the Business-Profile g.page/r/<code>/review short
 * link, but that link silently bounced to the Google homepage (google.com/?zx=…) —
 * a known failure mode of g.page/r review links — so scans landed nowhere. The
 * search.google.com/local/writereview?placeid=<id> form is stable and drops the
 * user straight into the star-rating composer (verified live). Place ID derived
 * from the listing's feature id 0x80dc735e008351a5:0xff23db38f2b42a6 (CID
 * 1149048696343315110). Override with REVIEW_URL if it ever changes.
 */
const REVIEW_URL =
  process.env.REVIEW_URL ??
  'https://search.google.com/local/writereview?placeid=ChIJpVGDAF5z3IARpkIrj7M98g8';

export function GET() {
  return NextResponse.redirect(REVIEW_URL, 302);
}
