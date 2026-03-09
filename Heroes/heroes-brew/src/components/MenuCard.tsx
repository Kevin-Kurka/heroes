'use client';

import { MenuItem } from '@/types';

interface MenuCardProps {
  item: MenuItem;
  index: number;
}

export default function MenuCard({ item }: MenuCardProps) {
  return (
    <div className="group rounded-md bg-card/70 backdrop-blur-md border border-white/10 p-4 hover:border-accent/30 hover:bg-card/80 hover:scale-[1.015] transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors leading-tight">
            {item.name}
            {item.subtitle && <span className="text-xs font-bold text-muted ml-1.5">[{item.subtitle}]</span>}
          </h3>
          {item.description && (
            <p className="text-sm text-muted mt-1 line-clamp-2">
              {item.description.split(/(\+\d+)/).map((part, i) =>
                /^\+\d+$/.test(part)
                  ? <span key={i} className="text-accent font-mono font-semibold">{part}</span>
                  : part
              )}
            </p>
          )}
        </div>
        <span className="text-accent font-mono font-semibold text-sm shrink-0">
          ${item.price}
        </span>
      </div>
    </div>
  );
}
