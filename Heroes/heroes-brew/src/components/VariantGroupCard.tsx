'use client';

import { MenuGroup } from '@/types';

interface VariantGroupCardProps {
  group: MenuGroup;
  elevated?: boolean;
}

export default function VariantGroupCard({ group, elevated }: VariantGroupCardProps) {
  const hasDescriptions = group.items.some((item) => item.description);
  const bgClass = elevated
    ? 'bg-card-elevated hover:bg-card-hover'
    : 'bg-card hover:bg-card-hover';

  return (
    <div className={`rounded-md border border-border p-5 hover:border-accent/30 transition-all duration-200 ${bgClass}`}>
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

      {/* Variants — two layouts depending on whether items have descriptions */}
      {group.items.length > 1 && (
        hasDescriptions ? (
          /* Burger-style: each variant on its own line with description */
          <div className="space-y-2 mb-4">
            {group.items.map((item) => (
              <div key={item.id}>
                <span className="font-semibold text-foreground">{item.name}</span>
                {item.description && (
                  <span className="text-sm text-muted ml-2">{item.description}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Wings/Fries-style: compact pill list */
          <div className="flex flex-wrap gap-x-1 gap-y-1 mb-4">
            {group.items.map((item, i) => (
              <span key={item.id} className="text-foreground text-sm">
                {item.name}
                {i < group.items.length - 1 && (
                  <span className="text-muted mx-1.5">&middot;</span>
                )}
              </span>
            ))}
          </div>
        )
      )}

      {/* Choice groups (Philly cheese/toppings) */}
      {group.choices && group.choices.length > 0 && (
        <div className="space-y-2 mb-4">
          {group.choices.map((choice) => (
            <div key={choice.label} className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-xs uppercase tracking-wider text-muted font-semibold">
                {choice.label}:
              </span>
              {choice.options.map((opt, i) => (
                <span key={opt} className="text-sm text-foreground">
                  {opt}
                  {i < choice.options.length - 1 && (
                    <span className="text-muted mx-1">&middot;</span>
                  )}
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
