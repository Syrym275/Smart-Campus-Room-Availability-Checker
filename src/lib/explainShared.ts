import { formatClock, REASON_CODES, type ReasonCode } from '@/lib/availability';

// The reason codes are owned by the rules module (availability.ts); re-exported here for the explanation layer.
export { REASON_CODES };
export type { ReasonCode };

export type ExplainRequest = {
  roomLabel: string;
  startMinute: number;
  endMinute: number;
  isAvailable: boolean;
  reasonCode: ReasonCode;
};

export type ExplainSuccess = { ok: true; explanation: string };
export type ExplainFailure = { ok: false; explanation: string };
export type ExplainOutcome = ExplainSuccess | ExplainFailure;

export const EXPLAIN_TIMEOUT_MS = 2000;

export function reasonCodeFor(
  result:
    | { status: 'available' }
    | { status: 'unavailable'; reason: string; code: ReasonCode },
): ReasonCode {
  if (result.status === 'available') return 'AVAILABLE';
  return result.code;
}

export function fallbackExplanation(req: ExplainRequest): string {
  const slot = `${formatClock(req.startMinute)}-${formatClock(req.endMinute)}`;
  switch (req.reasonCode) {
    case 'AVAILABLE':
      return `Status: available. ${req.roomLabel} is free for ${slot}.`;
    case 'BLOCKED':
      return `Status: unavailable. ${req.roomLabel} is blocked, so ${slot} cannot be booked.`;
    case 'OUT_OF_RANGE':
      return `Status: unavailable. For ${req.roomLabel}, times must be between 0 and 1440 minutes after midnight.`;
    case 'INVALID_ORDER':
      return `Status: unavailable. For ${req.roomLabel}, the end time must be after the start time.`;
    case 'PAST_TIME':
      return `Status: unavailable. For ${req.roomLabel}, the start time must be after the current time.`;
    case 'TOO_LONG':
      return `Status: unavailable. Bookings for ${req.roomLabel} are limited to 120 minutes.`;
    case 'OVERLAP':
      return `Status: unavailable. The requested slot in ${req.roomLabel} overlaps an existing booking.`;
    default:
      return `Status: unavailable. ${req.roomLabel} cannot be booked at this time.`;
  }
}

export function validateExplainRequest(req: unknown): ExplainRequest | null {
  if (typeof req !== 'object' || req === null) return null;
  const r = req as Record<string, unknown>;
  if (typeof r.roomLabel !== 'string') return null;
  const roomLabel = r.roomLabel.trim();
  if (roomLabel.length < 1 || roomLabel.length > 60) return null;
  if (
    typeof r.startMinute !== 'number' ||
    !Number.isInteger(r.startMinute) ||
    typeof r.endMinute !== 'number' ||
    !Number.isInteger(r.endMinute)
  ) {
    return null;
  }
  if (typeof r.isAvailable !== 'boolean') return null;
  if (typeof r.reasonCode !== 'string' || !REASON_CODES.includes(r.reasonCode as ReasonCode)) {
    return null;
  }
  const reasonCode = r.reasonCode as ReasonCode;
  const isAvailable = r.isAvailable;
  if (isAvailable !== (reasonCode === 'AVAILABLE')) return null;
  return { roomLabel, startMinute: r.startMinute, endMinute: r.endMinute, isAvailable, reasonCode };
}

const MAX_EXPLANATION_LENGTH = 200;
const MAX_SENTENCES = 2;

export function validateExplanation(text: unknown, isAvailable: boolean): string | null {
  if (typeof text !== 'string') return null;
  const trimmed = text.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_EXPLANATION_LENGTH) return null;
  const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length > MAX_SENTENCES) return null;
  const saysUnavailable = /\bunavailable\b|\bnot available\b/i.test(trimmed);
  if (isAvailable && saysUnavailable) return null;
  if (!isAvailable && /\bavailable\b/i.test(trimmed) && !/\bunavailable\b/i.test(trimmed)) {
    return null;
  }
  return trimmed;
}
