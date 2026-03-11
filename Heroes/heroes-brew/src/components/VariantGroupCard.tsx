'use client';

import { MenuGroup } from '@/types';

interface VariantGroupCardProps {
  group: MenuGroup;
  elevated?: boolean;
}

export default function VariantGroupCard({ group, elevated }: VariantGroupCardProps) {
  const hasDescriptions = group.items.some((item) => item.description);
  const bgClass = elevated
    ? 'bg-card-elevated/70'
    : 'bg-card/70';

  return (
    <div className={`rounded-md backdrop-blur-md border border-white/10 p-5 transition-all duration-200 ${bgClass}`}>
      {/* Header: name + price */}
      <div className="flex items-baseline justify-between gap-4 mb-2">
        <h2 className="text-xl font-bold text-foreground uppercase tracking-wide">
          {group.name}
        </h2>
        {group.basePrice != null && (
          <span className="text-accent font-mono font-bold text-lg shrink-0">
            {group.basePrice}
          </span>
        )}
      </div>

      {/* Description */}
      {group.description && (
        <p className="text-sm text-muted mb-4">
          {group.description.split(/(\+\d+)/).map((part, i) =>
            /^\+\d+$/.test(part)
              ? <span key={i} className="text-accent font-mono font-semibold">{part}</span>
              : part
          )}
        </p>
      )}

      {/* Variant items as sub-cards in a responsive grid */}
      {group.items.length > 1 && (
        <div className={`grid gap-2 mb-4 ${hasDescriptions ? 'sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {group.items.map((item) => (
            <div
              key={item.id}
              className="rounded-md bg-white/5 border border-border/60 px-4 py-3 hover:border-accent/30 transition-colors"
            >
              <span className="font-medium text-foreground text-sm">
                {item.name}
                {item.subtitle && <span className="text-xs font-bold text-muted ml-1">[{item.subtitle}]</span>}
              </span>
              {item.description && (
                <p className="text-xs text-muted mt-1 line-clamp-2">{item.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Choice groups as inline pills (Philly cheese/toppings, Kids drink/side) */}
      {group.choices && group.choices.length > 0 && (
        <div className="space-y-2.5 mb-4">
          {group.choices.map((choice) => (
            <div key={choice.label} className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-muted font-semibold mr-1">
                {choice.label}:
              </span>
              {choice.options.map((opt) => (
                <span
                  key={opt}
                  className="inline-block rounded-full border border-dashed border-muted/50 bg-white/[0.03] px-3 py-1 text-sm text-foreground/80"
                >
                  {opt}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Mods */}
      {group.mods && group.mods.length > 0 && (
        <div className="border-t border-border pt-3 mb-2">
          <span className="text-xs uppercase tracking-wider text-muted font-semibold mb-2 block">Mods</span>
          <div className="flex flex-wrap gap-2">
            {group.mods.map((mod) => (
              <span
                key={mod.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm"
              >
                <span className="text-foreground/70">{mod.name}</span>
                <span className="text-accent font-mono font-semibold text-xs">{mod.price}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add-ons */}
      {group.addOns && group.addOns.length > 0 && (
        <div className="border-t border-border pt-3">
          <span className="text-xs uppercase tracking-wider text-muted font-semibold mb-2 block">{group.addOnLabel || 'Sides'}</span>
          <div className="flex flex-wrap gap-2">
            {group.addOns.map((addOn) => (
              <span
                key={addOn.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm"
                title={addOn.description || undefined}
              >
                <span className="text-foreground/70">{addOn.name}</span>
                <span className="text-accent font-mono font-semibold text-xs">{addOn.price}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
