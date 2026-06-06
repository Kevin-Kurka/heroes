import { UnifiedEvent } from '@/types';

/**
 * Helpers behind the Scoreboard "Let's Go" chip. One tap should let a fan invite
 * friends *and* add the game to a calendar — so everything here frames the event
 * as "watch it at the bar": the location is pinned to the venue (not the game's
 * stadium) and the title reads "Watch X vs Y @ American Heroes & Brew". A game
 * reminder thereby becomes a reminder to come in, and an invite becomes a watch
 * party.
 */

const VENUE_NAME = 'American Heroes & Brew';
const VENUE_ADDRESS = '300 Carlsbad Village Dr #120, Carlsbad, CA 92008';
/** Typical broadcast window — used for the end time since APIs give only a start. */
const GAME_DURATION_MS = 3 * 60 * 60 * 1000;

/** RFC 5545 escaping for TEXT values (backslash, semicolon, comma, newline). */
function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Date → iCal/Google UTC stamp, e.g. 20260605T013000Z. */
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

/** Ready-to-send invite message for the native share sheet / clipboard. */
export function buildInviteText(event: UnifiedEvent): string {
  const matchup =
    event.awayTeam && event.homeTeam
      ? `${event.awayTeam} vs ${event.homeTeam}`
      : event.eventTitle;
  const when = new Date(event.eventTimestamp).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Los_Angeles',
  });
  return `${matchup} on the big screens at ${VENUE_NAME} — ${when}. Let's go! 🍻📺`;
}

/** Single-event .ics document (shared as a file so it lands in any calendar app). */
export function buildEventIcs(event: UnifiedEvent): string {
  const start = new Date(event.eventTimestamp);
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//American Heroes & Brew//Scoreboard//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.id}@americanheroesandbrew.com`,
    `DTSTAMP:${toCalendarUtc(new Date())}`,
    `DTSTART:${toCalendarUtc(start)}`,
    `DTEND:${toCalendarUtc(eventEnd(start))}`,
    `SUMMARY:${escapeIcsText(eventCalendarTitle(event))}`,
    `LOCATION:${escapeIcsText(VENUE_ADDRESS)}`,
    `DESCRIPTION:${escapeIcsText(eventDescription(event))}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Google Calendar "add event" link — used as the share URL (so recipients can
 * one-tap add the game) and the desktop fallback when the Web Share API is
 * unavailable. Opens the prefilled event composer in any browser.
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
