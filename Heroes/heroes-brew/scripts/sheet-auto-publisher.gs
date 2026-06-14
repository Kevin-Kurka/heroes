// American Heroes & Brew — content engine v2 (bound to the "Event Posters & Posts" sheet).
// Reads every monthly tab and publishes approved, due rows. One "File" column holds the
// poster (.jpg/.png) OR the video (.mp4) — the media type is detected from the extension.
// Stamps Posted (IG), emails Jenee a weekly approval digest, and rotates a daily special
// Story video. See heroes-brew/docs/CONTENT-STRATEGY.md.
//
// Columns (per month tab, matched by header name — order doesn't matter):
//   Post Date & Time (PT) | Post | Channel | File | Caption | Approval | Posted (IG)
//   - Channel: "Feed" (default) or "Story"
//   - File:    <name>.jpg/.png  → posted from /promos/ ;  <name>.mp4 → posted from /promos-video/
//
// SETUP: paste into the sheet's Apps Script; set Time zone = America/Los_Angeles; add Script
// Properties PUBLISH_URL, PROMOS_SECRET, SITE, DIGEST_TO, DIGEST_DOW; run setupMonthlyTabs,
// then setup, then (after special videos are deployed) enableSpecials.

var PUBLISH_FN = 'publishDue';
var DIGEST_FN = 'weeklyDigest';
var SPECIAL_FN = 'seedTodaySpecial';
var MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
var MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var MONTH_TAB_RE = /^[A-Z][a-z]+ \d{4}$/;
var VIDEO_RE = /\.(mp4|mov|m4v)$/i;

var HEADERS = ['Post Date & Time (PT)', 'Post', 'Channel', 'File', 'Caption', 'Approval', 'Posted (IG)'];

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
    post: find(function (h) { return h === 'post'; }),
    channel: find(function (h) { return h === 'channel'; }),
    file: find(function (h) { return h === 'file'; }),
    cap: find(function (h) { return h.indexOf('caption') === 0; }),
    date: find(function (h) { return h.indexOf('post date') === 0; }),
    appr: find(function (h) { return h === 'approval'; }),
    posted: find(function (h) { return h.indexOf('posted (ig)') === 0; })
  };
}

function parseWhen_(raw) {
  var s = String(raw);
  var d = s.match(/([A-Za-z]{3,})\s+(\d{1,2}),\s*(\d{4})/);
  if (!d) return null;
  var mo = MONTHS[d[1].slice(0, 3).toLowerCase()];
  if (mo === undefined) return null;
  var hh = 9, mm = 0;
  var t = s.match(/(\d{1,2}):(\d{2})\s*([AaPp])[Mm]/);
  if (t) { hh = Number(t[1]) % 12; if (t[3].toLowerCase() === 'p') hh += 12; mm = Number(t[2]); }
  return new Date(Number(d[3]), mo, Number(d[2]), hh, mm, 0);
}

function rows_() {
  var list = [];
  monthSheets_().forEach(function (sh) {
    var values = sh.getDataRange().getValues();
    if (values.length < 2) return;
    var c = cols_(values[0]);
    if (c.file < 0) return;
    for (var i = 1; i < values.length; i++) {
      var r = values[i];
      var get = function (idx) { return idx >= 0 ? String(r[idx] || '').trim() : ''; };
      var file = get(c.file);
      if (!file) continue;
      list.push({
        sh: sh, c: c, rowNum: i + 1,
        post: get(c.post),
        channel: /story/i.test(get(c.channel)) ? 'Story' : 'Feed',
        file: file,
        isVideo: VIDEO_RE.test(file),
        caption: get(c.cap),
        approval: get(c.appr),
        posted: get(c.posted),
        when: parseWhen_(get(c.date))
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

function payloadFor_(row, site) {
  var p = { caption: row.caption, mediaType: row.channel === 'Story' ? 'story' : 'feed' };
  if (row.isVideo) p.videoUrl = site + '/promos-video/' + row.file;
  else p.imageUrl = site + '/promos/' + row.file;
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
      var res = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        headers: { Authorization: 'Bearer ' + secret },
        payload: JSON.stringify(payloadFor_(row, site)),
        muteHttpExceptions: true
      });
      if (res.getResponseCode() === 200) {
        row.sh.getRange(row.rowNum, row.c.posted + 1).setValue(new Date());
      } else {
        Logger.log('Publish failed [' + row.sh.getName() + ' r' + row.rowNum + ']: ' + res.getContentText());
      }
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
      body += '- ' + fmt(r.when) + '  [' + r.channel + ']  ' + (r.post || r.file) + '\n    '
        + (r.caption || '').slice(0, 120) + '\n';
    });
  }
  body += '\nApprove by setting Approval = "Approve" in the sheet:\n' + link + '\n';
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
  var values = sh.getDataRange().getValues();
  var header = values[0];
  var c = cols_(header);
  if (c.file < 0 || c.date < 0) return; // tab not set up with the expected columns
  var todayKey = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  var file = 'special-' + dow.toLowerCase() + '.mp4';
  for (var i = 1; i < values.length; i++) {
    var r = values[i];
    var f = String(r[c.file]).trim();
    var w = parseWhen_(r[c.date]);
    if (f === file && w && Utilities.formatDate(w, tz, 'yyyy-MM-dd') === todayKey) return;
  }
  var when = Utilities.formatDate(new Date(), tz, 'EEE MMM d, yyyy') + ' — 4:00 PM';
  // Place each value at this tab's actual column index, so column order doesn't matter.
  var rowArr = [];
  for (var j = 0; j < header.length; j++) rowArr.push('');
  if (c.date >= 0) rowArr[c.date] = when;
  if (c.post >= 0) rowArr[c.post] = sp.name;
  if (c.channel >= 0) rowArr[c.channel] = 'Story';
  if (c.file >= 0) rowArr[c.file] = file;
  if (c.cap >= 0) rowArr[c.cap] = sp.cap + '\n\n' + HASHTAGS;
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
