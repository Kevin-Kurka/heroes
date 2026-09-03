'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, LayoutGroup, useScroll, useTransform, useSpring } from 'framer-motion';
import { Lock } from 'lucide-react';
import { Menu, MenuItem } from '@/types';
import MenuCard from '@/components/MenuCard';
import VariantGroupCard from '@/components/VariantGroupCard';
import PageTransition from '@/components/PageTransition';
import SecretMenuGate, { type SecretUnlock } from '@/components/SecretMenuGate';
import { SHOW_PRICES, SECRET_MENU_ENABLED, stripPriceTokens } from '@/lib/config';

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
        className="fixed inset-0 -z-10 bg-[url('/menu-bg.jpg')] bg-cover bg-center opacity-[0.07] pointer-events-none"
        style={{ y: bgY, scale: bgScale, willChange: 'transform' }}
      />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
        <header className="mb-8 max-w-xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent/90">
            American Heroes &amp; Brew
          </p>
          <h1
            className="mt-2 text-4xl font-semibold tracking-tight text-foreground"
            style={{ viewTransitionName: 'page-title' }}
          >
            Menu
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Kitchen and bar in Carlsbad Village — a family sports bar. Ask your server for today’s prices.
          </p>
        </header>

        {/* Sentinel to detect sticky state */}
        <div ref={sentinelRef} className="h-0" />

        {/* Sticky category nav */}
        <LayoutGroup>
          <div
            ref={categoryRef}
            className={`sticky top-0 md:top-16 z-40 -mx-4 px-4 py-3 mb-8 overflow-x-auto flex gap-2 no-scrollbar transition-all duration-200 ${
              isSticky ? 'bg-background/80 backdrop-blur-md border-b border-white/10' : ''
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
                  className={`relative shrink-0 px-4 py-2 rounded-full text-[11px] font-medium uppercase tracking-wide transition-colors duration-300 ${
                    active
                      ? 'text-white'
                      : 'bg-white/5 text-muted hover:text-foreground hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="menu-tab"
                      className="absolute inset-0 rounded-full bg-accent shadow-md shadow-accent/20"
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
                  <p className="mb-6 text-sm font-medium text-accent">{secretNote}</p>
                )}
                <div className="rounded-xl border border-white/[0.06] bg-card/70 p-5 backdrop-blur-md">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {secretItems.map((item, i) => (
                      <MenuCard key={item.id} item={item} index={i} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/15">
                  <Lock size={24} className="text-accent" />
                </div>
                <p className="text-lg font-semibold text-foreground">The Secret Menu is locked</p>
                <p className="mb-5 mt-1 text-sm text-muted">
                  Enter your name + email or phone to unlock the off-menu items.
                </p>
                <button
                  type="button"
                  onClick={() => setShowGate(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent-dim"
                >
                  <Lock size={16} /> Unlock Secret Menu
                </button>
              </div>
            )
          ) : currentGroup?.displayMode === 'starters' && currentGroup.subGroups ? (
            <div className="space-y-8">
              {currentGroup.description && (
                <p className="text-sm leading-relaxed text-muted">
                  {stripPriceTokens(currentGroup.description)}
                </p>
              )}
              {currentGroup.subGroups.map((sub) => (
                <VariantGroupCard key={sub.id} group={sub} elevated />
              ))}
              {currentGroup.addOns && currentGroup.addOns.length > 0 && (
                <div className="rounded-xl border border-white/[0.06] bg-card/70 p-5 backdrop-blur-md">
                  <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
                    {currentGroup.addOnLabel || 'Add'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currentGroup.addOns.map((addOn) => (
                      <span key={addOn.name} className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-sm">
                        <span className="text-foreground/75">{addOn.name}</span>
                        {SHOW_PRICES && <span className="font-mono text-xs font-semibold text-accent">{addOn.price}</span>}
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
                <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted">
                  {stripPriceTokens(currentGroup.description)}
                </p>
              )}
              {currentGroup?.subGroups?.map((sub) => (
                <div key={sub.id} className="mb-8">
                  <VariantGroupCard group={sub} />
                </div>
              ))}
              {(currentGroup?.items.length || currentGroup?.mods?.length || currentGroup?.addOns?.length) ? (
                <div className="rounded-xl border border-white/[0.06] bg-card/70 p-5 backdrop-blur-md">
                  {currentGroup.items.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {currentGroup.items.map((item, i) => (
                        <MenuCard key={item.id} item={item} index={i} />
                      ))}
                    </div>
                  )}
                  {currentGroup.mods && currentGroup.mods.length > 0 && (
                    <div className={currentGroup.items.length > 0 ? 'mt-4' : undefined}>
                      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Mods</p>
                      <div className="flex flex-wrap gap-2">
                        {currentGroup.mods.map((mod) => (
                          <span
                            key={mod.name}
                            className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-sm"
                            title={mod.description || undefined}
                          >
                            <span className="text-foreground/75">{mod.name}</span>
                            {SHOW_PRICES && <span className="font-mono text-xs font-semibold text-accent">{mod.price}</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentGroup.addOns && currentGroup.addOns.length > 0 && (
                    <div className={currentGroup.items.length > 0 || (currentGroup.mods && currentGroup.mods.length > 0) ? 'mt-4' : undefined}>
                      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
                        {currentGroup.addOnLabel || 'Add'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {currentGroup.addOns.map((addOn) => (
                          <span
                            key={addOn.name}
                            className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-sm"
                            title={addOn.description || undefined}
                          >
                            <span className="text-foreground/75">{addOn.name}</span>
                            {SHOW_PRICES && <span className="font-mono text-xs font-semibold text-accent">{addOn.price}</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </>
          )}
        </div>

        {showGate && <SecretMenuGate onClose={() => setShowGate(false)} onUnlock={handleUnlock} />}
      </div>
    </PageTransition>
  );
}
