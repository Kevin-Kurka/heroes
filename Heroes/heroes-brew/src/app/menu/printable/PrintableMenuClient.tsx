'use client';

import { useState } from 'react';
import { Menu, MenuGroup } from '@/types';

/* ─── Types ─── */
type StyleKey = 'classic' | 'minimal' | 'rustic';
type SectionKey = 'daily' | 'starters' | 'salads' | 'burgers' | 'heroes' | 'sweet' | 'kids';

const STYLES: { key: StyleKey; label: string; desc: string }[] = [
  { key: 'classic', label: 'Classic Sports Bar', desc: 'Bold headers, dotted leaders, amber accents' },
  { key: 'minimal', label: 'Modern Minimal', desc: 'Clean whitespace, thin rules, elegant type' },
  { key: 'rustic', label: 'Rustic Americana', desc: 'Warm tones, decorative borders, vintage feel' },
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

/* ─── Daily Specials (synced with HomePageClient) ─── */
const DAILY_SPECIALS = [
  { day: 'Monday', name: 'Monday Madness', price: '$4', lines: ['Sliders [Pulled Pork, Beef]', 'Beer [Select Drafts]'] },
  { day: 'Tuesday', name: 'Taco Tuesday', price: '$3', lines: ['Tacos [Carnitas, Carne Asada]', 'Beer [Modelo, Ultra]'] },
  { day: 'Wednesday', name: 'Wings & Well Wednesday', price: '$2', lines: ['Signature Wings each', 'Drinks off'] },
  { day: 'Thursday', name: 'Thirsty Thursday', price: '$5', lines: ['Burgers off', 'Select Drafts each'] },
];

/* ─── Style CSS Generator ─── */
function getStyleCSS(style: StyleKey): string {
  const base = `
    nav, header, .bottom-nav, footer { display: none !important; }
    main { padding-top: 0 !important; padding-bottom: 0 !important; min-height: auto !important; }
    * { box-sizing: border-box; }
    @media print {
      .no-print { display: none !important; }
      html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .print-section { page-break-before: always; }
      .print-section:first-of-type { page-break-before: avoid; }
      @page { size: A4; margin: 15mm 18mm; }
      .print-footer-fixed { display: block !important; position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 8px; padding: 4px 0; }
    }
    @media screen {
      .print-footer-fixed { display: none; }
      .print-section {
        max-width: 210mm; margin: 0 auto 24px; border-radius: 6px;
        min-height: 280mm;
      }
    }
  `;

  if (style === 'classic') return base + `
    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Open+Sans:wght@400;600;700&display=swap');
    html, body { background: #e5e7eb !important; font-family: 'Open Sans', sans-serif; }
    .print-section { background: white; color: #1a1a1a; padding: 18mm 20mm; box-shadow: 0 2px 8px rgba(0,0,0,.15); }
    .menu-header { font-family: 'Oswald', sans-serif; text-transform: uppercase; letter-spacing: 3px; font-size: 14px; text-align: center; color: #333; border-bottom: 2px solid #333; padding-bottom: 6px; margin-bottom: 8px; }
    .menu-header-logo { font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 28px; text-align: center; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 2px; }
    .section-title { font-family: 'Oswald', sans-serif; font-size: 26px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; border-bottom: 3px solid #1a1a1a; padding-bottom: 6px; margin-bottom: 16px; }
    .item-row { display: flex; align-items: baseline; gap: 4px; margin-bottom: 10px; }
    .item-name { font-weight: 700; font-size: 14px; white-space: nowrap; }
    .item-subtitle { font-size: 12px; color: #666; font-style: italic; }
    .item-dots { flex: 1; border-bottom: 2px dotted #ccc; margin: 0 4px; min-width: 20px; position: relative; top: -3px; }
    .item-price { font-weight: 700; font-size: 14px; white-space: nowrap; }
    .item-desc { font-size: 11px; color: #555; margin: -6px 0 8px 0; line-height: 1.4; }
    .sub-title { font-family: 'Oswald', sans-serif; font-size: 17px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ddd; padding-bottom: 3px; margin: 14px 0 8px; }
    .addon-box { background: #fef3c7; border: 1px solid #fbbf24; border-radius: 6px; padding: 8px 12px; margin-top: 12px; }
    .addon-label { font-family: 'Oswald', sans-serif; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #92400e; margin-bottom: 4px; }
    .addon-item { display: inline-block; font-size: 11px; margin-right: 12px; color: #333; }
    .choice-line { font-size: 11px; color: #444; margin: 2px 0; }
    .choice-label { font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; color: #666; }
    .daily-card { border: 2px solid #1a1a1a; border-radius: 8px; padding: 14px; }
    .daily-name { font-family: 'Oswald', sans-serif; font-size: 20px; font-weight: 700; text-transform: uppercase; }
    .daily-price { font-family: 'Oswald', sans-serif; font-size: 32px; font-weight: 700; }
    .daily-day { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #666; }
    .section-footer { text-align: center; font-size: 9px; color: #999; margin-top: auto; padding-top: 12px; }
    @media print {
      html, body { background: white !important; color: #1a1a1a !important; font-family: 'Open Sans', sans-serif; }
      .print-section { padding: 0; box-shadow: none; }
      .addon-box { background: #fef3c7 !important; border-color: #fbbf24 !important; }
      .print-footer-fixed { color: #999; font-family: 'Open Sans', sans-serif; }
    }
  `;

  if (style === 'minimal') return base + `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
    html, body { background: #f9fafb !important; font-family: 'Inter', sans-serif; }
    .print-section { background: white; color: #111; padding: 22mm 24mm; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
    .menu-header { font-family: 'Inter', sans-serif; font-weight: 300; font-size: 12px; text-align: center; letter-spacing: 6px; text-transform: uppercase; color: #888; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 8px; }
    .menu-header-logo { font-family: 'Playfair Display', serif; font-weight: 600; font-size: 24px; text-align: center; margin-bottom: 2px; color: #111; }
    .section-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 600; letter-spacing: 6px; text-transform: uppercase; color: #111; margin-bottom: 20px; padding-bottom: 8px; border-bottom: 1px solid #d1d5db; }
    .item-row { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 6px; padding-bottom: 6px; }
    .item-name { font-weight: 600; font-size: 13px; }
    .item-subtitle { font-size: 11px; color: #888; font-weight: 300; margin-left: 6px; }
    .item-dots { display: none; }
    .item-price { font-weight: 500; font-size: 13px; color: #444; white-space: nowrap; }
    .item-desc { font-size: 11px; color: #777; margin: -2px 0 10px 0; line-height: 1.5; font-weight: 300; }
    .item-divider { border-bottom: 1px solid #f3f4f6; margin-bottom: 2px; }
    .sub-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 600; color: #333; margin: 18px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #e5e7eb; }
    .addon-box { border-top: 1px solid #e5e7eb; padding-top: 10px; margin-top: 16px; }
    .addon-label { font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 3px; color: #aaa; margin-bottom: 6px; }
    .addon-item { display: inline-block; font-size: 11px; margin-right: 16px; color: #555; font-weight: 300; }
    .choice-line { font-size: 11px; color: #666; margin: 2px 0; font-weight: 300; }
    .choice-label { font-weight: 500; text-transform: uppercase; font-size: 10px; letter-spacing: 2px; color: #999; }
    .daily-card { border: 1px solid #e5e7eb; border-radius: 4px; padding: 16px; }
    .daily-name { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 600; }
    .daily-price { font-size: 28px; font-weight: 300; color: #333; }
    .daily-day { font-size: 10px; text-transform: uppercase; letter-spacing: 4px; color: #aaa; font-weight: 300; }
    .section-footer { text-align: center; font-size: 9px; color: #bbb; margin-top: auto; padding-top: 12px; font-weight: 300; }
    @media print {
      html, body { background: white !important; color: #111 !important; font-family: 'Inter', sans-serif; }
      .print-section { padding: 0; box-shadow: none; }
      .print-footer-fixed { color: #bbb; font-family: 'Inter', sans-serif; font-weight: 300; }
    }
  `;

  /* rustic */
  return base + `
    @import url('https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Lora:wght@400;500;600;700&family=Source+Sans+3:wght@400;600;700&display=swap');
    html, body { background: #d6cfc4 !important; font-family: 'Source Sans 3', sans-serif; }
    .print-section { background: #faf6f0; color: #2c1810; padding: 18mm 20mm; box-shadow: 0 2px 8px rgba(0,0,0,.18); border: 3px double #8b7355; }
    .menu-header { font-family: 'Lora', serif; font-size: 12px; text-align: center; letter-spacing: 3px; text-transform: uppercase; color: #8b7355; border-bottom: 2px solid #8b7355; padding-bottom: 6px; margin-bottom: 8px; }
    .menu-header-logo { font-family: 'Alfa Slab One', cursive; font-size: 26px; text-align: center; color: #2c1810; margin-bottom: 2px; }
    .menu-header-stars { text-align: center; font-size: 16px; color: #8b7355; letter-spacing: 8px; margin-bottom: 4px; }
    .section-title { font-family: 'Alfa Slab One', cursive; font-size: 26px; color: #2c1810; margin-bottom: 4px; }
    .section-title-rule { height: 3px; background: linear-gradient(90deg, #8b7355, #c9a96e, #8b7355); margin-bottom: 16px; border-radius: 2px; }
    .item-row { display: flex; align-items: baseline; gap: 4px; margin-bottom: 8px; }
    .item-name { font-family: 'Lora', serif; font-weight: 700; font-size: 14px; white-space: nowrap; color: #2c1810; }
    .item-subtitle { font-family: 'Lora', serif; font-size: 12px; color: #8b7355; font-style: italic; }
    .item-dots { flex: 1; border-bottom: 1px dashed #c9a96e; margin: 0 4px; min-width: 20px; position: relative; top: -3px; }
    .item-price { font-weight: 700; font-size: 14px; white-space: nowrap; color: #2c1810; }
    .item-desc { font-size: 11px; color: #6b5a4e; margin: -4px 0 8px 0; line-height: 1.4; }
    .sub-title { font-family: 'Alfa Slab One', cursive; font-size: 16px; color: #2c1810; margin: 14px 0 4px; }
    .sub-title-rule { height: 2px; background: #c9a96e; margin-bottom: 8px; }
    .addon-box { background: #f0e8d8; border: 2px solid #c9a96e; border-radius: 8px; padding: 10px 14px; margin-top: 14px; }
    .addon-label { font-family: 'Lora', serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #8b7355; margin-bottom: 4px; }
    .addon-item { display: inline-block; font-size: 11px; margin-right: 12px; color: #4a3728; }
    .addon-star { color: #c9a96e; margin-right: 2px; }
    .choice-line { font-size: 11px; color: #5a4a3e; margin: 2px 0; }
    .choice-label { font-family: 'Lora', serif; font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; color: #8b7355; }
    .daily-card { border: 2px solid #8b7355; border-radius: 8px; padding: 14px; background: #f5efe5; }
    .daily-name { font-family: 'Alfa Slab One', cursive; font-size: 18px; color: #2c1810; }
    .daily-price { font-family: 'Alfa Slab One', cursive; font-size: 30px; color: #8b7355; }
    .daily-day { font-family: 'Lora', serif; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #8b7355; font-style: italic; }
    .section-footer { text-align: center; font-size: 9px; color: #a89880; margin-top: auto; padding-top: 12px; font-family: 'Lora', serif; font-style: italic; }
    .ornament { text-align: center; color: #c9a96e; font-size: 14px; letter-spacing: 8px; margin: 8px 0; }
    @media print {
      html, body { background: white !important; color: #2c1810 !important; font-family: 'Source Sans 3', sans-serif; }
      .print-section { padding: 0; box-shadow: none; background: #faf6f0 !important; border-color: #8b7355 !important; }
      .addon-box { background: #f0e8d8 !important; border-color: #c9a96e !important; }
      .daily-card { background: #f5efe5 !important; border-color: #8b7355 !important; }
      .section-title-rule { background: linear-gradient(90deg, #8b7355, #c9a96e, #8b7355) !important; }
      .print-footer-fixed { color: #a89880; font-family: 'Lora', serif; font-style: italic; }
    }
  `;
}

/* ─── Helpers ─── */
function fmtPrice(p: number) {
  return `$${p}`;
}

function PageHeader({ style }: { style: StyleKey }) {
  if (style === 'rustic') {
    return (
      <div style={{ marginBottom: 16 }}>
        <div className="menu-header-stars">★ ★ ★ ★ ★</div>
        <div className="menu-header-logo">American Heroes &amp; Brew</div>
        <div className="menu-header">Carlsbad, California</div>
      </div>
    );
  }
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="menu-header-logo">American Heroes &amp; Brew</div>
      <div className="menu-header">300 Carlsbad Village Dr, Suite 101 · (760) 994-0187</div>
    </div>
  );
}

function SectionHeader({ title, style }: { title: string; style: StyleKey }) {
  if (style === 'rustic') {
    return (
      <>
        <h1 className="section-title">{title}</h1>
        <div className="section-title-rule" />
      </>
    );
  }
  return <h1 className="section-title">{title}</h1>;
}

function SubHeader({ title, price, style }: { title: string; price?: number; style: StyleKey }) {
  if (style === 'rustic') {
    return (
      <>
        <div className="sub-title">
          {title}{price ? <span style={{ marginLeft: 8, fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, fontWeight: 700 }}>{fmtPrice(price)}</span> : null}
        </div>
        <div className="sub-title-rule" />
      </>
    );
  }
  return (
    <div className="sub-title">
      {title}{price ? <span style={{ marginLeft: 8, fontSize: 14, fontWeight: 600 }}>{fmtPrice(price)}</span> : null}
    </div>
  );
}

function ItemRow({ name, subtitle, description, price, style }: { name: string; subtitle?: string; description?: string; price: number; style: StyleKey }) {
  return (
    <>
      <div className="item-row">
        <span className="item-name">{name}</span>
        {subtitle && <span className="item-subtitle">{style === 'rustic' ? `— ${subtitle}` : `(${subtitle})`}</span>}
        {style !== 'minimal' && <span className="item-dots" />}
        {style === 'minimal' && <span style={{ flex: 1 }} />}
        <span className="item-price">{fmtPrice(price)}</span>
      </div>
      {description && <div className="item-desc">{description}</div>}
      {style === 'minimal' && <div className="item-divider" />}
    </>
  );
}

function AddOnBox({ addOns, label, style }: { addOns?: { name: string; price: string }[]; label?: string; style: StyleKey }) {
  if (!addOns?.length) return null;
  return (
    <div className="addon-box">
      <div className="addon-label">{label || 'Sides'}</div>
      <div>
        {addOns.map((a) => (
          <span key={a.name} className="addon-item">
            {style === 'rustic' && <span className="addon-star">★</span>}
            {a.name} <strong>{a.price}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

function ChoiceLines({ choices }: { choices?: { label: string; options: string[] }[] }) {
  if (!choices?.length) return null;
  return (
    <div style={{ marginTop: 4 }}>
      {choices.map((c) => (
        <div key={c.label} className="choice-line">
          <span className="choice-label">{c.label}:</span>{' '}{c.options.join(' · ')}
        </div>
      ))}
    </div>
  );
}

function VariantPills({ items, basePrice }: { items: { id: string; name: string; price: number }[]; basePrice?: number }) {
  if (items.length <= 1) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2, marginBottom: 4 }}>
      {items.map((it) => (
        <span key={it.id} style={{ fontSize: 10, background: 'rgba(0,0,0,.05)', borderRadius: 3, padding: '1px 6px' }}>
          {it.name}
          {it.price !== basePrice && ` ${fmtPrice(it.price)}`}
        </span>
      ))}
    </div>
  );
}

function PageFooter() {
  return (
    <div className="section-footer">
      American Heroes &amp; Brew · 300 Carlsbad Village Dr, Suite 101, Carlsbad CA 92008 · (760) 994-0187
    </div>
  );
}

/* ─── Section Renderers ─── */

function DailyLineupSection({ style }: { style: StyleKey }) {
  return (
    <div className="print-section" id="section-daily">
      <PageHeader style={style} />
      <SectionHeader title="Daily Lineup" style={style} />
      {style === 'rustic' && <div className="ornament">◆ ◆ ◆</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        {DAILY_SPECIALS.map((s) => (
          <div key={s.day} className="daily-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="daily-name">{s.name}</div>
                <div className="daily-day">{s.day}</div>
              </div>
              <div className="daily-price">{s.price}</div>
            </div>
            <div style={{ marginTop: 8 }}>
              {s.lines.map((l) => (
                <div key={l} style={{ fontSize: 13 }}>{l}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <PageFooter />
    </div>
  );
}

function StartersSection({ group, style }: { group: MenuGroup; style: StyleKey }) {
  return (
    <div className="print-section" id="section-starters">
      <PageHeader style={style} />
      <SectionHeader title="Starters" style={style} />
      {group.subGroups?.map((sub) => (
        <div key={sub.id} style={{ marginBottom: 14 }}>
          <SubHeader title={sub.name} price={sub.basePrice} style={style} />
          {sub.description && <div className="item-desc">{sub.description}</div>}
          <VariantPills items={sub.items} basePrice={sub.basePrice} />
          <ChoiceLines choices={sub.choices} />
          <AddOnBox addOns={sub.addOns} label={sub.addOnLabel} style={style} />
        </div>
      ))}
      <PageFooter />
    </div>
  );
}

function SaladsSection({ group, style }: { group: MenuGroup; style: StyleKey }) {
  return (
    <div className="print-section" id="section-salads">
      <PageHeader style={style} />
      <SectionHeader title="Salads" style={style} />
      {group.items.map((it) => (
        <ItemRow key={it.id} name={it.name} description={it.description} price={it.price} style={style} />
      ))}
      <AddOnBox addOns={group.addOns} label={group.addOnLabel} style={style} />
      <PageFooter />
    </div>
  );
}

function BurgersSection({ group, style }: { group: MenuGroup; style: StyleKey }) {
  return (
    <div className="print-section" id="section-burgers">
      <PageHeader style={style} />
      <SectionHeader title="Burgers" style={style} />
      {group.description && <div className="item-desc" style={{ fontSize: 12, marginBottom: 12 }}>{group.description}</div>}
      {group.items.map((it) => (
        <ItemRow key={it.id} name={it.name} subtitle={it.subtitle} description={it.description} price={it.price} style={style} />
      ))}
      <AddOnBox addOns={group.addOns} label={group.addOnLabel} style={style} />
      <PageFooter />
    </div>
  );
}

function HeroesAndHandheldsSection({ heroesGroup, handheldsGroup, style }: { heroesGroup: MenuGroup; handheldsGroup: MenuGroup; style: StyleKey }) {
  return (
    <div className="print-section" id="section-heroes">
      <PageHeader style={style} />
      <SectionHeader title="Heroes & Handhelds" style={style} />

      {heroesGroup.subGroups?.map((sub) => (
        <div key={sub.id} style={{ marginBottom: 12 }}>
          <SubHeader title={sub.name} price={sub.basePrice} style={style} />
          {sub.description && <div className="item-desc">{sub.description}</div>}
          <ChoiceLines choices={sub.choices} />
        </div>
      ))}

      {heroesGroup.items.map((it) => (
        <ItemRow key={it.id} name={it.name} subtitle={it.subtitle} description={it.description} price={it.price} style={style} />
      ))}
      <AddOnBox addOns={heroesGroup.addOns} label={heroesGroup.addOnLabel} style={style} />

      {style === 'rustic' ? (
        <div className="ornament" style={{ margin: '16px 0' }}>— ★ —</div>
      ) : (
        <div style={{ borderTop: '2px solid #ccc', marginTop: 18, paddingTop: 14 }} />
      )}

      <SubHeader title="Handhelds" style={style} />
      {handheldsGroup.subGroups?.map((sub) => (
        <div key={sub.id} style={{ marginBottom: 12 }}>
          <SubHeader title={sub.name} price={sub.basePrice} style={style} />
          {sub.description && <div className="item-desc">{sub.description}</div>}
          <ChoiceLines choices={sub.choices} />
          <AddOnBox addOns={sub.addOns} label={sub.addOnLabel} style={style} />
        </div>
      ))}
      <AddOnBox addOns={handheldsGroup.addOns} label={handheldsGroup.addOnLabel} style={style} />
      <PageFooter />
    </div>
  );
}

function SweetStuffSection({ group, style }: { group: MenuGroup; style: StyleKey }) {
  return (
    <div className="print-section" id="section-sweet">
      <PageHeader style={style} />
      <SectionHeader title="Sweet Stuff" style={style} />
      {group.items.map((it) => (
        <ItemRow key={it.id} name={it.name} description={it.description} price={it.price} style={style} />
      ))}
      <PageFooter />
    </div>
  );
}

/* ─── Kids Activity Pages ─── */
const KIDS_ACTIVITIES = [
  {
    id: 'coloring-hero',
    title: 'Color the Hero!',
    type: 'coloring' as const,
    svg: `<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="380" height="480" rx="20" fill="none" stroke="#333" stroke-width="2"/>
      <text x="200" y="50" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="bold">Color the Hero!</text>
      <!-- Shield -->
      <path d="M200 100 L260 130 L260 220 Q260 280 200 320 Q140 280 140 220 L140 130 Z" fill="none" stroke="#333" stroke-width="3"/>
      <path d="M200 140 L240 160 L240 220 Q240 260 200 290 Q160 260 160 220 L160 160 Z" fill="none" stroke="#333" stroke-width="1.5"/>
      <text x="200" y="230" text-anchor="middle" font-family="serif" font-size="48" font-weight="bold" fill="none" stroke="#333" stroke-width="2">H</text>
      <!-- Stars around shield -->
      <polygon points="100,120 105,135 120,135 108,144 113,158 100,150 87,158 92,144 80,135 95,135" fill="none" stroke="#333" stroke-width="1.5"/>
      <polygon points="300,120 305,135 320,135 308,144 313,158 300,150 287,158 292,144 280,135 295,135" fill="none" stroke="#333" stroke-width="1.5"/>
      <polygon points="200,80 204,92 217,92 207,100 210,112 200,105 190,112 193,100 183,92 196,92" fill="none" stroke="#333" stroke-width="1.5"/>
      <!-- Banner -->
      <path d="M120 340 Q200 320 280 340 L270 370 Q200 350 130 370 Z" fill="none" stroke="#333" stroke-width="2"/>
      <text x="200" y="362" text-anchor="middle" font-family="serif" font-size="14" fill="none" stroke="#333" stroke-width="1">HEROES &amp; BREW</text>
      <!-- Hot dog -->
      <ellipse cx="200" cy="420" rx="80" ry="20" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M130 410 Q200 390 270 410" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M140 420 Q170 412 200 415 Q230 412 260 420" fill="none" stroke="#333" stroke-width="1" stroke-dasharray="4"/>
      <text x="200" y="470" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#666">Color me in!</text>
    </svg>`,
  },
  {
    id: 'maze',
    title: 'Help the Hero Find the Burger!',
    type: 'maze' as const,
    svg: `<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="380" height="480" rx="20" fill="none" stroke="#333" stroke-width="2"/>
      <text x="200" y="50" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="bold">Help the Hero Find the Burger!</text>
      <!-- Start indicator -->
      <text x="45" y="90" text-anchor="middle" font-size="24">🦸</text>
      <text x="45" y="108" text-anchor="middle" font-size="10" fill="#666">START</text>
      <!-- Maze walls -->
      <rect x="30" y="115" width="340" height="310" fill="none" stroke="#333" stroke-width="3"/>
      <!-- Horizontal walls -->
      <line x1="30" y1="155" x2="120" y2="155" stroke="#333" stroke-width="2.5"/>
      <line x1="160" y1="155" x2="290" y2="155" stroke="#333" stroke-width="2.5"/>
      <line x1="70" y1="195" x2="200" y2="195" stroke="#333" stroke-width="2.5"/>
      <line x1="240" y1="195" x2="370" y2="195" stroke="#333" stroke-width="2.5"/>
      <line x1="30" y1="235" x2="100" y2="235" stroke="#333" stroke-width="2.5"/>
      <line x1="140" y1="235" x2="240" y2="235" stroke="#333" stroke-width="2.5"/>
      <line x1="280" y1="235" x2="330" y2="235" stroke="#333" stroke-width="2.5"/>
      <line x1="70" y1="275" x2="160" y2="275" stroke="#333" stroke-width="2.5"/>
      <line x1="200" y1="275" x2="370" y2="275" stroke="#333" stroke-width="2.5"/>
      <line x1="30" y1="315" x2="130" y2="315" stroke="#333" stroke-width="2.5"/>
      <line x1="170" y1="315" x2="260" y2="315" stroke="#333" stroke-width="2.5"/>
      <line x1="300" y1="315" x2="370" y2="315" stroke="#333" stroke-width="2.5"/>
      <line x1="70" y1="355" x2="200" y2="355" stroke="#333" stroke-width="2.5"/>
      <line x1="240" y1="355" x2="330" y2="355" stroke="#333" stroke-width="2.5"/>
      <line x1="30" y1="385" x2="100" y2="385" stroke="#333" stroke-width="2.5"/>
      <line x1="140" y1="385" x2="290" y2="385" stroke="#333" stroke-width="2.5"/>
      <!-- Vertical walls -->
      <line x1="120" y1="115" x2="120" y2="155" stroke="#333" stroke-width="2.5"/>
      <line x1="290" y1="115" x2="290" y2="155" stroke="#333" stroke-width="2.5"/>
      <line x1="200" y1="155" x2="200" y2="195" stroke="#333" stroke-width="2.5"/>
      <line x1="100" y1="195" x2="100" y2="235" stroke="#333" stroke-width="2.5"/>
      <line x1="280" y1="235" x2="280" y2="275" stroke="#333" stroke-width="2.5"/>
      <line x1="160" y1="275" x2="160" y2="315" stroke="#333" stroke-width="2.5"/>
      <line x1="260" y1="315" x2="260" y2="355" stroke="#333" stroke-width="2.5"/>
      <line x1="100" y1="355" x2="100" y2="385" stroke="#333" stroke-width="2.5"/>
      <line x1="330" y1="355" x2="330" y2="425" stroke="#333" stroke-width="2.5"/>
      <!-- End indicator -->
      <text x="355" y="418" text-anchor="middle" font-size="24">🍔</text>
      <text x="355" y="438" text-anchor="middle" font-size="10" fill="#666">FINISH</text>
      <text x="200" y="475" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#666">Can you find the way?</text>
    </svg>`,
  },
  {
    id: 'wordsearch',
    title: 'Word Search',
    type: 'game' as const,
    svg: `<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="380" height="480" rx="20" fill="none" stroke="#333" stroke-width="2"/>
      <text x="200" y="48" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="bold">Heroes Word Search</text>
      <text x="200" y="68" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#666">Find the words hidden in the grid!</text>
      ${(() => {
        const grid = [
          ['B','U','R','G','E','R','S','H','W','I','N','G','S'],
          ['T','A','C','O','S','F','R','I','E','S','P','H','D'],
          ['N','A','C','H','O','S','L','I','D','E','R','S','O'],
          ['S','A','L','A','D','K','E','Y','L','I','M','E','G'],
          ['H','E','R','O','E','S','C','A','R','L','S','B','S'],
          ['P','H','I','L','L','Y','U','C','B','R','E','W','M'],
          ['C','H','U','R','R','O','S','A','U','C','E','P','O'],
          ['P','I','C','K','L','E','S','O','N','I','O','N','Z'],
          ['M','A','C','C','H','E','E','S','E','B','A','C','Z'],
          ['C','H','I','C','K','E','N','L','E','T','T','U','A'],
          ['K','E','T','C','H','U','P','R','E','T','Z','E','R'],
          ['A','V','O','C','A','D','O','C','O','B','B','Q','E'],
          ['P','A','S','A','D','E','N','A','I','C','E','T','L'],
        ];
        const cellSize = 24;
        const startX = 46;
        const startY = 92;
        let cells = '';
        grid.forEach((row, ri) => {
          row.forEach((ch, ci) => {
            const x = startX + ci * cellSize;
            const y = startY + ri * cellSize;
            cells += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="none" stroke="#ddd" stroke-width="0.5"/>`;
            cells += `<text x="${x + cellSize/2}" y="${y + cellSize/2 + 5}" text-anchor="middle" font-family="monospace" font-size="14" font-weight="600">${ch}</text>`;
          });
        });
        return cells;
      })()}
      <text x="36" y="420" font-family="sans-serif" font-size="12" font-weight="bold">Find these words:</text>
      <text x="36" y="440" font-family="sans-serif" font-size="11">BURGERS · WINGS · TACOS · FRIES</text>
      <text x="36" y="456" font-family="sans-serif" font-size="11">NACHOS · HEROES · PHILLY · BREW</text>
      <text x="36" y="472" font-family="sans-serif" font-size="11">CHURROS · SALAD · CARLSBAD</text>
    </svg>`,
  },
  {
    id: 'connect-dots',
    title: 'Connect the Dots',
    type: 'game' as const,
    svg: `<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="380" height="480" rx="20" fill="none" stroke="#333" stroke-width="2"/>
      <text x="200" y="48" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="bold">Connect the Dots</text>
      <text x="200" y="68" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#666">Connect 1-30 to reveal the picture!</text>
      ${(() => {
        // Star shape outline
        const points = [
          [200,90],[218,150],[280,150],[230,190],[248,252],
          [200,218],[152,252],[170,190],[120,150],[182,150],
          [200,90],[195,120],[210,130],[240,145],[260,158],
          [250,175],[255,200],[245,230],[228,245],[210,235],
          [200,218],[190,235],[172,245],[155,230],[145,200],
          [150,175],[140,158],[160,145],[190,130],[205,120],
        ];
        return points.map((p, i) => {
          const num = i + 1;
          return `<circle cx="${p[0]}" cy="${p[1]+50}" r="8" fill="white" stroke="#333" stroke-width="1.5"/>
                  <text x="${p[0]}" y="${p[1]+54}" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold">${num}</text>`;
        }).join('');
      })()}
      <text x="200" y="460" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#333" font-weight="bold">What is it? A ⭐ STAR ⭐!</text>
      <text x="200" y="480" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#666">Like the stars on our Heroes shield!</text>
    </svg>`,
  },
  {
    id: 'coloring-food',
    title: 'Color the Food!',
    type: 'coloring' as const,
    svg: `<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="380" height="480" rx="20" fill="none" stroke="#333" stroke-width="2"/>
      <text x="200" y="48" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="bold">Color the Food!</text>
      <!-- Burger -->
      <text x="120" y="88" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold">Burger</text>
      <!-- Top bun -->
      <path d="M60 130 Q120 80 180 130 Z" fill="none" stroke="#333" stroke-width="2.5"/>
      <!-- sesame seeds -->
      <ellipse cx="100" cy="112" rx="4" ry="3" fill="none" stroke="#333" stroke-width="1"/>
      <ellipse cx="130" cy="105" rx="4" ry="3" fill="none" stroke="#333" stroke-width="1"/>
      <ellipse cx="145" cy="118" rx="4" ry="3" fill="none" stroke="#333" stroke-width="1"/>
      <!-- Lettuce -->
      <path d="M55 135 Q70 128 85 135 Q100 128 115 135 Q130 128 145 135 Q160 128 175 135 Q185 128 190 135" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Patty -->
      <rect x="58" y="140" width="124" height="18" rx="4" fill="none" stroke="#333" stroke-width="2.5"/>
      <!-- Cheese drip -->
      <path d="M58 160 L58 168 Q70 175 82 168 L82 160" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M100 160 L100 170 Q112 177 124 170 L124 160" fill="none" stroke="#333" stroke-width="1.5"/>
      <rect x="58" y="160" width="124" height="10" fill="none" stroke="#333" stroke-width="1.5"/>
      <!-- Bottom bun -->
      <path d="M55 172 L185 172 Q185 195 120 195 Q55 195 55 172 Z" fill="none" stroke="#333" stroke-width="2.5"/>

      <!-- Hot Dog -->
      <text x="300" y="88" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold">Hot Dog</text>
      <!-- Bun -->
      <path d="M240 180 Q300 90 360 180" fill="none" stroke="#333" stroke-width="2.5"/>
      <line x1="240" y1="180" x2="360" y2="180" stroke="#333" stroke-width="2"/>
      <!-- Sausage -->
      <ellipse cx="300" cy="165" rx="55" ry="12" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Mustard zigzag -->
      <polyline points="260,155 268,145 276,155 284,145 292,155 300,145 308,155 316,145 324,155 332,145 340,155" fill="none" stroke="#333" stroke-width="1.5"/>

      <!-- Taco -->
      <text x="120" y="230" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold">Taco</text>
      <path d="M60 320 Q120 240 180 320" fill="none" stroke="#333" stroke-width="2.5"/>
      <line x1="60" y1="320" x2="180" y2="320" stroke="#333" stroke-width="2"/>
      <!-- Toppings -->
      <circle cx="90" cy="295" r="8" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="120" cy="285" r="10" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="150" cy="295" r="7" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M85 305 Q100 298 115 305 Q130 298 145 305 Q160 298 170 305" fill="none" stroke="#333" stroke-width="1"/>

      <!-- Ice Cream -->
      <text x="300" y="230" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold">Ice Cream</text>
      <!-- Cone -->
      <polygon points="270,340 330,340 300,420" fill="none" stroke="#333" stroke-width="2.5"/>
      <!-- Cross-hatch on cone -->
      <line x1="276" y1="350" x2="312" y2="400" stroke="#333" stroke-width="1"/>
      <line x1="288" y1="350" x2="318" y2="390" stroke="#333" stroke-width="1"/>
      <line x1="300" y1="350" x2="308" y2="365" stroke="#333" stroke-width="1"/>
      <line x1="324" y1="350" x2="288" y2="400" stroke="#333" stroke-width="1"/>
      <line x1="312" y1="350" x2="282" y2="390" stroke="#333" stroke-width="1"/>
      <!-- Scoops -->
      <circle cx="285" cy="310" r="32" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="315" cy="310" r="32" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="300" cy="280" r="32" fill="none" stroke="#333" stroke-width="2.5"/>
      <!-- Cherry -->
      <circle cx="300" cy="250" r="8" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M300 242 Q310 230 305 220" fill="none" stroke="#333" stroke-width="1.5"/>

      <text x="200" y="460" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#333" font-weight="bold">Color each food item with your favorite colors!</text>
      <text x="200" y="478" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#666">Which one is your favorite at Heroes &amp; Brew?</text>
    </svg>`,
  },
];

function KidsSection({ group, style }: { group: MenuGroup; style: StyleKey }) {
  return (
    <>
      {/* Kids Menu Page */}
      <div className="print-section" id="section-kids">
        <PageHeader style={style} />
        <SectionHeader title="Kids Menu" style={style} />
        {group.basePrice && (
          <div style={{ fontSize: 13, marginBottom: 16, color: style === 'rustic' ? '#6b5a4e' : '#555' }}>
            All items {fmtPrice(group.basePrice)}. Includes drink and side.
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {group.items.map((it) => (
            <div key={it.id} style={{
              border: style === 'rustic' ? '2px solid #8b7355' : style === 'classic' ? '2px solid #1a1a1a' : '1px solid #e5e7eb',
              borderRadius: 8,
              padding: 16,
              textAlign: 'center',
              background: style === 'rustic' ? '#f5efe5' : 'white',
            }}>
              <div style={{
                fontSize: 40,
                marginBottom: 8,
              }}>
                {it.name === 'Mac & Cheese' ? '🧀' : it.name === 'Corn Dog' ? '🌽' : it.name === 'Chicken Tenders' ? '🍗' : it.name === 'Burger' ? '🍔' : '🌭'}
              </div>
              <div style={{
                fontFamily: style === 'rustic' ? "'Alfa Slab One', cursive" : style === 'classic' ? "'Oswald', sans-serif" : "'Playfair Display', serif",
                fontSize: 18,
                fontWeight: 700,
              }}>
                {it.name}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, color: style === 'rustic' ? '#8b7355' : style === 'classic' ? '#1a1a1a' : '#444' }}>
                {fmtPrice(it.price)}
              </div>
            </div>
          ))}
        </div>
        <ChoiceLines choices={group.choices} />
        <AddOnBox addOns={group.addOns} label={group.addOnLabel} style={style} />

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#888' }}>
          Ask your server for crayons!
        </div>
        <PageFooter />
      </div>

      {/* Activity Pages */}
      {KIDS_ACTIVITIES.map((activity) => (
        <div key={activity.id} className="print-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10mm' }}>
          <div
            style={{ width: '100%', maxWidth: 400 }}
            dangerouslySetInnerHTML={{ __html: activity.svg }}
          />
        </div>
      ))}
    </>
  );
}

/* ─── Main Component ─── */
export default function PrintableMenuClient({ menus }: { menus: Menu[] }) {
  const [selected, setSelected] = useState<Set<SectionKey>>(new Set(['daily', 'starters', 'salads', 'burgers', 'heroes', 'sweet', 'kids']));
  const [style, setStyle] = useState<StyleKey>('classic');

  const groups = menus[0]?.groups || [];
  const find = (id: string) => groups.find((g) => g.id === id)!;

  const toggle = (key: SectionKey) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(SECTIONS.map((s) => s.key)));
  const selectNone = () => setSelected(new Set());

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: getStyleCSS(style) }} />

      {/* Control bar */}
      <div className="no-print" style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#111827', color: 'white',
        padding: '12px 16px',
        boxShadow: '0 4px 12px rgba(0,0,0,.3)',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Top row: title + style selector + print */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Print Menus</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Style selector */}
              <div style={{ display: 'flex', gap: 4 }}>
                {STYLES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setStyle(s.key)}
                    title={s.desc}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      border: 'none',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all .15s',
                      background: style === s.key ? '#f59e0b' : '#374151',
                      color: style === s.key ? '#000' : '#9ca3af',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => window.print()}
                style={{
                  background: '#f59e0b',
                  color: '#000',
                  fontWeight: 700,
                  padding: '8px 20px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                🖨️ Print Selected
              </button>
            </div>
          </div>

          {/* Section checkboxes */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={selectAll} style={{ background: 'none', border: 'none', color: '#f59e0b', fontSize: 12, cursor: 'pointer', padding: 0 }}>Select All</button>
            <button onClick={selectNone} style={{ background: 'none', border: 'none', color: '#f59e0b', fontSize: 12, cursor: 'pointer', padding: 0 }}>Clear</button>
            <span style={{ color: '#4b5563' }}>|</span>
            {SECTIONS.map((s) => (
              <label key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selected.has(s.key)}
                  onChange={() => toggle(s.key)}
                  style={{ accentColor: '#f59e0b', width: 16, height: 16 }}
                />
                {s.label}
              </label>
            ))}
          </div>

          {/* Style description */}
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 6 }}>
            Style: {STYLES.find((s) => s.key === style)?.desc}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ minHeight: '100vh', padding: '24px 16px' }}>
        {selected.has('daily') && <DailyLineupSection style={style} />}
        {selected.has('starters') && <StartersSection group={find('g-starters')} style={style} />}
        {selected.has('salads') && <SaladsSection group={find('g-salads')} style={style} />}
        {selected.has('burgers') && <BurgersSection group={find('g-burgers')} style={style} />}
        {selected.has('heroes') && (
          <HeroesAndHandheldsSection heroesGroup={find('g-heroes')} handheldsGroup={find('g-handhelds')} style={style} />
        )}
        {selected.has('sweet') && <SweetStuffSection group={find('g-sweet')} style={style} />}
        {selected.has('kids') && <KidsSection group={find('g-kids')} style={style} />}

        {selected.size === 0 && (
          <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: 80, fontSize: 18 }}>
            Select menu sections above to preview &amp; print
          </div>
        )}
      </div>

      {/* Print footer */}
      <div className="print-footer-fixed">American Heroes &amp; Brew · 300 Carlsbad Village Dr, Suite 101, Carlsbad CA 92008 · (760) 994-0187</div>
    </>
  );
}
