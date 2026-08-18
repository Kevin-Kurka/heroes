'use client';

import Image from 'next/image';
import { MenuItem } from '@/types';
import { SHOW_PRICES, stripPriceTokens } from '@/lib/config';

interface MenuCardProps {
  item: MenuItem;
  index?: number;
  featured?: boolean;
}

export function DishPhoto({
  src,
  alt,
  className = 'aspect-[16/10]',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-black/25 ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 520px"
        className="object-cover object-[center_68%] transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      />
    </div>
  );
}

export default function MenuCard({ item }: MenuCardProps) {
  const description = item.description ? stripPriceTokens(item.description) : undefined;

  return (
    <article className="group overflow-hidden rounded-xl border border-white/[0.06] bg-card/70 backdrop-blur-md transition-colors duration-200 hover:border-white/12 hover:bg-card/85">
      {item.imageUrl && (
        <DishPhoto
          src={item.imageUrl}
          alt={item.name}
          className="aspect-[16/10]"
        />
      )}
      <div className={item.imageUrl ? 'px-5 py-4' : 'px-5 py-4'}>
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
      </div>
    </article>
  );
}
