import type { Booking } from '@/lib/availability';

export type Room = {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  blocked: boolean;
  bookings: Booking[];
};

export const NOW_MINUTES = 540; // 09:00

export const EQUIPMENT_OPTIONS: readonly string[] = [
  'Projector',
  'Whiteboard',
  'Microphone',
  'Computers',
];

export const rooms: Room[] = [
  {
    id: 'A-101',
    name: 'Seminar Room A-101',
    capacity: 30,
    equipment: ['Projector', 'Whiteboard'],
    blocked: false,
    bookings: [{ start: 600, end: 660 }], // 10:00 - 11:00
  },
  {
    id: 'B-202',
    name: 'Study Room B-202',
    capacity: 8,
    equipment: ['Whiteboard'],
    blocked: false,
    bookings: [{ start: 720, end: 780 }], // 12:00 - 13:00
  },
  {
    id: 'C-303',
    name: 'Lecture Hall C-303',
    capacity: 120,
    equipment: ['Projector', 'Microphone', 'Whiteboard'],
    blocked: false,
    bookings: [
      { start: 600, end: 660 }, // 10:00 - 11:00
      { start: 840, end: 900 }, // 14:00 - 15:00
    ],
  },
  {
    id: 'D-404',
    name: 'Computer Lab D-404',
    capacity: 40,
    equipment: ['Computers', 'Projector'],
    blocked: true,
    bookings: [],
  },
];
