'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, LayoutGroup, useScroll, useTransform, useSpring } from 'framer-motion';
import { Lock } from 'lucide-react';
import { Menu, MenuItem } from '@/types';
import MenuCard from '@/components/MenuCard';
import VariantGroupCard from '@/components/VariantGroupCard';
import PageTransition from '@/components/PageTransition';
import SecretMenuGate, { type SecretUnlock } from '@/components/SecretMenuGate';
import { SHOW_PRICES, SECRET_MENU_ENABLED } from '@/lib/config';

const SECRET_TAB = '__secret__';
const SECRET_CACHE_KEY = 'heroes_secret_menu_v1';

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

  // Secret menu: a hidden tab revealed by the QR link (?secret) or a prior unlock,
  // gated behind a name + email/phone capture (saved to Google Sheets).
  const [secretVisible, setSecretVisible] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [secretItems, setSecretItems] = useState<MenuItem[]>([]);
  const [secretNote, setSecretNote] = useState('');
  const [showGate, setShowGate] = useState(false);

  // Client-only mount sync: restore a saved unlock and handle QR arrival. The
  // synchronous setState is intentional and SSR-safe here — a lazy initializer
  // would mismatch the prerendered HTML, which has no secret tab.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // Secret menu is suppressed until items are confirmed — skip all reveal paths.
    if (!SECRET_MENU_ENABLED) return;
    let isUnlocked = false;
    try {
      const cached = JSON.parse(localStorage.getItem(SECRET_CACHE_KEY) ?? 'null');
      if (cached?.items?.length) {
        isUnlocked = true;
        setUnlocked(true);
        setSecretItems(cached.items);
        setSecretNote(cached.note ?? '');
        setSecretVisible(true);
      }
    } catch {
      // Corrupt cache — ignore and re-gate.
    }
    if (new URLSearchParams(window.location.search).has('secret')) {
      setSecretVisible(true);
      setActiveGroup(SECRET_TAB);
      if (!isUnlocked) setShowGate(true);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleUnlock = (data: SecretUnlock) => {
    setUnlocked(true);
    setSecretItems(data.items);
    setSecretNote(data.note);
    setSecretVisible(true);
    setShowGate(false);
    setActiveGroup(SECRET_TAB);
    try {
      localStorage.setItem(
        SECRET_CACHE_KEY,
        JSON.stringify({ items: data.items, note: data.note, name: data.name, contact: data.contact, ts: Date.now() }),
      );
    } catch {
      // Storage full/blocked — unlock still holds for this session.
    }
  };

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
  const isSecret = activeGroup === SECRET_TAB;
  const tabs = [
    ...groups.map((g) => ({ id: g.id, name: g.name })),
    ...(secretVisible ? [{ id: SECRET_TAB, name: '🔒 Secret' }] : []),
  ];

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
            {tabs.map((tab) => {
              const active = activeGroup === tab.id;
              return (
                <button
                  key={tab.id}
                  data-active={active}
                  onClick={() => {
                    if (tab.id === SECRET_TAB && !unlocked) {
                      setActiveGroup(SECRET_TAB);
                      setShowGate(true);
                    } else {
                      setActiveGroup(tab.id);
                    }
                  }}
                  className={`relative shrink-0 px-4 py-2 rounded-sm text-sm font-medium transition-colors duration-300 ${
                    active
                      ? 'text-white'
                      : 'bg-white/5 text-muted hover:text-foreground hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="menu-tab"
                      className="absolute inset-0 bg-accent rounded-sm shadow-md shadow-accent/20"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>

        {/* Menu items */}
        <div key={activeGroup}>
          {isSecret ? (
            unlocked ? (
              <div>
                {secretNote && (
                  <p className="text-sm text-accent font-semibold mb-4">{secretNote}</p>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {secretItems.map((item, i) => (
                    <MenuCard key={item.id} item={item} index={i} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mb-4">
                  <Lock size={24} className="text-accent" />
                </div>
                <p className="text-lg font-semibold text-foreground">The Secret Menu is locked</p>
                <p className="text-sm text-muted mt-1 mb-5">
                  Enter your name + email or phone to unlock the off-menu items.
                </p>
                <button
                  type="button"
                  onClick={() => setShowGate(true)}
                  className="inline-flex items-center gap-2 bg-accent text-white font-semibold px-5 py-2.5 rounded-md hover:bg-accent-dim transition-colors"
                >
                  <Lock size={16} /> Unlock Secret Menu
                </button>
              </div>
            )
          ) : currentGroup?.displayMode === 'starters' && currentGroup.subGroups ? (
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

        {showGate && <SecretMenuGate onClose={() => setShowGate(false)} onUnlock={handleUnlock} />}
      </div>
    </PageTransition>
  );
}
