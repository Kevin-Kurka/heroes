'use client';

import { useState } from 'react';
import { Menu, MenuGroup } from '@/types';

/* ─── Types ─── */
type StyleKey = 'dark' | 'editorial' | 'heritage';
type ModeKey = 'light' | 'dark';
type SectionKey = 'daily' | 'starters' | 'salads' | 'burgers' | 'heroes' | 'sweet' | 'kids';

const STYLES: { key: StyleKey; label: string; desc: string }[] = [
  { key: 'dark', label: 'Dark & Gold', desc: 'Gold ornamental accents · elegant serif type · classic upscale' },
  { key: 'editorial', label: 'Bold Editorial', desc: 'Red accent banners · strong sans-serif · modern grid' },
  { key: 'heritage', label: 'Heritage', desc: 'Navy & red ink · vintage Americana ornaments · serif type' },
];

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: 'daily', label: 'Daily Lineup' },
  { key: 'starters', label: 'Starters' },
  { key: 'salads', label: 'Salads' },
  { key: 'burgers', label: 'Burgers' },
  { key: 'heroes', label: 'Heroes & Handhelds' },
  { key: 'sweet', label: 'Sweet Stuff' },
  { key: 'kids', label: 'Kids' },
];

const DAILY_SPECIALS = [
  { day: 'Monday', name: 'Monday Madness', price: '4', lines: ['Sliders · Pulled Pork, Beef', 'Beer · Select Drafts'] },
  { day: 'Tuesday', name: 'Taco Tuesday', price: '3', lines: ['Tacos · Carnitas, Carne Asada', 'Beer · Modelo, Ultra'] },
  { day: 'Wednesday', name: 'Wings Wednesday', price: '2', lines: ['Signature Wings each', 'Well Drinks off'] },
  { day: 'Thursday', name: 'Thirsty Thursday', price: '5', lines: ['Burgers off', 'Select Drafts each'] },
];

/* SVG ornaments */
const CORNER_TL = `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M5 55 Q5 5 55 5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10 55 Q10 10 55 10" fill="none" stroke="currentColor" stroke-width="0.8"/><circle cx="8" cy="8" r="2" fill="currentColor"/></svg>`;
const STAR5 = `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon points="10,1 12.5,7 19,7.5 14,12 15.5,19 10,15.5 4.5,19 6,12 1,7.5 7.5,7" fill="currentColor"/></svg>`;
const DIVIDER_LINE = `<svg viewBox="0 0 200 12" xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="6" x2="80" y2="6" stroke="currentColor" stroke-width="0.8"/><polygon points="100,1 103,6 100,11 97,6" fill="currentColor"/><line x1="120" y1="6" x2="200" y2="6" stroke="currentColor" stroke-width="0.8"/></svg>`;

/* ============================================================
   STYLE CSS — each style has light + dark palettes
   Geist font (site font) used for Dark & Gold + Heritage
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
    .c2{columns:2;column-gap:28px}.c2>*{break-inside:avoid}
  `;

  /* ── Dark & Gold ── */
  if (s === 'dark' && m === 'dark') return shared + `
    html,body{background:#1a1a2e!important}
    .pg{background:#0f1628;color:#e8dcc8;padding:18mm 20mm;position:relative;overflow:hidden;border:1px solid #2a3050}
    .pg-corner{position:absolute;color:#c9a84c;width:50px;height:50px}
    .pg-corner.tl{top:6mm;left:6mm}.pg-corner.tr{top:6mm;right:6mm;transform:scaleX(-1)}
    .pg-corner.bl{bottom:6mm;left:6mm;transform:scaleY(-1)}.pg-corner.br{bottom:6mm;right:6mm;transform:scale(-1)}
    .pg-inner{border:1px solid #c9a84c33;padding:6mm;min-height:calc(297mm - 32mm)}
    .logo{font-family:${G};font-weight:800;font-size:28px;text-align:center;color:#c9a84c;letter-spacing:4px;text-transform:uppercase}
    .tagline{font-family:${G};font-weight:300;font-size:9px;text-align:center;color:#c9a84c99;letter-spacing:6px;text-transform:uppercase;margin-top:3px}
    .divider{text-align:center;color:#c9a84c;margin:10px 0;width:140px;display:block;margin-left:auto;margin-right:auto}
    .sec{font-family:${G};font-size:24px;font-weight:700;color:#c9a84c;text-align:center;letter-spacing:4px;text-transform:uppercase;margin-bottom:6px}
    .sec-sub{font-family:${G};font-size:10px;text-align:center;color:#e8dcc880;font-weight:300;letter-spacing:2px;margin-bottom:16px}
    .grp{margin-bottom:16px}
    .grp-head{display:flex;align-items:baseline;justify-content:space-between;border-bottom:1px solid #c9a84c33;padding-bottom:4px;margin-bottom:5px}
    .grp-nm{font-family:${G};font-weight:700;font-size:16px;color:#e8dcc8}
    .grp-pr{font-family:${G};font-weight:600;font-size:16px;color:#c9a84c}
    .grp-desc{font-family:${G};font-size:11px;color:#e8dcc899;font-weight:300;line-height:1.5;margin-bottom:4px}
    .pills{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0}
    .pill{font-size:10px;border:1px solid #c9a84c44;border-radius:3px;padding:2px 8px;color:#e8dcc8cc;background:#c9a84c0a;font-family:${G}}
    .row{display:flex;align-items:baseline;margin-bottom:6px}
    .row-nm{font-family:${G};font-weight:600;font-size:14px;color:#e8dcc8;white-space:nowrap}
    .row-sub{font-family:${G};font-style:italic;font-size:11px;color:#c9a84c;margin-left:6px}
    .row-dots{flex:1;border-bottom:1px dotted #c9a84c44;margin:0 8px;min-width:10px;position:relative;top:-2px}
    .row-pr{font-family:${G};font-weight:600;font-size:14px;color:#c9a84c;white-space:nowrap}
    .row-desc{font-family:${G};font-size:10px;color:#e8dcc866;font-weight:300;margin:-2px 0 6px;line-height:1.4}
    .addons{border:1px solid #c9a84c33;border-radius:6px;padding:8px 12px;margin-top:10px;background:#c9a84c08}
    .addons-lbl{font-family:${G};font-size:8px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#c9a84c;margin-bottom:4px}
    .addon{display:inline-block;font-size:10px;margin-right:12px;color:#e8dcc8aa;font-family:${G}}
    .addon strong{color:#c9a84c}
    .ch-row{font-family:${G};font-size:10px;color:#e8dcc899;margin:2px 0}
    .ch-lbl{font-weight:600;text-transform:uppercase;font-size:8px;letter-spacing:1.5px;color:#c9a84c88}
    .ft{text-align:center;font-family:${G};font-size:8px;color:#e8dcc844;letter-spacing:2px;margin-top:auto;padding-top:12px}
    .daily-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}
    .d-card{border:1px solid #c9a84c44;border-radius:6px;padding:14px;background:#c9a84c06}
    .d-nm{font-family:${G};font-size:18px;font-weight:700;color:#e8dcc8}
    .d-pr{font-family:${G};font-size:28px;font-weight:800;color:#c9a84c}
    .d-day{font-family:${G};font-size:9px;text-transform:uppercase;letter-spacing:3px;color:#c9a84c88;font-weight:300}
    .d-line{font-size:12px;color:#e8dcc8aa;font-family:${G}}
    .sub-hd{font-family:${G};font-size:15px;font-weight:700;color:#c9a84c;border-bottom:1px solid #c9a84c33;padding-bottom:3px;margin:10px 0 6px}
    @media print{html,body{background:#0f1628!important}.pg{background:#0f1628!important;border:none;padding:14mm 16mm}}
  `;

  if (s === 'dark' && m === 'light') return shared + `
    html,body{background:#e8e0d0!important}
    .pg{background:#faf6ee;color:#2a1f14;padding:18mm 20mm;position:relative;overflow:hidden;border:1px solid #d4c9b0}
    .pg-corner{position:absolute;color:#8b6914;width:50px;height:50px}
    .pg-corner.tl{top:6mm;left:6mm}.pg-corner.tr{top:6mm;right:6mm;transform:scaleX(-1)}
    .pg-corner.bl{bottom:6mm;left:6mm;transform:scaleY(-1)}.pg-corner.br{bottom:6mm;right:6mm;transform:scale(-1)}
    .pg-inner{border:1px solid #8b691433;padding:6mm;min-height:calc(297mm - 32mm)}
    .logo{font-family:${G};font-weight:800;font-size:28px;text-align:center;color:#8b6914;letter-spacing:4px;text-transform:uppercase}
    .tagline{font-family:${G};font-weight:300;font-size:9px;text-align:center;color:#8b691488;letter-spacing:6px;text-transform:uppercase;margin-top:3px}
    .divider{text-align:center;color:#8b6914;margin:10px 0;width:140px;display:block;margin-left:auto;margin-right:auto}
    .sec{font-family:${G};font-size:24px;font-weight:700;color:#8b6914;text-align:center;letter-spacing:4px;text-transform:uppercase;margin-bottom:6px}
    .sec-sub{font-family:${G};font-size:10px;text-align:center;color:#6b5a3d;font-weight:300;letter-spacing:2px;margin-bottom:16px}
    .grp{margin-bottom:16px}
    .grp-head{display:flex;align-items:baseline;justify-content:space-between;border-bottom:1px solid #8b691433;padding-bottom:4px;margin-bottom:5px}
    .grp-nm{font-family:${G};font-weight:700;font-size:16px;color:#2a1f14}
    .grp-pr{font-family:${G};font-weight:600;font-size:16px;color:#8b6914}
    .grp-desc{font-family:${G};font-size:11px;color:#6b5a3d;font-weight:300;line-height:1.5;margin-bottom:4px}
    .pills{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0}
    .pill{font-size:10px;border:1px solid #8b691433;border-radius:3px;padding:2px 8px;color:#2a1f14cc;background:#8b69140a;font-family:${G}}
    .row{display:flex;align-items:baseline;margin-bottom:6px}
    .row-nm{font-family:${G};font-weight:600;font-size:14px;color:#2a1f14;white-space:nowrap}
    .row-sub{font-family:${G};font-style:italic;font-size:11px;color:#8b6914;margin-left:6px}
    .row-dots{flex:1;border-bottom:1px dotted #8b691444;margin:0 8px;min-width:10px;position:relative;top:-2px}
    .row-pr{font-family:${G};font-weight:600;font-size:14px;color:#8b6914;white-space:nowrap}
    .row-desc{font-family:${G};font-size:10px;color:#6b5a3d99;font-weight:300;margin:-2px 0 6px;line-height:1.4}
    .addons{border:1px solid #8b691433;border-radius:6px;padding:8px 12px;margin-top:10px;background:#8b69140a}
    .addons-lbl{font-family:${G};font-size:8px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#8b6914;margin-bottom:4px}
    .addon{display:inline-block;font-size:10px;margin-right:12px;color:#2a1f14aa;font-family:${G}}
    .addon strong{color:#8b6914}
    .ch-row{font-family:${G};font-size:10px;color:#6b5a3d;margin:2px 0}
    .ch-lbl{font-weight:600;text-transform:uppercase;font-size:8px;letter-spacing:1.5px;color:#8b691488}
    .ft{text-align:center;font-family:${G};font-size:8px;color:#2a1f1444;letter-spacing:2px;margin-top:auto;padding-top:12px}
    .daily-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}
    .d-card{border:1px solid #8b691433;border-radius:6px;padding:14px;background:#f0e8d4}
    .d-nm{font-family:${G};font-size:18px;font-weight:700;color:#2a1f14}
    .d-pr{font-family:${G};font-size:28px;font-weight:800;color:#8b6914}
    .d-day{font-family:${G};font-size:9px;text-transform:uppercase;letter-spacing:3px;color:#8b691488;font-weight:300}
    .d-line{font-size:12px;color:#2a1f14aa;font-family:${G}}
    .sub-hd{font-family:${G};font-size:15px;font-weight:700;color:#8b6914;border-bottom:1px solid #8b691433;padding-bottom:3px;margin:10px 0 6px}
    @media print{html,body{background:#faf6ee!important}.pg{background:#faf6ee!important;border-color:#d4c9b0!important;padding:14mm 16mm}}
  `;

  /* ── Bold Editorial ── */
  if (s === 'editorial' && m === 'light') return shared + `
    html,body{background:#e5e7eb!important}
    .pg{background:#fff;color:#1a1a1a;padding:0;position:relative;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.1)}
    .pg-banner{background:#bf1b1b;padding:14mm 20mm 10mm;color:#fff;position:relative}
    .pg-banner::after{content:'';position:absolute;bottom:-12px;left:0;right:0;height:12px;background:linear-gradient(to bottom right,#bf1b1b 50%,transparent 50%)}
    .pg-body{padding:16px 20mm 16mm}
    .logo{font-family:'Oswald',sans-serif;font-weight:700;font-size:32px;text-transform:uppercase;letter-spacing:6px;color:#fff}
    .tagline{font-family:${G};font-weight:400;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#ffffff99;margin-top:3px}
    .divider{display:none}
    .sec{font-family:'Oswald',sans-serif;font-size:24px;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:#1a1a1a;text-align:left;margin-bottom:3px;padding-bottom:5px;border-bottom:3px solid #bf1b1b;display:inline-block}
    .sec-sub{font-family:${G};font-size:10px;text-align:left;color:#666;font-weight:400;letter-spacing:1px;margin-bottom:12px}
    .grp{margin-bottom:14px;border-left:3px solid #bf1b1b;padding-left:12px}
    .grp-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:3px}
    .grp-nm{font-family:'Oswald',sans-serif;font-weight:600;font-size:16px;text-transform:uppercase;letter-spacing:1px;color:#1a1a1a}
    .grp-pr{font-family:'Oswald',sans-serif;font-weight:700;font-size:17px;color:#bf1b1b}
    .grp-desc{font-family:${G};font-size:11px;color:#555;font-weight:400;line-height:1.5;margin-bottom:4px}
    .pills{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0}
    .pill{font-size:10px;border:1px solid #e5e7eb;border-radius:2px;padding:2px 8px;color:#333;background:#f9fafb;font-family:${G}}
    .row{display:flex;align-items:baseline;margin-bottom:6px}
    .row-nm{font-family:'Oswald',sans-serif;font-weight:500;font-size:14px;text-transform:uppercase;letter-spacing:.5px;color:#1a1a1a;white-space:nowrap}
    .row-sub{font-family:${G};font-size:11px;color:#bf1b1b;font-weight:500;margin-left:6px;font-style:normal}
    .row-dots{flex:1;margin:0 8px;min-width:10px}
    .row-pr{font-family:'Oswald',sans-serif;font-weight:600;font-size:14px;color:#bf1b1b;white-space:nowrap}
    .row-desc{font-family:${G};font-size:10px;color:#777;font-weight:400;margin:-2px 0 6px;line-height:1.4}
    .addons{border-top:2px solid #bf1b1b;padding-top:8px;margin-top:10px}
    .addons-lbl{font-family:'Oswald',sans-serif;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#bf1b1b;margin-bottom:4px}
    .addon{display:inline-block;font-size:10px;margin-right:12px;color:#555;font-family:${G}}
    .addon strong{color:#bf1b1b;font-weight:600}
    .ch-row{font-family:${G};font-size:10px;color:#666;margin:2px 0}
    .ch-lbl{font-weight:600;text-transform:uppercase;font-size:8px;letter-spacing:1.5px;color:#bf1b1b}
    .ft{text-align:center;font-family:${G};font-size:8px;color:#aaa;letter-spacing:2px;margin-top:auto;padding-top:12px}
    .daily-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}
    .d-card{border:2px solid #1a1a1a;border-radius:0;padding:14px;position:relative}
    .d-card::before{content:'';position:absolute;top:0;left:0;width:4px;height:100%;background:#bf1b1b}
    .d-nm{font-family:'Oswald',sans-serif;font-size:18px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#1a1a1a;margin-left:6px}
    .d-pr{font-family:'Oswald',sans-serif;font-size:30px;font-weight:700;color:#bf1b1b}
    .d-day{font-family:${G};font-size:9px;text-transform:uppercase;letter-spacing:3px;color:#888;font-weight:500;margin-left:6px}
    .d-line{font-size:12px;color:#555;margin-left:6px;font-family:${G}}
    .sub-hd{font-family:'Oswald',sans-serif;font-size:16px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#1a1a1a;border-bottom:2px solid #bf1b1b;padding-bottom:3px;margin:10px 0 6px;display:inline-block}
    @media print{html,body{background:#fff!important}.pg{box-shadow:none;padding:0}.pg-banner{padding:10mm 16mm 8mm}.pg-body{padding:12px 16mm 12mm}}
  `;

  if (s === 'editorial' && m === 'dark') return shared + `
    html,body{background:#111!important}
    .pg{background:#1a1a1a;color:#e5e5e5;padding:0;position:relative;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.3)}
    .pg-banner{background:#bf1b1b;padding:14mm 20mm 10mm;color:#fff;position:relative}
    .pg-banner::after{content:'';position:absolute;bottom:-12px;left:0;right:0;height:12px;background:linear-gradient(to bottom right,#bf1b1b 50%,transparent 50%)}
    .pg-body{padding:16px 20mm 16mm}
    .logo{font-family:'Oswald',sans-serif;font-weight:700;font-size:32px;text-transform:uppercase;letter-spacing:6px;color:#fff}
    .tagline{font-family:${G};font-weight:400;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#ffffff99;margin-top:3px}
    .divider{display:none}
    .sec{font-family:'Oswald',sans-serif;font-size:24px;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:#e5e5e5;text-align:left;margin-bottom:3px;padding-bottom:5px;border-bottom:3px solid #bf1b1b;display:inline-block}
    .sec-sub{font-family:${G};font-size:10px;text-align:left;color:#999;font-weight:400;letter-spacing:1px;margin-bottom:12px}
    .grp{margin-bottom:14px;border-left:3px solid #bf1b1b;padding-left:12px}
    .grp-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:3px}
    .grp-nm{font-family:'Oswald',sans-serif;font-weight:600;font-size:16px;text-transform:uppercase;letter-spacing:1px;color:#e5e5e5}
    .grp-pr{font-family:'Oswald',sans-serif;font-weight:700;font-size:17px;color:#e74c4c}
    .grp-desc{font-family:${G};font-size:11px;color:#aaa;font-weight:400;line-height:1.5;margin-bottom:4px}
    .pills{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0}
    .pill{font-size:10px;border:1px solid #444;border-radius:2px;padding:2px 8px;color:#ddd;background:#2a2a2a;font-family:${G}}
    .row{display:flex;align-items:baseline;margin-bottom:6px}
    .row-nm{font-family:'Oswald',sans-serif;font-weight:500;font-size:14px;text-transform:uppercase;letter-spacing:.5px;color:#e5e5e5;white-space:nowrap}
    .row-sub{font-family:${G};font-size:11px;color:#e74c4c;font-weight:500;margin-left:6px;font-style:normal}
    .row-dots{flex:1;margin:0 8px;min-width:10px;border-bottom:1px dotted #444}
    .row-pr{font-family:'Oswald',sans-serif;font-weight:600;font-size:14px;color:#e74c4c;white-space:nowrap}
    .row-desc{font-family:${G};font-size:10px;color:#888;font-weight:400;margin:-2px 0 6px;line-height:1.4}
    .addons{border-top:2px solid #bf1b1b;padding-top:8px;margin-top:10px}
    .addons-lbl{font-family:'Oswald',sans-serif;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#e74c4c;margin-bottom:4px}
    .addon{display:inline-block;font-size:10px;margin-right:12px;color:#aaa;font-family:${G}}
    .addon strong{color:#e74c4c;font-weight:600}
    .ch-row{font-family:${G};font-size:10px;color:#999;margin:2px 0}
    .ch-lbl{font-weight:600;text-transform:uppercase;font-size:8px;letter-spacing:1.5px;color:#e74c4c}
    .ft{text-align:center;font-family:${G};font-size:8px;color:#555;letter-spacing:2px;margin-top:auto;padding-top:12px}
    .daily-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}
    .d-card{border:2px solid #444;border-radius:0;padding:14px;position:relative}
    .d-card::before{content:'';position:absolute;top:0;left:0;width:4px;height:100%;background:#bf1b1b}
    .d-nm{font-family:'Oswald',sans-serif;font-size:18px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#e5e5e5;margin-left:6px}
    .d-pr{font-family:'Oswald',sans-serif;font-size:30px;font-weight:700;color:#e74c4c}
    .d-day{font-family:${G};font-size:9px;text-transform:uppercase;letter-spacing:3px;color:#777;font-weight:500;margin-left:6px}
    .d-line{font-size:12px;color:#aaa;margin-left:6px;font-family:${G}}
    .sub-hd{font-family:'Oswald',sans-serif;font-size:16px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#e5e5e5;border-bottom:2px solid #bf1b1b;padding-bottom:3px;margin:10px 0 6px;display:inline-block}
    @media print{html,body{background:#1a1a1a!important}.pg{background:#1a1a1a!important;box-shadow:none;padding:0}.pg-banner{padding:10mm 16mm 8mm}.pg-body{padding:12px 16mm 12mm}}
  `;

  /* ── Heritage ── */
  if (s === 'heritage' && m === 'light') return shared + `
    html,body{background:#c5b9a8!important}
    .pg{background:#f5f0e6;color:#1b2a4a;padding:18mm 20mm;position:relative;overflow:hidden;border:3px solid #1b2a4a;box-shadow:0 2px 12px rgba(0,0,0,.15)}
    .pg::before{content:'';position:absolute;top:4px;left:4px;right:4px;bottom:4px;border:1.5px solid #bf2a2a;pointer-events:none}
    .pg::after{content:'';position:absolute;top:8px;left:8px;right:8px;bottom:8px;border:0.5px solid #1b2a4a44;pointer-events:none}
    .logo{font-family:${G};font-weight:800;font-size:26px;text-align:center;color:#1b2a4a;letter-spacing:3px;text-transform:uppercase}
    .tagline{font-family:${G};font-weight:300;font-style:italic;font-size:10px;text-align:center;color:#5a6b8a;letter-spacing:2px;margin-top:2px}
    .stars-row{text-align:center;color:#bf2a2a;font-size:10px;letter-spacing:6px;margin:5px 0}
    .divider{text-align:center;color:#1b2a4a;margin:8px auto;width:120px;display:block}
    .sec{font-family:${G};font-size:24px;font-weight:800;color:#1b2a4a;text-align:center;letter-spacing:3px;text-transform:uppercase;margin-bottom:4px}
    .sec-rule{height:3px;background:linear-gradient(90deg,transparent,#bf2a2a,#1b2a4a,#bf2a2a,transparent);margin:0 auto 12px;width:60%;border-radius:2px}
    .sec-sub{font-family:${G};font-style:italic;font-size:10px;text-align:center;color:#5a6b8a;margin-bottom:12px}
    .grp{margin-bottom:16px}
    .grp-head{display:flex;align-items:baseline;justify-content:space-between;border-bottom:1.5px solid #1b2a4a22;padding-bottom:3px;margin-bottom:5px}
    .grp-nm{font-family:${G};font-weight:700;font-size:16px;color:#1b2a4a}
    .grp-pr{font-family:${G};font-weight:700;font-size:16px;color:#bf2a2a}
    .grp-desc{font-family:${G};font-size:11px;color:#5a6b8a;font-weight:400;line-height:1.5;margin-bottom:4px}
    .pills{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0}
    .pill{font-size:10px;border:1px solid #1b2a4a33;border-radius:3px;padding:2px 8px;color:#1b2a4a;background:#e8e0d0;font-family:${G}}
    .row{display:flex;align-items:baseline;margin-bottom:6px}
    .row-nm{font-family:${G};font-weight:700;font-size:14px;color:#1b2a4a;white-space:nowrap}
    .row-sub{font-family:${G};font-style:italic;font-size:11px;color:#bf2a2a;margin-left:6px}
    .row-dots{flex:1;border-bottom:1px dashed #1b2a4a33;margin:0 8px;min-width:10px;position:relative;top:-2px}
    .row-pr{font-family:${G};font-weight:700;font-size:14px;color:#bf2a2a;white-space:nowrap}
    .row-desc{font-family:${G};font-size:10px;color:#5a6b8a;font-weight:400;margin:-2px 0 6px;line-height:1.4}
    .addons{border:1.5px solid #1b2a4a33;border-radius:6px;padding:8px 12px;margin-top:10px;background:#e8e0d0}
    .addons-lbl{font-family:${G};font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#bf2a2a;margin-bottom:4px}
    .addon{display:inline-block;font-size:10px;margin-right:12px;color:#1b2a4a;font-family:${G}}
    .addon strong{color:#bf2a2a}
    .ch-row{font-family:${G};font-size:10px;color:#5a6b8a;margin:2px 0}
    .ch-lbl{font-weight:700;text-transform:uppercase;font-size:8px;letter-spacing:1.5px;color:#bf2a2a}
    .ft{text-align:center;font-family:${G};font-style:italic;font-size:8px;color:#1b2a4a66;letter-spacing:1px;margin-top:auto;padding-top:12px}
    .daily-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}
    .d-card{border:2px solid #1b2a4a;border-radius:6px;padding:14px;background:#faf7f0}
    .d-nm{font-family:${G};font-size:18px;font-weight:700;color:#1b2a4a}
    .d-pr{font-family:${G};font-size:28px;font-weight:800;color:#bf2a2a}
    .d-day{font-family:${G};font-style:italic;font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#5a6b8a}
    .d-line{font-size:12px;color:#3a4a6a;font-family:${G}}
    .sub-hd{font-family:${G};font-size:15px;font-weight:700;color:#1b2a4a;margin:10px 0 4px}
    .sub-rule{height:2px;width:50px;background:#bf2a2a;margin-bottom:6px}
    @media print{html,body{background:#f5f0e6!important}.pg{box-shadow:none;border-color:#1b2a4a!important;padding:14mm 16mm}.pg::before{border-color:#bf2a2a!important}}
  `;

  /* heritage dark */
  return shared + `
    html,body{background:#0e1525!important}
    .pg{background:#162033;color:#d4cfc4;padding:18mm 20mm;position:relative;overflow:hidden;border:3px solid #3a4f7a;box-shadow:0 2px 12px rgba(0,0,0,.3)}
    .pg::before{content:'';position:absolute;top:4px;left:4px;right:4px;bottom:4px;border:1.5px solid #bf2a2a;pointer-events:none}
    .pg::after{content:'';position:absolute;top:8px;left:8px;right:8px;bottom:8px;border:0.5px solid #3a4f7a44;pointer-events:none}
    .logo{font-family:${G};font-weight:800;font-size:26px;text-align:center;color:#d4cfc4;letter-spacing:3px;text-transform:uppercase}
    .tagline{font-family:${G};font-weight:300;font-style:italic;font-size:10px;text-align:center;color:#8899bb;letter-spacing:2px;margin-top:2px}
    .stars-row{text-align:center;color:#e04040;font-size:10px;letter-spacing:6px;margin:5px 0}
    .divider{text-align:center;color:#8899bb;margin:8px auto;width:120px;display:block}
    .sec{font-family:${G};font-size:24px;font-weight:800;color:#d4cfc4;text-align:center;letter-spacing:3px;text-transform:uppercase;margin-bottom:4px}
    .sec-rule{height:3px;background:linear-gradient(90deg,transparent,#e04040,#6080bb,#e04040,transparent);margin:0 auto 12px;width:60%;border-radius:2px}
    .sec-sub{font-family:${G};font-style:italic;font-size:10px;text-align:center;color:#8899bb;margin-bottom:12px}
    .grp{margin-bottom:16px}
    .grp-head{display:flex;align-items:baseline;justify-content:space-between;border-bottom:1.5px solid #3a4f7a44;padding-bottom:3px;margin-bottom:5px}
    .grp-nm{font-family:${G};font-weight:700;font-size:16px;color:#d4cfc4}
    .grp-pr{font-family:${G};font-weight:700;font-size:16px;color:#e04040}
    .grp-desc{font-family:${G};font-size:11px;color:#8899bb;font-weight:400;line-height:1.5;margin-bottom:4px}
    .pills{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0}
    .pill{font-size:10px;border:1px solid #3a4f7a55;border-radius:3px;padding:2px 8px;color:#d4cfc4cc;background:#3a4f7a18;font-family:${G}}
    .row{display:flex;align-items:baseline;margin-bottom:6px}
    .row-nm{font-family:${G};font-weight:700;font-size:14px;color:#d4cfc4;white-space:nowrap}
    .row-sub{font-family:${G};font-style:italic;font-size:11px;color:#e04040;margin-left:6px}
    .row-dots{flex:1;border-bottom:1px dashed #3a4f7a44;margin:0 8px;min-width:10px;position:relative;top:-2px}
    .row-pr{font-family:${G};font-weight:700;font-size:14px;color:#e04040;white-space:nowrap}
    .row-desc{font-family:${G};font-size:10px;color:#8899bb99;font-weight:400;margin:-2px 0 6px;line-height:1.4}
    .addons{border:1.5px solid #3a4f7a44;border-radius:6px;padding:8px 12px;margin-top:10px;background:#3a4f7a18}
    .addons-lbl{font-family:${G};font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#e04040;margin-bottom:4px}
    .addon{display:inline-block;font-size:10px;margin-right:12px;color:#d4cfc4aa;font-family:${G}}
    .addon strong{color:#e04040}
    .ch-row{font-family:${G};font-size:10px;color:#8899bb;margin:2px 0}
    .ch-lbl{font-weight:700;text-transform:uppercase;font-size:8px;letter-spacing:1.5px;color:#e04040}
    .ft{text-align:center;font-family:${G};font-style:italic;font-size:8px;color:#d4cfc444;letter-spacing:1px;margin-top:auto;padding-top:12px}
    .daily-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}
    .d-card{border:2px solid #3a4f7a;border-radius:6px;padding:14px;background:#1e2d48}
    .d-nm{font-family:${G};font-size:18px;font-weight:700;color:#d4cfc4}
    .d-pr{font-family:${G};font-size:28px;font-weight:800;color:#e04040}
    .d-day{font-family:${G};font-style:italic;font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#8899bb}
    .d-line{font-size:12px;color:#a0b0cc;font-family:${G}}
    .sub-hd{font-family:${G};font-size:15px;font-weight:700;color:#d4cfc4;margin:10px 0 4px}
    .sub-rule{height:2px;width:50px;background:#e04040;margin-bottom:6px}
    @media print{html,body{background:#162033!important}.pg{box-shadow:none;border-color:#3a4f7a!important;padding:14mm 16mm}.pg::before{border-color:#bf2a2a!important}}
  `;
}

/* ============================================================
   SHARED RENDERERS
   ============================================================ */
function fmtPrice(p: number) { return `${p}`; }

function Orn({ type, style: s }: { type: 'corner-tl' | 'corner-tr' | 'corner-bl' | 'corner-br' | 'divider' | 'star'; style: StyleKey; mode?: ModeKey }) {
  if (s === 'editorial') return null;
  if (type === 'divider') return <div className="divider" dangerouslySetInnerHTML={{ __html: DIVIDER_LINE }} />;
  if (type.startsWith('corner')) {
    if (s !== 'dark') return null;
    const cls = type.replace('corner-', '');
    return <div className={`pg-corner ${cls}`} dangerouslySetInnerHTML={{ __html: CORNER_TL }} />;
  }
  return null;
}

function Header({ style: s }: { style: StyleKey }) {
  if (s === 'editorial') return (
    <div className="pg-banner">
      <div className="logo">American Heroes &amp; Brew</div>
      <div className="tagline">300 Carlsbad Village Dr, Suite 101 · Carlsbad, CA · (760) 994-0187</div>
    </div>
  );
  const inner = <>
    {s === 'heritage' && <div className="stars-row">★ ★ ★ ★ ★</div>}
    <div className="logo">American Heroes &amp; Brew</div>
    <div className="tagline">{s === 'heritage' ? 'Carlsbad, California · Est. 2024' : '300 Carlsbad Village Dr · Carlsbad CA · (760) 994-0187'}</div>
    <Orn type="divider" style={s} />
  </>;
  return <div style={{ marginBottom: 8 }}>{inner}</div>;
}

function SecHead({ title, desc, style: s }: { title: string; desc?: string; style: StyleKey }) {
  return <>
    <div className="sec">{title}</div>
    {s === 'heritage' && <div className="sec-rule" />}
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
  return <div className="ft">American Heroes &amp; Brew · 300 Carlsbad Village Dr, Suite 101, Carlsbad CA 92008 · (760) 994-0187</div>;
}

function PageWrap({ style: s, children }: { style: StyleKey; children: React.ReactNode }) {
  if (s === 'editorial') return (
    <div className="pg">
      <Header style={s} />
      <div className="pg-body">{children}<Footer /></div>
    </div>
  );
  return (
    <div className="pg">
      {s === 'dark' && <><Orn type="corner-tl" style={s} /><Orn type="corner-tr" style={s} /><Orn type="corner-bl" style={s} /><Orn type="corner-br" style={s} /></>}
      {s === 'dark' ? <div className="pg-inner"><Header style={s} />{children}<Footer /></div> : <><Header style={s} />{children}<Footer /></>}
    </div>
  );
}

/* ============================================================
   SECTIONS
   ============================================================ */
function DailySection({ style: s }: { style: StyleKey }) {
  return (
    <PageWrap style={s}>
      <SecHead title="Daily Lineup" desc="Specials available all day, every day." style={s} />
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
      <SecHead title="Starters" desc="Shareable favorites to kick things off." style={s} />
      <div className="c2">{group.subGroups?.map(sub => <VGroup key={sub.id} g={sub} style={s} />)}</div>
    </PageWrap>
  );
}

function SaladsSection({ group, style: s }: { group: MenuGroup; style: StyleKey }) {
  return (
    <PageWrap style={s}>
      <SecHead title="Salads" style={s} />
      {group.items.map(it => <ItemRow key={it.id} name={it.name} desc={it.description} price={it.price} />)}
      <AddOnBox addOns={group.addOns} label={group.addOnLabel} />
    </PageWrap>
  );
}

function BurgersSection({ group, style: s }: { group: MenuGroup; style: StyleKey }) {
  return (
    <PageWrap style={s}>
      <SecHead title="Burgers" style={s} />
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

function HeroesSection({ heroesGroup, handheldsGroup, style: s }: { heroesGroup: MenuGroup; handheldsGroup: MenuGroup; style: StyleKey }) {
  return (
    <PageWrap style={s}>
      <SecHead title="Heroes & Handhelds" style={s} />
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
      <Orn type="divider" style={s} />
      {s === 'editorial' ? <div className="sub-hd">Handhelds</div> : s === 'heritage' ? <><div className="sub-hd">Handhelds</div><div className="sub-rule" /></> : <div className="sub-hd">Handhelds</div>}
      <div className="c2">{handheldsGroup.subGroups?.map(sub => <VGroup key={sub.id} g={sub} style={s} />)}</div>
      <AddOnBox addOns={handheldsGroup.addOns} label={handheldsGroup.addOnLabel} />
    </PageWrap>
  );
}

function SweetSection({ group, style: s }: { group: MenuGroup; style: StyleKey }) {
  return (
    <PageWrap style={s}>
      <SecHead title="Sweet Stuff" style={s} />
      <div className="c2">{group.items.map(it => <ItemRow key={it.id} name={it.name} desc={it.description} price={it.price} />)}</div>
    </PageWrap>
  );
}

function KidsSection({ group, style: s, mode: m }: { group: MenuGroup; style: StyleKey; mode: ModeKey }) {
  return (
    <PageWrap style={s}>
      <SecHead title="Kids Menu" desc={group.basePrice ? `All items ${fmtPrice(group.basePrice)} · Includes drink and side.` : undefined} style={s} />
      {group.basePrice != null && (
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <span className="grp-pr" style={{ fontSize: 28 }}>{fmtPrice(group.basePrice)}</span>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, textAlign: 'center', marginBottom: 12 }}>
        {group.items.map(it => (
          <div key={it.id} style={{ borderRadius: 8, padding: '10px 4px', border: m === 'dark' ? (s === 'dark' ? '1px solid #c9a84c33' : s === 'editorial' ? '2px solid #444' : '1.5px solid #3a4f7a') : (s === 'dark' ? '1px solid #8b691433' : s === 'editorial' ? '2px solid #1a1a1a' : '1.5px solid #1b2a4a'), background: m === 'dark' ? (s === 'dark' ? '#c9a84c08' : s === 'editorial' ? '#2a2a2a' : '#1e2d48') : (s === 'dark' ? '#8b69140a' : s === 'editorial' ? '#fafafa' : '#faf7f0') }}>
            <div style={{ fontSize: 30, lineHeight: 1 }}>
              {it.name === 'Mac & Cheese' ? '🧀' : it.name === 'Corn Dog' ? '🌽' : it.name === 'Chicken Tenders' ? '🍗' : it.name === 'Burger' ? '🍔' : '🌭'}
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
   MAIN
   ============================================================ */
export default function PrintableMenuClient({ menus }: { menus: Menu[] }) {
  const [selected, setSelected] = useState<Set<SectionKey>>(new Set(SECTIONS.map(s => s.key)));
  const [style, setStyle] = useState<StyleKey>('dark');
  const [mode, setMode] = useState<ModeKey>('dark');

  const groups = menus[0]?.groups || [];
  const find = (id: string) => groups.find(g => g.id === id)!;

  const toggle = (key: SectionKey) => setSelected(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: getStyleCSS(style, mode) }} />
      <div className="no-print" style={{ position: 'sticky', top: 0, zIndex: 50, background: '#111827', color: '#fff', padding: '10px 16px', boxShadow: '0 4px 16px rgba(0,0,0,.4)', fontFamily: 'system-ui,sans-serif' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Print Menus</h1>
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
              <button onClick={() => window.print()} style={{ background: '#f59e0b', color: '#000', fontWeight: 700, padding: '6px 18px', borderRadius: 6, border: 'none', fontSize: 13, cursor: 'pointer', marginLeft: 4 }}>🖨️ Print</button>
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
        {selected.has('starters') && <StartersSection group={find('g-starters')} style={style} />}
        {selected.has('salads') && <SaladsSection group={find('g-salads')} style={style} />}
        {selected.has('burgers') && <BurgersSection group={find('g-burgers')} style={style} />}
        {selected.has('heroes') && <HeroesSection heroesGroup={find('g-heroes')} handheldsGroup={find('g-handhelds')} style={style} />}
        {selected.has('sweet') && <SweetSection group={find('g-sweet')} style={style} />}
        {selected.has('kids') && <KidsSection group={find('g-kids')} style={style} mode={mode} />}
        {selected.size === 0 && <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: 80, fontSize: 16 }}>Select sections above to preview &amp; print</div>}
      </div>
    </>
  );
}
