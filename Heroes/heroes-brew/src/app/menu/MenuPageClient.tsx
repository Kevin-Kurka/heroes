'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, LayoutGroup, useScroll, useTransform, useSpring } from 'framer-motion';
import { Menu } from '@/types';
import MenuCard from '@/components/MenuCard';
import VariantGroupCard from '@/components/VariantGroupCard';
import PageTransition from '@/components/PageTransition';
import { SHOW_PRICES } from '@/lib/config';

interface Props {
  menus: Menu[];
}

export default function MenuPageClient({ menus }: Props) {
  const menu = menus[0]; // primary menu
  const groups = menu?.groups || [];
  const [activeGroup, setActiveGroup] = useState(groups[0]?.id || '');
  const categoryRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  // Scroll active category into view
  useEffect(() => {
    if (categoryRef.current) {
      const active = categoryRef.current.querySelector('[data-active="true"]');
      active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeGroup]);

  // Detect when tabs become sticky
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const currentGroup = groups.find(g => g.id === activeGroup) || groups[0];

  const { scrollY } = useScroll();
  const springConfig = { stiffness: 100, damping: 30, mass: 0.5 };
  const rawBgY = useTransform(scrollY, [0, 2000], [0, 50]);
  const rawBgScale = useTransform(scrollY, [0, 2000], [1, 1.03]);
  const bgY = useSpring(rawBgY, springConfig);
  const bgScale = useSpring(rawBgScale, springConfig);

  return (
    <PageTransition>
      <motion.div
        className="fixed inset-0 -z-10 bg-[url('/menu-bg.jpg')] bg-cover bg-center opacity-10 pointer-events-none"
        style={{ y: bgY, scale: bgScale, willChange: 'transform' }}
      />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground drop-shadow-lg" style={{ viewTransitionName: 'page-title' }}>Menu</h1>
          <p className="text-muted text-sm mt-1">
            All your favorites, every day.
          </p>
        </div>

        {/* Sentinel to detect sticky state */}
        <div ref={sentinelRef} className="h-0" />

        {/* Sticky category nav */}
        <LayoutGroup>
          <div
            ref={categoryRef}
            className={`sticky top-0 md:top-16 z-40 -mx-4 px-4 py-3 mb-4 overflow-x-auto flex gap-2 no-scrollbar transition-all duration-200 ${
              isSticky ? 'bg-card/60 backdrop-blur-md border-b border-white/10' : ''
            }`}
          >
            {groups.map((group) => (
              <button
                key={group.id}
                data-active={activeGroup === group.id}
                onClick={() => setActiveGroup(group.id)}
                className={`relative shrink-0 px-4 py-2 rounded-sm text-sm font-medium transition-colors duration-300 ${
                  activeGroup === group.id
                    ? 'text-white'
                    : 'bg-white/5 text-muted hover:text-foreground hover:bg-white/10 border border-white/10'
                }`}
              >
                {activeGroup === group.id && (
                  <motion.div
                    layoutId="menu-tab"
                    className="absolute inset-0 bg-accent rounded-sm shadow-md shadow-accent/20"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{group.name}</span>
              </button>
            ))}
          </div>
        </LayoutGroup>

        {/* Menu items */}
        <div key={activeGroup}>
          {currentGroup?.displayMode === 'starters' && currentGroup.subGroups ? (
            <div className="space-y-4">
              {currentGroup.description && (
                <p className="text-sm text-accent font-semibold uppercase tracking-wide mb-2">{currentGroup.description}</p>
              )}
              {currentGroup.subGroups.map((sub) => (
                <VariantGroupCard key={sub.id} group={sub} elevated />
              ))}
              {currentGroup.addOns && currentGroup.addOns.length > 0 && (
                <div className="border-t border-border pt-3 mt-2">
                  <span className="text-xs uppercase tracking-wider text-muted font-semibold mb-2 block">{currentGroup.addOnLabel || 'Sides'}</span>
                  <div className="flex flex-wrap gap-2">
                    {currentGroup.addOns.map((addOn) => (
                      <span key={addOn.name} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm">
                        <span className="text-foreground/70">{addOn.name}</span>
                        {SHOW_PRICES && <span className="text-accent font-mono font-semibold text-xs">{addOn.price}</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : currentGroup?.displayMode === 'variants' ? (
            <VariantGroupCard group={currentGroup} />
          ) : (
            <>
              {currentGroup?.description && (
                <div className="text-sm mb-4">
                  {currentGroup.description.split('\n').map((line, i) => (
                    <p key={i} className={i === 0 ? 'text-foreground font-medium' : 'text-muted mt-0.5'}>
                      {line}
                    </p>
                  ))}
                </div>
              )}
              {/* Featured sub-groups (e.g. Philly in Heroes) — full width above grid */}
              {currentGroup?.subGroups?.map((sub) => (
                <div key={sub.id} className="mb-4">
                  <VariantGroupCard group={sub} />
                </div>
              ))}
              <div className="grid gap-3 sm:grid-cols-2">
                {currentGroup?.items.map((item, i) => (
                  <MenuCard key={item.id} item={item} index={i} />
                ))}
              </div>
              {currentGroup?.mods && currentGroup.mods.length > 0 && (
                <div className="border-t border-border pt-3 mt-4">
                  <span className="text-xs uppercase tracking-wider text-muted font-semibold mb-2 block">Mods</span>
                  <div className="flex flex-wrap gap-2">
                    {currentGroup.mods.map((mod) => (
                      <span
                        key={mod.name}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm"
                        title={mod.description || undefined}
                      >
                        <span className="text-foreground/70">{mod.name}</span>
                        {SHOW_PRICES && <span className="text-accent font-mono font-semibold text-xs">{mod.price}</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {currentGroup?.addOns && currentGroup.addOns.length > 0 && (
                <div className="border-t border-border pt-3 mt-4">
                  <span className="text-xs uppercase tracking-wider text-muted font-semibold mb-2 block">{currentGroup.addOnLabel || 'Sides'}</span>
                  <div className="flex flex-wrap gap-2">
                    {currentGroup.addOns.map((addOn) => (
                      <span
                        key={addOn.name}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm"
                        title={addOn.description || undefined}
                      >
                        <span className="text-foreground/70">{addOn.name}</span>
                        {SHOW_PRICES && <span className="text-accent font-mono font-semibold text-xs">{addOn.price}</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
