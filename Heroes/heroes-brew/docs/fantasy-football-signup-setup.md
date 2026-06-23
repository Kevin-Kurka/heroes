# Fantasy Football Signup — activate capture (5 min)

The `/fantasy-football` hub is live. Two signup cards post to `POST /api/fantasy/signup`,
which forwards to a Google Apps Script Web App that writes to **two separate tabs**
in one Sheet and emails you. It also serves **live per-league counts** so the Join
card shows spots filling up. Until the env vars are set, the forms show a graceful
"DM/call us" fallback (no leads lost).

**Caps enforced server-side:** 10 players per league · each player in at most 3 leagues · no duplicate join of the same league.

## Steps
1. Create a Google Sheet (e.g., "Heroes Fantasy Football"). Two tabs auto-create: **`Heroes League Joins`** and **`Registered Leagues`**.
2. **Extensions → Apps Script**, paste the script below, set `NOTIFY_EMAIL`, Save.
3. **Deploy → New deployment → Web app**: Execute as **Me**, Who has access **Anyone**. Copy the Web app URL.
4. In Vercel (project `heroes`, production) set **both** env vars to that same URL:
   - `FANTASY_SIGNUP_URL` = the Web app URL (POST — writes signups)
   - `FANTASY_COUNTS_URL` = the same URL (GET — returns live per-league counts)
   Redeploy.
5. Test on `/fantasy-football`: join a league (confirm a row in `Heroes League Joins` + the "spots left" drops) and register a league (confirm a row in `Registered Leagues`).

## Apps Script (`Code.gs`)
```javascript
const JOINS = 'Heroes League Joins';
const REGS  = 'Registered Leagues';
const NOTIFY_EMAIL = 'kurkafund@gmail.com';
const LEAGUE_CAP = 10;       // players per league
const MAX_PER_USER = 3;      // leagues per email

function sheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(headers); }
  return sh;
}

// GET → live counts per league date: { "2026-08-28": 3, ... }
function doGet() {
  const sh = sheet_(JOINS, ['Submitted','Name','Email','LeagueDate','DraftLabel']);
  const rows = sh.getDataRange().getValues().slice(1);
  const counts = {};
  rows.forEach(r => { const d = r[3]; if (d) counts[d] = (counts[d] || 0) + 1; });
  return ContentService.createTextOutput(JSON.stringify(counts)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.type === 'register') return reg_(d);
    return join_(d);
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  }
}

function join_(d) {
  const sh = sheet_(JOINS, ['Submitted','Name','Email','LeagueDate','DraftLabel']);
  const rows = sh.getDataRange().getValues().slice(1);
  const email = String(d.email || '').toLowerCase();
  const userLeagues = new Set(rows.filter(r => String(r[2]).toLowerCase() === email).map(r => r[3]));
  const counts = {}; rows.forEach(r => counts[r[3]] = (counts[r[3]] || 0) + 1);

  const ids = d.leagueIds || [];
  const labels = d.draftDates || [];
  const joined = [], skipped = [];
  ids.forEach((id, i) => {
    if (userLeagues.has(id)) { skipped.push({ id, reason: 'already joined' }); return; }
    if ((counts[id] || 0) >= LEAGUE_CAP) { skipped.push({ id, reason: 'full' }); return; }
    if (userLeagues.size + joined.length >= MAX_PER_USER) { skipped.push({ id, reason: 'max 3 leagues' }); return; }
    sh.appendRow([d.submittedAt || new Date().toISOString(), d.name, d.email, id, labels[i] || id]);
    counts[id] = (counts[id] || 0) + 1; joined.push(id);
  });
  if (NOTIFY_EMAIL && joined.length)
    MailApp.sendEmail(NOTIFY_EMAIL, '🏈 Fantasy JOIN: ' + d.name, d.name + ' (' + d.email + ') joined: ' + joined.join(', '));
  return out_({ ok: joined.length > 0, joined, skipped, full: joined.length === 0 });
}

function reg_(d) {
  const sh = sheet_(REGS, ['Submitted','Commissioner','League','Email','Phone','DraftDate']);
  sh.appendRow([d.submittedAt || new Date().toISOString(), d.name, d.leagueName, d.email, d.phone, d.draftDate]);
  if (NOTIFY_EMAIL)
    MailApp.sendEmail(NOTIFY_EMAIL, '🏈 Fantasy LEAGUE registered: ' + d.leagueName,
      'Commissioner: ' + d.name + '\nLeague: ' + d.leagueName + '\nEmail: ' + d.email + '\nPhone: ' + d.phone + '\nDraft: ' + d.draftDate);
  return out_({ ok: true });
}

function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
```

## Notes
- Official leagues (6 × 10) + draft dates are in `src/lib/fantasy.ts` (`OFFICIAL_LEAGUES`). Edit there if dates/times change; the `id` (YYYY-MM-DD) must match what the Sheet stores.
- No payment/buy-in (free; Heroes funds the $100 prize). Yahoo = link-out only; live standings = possible phase 2.
- Prize rule shown on-page: **$100 gift card, winner must claim in person on championship day.**
