'use client';

import { useState } from 'react';
import { Menu, MenuGroup } from '@/types';

/* ─── Types ─── */
type StyleKey = 'classic' | 'minimal' | 'rustic';
type SectionKey = 'daily' | 'starters' | 'salads' | 'burgers' | 'heroes' | 'sweet' | 'kids';

const STYLES: { key: StyleKey; label: string; desc: string }[] = [
  { key: 'classic', label: 'Classic Sports Bar', desc: 'Bold Oswald headers · dotted leaders · amber accents' },
  { key: 'minimal', label: 'Modern Minimal', desc: 'Playfair + Inter · airy whitespace · thin rules' },
  { key: 'rustic', label: 'Americana', desc: 'Red, white & blue · stars & banners · vintage tavern' },
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
  { day: 'Monday', name: 'Monday Madness', price: '$4', lines: ['Sliders · Pulled Pork, Beef', 'Beer · Select Drafts'] },
  { day: 'Tuesday', name: 'Taco Tuesday', price: '$3', lines: ['Tacos · Carnitas, Carne Asada', 'Beer · Modelo, Ultra'] },
  { day: 'Wednesday', name: 'Wings & Well Wednesday', price: '$2', lines: ['Signature Wings each', 'Drinks off'] },
  { day: 'Thursday', name: 'Thirsty Thursday', price: '$5', lines: ['Burgers off', 'Select Drafts each'] },
];

/* ============================================================
   STYLE SHEETS
   ============================================================ */
function getStyleCSS(s: StyleKey): string {
  const shared = `
    nav,header,.bottom-nav,footer{display:none!important}
    main{padding:0!important;min-height:auto!important}
    *{box-sizing:border-box;margin:0;padding:0}
    @media print{
      .no-print{display:none!important}
      html,body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
      .page{page-break-before:always;box-shadow:none!important;border-radius:0!important}
      .page:first-of-type{page-break-before:avoid}
      @page{size:A4;margin:12mm 14mm}
    }
    @media screen{
      .page{max-width:210mm;margin:0 auto 24px;border-radius:4px;min-height:297mm}
    }
    .cols-2{columns:2;column-gap:24px}
    .cols-2>*{break-inside:avoid}
    .vgroup{margin-bottom:14px}
    .vgroup-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:2px}
    .vgroup-name{font-weight:700;font-size:15px}
    .vgroup-price{font-weight:700;font-size:15px}
    .vgroup-desc{font-size:10.5px;line-height:1.45;margin-bottom:4px}
    .pills{display:flex;flex-wrap:wrap;gap:3px;margin:3px 0}
    .pill{font-size:9.5px;border-radius:3px;padding:1px 6px}
    .choice-row{font-size:10px;margin:2px 0}
    .choice-lbl{font-weight:700;text-transform:uppercase;letter-spacing:.8px;font-size:9px}
    .addon-wrap{margin-top:6px;padding:6px 10px;border-radius:5px}
    .addon-lbl{font-weight:700;text-transform:uppercase;letter-spacing:1.5px;font-size:8.5px;margin-bottom:3px}
    .addon-itm{display:inline-block;font-size:10px;margin-right:10px}
    .item-row{display:flex;align-items:baseline;margin-bottom:5px}
    .item-nm{font-weight:700;font-size:12.5px;white-space:nowrap}
    .item-sub{font-size:10.5px;font-style:italic;margin-left:4px}
    .item-fill{flex:1;min-width:8px;margin:0 4px}
    .item-pr{font-weight:700;font-size:12.5px;white-space:nowrap}
    .item-desc{font-size:10px;line-height:1.4;margin:-2px 0 6px}
    .pg-foot{text-align:center;font-size:7.5px;position:absolute;bottom:10mm;left:14mm;right:14mm}
  `;

  if (s === 'classic') return shared + `
    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Open+Sans:wght@400;600;700&display=swap');
    html,body{background:#e5e7eb!important;font-family:'Open Sans',sans-serif;color:#1a1a1a}
    .page{background:#fff;padding:14mm 16mm;box-shadow:0 2px 8px rgba(0,0,0,.12);position:relative}
    .pg-logo{font-family:'Oswald',sans-serif;font-weight:700;font-size:22px;text-transform:uppercase;letter-spacing:3px;text-align:center}
    .pg-sub{font-size:9px;letter-spacing:4px;text-transform:uppercase;text-align:center;color:#666;border-bottom:2px solid #222;padding-bottom:5px;margin-bottom:12px}
    .sec-title{font-family:'Oswald',sans-serif;font-size:20px;font-weight:700;text-transform:uppercase;letter-spacing:2px;border-bottom:3px solid #1a1a1a;padding-bottom:4px;margin-bottom:10px}
    .vgroup-name{font-family:'Oswald',sans-serif;text-transform:uppercase;letter-spacing:1px}
    .vgroup-desc{color:#555}
    .pill{background:#f3f4f6;border:1px solid #ddd}
    .item-fill{border-bottom:2px dotted #ccc;position:relative;top:-3px}
    .item-sub{color:#666}
    .item-desc{color:#555}
    .addon-wrap{background:#fef3c7;border:1px solid #fbbf24}
    .addon-lbl{color:#92400e}
    .choice-lbl{color:#666}
    .pg-foot{color:#999}
    .daily-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .daily-card{border:2px solid #222;border-radius:6px;padding:12px}
    .daily-nm{font-family:'Oswald',sans-serif;font-size:17px;font-weight:700;text-transform:uppercase}
    .daily-pr{font-family:'Oswald',sans-serif;font-size:28px;font-weight:700}
    .daily-day{font-size:9px;text-transform:uppercase;letter-spacing:3px;color:#666}
    .sub-hd{font-family:'Oswald',sans-serif;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #ddd;padding-bottom:2px;margin:10px 0 6px}
    @media print{html,body{background:#fff!important}.page{padding:0}.addon-wrap{background:#fef3c7!important;border-color:#fbbf24!important}}
  `;

  if (s === 'minimal') return shared + `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
    html,body{background:#f9fafb!important;font-family:'Inter',sans-serif;color:#111}
    .page{background:#fff;padding:18mm 20mm;box-shadow:0 1px 4px rgba(0,0,0,.06);position:relative}
    .pg-logo{font-family:'Playfair Display',serif;font-weight:600;font-size:20px;text-align:center}
    .pg-sub{font-family:'Inter',sans-serif;font-weight:300;font-size:9px;letter-spacing:5px;text-transform:uppercase;text-align:center;color:#999;border-bottom:1px solid #e5e7eb;padding-bottom:6px;margin-bottom:14px}
    .sec-title{font-family:'Playfair Display',serif;font-size:22px;font-weight:600;letter-spacing:4px;text-transform:uppercase;border-bottom:1px solid #d1d5db;padding-bottom:6px;margin-bottom:12px}
    .vgroup-name{font-family:'Playfair Display',serif}
    .vgroup-desc{color:#777;font-weight:300}
    .pill{background:#f9fafb;border:1px solid #e5e7eb}
    .item-fill{display:none}
    .item-nm{font-weight:600;font-size:12px}
    .item-sub{color:#999;font-weight:300;font-style:normal}
    .item-desc{color:#888;font-weight:300}
    .item-pr{font-weight:500;color:#444;font-size:12px}
    .addon-wrap{border-top:1px solid #e5e7eb;padding-top:8px;background:none;border-radius:0}
    .addon-lbl{color:#bbb;letter-spacing:3px}
    .addon-itm{color:#666;font-weight:300}
    .choice-lbl{color:#bbb;letter-spacing:2px}
    .choice-row{color:#666;font-weight:300}
    .pg-foot{color:#ccc;font-weight:300}
    .daily-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .daily-card{border:1px solid #e5e7eb;border-radius:4px;padding:14px}
    .daily-nm{font-family:'Playfair Display',serif;font-size:16px;font-weight:600}
    .daily-pr{font-size:24px;font-weight:300;color:#444}
    .daily-day{font-size:9px;text-transform:uppercase;letter-spacing:4px;color:#bbb;font-weight:300}
    .sub-hd{font-family:'Playfair Display',serif;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;padding-bottom:2px;margin:10px 0 6px}
    @media print{html,body{background:#fff!important}.page{padding:0}}
  `;

  /* ── Americana: red white blue ── */
  return shared + `
    @import url('https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Lora:wght@400;600;700&family=Source+Sans+3:wght@400;600;700&display=swap');
    html,body{background:#b0bec5!important;font-family:'Source Sans 3',sans-serif;color:#1b2a4a}
    .page{background:#fff;padding:14mm 16mm;box-shadow:0 2px 10px rgba(0,0,0,.2);border:4px solid #1b2a4a;position:relative}
    .page::before{content:'';position:absolute;top:4px;left:4px;right:4px;bottom:4px;border:2px solid #bf2a2a;pointer-events:none}
    .pg-logo{font-family:'Alfa Slab One',cursive;font-size:22px;text-align:center;color:#1b2a4a}
    .pg-stars{text-align:center;font-size:11px;letter-spacing:6px;color:#bf2a2a;margin-bottom:2px}
    .pg-sub{font-family:'Lora',serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;text-align:center;color:#1b2a4a;border-bottom:3px double #1b2a4a;padding-bottom:5px;margin-bottom:12px}
    .sec-title{font-family:'Alfa Slab One',cursive;font-size:20px;color:#1b2a4a;margin-bottom:2px}
    .sec-rule{height:3px;background:linear-gradient(90deg,#bf2a2a,#1b2a4a,#bf2a2a);margin-bottom:10px;border-radius:1px}
    .vgroup-name{font-family:'Lora',serif;color:#1b2a4a}
    .vgroup-desc{color:#4a5568}
    .pill{background:#eef2f7;border:1px solid #c5cfe0;color:#1b2a4a}
    .item-fill{border-bottom:1px dashed #c5cfe0;position:relative;top:-3px}
    .item-nm{font-family:'Lora',serif;color:#1b2a4a}
    .item-sub{color:#bf2a2a;font-family:'Lora',serif}
    .item-desc{color:#4a5568}
    .addon-wrap{background:#eef2f7;border:2px solid #1b2a4a;border-radius:6px}
    .addon-lbl{color:#bf2a2a;font-family:'Lora',serif}
    .addon-itm{color:#1b2a4a}
    .choice-lbl{color:#bf2a2a}
    .pg-foot{color:#8899aa;font-family:'Lora',serif;font-style:italic}
    .daily-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .daily-card{border:2px solid #1b2a4a;border-radius:6px;padding:12px;background:#fafbfd}
    .daily-nm{font-family:'Alfa Slab One',cursive;font-size:16px;color:#1b2a4a}
    .daily-pr{font-family:'Alfa Slab One',cursive;font-size:26px;color:#bf2a2a}
    .daily-day{font-family:'Lora',serif;font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#6679a0;font-style:italic}
    .sub-hd{font-family:'Alfa Slab One',cursive;font-size:13px;color:#1b2a4a;margin:8px 0 4px}
    .sub-rule{height:2px;background:#bf2a2a;margin-bottom:6px;width:60px}
    .orn{text-align:center;color:#bf2a2a;font-size:10px;letter-spacing:6px;margin:6px 0}
    .star-bullet::before{content:'★ ';color:#bf2a2a;font-size:8px}
    @media print{html,body{background:#fff!important}.page{padding:0;box-shadow:none}.page::before{top:4px;left:4px;right:4px;bottom:4px}.addon-wrap{background:#eef2f7!important}.daily-card{background:#fafbfd!important}}
  `;
}

/* ============================================================
   SHARED RENDERERS
   ============================================================ */
function fmtPrice(p: number) { return `$${p}`; }

function Header({ style: s }: { style: StyleKey }) {
  if (s === 'rustic') return (
    <div style={{ marginBottom: 10 }}>
      <div className="pg-stars">★ ★ ★ ★ ★</div>
      <div className="pg-logo">American Heroes &amp; Brew</div>
      <div className="pg-sub">Carlsbad, California · est. 2024</div>
    </div>
  );
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="pg-logo">American Heroes &amp; Brew</div>
      <div className="pg-sub">300 Carlsbad Village Dr, Suite 101 · Carlsbad CA · (760) 994-0187</div>
    </div>
  );
}

function SecTitle({ title, style: s }: { title: string; style: StyleKey }) {
  return <>
    <div className="sec-title">{title}</div>
    {s === 'rustic' && <div className="sec-rule" />}
  </>;
}

function SubHd({ title, price, style: s }: { title: string; price?: number; style: StyleKey }) {
  return <>
    <div className="sub-hd">
      {title}{price != null && <span style={{ marginLeft: 8, fontWeight: 700 }}>{fmtPrice(price)}</span>}
    </div>
    {s === 'rustic' && <div className="sub-rule" />}
  </>;
}

function Footer() {
  return <div className="pg-foot">American Heroes &amp; Brew · 300 Carlsbad Village Dr, Suite 101, Carlsbad CA 92008 · (760) 994-0187</div>;
}

/** Render a variant group the way the site does:
 *  Name $price → description → variant pills (no prices if same) → choices → addons */
function VGroup({ g, style: s }: { g: MenuGroup; style: StyleKey }) {
  const allSame = g.items.every(i => i.price === g.basePrice);
  return (
    <div className="vgroup">
      <div className="vgroup-head">
        <span className="vgroup-name">{g.name}</span>
        {g.basePrice != null && <span className="vgroup-price">{fmtPrice(g.basePrice)}</span>}
      </div>
      {g.description && <div className="vgroup-desc">{g.description}</div>}
      {g.items.length > 1 && (
        <div className="pills">
          {g.items.map(i => (
            <span key={i.id} className="pill">
              {i.name}{i.subtitle ? ` · ${i.subtitle}` : ''}
              {!allSame && i.price !== g.basePrice ? ` ${fmtPrice(i.price)}` : ''}
            </span>
          ))}
        </div>
      )}
      {g.choices?.map(c => (
        <div key={c.label} className="choice-row"><span className="choice-lbl">{c.label}: </span>{c.options.join(' · ')}</div>
      ))}
      {g.addOns && g.addOns.length > 0 && (
        <div style={{ marginTop: 4 }}>
          {g.addOns.map(a => <span key={a.name} className="addon-itm">{s === 'rustic' && <span style={{ color: '#bf2a2a', marginRight: 2 }}>★</span>}{a.name} <strong>{a.price}</strong></span>)}
        </div>
      )}
    </div>
  );
}

/** Item row with optional dots and description */
function ItemLine({ name, sub, desc, price, style: s }: { name: string; sub?: string; desc?: string; price: number; style: StyleKey }) {
  return <>
    <div className="item-row">
      <span className="item-nm">{name}</span>
      {sub && <span className="item-sub">{s === 'rustic' ? `— ${sub}` : `(${sub})`}</span>}
      <span className="item-fill" />
      {s === 'minimal' && <span style={{ flex: 1 }} />}
      <span className="item-pr">{fmtPrice(price)}</span>
    </div>
    {desc && <div className="item-desc">{desc}</div>}
  </>;
}

function AddOnBox({ addOns, label, style: s }: { addOns?: { name: string; price: string }[]; label?: string; style: StyleKey }) {
  if (!addOns?.length) return null;
  return (
    <div className="addon-wrap">
      <div className="addon-lbl">{label || 'Sides'}</div>
      {addOns.map(a => <span key={a.name} className="addon-itm">{s === 'rustic' && <span style={{ color: '#bf2a2a', marginRight: 2 }}>★</span>}{a.name} <strong>{a.price}</strong></span>)}
    </div>
  );
}

/* ============================================================
   SECTION RENDERERS — 2-column flow, mirroring site patterns
   ============================================================ */

function DailySection({ style: s }: { style: StyleKey }) {
  return (
    <div className="page">
      <Header style={s} />
      <SecTitle title="Daily Lineup" style={s} />
      {s === 'rustic' && <div className="orn">★ ★ ★</div>}
      <div className="daily-grid">
        {DAILY_SPECIALS.map(d => (
          <div key={d.day} className="daily-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div><div className="daily-nm">{d.name}</div><div className="daily-day">{d.day}</div></div>
              <div className="daily-pr">{d.price}</div>
            </div>
            <div style={{ marginTop: 6 }}>{d.lines.map(l => <div key={l} style={{ fontSize: 12 }}>{l}</div>)}</div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}

function StartersSection({ group, style: s }: { group: MenuGroup; style: StyleKey }) {
  return (
    <div className="page">
      <Header style={s} />
      <SecTitle title="Starters" style={s} />
      <div className="cols-2">
        {group.subGroups?.map(sub => <VGroup key={sub.id} g={sub} style={s} />)}
      </div>
      <Footer />
    </div>
  );
}

function SaladsSection({ group, style: s }: { group: MenuGroup; style: StyleKey }) {
  return (
    <div className="page">
      <Header style={s} />
      <SecTitle title="Salads" style={s} />
      {group.items.map(it => <ItemLine key={it.id} name={it.name} desc={it.description} price={it.price} style={s} />)}
      <AddOnBox addOns={group.addOns} label={group.addOnLabel} style={s} />
      <Footer />
    </div>
  );
}

function BurgersSection({ group, style: s }: { group: MenuGroup; style: StyleKey }) {
  /* All burgers are same price — show once at top, then 2-col list */
  return (
    <div className="page">
      <Header style={s} />
      <SecTitle title="Burgers" style={s} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <div className="vgroup-desc" style={{ fontSize: 12 }}>{group.description}</div>
        {group.basePrice != null && <span className="vgroup-price" style={{ fontSize: 18 }}>{fmtPrice(group.basePrice)}</span>}
      </div>
      {s === 'rustic' && <div className="orn">— ★ —</div>}
      <div className="cols-2">
        {group.items.map(it => (
          <div key={it.id} style={{ marginBottom: 10, breakInside: 'avoid' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span className="item-nm">{it.name}</span>
              {it.subtitle && <span className="item-sub">{s === 'rustic' ? `— ${it.subtitle}` : `(${it.subtitle})`}</span>}
            </div>
            {it.description && <div className="item-desc">{it.description}</div>}
          </div>
        ))}
      </div>
      <AddOnBox addOns={group.addOns} label={group.addOnLabel} style={s} />
      <Footer />
    </div>
  );
}

function HeroesSection({ heroesGroup, handheldsGroup, style: s }: { heroesGroup: MenuGroup; handheldsGroup: MenuGroup; style: StyleKey }) {
  return (
    <div className="page">
      <Header style={s} />
      <SecTitle title="Heroes & Handhelds" style={s} />
      <div className="cols-2">
        {/* Philly */}
        {heroesGroup.subGroups?.map(sub => <VGroup key={sub.id} g={sub} style={s} />)}
        {/* Hero sandwiches */}
        {heroesGroup.items.map(it => (
          <div key={it.id} style={{ marginBottom: 10, breakInside: 'avoid' }}>
            <div className="item-row">
              <span className="item-nm">{it.name}</span>
              {it.subtitle && <span className="item-sub">{s === 'rustic' ? `— ${it.subtitle}` : `(${it.subtitle})`}</span>}
              <span className="item-fill" />{s === 'minimal' && <span style={{ flex: 1 }} />}
              <span className="item-pr">{fmtPrice(it.price)}</span>
            </div>
            {it.description && <div className="item-desc">{it.description}</div>}
          </div>
        ))}
      </div>
      <AddOnBox addOns={heroesGroup.addOns} label={heroesGroup.addOnLabel} style={s} />

      {s === 'rustic' ? <div className="orn" style={{ margin: '10px 0' }}>★ ★ ★</div> : <div style={{ borderTop: '2px solid #ddd', margin: '12px 0' }} />}

      <SubHd title="Handhelds" style={s} />
      <div className="cols-2">
        {handheldsGroup.subGroups?.map(sub => <VGroup key={sub.id} g={sub} style={s} />)}
      </div>
      <AddOnBox addOns={handheldsGroup.addOns} label={handheldsGroup.addOnLabel} style={s} />
      <Footer />
    </div>
  );
}

function SweetSection({ group, style: s }: { group: MenuGroup; style: StyleKey }) {
  return (
    <div className="page">
      <Header style={s} />
      <SecTitle title="Sweet Stuff" style={s} />
      <div className="cols-2">
        {group.items.map(it => <ItemLine key={it.id} name={it.name} desc={it.description} price={it.price} style={s} />)}
      </div>
      <Footer />
    </div>
  );
}

/* ============================================================
   KIDS — Single-page activity placemat: menu + coloring + games
   ============================================================ */
function KidsSection({ group, style: s }: { group: MenuGroup; style: StyleKey }) {
  return (
    <div className="page" style={{ padding: s === 'minimal' ? '12mm 14mm' : '10mm 12mm', overflow: 'hidden' }}>
      {/* Fun header */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 24, fontWeight: 900, fontFamily: s === 'rustic' ? "'Alfa Slab One',cursive" : s === 'classic' ? "'Oswald',sans-serif" : "'Playfair Display',serif", textTransform: s === 'minimal' ? 'none' : 'uppercase', letterSpacing: s === 'minimal' ? 4 : 2, color: s === 'rustic' ? '#1b2a4a' : '#222' }}>
          Heroes Kids Menu
        </div>
        <div style={{ fontSize: 10, color: '#888', letterSpacing: 2, marginTop: 2 }}>
          AMERICAN HEROES &amp; BREW · CARLSBAD, CA
        </div>
      </div>

      {/* ── Top section: Menu items grid + choices ── */}
      <div style={{ border: s === 'rustic' ? '2px solid #1b2a4a' : '2px solid #222', borderRadius: 8, padding: '8px 10px', marginBottom: 8, background: s === 'rustic' ? '#fafbfd' : '#fafafa' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontWeight: 800, fontSize: 14, fontFamily: s === 'rustic' ? "'Alfa Slab One',cursive" : s === 'classic' ? "'Oswald',sans-serif" : "'Playfair Display',serif", textTransform: 'uppercase', letterSpacing: 1 }}>
            Pick Your Meal!
          </span>
          <span style={{ fontWeight: 800, fontSize: 18, color: s === 'rustic' ? '#bf2a2a' : '#222' }}>{group.basePrice ? fmtPrice(group.basePrice) : ''}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, textAlign: 'center' }}>
          {group.items.map(it => (
            <div key={it.id} style={{ border: '1px solid #ddd', borderRadius: 6, padding: '6px 2px', background: '#fff' }}>
              <div style={{ fontSize: 24 }}>
                {it.name === 'Mac & Cheese' ? '🧀' : it.name === 'Corn Dog' ? '🌽' : it.name === 'Chicken Tenders' ? '🍗' : it.name === 'Burger' ? '🍔' : '🌭'}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, marginTop: 2 }}>{it.name}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 9 }}>
          {group.choices?.map(c => (
            <div key={c.label}><span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{c.label}: </span>{c.options.join(' · ')}</div>
          ))}
          {group.addOns && <div><span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{group.addOnLabel}: </span>{group.addOns.map(a => `${a.name} ${a.price}`).join(' · ')}</div>}
        </div>
      </div>

      {/* ── Bottom section: 2 columns — coloring left, games right ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, height: 'calc(100% - 180px)' }}>
        {/* LEFT: Coloring */}
        <div style={{ border: '1.5px dashed #ccc', borderRadius: 8, padding: 6, display: 'flex', flexDirection: 'column' }}>
          <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, color: s === 'rustic' ? '#bf2a2a' : '#444' }}>
            Color Me In!
          </div>
          <svg viewBox="0 0 300 380" style={{ flex: 1, width: '100%' }}>
            {/* Shield */}
            <path d="M150 20 L220 55 L220 160 Q220 230 150 270 Q80 230 80 160 L80 55 Z" fill="none" stroke="#333" strokeWidth="2.5"/>
            <path d="M150 45 L200 70 L200 160 Q200 215 150 245 Q100 215 100 160 L100 70 Z" fill="none" stroke="#333" strokeWidth="1.5"/>
            {/* H */}
            <text x="150" y="175" textAnchor="middle" fontFamily="serif" fontSize="56" fontWeight="bold" fill="none" stroke="#333" strokeWidth="2">H</text>
            {/* Stars */}
            <polygon points="150,10 154,22 167,22 157,30 160,42 150,35 140,42 143,30 133,22 146,22" fill="none" stroke="#333" strokeWidth="1.5"/>
            <polygon points="70,35 74,47 87,47 77,55 80,67 70,60 60,67 63,55 53,47 66,47" fill="none" stroke="#333" strokeWidth="1.5"/>
            <polygon points="230,35 234,47 247,47 237,55 240,67 230,60 220,67 223,55 213,47 226,47" fill="none" stroke="#333" strokeWidth="1.5"/>
            {/* Banner */}
            <path d="M70 280 Q150 260 230 280 L220 305 Q150 285 80 305 Z" fill="none" stroke="#333" strokeWidth="2"/>
            <text x="150" y="298" textAnchor="middle" fontFamily="serif" fontSize="12" fill="none" stroke="#333" strokeWidth="1">HEROES &amp; BREW</text>
            {/* Burger */}
            <path d="M90 330 Q150 310 210 330 Z" fill="none" stroke="#333" strokeWidth="2"/>
            <ellipse cx="150" cy="330" rx="4" ry="3" fill="none" stroke="#333" strokeWidth="1"/>
            <ellipse cx="170" cy="325" rx="4" ry="3" fill="none" stroke="#333" strokeWidth="1"/>
            <ellipse cx="130" cy="325" rx="4" ry="3" fill="none" stroke="#333" strokeWidth="1"/>
            <path d="M85 335 Q100 330 115 335 Q130 330 145 335 Q160 330 175 335 Q190 330 205 335 Q215 330 220 335" fill="none" stroke="#333" strokeWidth="1.5"/>
            <rect x="88" y="338" width="124" height="14" rx="3" fill="none" stroke="#333" strokeWidth="2"/>
            <rect x="88" y="354" width="124" height="8" fill="none" stroke="#333" strokeWidth="1.5"/>
            <path d="M85 364 L215 364 Q215 378 150 378 Q85 378 85 364 Z" fill="none" stroke="#333" strokeWidth="2"/>
          </svg>
        </div>

        {/* RIGHT: Games */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Word Search */}
          <div style={{ border: '1.5px dashed #ccc', borderRadius: 8, padding: 6, flex: 1 }}>
            <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3, color: s === 'rustic' ? '#1b2a4a' : '#444' }}>
              Word Search
            </div>
            <svg viewBox="0 0 280 195" style={{ width: '100%' }}>
              {(() => {
                const grid = [
                  'BURGERSWINGS',
                  'TACOSHEROFLY',
                  'NACHOSFRIESK',
                  'CSLIDERSALAD',
                  'HCHURROSBREW',
                  'EPHILLYCKDOG',
                  'ECARLSBADPIE',
                  'SAUCEPICKLES',
                ];
                const sz = 16;
                const ox = 8;
                const oy = 2;
                const cells: string[] = [];
                grid.forEach((row, ri) => {
                  [...row].forEach((ch, ci) => {
                    const x = ox + ci * sz;
                    const y = oy + ri * sz;
                    cells.push(`<rect x="${x}" y="${y}" width="${sz}" height="${sz}" fill="none" stroke="#e0e0e0" stroke-width=".5"/>`);
                    cells.push(`<text x="${x + sz / 2}" y="${y + sz / 2 + 4}" text-anchor="middle" font-family="monospace" font-size="10" font-weight="600">${ch}</text>`);
                  });
                });
                cells.push(`<text x="8" y="145" font-family="sans-serif" font-size="8" font-weight="700">Find:</text>`);
                cells.push(`<text x="8" y="157" font-family="sans-serif" font-size="7.5">BURGERS · WINGS · TACOS · NACHOS</text>`);
                cells.push(`<text x="8" y="168" font-family="sans-serif" font-size="7.5">FRIES · HEROES · PHILLY · BREW</text>`);
                cells.push(`<text x="8" y="179" font-family="sans-serif" font-size="7.5">CHURROS · SALAD · CARLSBAD · PIE</text>`);
                return <g dangerouslySetInnerHTML={{ __html: cells.join('') }} />;
              })()}
            </svg>
          </div>

          {/* Maze */}
          <div style={{ border: '1.5px dashed #ccc', borderRadius: 8, padding: 6, flex: 1 }}>
            <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3, color: s === 'rustic' ? '#1b2a4a' : '#444' }}>
              Help the Hero Find the Burger!
            </div>
            <svg viewBox="0 0 280 160" style={{ width: '100%' }}>
              {/* Start/End */}
              <text x="14" y="16" fontSize="14">🦸</text>
              <text x="255" y="152" fontSize="14">🍔</text>
              {/* Maze border */}
              <rect x="8" y="22" width="264" height="120" fill="none" stroke="#333" strokeWidth="2"/>
              {/* Horizontal walls */}
              <line x1="8" y1="42" x2="80" y2="42" stroke="#333" strokeWidth="1.8"/>
              <line x1="110" y1="42" x2="200" y2="42" stroke="#333" strokeWidth="1.8"/>
              <line x1="230" y1="42" x2="272" y2="42" stroke="#333" strokeWidth="1.8"/>
              <line x1="40" y1="62" x2="140" y2="62" stroke="#333" strokeWidth="1.8"/>
              <line x1="170" y1="62" x2="240" y2="62" stroke="#333" strokeWidth="1.8"/>
              <line x1="8" y1="82" x2="70" y2="82" stroke="#333" strokeWidth="1.8"/>
              <line x1="100" y1="82" x2="180" y2="82" stroke="#333" strokeWidth="1.8"/>
              <line x1="210" y1="82" x2="272" y2="82" stroke="#333" strokeWidth="1.8"/>
              <line x1="40" y1="102" x2="120" y2="102" stroke="#333" strokeWidth="1.8"/>
              <line x1="150" y1="102" x2="230" y2="102" stroke="#333" strokeWidth="1.8"/>
              <line x1="8" y1="122" x2="90" y2="122" stroke="#333" strokeWidth="1.8"/>
              <line x1="120" y1="122" x2="200" y2="122" stroke="#333" strokeWidth="1.8"/>
              {/* Vertical walls */}
              <line x1="80" y1="22" x2="80" y2="42" stroke="#333" strokeWidth="1.8"/>
              <line x1="200" y1="22" x2="200" y2="42" stroke="#333" strokeWidth="1.8"/>
              <line x1="140" y1="42" x2="140" y2="62" stroke="#333" strokeWidth="1.8"/>
              <line x1="70" y1="62" x2="70" y2="82" stroke="#333" strokeWidth="1.8"/>
              <line x1="240" y1="62" x2="240" y2="82" stroke="#333" strokeWidth="1.8"/>
              <line x1="180" y1="82" x2="180" y2="102" stroke="#333" strokeWidth="1.8"/>
              <line x1="120" y1="102" x2="120" y2="122" stroke="#333" strokeWidth="1.8"/>
              <line x1="230" y1="102" x2="230" y2="142" stroke="#333" strokeWidth="1.8"/>
            </svg>
          </div>

          {/* Tic Tac Toe */}
          <div style={{ border: '1.5px dashed #ccc', borderRadius: 8, padding: 6 }}>
            <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2, color: s === 'rustic' ? '#1b2a4a' : '#444' }}>
              Tic-Tac-Toe
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              {[0, 1].map(n => (
                <svg key={n} viewBox="0 0 90 90" style={{ width: 70, height: 70 }}>
                  <line x1="30" y1="5" x2="30" y2="85" stroke="#333" strokeWidth="2"/>
                  <line x1="60" y1="5" x2="60" y2="85" stroke="#333" strokeWidth="2"/>
                  <line x1="5" y1="30" x2="85" y2="30" stroke="#333" strokeWidth="2"/>
                  <line x1="5" y1="60" x2="85" y2="60" stroke="#333" strokeWidth="2"/>
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: 7, color: '#aaa', marginTop: 4 }}>
        American Heroes &amp; Brew · 300 Carlsbad Village Dr, Carlsbad CA · Ask your server for crayons!
      </div>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function PrintableMenuClient({ menus }: { menus: Menu[] }) {
  const [selected, setSelected] = useState<Set<SectionKey>>(new Set(SECTIONS.map(s => s.key)));
  const [style, setStyle] = useState<StyleKey>('classic');

  const groups = menus[0]?.groups || [];
  const find = (id: string) => groups.find(g => g.id === id)!;

  const toggle = (key: SectionKey) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: getStyleCSS(style) }} />

      {/* ── Control Bar ── */}
      <div className="no-print" style={{ position: 'sticky', top: 0, zIndex: 50, background: '#111827', color: '#fff', padding: '10px 16px', boxShadow: '0 4px 12px rgba(0,0,0,.3)', fontFamily: 'system-ui,sans-serif' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Print Menus</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {STYLES.map(st => (
                <button key={st.key} onClick={() => setStyle(st.key)} title={st.desc} style={{ padding: '5px 10px', borderRadius: 5, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', background: style === st.key ? '#f59e0b' : '#374151', color: style === st.key ? '#000' : '#9ca3af' }}>
                  {st.label}
                </button>
              ))}
              <button onClick={() => window.print()} style={{ background: '#f59e0b', color: '#000', fontWeight: 700, padding: '6px 16px', borderRadius: 6, border: 'none', fontSize: 13, cursor: 'pointer', marginLeft: 4 }}>
                🖨️ Print
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 12 }}>
            <button onClick={() => setSelected(new Set(SECTIONS.map(s => s.key)))} style={{ background: 'none', border: 'none', color: '#f59e0b', fontSize: 11, cursor: 'pointer', padding: 0 }}>All</button>
            <button onClick={() => setSelected(new Set())} style={{ background: 'none', border: 'none', color: '#f59e0b', fontSize: 11, cursor: 'pointer', padding: 0 }}>None</button>
            <span style={{ color: '#4b5563' }}>|</span>
            {SECTIONS.map(sec => (
              <label key={sec.key} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input type="checkbox" checked={selected.has(sec.key)} onChange={() => toggle(sec.key)} style={{ accentColor: '#f59e0b', width: 14, height: 14 }} />
                {sec.label}
              </label>
            ))}
          </div>
          <div style={{ fontSize: 10, color: '#6b7280', marginTop: 4 }}>Style: {STYLES.find(st => st.key === style)?.desc}</div>
        </div>
      </div>

      {/* ── Pages ── */}
      <div style={{ minHeight: '100vh', padding: '20px 16px' }}>
        {selected.has('daily') && <DailySection style={style} />}
        {selected.has('starters') && <StartersSection group={find('g-starters')} style={style} />}
        {selected.has('salads') && <SaladsSection group={find('g-salads')} style={style} />}
        {selected.has('burgers') && <BurgersSection group={find('g-burgers')} style={style} />}
        {selected.has('heroes') && <HeroesSection heroesGroup={find('g-heroes')} handheldsGroup={find('g-handhelds')} style={style} />}
        {selected.has('sweet') && <SweetSection group={find('g-sweet')} style={style} />}
        {selected.has('kids') && <KidsSection group={find('g-kids')} style={style} />}
        {selected.size === 0 && <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: 80, fontSize: 16 }}>Select sections above to preview &amp; print</div>}
      </div>
    </>
  );
}
