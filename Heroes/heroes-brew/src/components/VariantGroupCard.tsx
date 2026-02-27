'use client';

import { MenuGroup } from '@/types';

interface VariantGroupCardProps {
  group: MenuGroup;
  elevated?: boolean;
}

export default function VariantGroupCard({ group, elevated }: VariantGroupCardProps) {
  const hasDescriptions = group.items.some((item) => item.description);
  const bgClass = elevated
    ? 'bg-card-elevated'
    : 'bg-card';

  return (
    <div className={`rounded-md border border-border p-5 transition-all duration-200 ${bgClass}`}>
      {/* Header: name + price */}
      <div className="flex items-baseline justify-between gap-4 mb-2">
        <h2 className="text-xl font-bold text-foreground uppercase tracking-wide">
          {group.name}
        </h2>
        {group.basePrice != null && (
          <span className="text-accent font-mono font-bold text-lg shrink-0">
            ${group.basePrice}
          </span>
        )}
      </div>

      {/* Description */}
      {group.description && (
        <p className="text-sm text-muted mb-4">{group.description}</p>
      )}

      {/* Variant items as sub-cards in a responsive grid */}
      {group.items.length > 1 && (
        <div className={`grid gap-2 mb-4 ${hasDescriptions ? 'sm:grid-cols-2' : 'grid-cols-2'}`}>
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

      {/* Add-ons */}
      {group.addOns && group.addOns.length > 0 && (
        <div className="border-t border-border pt-3 space-y-1">
          {group.addOns.map((addOn) => (
            <div key={addOn.name} className="text-sm">
              <span className="text-accent font-medium">
                {addOn.name} {addOn.price}
              </span>
              {addOn.description && (
                <span className="text-muted ml-1.5">({addOn.description})</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
