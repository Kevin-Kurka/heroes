import { UnifiedEvent } from '@/types';

/**
 * Helpers behind the Scoreboard "Let's Go" chip. One tap lets a fan invite
 * friends and add the game to a calendar — all as plain text + a calendar link
 * (modern messaging renders rich previews, so no .ics attachment is needed).
 * Everything frames the event as "watch it at the bar": the location is the
 * venue (not the game's stadium) and the title reads "Watch X vs Y @ American
 * Heroes & Brew", so a game reminder becomes a reminder to come in.
 */

const VENUE_NAME = 'American Heroes & Brew';
const VENUE_ADDRESS = '300 Carlsbad Village Dr #120, Carlsbad, CA 92008';
const TZ = 'America/Los_Angeles';
/** Typical broadcast window — used for the end time since APIs give only a start. */
const GAME_DURATION_MS = 3 * 60 * 60 * 1000;

/** Date → Google Calendar UTC stamp, e.g. 20260605T013000Z. */
function toCalendarUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function eventEnd(start: Date): Date {
  return new Date(start.getTime() + GAME_DURATION_MS);
}

function eventDescription(event: UnifiedEvent): string {
  return event.venue
    ? `${event.eventTitle} — on the big screens at ${VENUE_NAME}. (${event.venue})`
    : `On the big screens at ${VENUE_NAME}.`;
}

/** Human-facing title shared by the calendar entry and the invite. */
export function eventCalendarTitle(event: UnifiedEvent): string {
  if (event.awayTeam && event.homeTeam) {
    return `Watch ${event.awayTeam} vs ${event.homeTeam} @ ${VENUE_NAME}`;
  }
  return `${event.eventTitle} @ ${VENUE_NAME}`;
}

/** Full local date + time range, e.g. "Sat, Jun 7 · 6:30–9:30 PM" (Pacific). */
export function formatEventWhen(event: UnifiedEvent): string {
  const start = new Date(event.eventTimestamp);
  const end = eventEnd(start);
  const day = start.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: TZ,
  });
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: TZ });
  let startTime = fmtTime(start);
  const endTime = fmtTime(end);
  // Drop the redundant meridiem on the start when both sides share it
  // ("6:30 PM–9:30 PM" → "6:30–9:30 PM").
  if (startTime.slice(-2) === endTime.slice(-2)) startTime = startTime.slice(0, -3);
  return `${day} · ${startTime}–${endTime}`;
}

/** Polished, ready-to-send invite for the native share sheet / clipboard. */
export function buildInviteText(event: UnifiedEvent): string {
  const hasMatchup = Boolean(event.awayTeam && event.homeTeam);
  const headline = hasMatchup
    ? `Watch ${event.awayTeam} vs ${event.homeTeam} at ${VENUE_NAME}`
    : `Join us for ${event.eventTitle} at ${VENUE_NAME}`;
  return [
    headline,
    `📅 ${formatEventWhen(event)}`,
    `📍 ${VENUE_ADDRESS}`,
    `Let's go!`,
  ].join('\n');
}

/**
 * Google Calendar "add event" link — shared as the invite URL so recipients can
 * one-tap add the game (date, time, title, and venue are baked into the link),
 * and used as the desktop fallback. Opens the prefilled composer in any browser.
 */
export function buildGoogleCalendarUrl(event: UnifiedEvent): string {
  const start = new Date(event.eventTimestamp);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: eventCalendarTitle(event),
    dates: `${toCalendarUtc(start)}/${toCalendarUtc(eventEnd(start))}`,
    location: VENUE_ADDRESS,
    details: eventDescription(event),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Same-origin URL for the branded matchup-card PNG (team logos + Heroes badge +
 * date/location), shared as the image in the MMS. Server-rendered and cached, so
 * the client just fetches it — see /api/og/event.
 */
export function buildEventImageUrl(event: UnifiedEvent): string {
  const params = new URLSearchParams({ title: event.eventTitle, when: formatEventWhen(event) });
  if (event.awayTeam) params.set('away', event.awayTeam);
  if (event.homeTeam) params.set('home', event.homeTeam);
  if (event.awayLogo) params.set('aw', event.awayLogo);
  if (event.homeLogo) params.set('hm', event.homeLogo);
  if (event.league) params.set('league', event.league);
  return `/api/og/event?${params.toString()}`;
}
