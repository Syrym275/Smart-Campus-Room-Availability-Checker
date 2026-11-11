import { useState } from 'react';
import { DoorOpen } from 'lucide-react';
import { AvailabilityForm } from '@/components/AvailabilityForm';
import { BookingList } from '@/components/BookingList';
import { FilterPanel } from '@/components/FilterPanel';
import { ResultBanner } from '@/components/ResultBanner';
import { RoomSelector } from '@/components/RoomSelector';
import { RoomSummary } from '@/components/RoomSummary';
import { checkRoom, parseMinutes, type CheckResult } from '@/lib/availability';
import { NOW_MINUTES, rooms } from '@/lib/fixtures';
import {
  MIN_ATTENDEES,
  filterRooms,
  reconcileRoomSelection,
  toggleEquipment,
  type RoomFilter,
} from '@/lib/filtering';

export default function App() {
  const [filter, setFilter] = useState<RoomFilter>({ attendees: MIN_ATTENDEES, equipment: [] });
  const [roomId, setRoomId] = useState<string | null>(rooms[0].id);
  const [startRaw, setStartRaw] = useState('');
  const [endRaw, setEndRaw] = useState('');
  const [result, setResult] = useState<CheckResult | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const matchingRooms = filterRooms(rooms, filter);
  const room = rooms.find((r) => r.id === roomId) ?? null;

  const startParse = parseMinutes(startRaw);
  const endParse = parseMinutes(endRaw);
  const canRunCheck = startParse.kind === 'ok' && endParse.kind === 'ok';

  function handleCheck() {
    setSubmitted(true);
    if (!room || !canRunCheck) {
      setResult(null);
      return;
    }
    setResult(checkRoom(room, startParse.value, endParse.value, NOW_MINUTES));
  }

  function handleFieldEdit() {
    setSubmitted(false);
    setResult(null);
  }

  function handleRoomChange(id: string) {
    setRoomId(id);
    setResult(null);
  }

  function handleFilterChange(next: RoomFilter) {
    setFilter(next);
    setRoomId(reconcileRoomSelection(filterRooms(rooms, next), roomId));
    setResult(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-6 sm:py-10">
        <header className="mb-6">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <DoorOpen className="h-4 w-4" aria-hidden />
            Smart Campus
          </div>
          <h1 className="mt-1 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
            Room Availability Checker
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Check whether a time slot is free. This tool only checks availability —
            it does not create or confirm any booking.
          </p>
        </header>

        <FilterPanel
          attendees={filter.attendees}
          equipment={filter.equipment}
          onAttendeesChange={(attendees) => handleFilterChange({ ...filter, attendees })}
          onEquipmentToggle={(item) =>
            handleFilterChange({ ...filter, equipment: toggleEquipment(filter.equipment, item) })
          }
        />

        <RoomSelector rooms={matchingRooms} selectedId={roomId} onChange={handleRoomChange} />

        <RoomSummary room={room} />

        {room && <BookingList bookings={room.bookings} />}

        <AvailabilityForm
          startRaw={startRaw}
          endRaw={endRaw}
          startParse={startParse}
          endParse={endParse}
          submitted={submitted}
          checkDisabled={!room}
          onStartChange={(v) => {
            setStartRaw(v);
            handleFieldEdit();
          }}
          onEndChange={(v) => {
            setEndRaw(v);
            handleFieldEdit();
          }}
          onCheck={handleCheck}
        />

        {result && room && <ResultBanner result={result} roomName={room.name} />}

        <footer className="mt-auto pt-4 text-center text-xs text-slate-400">
          Prototype with fictional data. No bookings are created or saved.
        </footer>
      </main>
    </div>
  );
}
