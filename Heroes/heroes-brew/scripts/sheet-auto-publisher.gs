/**
 * American Heroes & Brew — event-driven Instagram auto-publisher (Google Apps Script)
 *
 * Bound to the "Event Posters & Posts" Google Sheet. Instead of the app polling on a
 * schedule, the Sheet drives publishing itself:
 *   • Any edit (e.g. setting Approval = Approve, or changing a Post Date) re-arms a single
 *     one-off time trigger at the NEXT approved + unposted post's scheduled time.
 *   • At that time the script calls the site's publish endpoint, stamps "Posted (IG)",
 *     then immediately arms the following post. No polling; reschedules on every change.
 *
 * ── ONE-TIME SETUP ────────────────────────────────────────────────────────────────
 *   1. In the Sheet: Extensions → Apps Script. Paste this file (replace any default code).
 *   2. Project Settings (gear) → Time zone → "America/Los_Angeles".
 *   3. Project Settings → Script Properties → add:
 *        PUBLISH_URL    https://americanheroesandbrew.com/api/promos/publish-instagram
 *        PROMOS_SECRET  <the PROMOS_SECRET value>
 *        SITE           https://americanheroesandbrew.com
 *   4. Select the `setup` function and click Run. Approve the permissions prompt.
 *      (That authorizes Sheet edits, outbound requests, and trigger creation.)
 * After that it is fully automatic.
 */

const SHEET_NAME = ''; // '' = first sheet; set a tab name to target a specific one.
const PUBLISH_FN = 'publishDue';
const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

function props_() { return PropertiesService.getScriptProperties(); }

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
}

/** Map header names → 0-based column indexes. */
function cols_(header) {
  const norm = header.map(function (h) { return String(h).trim().toLowerCase(); });
  function find(pred) { return norm.findIndex(pred); }
  return {
    img: find(function (h) { return h === 'image file'; }),
    cap: find(function (h) { return h.indexOf('caption') === 0; }),
    tags: find(function (h) { return h === 'hashtags'; }),
    date: find(function (h) { return h.indexOf('post date') === 0; }),
    appr: find(function (h) { return h === 'approval'; }),
    posted: find(function (h) { return h.indexOf('posted (ig)') === 0; }),
  };
}

/** Parse "Thu Jun 11, 2026 — 9:00 AM" → Date in the script's (PT) timezone. */
function parseWhen_(raw) {
  const s = String(raw);
  const d = s.match(/([A-Za-z]{3,})\s+(\d{1,2}),\s*(\d{4})/);
  if (!d) return null;
  const mo = MONTHS[d[1].slice(0, 3).toLowerCase()];
  if (mo === undefined) return null;
  let hh = 9, mm = 0;
  const t = s.match(/(\d{1,2}):(\d{2})\s*([AaPp])[Mm]/);
  if (t) { hh = Number(t[1]) % 12; if (t[3].toLowerCase() === 'p') hh += 12; mm = Number(t[2]); }
  return new Date(Number(d[3]), mo, Number(d[2]), hh, mm, 0);
}

/** Read rows as objects with parsed dates + their 1-based sheet row number. */
function rows_() {
  const sh = sheet_();
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return { sh: sh, c: null, list: [] };
  const c = cols_(values[0]);
  const list = [];
  for (let i = 1; i < values.length; i++) {
    const r = values[i];
    const img = String(r[c.img] || '').trim();
    if (!img) continue;
    list.push({
      rowNum: i + 1,
      img: img,
      caption: String(r[c.cap] || '').trim(),
      hashtags: String(r[c.tags] || '').trim(),
      approval: String(r[c.appr] || '').trim(),
      posted: String(r[c.posted] || '').trim(),
      when: parseWhen_(r[c.date]),
    });
  }
  return { sh: sh, c: c, list: list };
}

/** Approved, not yet posted to IG, and has a parseable date. */
function isLive_(row) {
  return /^approve/i.test(row.approval) && row.posted === '' && !!row.when;
}

function clearPublishTriggers_() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === PUBLISH_FN) ScriptApp.deleteTrigger(t);
  });
}

/** Midnight today in the script's (PT) timezone. */
function startOfTodayPT_() {
  const tz = Session.getScriptTimeZone();
  const d = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd').split('-');
  return new Date(Number(d[0]), Number(d[1]) - 1, Number(d[2]), 0, 0, 0);
}

/**
 * Arm a single one-off trigger at the earliest TODAY-or-future approved/unposted post.
 * Rows dated before today are intentionally ignored (stale) — to re-trigger one,
 * move its Post Date to today or a future date in the sheet.
 */
function scheduleNext() {
  clearPublishTriggers_();
  const start = startOfTodayPT_();
  const list = rows_().list
    .filter(isLive_)
    .filter(function (r) { return r.when >= start; })
    .sort(function (a, b) { return a.when - b.when; });
  if (!list.length) return;
  let at = list[0].when;
  const soon = new Date(Date.now() + 60 * 1000);
  if (at < soon) at = soon; // today but time already passed → fire ~1 minute out
  ScriptApp.newTrigger(PUBLISH_FN).timeBased().at(at).create();
}

/** Publish everything now due, stamp Posted (IG), then arm the next. */
function publishDue() {
  const p = props_();
  const url = p.getProperty('PUBLISH_URL');
  const secret = p.getProperty('PROMOS_SECRET');
  const site = p.getProperty('SITE') || 'https://americanheroesandbrew.com';
  const data = rows_();
  const now = new Date();
  const start = startOfTodayPT_();

  // Due = approved, unposted, dated today, and the time has arrived. Never stale (pre-today) rows.
  data.list.filter(isLive_).filter(function (r) { return r.when >= start && r.when <= now; }).forEach(function (row) {
    const caption = row.hashtags ? row.caption + '\n\n' + row.hashtags : row.caption;
    const res = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + secret },
      payload: JSON.stringify({ imageUrl: site + '/promos/' + row.img, caption: caption }),
      muteHttpExceptions: true,
    });
    if (res.getResponseCode() === 200) {
      data.sh.getRange(row.rowNum, data.c.posted + 1).setValue(new Date());
    } else {
      Logger.log('Publish failed for ' + row.img + ': ' + res.getContentText());
    }
  });

  scheduleNext();
}

/** Installable onEdit: any change re-arms the schedule. */
function onEditInstallable(e) {
  scheduleNext();
}

/** Run once to authorize, wire the edit trigger, and arm the first post. */
function setup() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'onEditInstallable') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('onEditInstallable')
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onEdit()
    .create();
  scheduleNext();
}
