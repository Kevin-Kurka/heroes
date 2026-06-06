import { DaySchedule } from '@/types';

/** Parse a "10:00 AM" / "12:00 AM" style time into minutes-since-midnight. */
function parseTimeToMinutes(time: string): number {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return NaN;
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hour !== 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;
  return hour * 60 + minute;
}

/** Current weekday + minutes-since-midnight in Carlsbad (Pacific), TZ-safe. */
function pacificNow(now: Date): { weekday: string; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? '';
  let hour = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10);
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10);
  if (hour === 24) hour = 0; // some runtimes render midnight as 24
  return { weekday, minutes: hour * 60 + minute };
}

/**
 * Whether the restaurant is currently open per its posted hours (Pacific time).
 * A `12:00 AM` close is treated as end-of-day (midnight). Sessions that wrap past
 * midnight are matched against the previous day's schedule as well.
 */
export function isOpenNow(hours: DaySchedule[], now: Date = new Date()): boolean {
  const { weekday, minutes } = pacificNow(now);
  const order = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIdx = order.indexOf(weekday);
  if (todayIdx === -1) return false;
  const prevDay = order[(todayIdx + 6) % 7];

  for (const { day, offset } of [
    { day: weekday, offset: 0 },
    { day: prevDay, offset: 1440 }, // previous day's session bleeding past midnight
  ]) {
    const schedule = hours.find((h) => h.dayOfWeek === day);
    if (!schedule) continue;
    const open = parseTimeToMinutes(schedule.open);
    let close = parseTimeToMinutes(schedule.close);
    if (Number.isNaN(open) || Number.isNaN(close)) continue;
    if (close <= open) close += 1440; // wraps past midnight
    const nowMin = minutes + offset;
    if (nowMin >= open && nowMin < close) return true;
  }
  return false;
}
