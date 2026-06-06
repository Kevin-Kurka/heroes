import { UnifiedEvent } from '@/types';

/**
 * Client-side "Add to Calendar" for Scoreboard games. The calendar entry pins
 * the location to the *bar* (not the game's stadium) and frames the event as
 * "watch it here" — so a reminder to watch the game becomes a reminder to come
 * in. Universal .ics is used so it lands in Apple Calendar, Google Calendar, and
 * Outlook alike without any third-party widget.
 */

const VENUE_NAME = 'American Heroes & Brew';
const VENUE_ADDRESS = '300 Carlsbad Village Dr #120, Carlsbad, CA 92008';
/** Typical broadcast window — used for DTEND since APIs only give a start time. */
const GAME_DURATION_MS = 3 * 60 * 60 * 1000;

/** RFC 5545 escaping for TEXT values (backslash, semicolon, comma, newline). */
function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Date → iCal UTC stamp, e.g. 20260605T013000Z. */
function toIcsUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Human-facing title shared by the calendar entry and the share sheet. */
export function eventCalendarTitle(event: UnifiedEvent): string {
  if (event.awayTeam && event.homeTeam) {
    return `Watch ${event.awayTeam} vs ${event.homeTeam} @ ${VENUE_NAME}`;
  }
  return `${event.eventTitle} @ ${VENUE_NAME}`;
}

/** Build a single-event .ics document for watching a game at the bar. */
export function buildEventIcs(event: UnifiedEvent): string {
  const start = new Date(event.eventTimestamp);
  const end = new Date(start.getTime() + GAME_DURATION_MS);
  const description = event.venue
    ? `${event.eventTitle} — on the big screens at ${VENUE_NAME}. (${event.venue})`
    : `On the big screens at ${VENUE_NAME}.`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//American Heroes & Brew//Scoreboard//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.id}@americanheroesandbrew.com`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeIcsText(eventCalendarTitle(event))}`,
    `LOCATION:${escapeIcsText(VENUE_ADDRESS)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/** Trigger a client-side download of the event's .ics file. */
export function downloadEventIcs(event: UnifiedEvent): void {
  const blob = new Blob([buildEventIcs(event)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `heroes-${event.id}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
