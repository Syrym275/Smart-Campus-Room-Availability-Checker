export const MAX_DURATION = 120; // minutes
export const DAY_MINUTES = 1440;
export const MIN_MINUTE = 0;
export const MAX_MINUTE = DAY_MINUTES; // end may equal the end of the day

export type Booking = { start: number; end: number };

export type CheckResult =
  | { status: 'available' }
  | { status: 'unavailable'; reason: string };

export function isMinuteInRange(value: number): boolean {
  return value >= MIN_MINUTE && value <= MAX_MINUTE;
}

/** Convert minutes-after-midnight to a HH:MM clock string. */
export function formatClock(minutes: number): string {
  if (minutes === MAX_MINUTE) return '24:00';
  const m = ((Math.trunc(minutes) % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/** Two half-open intervals overlap iff they share any interior point. */
function overlaps(a: Booking, b: { start: number; end: number }): boolean {
  return a.start < b.end && b.start < a.end;
}

/**
 * Pure availability check. Does not mutate `bookings` and does not create
 * any booking. Returns an unambiguous Available / Unavailable result with a
 * plain-language reason when unavailable.
 */
export function canBook(
  start: number,
  end: number,
  now: number,
  bookings: readonly Booking[],
  blocked: boolean,
): CheckResult {
  if (blocked) {
    return { status: 'unavailable', reason: 'The room is blocked.' };
  }
  if (start < MIN_MINUTE || end > MAX_MINUTE) {
    return {
      status: 'unavailable',
      reason: `Times must be between ${MIN_MINUTE} and ${MAX_MINUTE} minutes after midnight.`,
    };
  }
  if (start >= end) {
    return {
      status: 'unavailable',
      reason: 'The end time must be after the start time.',
    };
  }
  if (start <= now) {
    return {
      status: 'unavailable',
      reason: `The start time must be after the current time (${formatClock(now)}).`,
    };
  }
  if (end - start > MAX_DURATION) {
    const limit = `${MAX_DURATION} minutes`;
    return {
      status: 'unavailable',
      reason: `The booking is longer than ${limit}. The maximum allowed duration is ${limit}.`,
    };
  }
  for (const b of bookings) {
    if (overlaps(b, { start, end })) {
      return {
        status: 'unavailable',
        reason: `It overlaps the existing booking ${b.start}-${b.end} (${formatClock(b.start)}-${formatClock(b.end)}).`,
      };
    }
  }
  return { status: 'available' };
}

export function checkRoom(
  room: { blocked: boolean; bookings: readonly Booking[] },
  start: number,
  end: number,
  now: number,
): CheckResult {
  return canBook(start, end, now, room.bookings, room.blocked);
}

export type ParseState =
  | { kind: 'empty' }
  | { kind: 'invalid' }
  | { kind: 'ok'; value: number };

/** Parse a raw input string into a whole number of minutes, without correcting it. */
export function parseMinutes(raw: string): ParseState {
  const trimmed = raw.trim();
  if (trimmed === '') return { kind: 'empty' };
  if (!/^-?\d+$/.test(trimmed)) return { kind: 'invalid' };
  return { kind: 'ok', value: parseInt(trimmed, 10) };
}
