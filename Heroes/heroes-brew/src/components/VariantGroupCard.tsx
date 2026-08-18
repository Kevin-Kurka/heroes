'use client';

import { MenuGroup } from '@/types';
import { SHOW_PRICES, stripPriceTokens } from '@/lib/config';
import MenuCard, { DishBackdrop } from '@/components/MenuCard';

interface VariantGroupCardProps {
  group: MenuGroup;
  elevated?: boolean;
}

function ChoicePills({ group, onPhoto }: { group: MenuGroup; onPhoto?: boolean }) {
  if (!group.choices?.length) return null;
  return (
    <div className="space-y-3">
      {group.choices.map((choice) => (
        <div key={choice.label}>
          <p
            className={`mb-2 text-[11px] font-medium uppercase tracking-[0.16em] ${
              onPhoto ? 'text-white/70' : 'text-muted'
            }`}
          >
            {choice.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {choice.options.map((opt) => (
              <span
                key={opt}
                className={`inline-block rounded-full border px-3 py-1 text-sm ${
                  onPhoto
                    ? 'border-white/20 bg-white/10 text-white'
                    : 'border-white/10 bg-white/[0.03] text-foreground/80'
                }`}
              >
                {stripPriceTokens(opt)}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ChipRow({
  label,
  chips,
  onPhoto,
}: {
  label: string;
  chips: { name: string; price: string; description?: string }[];
  onPhoto?: boolean;
}) {
  if (!chips.length) return null;
  return (
    <div className={`border-t pt-4 ${onPhoto ? 'border-white/20' : 'border-white/10'}`}>
      <p
        className={`mb-2 text-[11px] font-medium uppercase tracking-[0.16em] ${
          onPhoto ? 'text-white/70' : 'text-muted'
        }`}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip.name}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${
              onPhoto ? 'border-white/20 bg-white/10' : 'border-white/10 bg-white/[0.04]'
            }`}
            title={chip.description || undefined}
          >
            <span className={onPhoto ? 'text-white' : 'text-foreground/75'}>{chip.name}</span>
            {SHOW_PRICES && (
              <span className="font-mono text-xs font-semibold text-accent">{chip.price}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function VariantGroupCard({ group, elevated }: VariantGroupCardProps) {
  const description = group.description ? stripPriceTokens(group.description) : undefined;
  const withPhotos = group.items.filter((item) => item.imageUrl);
  const withoutPhotos = group.items.filter((item) => !item.imageUrl);
  const loneItem = group.items.length === 1 ? group.items[0] : null;
  const groupIsTheItem = Boolean(loneItem && loneItem.name === group.name);
  const showItemGrid = group.items.length > 1 || (Boolean(loneItem) && !groupIsTheItem);
  const heroSrc = group.imageUrl;
  const usePhotoBackdrop = Boolean(heroSrc) && !(showItemGrid && withPhotos.length > 0);

  return (
    <section
      className={`group relative overflow-hidden rounded-xl border border-white/[0.06] ${
        usePhotoBackdrop
          ? 'min-h-44 sm:min-h-52'
          : elevated
            ? 'bg-card-elevated/60 backdrop-blur-md'
            : 'bg-card/70 backdrop-blur-md'
      }`}
    >
      {usePhotoBackdrop && heroSrc && <DishBackdrop src={heroSrc} alt={group.name} />}

      <div className="relative z-10 p-5 sm:p-6">
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <h2
            className={`text-lg font-semibold tracking-tight sm:text-xl ${
              usePhotoBackdrop ? 'text-white' : 'text-foreground'
            }`}
          >
            {group.name}
          </h2>
          {SHOW_PRICES && group.basePrice != null && (
            <span className="shrink-0 font-mono text-lg font-semibold text-accent">{group.basePrice}</span>
          )}
        </div>

        {description && (
          <p
            className={`mb-5 max-w-2xl text-sm leading-relaxed ${
              usePhotoBackdrop ? 'text-white/90' : 'text-muted'
            }`}
          >
            {description}
          </p>
        )}

        {showItemGrid && withPhotos.length > 0 && (
          <div className={`mb-5 grid gap-4 ${withPhotos.length === 1 ? '' : 'sm:grid-cols-2'}`}>
            {withPhotos.map((item, i) => (
              <MenuCard key={item.id} item={item} index={i} featured={withPhotos.length === 1} />
            ))}
          </div>
        )}

        {showItemGrid && withoutPhotos.length > 0 && (
          <ul
            className={`${withPhotos.length ? 'mb-5 border-t border-white/10 pt-4' : 'mb-5'} space-y-3.5`}
          >
            {withoutPhotos.map((item) => {
              const itemDesc = item.description ? stripPriceTokens(item.description) : undefined;
              return (
                <li key={item.id} className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p
                      className={`font-medium tracking-tight ${
                        usePhotoBackdrop ? 'text-white' : 'text-foreground'
                      }`}
                    >
                      {item.name}
                      {item.subtitle && (
                        <span
                          className={`ml-1.5 text-xs font-medium ${
                            usePhotoBackdrop ? 'text-white/70' : 'text-muted'
                          }`}
                        >
                          {item.subtitle}
                        </span>
                      )}
                    </p>
                    {itemDesc && (
                      <p
                        className={`mt-1 text-sm leading-relaxed ${
                          usePhotoBackdrop ? 'text-white/90' : 'text-muted'
                        }`}
                      >
                        {itemDesc}
                      </p>
                    )}
                  </div>
                  {SHOW_PRICES && group.basePrice == null && item.price != null && (
                    <span className="shrink-0 font-mono text-sm font-semibold text-accent">{item.price}</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <div className="space-y-4">
          <ChoicePills group={group} onPhoto={usePhotoBackdrop} />
          <ChipRow label="Mods" chips={group.mods ?? []} onPhoto={usePhotoBackdrop} />
          <ChipRow label={group.addOnLabel || 'Add'} chips={group.addOns ?? []} onPhoto={usePhotoBackdrop} />
        </div>
      </div>
    </section>
  );
}
