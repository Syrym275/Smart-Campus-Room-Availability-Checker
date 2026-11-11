import { useState } from 'react';
import { Users } from 'lucide-react';
import { CARD_CLASS } from '@/components/styles';
import { EQUIPMENT_OPTIONS } from '@/lib/fixtures';
import { MIN_ATTENDEES, parseAttendees } from '@/lib/filtering';

type FilterPanelProps = {
  attendees: number;
  equipment: readonly string[];
  onAttendeesChange: (attendees: number) => void;
  onEquipmentToggle: (item: string) => void;
};

export function FilterPanel({
  attendees,
  equipment,
  onAttendeesChange,
  onEquipmentToggle,
}: FilterPanelProps) {
  const [attendeesDraft, setAttendeesDraft] = useState(String(attendees));

  return (
    <section className={CARD_CLASS}>
      <div className="mb-3 flex items-center gap-2">
        <Users className="h-4 w-4 text-slate-500" aria-hidden />
        <h2 className="text-sm font-semibold">Requirements</h2>
      </div>

      <label htmlFor="attendees" className="mb-1 block text-sm font-medium text-slate-700">
        Attendees
      </label>
      <input
        id="attendees"
        type="number"
        inputMode="numeric"
        min={MIN_ATTENDEES}
        value={attendeesDraft}
        onChange={(e) => {
          setAttendeesDraft(e.target.value);
          if (e.target.value.trim() !== '') onAttendeesChange(parseAttendees(e.target.value));
        }}
        onBlur={() => {
          const next = parseAttendees(attendeesDraft);
          setAttendeesDraft(String(next));
          if (next !== attendees) onAttendeesChange(next);
        }}
        className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base tabular-nums outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-offset-1"
      />

      <fieldset className="mt-4">
        <legend className="mb-2 text-sm font-medium text-slate-700">Equipment</legend>
        <div className="grid grid-cols-2 gap-2">
          {EQUIPMENT_OPTIONS.map((item) => (
            <label
              key={item}
              className="flex h-12 cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:border-slate-500"
            >
              <input
                type="checkbox"
                checked={equipment.includes(item)}
                onChange={() => onEquipmentToggle(item)}
                className="h-4 w-4 accent-slate-900"
              />
              {item}
            </label>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
