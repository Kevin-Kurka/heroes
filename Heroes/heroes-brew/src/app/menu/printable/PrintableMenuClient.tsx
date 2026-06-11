'use client';

import { useState } from 'react';
import { Menu, MenuGroup, MenuItem } from '@/types';
import { rowsToXlsxBlob, rowsToDocxBlob } from '@/lib/office';

/* ─── Types ─── */
type StyleKey = 'americana' | 'editorial';
type ModeKey = 'light' | 'dark';
type SectionKey = 'daily' | 'starters' | 'salads' | 'burgers' | 'heroes' | 'sweet' | 'drinks' | 'kids' | 'combo-burgers-heroes' | 'combo-starters-salads' | 'combo-sweet-kids';

const STYLES: { key: StyleKey; label: string; desc: string }[] = [
  { key: 'americana', label: 'Bold Americana', desc: 'Navy & red banners · strong sans-serif · patriotic palette' },
  { key: 'editorial', label: 'Bold Editorial', desc: 'Red accent banners · strong sans-serif · modern grid' },
];

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: 'daily', label: 'Daily Lineup' },
  { key: 'starters', label: 'Starters' },
  { key: 'salads', label: 'Salads' },
  { key: 'burgers', label: 'Burgers' },
  { key: 'heroes', label: 'Heroes' },
  { key: 'sweet', label: 'Sweet Stuff' },
  { key: 'drinks', label: 'Drinks' },
  { key: 'kids', label: 'Kids' },
  { key: 'combo-burgers-heroes', label: 'Burgers + Heroes' },
  { key: 'combo-starters-salads', label: 'Starters + Salads' },
  { key: 'combo-sweet-kids', label: 'Sweet Stuff + Kids' },
];

const DAILY_SPECIALS = [
  { day: 'Monday', name: 'Mahalo Monday', price: '4ea', lines: ['Kalua Pork Sliders $4ea', 'Select Cans $3ea'] },
  { day: 'Tuesday', name: 'Taco Tuesday', price: '4ea', lines: ['Tacos $4ea', 'Tequila $2 off'] },
  { day: 'Wednesday', name: 'Wings & Wells', price: '$6', lines: ['Wings $6 off', 'Wells $6ea'] },
  { day: 'Thursday', name: 'Burgers & Beer', price: '$5', lines: ['Burgers $5 off', 'Select Drafts $5ea'] },
  { day: 'Friday', name: 'Friday Funday', price: '$2 off', lines: ['1-4pm', 'Drinks & Appetizers $2 off'] },
];


/* ============================================================
   STYLE CSS — each style has light + dark palettes
   Geist font (site font) used for Americana
   Oswald kept for Editorial style
   ============================================================ */
function getStyleCSS(s: StyleKey, m: ModeKey): string {
  const G = "'Geist',var(--font-geist-sans),system-ui,sans-serif";
  const shared = `
    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap');
    nav,header,.bottom-nav,footer{display:none!important}
    main{padding:0!important;min-height:auto!important}
    *{box-sizing:border-box}
    @media print{
      .no-print{display:none!important}
      html,body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
      .pg{page-break-before:always;box-shadow:none!important}
      .pg:first-of-type{page-break-before:avoid}
      @page{size:A4;margin:0}
    }
    @media screen{.pg{max-width:210mm;margin:0 auto 28px;min-height:297mm}}
    .c2{columns:2;column-gap:32px}.c2>*{break-inside:avoid}
  `;

  /* ── Bold Americana (light) — navy banner, white body, red accents ── */
  if (s === 'americana' && m === 'light') return shared + `
    html,body{background:#e5e7eb!important}
    .pg{background:#fff;color:#1b2a4a;padding:0;position:relative;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.1)}
    .pg-banner{background:#1b2a4a;padding:16mm 22mm 12mm;color:#fff;position:relative}
    .pg-banner::after{content:'';position:absolute;bottom:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#bf1b1b 33%,#fff 33%,#fff 66%,#1b2a4a 66%)}
    .pg-body{padding:20px 22mm 18mm}
    .logo{font-family:'Oswald',sans-serif;font-weight:700;font-size:34px;text-transform:uppercase;letter-spacing:6px;color:#fff}
    .tagline{font-family:${G};font-weight:400;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#ffffff88;margin-top:4px}
    .divider{display:none}
    .sec{font-family:'Oswald',sans-serif;font-size:26px;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:#1b2a4a;text-align:left;margin-bottom:6px;padding-bottom:6px;border-bottom:3px solid #bf1b1b;display:inline-block}
    .sec-sub{font-family:${G};font-size:10px;text-align:left;color:#5a6b8a;font-weight:400;letter-spacing:1px;margin-bottom:18px}
    .grp{margin-bottom:22px;border-left:3px solid #1b2a4a;padding-left:14px}
    .grp-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:6px}
    .grp-nm{font-family:'Oswald',sans-serif;font-weight:600;font-size:16px;text-transform:uppercase;letter-spacing:1px;color:#1b2a4a}
    .grp-pr{font-family:'Oswald',sans-serif;font-weight:700;font-size:17px;color:#bf1b1b}
    .grp-desc{font-family:${G};font-size:11px;color:#5a6b8a;font-weight:400;line-height:1.6;margin-bottom:6px}
    .pills{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}
    .pill{font-size:10px;border:1px solid #1b2a4a22;border-radius:2px;padding:3px 10px;color:#1b2a4a;background:#f0f4f8;font-family:${G}}
    .row{display:flex;align-items:baseline;margin-bottom:10px}
    .row-nm{font-family:'Oswald',sans-serif;font-weight:500;font-size:14px;text-transform:uppercase;letter-spacing:.5px;color:#1b2a4a;white-space:nowrap}
    .row-sub{font-family:${G};font-size:11px;color:#bf1b1b;font-weight:500;margin-left:8px;font-style:normal}
    .row-dots{flex:1;margin:0 10px;min-width:10px;border-bottom:1px dotted #1b2a4a33}
    .row-pr{font-family:'Oswald',sans-serif;font-weight:600;font-size:14px;color:#bf1b1b;white-space:nowrap}
    .row-desc{font-family:${G};font-size:10px;color:#5a6b8a;font-weight:400;margin:-4px 0 8px;line-height:1.5}
    .addons{border-top:2px solid #1b2a4a;padding-top:10px;margin-top:14px}
    .addons-lbl{font-family:'Oswald',sans-serif;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#1b2a4a;margin-bottom:6px}
    .addon{display:inline-block;font-size:10px;margin-right:14px;color:#5a6b8a;font-family:${G}}
    .addon strong{color:#bf1b1b;font-weight:600}
    .ch-row{font-family:${G};font-size:10px;color:#5a6b8a;margin:3px 0}
    .ch-lbl{font-weight:600;text-transform:uppercase;font-size:8px;letter-spacing:1.5px;color:#1b2a4a}
    .ft{text-align:center;font-family:${G};font-size:8px;color:#aaa;letter-spacing:2px;margin-top:auto;padding-top:16px}
    .daily-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:18px}
    .d-card{border:2px solid #1b2a4a;border-radius:0;padding:16px;position:relative}
    .d-card::before{content:'';position:absolute;top:0;left:0;width:4px;height:100%;background:#bf1b1b}
    .d-nm{font-family:'Oswald',sans-serif;font-size:18px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#1b2a4a;margin-left:8px}
    .d-pr{font-family:'Oswald',sans-serif;font-size:30px;font-weight:700;color:#bf1b1b}
    .d-day{font-family:${G};font-size:9px;text-transform:uppercase;letter-spacing:3px;color:#5a6b8a;font-weight:500;margin-left:8px}
    .d-line{font-size:12px;color:#5a6b8a;margin-left:8px;font-family:${G}}
    .sub-hd{font-family:'Oswald',sans-serif;font-size:16px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#1b2a4a;border-bottom:2px solid #bf1b1b;padding-bottom:4px;margin:14px 0 8px;display:inline-block}
    @media print{html,body{background:#fff!important}.pg{box-shadow:none;padding:0}.pg-banner{padding:12mm 18mm 10mm}.pg-body{padding:14px 18mm 14mm}}
  `;

  /* ── Bold Americana (dark) — red banner, dark navy body ── */
  if (s === 'americana' && m === 'dark') return shared + `
    html,body{background:#0e1525!important}
    .pg{background:#131d30;color:#e0ddd6;padding:0;position:relative;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.4)}
    .pg-banner{background:#bf1b1b;padding:16mm 22mm 12mm;color:#fff;position:relative}
    .pg-banner::after{content:'';position:absolute;bottom:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#bf1b1b 33%,#fff 33%,#fff 66%,#1b2a4a 66%)}
    .pg-body{padding:20px 22mm 18mm}
    .logo{font-family:'Oswald',sans-serif;font-weight:700;font-size:34px;text-transform:uppercase;letter-spacing:6px;color:#fff}
    .tagline{font-family:${G};font-weight:400;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#ffffff88;margin-top:4px}
    .divider{display:none}
    .sec{font-family:'Oswald',sans-serif;font-size:26px;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:#e0ddd6;text-align:left;margin-bottom:6px;padding-bottom:6px;border-bottom:3px solid #4a6a9a;display:inline-block}
    .sec-sub{font-family:${G};font-size:10px;text-align:left;color:#8899bb;font-weight:400;letter-spacing:1px;margin-bottom:18px}
    .grp{margin-bottom:22px;border-left:3px solid #4a6a9a;padding-left:14px}
    .grp-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:6px}
    .grp-nm{font-family:'Oswald',sans-serif;font-weight:600;font-size:16px;text-transform:uppercase;letter-spacing:1px;color:#e0ddd6}
    .grp-pr{font-family:'Oswald',sans-serif;font-weight:700;font-size:17px;color:#e74c4c}
    .grp-desc{font-family:${G};font-size:11px;color:#8899bb;font-weight:400;line-height:1.6;margin-bottom:6px}
    .pills{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}
    .pill{font-size:10px;border:1px solid #3a4f7a;border-radius:2px;padding:3px 10px;color:#d0ccc4;background:#1e2d48;font-family:${G}}
    .row{display:flex;align-items:baseline;margin-bottom:10px}
    .row-nm{font-family:'Oswald',sans-serif;font-weight:500;font-size:14px;text-transform:uppercase;letter-spacing:.5px;color:#e0ddd6;white-space:nowrap}
    .row-sub{font-family:${G};font-size:11px;color:#e74c4c;font-weight:500;margin-left:8px;font-style:normal}
    .row-dots{flex:1;margin:0 10px;min-width:10px;border-bottom:1px dotted #3a4f7a}
    .row-pr{font-family:'Oswald',sans-serif;font-weight:600;font-size:14px;color:#e74c4c;white-space:nowrap}
    .row-desc{font-family:${G};font-size:10px;color:#8899bb;font-weight:400;margin:-4px 0 8px;line-height:1.5}
    .addons{border-top:2px solid #4a6a9a;padding-top:10px;margin-top:14px}
    .addons-lbl{font-family:'Oswald',sans-serif;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#e74c4c;margin-bottom:6px}
    .addon{display:inline-block;font-size:10px;margin-right:14px;color:#8899bb;font-family:${G}}
    .addon strong{color:#e74c4c;font-weight:600}
    .ch-row{font-family:${G};font-size:10px;color:#8899bb;margin:3px 0}
    .ch-lbl{font-weight:600;text-transform:uppercase;font-size:8px;letter-spacing:1.5px;color:#e74c4c}
    .ft{text-align:center;font-family:${G};font-size:8px;color:#4a5568;letter-spacing:2px;margin-top:auto;padding-top:16px}
    .daily-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:18px}
    .d-card{border:2px solid #3a4f7a;border-radius:0;padding:16px;position:relative}
    .d-card::before{content:'';position:absolute;top:0;left:0;width:4px;height:100%;background:#e74c4c}
    .d-nm{font-family:'Oswald',sans-serif;font-size:18px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#e0ddd6;margin-left:8px}
    .d-pr{font-family:'Oswald',sans-serif;font-size:30px;font-weight:700;color:#e74c4c}
    .d-day{font-family:${G};font-size:9px;text-transform:uppercase;letter-spacing:3px;color:#6080aa;font-weight:500;margin-left:8px}
    .d-line{font-size:12px;color:#8899bb;margin-left:8px;font-family:${G}}
    .sub-hd{font-family:'Oswald',sans-serif;font-size:16px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#e0ddd6;border-bottom:2px solid #4a6a9a;padding-bottom:4px;margin:14px 0 8px;display:inline-block}
    @media print{html,body{background:#131d30!important}.pg{background:#131d30!important;box-shadow:none;padding:0}.pg-banner{padding:12mm 18mm 10mm}.pg-body{padding:14px 18mm 14mm}}
  `;

  /* ── Bold Editorial (light) ── */
  if (s === 'editorial' && m === 'light') return shared + `
    html,body{background:#e5e7eb!important}
    .pg{background:#fff;color:#1a1a1a;padding:0;position:relative;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.1)}
    .pg-banner{background:#bf1b1b;padding:16mm 22mm 12mm;color:#fff;position:relative}
    .pg-banner::after{content:'';position:absolute;bottom:-12px;left:0;right:0;height:12px;background:linear-gradient(to bottom right,#bf1b1b 50%,transparent 50%)}
    .pg-body{padding:20px 22mm 18mm}
    .logo{font-family:'Oswald',sans-serif;font-weight:700;font-size:34px;text-transform:uppercase;letter-spacing:6px;color:#fff}
    .tagline{font-family:${G};font-weight:400;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#ffffff88;margin-top:4px}
    .divider{display:none}
    .sec{font-family:'Oswald',sans-serif;font-size:26px;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:#1a1a1a;text-align:left;margin-bottom:6px;padding-bottom:6px;border-bottom:3px solid #bf1b1b;display:inline-block}
    .sec-sub{font-family:${G};font-size:10px;text-align:left;color:#666;font-weight:400;letter-spacing:1px;margin-bottom:18px}
    .grp{margin-bottom:22px;border-left:3px solid #bf1b1b;padding-left:14px}
    .grp-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:6px}
    .grp-nm{font-family:'Oswald',sans-serif;font-weight:600;font-size:16px;text-transform:uppercase;letter-spacing:1px;color:#1a1a1a}
    .grp-pr{font-family:'Oswald',sans-serif;font-weight:700;font-size:17px;color:#bf1b1b}
    .grp-desc{font-family:${G};font-size:11px;color:#555;font-weight:400;line-height:1.6;margin-bottom:6px}
    .pills{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}
    .pill{font-size:10px;border:1px solid #e5e7eb;border-radius:2px;padding:3px 10px;color:#333;background:#f9fafb;font-family:${G}}
    .row{display:flex;align-items:baseline;margin-bottom:10px}
    .row-nm{font-family:'Oswald',sans-serif;font-weight:500;font-size:14px;text-transform:uppercase;letter-spacing:.5px;color:#1a1a1a;white-space:nowrap}
    .row-sub{font-family:${G};font-size:11px;color:#bf1b1b;font-weight:500;margin-left:8px;font-style:normal}
    .row-dots{flex:1;margin:0 10px;min-width:10px}
    .row-pr{font-family:'Oswald',sans-serif;font-weight:600;font-size:14px;color:#bf1b1b;white-space:nowrap}
    .row-desc{font-family:${G};font-size:10px;color:#777;font-weight:400;margin:-4px 0 8px;line-height:1.5}
    .addons{border-top:2px solid #bf1b1b;padding-top:10px;margin-top:14px}
    .addons-lbl{font-family:'Oswald',sans-serif;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#bf1b1b;margin-bottom:6px}
    .addon{display:inline-block;font-size:10px;margin-right:14px;color:#555;font-family:${G}}
    .addon strong{color:#bf1b1b;font-weight:600}
    .ch-row{font-family:${G};font-size:10px;color:#666;margin:3px 0}
    .ch-lbl{font-weight:600;text-transform:uppercase;font-size:8px;letter-spacing:1.5px;color:#bf1b1b}
    .ft{text-align:center;font-family:${G};font-size:8px;color:#aaa;letter-spacing:2px;margin-top:auto;padding-top:16px}
    .daily-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:18px}
    .d-card{border:2px solid #1a1a1a;border-radius:0;padding:16px;position:relative}
    .d-card::before{content:'';position:absolute;top:0;left:0;width:4px;height:100%;background:#bf1b1b}
    .d-nm{font-family:'Oswald',sans-serif;font-size:18px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#1a1a1a;margin-left:8px}
    .d-pr{font-family:'Oswald',sans-serif;font-size:30px;font-weight:700;color:#bf1b1b}
    .d-day{font-family:${G};font-size:9px;text-transform:uppercase;letter-spacing:3px;color:#888;font-weight:500;margin-left:8px}
    .d-line{font-size:12px;color:#555;margin-left:8px;font-family:${G}}
    .sub-hd{font-family:'Oswald',sans-serif;font-size:16px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#1a1a1a;border-bottom:2px solid #bf1b1b;padding-bottom:4px;margin:14px 0 8px;display:inline-block}
    @media print{html,body{background:#fff!important}.pg{box-shadow:none;padding:0}.pg-banner{padding:12mm 18mm 10mm}.pg-body{padding:14px 18mm 14mm}}
  `;

  /* ── Bold Editorial (dark) ── */
  return shared + `
    html,body{background:#111!important}
    .pg{background:#1a1a1a;color:#e5e5e5;padding:0;position:relative;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.3)}
    .pg-banner{background:#bf1b1b;padding:16mm 22mm 12mm;color:#fff;position:relative}
    .pg-banner::after{content:'';position:absolute;bottom:-12px;left:0;right:0;height:12px;background:linear-gradient(to bottom right,#bf1b1b 50%,transparent 50%)}
    .pg-body{padding:20px 22mm 18mm}
    .logo{font-family:'Oswald',sans-serif;font-weight:700;font-size:34px;text-transform:uppercase;letter-spacing:6px;color:#fff}
    .tagline{font-family:${G};font-weight:400;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#ffffff88;margin-top:4px}
    .divider{display:none}
    .sec{font-family:'Oswald',sans-serif;font-size:26px;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:#e5e5e5;text-align:left;margin-bottom:6px;padding-bottom:6px;border-bottom:3px solid #bf1b1b;display:inline-block}
    .sec-sub{font-family:${G};font-size:10px;text-align:left;color:#999;font-weight:400;letter-spacing:1px;margin-bottom:18px}
    .grp{margin-bottom:22px;border-left:3px solid #bf1b1b;padding-left:14px}
    .grp-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:6px}
    .grp-nm{font-family:'Oswald',sans-serif;font-weight:600;font-size:16px;text-transform:uppercase;letter-spacing:1px;color:#e5e5e5}
    .grp-pr{font-family:'Oswald',sans-serif;font-weight:700;font-size:17px;color:#e74c4c}
    .grp-desc{font-family:${G};font-size:11px;color:#aaa;font-weight:400;line-height:1.6;margin-bottom:6px}
    .pills{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}
    .pill{font-size:10px;border:1px solid #444;border-radius:2px;padding:3px 10px;color:#ddd;background:#2a2a2a;font-family:${G}}
    .row{display:flex;align-items:baseline;margin-bottom:10px}
    .row-nm{font-family:'Oswald',sans-serif;font-weight:500;font-size:14px;text-transform:uppercase;letter-spacing:.5px;color:#e5e5e5;white-space:nowrap}
    .row-sub{font-family:${G};font-size:11px;color:#e74c4c;font-weight:500;margin-left:8px;font-style:normal}
    .row-dots{flex:1;margin:0 10px;min-width:10px;border-bottom:1px dotted #444}
    .row-pr{font-family:'Oswald',sans-serif;font-weight:600;font-size:14px;color:#e74c4c;white-space:nowrap}
    .row-desc{font-family:${G};font-size:10px;color:#888;font-weight:400;margin:-4px 0 8px;line-height:1.5}
    .addons{border-top:2px solid #bf1b1b;padding-top:10px;margin-top:14px}
    .addons-lbl{font-family:'Oswald',sans-serif;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#e74c4c;margin-bottom:6px}
    .addon{display:inline-block;font-size:10px;margin-right:14px;color:#aaa;font-family:${G}}
    .addon strong{color:#e74c4c;font-weight:600}
    .ch-row{font-family:${G};font-size:10px;color:#999;margin:3px 0}
    .ch-lbl{font-weight:600;text-transform:uppercase;font-size:8px;letter-spacing:1.5px;color:#e74c4c}
    .ft{text-align:center;font-family:${G};font-size:8px;color:#555;letter-spacing:2px;margin-top:auto;padding-top:16px}
    .daily-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:18px}
    .d-card{border:2px solid #444;border-radius:0;padding:16px;position:relative}
    .d-card::before{content:'';position:absolute;top:0;left:0;width:4px;height:100%;background:#bf1b1b}
    .d-nm{font-family:'Oswald',sans-serif;font-size:18px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#e5e5e5;margin-left:8px}
    .d-pr{font-family:'Oswald',sans-serif;font-size:30px;font-weight:700;color:#e74c4c}
    .d-day{font-family:${G};font-size:9px;text-transform:uppercase;letter-spacing:3px;color:#777;font-weight:500;margin-left:8px}
    .d-line{font-size:12px;color:#aaa;margin-left:8px;font-family:${G}}
    .sub-hd{font-family:'Oswald',sans-serif;font-size:16px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#e5e5e5;border-bottom:2px solid #bf1b1b;padding-bottom:4px;margin:14px 0 8px;display:inline-block}
    @media print{html,body{background:#1a1a1a!important}.pg{background:#1a1a1a!important;box-shadow:none;padding:0}.pg-banner{padding:12mm 18mm 10mm}.pg-body{padding:14px 18mm 14mm}}
  `;

}

/* ============================================================
   SHARED RENDERERS
   ============================================================ */
function fmtPrice(p: number) { return `${p}`; }

function Header({ style: s }: { style: StyleKey }) {
  if (s === 'editorial') return (
    <div className="pg-banner">
      <div className="logo">American Heroes &amp; Brew</div>
      <div className="tagline">300 Carlsbad Village Dr, Suite 120 · Carlsbad, CA · (760) 994-0187</div>
    </div>
  );
  return (
    <div style={{ marginBottom: 8 }}>
      <div className="logo">American Heroes &amp; Brew</div>
      <div className="tagline">300 Carlsbad Village Dr · Carlsbad CA · (760) 994-0187</div>
    </div>
  );
}

function SecHead({ title, desc }: { title: string; desc?: string }) {
  return <>
    <div className="sec">{title}</div>
    {desc && <div className="sec-sub">{desc}</div>}
  </>;
}

function VGroup({ g, style: s }: { g: MenuGroup; style: StyleKey }) {
  const allSame = g.items.every(i => i.price === g.basePrice);
  return (
    <div className="grp">
      <div className="grp-head">
        <span className="grp-nm">{g.name}</span>
        {g.basePrice != null && <span className="grp-pr">{fmtPrice(g.basePrice)}</span>}
      </div>
      {g.description && <div className="grp-desc">{g.description}</div>}
      {g.items.length > 1 && (
        <div className="pills">
          {g.items.map(i => (
            <span key={i.id} className="pill">
              {i.name}{i.subtitle ? ` · ${i.subtitle}` : ''}{!allSame && i.price !== g.basePrice ? ` ${fmtPrice(i.price)}` : ''}
            </span>
          ))}
        </div>
      )}
      {g.choices?.map(c => <div key={c.label} className="ch-row"><span className="ch-lbl">{c.label}: </span>{c.options.join(' · ')}</div>)}
      {g.addOns && g.addOns.length > 0 && (
        <div style={{ marginTop: 3 }}>
          {g.addOns.map(a => <span key={a.name} className="addon">{a.name} <strong>{a.price}</strong></span>)}
        </div>
      )}
    </div>
  );
}

function ItemRow({ name, sub, desc, price }: { name: string; sub?: string; desc?: string; price: number }) {
  return <>
    <div className="row">
      <span className="row-nm">{name}</span>
      {sub && <span className="row-sub">{sub}</span>}
      <span className="row-dots" />
      <span className="row-pr">{fmtPrice(price)}</span>
    </div>
    {desc && <div className="row-desc">{desc}</div>}
  </>;
}

function AddOnBox({ addOns, label }: { addOns?: { name: string; price: string }[]; label?: string }) {
  if (!addOns?.length) return null;
  return (
    <div className="addons">
      <div className="addons-lbl">{label || 'Sides'}</div>
      {addOns.map(a => <span key={a.name} className="addon">{a.name} <strong>{a.price}</strong></span>)}
    </div>
  );
}

function Footer() {
  return <div className="ft">American Heroes &amp; Brew · 300 Carlsbad Village Dr, Suite 120, Carlsbad CA 92008 · (760) 994-0187</div>;
}

function PageWrap({ style: s, children }: { style: StyleKey; children: React.ReactNode }) {
  return (
    <div className="pg">
      <Header style={s} />
      <div className="pg-body">{children}<Footer /></div>
    </div>
  );
}

/* ============================================================
   SECTIONS
   ============================================================ */
function DailySection({ style: s }: { style: StyleKey }) {
  return (
    <PageWrap style={s}>
      <SecHead title="Daily Lineup" desc="Specials available all day, every day." />
      <div className="daily-grid">
        {DAILY_SPECIALS.map(d => (
          <div key={d.day} className="d-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div><div className="d-nm">{d.name}</div><div className="d-day">{d.day}</div></div>
              <div className="d-pr">{d.price}</div>
            </div>
            <div style={{ marginTop: 5 }}>{d.lines.map(l => <div key={l} className="d-line">{l}</div>)}</div>
          </div>
        ))}
      </div>
    </PageWrap>
  );
}

function StartersSection({ group, style: s }: { group: MenuGroup; style: StyleKey }) {
  return (
    <PageWrap style={s}>
      <SecHead title="Starters" desc="Shareable favorites to kick things off." />
      <div className="c2">{group.subGroups?.map(sub => <VGroup key={sub.id} g={sub} style={s} />)}</div>
    </PageWrap>
  );
}

function SaladsSection({ group, style: s }: { group: MenuGroup; style: StyleKey }) {
  return (
    <PageWrap style={s}>
      <SecHead title="Salads" />
      {group.items.map(it => <ItemRow key={it.id} name={it.name} desc={it.description} price={it.price} />)}
      <AddOnBox addOns={group.addOns} label={group.addOnLabel} />
    </PageWrap>
  );
}

function BurgersSection({ group, style: s }: { group: MenuGroup; style: StyleKey }) {
  return (
    <PageWrap style={s}>
      <SecHead title="Burgers" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div className="grp-desc" style={{ fontSize: 11 }}>{group.description}</div>
        {group.basePrice != null && <span className="grp-pr" style={{ fontSize: 18 }}>{fmtPrice(group.basePrice)}</span>}
      </div>
      <div className="c2">
        {group.items.map(it => (
          <div key={it.id} style={{ marginBottom: 8, breakInside: 'avoid' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <span className="row-nm">{it.name}</span>
              {it.subtitle && <span className="row-sub">{it.subtitle}</span>}
            </div>
            {it.description && <div className="row-desc">{it.description}</div>}
          </div>
        ))}
      </div>
      <AddOnBox addOns={group.mods} label="Mods" />
      <AddOnBox addOns={group.addOns} label={group.addOnLabel || 'Sides'} />
    </PageWrap>
  );
}

function HeroesSection({ heroesGroup, style: s }: { heroesGroup: MenuGroup; style: StyleKey }) {
  return (
    <PageWrap style={s}>
      <SecHead title="Heroes" />
      <div className="c2">
        {heroesGroup.subGroups?.map(sub => <VGroup key={sub.id} g={sub} style={s} />)}
        {heroesGroup.items.map(it => (
          <div key={it.id} style={{ marginBottom: 6, breakInside: 'avoid' }}>
            <div className="row"><span className="row-nm">{it.name}</span>{it.subtitle && <span className="row-sub">{it.subtitle}</span>}<span className="row-dots" /><span className="row-pr">{fmtPrice(it.price)}</span></div>
            {it.description && <div className="row-desc">{it.description}</div>}
          </div>
        ))}
      </div>
      <AddOnBox addOns={heroesGroup.addOns} label={heroesGroup.addOnLabel} />
    </PageWrap>
  );
}

function SweetSection({ group, style: s }: { group: MenuGroup; style: StyleKey }) {
  return (
    <PageWrap style={s}>
      <SecHead title="Sweet Stuff" />
      {group.subGroups?.map(sub => <VGroup key={sub.id} g={sub} style={s} />)}
      <div className="c2">{group.items.map(it => <ItemRow key={it.id} name={it.name} desc={it.description} price={it.price} />)}</div>
    </PageWrap>
  );
}

function KidsSection({ group, style: s, mode: m }: { group: MenuGroup; style: StyleKey; mode: ModeKey }) {
  return (
    <PageWrap style={s}>
      <SecHead title="Kids Menu" desc={group.basePrice ? `All items ${fmtPrice(group.basePrice)} · Includes drink and side.` : undefined} />
      {group.basePrice != null && (
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <span className="grp-pr" style={{ fontSize: 28 }}>{fmtPrice(group.basePrice)}</span>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center', marginBottom: 12 }}>
        {group.items.map(it => (
          <div key={it.id} style={{ borderRadius: 8, padding: '10px 4px', border: m === 'dark' ? (s === 'americana' ? '1px solid #bf1b1b33' : s === 'editorial' ? '2px solid #444' : '1.5px solid #3a4f7a') : (s === 'americana' ? '1px solid #1b2a4a33' : s === 'editorial' ? '2px solid #1a1a1a' : '1.5px solid #1b2a4a'), background: m === 'dark' ? (s === 'americana' ? '#bf1b1b08' : s === 'editorial' ? '#2a2a2a' : '#1e2d48') : (s === 'americana' ? '#f0f4fa' : s === 'editorial' ? '#fafafa' : '#faf7f0') }}>
            <div style={{ fontSize: 30, lineHeight: 1 }}>
              {it.name === 'Mac & Cheese' ? '🧀' : it.name === 'Corn Dog' ? '🌽' : it.name === 'Chicken Tenders' ? '🍗' : it.name === 'Burger' ? '🍔' : it.name === 'Grilled Cheese' ? '🧈' : '🌭'}
            </div>
            <div className="grp-nm" style={{ fontSize: 12, marginTop: 4 }}>{it.name}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {group.choices?.map(c => (
          <div key={c.label}>
            <div className="addons-lbl" style={{ marginBottom: 4 }}>{c.label}</div>
            <div className="pills">{c.options.map(o => <span key={o} className="pill">{o}</span>)}</div>
          </div>
        ))}
      </div>
      {group.addOns && <AddOnBox addOns={group.addOns} label={group.addOnLabel} />}
    </PageWrap>
  );
}

/* ============================================================
   COMBINED PAGE SECTIONS
   ============================================================ */
function DrinksSection({ group, style: s }: { group: MenuGroup; style: StyleKey }) {
  return (
    <PageWrap style={s}>
      <SecHead title="Drinks" />
      <div className="c2">{group.subGroups?.map(sub => <VGroup key={sub.id} g={sub} style={s} />)}</div>
      <AddOnBox addOns={group.addOns} label={group.addOnLabel} />
    </PageWrap>
  );
}

function ComboBurgersHeroes({ burgersGroup, heroesGroup, style: s }: { burgersGroup: MenuGroup; heroesGroup: MenuGroup; style: StyleKey }) {
  return (
    <PageWrap style={s}>
      {/* Burgers */}
      <SecHead title="Burgers" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <div className="grp-desc" style={{ fontSize: 10 }}>{burgersGroup.description}</div>
        {burgersGroup.basePrice != null && <span className="grp-pr" style={{ fontSize: 16 }}>{fmtPrice(burgersGroup.basePrice)}</span>}
      </div>
      <div className="c2">
        {burgersGroup.items.map(it => (
          <div key={it.id} style={{ marginBottom: 5, breakInside: 'avoid' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span className="row-nm" style={{ fontSize: 12 }}>{it.name}</span>
              {it.subtitle && <span className="row-sub" style={{ fontSize: 10 }}>{it.subtitle}</span>}
            </div>
            {it.description && <div className="row-desc" style={{ fontSize: 9, marginBottom: 4 }}>{it.description}</div>}
          </div>
        ))}
      </div>
      <AddOnBox addOns={burgersGroup.mods} label="Mods" />
      <AddOnBox addOns={burgersGroup.addOns} label={burgersGroup.addOnLabel || 'Sides'} />

      {/* Heroes */}
      <div style={{ marginTop: 14 }}>
        <SecHead title="Heroes" />
        <div className="c2">
          {heroesGroup.subGroups?.map(sub => <VGroup key={sub.id} g={sub} style={s} />)}
          {heroesGroup.items.map(it => (
            <div key={it.id} style={{ marginBottom: 4, breakInside: 'avoid' }}>
              <div className="row"><span className="row-nm" style={{ fontSize: 12 }}>{it.name}</span>{it.subtitle && <span className="row-sub" style={{ fontSize: 10 }}>{it.subtitle}</span>}<span className="row-dots" /><span className="row-pr" style={{ fontSize: 12 }}>{fmtPrice(it.price)}</span></div>
              {it.description && <div className="row-desc" style={{ fontSize: 9, marginBottom: 4 }}>{it.description}</div>}
            </div>
          ))}
        </div>
        <AddOnBox addOns={heroesGroup.addOns} label={heroesGroup.addOnLabel} />
      </div>
    </PageWrap>
  );
}

function ComboStartersSalads({ startersGroup, saladsGroup, style: s }: { startersGroup: MenuGroup; saladsGroup: MenuGroup; style: StyleKey }) {
  return (
    <PageWrap style={s}>
      {/* Starters */}
      <SecHead title="Starters" desc="Shareable favorites to kick things off." />
      <div className="c2">{startersGroup.subGroups?.map(sub => <VGroup key={sub.id} g={sub} style={s} />)}</div>

      {/* Salads */}
      <div style={{ marginTop: 14 }}>
        <SecHead title="Salads" />
        {saladsGroup.items.map(it => <ItemRow key={it.id} name={it.name} desc={it.description} price={it.price} />)}
        <AddOnBox addOns={saladsGroup.addOns} label={saladsGroup.addOnLabel} />
      </div>
    </PageWrap>
  );
}

function ComboSweetKids({ sweetGroup, kidsGroup, style: s, mode: m }: { sweetGroup: MenuGroup; kidsGroup: MenuGroup; style: StyleKey; mode: ModeKey }) {
  return (
    <PageWrap style={s}>
      {/* Sweet Stuff — half page */}
      <SecHead title="Sweet Stuff" />
      {sweetGroup.subGroups?.map(sub => <VGroup key={sub.id} g={sub} style={s} />)}
      <div className="c2">{sweetGroup.items.map(it => <ItemRow key={it.id} name={it.name} desc={it.description} price={it.price} />)}</div>

      {/* Divider */}
      <div style={{ marginTop: 18 }} />

      {/* Kids — half page */}
      <SecHead title="Kids Menu" desc={kidsGroup.basePrice ? `All items ${fmtPrice(kidsGroup.basePrice)} · Includes drink and side.` : undefined} />
      {kidsGroup.basePrice != null && (
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span className="grp-pr" style={{ fontSize: 24 }}>{fmtPrice(kidsGroup.basePrice)}</span>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, textAlign: 'center', marginBottom: 10 }}>
        {kidsGroup.items.map(it => (
          <div key={it.id} style={{ borderRadius: 8, padding: '8px 4px', border: m === 'dark' ? (s === 'americana' ? '1px solid #bf1b1b33' : s === 'editorial' ? '2px solid #444' : '1.5px solid #3a4f7a') : (s === 'americana' ? '1px solid #1b2a4a33' : s === 'editorial' ? '2px solid #1a1a1a' : '1.5px solid #1b2a4a'), background: m === 'dark' ? (s === 'americana' ? '#bf1b1b08' : s === 'editorial' ? '#2a2a2a' : '#1e2d48') : (s === 'americana' ? '#f0f4fa' : s === 'editorial' ? '#fafafa' : '#faf7f0') }}>
            <div style={{ fontSize: 26, lineHeight: 1 }}>
              {it.name === 'Mac & Cheese' ? '🧀' : it.name === 'Corn Dog' ? '🌽' : it.name === 'Chicken Tenders' ? '🍗' : it.name === 'Burger' ? '🍔' : it.name === 'Grilled Cheese' ? '🧈' : '🌭'}
            </div>
            <div className="grp-nm" style={{ fontSize: 11, marginTop: 3 }}>{it.name}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {kidsGroup.choices?.map(c => (
          <div key={c.label}>
            <div className="addons-lbl" style={{ marginBottom: 4 }}>{c.label}</div>
            <div className="pills">{c.options.map(o => <span key={o} className="pill">{o}</span>)}</div>
          </div>
        ))}
      </div>
      {kidsGroup.addOns && <AddOnBox addOns={kidsGroup.addOns} label={kidsGroup.addOnLabel} />}
    </PageWrap>
  );
}

/* ============================================================
   CSV EXPORT — flatten the menu into a spreadsheet that mirrors the
   app's Tab → Section → Item hierarchy. One row per item, plus one
   row per option / add-on beneath it. Tabs are the top-level menu
   groups; Sections are their sub-groups (blank when items sit
   directly under a tab, e.g. Salads, Kids).
   ============================================================ */
const CSV_HEADERS = ['Tab', 'Section', 'Item', 'Price', 'Description', 'Option Group', 'Option', 'Option Price'];
const EXPORT_FILE = 'american-heroes-brew-menu';

/** Emit rows for a group, recursing sub-groups deeper into the Section path. */
function groupToRows(g: MenuGroup, tab: string, section: string): string[][] {
  const rows: string[][] = [];

  g.items.forEach((item: MenuItem) => {
    const name = item.subtitle ? `${item.name} ${item.subtitle}` : item.name;
    rows.push([tab, section, name, String(item.price), item.description ?? '', '', '', '']);
  });

  // Variant groups list their options/upcharges at the group level.
  g.choices?.forEach((choice) => {
    choice.options.forEach((opt) => rows.push([tab, section, '', '', '', choice.label, opt, '']));
  });
  g.addOns?.forEach((a) => rows.push([tab, section, '', '', '', g.addOnLabel ?? 'Add-on', a.name, a.price]));
  g.mods?.forEach((m) => rows.push([tab, section, '', '', '', 'Mod', m.name, m.price]));

  g.subGroups?.forEach((sub) =>
    rows.push(...groupToRows(sub, tab, section ? `${section} / ${sub.name}` : sub.name)),
  );
  return rows;
}

/** Flatten the menu into header + body rows (each top-level group is a Tab). */
function menuRows(menus: Menu[]): string[][] {
  return (menus[0]?.groups ?? []).flatMap((g) => groupToRows(g, g.name, ''));
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}
function htmlEscape(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function rowsToCsv(rows: string[][]): string {
  return [CSV_HEADERS, ...rows].map((r) => r.map(csvEscape).join(',')).join('\r\n');
}
function rowsToHtmlTable(rows: string[][]): string {
  const th = CSV_HEADERS.map((h) => `<th>${htmlEscape(h)}</th>`).join('');
  const body = rows
    .map((r) => `<tr>${r.map((c) => `<td>${htmlEscape(c)}</td>`).join('')}</tr>`)
    .join('');
  return `<table border="1" cellspacing="0" cellpadding="4"><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table>`;
}
function rowsToHtmlDoc(rows: string[][]): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>American Heroes & Brew — Menu</title>
<style>body{font-family:system-ui,sans-serif;margin:24px}h1{font-size:20px}table{border-collapse:collapse;font-size:13px}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#1b2a4a;color:#fff}</style>
</head><body><h1>American Heroes &amp; Brew — Menu</h1>${rowsToHtmlTable(rows)}</body></html>`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
function triggerDownload(content: string, filename: string, mime: string) {
  downloadBlob(new Blob([content], { type: mime }), filename);
}

export default function PrintableMenuClient({ menus }: { menus: Menu[] }) {
  const [selected, setSelected] = useState<Set<SectionKey>>(new Set(SECTIONS.map(s => s.key)));
  const [style, setStyle] = useState<StyleKey>('americana');
  const [mode, setMode] = useState<ModeKey>('dark');
  const [dlOpen, setDlOpen] = useState(false);

  const groups = menus[0]?.groups || [];
  // Flatten tabs + sections so sections nested under a tab (e.g. Hero Burgers
  // inside Mains) are addressable; fall back to an empty group so a missing id
  // renders an empty page instead of crashing.
  const flatten = (gs: MenuGroup[]): MenuGroup[] => gs.flatMap(g => [g, ...flatten(g.subGroups ?? [])]);
  const allGroups = flatten(groups);
  const find = (id: string): MenuGroup => allGroups.find(g => g.id === id) ?? { id, name: '', items: [] };

  const toggle = (key: SectionKey) => setSelected(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const download = (fn: () => void) => () => { fn(); setDlOpen(false); };
  const DL_OPTIONS: { label: string; onClick: () => void }[] = [
    { label: 'CSV (.csv)', onClick: download(() => triggerDownload(`﻿${rowsToCsv(menuRows(menus))}`, `${EXPORT_FILE}.csv`, 'text/csv;charset=utf-8;')) },
    { label: 'Excel / Google Sheets (.xlsx)', onClick: download(() => downloadBlob(rowsToXlsxBlob(CSV_HEADERS, menuRows(menus)), `${EXPORT_FILE}.xlsx`)) },
    { label: 'HTML (.html)', onClick: download(() => triggerDownload(rowsToHtmlDoc(menuRows(menus)), `${EXPORT_FILE}.html`, 'text/html;charset=utf-8;')) },
    { label: 'Word / Google Doc (.docx)', onClick: download(() => downloadBlob(rowsToDocxBlob(CSV_HEADERS, menuRows(menus), 'American Heroes & Brew — Menu'), `${EXPORT_FILE}.docx`)) },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: getStyleCSS(style, mode) }} />
      <div className="no-print" style={{ position: 'sticky', top: 0, zIndex: 50, background: '#111827', color: '#fff', padding: '10px 16px', boxShadow: '0 4px 16px rgba(0,0,0,.4)', fontFamily: 'system-ui,sans-serif' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Print & Export Menus</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {STYLES.map(st => (
                <button key={st.key} onClick={() => setStyle(st.key)} style={{ padding: '5px 10px', borderRadius: 5, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', background: style === st.key ? '#f59e0b' : '#374151', color: style === st.key ? '#000' : '#9ca3af', transition: 'all .15s' }}>
                  {st.label}
                </button>
              ))}
              <span style={{ color: '#4b5563', margin: '0 2px' }}>|</span>
              {(['light', 'dark'] as ModeKey[]).map(mk => (
                <button key={mk} onClick={() => setMode(mk)} style={{ padding: '5px 10px', borderRadius: 5, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', background: mode === mk ? '#f59e0b' : '#374151', color: mode === mk ? '#000' : '#9ca3af', transition: 'all .15s' }}>
                  {mk === 'light' ? '☀️ Light' : '🌙 Dark'}
                </button>
              ))}
              <div style={{ position: 'relative', marginLeft: 4 }}>
                <button onClick={() => setDlOpen(o => !o)} title="Download the full menu (all tabs, sections, items, options & prices)" style={{ background: '#374151', color: '#fff', fontWeight: 700, padding: '6px 14px', borderRadius: 6, border: 'none', fontSize: 13, cursor: 'pointer' }}>⬇️ Download ▾</button>
                {dlOpen && (
                  <>
                    <div onClick={() => setDlOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
                    <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 61, background: '#1f2937', border: '1px solid #374151', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,.5)', minWidth: 230, overflow: 'hidden' }}>
                      {DL_OPTIONS.map(o => (
                        <button
                          key={o.label}
                          onClick={o.onClick}
                          onMouseOver={e => { e.currentTarget.style.background = '#374151'; }}
                          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px', background: 'transparent', border: 'none', color: '#e5e7eb', fontSize: 13, cursor: 'pointer' }}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button onClick={() => window.print()} style={{ background: '#f59e0b', color: '#000', fontWeight: 700, padding: '6px 18px', borderRadius: 6, border: 'none', fontSize: 13, cursor: 'pointer' }}>🖨️ Print</button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 12 }}>
            <button onClick={() => setSelected(new Set(SECTIONS.map(s => s.key)))} style={{ background: 'none', border: 'none', color: '#f59e0b', fontSize: 11, cursor: 'pointer', padding: 0 }}>All</button>
            <button onClick={() => setSelected(new Set())} style={{ background: 'none', border: 'none', color: '#f59e0b', fontSize: 11, cursor: 'pointer', padding: 0 }}>None</button>
            <span style={{ color: '#4b5563' }}>|</span>
            {SECTIONS.map(sec => (
              <label key={sec.key} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input type="checkbox" checked={selected.has(sec.key)} onChange={() => toggle(sec.key)} style={{ accentColor: '#f59e0b', width: 14, height: 14 }} />{sec.label}
              </label>
            ))}
          </div>
          <div style={{ fontSize: 10, color: '#6b7280', marginTop: 4 }}>{STYLES.find(st => st.key === style)?.desc}</div>
        </div>
      </div>
      <div style={{ minHeight: '100vh', padding: '20px 16px' }}>
        {selected.has('daily') && <DailySection style={style} />}
        {selected.has('starters') && <StartersSection group={find('starting')} style={style} />}
        {selected.has('salads') && <SaladsSection group={find('salads')} style={style} />}
        {selected.has('burgers') && <BurgersSection group={find('mains-hero-burgers')} style={style} />}
        {selected.has('heroes') && <HeroesSection heroesGroup={find('mains-hero-sandwiches')} style={style} />}
        {selected.has('sweet') && <SweetSection group={find('sweets')} style={style} />}
        {selected.has('drinks') && <DrinksSection group={find('drinks')} style={style} />}
        {selected.has('kids') && <KidsSection group={find('kids')} style={style} mode={mode} />}
        {selected.has('combo-burgers-heroes') && <ComboBurgersHeroes burgersGroup={find('mains-hero-burgers')} heroesGroup={find('mains-hero-sandwiches')} style={style} />}
        {selected.has('combo-starters-salads') && <ComboStartersSalads startersGroup={find('starting')} saladsGroup={find('salads')} style={style} />}
        {selected.has('combo-sweet-kids') && <ComboSweetKids sweetGroup={find('sweets')} kidsGroup={find('kids')} style={style} mode={mode} />}
        {selected.size === 0 && <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: 80, fontSize: 16 }}>Select sections above to preview &amp; print</div>}
      </div>
    </>
  );
}
