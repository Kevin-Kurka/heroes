'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'Scoreboard', href: '/events' },
  { label: 'Social', href: '/social' },
  { label: 'Location', href: '/location' },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="hidden md:block fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/95 backdrop-blur-md">
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
        </nav>
      </div>
    </header>
  );
}
