'use client';

import { motion } from 'framer-motion';
import { ToastMenuItem } from '@/types';

interface MenuCardProps {
  item: ToastMenuItem;
  index: number;
}

export default function MenuCard({ item, index }: MenuCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ scale: 1.015 }}
      className="group rounded-xl bg-card border border-border p-4 hover:border-accent/30 hover:bg-card-hover transition-all duration-200"
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
