'use client';

import { motion } from 'framer-motion';
import { useState, type KeyboardEvent } from 'react';
import { UnifiedEvent } from '@/types';
import { Calendar, MapPin, Clock } from 'lucide-react';
import LetsGoChip from '@/components/LetsGoChip';
import ShareDialog from '@/components/ShareDialog';
import { trackEvent } from '@/lib/analytics';

interface EventCardProps {
  event: UnifiedEvent;
  index: number;
}

const LEAGUE_LOGO: Record<string, string> = {
  MLB: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/mlb.png&w=48&h=48&transparent=true',
  NFL: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png&w=48&h=48&transparent=true',
  NBA: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png&w=48&h=48&transparent=true',
  NHL: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nhl.png&w=48&h=48&transparent=true',
  MLS: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/mls.png&w=48&h=48&transparent=true',
  CFB: 'https://a.espncdn.com/combiner/i?img=/i/espn/misc_logos/500/ncaa_football.png&w=48&h=48&transparent=true',
};

const HOLIDAY_THEMES: Record<string, { border: string; bg: string; iconBg: string; badge: string }> = {
  rose:    { border: 'border-rose-500/30', bg: 'bg-rose-500/5', iconBg: 'bg-rose-500/15', badge: 'bg-rose-500 text-white' },
  emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', iconBg: 'bg-emerald-500/15', badge: 'bg-emerald-500 text-white' },
  green:   { border: 'border-green-600/30', bg: 'bg-green-600/5', iconBg: 'bg-green-600/15', badge: 'bg-green-600 text-white' },
  amber:   { border: 'border-amber-500/30', bg: 'bg-amber-500/5', iconBg: 'bg-amber-500/15', badge: 'bg-amber-500 text-white' },
  blue:    { border: 'border-blue-500/30', bg: 'bg-blue-500/5', iconBg: 'bg-blue-500/15', badge: 'bg-blue-500 text-white' },
  red:     { border: 'border-red-600/30', bg: 'bg-red-600/5', iconBg: 'bg-red-600/15', badge: 'bg-red-600 text-white' },
  orange:  { border: 'border-orange-500/30', bg: 'bg-orange-500/5', iconBg: 'bg-orange-500/15', badge: 'bg-orange-500 text-white' },
  violet:  { border: 'border-violet-500/30', bg: 'bg-violet-500/5', iconBg: 'bg-violet-500/15', badge: 'bg-violet-500 text-white' },
  pink:    { border: 'border-pink-500/30', bg: 'bg-pink-500/5', iconBg: 'bg-pink-500/15', badge: 'bg-pink-500 text-white' },
  sky:     { border: 'border-sky-500/30', bg: 'bg-sky-500/5', iconBg: 'bg-sky-500/15', badge: 'bg-sky-500 text-white' },
  lime:    { border: 'border-lime-500/30', bg: 'bg-lime-500/5', iconBg: 'bg-lime-500/15', badge: 'bg-lime-500 text-white' },
  zinc:    { border: 'border-zinc-500/30', bg: 'bg-zinc-500/5', iconBg: 'bg-zinc-500/15', badge: 'bg-zinc-500 text-white' },
};

export default function EventCard({ event, index }: EventCardProps) {
  const isHoliday = event.eventType === 'HOLIDAY';

  const date = new Date(event.eventTimestamp);
  const now = new Date();
  // Pin to the venue's timezone so the SSR (UTC) and client (browser) renders
  // produce identical strings — otherwise the text mismatches and React throws
  // hydration error #418. Pacific is also the correct time to show for the bar.
  const dayStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles' });

  const hasScore = event.homeScore !== undefined && event.awayScore !== undefined;
  const isFinal = !event.isLive && hasScore && date < now;
  const isUpcoming = !event.isLive && !isFinal;

  // Card opacity for final games
  const cardOpacity = isFinal ? 'opacity-60' : '';

  // The whole card is the share target (not just the chip). Finished games have
  // nothing to invite to, so they stay non-interactive.
  const [shareOpen, setShareOpen] = useState(false);
  const interactive = !isFinal;
  const openShare = () => {
    trackEvent('open_share', { event_id: event.id, league: event.league ?? 'NA' });
    setShareOpen(true);
  };
  const shareProps = interactive
    ? {
        onClick: openShare,
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openShare();
          }
        },
        role: 'button' as const,
        tabIndex: 0,
        'aria-label': `Share — ${event.eventTitle}`,
      }
    : {};

  if (isHoliday) {
    const emoji = event.emoji || '🎉';
    const themeColors = HOLIDAY_THEMES[event.holidayTheme || 'rose'] || HOLIDAY_THEMES.rose;

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.03, ease: [0, 0, 0.2, 1] as const }}
        {...shareProps}
        className={`rounded-md border backdrop-blur-md p-4 ${themeColors.border} ${themeColors.bg} ${
          interactive ? 'cursor-pointer hover:brightness-110 transition-all' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-md flex items-center justify-center text-2xl ${themeColors.iconBg}`}>
            {emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-bold text-foreground text-base">{event.eventTitle}</h3>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${themeColors.badge}`}>
                EVENT
              </span>
            </div>
            <p className="text-sm text-muted">{event.displayMessage}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="flex items-center gap-1 text-muted text-xs">
              <Calendar size={12} />
              <span>{dayStr}</span>
            </div>
            <LetsGoChip />
          </div>
        </div>
        {shareOpen && <ShareDialog event={event} onClose={() => setShareOpen(false)} />}
      </motion.div>
    );
  }

  // Sports card
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03, ease: [0, 0, 0.2, 1] as const }}
      {...shareProps}
      className={`rounded-md border border-white/10 bg-card/70 backdrop-blur-md p-4 ${cardOpacity} ${
        event.isLive ? 'ring-1 ring-red-500/40 border-red-500/30' : ''
      } ${interactive ? 'cursor-pointer hover:border-accent/30 transition-colors' : ''}`}
    >
      {/* Top row: badges + date/time */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {event.league && LEAGUE_LOGO[event.league] && (
            <img
              src={LEAGUE_LOGO[event.league]}
              alt={event.league}
              className="w-5 h-5 object-contain"
            />
          )}
          {event.isLive && (
            <span className="text-[10px] font-bold text-red-500 animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
              LIVE
            </span>
          )}
          {isFinal && (
            <span className="text-[10px] font-bold text-muted tracking-wide">FINAL</span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2 text-muted text-xs">
            <Calendar size={11} />
            <span>{dayStr}</span>
            {isUpcoming && (
              <>
                <Clock size={11} />
                <span className="font-mono">{timeStr}</span>
              </>
            )}
          </div>
          {!isFinal && <LetsGoChip />}
        </div>
      </div>

      {/* Matchup: Away vs Home */}
      <div className="flex items-center justify-between gap-2">
        {/* Away team */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          {event.awayLogo && (
            <img src={event.awayLogo} alt="" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
          )}
          <span className={`text-[10px] font-medium truncate max-w-full mt-1 ${
            hasScore && event.awayScore! > event.homeScore! ? 'text-foreground' : 'text-muted'
          }`}>
            {event.awayTeam}
          </span>
        </div>

        {/* Score / VS */}
        <div className="shrink-0 text-center min-w-[48px] sm:min-w-[64px]">
          {hasScore ? (
            <div className={`font-mono text-base sm:text-lg font-bold tracking-wider ${
              isFinal ? 'text-muted' : 'text-foreground'
            }`}>
              {event.awayScore} – {event.homeScore}
            </div>
          ) : (
            <span className="text-xs text-muted font-medium uppercase tracking-widest">vs</span>
          )}
          {event.isLive && event.status && (
            <span className="text-[10px] text-muted font-medium block mt-0.5">{event.status}</span>
          )}
        </div>

        {/* Home team */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          {event.homeLogo && (
            <img src={event.homeLogo} alt="" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
          )}
          <span className={`text-[10px] font-medium truncate max-w-full mt-1 ${
            hasScore && event.homeScore! > event.awayScore! ? 'text-foreground' : 'text-muted'
          }`}>
            {event.homeTeam}
          </span>
        </div>
      </div>

      {/* Venue (small, bottom) */}
      {event.venue && isUpcoming && (
        <div className="flex items-center gap-1 text-muted text-[11px] mt-2.5">
          <MapPin size={10} />
          <span className="truncate">{event.venue}</span>
        </div>
      )}

      {shareOpen && <ShareDialog event={event} onClose={() => setShareOpen(false)} />}
    </motion.div>
  );
}
