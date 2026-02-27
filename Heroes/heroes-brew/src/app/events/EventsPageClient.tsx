'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { UnifiedEvent } from '@/types';
import EventCard from '@/components/EventCard';
import PageTransition from '@/components/PageTransition';

interface Props {
  events: UnifiedEvent[];
}

type Filter = 'ALL' | 'MLB' | 'NFL' | 'NBA' | 'HOLIDAY';

export default function EventsPageClient({ events }: Props) {
  const [filter, setFilter] = useState<Filter>('ALL');

  const filters: { label: string; value: Filter }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'MLB', value: 'MLB' },
    { label: 'NFL', value: 'NFL' },
    { label: 'NBA', value: 'NBA' },
    { label: 'Holidays', value: 'HOLIDAY' },
  ];

  const filtered = events.filter((e) => {
    if (filter === 'ALL') return true;
    if (filter === 'HOLIDAY') return e.eventType === 'HOLIDAY';
    return e.league === filter;
  });

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Upcoming Events</h1>
          <p className="text-muted text-sm mt-1">
            All the games and celebrations coming up this week.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === f.value
                  ? 'bg-accent text-background shadow-md shadow-accent/20'
                  : 'bg-card text-muted hover:text-foreground hover:bg-card-hover border border-border'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Events */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 text-muted"
          >
            <p className="text-lg">No upcoming events in this category.</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </motion.div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
