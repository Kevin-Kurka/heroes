import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

/**
 * /review — a clean, branded short link that drops customers straight into the
 * Google "write a review" box for American Heroes & Brew. Put it on receipts,
 * table tents, and a QR code; the easier it is to leave a review, the more you
 * get — and review volume is the #1 signal for "best sports bar near me" in
 * both Google and AI assistants.
 *
 * Points at the official Google "write a review" one-tap link (the g.page/r/…/review
 * form copied from Business Profile → "Ask for reviews"), which drops the user
 * straight into the review composer — one fewer tap than the bare listing, so more
 * reviews actually get left. Review volume is the #1 signal for "best sports bar
 * near me" in both Google and AI assistants. Override with REVIEW_URL if it changes.
 */
const REVIEW_URL =
  process.env.REVIEW_URL ?? 'https://g.page/r/CaZCK4-zPflPEBM/review';

export function GET() {
  return NextResponse.redirect(REVIEW_URL, 302);
}
