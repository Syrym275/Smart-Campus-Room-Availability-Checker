import { Clock, DoorClosed, Lock } from 'lucide-react';
import { CAPTION_CLASS, CARD_CLASS } from '@/components/styles';
import { formatClock } from '@/lib/availability';
import { NOW_MINUTES, type Room } from '@/lib/fixtures';

type RoomSummaryProps = {
  room: Room | null;
};

export function RoomSummary({ room }: RoomSummaryProps) {
  return (
    <section aria-label="Room summary" className={CARD_CLASS}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <DoorClosed className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className={CAPTION_CLASS}>Room</p>
            {room ? (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-semibold">{room.name}</p>
                {room.blocked && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                    <Lock className="h-3 w-3" aria-hidden />
                    Blocked
                  </span>
                )}
              </div>
            ) : (
              <p className="text-base font-semibold text-slate-500">No room selected</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className={CAPTION_CLASS}>Current time</p>
          <p className="flex items-center justify-end gap-1 text-base font-semibold tabular-nums">
            <Clock className="h-4 w-4 text-slate-500" aria-hidden />
            {formatClock(NOW_MINUTES)}
            <span className="text-xs font-normal text-slate-400">
              ({NOW_MINUTES} min)
            </span>
          </p>
        </div>
      </div>
      {room && (
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm">
          <div>
            <dt className={CAPTION_CLASS}>Capacity</dt>
            <dd className="font-semibold tabular-nums">{room.capacity} people</dd>
          </div>
          <div>
            <dt className={CAPTION_CLASS}>Equipment</dt>
            <dd className="font-semibold">{room.equipment.join(', ')}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}
