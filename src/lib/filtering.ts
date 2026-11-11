import type { Room } from '@/lib/fixtures';

export const MIN_ATTENDEES = 1;

export type RoomFilter = {
  attendees: number;
  equipment: readonly string[];
};

export function filterRooms(rooms: readonly Room[], filter: RoomFilter): Room[] {
  return rooms.filter(
    (room) =>
      room.capacity >= filter.attendees &&
      filter.equipment.every((item) => room.equipment.includes(item)),
  );
}

export function parseAttendees(raw: string): number {
  return Math.max(MIN_ATTENDEES, Math.floor(Number(raw)) || MIN_ATTENDEES);
}

export function toggleEquipment(equipment: readonly string[], item: string): string[] {
  return equipment.includes(item)
    ? equipment.filter((e) => e !== item)
    : [...equipment, item];
}

/** Keeps the current room if it still matches, otherwise falls back to the first match. */
export function reconcileRoomSelection(
  matches: readonly Room[],
  roomId: string | null,
): string | null {
  return matches.some((r) => r.id === roomId) ? roomId : (matches[0]?.id ?? null);
}
