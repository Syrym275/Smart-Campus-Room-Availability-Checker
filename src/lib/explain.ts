import {
  EXPLAIN_TIMEOUT_MS,
  fallbackExplanation,
  reasonCodeFor,
  validateExplainRequest,
  validateExplanation,
  type ExplainOutcome,
  type ExplainRequest,
  type ReasonCode,
} from '@/lib/explainShared';
import { detectMockMode, mockExplain } from '@/lib/mockAi';

/**
 * The deterministic checker (canBook/checkRoom) always decides availability.
 * This function only produces a text explanation and falls back to a fixed
 * sentence whenever anything about the adapter call fails.
 */
export async function explainAvailability(
  raw: ExplainRequest,
  search: string = window.location.search,
): Promise<ExplainOutcome> {
  const request = validateExplainRequest(raw);
  if (!request) {
    return { ok: false, explanation: fallbackForInvalid(raw) };
  }

  const mode = detectMockMode(search);
  try {
    const response = await withTimeout(mockExplain(request, mode), EXPLAIN_TIMEOUT_MS);
    const explanation = validateExplanation(response?.explanation, request.isAvailable);
    if (!explanation) {
      return { ok: false, explanation: fallbackExplanation(request) };
    }
    return { ok: true, explanation };
  } catch {
    return { ok: false, explanation: fallbackExplanation(request) };
  }
}

function fallbackForInvalid(raw: ExplainRequest): string {
  if (raw.isAvailable === true) {
    return fallbackExplanation({ ...raw, reasonCode: 'AVAILABLE' });
  }
  return 'Status: unavailable. A detailed reason could not be shown for this request.';
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export function buildRequest(
  roomLabel: string,
  startMinute: number,
  endMinute: number,
  result:
    | { status: 'available' }
    | { status: 'unavailable'; reason: string; code: ReasonCode },
): ExplainRequest {
  const reasonCode = reasonCodeFor(result);
  return {
    roomLabel,
    startMinute,
    endMinute,
    isAvailable: result.status === 'available',
    reasonCode,
  };
}
