'use client';

import { MenuItem } from '@/types';
import { SHOW_PRICES, stripPriceTokens } from '@/lib/config';

interface MenuCardProps {
  item: MenuItem;
  index?: number;
  featured?: boolean;
}

export default function MenuCard({ item }: MenuCardProps) {
  const description = item.description ? stripPriceTokens(item.description) : undefined;

  return (
    <article className="rounded-xl bg-white/5 p-4 transition-colors duration-200 hover:bg-white/[0.08]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[17px] font-semibold tracking-tight text-foreground">
            {item.name}
            {item.subtitle && (
              <span className="ml-1.5 text-xs font-medium text-muted">{item.subtitle}</span>
            )}
          </h3>
          {description && (
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>
          )}
        </div>
        {SHOW_PRICES && item.price != null && (
          <span className="shrink-0 font-mono text-sm font-semibold text-accent">{item.price}</span>
        )}
      </div>
    </article>
  );
}
