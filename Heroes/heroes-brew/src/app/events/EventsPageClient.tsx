'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { UnifiedEvent } from '@/types';
import EventCard from '@/components/EventCard';
import PageTransition from '@/components/PageTransition';

interface Props {
  events: UnifiedEvent[];
  allHolidays: UnifiedEvent[];
}

type Filter = 'ALL' | 'MLB' | 'NFL' | 'NBA' | 'NHL' | 'MLS' | 'CFB' | 'HOLIDAY';

const LEAGUE_LOGO: Record<string, string> = {
  MLB: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/mlb.png&w=100&h=100&transparent=true',
  NFL: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png&w=100&h=100&transparent=true',
  NBA: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png&w=100&h=100&transparent=true',
  NHL: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nhl.png&w=100&h=100&transparent=true',
  MLS: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/mls.png&w=100&h=100&transparent=true',
  CFB: 'https://a.espncdn.com/combiner/i?img=/i/espn/misc_logos/500/ncaa_football.png&w=100&h=100&transparent=true',
};

const LEAGUE_NAME: Record<string, string> = {
  MLB: 'MLB',
  NFL: 'NFL',
  NBA: 'NBA',
  NHL: 'NHL',
  MLS: 'MLS',
  CFB: 'College Football',
};

export default function EventsPageClient({ events, allHolidays }: Props) {
  const [filter, setFilter] = useState<Filter>('ALL');

  const filters: { label: string; value: Filter }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'MLB', value: 'MLB' },
    { label: 'NFL', value: 'NFL' },
    { label: 'NBA', value: 'NBA' },
    { label: 'NHL', value: 'NHL' },
    { label: 'MLS', value: 'MLS' },
    { label: 'CFB', value: 'CFB' },
    { label: 'Holidays', value: 'HOLIDAY' },
  ];

  const filtered = filter === 'HOLIDAY'
    ? allHolidays
    : events.filter((e) => {
        if (filter === 'ALL') return true;
        return e.league === filter;
      });

  return (
    <PageTransition>
      {/* Brick background with dark overlay */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/brick.jpg"
          alt=""
          fill
          quality={80}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-background/85" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground" style={{ viewTransitionName: 'page-title' }}>Scoreboard</h1>
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
              className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-medium transition-all duration-200 ${
                filter === f.value
                  ? 'bg-accent text-background shadow-md shadow-accent/20'
                  : 'bg-card text-muted hover:text-foreground hover:bg-card-hover border border-border'
              }`}
            >
              {LEAGUE_LOGO[f.value] && (
                <img
                  src={LEAGUE_LOGO[f.value]}
                  alt=""
                  className="w-4 h-4 object-contain"
                />
              )}
              {f.label}
            </button>
          ))}
        </div>

        {/* Events */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-muted"
          >
            {filter !== 'ALL' && filter !== 'HOLIDAY' && LEAGUE_LOGO[filter] && (
              <img
                src={LEAGUE_LOGO[filter]}
                alt={LEAGUE_NAME[filter]}
                className="w-16 h-16 object-contain opacity-30 mb-4"
              />
            )}
            <p className="text-lg font-medium">
              No {filter !== 'ALL' && filter !== 'HOLIDAY' ? LEAGUE_NAME[filter] : ''} games this week
            </p>
            <p className="text-sm mt-1">Check back when the season starts!</p>
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
