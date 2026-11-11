import { describe, it, expect } from 'vitest';
import {
  canBook,
  checkRoom,
  formatClock,
  MAX_DURATION,
} from '@/lib/availability';
import { NOW_MINUTES, rooms } from '@/lib/fixtures';

const NOW = NOW_MINUTES; // 540 (09:00)
const A101 = rooms[0];
const B202 = rooms[1];
const D404 = rooms[3];
const BOOKINGS = [...A101.bookings]; // shallow copy; tests must not mutate the original

describe('canBook', () => {
  it('AC1: rejects a start time that is not after the current time', () => {
    // start (540) equals now (540), so the request is in the past.
    // AC1 requires the start to be strictly after now.
    const result = canBook(NOW, NOW + 30, NOW, BOOKINGS, false);
    expect(result.status).toBe('unavailable');
  });

  it('AC1: rejects a reversed interval where start >= end', () => {
    // start (660) >= end (600) — no valid interval exists.
    // AC1 rejects any request where start is not strictly before end.
    const result = canBook(660, 600, NOW, BOOKINGS, false);
    expect(result.status).toBe('unavailable');
  });

  it('AC2: rejects a booking longer than 120 minutes', () => {
    // 780 - 660 = 120 — allowed. 781 - 660 = 121 — rejected.
    // Both slots start after now (540) and sit after the existing booking
    // (600–660), so only the duration rule is exercised. AC2 caps at 120.
    const ok = canBook(660, 780, NOW, BOOKINGS, false);
    expect(ok.status).toBe('available');

    const tooLong = canBook(660, 781, NOW, BOOKINGS, false);
    expect(tooLong.status).toBe('unavailable');
  });

  it('AC3: rejects any request when the room is blocked', () => {
    // A slot that would otherwise be available must still be rejected
    // when blocked is true (AC3).
    const result = canBook(700, 750, NOW, BOOKINGS, true);
    expect(result.status).toBe('unavailable');
  });

  it('AC4: rejects a slot that overlaps an existing booking', () => {
    // Existing booking is 600–660. A request of 630–700 shares interior
    // points (630–660), so AC4 rejects it.
    const result = canBook(630, 700, NOW, BOOKINGS, false);
    expect(result.status).toBe('unavailable');
  });

  it('AC4: allows a slot that ends exactly when an existing booking starts (touching endpoint)', () => {
    // Request 560–600 ends at 600, existing booking starts at 600.
    // Half-open intervals [560,600) and [600,660) share no interior point,
    // so AC4 allows it.
    const result = canBook(560, 600, NOW, BOOKINGS, false);
    expect(result.status).toBe('available');
  });

  it('AC4: allows a slot that starts exactly when an existing booking ends (touching endpoint)', () => {
    // Existing booking ends at 660. Request 660–700 starts at 660.
    // Half-open intervals [600,660) and [660,700) share no interior point,
    // so AC4 allows it.
    const result = canBook(660, 700, NOW, BOOKINGS, false);
    expect(result.status).toBe('available');
  });

  it('AC5: does not mutate the bookings array passed to it', () => {
    const snapshot = JSON.stringify(BOOKINGS);
    canBook(700, 750, NOW, BOOKINGS, false);
    expect(JSON.stringify(BOOKINGS)).toBe(snapshot);
  });

  it('AC5: fixture data is unchanged after imports', () => {
    // Verify the exported fixture constants have not been altered by
    // module load or any test above.
    expect(A101.bookings).toEqual([{ start: 600, end: 660 }]);
    expect(NOW_MINUTES).toBe(540);
    expect(MAX_DURATION).toBe(120);
  });

  it('formatClock renders 1440 as 24:00', () => {
    expect(formatClock(1440)).toBe('24:00');
  });
});

describe('checkRoom', () => {
  it('returns the blocked result for a blocked room even with a free slot', () => {
    expect(checkRoom(D404, 700, 750, NOW)).toEqual({
      status: 'unavailable',
      reason: 'The room is blocked.',
    });
  });

  it('delegates to canBook using the room bookings for an unblocked room', () => {
    expect(checkRoom(A101, 630, 700, NOW).status).toBe('unavailable');
    expect(checkRoom(A101, 660, 700, NOW).status).toBe('available');
  });
});

describe('regression: AC and F rules', () => {
  it('AC1: accepts a start exactly one minute after now', () => {
    expect(canBook(NOW + 1, NOW + 31, NOW, BOOKINGS, false).status).toBe('available');
  });

  it('AC2: a 120-minute slot is accepted and a 121-minute slot is rejected', () => {
    // B-202 is booked 720-780, so 800-920 and 800-921 do not overlap it.
    expect(canBook(800, 920, NOW, B202.bookings, false).status).toBe('available');
    expect(canBook(800, 921, NOW, B202.bookings, false).status).toBe('unavailable');
  });

  it('AC4: a one-minute overlap at the end of a booking is rejected', () => {
    // 659 < 660, so [659,700) shares 659-660 with the 600-660 booking.
    expect(canBook(659, 700, NOW, BOOKINGS, false).status).toBe('unavailable');
  });

  it('F3: a blocked room is unavailable even for a free slot with no bookings', () => {
    expect(checkRoom(D404, 900, 960, NOW)).toEqual({
      status: 'unavailable',
      reason: 'The room is blocked.',
    });
  });

  it('F5: the same slot is judged against the selected room bookings', () => {
    expect(checkRoom(A101, 600, 660, NOW).status).toBe('unavailable');
    expect(checkRoom(B202, 600, 660, NOW).status).toBe('available');
  });

  it('AC5: checkRoom does not mutate the room it is given', () => {
    const snapshot = JSON.stringify(A101);
    checkRoom(A101, 700, 750, NOW);
    expect(JSON.stringify(A101)).toBe(snapshot);
  });
});
