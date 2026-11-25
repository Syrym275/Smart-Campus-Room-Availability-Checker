import { describe, expect, it } from 'vitest';
import { canBook, type ReasonCode } from '@/lib/availability';
import { NOW_MINUTES, rooms } from '@/lib/fixtures';

// Practice #12 shared contract: inputs = start time, duration, blocked flag; outputs = available + reason code.
// The app itself takes start and end; duration = end - start. Contract codes:
// AVAILABLE, BLOCKED, OVERLAP, PAST_START, INVALID_DURATION.
type ContractCode = 'AVAILABLE' | 'BLOCKED' | 'OVERLAP' | 'PAST_START' | 'INVALID_DURATION';

const TO_CONTRACT: Record<ReasonCode, ContractCode> = {
  AVAILABLE: 'AVAILABLE',
  BLOCKED: 'BLOCKED',
  OVERLAP: 'OVERLAP',
  PAST_TIME: 'PAST_START',
  INVALID_ORDER: 'INVALID_DURATION',
  TOO_LONG: 'INVALID_DURATION',
  OUT_OF_RANGE: 'INVALID_DURATION',
};

const room = rooms.find((r) => r.id === 'A-101')!; // one room, one booking 10:00-11:00 (600-660)

function check(start: number, duration: number, blocked: boolean) {
  const result = canBook(start, start + duration, NOW_MINUTES, room.bookings, blocked);
  return result.status === 'available'
    ? { available: true, code: 'AVAILABLE' as ContractCode }
    : { available: false, code: TO_CONTRACT[result.code] };
}

describe('Practice 12 contract tests (code-based track)', () => {
  it('T1 valid free interval -> Available', () => {
    expect(check(720, 60, false)).toEqual({ available: true, code: 'AVAILABLE' });
  });
  it('T2 overlap with an existing booking -> Unavailable', () => {
    expect(check(630, 60, false)).toEqual({ available: false, code: 'OVERLAP' });
  });
  it('T3 blocked room -> Unavailable', () => {
    expect(check(720, 60, true)).toEqual({ available: false, code: 'BLOCKED' });
  });
  it('T4 duration = 0 -> validation error', () => {
    expect(check(720, 0, false)).toEqual({ available: false, code: 'INVALID_DURATION' });
  });
  it('T5 duration = 121 -> validation error', () => {
    expect(check(720, 121, false)).toEqual({ available: false, code: 'INVALID_DURATION' });
  });
  it('T6 past start time -> validation error', () => {
    expect(check(480, 30, false)).toEqual({ available: false, code: 'PAST_START' });
  });
  it('T7 adjacent non-overlapping interval -> Available', () => {
    expect(check(660, 60, false)).toEqual({ available: true, code: 'AVAILABLE' });
  });
  it('T8 booking data unchanged after checks', () => {
    const before = JSON.stringify(room.bookings);
    [[720, 60, false], [630, 60, false], [720, 60, true], [720, 0, false], [720, 121, false], [480, 30, false], [660, 60, false]].forEach(
      ([s, d, b]) => check(s as number, d as number, b as boolean),
    );
    expect(JSON.stringify(room.bookings)).toBe(before);
  });
});
