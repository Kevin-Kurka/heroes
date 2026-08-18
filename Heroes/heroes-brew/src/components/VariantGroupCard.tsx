'use client';

import type { ReactNode } from 'react';
import { MenuGroup } from '@/types';
import { SHOW_PRICES, stripPriceTokens } from '@/lib/config';
import MenuCard from '@/components/MenuCard';

interface VariantGroupCardProps {
  group: MenuGroup;
  elevated?: boolean;
}

function Tile({ children }: { children: ReactNode }) {
  return <div className="rounded-xl bg-white/5 p-4">{children}</div>;
}

function ChoicePills({ group }: { group: MenuGroup }) {
  if (!group.choices?.length) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {group.choices.map((choice) => (
        <Tile key={choice.label}>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
            {choice.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {choice.options.map((opt) => (
              <span
                key={opt}
                className="inline-block rounded-full bg-white/5 px-3 py-1 text-sm text-foreground/80"
              >
                {stripPriceTokens(opt)}
              </span>
            ))}
          </div>
        </Tile>
      ))}
    </div>
  );
}

function ChipRow({
  label,
  chips,
}: {
  label: string;
  chips: { name: string; price: string; description?: string }[];
}) {
  if (!chips.length) return null;
  return (
    <Tile>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">{label}</p>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip.name}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-sm"
            title={chip.description || undefined}
          >
            <span className="text-foreground/75">{chip.name}</span>
            {SHOW_PRICES && (
              <span className="font-mono text-xs font-semibold text-accent">{chip.price}</span>
            )}
          </span>
        ))}
      </div>
    </Tile>
  );
}

export default function VariantGroupCard({ group }: VariantGroupCardProps) {
  const description = group.description ? stripPriceTokens(group.description) : undefined;
  const loneItem = group.items.length === 1 ? group.items[0] : null;
  const groupIsTheItem = Boolean(loneItem && loneItem.name === group.name);
  const showItemList = group.items.length > 1 || (Boolean(loneItem) && !groupIsTheItem);

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {group.name}
        </h2>
        {SHOW_PRICES && group.basePrice != null && (
          <span className="shrink-0 font-mono text-lg font-semibold text-accent">{group.basePrice}</span>
        )}
      </div>

      {description && (
        <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>
      )}

      {showItemList && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          {group.items.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <div className="space-y-3">
        <ChoicePills group={group} />
        <ChipRow label="Mods" chips={group.mods ?? []} />
        <ChipRow label={group.addOnLabel || 'Add'} chips={group.addOns ?? []} />
      </div>
    </section>
  );
}
