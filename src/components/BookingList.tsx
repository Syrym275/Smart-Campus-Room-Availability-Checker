import { CalendarRange } from 'lucide-react';
import { CARD_CLASS } from '@/components/styles';
import { formatClock, type Booking } from '@/lib/availability';

type BookingListProps = {
  bookings: readonly Booking[];
};

export function BookingList({ bookings }: BookingListProps) {
  return (
    <section className={CARD_CLASS}>
      <div className="mb-3 flex items-center gap-2">
        <CalendarRange className="h-4 w-4 text-slate-500" aria-hidden />
        <h2 className="text-sm font-semibold">Existing bookings</h2>
        <span className="ml-auto text-xs text-slate-400">
          {bookings.length} today
        </span>
      </div>
      <ul className="space-y-2">
        {bookings.map((b) => (
          <li
            key={`${b.start}-${b.end}`}
            className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
          >
            <span className="tabular-nums font-medium">
              {formatClock(b.start)} – {formatClock(b.end)}
            </span>
            <span className="text-xs text-slate-500 tabular-nums">
              {b.start}–{b.end} min
            </span>
          </li>
        ))}
      </ul>
      {bookings.length === 0 && (
        <p className="text-sm text-slate-500">No bookings today.</p>
      )}
    </section>
  );
}
