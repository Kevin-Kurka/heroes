'use client';

import { motion } from 'framer-motion';
import { UnifiedEvent } from '@/types';
import { Calendar, MapPin, Phone, Navigation } from 'lucide-react';

interface EventCardProps {
  event: UnifiedEvent;
  index: number;
}

const RESTAURANT_MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=American+Heroes+%26+Brew+Carlsbad';
const RESTAURANT_PHONE = 'tel:+17607296846';

export default function EventCard({ event, index }: EventCardProps) {
  const isHoliday = event.eventType === 'HOLIDAY';
  const isSports = event.eventType === 'SPORTS';

  const leagueColors: Record<string, string> = {
    MLB: 'border-red-600/40 bg-red-600/5',
    NFL: 'border-green-700/40 bg-green-700/5',
    NBA: 'border-orange-600/40 bg-orange-600/5',
  };

  const cardBorder = isHoliday
    ? 'border-holiday/40 bg-holiday/5'
    : leagueColors[event.league || ''] || 'border-sports/40 bg-sports/5';

  const highlightBorder = event.highlighted ? 'ring-1 ring-accent/40' : '';

  const date = new Date(event.eventTimestamp);
  const dayStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`rounded-xl border ${cardBorder} ${highlightBorder} p-4 transition-colors`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            {isSports && event.league && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                event.league === 'MLB' ? 'bg-red-600 text-white' :
                event.league === 'NFL' ? 'bg-green-700 text-white' :
                'bg-orange-600 text-white'
              }`}>
                {event.league}
              </span>
            )}
            {isHoliday && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-holiday text-white">
                HOLIDAY
              </span>
            )}
            {event.highlighted && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent text-background">
                LOCAL
              </span>
            )}
            {event.isLive && (
              <span className="text-[10px] font-bold text-red-500 animate-pulse">● LIVE</span>
            )}
          </div>
          <h3 className="font-semibold text-foreground text-base leading-tight">{event.eventTitle}</h3>
          <p className="text-sm text-muted mt-1">{event.displayMessage}</p>
        </div>

        <div className="flex flex-col items-end text-right shrink-0">
          <div className="flex items-center gap-1 text-muted text-xs">
            <Calendar size={12} />
            <span>{dayStr}</span>
          </div>
          {isSports && (
            <span className="text-accent font-mono text-sm font-semibold mt-0.5">{timeStr}</span>
          )}
          {event.venue && (
            <div className="flex items-center gap-1 text-muted text-[11px] mt-1">
              <MapPin size={10} />
              <span className="truncate max-w-[120px]">{event.venue}</span>
            </div>
          )}
        </div>
      </div>

      {event.homeScore !== undefined && event.awayScore !== undefined && (
        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-center gap-4">
          <span className="font-semibold text-foreground">{event.awayTeam}</span>
          <span className="text-accent font-mono text-lg font-bold">
            {event.awayScore} - {event.homeScore}
          </span>
          <span className="font-semibold text-foreground">{event.homeTeam}</span>
        </div>
      )}

      {/* CTA footer */}
      <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-3">
        <a
          href={RESTAURANT_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-dim transition-colors"
        >
          <Navigation size={12} />
          Get Directions
        </a>
        <a
          href={RESTAURANT_PHONE}
          className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-dim transition-colors"
        >
          <Phone size={12} />
          Call to Reserve
        </a>
      </div>
    </motion.div>
  );
}
