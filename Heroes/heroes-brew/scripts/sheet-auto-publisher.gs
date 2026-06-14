// American Heroes & Brew — content engine v3 (bound to the "Event Posters & Posts" sheet).
// Reads every monthly tab and publishes approved, due rows to Instagram (Feed and/or Story,
// image or video), stamps Posted, emails Jenee a weekly approval digest, rotates a daily
// special Story video, and exposes a small web app so a Claude Code routine can "Polish"
// (AI-revise) rows that Jenee flags. See heroes-brew/docs/CONTENT-STRATEGY.md.
//
// Columns per month tab (matched by header name — order doesn't matter):
//   Post Date | Post Time | Channel | Media | Headline | Caption | Tags | Approval | Posted | Notes
//   - Channel: "Feed", "Story", or both ("Feed, Story") — posts to each.
//   - Media:   <name>.jpg/.png -> /promos/ ;  <name>.mp4 -> /promos-video/  (or a full URL)
//   - Approval: "Approve" publishes; "Polish" sends the row to the AI routine using Notes.
//
// SETUP: paste into the sheet's Apps Script; Time zone = America/Los_Angeles; Script
// Properties PUBLISH_URL, PROMOS_SECRET, SITE, DIGEST_TO, DIGEST_DOW, POLISH_SECRET; run
// setupMonthlyTabs, then setup, then enableSpecials. To enable Polish, also Deploy > New
// deployment > Web app (execute as me, access: anyone with the link) and give the routine
// that /exec URL.

var PUBLISH_FN = 'publishDue';
var DIGEST_FN = 'weeklyDigest';
var SPECIAL_FN = 'seedTodaySpecial';
var MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
var MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var MONTH_TAB_RE = /^[A-Z][a-z]+ \d{4}$/;
var VIDEO_RE = /\.(mp4|mov|m4v)$/i;

var HEADERS = ['Post Date', 'Post Time', 'Channel', 'Media', 'Headline', 'Caption', 'Tags', 'Approval', 'Posted', 'Notes'];

var SPECIALS = {
  Mon: { name: 'Mahalo Monday', cap: 'Mahalo Monday — Kalua Pork Sliders $4 ea + select cans $3. 🌺' },
  Tue: { name: 'Taco Tuesday', cap: 'Taco Tuesday — Tacos $4 ea + $2 off tequila. 🌮' },
  Wed: { name: 'Wings & Wells Wednesday', cap: 'Wings & Wells Wednesday — Wings $6 off + wells $6. 🔥' },
  Thu: { name: 'Burgers & Beer Thursday', cap: 'Burgers & Beer Thursday — Burgers $5 off + select drafts $5. 🍔' },
  Fri: { name: 'Friday Funday', cap: 'Friday Funday 1–4pm — Drinks & appetizers $2 off. 🍻' },
  Sat: { name: 'Game Day at Heroes', cap: 'Game day at Heroes — every screen, every game. Friar Franks $6 on Padres days. ⚾' },
  Sun: { name: 'Game Day at Heroes', cap: 'Sunday at Heroes — catch every game on the big screens. 🏈' }
};
var HASHTAGS = '#AmericanHeroesAndBrew #CarlsbadEats #CarlsbadVillage #SportsBar #NorthCountySD';

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
    tags: find(function (h) { return h.indexOf('tag') === 0; }),
    appr: find(function (h) { return h.indexOf('approval') === 0; }),
    posted: find(function (h) { return h.indexOf('posted') === 0; }),
    notes: find(function (h) { return h.indexOf('note') === 0; })
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
    var ch = /story/i.test(p) ? 'Story' : 'Feed';
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
        tags: get(c.tags),
        notes: get(c.notes),
        approval: get(c.appr),
        posted: get(c.posted),
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
  return site + (row.isVideo ? '/promos-video/' : '/promos/') + row.media;
}

function payloadFor_(row, channel, site) {
  var p = { caption: row.igCaption, mediaType: channel === 'Story' ? 'story' : 'feed' };
  var url = mediaUrl_(row, site);
  if (row.isVideo) p.videoUrl = url; else p.imageUrl = url;
  return p;
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
  var p = props_();
  var url = p.getProperty('PUBLISH_URL');
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
      if (allOk) row.sh.getRange(row.rowNum, row.c.posted + 1).setValue(new Date());
    });
  scheduleNext();
}

function onEditInstallable(e) {
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

function seedTodaySpecial() {
  var tz = Session.getScriptTimeZone();
  var dow = Utilities.formatDate(new Date(), tz, 'EEE');
  var sp = SPECIALS[dow];
  if (!sp) return;
  var sh = currentMonthSheet_();
  var values = sh.getDataRange().getDisplayValues();
  var header = values[0];
  var c = cols_(header);
  if (c.media < 0 || c.date < 0) return;
  var todayKey = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  var file = 'special-' + dow.toLowerCase() + '.mp4';
  for (var i = 1; i < values.length; i++) {
    var r = values[i];
    var f = String(r[c.media]).trim();
    var w = parseWhen_(c.date >= 0 ? r[c.date] : '', c.time >= 0 ? r[c.time] : '');
    if (f === file && w && Utilities.formatDate(w, tz, 'yyyy-MM-dd') === todayKey) return;
  }
  var rowArr = [];
  for (var j = 0; j < header.length; j++) rowArr.push('');
  if (c.date >= 0) rowArr[c.date] = Utilities.formatDate(new Date(), tz, 'MMM d, yyyy');
  if (c.time >= 0) rowArr[c.time] = '4:00 PM';
  if (c.channel >= 0) rowArr[c.channel] = 'Story';
  if (c.media >= 0) rowArr[c.media] = file;
  if (c.headline >= 0) rowArr[c.headline] = sp.name;
  if (c.cap >= 0) rowArr[c.cap] = sp.cap;
  if (c.tags >= 0) rowArr[c.tags] = HASHTAGS;
  if (c.appr >= 0) rowArr[c.appr] = 'Approve';
  sh.appendRow(rowArr);
  scheduleNext();
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
