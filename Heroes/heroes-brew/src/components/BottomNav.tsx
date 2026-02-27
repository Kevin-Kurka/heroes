'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UtensilsCrossed, CalendarDays, Camera, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Menu', href: '/menu', icon: UtensilsCrossed },
  { label: 'Events', href: '/events', icon: CalendarDays },
  { label: 'Social', href: '/social', icon: Camera },
  { label: 'Location', href: '/location', icon: MapPin },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomnav-indicator"
                  className="absolute -top-1 h-0.5 w-8 rounded-full bg-accent"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={20}
                className={isActive ? 'text-accent' : 'text-muted'}
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? 'text-accent' : 'text-muted'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
