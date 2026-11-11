import { CheckCircle2, XCircle } from 'lucide-react';
import type { CheckResult } from '@/lib/availability';

type ResultBannerProps = {
  result: CheckResult;
  roomName: string;
};

export function ResultBanner({ result, roomName }: ResultBannerProps) {
  const isAvailable = result.status === 'available';

  return (
    <section
      aria-live="polite"
      className={`mb-4 rounded-2xl border p-4 shadow-sm transition-colors ${
        isAvailable ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
      }`}
    >
      <div className="flex items-start gap-3">
        {isAvailable ? (
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" aria-hidden />
        ) : (
          <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-600" aria-hidden />
        )}
        <div className="min-w-0">
          <p
            className={`text-2xl font-extrabold leading-tight ${
              isAvailable ? 'text-emerald-700' : 'text-red-700'
            }`}
          >
            {isAvailable ? 'Available' : 'Unavailable'}
          </p>
          {result.status === 'unavailable' && (
            <p className="mt-1 text-sm text-red-800">{result.reason}</p>
          )}
          {isAvailable && (
            <p className="mt-1 text-sm text-emerald-800">
              This time slot is free for {roomName}. No booking has been made.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
