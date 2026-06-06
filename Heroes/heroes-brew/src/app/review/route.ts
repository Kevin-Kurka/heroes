import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

/**
 * /review — a clean, branded short link that drops customers straight into the
 * Google "write a review" box for American Heroes & Brew. Put it on receipts,
 * table tents, and a QR code; the easier it is to leave a review, the more you
 * get — and review volume is the #1 signal for "best sports bar near me" in
 * both Google and AI assistants.
 *
 * Points at the verified Google listing via its CID (1149048696343315110),
 * where "Write a review" is one tap. The older writereview?placeid=<feature-id>
 * form 404'd because that endpoint needs a ChIJ Place ID, not the hex feature
 * ID — so this CID listing link is the reliable default.
 *
 * Best upgrade: in Business Profile → "Ask for reviews", copy the g.page/r/…/review
 * one-tap link and set it as REVIEW_URL in Vercel — it drops users straight into
 * the review box. No code change needed.
 */
const REVIEW_URL =
  process.env.REVIEW_URL ?? 'https://www.google.com/maps?cid=1149048696343315110';

export function GET() {
  return NextResponse.redirect(REVIEW_URL, 302);
}
