import type { ReasonCode } from '@/lib/explainShared';

export type MockMode = 'ok' | 'error' | 'timeout' | 'malformed' | 'contradiction';

function toClock(minutes: number): string {
  const m = ((Math.trunc(minutes) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export const MOCK_MODES: readonly MockMode[] = [
  'ok',
  'error',
  'timeout',
  'malformed',
  'contradiction',
];

export type MockExplainRequest = {
  roomLabel: string;
  startMinute: number;
  endMinute: number;
  reasonCode: ReasonCode;
};

export type MockExplainResponse = { explanation: string };

/**
 * MOCK AI ADAPTER — demo only. This is not a real model. It builds text
 * only from the structured request and never decides availability.
 */
export function detectMockMode(search: string): MockMode {
  const value = new URLSearchParams(search).get('mock');
  return MOCK_MODES.find((m) => m === value) ?? 'ok';
}

function sentenceFor(req: MockExplainRequest): string {
  const { roomLabel, startMinute, endMinute, reasonCode } = req;
  switch (reasonCode) {
    case 'AVAILABLE':
      return `${roomLabel} is free from ${toClock(startMinute)} to ${toClock(endMinute)} and can be reserved.`;
    case 'BLOCKED':
      return `${roomLabel} is currently blocked, so no time slot can be booked.`;
    case 'OUT_OF_RANGE':
      return `${roomLabel}: times must be between 0 and 1440 minutes after midnight.`;
    case 'INVALID_ORDER':
      return `${roomLabel}: the end time must be after the start time.`;
    case 'PAST_TIME':
      return `${roomLabel}: the start time must be after the current time.`;
    case 'TOO_LONG':
      return `${roomLabel}: bookings are limited to 120 minutes.`;
    case 'OVERLAP':
      return `${roomLabel}: the requested slot overlaps an existing booking.`;
    default:
      return `${roomLabel}: status cannot be explained.`;
  }
}

function contradictionFor(req: MockExplainRequest): string {
  if (req.reasonCode === 'AVAILABLE') {
    return `${req.roomLabel} is not available at this time.`;
  }
  return `${req.roomLabel} is available at this time.`;
}

export function mockExplain(
  req: MockExplainRequest,
  mode: MockMode,
): Promise<MockExplainResponse> {
  switch (mode) {
    case 'ok':
      return Promise.resolve({ explanation: sentenceFor(req) });
    case 'error':
      return Promise.reject(new Error('mock adapter failure'));
    case 'timeout':
      return new Promise(() => {}); // never settles; caller enforces its own timeout
    case 'malformed':
      return Promise.resolve({ text: 42 } as unknown as MockExplainResponse);
    case 'contradiction':
      return Promise.resolve({ explanation: contradictionFor(req) });
  }
}
