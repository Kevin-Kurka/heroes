'use client';

import { useState } from 'react';
import { Menu, MenuGroup } from '@/types';

/* ─── Daily Specials (synced with HomePageClient) ─── */
const DAILY_SPECIALS = [
  {
    day: 'Monday',
    name: 'Monday Madness',
    price: '$4',
    lines: ['Sliders [Pulled Pork, Beef]', 'Beer [Select Drafts]'],
  },
  {
    day: 'Tuesday',
    name: 'Taco Tuesday',
    price: '$3',
    lines: ['Tacos [Carnitas, Carne Asada]', 'Beer [Modelo, Ultra]'],
  },
  {
    day: 'Wednesday',
    name: 'Wings & Well Wednesday',
    price: '$2',
    lines: ['Signature Wings each', 'Drinks off'],
  },
  {
    day: 'Thursday',
    name: 'Thirsty Thursday',
    price: '$5',
    lines: ['Burgers off', 'Select Drafts each'],
  },
];

/* ─── helpers ─── */
function fmtPrice(p: number) {
  return `$${p}`;
}

function AddOnPills({ addOns, label }: { addOns?: { name: string; price: string }[]; label?: string }) {
  if (!addOns?.length) return null;
  return (
    <div className="mt-1">
      <span className="text-[9px] font-bold tracking-widest uppercase opacity-60">{label || 'Sides'}</span>
      <div className="flex flex-wrap gap-1 mt-0.5">
        {addOns.map((a) => (
          <span key={a.name} className="text-[9px] border border-gray-300 rounded px-1.5 py-0.5">
            {a.name} <span className="font-semibold">{a.price}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function ChoicePills({ choices }: { choices?: { label: string; options: string[] }[] }) {
  if (!choices?.length) return null;
  return (
    <div className="mt-1">
      {choices.map((c) => (
        <div key={c.label} className="text-[9px]">
          <span className="font-bold uppercase tracking-widest opacity-60">{c.label}:</span>{' '}
          <span>{c.options.join(' · ')}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Section Renderers ─── */

function DailyLineupSection() {
  return (
    <div className="print-section" id="section-daily">
      <h1 className="section-title">Daily Lineup</h1>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {DAILY_SPECIALS.map((s) => (
          <div key={s.day} className="border border-gray-300 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-lg font-bold">{s.name}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">{s.day}</div>
              </div>
              <div className="text-2xl font-black">{s.price}</div>
            </div>
            <div className="mt-2 space-y-0.5">
              {s.lines.map((l) => (
                <div key={l} className="text-sm">{l}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StartersSection({ group }: { group: MenuGroup }) {
  return (
    <div className="print-section" id="section-starters">
      <h1 className="section-title">Starters</h1>
      <div className="space-y-4 mt-3">
        {group.subGroups?.map((sub) => (
          <div key={sub.id}>
            <div className="flex items-baseline gap-2 border-b border-gray-200 pb-1 mb-1">
              <h2 className="text-base font-bold">{sub.name}</h2>
              {sub.basePrice && <span className="text-sm font-semibold">{fmtPrice(sub.basePrice)}</span>}
            </div>
            {sub.description && <p className="text-xs text-gray-600 mb-1">{sub.description}</p>}
            {/* Variant items */}
            {sub.items.length > 1 && (
              <div className="flex flex-wrap gap-1">
                {sub.items.map((it) => (
                  <span key={it.id} className="text-[10px] bg-gray-100 rounded px-1.5 py-0.5">
                    {it.name}
                    {it.price !== sub.basePrice && ` ${fmtPrice(it.price)}`}
                  </span>
                ))}
              </div>
            )}
            <ChoicePills choices={sub.choices} />
            <AddOnPills addOns={sub.addOns} label={sub.addOnLabel} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SaladsSection({ group }: { group: MenuGroup }) {
  return (
    <div className="print-section" id="section-salads">
      <h1 className="section-title">Salads</h1>
      <div className="space-y-2 mt-3">
        {group.items.map((it) => (
          <div key={it.id} className="flex justify-between border-b border-gray-100 pb-1">
            <div>
              <span className="font-semibold text-sm">{it.name}</span>
              {it.description && <p className="text-xs text-gray-600">{it.description}</p>}
            </div>
            <span className="font-semibold text-sm whitespace-nowrap ml-2">{fmtPrice(it.price)}</span>
          </div>
        ))}
      </div>
      <AddOnPills addOns={group.addOns} label={group.addOnLabel} />
    </div>
  );
}

function BurgersSection({ group }: { group: MenuGroup }) {
  return (
    <div className="print-section" id="section-burgers">
      <h1 className="section-title">Burgers</h1>
      {group.description && <p className="text-xs text-gray-600 mt-1">{group.description}</p>}
      <div className="space-y-2 mt-3">
        {group.items.map((it) => (
          <div key={it.id} className="flex justify-between border-b border-gray-100 pb-1">
            <div>
              <span className="font-semibold text-sm">{it.name}</span>
              {it.subtitle && <span className="text-xs text-gray-500 ml-1">({it.subtitle})</span>}
              {it.description && <p className="text-xs text-gray-600">{it.description}</p>}
            </div>
            <span className="font-semibold text-sm whitespace-nowrap ml-2">{fmtPrice(it.price)}</span>
          </div>
        ))}
      </div>
      <AddOnPills addOns={group.addOns} label={group.addOnLabel} />
    </div>
  );
}

function HeroesAndHandheldsSection({
  heroesGroup,
  handheldsGroup,
}: {
  heroesGroup: MenuGroup;
  handheldsGroup: MenuGroup;
}) {
  return (
    <div className="print-section" id="section-heroes">
      <h1 className="section-title">Heroes & Handhelds</h1>

      {/* Philly subgroup */}
      {heroesGroup.subGroups?.map((sub) => (
        <div key={sub.id} className="mt-3">
          <div className="flex items-baseline gap-2 border-b border-gray-200 pb-1 mb-1">
            <h2 className="text-base font-bold">{sub.name}</h2>
            {sub.basePrice && <span className="text-sm font-semibold">{fmtPrice(sub.basePrice)}</span>}
          </div>
          {sub.description && <p className="text-xs text-gray-600 mb-1">{sub.description}</p>}
          <ChoicePills choices={sub.choices} />
        </div>
      ))}

      {/* Hero items */}
      <div className="space-y-2 mt-3">
        {heroesGroup.items.map((it) => (
          <div key={it.id} className="flex justify-between border-b border-gray-100 pb-1">
            <div>
              <span className="font-semibold text-sm">{it.name}</span>
              {it.subtitle && <span className="text-xs text-gray-500 ml-1">({it.subtitle})</span>}
              {it.description && <p className="text-xs text-gray-600">{it.description}</p>}
            </div>
            <span className="font-semibold text-sm whitespace-nowrap ml-2">{fmtPrice(it.price)}</span>
          </div>
        ))}
      </div>
      <AddOnPills addOns={heroesGroup.addOns} label={heroesGroup.addOnLabel} />

      {/* Divider */}
      <div className="border-t-2 border-gray-300 mt-4 pt-3">
        <h2 className="text-base font-bold mb-2">Handhelds</h2>
      </div>

      {/* Handhelds subgroups */}
      {handheldsGroup.subGroups?.map((sub) => (
        <div key={sub.id} className="mb-3">
          <div className="flex items-baseline gap-2 border-b border-gray-200 pb-1 mb-1">
            <h3 className="text-sm font-bold">{sub.name}</h3>
            {sub.basePrice && <span className="text-sm font-semibold">{fmtPrice(sub.basePrice)}</span>}
          </div>
          {sub.description && <p className="text-xs text-gray-600 mb-1">{sub.description}</p>}
          <ChoicePills choices={sub.choices} />
          <AddOnPills addOns={sub.addOns} label={sub.addOnLabel} />
        </div>
      ))}
      <AddOnPills addOns={handheldsGroup.addOns} label={handheldsGroup.addOnLabel} />
    </div>
  );
}

function SweetStuffSection({ group }: { group: MenuGroup }) {
  return (
    <div className="print-section" id="section-sweet">
      <h1 className="section-title">Sweet Stuff</h1>
      <div className="space-y-2 mt-3">
        {group.items.map((it) => (
          <div key={it.id} className="flex justify-between border-b border-gray-100 pb-1">
            <div>
              <span className="font-semibold text-sm">{it.name}</span>
              {it.description && <p className="text-xs text-gray-600">{it.description}</p>}
            </div>
            <span className="font-semibold text-sm whitespace-nowrap ml-2">{fmtPrice(it.price)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KidsSection({ group }: { group: MenuGroup }) {
  return (
    <div className="print-section" id="section-kids">
      <h1 className="section-title">Kids Menu</h1>
      {group.basePrice && <p className="text-xs text-gray-600 mt-1">All items {fmtPrice(group.basePrice)}. Includes drink and side.</p>}
      <div className="space-y-1 mt-3">
        {group.items.map((it) => (
          <div key={it.id} className="flex justify-between border-b border-gray-100 pb-1">
            <span className="font-semibold text-sm">{it.name}</span>
            <span className="font-semibold text-sm">{fmtPrice(it.price)}</span>
          </div>
        ))}
      </div>
      <ChoicePills choices={group.choices} />
      <AddOnPills addOns={group.addOns} label={group.addOnLabel} />
    </div>
  );
}

/* ─── Main Component ─── */

type SectionKey = 'daily' | 'starters' | 'salads' | 'burgers' | 'heroes' | 'sweet' | 'kids';

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: 'daily', label: 'Daily Lineup' },
  { key: 'starters', label: 'Starters' },
  { key: 'salads', label: 'Salads' },
  { key: 'burgers', label: 'Burgers' },
  { key: 'heroes', label: 'Heroes & Handhelds' },
  { key: 'sweet', label: 'Sweet Stuff' },
  { key: 'kids', label: 'Kids' },
];

export default function PrintableMenuClient({ menus }: { menus: Menu[] }) {
  const [selected, setSelected] = useState<Set<SectionKey>>(new Set(['daily', 'starters', 'salads', 'burgers', 'heroes', 'sweet', 'kids']));

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
      {/* Print-specific styles — also hides site nav/chrome */}
      <style dangerouslySetInnerHTML={{ __html: `
        nav, header, .bottom-nav { display: none !important; }
        main { padding-top: 0 !important; padding-bottom: 0 !important; min-height: auto !important; }
        html, body { background: #f3f4f6 !important; }
        @media print {
          .no-print { display: none !important; }
          html, body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-section { page-break-before: always; padding: 0; }
          .print-section:first-child { page-break-before: avoid; }
          @page { size: A4; margin: 15mm 20mm; }
          .section-title { font-size: 24px; font-weight: 800; border-bottom: 3px solid black; padding-bottom: 4px; }
          .print-footer { display: block !important; position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 9px; color: #999; padding: 4px 0; }
        }
        @media screen {
          .print-footer { display: none; }
          .print-section {
            background: white; color: black; max-width: 210mm; margin: 0 auto 20px;
            padding: 15mm 20mm; box-shadow: 0 1px 3px rgba(0,0,0,.2); border-radius: 4px;
            min-height: 280mm;
          }
          .section-title { font-size: 24px; font-weight: 800; border-bottom: 3px solid black; padding-bottom: 4px; }
        }
      ` }} />

      {/* Control bar — hidden when printing */}
      <div className="no-print sticky top-0 z-50 bg-gray-900 text-white px-4 py-3 shadow-lg">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-bold">Print Menus</h1>
            <button
              onClick={() => window.print()}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-2 rounded-lg text-sm transition-colors"
            >
              Print Selected
            </button>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={selectAll} className="text-xs text-amber-400 hover:underline">Select All</button>
            <button onClick={selectNone} className="text-xs text-amber-400 hover:underline">Clear</button>
            <span className="text-gray-500">|</span>
            {SECTIONS.map((s) => (
              <label key={s.key} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.has(s.key)}
                  onChange={() => toggle(s.key)}
                  className="accent-amber-500 w-4 h-4"
                />
                {s.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Page content area */}
      <div className="bg-gray-100 min-h-screen py-6 px-4">
        {selected.has('daily') && <DailyLineupSection />}
        {selected.has('starters') && <StartersSection group={find('g-starters')} />}
        {selected.has('salads') && <SaladsSection group={find('g-salads')} />}
        {selected.has('burgers') && <BurgersSection group={find('g-burgers')} />}
        {selected.has('heroes') && (
          <HeroesAndHandheldsSection heroesGroup={find('g-heroes')} handheldsGroup={find('g-handhelds')} />
        )}
        {selected.has('sweet') && <SweetStuffSection group={find('g-sweet')} />}
        {selected.has('kids') && <KidsSection group={find('g-kids')} />}

        {selected.size === 0 && (
          <div className="text-center text-gray-400 mt-20 text-lg">Select menu sections above to preview & print</div>
        )}
      </div>

      {/* Print footer */}
      <div className="print-footer">American Heroes & Brew · 300 Carlsbad Village Dr, Suite 101, Carlsbad CA 92008 · (760) 994-0187</div>
    </>
  );
}
