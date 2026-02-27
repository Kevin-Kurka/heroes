'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Menu } from '@/types';
import MenuCard from '@/components/MenuCard';
import PageTransition from '@/components/PageTransition';

interface Props {
  menus: Menu[];
}

export default function MenuPageClient({ menus }: Props) {
  const menu = menus[0]; // primary menu
  const groups = menu?.groups || [];
  const [activeGroup, setActiveGroup] = useState(groups[0]?.id || '');
  const categoryRef = useRef<HTMLDivElement>(null);

  // Scroll active category into view
  useEffect(() => {
    if (categoryRef.current) {
      const active = categoryRef.current.querySelector('[data-active="true"]');
      active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeGroup]);

  const currentGroup = groups.find(g => g.id === activeGroup) || groups[0];

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground" style={{ viewTransitionName: 'page-title' }}>Menu</h1>
          <p className="text-muted text-sm mt-1">
            All your favorites, every day.
          </p>
        </div>

        {/* Sticky category nav — smooth layoutId animation for active indicator */}
        <LayoutGroup>
          <div
            ref={categoryRef}
            className="sticky top-0 md:top-16 z-40 bg-background/95 backdrop-blur-md -mx-4 px-4 py-3 mb-4 overflow-x-auto flex gap-2 no-scrollbar"
          >
            {groups.map((group) => (
              <button
                key={group.id}
                data-active={activeGroup === group.id}
                onClick={() => setActiveGroup(group.id)}
                className={`relative shrink-0 px-4 py-2 rounded-sm text-sm font-medium transition-colors duration-300 ${
                  activeGroup === group.id
                    ? 'text-white'
                    : 'bg-card text-muted hover:text-foreground hover:bg-card-hover border border-border'
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

        {/* Menu items — smooth crossfade between tabs */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeGroup}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            {currentGroup?.description && (
              <div className="text-sm mb-4">
                {currentGroup.description.split('\n').map((line, i) => (
                  <p key={i} className={i === 0 ? 'text-foreground font-medium' : 'text-muted mt-0.5'}>
                    {line}
                  </p>
                ))}
              </div>
            )}
            <motion.div
              className="grid gap-3 sm:grid-cols-2"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.04 },
                },
              }}
            >
              {currentGroup?.items.map((item) => (
                <motion.div
                  key={item.id}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
                  }}
                >
                  <MenuCard item={item} index={0} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
