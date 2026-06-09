import 'server-only';
import { parseCsv } from './menu-sheet';

/**
 * Promo posters → Instagram daily publisher (data layer).
 *
 * Reads the "Event Posters & Posts" Google Sheet via its published-to-web CSV
 * (`PROMOS_SHEET_CSV_URL`) and exposes the rows that are due to post today.
 *
 * Publish gate: Approval = "Approve" AND Posted (IG) empty AND Post Date = today (PT).
 * There is intentionally no write-back (MVP); idempotency comes from the once-daily
 * cron + the date-equals-today match, so each row fires once on its scheduled day.
 */

const SITE = 'https://americanheroesandbrew.com';

export interface PromoRow {
  imageFile: string;
  post: string;
  headline: string;
  caption: string;
  hashtags: string;
  postDate: string; // raw, e.g. "Thu Jun 11, 2026 — 9:00 AM"
  approval: string;
  postedIg: string;
  imageUrl: string; // derived public poster URL
  igCaption: string; // caption + hashtags, ready for Instagram
}

const findIdx = (header: string[], pred: (h: string) => boolean) =>
  header.findIndex((h) => pred(h.trim().toLowerCase()));

export async function fetchPromoRows(csvUrl: string): Promise<PromoRow[]> {
  const res = await fetch(csvUrl, { cache: 'no-store' });
  if (!res.ok) throw new Error(`promos CSV fetch failed: HTTP ${res.status}`);

  const rows = parseCsv(await res.text());
  if (rows.length < 2) return [];

  const header = rows[0];
  const iImg = findIdx(header, (h) => h === 'image file');
  const iPost = findIdx(header, (h) => h === 'post');
  const iHead = findIdx(header, (h) => h === 'headline');
  const iCap = findIdx(header, (h) => h.startsWith('caption'));
  const iTags = findIdx(header, (h) => h === 'hashtags');
  const iDate = findIdx(header, (h) => h.startsWith('post date'));
  const iAppr = findIdx(header, (h) => h === 'approval');
  const iPosted = findIdx(header, (h) => h.startsWith('posted (ig)'));

  const cell = (r: string[], i: number) => (i >= 0 ? (r[i] ?? '').trim() : '');

  return rows
    .slice(1)
    .filter((r) => cell(r, iImg))
    .map((r) => {
      const imageFile = cell(r, iImg);
      const caption = cell(r, iCap);
      const hashtags = cell(r, iTags);
      return {
        imageFile,
        post: cell(r, iPost),
        headline: cell(r, iHead),
        caption,
        hashtags,
        postDate: cell(r, iDate),
        approval: cell(r, iAppr),
        postedIg: cell(r, iPosted),
        imageUrl: `${SITE}/promos/${imageFile}`,
        igCaption: hashtags ? `${caption}\n\n${hashtags}` : caption,
      };
    });
}

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

interface YMD {
  y: number;
  m: number;
  d: number;
}

/** Parse a date out of "Thu Jun 11, 2026 — 9:00 AM" (time ignored). */
export function parsePromoDate(raw: string): YMD | null {
  const match = raw.match(/([A-Za-z]{3,})\s+(\d{1,2}),\s*(\d{4})/);
  if (!match) return null;
  const m = MONTHS[match[1].slice(0, 3).toLowerCase()];
  if (m === undefined) return null;
  return { y: Number(match[3]), m, d: Number(match[2]) };
}

/** Today's calendar date in America/Los_Angeles. */
export function todayInPT(now: Date = new Date()): YMD {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { y: get('year'), m: get('month') - 1, d: get('day') };
}

/** Row is approved, not yet posted to IG, and dated today (PT). */
export function isDueToday(row: PromoRow, today: YMD = todayInPT()): boolean {
  if (!/^approve/i.test(row.approval)) return false;
  if (row.postedIg !== '') return false;
  const d = parsePromoDate(row.postDate);
  return !!d && d.y === today.y && d.m === today.m && d.d === today.d;
}
