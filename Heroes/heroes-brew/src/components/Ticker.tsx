'use client';

import { UnifiedEvent } from '@/types';

interface TickerProps {
  events: UnifiedEvent[];
}

function leagueBadge(league?: string) {
  const colors: Record<string, string> = {
    MLB: 'bg-red-600',
    NFL: 'bg-green-700',
    NBA: 'bg-orange-600',
  };
  if (!league) return null;
  return (
    <span className={`${colors[league] || 'bg-muted'} text-white text-[10px] font-bold px-1.5 py-0.5 rounded mr-1.5`}>
      {league}
    </span>
  );
}

export default function Ticker({ events }: TickerProps) {
  if (!events || events.length === 0) return null;

  const items = events.filter(e => e.eventType === 'SPORTS');
  if (items.length === 0) return null;

  return (
    <div className="w-full overflow-hidden bg-card/80 backdrop-blur border-y border-border py-2">
      <div className="ticker-animate flex whitespace-nowrap gap-8" style={{ width: 'max-content' }}>
        {[...items, ...items].map((e, i) => (
          <span key={`${e.id}-${i}`} className="inline-flex items-center text-sm text-foreground/80">
            {leagueBadge(e.league)}
            <span className="font-medium">{e.eventTitle}</span>
            {e.isLive && (
              <span className="ml-2 text-[10px] font-bold text-red-500 animate-pulse">● LIVE</span>
            )}
            {e.homeScore !== undefined && e.awayScore !== undefined && (
              <span className="ml-2 text-accent font-mono text-xs">
                {e.awayScore} - {e.homeScore}
              </span>
            )}
            {!e.isLive && e.status && e.status !== 'Scheduled' && (
              <span className="ml-2 text-muted text-xs">{e.status}</span>
            )}
            {!e.isLive && e.status === 'Scheduled' && (
              <span className="ml-2 text-muted text-xs">
                {new Date(e.eventTimestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
