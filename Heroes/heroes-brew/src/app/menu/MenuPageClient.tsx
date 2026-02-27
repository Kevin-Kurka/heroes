'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastMenu } from '@/types';
import MenuCard from '@/components/MenuCard';
import PageTransition from '@/components/PageTransition';

interface Props {
  menus: ToastMenu[];
}

export default function MenuPageClient({ menus }: Props) {
  const menu = menus[0]; // primary menu
  const groups = menu?.groups || [];
  const [activeGroup, setActiveGroup] = useState(groups[0]?.guid || '');
  const categoryRef = useRef<HTMLDivElement>(null);

  // Scroll active category into view
  useEffect(() => {
    if (categoryRef.current) {
      const active = categoryRef.current.querySelector('[data-active="true"]');
      active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeGroup]);

  const currentGroup = groups.find(g => g.guid === activeGroup) || groups[0];

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Menu</h1>
          <p className="text-muted text-sm mt-1">
            Synced live from our kitchen. Prices and availability updated in real-time.
          </p>
        </div>

        {/* Sticky category nav */}
        <div
          ref={categoryRef}
          className="sticky top-0 md:top-16 z-40 bg-background/95 backdrop-blur-md -mx-4 px-4 py-3 border-b border-border mb-4 overflow-x-auto flex gap-2 scrollbar-hide"
        >
          {groups.map((group) => (
            <button
              key={group.guid}
              data-active={activeGroup === group.guid}
              onClick={() => setActiveGroup(group.guid)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeGroup === group.guid
                  ? 'bg-accent text-background shadow-md shadow-accent/20'
                  : 'bg-card text-muted hover:text-foreground hover:bg-card-hover border border-border'
              }`}
            >
              {group.name}
            </button>
          ))}
        </div>

        {/* Menu items */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeGroup}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {currentGroup?.description && (
              <p className="text-muted text-sm mb-4">{currentGroup.description}</p>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {currentGroup?.items.map((item, i) => (
                <MenuCard key={item.guid} item={item} index={i} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
