import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { CARD_CLASS } from '@/components/styles';
import {
  explainAvailability,
  buildRequest,
} from '@/lib/explain';
import type { CheckResult } from '@/lib/availability';

type ExplainSectionProps = {
  roomLabel: string;
  startMinute: number;
  endMinute: number;
  result: CheckResult;
};

const GENERATED_LABEL =
  'Generated explanation (mock AI). Not a booking confirmation; the status above is the confirmed result.';
const FALLBACK_LABEL = 'Standard explanation (no AI)';

export function ExplainSection({
  roomLabel,
  startMinute,
  endMinute,
  result,
}: ExplainSectionProps) {
  const [outcome, setOutcome] = useState<{ ok: boolean; explanation: string } | null>(null);
  const [pending, setPending] = useState(false);

  const explanation = buildRequest(roomLabel, startMinute, endMinute, result);

  async function handleExplain() {
    setPending(true);
    try {
      const next = await explainAvailability(explanation);
      setOutcome({ ok: next.ok, explanation: next.explanation });
    } finally {
      setPending(false);
    }
  }

  return (
    <section className={CARD_CLASS} aria-live="polite">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-slate-500" aria-hidden />
        <h2 className="text-sm font-semibold">Explain availability</h2>
      </div>
      <button
        type="button"
        onClick={handleExplain}
        disabled={pending}
        className="h-11 w-full rounded-xl bg-slate-900 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Preparing explanation…' : 'Explain availability'}
      </button>

      {outcome && (
        <div className="mt-3">
          {outcome.ok ? (
            <>
              <p className="text-xs uppercase tracking-wide text-slate-500">{GENERATED_LABEL}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-800">{outcome.explanation}</p>
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-wide text-slate-500">{FALLBACK_LABEL}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-800">{outcome.explanation}</p>
            </>
          )}
        </div>
      )}
    </section>
  );
}
