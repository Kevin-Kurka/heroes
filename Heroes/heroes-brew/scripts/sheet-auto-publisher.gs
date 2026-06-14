/**
 * American Heroes & Brew — content engine v2 (Google Apps Script, bound to the
 * "Event Posters & Posts" Google Sheet).
 *
 * What it does, all driven by the Sheet (no polling):
 *   • Reads EVERY monthly tab ("June 2026", "July 2026", …) — month-at-a-glance planning.
 *   • Routes each approved, due row to Instagram by Channel/Media:
 *       Feed image, Story image, or Story video → POST /api/promos/publish-instagram.
 *   • On any edit, re-arms a single time trigger at the next due post.
 *   • Stamps "Posted (IG)" after a successful publish (idempotency; no double-posts).
 *   • Weekly: emails Jenee a digest of the coming week's pending posts to approve.
 *   • Optional: seeds a daily "special" Story video from the weekday rotation so the
 *     Story is never empty (enable only after the special videos are deployed).
 *
 * ── ONE-TIME SETUP ────────────────────────────────────────────────────────────────
 *   1. Sheet → Extensions → Apps Script. Paste this file (replace existing code).
 *   2. Project Settings (gear) → Time zone → "America/Los_Angeles".
 *   3. Project Settings → Script Properties → add:
 *        PUBLISH_URL    https://americanheroesandbrew.com/api/promos/publish-instagram
 *        PROMOS_SECRET  <the PROMOS_SECRET value>
 *        SITE           https://americanheroesandbrew.com
 *        DIGEST_TO      <jenee's email>            (weekly approval digest recipient)
 *        DIGEST_DOW     Monday                     (optional; default Monday)
 *   4. (Optional, once) Run `setupMonthlyTabs` to create the current + next month tabs
 *      with the v2 column headers.
 *   5. Run `setup` once and approve the permissions prompt (Sheet edits, mail, fetch,
 *      triggers). After that it is fully automatic.
 *   6. After the special videos are deployed, run `enableSpecials` to turn on the
 *      daily Story-special rotation (off by default so it never posts a missing video).
 */

const PUBLISH_FN = 'publishDue';
const DIGEST_FN = 'weeklyDigest';
const SPECIAL_FN = 'seedTodaySpecial';
const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_TAB_RE = /^[A-Z][a-z]+ \d{4}$/; // "June 2026"

// v2 column headers, in order, used by setupMonthlyTabs().
const HEADERS = [
  'Type', 'Channel', 'Media', 'Image File', 'Video File', 'Post', 'Headline',
  'Caption / CTA', 'Hashtags', 'Post Date & Time (PT)', 'Marquee', 'Approval',
  'Approval Notes', 'Posted (IG)',
];

// Daily special rotation (mirrors src/lib/menu.ts specials). Videos live at
// SITE/promos-video/special-<weekday>.mp4 (rendered by scripts/specials-video).
const SPECIALS = {
  Mon: { name: 'Mahalo Monday', cap: 'Mahalo Monday — Kalua Pork Sliders $4 ea + select cans $3. 🌺' },
  Tue: { name: 'Taco Tuesday', cap: 'Taco Tuesday — Tacos $4 ea + $2 off tequila. 🌮' },
  Wed: { name: 'Wings & Wells Wednesday', cap: 'Wings & Wells Wednesday — Wings $6 off + wells $6. 🔥' },
  Thu: { name: 'Burgers & Beer Thursday', cap: 'Burgers & Beer Thursday — Burgers $5 off + select drafts $5. 🍔' },
  Fri: { name: 'Friday Funday', cap: 'Friday Funday 1–4pm — Drinks & appetizers $2 off. 🍻' },
  Sat: { name: 'Game Day at Heroes', cap: 'Game day at Heroes — every screen, every game. Friar Franks $6 on Padres days. ⚾' },
  Sun: { name: 'Game Day at Heroes', cap: 'Sunday at Heroes — catch every game on the big screens. 🏈' },
};
const HASHTAGS = '#AmericanHeroesAndBrew #CarlsbadEats #CarlsbadVillage #SportsBar #NorthCountySD';

function props_() { return PropertiesService.getScriptProperties(); }
function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }

/** All monthly tabs ("MMMM YYYY"); falls back to the first sheet if none match. */
function monthSheets_() {
  const all = ss_().getSheets();
  const months = all.filter(function (s) { return MONTH_TAB_RE.test(s.getName()); });
  return months.length ? months : [all[0]];
}

/** Map header names → 0-based column indexes for one sheet's header row. */
function cols_(header) {
  const norm = header.map(function (h) { return String(h).trim().toLowerCase(); });
  function find(pred) { return norm.findIndex(pred); }
  return {
    type: find(function (h) { return h === 'type'; }),
    channel: find(function (h) { return h === 'channel'; }),
    media: find(function (h) { return h === 'media'; }),
    img: find(function (h) { return h === 'image file'; }),
    vid: find(function (h) { return h === 'video file'; }),
    cap: find(function (h) { return h.indexOf('caption') === 0; }),
    tags: find(function (h) { return h === 'hashtags'; }),
    date: find(function (h) { return h.indexOf('post date') === 0; }),
    marquee: find(function (h) { return h === 'marquee'; }),
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

/** Read rows across ALL month tabs as objects, each carrying its sheet + 1-based row. */
function rows_() {
  const list = [];
  monthSheets_().forEach(function (sh) {
    const values = sh.getDataRange().getValues();
    if (values.length < 2) return;
    const c = cols_(values[0]);
    if (c.img < 0 && c.vid < 0) return; // not a content tab
    for (let i = 1; i < values.length; i++) {
      const r = values[i];
      const get = function (idx) { return idx >= 0 ? String(r[idx] || '').trim() : ''; };
      const img = get(c.img);
      const vid = get(c.vid);
      if (!img && !vid) continue;
      const channel = /story/i.test(get(c.channel)) ? 'Story' : 'Feed';
      const mediaRaw = get(c.media).toLowerCase();
      const media = (mediaRaw === 'video' || (!mediaRaw && vid)) ? 'video' : 'image';
      list.push({
        sh: sh, c: c, rowNum: i + 1,
        type: get(c.type), channel: channel, media: media,
        img: img, vid: vid,
        caption: get(c.cap), hashtags: get(c.tags),
        approval: get(c.appr), posted: get(c.posted),
        when: parseWhen_(get(c.date)),
      });
    }
  });
  return list;
}

/** Approved, not yet posted to IG, and has a parseable date. */
function isLive_(row) {
  return /^approve/i.test(row.approval) && row.posted === '' && !!row.when;
}

/** Midnight today in the script's (PT) timezone. */
function startOfTodayPT_() {
  const tz = Session.getScriptTimeZone();
  const d = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd').split('-');
  return new Date(Number(d[0]), Number(d[1]) - 1, Number(d[2]), 0, 0, 0);
}

function clearTriggers_(fn) {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === fn) ScriptApp.deleteTrigger(t);
  });
}

/** Build the publish payload for a row (feed image, story image, or story video). */
function payloadFor_(row, site) {
  const caption = row.hashtags ? row.caption + '\n\n' + row.hashtags : row.caption;
  const p = { caption: caption, mediaType: row.channel === 'Story' ? 'story' : 'feed' };
  if (row.media === 'video' && row.vid) {
    p.videoUrl = site + '/promos-video/' + row.vid;
    if (row.img) p.imageUrl = site + '/promos/' + row.img; // optional cover
  } else {
    p.imageUrl = site + '/promos/' + row.img;
  }
  return p;
}

/**
 * Arm a single one-off trigger at the earliest TODAY-or-future approved/unposted post
 * across all month tabs. Stale (pre-today) rows are ignored.
 */
function scheduleNext() {
  clearTriggers_(PUBLISH_FN);
  const start = startOfTodayPT_();
  const list = rows_()
    .filter(isLive_)
    .filter(function (r) { return r.when >= start; })
    .sort(function (a, b) { return a.when - b.when; });
  if (!list.length) return;
  let at = list[0].when;
  const soon = new Date(Date.now() + 60 * 1000);
  if (at < soon) at = soon; // time already passed today → fire ~1 minute out
  ScriptApp.newTrigger(PUBLISH_FN).timeBased().at(at).create();
}

/** Publish everything now due across all tabs, stamp Posted (IG), then arm the next. */
function publishDue() {
  const p = props_();
  const url = p.getProperty('PUBLISH_URL');
  const secret = p.getProperty('PROMOS_SECRET');
  const site = p.getProperty('SITE') || 'https://americanheroesandbrew.com';
  const now = new Date();
  const start = startOfTodayPT_();

  rows_()
    .filter(isLive_)
    .filter(function (r) { return r.when >= start && r.when <= now; })
    .forEach(function (row) {
      const res = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        headers: { Authorization: 'Bearer ' + secret },
        payload: JSON.stringify(payloadFor_(row, site)),
        muteHttpExceptions: true,
      });
      if (res.getResponseCode() === 200) {
        row.sh.getRange(row.rowNum, row.c.posted + 1).setValue(new Date());
      } else {
        Logger.log('Publish failed [' + row.sh.getName() + ' r' + row.rowNum + ']: ' + res.getContentText());
      }
    });

  scheduleNext();
}

/** Installable onEdit: any change re-arms the schedule. */
function onEditInstallable(e) {
  scheduleNext();
}

/**
 * In-Google daily backstop (separate handler so scheduleNext()'s cleanup of
 * publishDue triggers never deletes it). Catches any of today's due rows the
 * one-off trigger missed — replaces the retired Vercel publish-due CSV cron,
 * which could only ever see a single tab.
 */
function dailyCatchup() {
  publishDue();
}

// ── Weekly approval digest ──────────────────────────────────────────────────────────
/** Email Jenee the coming week's rows that still need approval. */
function weeklyDigest() {
  const to = props_().getProperty('DIGEST_TO');
  if (!to) { Logger.log('weeklyDigest: DIGEST_TO not set'); return; }
  const start = startOfTodayPT_();
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  const pending = rows_()
    .filter(function (r) { return r.when && r.when >= start && r.when <= end; })
    .filter(function (r) { return !/^approve/i.test(r.approval) && r.posted === ''; })
    .sort(function (a, b) { return a.when - b.when; });

  const tz = Session.getScriptTimeZone();
  const fmt = function (d) { return Utilities.formatDate(d, tz, 'EEE MMM d, h:mm a'); };
  const link = ss_().getUrl();
  let body = 'Heroes & Brew — posts scheduled for the next 7 days that still need your approval:\n\n';
  if (!pending.length) {
    body += 'Nothing pending — everything for the coming week is already approved or posted. 🎉\n';
  } else {
    pending.forEach(function (r) {
      body += '• ' + fmt(r.when) + '  [' + (r.type || r.channel) + ' / ' + r.channel + ']  '
        + (r.img || r.vid) + '\n    ' + (r.caption || '').slice(0, 120) + '\n';
    });
  }
  body += '\nApprove by setting Approval = "Approve" in the sheet:\n' + link + '\n';
  MailApp.sendEmail({ to: to, subject: 'Heroes weekly post approvals (' + pending.length + ' pending)', body: body });
}

// ── Daily special Story rotation ────────────────────────────────────────────────────
/** Current month tab (create via setupMonthlyTabs if missing). */
function currentMonthSheet_() {
  const tz = Session.getScriptTimeZone();
  const now = new Date();
  const name = MONTH_NAMES[Number(Utilities.formatDate(now, tz, 'M')) - 1] + ' ' + Utilities.formatDate(now, tz, 'yyyy');
  return ss_().getSheetByName(name) || monthSheets_()[0];
}

/**
 * Ensure today's special Story-video row exists (approved) in the current month tab,
 * so publishDue posts it. Idempotent: skips if a Special row already exists for today.
 * Only enabled via enableSpecials() (videos must be deployed first).
 */
function seedTodaySpecial() {
  const tz = Session.getScriptTimeZone();
  const dow = Utilities.formatDate(new Date(), tz, 'EEE'); // Mon, Tue, …
  const sp = SPECIALS[dow];
  if (!sp) return;
  const sh = currentMonthSheet_();
  const values = sh.getDataRange().getValues();
  const c = cols_(values[0]);
  const todayKey = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');

  // Skip if a Special row already exists for today.
  for (let i = 1; i < values.length; i++) {
    const r = values[i];
    const t = c.type >= 0 ? String(r[c.type]).trim().toLowerCase() : '';
    const w = parseWhen_(c.date >= 0 ? r[c.date] : '');
    if (t === 'special' && w && Utilities.formatDate(w, tz, 'yyyy-MM-dd') === todayKey) return;
  }

  const when = Utilities.formatDate(new Date(), tz, 'EEE MMM d, yyyy') + ' — 4:00 PM';
  const file = 'special-' + dow.toLowerCase() + '.mp4';
  const rowArr = HEADERS.map(function (h) {
    switch (h) {
      case 'Type': return 'Special';
      case 'Channel': return 'Story';
      case 'Media': return 'video';
      case 'Video File': return file;
      case 'Post': return sp.name;
      case 'Headline': return sp.name;
      case 'Caption / CTA': return sp.cap + '\n\n' + HASHTAGS;
      case 'Post Date & Time (PT)': return when;
      case 'Approval': return 'Approve'; // specials are pre-approved (rotation)
      default: return '';
    }
  });
  sh.appendRow(rowArr);
  scheduleNext();
}

// ── Setup helpers ───────────────────────────────────────────────────────────────────
/** Create current + next month tabs with v2 headers (if they don't exist). */
function setupMonthlyTabs() {
  const tz = Session.getScriptTimeZone();
  const now = new Date();
  for (let k = 0; k < 2; k++) {
    const d = new Date(now.getFullYear(), now.getMonth() + k, 1);
    const name = MONTH_NAMES[d.getMonth()] + ' ' + d.getFullYear();
    let sh = ss_().getSheetByName(name);
    if (!sh) sh = ss_().insertSheet(name);
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEADERS);
      sh.setFrozenRows(1);
    }
  }
}

/** Run once to authorize, wire edit + weekly-digest triggers, and arm the first post. */
function setup() {
  clearTriggers_('onEditInstallable');
  clearTriggers_(DIGEST_FN);
  clearTriggers_('dailyCatchup');
  ScriptApp.newTrigger('onEditInstallable').forSpreadsheet(ss_()).onEdit().create();
  const dow = (props_().getProperty('DIGEST_DOW') || 'Monday').toUpperCase();
  const day = ScriptApp.WeekDay[dow.charAt(0) + dow.slice(1).toLowerCase()] || ScriptApp.WeekDay.MONDAY;
  ScriptApp.newTrigger(DIGEST_FN).timeBased().onWeekDay(day).atHour(9).create();
  ScriptApp.newTrigger('dailyCatchup').timeBased().everyDays(1).atHour(23).create(); // 11 PM PT backstop
  scheduleNext();
}

/** Turn on the daily special-Story rotation (run AFTER the special videos are deployed). */
function enableSpecials() {
  clearTriggers_(SPECIAL_FN);
  ScriptApp.newTrigger(SPECIAL_FN).timeBased().everyDays(1).atHour(8).create();
  seedTodaySpecial();
}

/** Turn the daily special rotation back off. */
function disableSpecials() {
  clearTriggers_(SPECIAL_FN);
}
