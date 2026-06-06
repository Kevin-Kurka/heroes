'use client';

import { UnifiedEvent } from '@/types';

interface TickerProps {
  events: UnifiedEvent[];
}

function TickerItem({ event }: { event: UnifiedEvent }) {
  const hasScore = event.homeScore !== undefined && event.awayScore !== undefined;
  const isScheduled = !event.isLive && !hasScore;

  return (
    <span className="inline-flex items-center gap-2">
      {/* Away team name */}
      <span className={`text-sm font-medium ${hasScore && event.awayScore! > event.homeScore! ? 'text-foreground' : 'text-foreground/70'}`}>
        {event.awayTeam || 'Away'}
      </span>

      {/* Away logo */}
      {event.awayLogo && (
        <img src={event.awayLogo} alt="" className="w-6 h-6 object-contain" />
      )}

      {/* Score or time */}
      {hasScore ? (
        <span className="font-mono text-base font-bold text-foreground">
          {event.awayScore} – {event.homeScore}
        </span>
      ) : isScheduled ? (
        <span className="text-muted text-sm font-mono">
          {new Date(event.eventTimestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles' })}
        </span>
      ) : (
        <span className="text-muted text-sm">vs</span>
      )}

      {/* Home logo */}
      {event.homeLogo && (
        <img src={event.homeLogo} alt="" className="w-6 h-6 object-contain" />
      )}

      {/* Home team name */}
      <span className={`text-sm font-medium ${hasScore && event.homeScore! > event.awayScore! ? 'text-foreground' : 'text-foreground/70'}`}>
        {event.homeTeam || 'Home'}
      </span>

      {/* Live indicator */}
      {event.isLive && (
        <span className="text-xs font-bold text-red-500 animate-pulse">LIVE</span>
      )}

      {/* Final indicator */}
      {!event.isLive && hasScore && (
        <span className="text-muted text-xs">F</span>
      )}
    </span>
  );
}

export default function Ticker({ events }: TickerProps) {
  if (!events || events.length === 0) return null;

  const items = events.filter(e => e.eventType === 'SPORTS');
  if (items.length === 0) return null;

  // Duplicate items for seamless looping
  const doubled = [...items, ...items];

  return (
    <div className="w-full overflow-hidden bg-card/80 backdrop-blur border-y border-border py-2">
      <div className="ticker-animate flex whitespace-nowrap gap-10" style={{ width: 'max-content' }}>
        {doubled.map((e, i) => (
          <span key={`${e.id}-${i}`} className="inline-flex items-center">
            <TickerItem event={e} />
            <span className="ml-10 text-border/60">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}
