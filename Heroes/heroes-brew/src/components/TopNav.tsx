'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import DoorDashIcon from '@/components/DoorDashIcon';
import { DOORDASH_URL } from '@/lib/doordash';
import { useDoorDashAvailable } from '@/hooks/use-doordash-available';
import { trackEvent } from '@/lib/analytics';
import { SEASONAL_NAV } from '@/lib/seasonal';

const navItems = [
  { label: 'Social', href: '/social' },
  { label: 'Menu', href: '/menu' },
  { label: SEASONAL_NAV.label, href: SEASONAL_NAV.href },
  { label: 'Scoreboard', href: '/events' },
  { label: 'Location', href: '/location' },
];

export default function TopNav() {
  const pathname = usePathname();
  const doordashAvailable = useDoorDashAvailable();

  return (
    <header className="hidden md:block fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-card/60 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-accent tracking-tight">
            HEROES
          </span>
          <span className="text-xs text-muted font-medium tracking-widest uppercase">
            & Brew
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-4 py-2 text-sm font-medium transition-colors"
              >
                <span className={isActive ? 'text-accent' : 'text-muted hover:text-foreground'}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="topnav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-accent"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </Link>
            );
          })}

          {doordashAvailable && (
            <a
              href={DOORDASH_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Order on DoorDash"
              title="Order delivery on DoorDash"
              onClick={() => trackEvent('order_doordash', { source: 'top_nav' })}
              className="ml-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-white bg-accent hover:bg-accent-dim transition-all"
            >
              <DoorDashIcon size={16} />
              DoorDash
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
