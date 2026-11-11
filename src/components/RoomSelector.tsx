import { ChevronDown } from 'lucide-react';
import { CARD_CLASS } from '@/components/styles';
import type { Room } from '@/lib/fixtures';

type RoomSelectorProps = {
  rooms: readonly Room[];
  selectedId: string | null;
  onChange: (id: string) => void;
};

export function RoomSelector({ rooms, selectedId, onChange }: RoomSelectorProps) {
  return (
    <section className={CARD_CLASS}>
      <label htmlFor="room-select" className="mb-2 block text-sm font-semibold">
        Room
      </label>
      {rooms.length > 0 ? (
        <div className="relative">
          <select
            id="room-select"
            value={selectedId ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="h-12 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 pr-10 text-base outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-offset-1"
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
            aria-hidden
          />
        </div>
      ) : (
        <p
          role="status"
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm font-medium text-red-800"
        >
          No rooms match your requirements.
        </p>
      )}
    </section>
  );
}
