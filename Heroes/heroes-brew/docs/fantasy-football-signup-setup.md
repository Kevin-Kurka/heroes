# Fantasy Football Signup — activate capture (5 min)

The `/fantasy-football` hub is fully live. The signup form posts to
`POST /api/fantasy/signup`, which forwards to a Google Apps Script Web App that
appends a row to a Google Sheet and emails you. Until `FANTASY_SIGNUP_URL` is set,
the form shows a graceful "DM/call us" fallback (no data is lost — people are told
how to reach you).

## Steps
1. Create a Google Sheet (e.g., "Heroes Fantasy Signups"). Note its tab name (default `Signups`).
2. In that Sheet → **Extensions → Apps Script**, paste the script below, set `NOTIFY_EMAIL`, and Save.
3. **Deploy → New deployment → Web app**: Execute as **Me**, Who has access **Anyone**. Copy the Web app URL.
4. In Vercel (project `heroes`, production), set env **`FANTASY_SIGNUP_URL`** = that URL. Redeploy.
5. Submit a test signup on `/fantasy-football` and confirm a row appears + you get the email.

## Apps Script (`Code.gs`)
```javascript
const SHEET_NAME = 'Signups';
const NOTIFY_EMAIL = 'kurkafund@gmail.com'; // where signup alerts go

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) {
      sh = ss.insertSheet(SHEET_NAME);
      sh.appendRow(['Submitted', 'Name', 'Contact', 'Mode', 'League', 'Players', 'Host draft', 'Draft date', 'Message']);
    }
    sh.appendRow([d.submittedAt || new Date().toISOString(), d.name, d.contact, d.mode,
      d.leagueName, d.players, d.hostDraft, d.draftDate, d.message]);
    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(NOTIFY_EMAIL, '🏈 New Fantasy Football signup: ' + (d.name || ''),
        Object.entries(d).map(([k, v]) => k + ': ' + v).join('\n'));
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Notes
- No payment/buy-in (free league; Heroes funds the $100 prize) — by design.
- Yahoo is link-out only (their API can't create/join leagues). Live standings via the Yahoo API are a possible **phase 2**.
- The form also captures **draft-at-Heroes** requests (checkbox + preferred date) so you can reserve the venue + munchies.
- Prize rule shown on-page: **$100 gift card, winner must claim in person on championship day.**
