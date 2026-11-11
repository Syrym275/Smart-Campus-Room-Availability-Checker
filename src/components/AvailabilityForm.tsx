import { CARD_CLASS } from '@/components/styles';
import {
  MAX_DURATION,
  MAX_MINUTE,
  MIN_MINUTE,
  formatClock,
  isMinuteInRange,
  type ParseState,
} from '@/lib/availability';
import { NOW_MINUTES } from '@/lib/fixtures';

const RANGE_TEXT = `${MIN_MINUTE}–${MAX_MINUTE}`;
const RANGE_HINT = `minutes after midnight (${RANGE_TEXT})`;

function fieldMessage(state: ParseState): string | null {
  if (state.kind === 'empty') return 'Enter a whole number of minutes.';
  if (state.kind === 'invalid') return 'Enter a whole number (no decimals or text).';
  return null;
}

type AvailabilityFormProps = {
  startRaw: string;
  endRaw: string;
  startParse: ParseState;
  endParse: ParseState;
  submitted: boolean;
  checkDisabled: boolean;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onCheck: () => void;
};

export function AvailabilityForm({
  startRaw,
  endRaw,
  startParse,
  endParse,
  submitted,
  checkDisabled,
  onStartChange,
  onEndChange,
  onCheck,
}: AvailabilityFormProps) {
  return (
    <section className={CARD_CLASS}>
      <h2 className="mb-3 text-sm font-semibold">Check a time slot</h2>

      <MinuteField
        label="Start"
        hint={RANGE_HINT}
        raw={startRaw}
        parse={startParse}
        error={submitted ? fieldMessage(startParse) : null}
        onChange={onStartChange}
      />

      <div className="h-3" />

      <MinuteField
        label="End"
        hint={RANGE_HINT}
        raw={endRaw}
        parse={endParse}
        error={submitted ? fieldMessage(endParse) : null}
        onChange={onEndChange}
      />

      <p className="mt-3 text-xs text-slate-500">
        Max duration: {MAX_DURATION} minutes. The start must be after the
        current time ({formatClock(NOW_MINUTES)}). Allowed range:{' '}
        {RANGE_TEXT} minutes.
      </p>

      <button
        type="button"
        onClick={onCheck}
        disabled={checkDisabled}
        className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-base font-semibold text-white transition-colors hover:bg-slate-800 active:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:bg-slate-300"
      >
        Check availability
      </button>
    </section>
  );
}

type MinuteFieldProps = {
  label: string;
  hint: string;
  raw: string;
  parse: ParseState;
  error: string | null;
  onChange: (value: string) => void;
};

function MinuteField({ label, hint, raw, parse, error, onChange }: MinuteFieldProps) {
  const clock =
    parse.kind === 'ok' && isMinuteInRange(parse.value)
      ? formatClock(parse.value)
      : null;

  const fieldId = label.toLowerCase();

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={fieldId} className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-xs text-slate-500">{hint}</span>
      </div>

      <div className="mt-1 flex items-stretch gap-2">
        <input
          id={fieldId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={raw}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${label}-error` : undefined}
          placeholder="e.g. 660"
          className={`h-12 w-full min-w-0 flex-1 rounded-xl border bg-white px-3 text-base tabular-nums outline-none transition-colors focus:ring-2 focus:ring-slate-900 focus:ring-offset-1 ${
            error
              ? 'border-red-400 focus:ring-red-500'
              : 'border-slate-300 focus:border-slate-900'
          }`}
        />
        <div
          className="flex h-12 min-w-[72px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-2 text-sm font-semibold tabular-nums text-slate-700"
          aria-hidden
        >
          {clock ?? '--:--'}
        </div>
      </div>

      {error && (
        <p
          id={`${label}-error`}
          role="alert"
          className="mt-1 text-xs font-medium text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
