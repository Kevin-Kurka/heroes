'use client';

import Image from 'next/image';
import { MenuItem } from '@/types';
import { SHOW_PRICES, stripPriceTokens } from '@/lib/config';

interface MenuCardProps {
  item: MenuItem;
  index?: number;
  featured?: boolean;
}

const PHOTO_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 520px';

/** Absolute fill plate + wash. Parent must be `relative overflow-hidden`. */
export function DishBackdrop({ src, alt }: { src: string; alt: string }) {
  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={PHOTO_SIZES}
        className="object-cover object-[center_68%]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/45 transition-colors duration-300 group-hover:from-black/85 group-hover:via-black/65 group-hover:to-black/40"
      />
    </>
  );
}

export default function MenuCard({ item }: MenuCardProps) {
  const description = item.description ? stripPriceTokens(item.description) : undefined;
  const hasPhoto = Boolean(item.imageUrl);

  return (
    <article
      className={`group relative overflow-hidden rounded-xl border border-white/[0.06] ${
        hasPhoto
          ? 'min-h-44 sm:min-h-52'
          : 'bg-card/70 backdrop-blur-md transition-colors duration-200 hover:border-white/12 hover:bg-card/85'
      }`}
    >
      {item.imageUrl && <DishBackdrop src={item.imageUrl} alt={item.name} />}
      <div className={`relative z-10 ${hasPhoto ? 'p-5 sm:p-6' : 'px-5 py-4'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3
              className={`text-[17px] font-semibold tracking-tight ${
                hasPhoto ? 'text-white' : 'text-foreground'
              }`}
            >
              {item.name}
              {item.subtitle && (
                <span className={`ml-1.5 text-xs font-medium ${hasPhoto ? 'text-white/70' : 'text-muted'}`}>
                  {item.subtitle}
                </span>
              )}
            </h3>
            {description && (
              <p className={`mt-1.5 text-sm leading-relaxed ${hasPhoto ? 'text-white/90' : 'text-muted'}`}>
                {description}
              </p>
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
