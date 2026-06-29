// American Heroes & Brew — content engine v4 (bound to the "Event Posters & Posts" sheet).
// ONE tab per month is the single source of truth. Every post — Feed posters, Story videos,
// daily specials, multi-channel ("Feed, Story") drops — lives as a dated row in that month's
// tab. The script reads every monthly tab and publishes approved, due rows to Instagram
// (Feed and/or Story, image or video), stamps Posted, emails Jenee a weekly approval digest,
// auto-seeds each recurring daily special as both an IG Story (video) row and a Google weekly
// Event row, and exposes a small web app so a Claude Code routine can "Polish" (AI-revise)
// rows that Jenee flags.
// See heroes-brew/docs/CONTENT-STRATEGY.md.
//
// There is NO separate "Story" tab — the old always-on rotation was folded into the monthly
// tabs (v4). Multiple posts per day are just multiple rows with the same Post Date.
//
// Columns per month tab (matched by header name — order doesn't matter):
//   Post Date | Post Time | Channel | Media | Headline | Caption | Story Caption | Tags | Approval | Posted | Notes
//   - Channel:  "Feed", "Story", and/or "Google" — any combo (e.g. "Feed, Story, Google")
//               posts to each. Google = a Google Business Profile post (best-effort: a Google
//               failure never blocks the IG/Story Posted stamp; needs Script Prop GOOGLE_PUBLISH_URL
//               + the GOOGLE_BUSINESS_* env on the publish app, else it's skipped). GBP posts are
//               image-or-text only, so video rows post text-only to Google.
//   - Media:    <name>.jpg/.png -> /promos/ ;  <name>.mp4 -> /promos-video/  (or a full URL)
//   - Caption:  the FEED/post caption (Headline + Caption + Tags are concatenated). What shows
//               on the IG grid post + the Facebook cross-post.
//   - Story Caption: the casual "what's on your mind" line used when this row posts to the Story.
//               Optional — if blank, the Story falls back to the post Caption. So a "Feed, Story"
//               row sends the post Caption to the feed and the Story Caption to the story.
//               (Note: IG Stories don't visibly render a caption; this is stored/sent for FB +
//               record-keeping.) Leave Headline blank for casual daily specials.
//   - Approval: "Approve" publishes; "Polish" sends the row to the AI routine using Notes.
//
// SETUP: paste into the sheet's Apps Script; Time zone = America/Los_Angeles; Script
// Properties PUBLISH_URL, PROMOS_SECRET, SITE, DIGEST_TO, DIGEST_DOW, POLISH_SECRET; run
// setupMonthlyTabs, then setup, then enableSpecials, then backfillSpecials (one-time, fills
// the current + next month with the recurring daily specials). To enable Polish, also
// Deploy > New deployment > Web app (execute as me, access: anyone with the link) and give
// the routine that /exec URL.

var PUBLISH_FN = 'publishDue';
var DIGEST_FN = 'weeklyDigest';
var SPECIAL_FN = 'seedTodaySpecial';
var MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
var MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var MONTH_TAB_RE = /^[A-Z][a-z]+ \d{4}$/;
var VIDEO_RE = /\.(mp4|mov|m4v)$/i;

var HEADERS = ['Post Date', 'Post Time', 'Channel', 'Media', 'Headline', 'Caption', 'Story Caption', 'Tags', 'Approval', 'Posted', 'Notes', 'Event Start', 'Event End'];

// Recurring daily specials (Mon–Fri). Each posts to the IG Story (scratch-off/slot video)
// with its casual "what's on your mind" caption, AND to Google as a recurring weekly Event
// (a branded /api/og/special poster + an Event time window). `key` selects the video pool;
// `deal`/`day`/`hours` drive the Google poster + caption; `startH`/`endH` are the PT Event
// window (24h). The Google Event re-seeds every week, so it's recurring in effect.
var SPECIALS = {
  Mon: { key: 'mahalo',  name: 'Mahalo Monday',           day: 'Monday',    time: '11:00 AM', deal: '$4 Kalua Pork Sliders', hours: '10a–10p', startH: 10, endH: 22, cap: 'Sliders on my mind 🤙 Mahalo Monday at Heroes.' },
  Tue: { key: 'taco',    name: 'Taco Tuesday',            day: 'Tuesday',   time: '11:00 AM', deal: '$4 Tacos + Tequila',     hours: '10a–10p', startH: 10, endH: 22, cap: 'I want some tacos! 🌮 Taco Tuesday at Heroes.' },
  Wed: { key: 'wings',   name: 'Wings & Wells Wednesday', day: 'Wednesday', time: '11:00 AM', deal: '$6 Off Wings',          hours: '10a–10p', startH: 10, endH: 22, cap: "Wing it — it's Humpday 🍗 Wings & Wells Wednesday at Heroes." },
  Thu: { key: 'burgers', name: 'Burgers & Beer Thursday', day: 'Thursday',  time: '11:00 AM', deal: '$5 Off Burgers',        hours: '10a–10p', startH: 10, endH: 22, cap: "Burger o'clock 🍔🍺 Burgers & Beer Thursday at Heroes." },
  Fri: { key: 'funday',  name: 'Friday Funday',           day: 'Friday',    time: '11:30 AM', deal: 'Happy Hour 1–4p · $2 Off', hours: '1–4p', startH: 13, endH: 16, cap: 'Cheers to Friday! 🍻 Friday Funday at Heroes.' }
};
var SPECIAL_DOWS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
var SPECIAL_TAGS = '#AmericanHeroesAndBrew #CarlsbadVillage #SportsBar';

// Week-of-year number (used to rotate the daily-special video variant weekly).
function weekNum_(d) {
  var jan1 = new Date(d.getFullYear(), 0, 1);
  return Math.floor((((d - jan1) / 86400000) + jan1.getDay() + 1) / 7);
}

// The themed video for a given special on a given date: <key>-scratcher.mp4 (lotto scratch-off)
// on even weeks, <key>-slot.mp4 (Heroes Jackpot slot machine) on odd weeks — so the theme
// rotates weekly and the filename says both the special and its theme.
function specialMedia_(key, date) {
  return key + '-' + ((weekNum_(date) % 2) ? 'slot' : 'scratcher') + '.mp4';
}

function props_() { return PropertiesService.getScriptProperties(); }
function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }

function monthSheets_() {
  var all = ss_().getSheets();
  var months = all.filter(function (s) { return MONTH_TAB_RE.test(s.getName()); });
  return months.length ? months : [all[0]];
}

function cols_(header) {
  var norm = header.map(function (h) { return String(h).trim().toLowerCase(); });
  function find(pred) { return norm.findIndex(pred); }
  return {
    date: find(function (h) { return h.indexOf('post date') === 0; }),
    time: find(function (h) { return h.indexOf('post time') === 0; }),
    channel: find(function (h) { return h === 'channel'; }),
    media: find(function (h) { return h === 'media'; }),
    headline: find(function (h) { return h === 'headline'; }),
    cap: find(function (h) { return h.indexOf('caption') === 0; }),
    storyCap: find(function (h) { return h.indexOf('story caption') === 0; }),
    tags: find(function (h) { return h.indexOf('tag') === 0; }),
    appr: find(function (h) { return h.indexOf('approval') === 0; }),
    posted: find(function (h) { return h.indexOf('posted') === 0; }),
    notes: find(function (h) { return h.indexOf('note') === 0; }),
    eventStart: find(function (h) { return h.indexOf('event start') === 0; }),
    eventEnd: find(function (h) { return h.indexOf('event end') === 0; })
  };
}

// Parse a displayed date ("Jun 14, 2026" or "6/14/2026") + time ("1:00 PM" or "13:00").
function parseWhen_(dateStr, timeStr) {
  var ds = String(dateStr || '').trim();
  var y, mo, d;
  var m1 = ds.match(/([A-Za-z]{3,})\s+(\d{1,2}),?\s*(\d{4})/);
  var m2 = ds.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m1) { mo = MONTHS[m1[1].slice(0, 3).toLowerCase()]; d = Number(m1[2]); y = Number(m1[3]); }
  else if (m2) { mo = Number(m2[1]) - 1; d = Number(m2[2]); y = Number(m2[3]); }
  else return null;
  if (mo === undefined || mo === null || isNaN(mo)) return null;
  var hh = 9, mm = 0;
  var ts = String(timeStr || '').trim();
  // Read the time from the Post Time cell, or fall back to a time inside the date cell
  // (so a single combined "Jun 14, 2026 — 1:00 PM" still works).
  var t = ts.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm])?/) || ds.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm])?/);
  if (t) {
    hh = Number(t[1]); mm = Number(t[2]);
    if (t[3]) { var pm = /p/i.test(t[3]); hh = hh % 12; if (pm) hh += 12; }
  }
  return new Date(y, mo, d, hh, mm, 0);
}

function channelsOf_(raw) {
  var parts = String(raw || '').split(/[,/]/).map(function (s) { return s.trim(); }).filter(Boolean);
  if (!parts.length) parts = ['Feed'];
  var out = [];
  parts.forEach(function (p) {
    var ch = /google/i.test(p) ? 'Google' : (/story/i.test(p) ? 'Story' : 'Feed');
    if (out.indexOf(ch) < 0) out.push(ch);
  });
  return out;
}

function composeCaption_(headline, caption, tags) {
  var parts = [];
  if (headline) parts.push(headline);
  if (caption) parts.push(caption);
  var body = parts.join('\n\n');
  if (tags) body += (body ? '\n\n' : '') + tags;
  return body;
}

function rows_() {
  var list = [];
  monthSheets_().forEach(function (sh) {
    var values = sh.getDataRange().getDisplayValues();
    if (values.length < 2) return;
    var c = cols_(values[0]);
    if (c.media < 0) return;
    for (var i = 1; i < values.length; i++) {
      var r = values[i];
      var get = function (idx) { return idx >= 0 ? String(r[idx] || '').trim() : ''; };
      var media = get(c.media);
      if (!media) continue;
      list.push({
        sh: sh, c: c, rowNum: i + 1, tab: sh.getName(),
        channels: channelsOf_(get(c.channel)),
        media: media,
        isVideo: VIDEO_RE.test(media),
        headline: get(c.headline),
        caption: get(c.cap),
        storyCaption: get(c.storyCap),
        tags: get(c.tags),
        notes: get(c.notes),
        eventStart: c.eventStart >= 0 ? String(r[c.eventStart] || '').trim() : '',
        eventEnd: c.eventEnd >= 0 ? String(r[c.eventEnd] || '').trim() : '',
        noteKey: c.notes >= 0 ? String(r[c.notes] || '').trim() : '',
        approval: get(c.appr),
        posted: get(c.posted),
        // Feed/post caption (Headline + Caption + Tags). Story uses its own caption — see payloadFor_.
        igCaption: composeCaption_(get(c.headline), get(c.cap), get(c.tags)),
        when: parseWhen_(get(c.date), get(c.time))
      });
    }
  });
  return list;
}

function isLive_(row) {
  return /^approve/i.test(row.approval) && row.posted === '' && !!row.when;
}

function startOfTodayPT_() {
  var tz = Session.getScriptTimeZone();
  var d = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd').split('-');
  return new Date(Number(d[0]), Number(d[1]) - 1, Number(d[2]), 0, 0, 0);
}

function clearTriggers_(fn) {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === fn) ScriptApp.deleteTrigger(t);
  });
}

function mediaUrl_(row, site) {
  if (/^https?:\/\//i.test(row.media)) return row.media;
  // Site-relative path (e.g. the dynamic /api/og/... matchup + schedule posters used by
  // auto-curated rows) — serve straight off the origin, no /promos/ prefix.
  if (row.media.charAt(0) === '/') return site + row.media;
  return site + (row.isVideo ? '/promos-video/' : '/promos/') + row.media;
}

function payloadFor_(row, channel, site) {
  var isStory = channel === 'Story';
  // Feed/Reel posts use the post caption (Headline + Caption + Tags). The Story uses its own
  // `Story Caption` (the casual "what's on your mind" line) + Tags when one is set, else it
  // falls back to the post caption — so a "Feed, Story" row can carry a different line per channel.
  var caption = (isStory && row.storyCaption)
    ? composeCaption_('', row.storyCaption, row.tags)
    : row.igCaption;
  var p = { caption: caption, mediaType: isStory ? 'story' : 'feed' };
  var url = mediaUrl_(row, site);
  if (row.isVideo) p.videoUrl = url; else p.imageUrl = url;
  return p;
}

// Google Business Profile post payload (for the /api/promos/publish-google route). GBP local
// posts are IMAGE or TEXT only — there is no video post — so a video row posts text-only.
// A "Learn more" button links to the site.
function googlePayloadFor_(row, site) {
  var p = { caption: row.igCaption, ctaType: 'LEARN_MORE', ctaUrl: site };
  if (!row.isVideo) p.imageUrl = mediaUrl_(row, site);
  if (row.eventStart && row.eventEnd) {
    p.eventTitle = row.headline || 'Game Day at American Heroes & Brew';
    p.eventStart = row.eventStart;
    p.eventEnd = row.eventEnd;
  }
  return p;
}

// One-time: add a `Story Caption` column (right after `Caption`) to every month tab that
// doesn't already have one. Idempotent. Kept first so the Apps Script editor's Run button
// (which defaults to the first function) runs it directly.
function addStoryCaptionColumn() {
  monthSheets_().forEach(function (sh) {
    var header = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0]
      .map(function (h) { return String(h).trim().toLowerCase(); });
    if (header.indexOf('story caption') >= 0) return; // already present
    var capIdx = header.indexOf('caption');           // 0-based; insert right after Caption
    var after = capIdx >= 0 ? capIdx + 1 : header.length; // 1-based column to insert after
    sh.insertColumnAfter(after);
    sh.getRange(1, after + 1).setValue('Story Caption');
  });
}

// Ensure a single sheet has the `Event Start`/`Event End` columns Google EVENT posts need
// (idempotent — appended after the last column if missing).
function ensureEventColumns_(sh) {
  var header = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0]
    .map(function (h) { return String(h).trim().toLowerCase(); });
  ['Event Start', 'Event End'].forEach(function (name) {
    if (header.indexOf(name.toLowerCase()) >= 0) return;
    var after = sh.getLastColumn();
    sh.insertColumnAfter(after);
    sh.getRange(1, after + 1).setValue(name);
    header.push(name.toLowerCase());
  });
}

// One-time/idempotent: add `Event Start` and `Event End` columns to every month tab that
// lacks them. Used by Google EVENT posts.
function addEventColumns() {
  monthSheets_().forEach(ensureEventColumns_);
}

// Make every Media cell across all month tabs a clickable link to its hosted file, so you
// can click a filename in the sheet and confirm the asset actually loads. The cell's text
// stays the bare filename (what the publisher reads); only a link is layered on top.
// Kept first so the Apps Script editor's Run button (which defaults to the first function)
// runs it directly. Re-runnable any time after adding/renaming media.
// Turn a single Media cell's filename(s) into clickable link(s) to the hosted file. The cell
// text stays the bare filename (what the publisher reads); only a link is layered on top.
function linkifyMediaCell_(cell, site) {
  var text = String(cell.getDisplayValue() || '').trim();
  if (!text) return;
  var b = SpreadsheetApp.newRichTextValue().setText(text);
  // A whole-cell absolute URL or site-relative path (e.g. the dynamic /api/og/... matchup,
  // schedule, and special posters used by curated/Google-event rows) has no /promos filename
  // to match below — link the entire cell straight to its resolved URL, matching mediaUrl_.
  if (/^https?:\/\//i.test(text) || text.charAt(0) === '/') {
    b.setLinkUrl(0, text.length, /^https?:\/\//i.test(text) ? text : site + text);
    cell.setRichTextValue(b.build());
    return;
  }
  var re = /[^,\s]+\.(mp4|mov|m4v|jpg|jpeg|png)/gi, m;
  while ((m = re.exec(text)) !== null) {
    var name = m[0], start = m.index, end = start + name.length;
    var url = site + (/\.(mp4|mov|m4v)$/i.test(name) ? '/promos-video/' : '/promos/') + name;
    b.setLinkUrl(start, end, url);
  }
  cell.setRichTextValue(b.build());
}

function linkifyMedia() {
  var site = props_().getProperty('SITE') || 'https://americanheroesandbrew.com';
  monthSheets_().forEach(function (sh) {
    var values = sh.getDataRange().getDisplayValues();
    if (values.length < 2) return;
    var c = cols_(values[0]);
    if (c.media < 0) return;
    for (var i = 1; i < values.length; i++) {
      if (String(values[i][c.media] || '').trim()) linkifyMediaCell_(sh.getRange(i + 1, c.media + 1), site);
    }
  });
}

// Fired from onEditInstallable: when an edit touches the Media column of a month tab, make the
// edited cell(s) clickable automatically — so any row you add or paste self-links, no manual step.
function linkifyEditedMedia_(e) {
  if (!e || !e.range) return;
  var sh = e.range.getSheet();
  if (!MONTH_TAB_RE.test(sh.getName())) return;
  var header = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0]
    .map(function (h) { return String(h).trim().toLowerCase(); });
  var mediaCol = header.indexOf('media') + 1; // 1-based; 0 if not found
  if (mediaCol < 1) return;
  if (mediaCol < e.range.getColumn() || mediaCol > e.range.getLastColumn()) return; // Media not edited
  var site = props_().getProperty('SITE') || 'https://americanheroesandbrew.com';
  for (var row = Math.max(2, e.range.getRow()); row <= e.range.getLastRow(); row++) {
    linkifyMediaCell_(sh.getRange(row, mediaCol), site);
  }
}

// Create the daily 8 AM auto-seed trigger WITHOUT seeding today (use this instead of
// enableSpecials when today's special has already posted, so you don't double-post a
// past-time row that publishDue would immediately pick up).
function addDailySpecialTrigger() {
  clearTriggers_(SPECIAL_FN);
  ScriptApp.newTrigger(SPECIAL_FN).timeBased().everyDays(1).atHour(8).create();
}

function scheduleNext() {
  clearTriggers_(PUBLISH_FN);
  var start = startOfTodayPT_();
  var list = rows_()
    .filter(isLive_)
    .filter(function (r) { return r.when >= start; })
    .sort(function (a, b) { return a.when - b.when; });
  if (!list.length) return;
  var at = list[0].when;
  var soon = new Date(Date.now() + 60 * 1000);
  if (at < soon) at = soon;
  ScriptApp.newTrigger(PUBLISH_FN).timeBased().at(at).create();
}

function publishDue() {
  // Concurrency guard: multiple triggers can call publishDue (onEdit-scheduled
  // at() trigger, dailyCatchup, occasional double-fires). Without a lock two runs
  // can both see Posted='' and publish the SAME row twice (the 2026-06-24 Mexico
  // vs Czechia duplicate). tryLock(0) → if another run holds it, skip; the holder
  // will post the row. Combined with flush() after stamping, a serialized second
  // run re-reads rows_() and sees Posted set, so it skips the row.
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(0)) { Logger.log('publishDue: another run holds the lock — skipping'); return; }
  try {
  var p = props_();
  var url = p.getProperty('PUBLISH_URL');
  var googleUrl = p.getProperty('GOOGLE_PUBLISH_URL'); // optional — Google channel is off until set
  var secret = p.getProperty('PROMOS_SECRET');
  var site = p.getProperty('SITE') || 'https://americanheroesandbrew.com';
  var now = new Date();
  var start = startOfTodayPT_();
  rows_()
    .filter(isLive_)
    .filter(function (r) { return r.when >= start && r.when <= now; })
    .forEach(function (row) {
      var allOk = true;
      row.channels.forEach(function (ch) {
        // Google Business Profile is a BEST-EFFORT channel: route it to its own endpoint and
        // never let its outcome block the Posted stamp (a Google failure must not cause the
        // IG/Story channels to re-post on the next retry). Skipped entirely until configured.
        if (ch === 'Google') {
          if (!googleUrl) { Logger.log('Google channel skipped (GOOGLE_PUBLISH_URL not set) [' + row.tab + ' r' + row.rowNum + ']'); return; }
          var gres = UrlFetchApp.fetch(googleUrl, {
            method: 'post', contentType: 'application/json',
            headers: { Authorization: 'Bearer ' + secret },
            payload: JSON.stringify(googlePayloadFor_(row, site)), muteHttpExceptions: true
          });
          if (gres.getResponseCode() !== 200) {
            Logger.log('Google post failed (non-blocking) [' + row.tab + ' r' + row.rowNum + ']: ' + gres.getContentText());
          }
          return;
        }
        var res = UrlFetchApp.fetch(url, {
          method: 'post',
          contentType: 'application/json',
          headers: { Authorization: 'Bearer ' + secret },
          payload: JSON.stringify(payloadFor_(row, ch, site)),
          muteHttpExceptions: true
        });
        if (res.getResponseCode() !== 200) {
          allOk = false;
          Logger.log('Publish failed [' + row.tab + ' r' + row.rowNum + ' ' + ch + ']: ' + res.getContentText());
        }
      });
      // Stamp Posted and FLUSH immediately so any serialized follow-up run sees it
      // and won't re-post this row.
      if (allOk) { row.sh.getRange(row.rowNum, row.c.posted + 1).setValue(new Date()); SpreadsheetApp.flush(); }
    });
  scheduleNext();
  } finally {
    lock.releaseLock();
  }
}

function onEditInstallable(e) {
  try { linkifyEditedMedia_(e); } catch (err) { Logger.log('linkifyEditedMedia_: ' + err); }
  scheduleNext();
}

function dailyCatchup() {
  publishDue();
}

function weeklyDigest() {
  var to = props_().getProperty('DIGEST_TO');
  if (!to) { Logger.log('weeklyDigest: DIGEST_TO not set'); return; }
  var start = startOfTodayPT_();
  var end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  var pending = rows_()
    .filter(function (r) { return r.when && r.when >= start && r.when <= end; })
    .filter(function (r) { return !/^approve/i.test(r.approval) && r.posted === ''; })
    .sort(function (a, b) { return a.when - b.when; });
  var tz = Session.getScriptTimeZone();
  var fmt = function (d) { return Utilities.formatDate(d, tz, 'EEE MMM d, h:mm a'); };
  var link = ss_().getUrl();
  var body = 'Heroes & Brew — posts scheduled for the next 7 days that still need your approval:\n\n';
  if (!pending.length) {
    body += 'Nothing pending — everything for the coming week is already approved or posted.\n';
  } else {
    pending.forEach(function (r) {
      body += '- ' + fmt(r.when) + '  [' + r.channels.join('+') + ']  ' + (r.headline || r.media) + '\n    '
        + (r.caption || '').slice(0, 120) + '\n';
    });
  }
  body += '\nApprove (or set "Polish" + a Notes comment to have AI revise) in the sheet:\n' + link + '\n';
  MailApp.sendEmail({ to: to, subject: 'Heroes weekly post approvals (' + pending.length + ' pending)', body: body });
}

function currentMonthSheet_() {
  var tz = Session.getScriptTimeZone();
  var now = new Date();
  var name = MONTH_NAMES[Number(Utilities.formatDate(now, tz, 'M')) - 1] + ' ' + Utilities.formatDate(now, tz, 'yyyy');
  return ss_().getSheetByName(name) || monthSheets_()[0];
}

// Branded /api/og/special poster URL for a special's Google Event (query-driven so the
// copy lives only here). Site-relative — mediaUrl_/linkifyMediaCell_ resolve it.
function specialPoster_(sp) {
  return '/api/og/special?title=' + encodeURIComponent(sp.name)
    + '&deal=' + encodeURIComponent(sp.deal)
    + '&day=' + encodeURIComponent(sp.day)
    + '&hours=' + encodeURIComponent(sp.hours);
}

// ISO timestamp (PT offset) for a special's Event window edge — e.g. "2026-06-29T10:00:00-0700".
// The script TZ is America/Los_Angeles, so the wall-clock hour is already PT.
function specialEventIso_(date, hour) {
  var d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, 0, 0);
  return Utilities.formatDate(d, 'America/Los_Angeles', "yyyy-MM-dd'T'HH:mm:ssZ");
}

// Seed a day's recurring special: an IG Story (scratch-off/slot video) AND a Google weekly
// Event (branded poster + Event window). Idempotent and independent per channel — the Story
// is matched by media-key + date, the Google Event by its Notes key — so a re-run, or a day
// that only has one of the two, fills in just what's missing. Returns true if it added a row.
function seedSpecialOn_(sh, date) {
  var tz = Session.getScriptTimeZone();
  var dow = Utilities.formatDate(date, tz, 'EEE');
  var sp = SPECIALS[dow];
  if (!sp) return false; // only Mon–Fri have a recurring special
  ensureEventColumns_(sh); // Google Event rows need Event Start/End
  var site = props_().getProperty('SITE') || 'https://americanheroesandbrew.com';
  var values = sh.getDataRange().getDisplayValues();
  var header = values[0];
  var c = cols_(header);
  if (c.media < 0 || c.date < 0) return false;
  var dayKey = Utilities.formatDate(date, tz, 'yyyy-MM-dd');
  var dateLabel = Utilities.formatDate(date, tz, 'MMM d, yyyy');
  var googleKey = 'gspecial-' + sp.key + '-' + dayKey;

  var hasStory = false, hasGoogle = false;
  for (var i = 1; i < values.length; i++) {
    var r = values[i];
    var f = String(r[c.media] || '').trim().toLowerCase();
    var w = parseWhen_(c.date >= 0 ? r[c.date] : '', c.time >= 0 ? r[c.time] : '');
    var sameDay = w && Utilities.formatDate(w, tz, 'yyyy-MM-dd') === dayKey;
    if (f.indexOf(sp.key) === 0 && sameDay) hasStory = true;
    if (c.notes >= 0 && String(r[c.notes] || '').trim() === googleKey) hasGoogle = true;
  }

  var added = false;
  function appendSpecialRow_(fill) {
    var rowArr = [];
    for (var j = 0; j < header.length; j++) rowArr.push('');
    fill(rowArr);
    sh.appendRow(rowArr);
    // Auto-seeded rows are programmatic (onEdit doesn't fire), so link the Media cell directly.
    if (c.media >= 0) linkifyMediaCell_(sh.getRange(sh.getLastRow(), c.media + 1), site);
    added = true;
  }

  if (!hasStory) appendSpecialRow_(function (a) {
    if (c.date >= 0) a[c.date] = dateLabel;
    if (c.time >= 0) a[c.time] = sp.time;
    if (c.channel >= 0) a[c.channel] = 'Story';
    if (c.media >= 0) a[c.media] = specialMedia_(sp.key, date);
    if (c.headline >= 0) a[c.headline] = ''; // casual special: caption-only, no headline
    if (c.cap >= 0) a[c.cap] = sp.cap;
    if (c.tags >= 0) a[c.tags] = SPECIAL_TAGS;
    if (c.appr >= 0) a[c.appr] = 'Approve';
  });

  if (!hasGoogle) appendSpecialRow_(function (a) {
    if (c.date >= 0) a[c.date] = dateLabel;
    if (c.time >= 0) a[c.time] = sp.time;
    if (c.channel >= 0) a[c.channel] = 'Google';
    if (c.media >= 0) a[c.media] = specialPoster_(sp);
    if (c.headline >= 0) a[c.headline] = sp.name;
    if (c.cap >= 0) a[c.cap] = sp.deal + ' — every ' + sp.day + ' at American Heroes & Brew, Carlsbad Village.';
    if (c.tags >= 0) a[c.tags] = SPECIAL_TAGS;
    if (c.appr >= 0) a[c.appr] = 'Approve';
    if (c.notes >= 0) a[c.notes] = googleKey;
    if (c.eventStart >= 0) a[c.eventStart] = specialEventIso_(date, sp.startH);
    if (c.eventEnd >= 0) a[c.eventEnd] = specialEventIso_(date, sp.endH);
  });

  return added;
}

// Daily 8 AM trigger: add today's recurring special to the current month tab.
function seedTodaySpecial() {
  if (seedSpecialOn_(currentMonthSheet_(), new Date())) scheduleNext();
}

// Month tab for a given Date (creating it with headers if missing).
function monthSheetFor_(date) {
  var tz = Session.getScriptTimeZone();
  var name = MONTH_NAMES[Number(Utilities.formatDate(date, tz, 'M')) - 1] + ' ' + Utilities.formatDate(date, tz, 'yyyy');
  var sh = ss_().getSheetByName(name);
  if (!sh) { sh = ss_().insertSheet(name); sh.appendRow(HEADERS); sh.setFrozenRows(1); }
  return sh;
}

// One-time consolidation: fill the current + next month tabs with the recurring Mon–Fri
// specials, from tomorrow forward (today is handled by seedTodaySpecial). Idempotent —
// safe to re-run; it won't duplicate any special already present on a date.
function backfillSpecials() {
  var tz = Session.getScriptTimeZone();
  var now = new Date();
  var start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);   // tomorrow
  var endMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);            // last day of next month
  var added = 0;
  for (var d = new Date(start); d <= endMonth; d.setDate(d.getDate() + 1)) {
    if (!SPECIALS[Utilities.formatDate(d, tz, 'EEE')]) continue;
    if (seedSpecialOn_(monthSheetFor_(new Date(d)), new Date(d))) added++;
  }
  scheduleNext();
  Logger.log('backfillSpecials: added ' + added + ' special rows through ' + Utilities.formatDate(endMonth, tz, 'MMM d, yyyy'));
}

function setupMonthlyTabs() {
  var now = new Date();
  for (var k = 0; k < 2; k++) {
    var d = new Date(now.getFullYear(), now.getMonth() + k, 1);
    var name = MONTH_NAMES[d.getMonth()] + ' ' + d.getFullYear();
    var sh = ss_().getSheetByName(name);
    if (!sh) sh = ss_().insertSheet(name);
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEADERS);
      sh.setFrozenRows(1);
    }
  }
}

function setup() {
  clearTriggers_('onEditInstallable');
  clearTriggers_(DIGEST_FN);
  clearTriggers_('dailyCatchup');
  ScriptApp.newTrigger('onEditInstallable').forSpreadsheet(ss_()).onEdit().create();
  var dow = (props_().getProperty('DIGEST_DOW') || 'Monday').toUpperCase();
  var day = ScriptApp.WeekDay[dow.charAt(0) + dow.slice(1).toLowerCase()] || ScriptApp.WeekDay.MONDAY;
  ScriptApp.newTrigger(DIGEST_FN).timeBased().onWeekDay(day).atHour(9).create();
  ScriptApp.newTrigger('dailyCatchup').timeBased().everyDays(1).atHour(23).create();
  scheduleNext();
}

function enableSpecials() {
  clearTriggers_(SPECIAL_FN);
  ScriptApp.newTrigger(SPECIAL_FN).timeBased().everyDays(1).atHour(8).create();
  seedTodaySpecial();
}

function disableSpecials() {
  clearTriggers_(SPECIAL_FN);
}

var CURATE_FN = 'seedCuratedRows';

// True if a row already covers this curated item: same key in Notes, OR (for schedule
// stories) an existing row on the same date whose media looks like a schedule poster
// (covers the pre-existing manually-seeded WC story rows).
function curatedExists_(values, c, item, tz) {
  var itemDate = item.date; // already "MMM d, yyyy"
  for (var i = 1; i < values.length; i++) {
    var note = c.notes >= 0 ? String(values[i][c.notes] || '').trim() : '';
    if (note === item.key) return true;
    if (item.postType === 'schedule-story') {
      var media = c.media >= 0 ? String(values[i][c.media] || '').trim().toLowerCase() : '';
      var w = parseWhen_(c.date >= 0 ? values[i][c.date] : '', c.time >= 0 ? values[i][c.time] : '');
      var sameDay = w && Utilities.formatDate(w, tz, 'MMM d, yyyy') === itemDate;
      if (sameDay && (media.indexOf('schedule') >= 0)) return true;
    }
  }
  return false;
}

function seedCuratedRows() {
  var props = props_();
  var site = props.getProperty('SITE') || 'https://americanheroesandbrew.com';
  var secret = props.getProperty('PROMOS_SECRET');
  if (!secret) return;
  var res = UrlFetchApp.fetch(site + '/api/promos/curate', {
    method: 'get',
    headers: { Authorization: 'Bearer ' + secret },
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200) return;
  var data = JSON.parse(res.getContentText() || '{}');
  var rows = (data && data.rows) || [];
  if (!rows.length) return;

  var tz = Session.getScriptTimeZone();
  // Each curated row lands in the month tab matching its OWN Post Date — the rolling 7-day
  // window crosses month boundaries, so a late-June run still seeds early-July rows into the
  // July tab (not June). Snapshots are cached per tab so dedup stays correct within a run.
  var ctxByTab = {};
  function ctxFor_(item) {
    var when = parseWhen_(item.date, '12:00 PM');
    var sh = monthSheetFor_(when || new Date());
    var name = sh.getName();
    if (!ctxByTab[name]) {
      ensureEventColumns_(sh);
      var header = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
      ctxByTab[name] = { sh: sh, header: header, c: cols_(header), values: sh.getDataRange().getDisplayValues() };
    }
    return ctxByTab[name];
  }

  rows.forEach(function (item) {
    var ctx = ctxFor_(item);
    var sh = ctx.sh, header = ctx.header, c = ctx.c, values = ctx.values;
    if (c.media < 0 || c.date < 0) return;
    if (curatedExists_(values, c, item, tz)) return;
    var rowArr = [];
    for (var j = 0; j < header.length; j++) rowArr.push('');
    if (c.date >= 0) rowArr[c.date] = item.date;
    if (c.time >= 0) rowArr[c.time] = item.time;
    if (c.channel >= 0) rowArr[c.channel] = item.channel;
    if (c.media >= 0) rowArr[c.media] = item.media;
    if (c.headline >= 0) rowArr[c.headline] = item.headline || '';
    if (c.cap >= 0) rowArr[c.cap] = item.caption || '';
    if (c.storyCap >= 0) rowArr[c.storyCap] = item.storyCaption || '';
    if (c.tags >= 0) rowArr[c.tags] = item.tags || '';
    // Google Events need manual approval; schedule Stories auto-approve (like daily specials).
    if (c.appr >= 0) rowArr[c.appr] = (item.postType === 'schedule-story') ? 'Approve' : '';
    if (c.notes >= 0) rowArr[c.notes] = item.key;
    if (c.eventStart >= 0 && item.eventStart) rowArr[c.eventStart] = item.eventStart;
    if (c.eventEnd >= 0 && item.eventEnd) rowArr[c.eventEnd] = item.eventEnd;
    sh.appendRow(rowArr);
    if (c.media >= 0) linkifyMediaCell_(sh.getRange(sh.getLastRow(), c.media + 1), site);
    // Keep our in-memory snapshot current so repeated items in one run dedup correctly.
    var appended = []; for (var k = 0; k < header.length; k++) appended.push(rowArr[k]);
    values.push(appended);
  });
}

// Install a once-daily trigger (≈ 6 AM PT) that seeds the next 7 days of curated rows.
function installCurateTrigger() {
  clearTriggers_(CURATE_FN);
  ScriptApp.newTrigger(CURATE_FN).timeBased().atHour(6).everyDays(1).inTimezone('America/Los_Angeles').create();
}

// ── Polish web app (for the Claude Code revision routine) ───────────────────────────
// GET  ?secret=...            -> JSON list of rows where Approval = "Polish".
// POST {secret,tab,row,headline,caption,tags} -> write revision back, clear Approval.
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var secret = props_().getProperty('POLISH_SECRET');
  if (!secret || !e || !e.parameter || e.parameter.secret !== secret) return json_({ error: 'unauthorized' });
  var out = rows_()
    .filter(function (r) { return /polish/i.test(r.approval); })
    .map(function (r) {
      return { tab: r.tab, row: r.rowNum, channel: r.channels.join(', '),
        headline: r.headline, caption: r.caption, tags: r.tags, notes: r.notes };
    });
  return json_({ ok: true, rows: out });
}

function doPost(e) {
  var secret = props_().getProperty('POLISH_SECRET');
  var data;
  try { data = JSON.parse(e.postData.contents); } catch (err) { return json_({ error: 'bad json' }); }
  if (!secret || data.secret !== secret) return json_({ error: 'unauthorized' });
  var sh = ss_().getSheetByName(data.tab);
  if (!sh) return json_({ error: 'no such tab: ' + data.tab });
  var header = sh.getDataRange().getDisplayValues()[0];
  var c = cols_(header);
  var row = Number(data.row);
  if (!row || row < 2) return json_({ error: 'bad row' });
  if (typeof data.headline === 'string' && c.headline >= 0) sh.getRange(row, c.headline + 1).setValue(data.headline);
  if (typeof data.caption === 'string' && c.cap >= 0) sh.getRange(row, c.cap + 1).setValue(data.caption);
  if (typeof data.tags === 'string' && c.tags >= 0) sh.getRange(row, c.tags + 1).setValue(data.tags);
  if (c.appr >= 0) sh.getRange(row, c.appr + 1).setValue(''); // back to blank for re-review
  scheduleNext();
  return json_({ ok: true });
}
