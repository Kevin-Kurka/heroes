'use client';

import { motion } from 'framer-motion';
import { MenuItem } from '@/types';

interface MenuCardProps {
  item: MenuItem;
  index: number;
}

export default function MenuCard({ item }: MenuCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.015 }}
      className="group rounded-md bg-card border border-border p-4 hover:border-accent/30 hover:bg-card-hover transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors leading-tight">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-sm text-muted mt-1 line-clamp-2">{item.description}</p>
          )}
        </div>
        <span className="text-accent font-mono font-semibold text-sm shrink-0">
          ${item.price.toFixed(2)}
        </span>
      </div>
    </motion.div>
  );
}
