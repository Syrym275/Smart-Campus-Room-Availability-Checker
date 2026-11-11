import { describe, it, expect } from 'vitest';
import {
  filterRooms,
  parseAttendees,
  reconcileRoomSelection,
  toggleEquipment,
} from '@/lib/filtering';
import { rooms } from '@/lib/fixtures';

const ids = (list: { id: string }[]) => list.map((r) => r.id);

describe('filter helpers', () => {
  it('parseAttendees clamps empty, zero, NaN and negative input to 1 and floors decimals', () => {
    expect(parseAttendees('')).toBe(1);
    expect(parseAttendees('0')).toBe(1);
    expect(parseAttendees('abc')).toBe(1);
    expect(parseAttendees('-4')).toBe(1);
    expect(parseAttendees('2.7')).toBe(2);
  });

  it('toggleEquipment adds a missing item and removes a present one', () => {
    expect(toggleEquipment(['Projector'], 'Microphone')).toEqual(['Projector', 'Microphone']);
    expect(toggleEquipment(['Projector', 'Microphone'], 'Projector')).toEqual(['Microphone']);
  });

  it('reconcileRoomSelection keeps the current room when it still matches', () => {
    expect(reconcileRoomSelection(rooms.slice(1), 'C-303')).toBe('C-303');
  });

  it('reconcileRoomSelection falls back to the first match, or null when none match', () => {
    expect(reconcileRoomSelection(rooms.slice(2), 'A-101')).toBe('C-303');
    expect(reconcileRoomSelection([], 'A-101')).toBeNull();
  });
});

describe('filterRooms', () => {
  it('lists every room for the default requirements', () => {
    expect(ids(filterRooms(rooms, { attendees: 1, equipment: [] }))).toEqual([
      'A-101',
      'B-202',
      'C-303',
      'D-404',
    ]);
  });

  it('keeps only rooms with capacity >= attendees (F1)', () => {
    expect(ids(filterRooms(rooms, { attendees: 31, equipment: [] }))).toEqual([
      'C-303',
      'D-404',
    ]);
  });

  it('keeps only rooms that contain ALL selected equipment (F2)', () => {
    expect(
      ids(filterRooms(rooms, { attendees: 1, equipment: ['Projector', 'Microphone'] })),
    ).toEqual(['C-303']);
  });

  it('keeps a blocked room that matches the requirements', () => {
    expect(ids(filterRooms(rooms, { attendees: 1, equipment: ['Computers'] }))).toEqual([
      'D-404',
    ]);
  });

  it('F1: a room whose capacity equals the attendee count is included', () => {
    expect(ids(filterRooms(rooms, { attendees: 40, equipment: [] }))).toEqual([
      'C-303',
      'D-404',
    ]);
  });

  it('F1: a room one seat below the attendee count is excluded', () => {
    expect(ids(filterRooms(rooms, { attendees: 41, equipment: [] }))).toEqual(['C-303']);
  });

  it('F2: a single equipment item keeps every room that has it', () => {
    expect(ids(filterRooms(rooms, { attendees: 1, equipment: ['Projector'] }))).toEqual([
      'A-101',
      'C-303',
      'D-404',
    ]);
  });

  it('F4: 200 attendees matches no room', () => {
    expect(filterRooms(rooms, { attendees: 200, equipment: [] })).toEqual([]);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterRooms(rooms, { attendees: 500, equipment: [] })).toEqual([]);
  });

  it('does not mutate the room catalog', () => {
    const before = JSON.stringify(rooms);
    filterRooms(rooms, { attendees: 10, equipment: ['Projector'] });
    expect(JSON.stringify(rooms)).toBe(before);
  });
});
