import { describe, it, expect } from 'vitest';
import {
  buildRequest,
  explainAvailability,
} from '@/lib/explain';
import {
  fallbackExplanation,
  reasonCodeFor,
  validateExplainRequest,
  validateExplanation,
} from '@/lib/explainShared';
import type { CheckResult } from '@/lib/availability';

const available: CheckResult = { status: 'available' };
const overlap: CheckResult = {
  status: 'unavailable',
  reason: 'It overlaps the existing booking 600-660 (10:00-11:00).',
  code: 'OVERLAP',
};
const blocked: CheckResult = { status: 'unavailable', reason: 'The room is blocked.', code: 'BLOCKED' };
const past: CheckResult = {
  status: 'unavailable',
  reason: 'The start time must be after the current time (09:00).',
  code: 'PAST_TIME',
};

describe('reasonCodeFor', () => {
  it('derives AVAILABLE from an available result', () => {
    expect(reasonCodeFor(available)).toBe('AVAILABLE');
  });
  it('derives OVERLAP from an overlap reason', () => {
    expect(reasonCodeFor(overlap)).toBe('OVERLAP');
  });
  it('derives BLOCKED and PAST_TIME from matching reasons', () => {
    expect(reasonCodeFor(blocked)).toBe('BLOCKED');
    expect(reasonCodeFor(past)).toBe('PAST_TIME');
  });
});

describe('validateExplainRequest', () => {
  const valid = {
    roomLabel: 'Seminar Room A-101',
    startMinute: 570,
    endMinute: 600,
    isAvailable: true,
    reasonCode: 'AVAILABLE' as const,
  };

  it('accepts a valid request', () => {
    expect(validateExplainRequest(valid)).not.toBeNull();
  });
  it('rejects an empty room label', () => {
    expect(validateExplainRequest({ ...valid, roomLabel: '   ' })).toBeNull();
  });
  it('rejects an over-long room label', () => {
    expect(validateExplainRequest({ ...valid, roomLabel: 'r'.repeat(61) })).toBeNull();
  });
  it('rejects non-integer times', () => {
    expect(validateExplainRequest({ ...valid, startMinute: 10.5 })).toBeNull();
  });
  it('rejects an unknown reason code', () => {
    expect(
      validateExplainRequest({ ...valid, reasonCode: 'SOMETHING_ELSE' as never }),
    ).toBeNull();
  });
  it('rejects disagreement between isAvailable and reasonCode', () => {
    expect(validateExplainRequest({ ...valid, isAvailable: false })).toBeNull();
  });
});

describe('validateExplanation', () => {
  it('accepts plain text within the limits', () => {
    expect(validateExplanation('The room is free at this time.', true)).toBe(
      'The room is free at this time.',
    );
  });
  it('rejects over-long output', () => {
    expect(validateExplanation('x'.repeat(201), true)).toBeNull();
  });
  it('rejects more than two sentences', () => {
    expect(validateExplanation('One. Two. Three.', true)).toBeNull();
  });
  it('rejects output that contradicts isAvailable', () => {
    expect(validateExplanation('The room is available at this time.', false)).toBeNull();
    expect(validateExplanation('The room is unavailable at this time.', true)).toBeNull();
  });
});

describe('explainAvailability', () => {
  const req = (result: CheckResult) =>
    buildRequest('Seminar Room A-101', 570, 600, result);

  it('returns a generated explanation in ok mode', async () => {
    const out = await explainAvailability(req(available), '?mock=ok');
    expect(out.ok).toBe(true);
    if (out.ok) expect(out.explanation).toContain('Seminar Room A-101');
  });

  it('returns the fallback for an overlap in ok mode', async () => {
    const out = await explainAvailability(req(overlap), '?mock=ok');
    expect(out.ok).toBe(true);
    if (out.ok) expect(out.explanation).toContain('overlaps');
  });

  it('returns the fallback for a blocked room', async () => {
    const out = await explainAvailability(req(blocked), '?mock=ok');
    expect(out.ok).toBe(true);
    if (out.ok) expect(out.explanation).toContain('blocked');
  });

  it('rejects an empty room label without calling the adapter', async () => {
    const raw = { ...req(available), roomLabel: '' };
    const out = await explainAvailability(raw, '?mock=ok');
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.explanation).toContain('Status:');
  });

  it('rejects an over-long room label without calling the adapter', async () => {
    const raw = { ...req(available), roomLabel: 'r'.repeat(61) };
    const out = await explainAvailability(raw, '?mock=error');
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.explanation).toContain('Status:');
  });

  it('falls back on adapter error mode', async () => {
    const out = await explainAvailability(req(available), '?mock=error');
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.explanation).toBe(fallbackExplanation(req(available)));
  });

  it('falls back on timeout mode', async () => {
    const out = await explainAvailability(req(available), '?mock=timeout');
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.explanation).toBe(fallbackExplanation(req(available)));
  });

  it('falls back on malformed adapter output', async () => {
    const out = await explainAvailability(req(available), '?mock=malformed');
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.explanation).toBe(fallbackExplanation(req(available)));
  });

  it('falls back when the adapter output contradicts isAvailable', async () => {
    const out = await explainAvailability(req(available), '?mock=contradiction');
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.explanation).toBe(fallbackExplanation(req(available)));
  });

  it('ignores an unknown mock mode and uses ok', async () => {
    const out = await explainAvailability(req(available), '?mock=nonsense');
    expect(out.ok).toBe(true);
  });

  it('never reports availability in the fallback for malformed unavailable input', async () => {
    const raw = {
      roomLabel: 'Seminar Room A-101',
      startMinute: 570,
      endMinute: 600,
      isAvailable: false,
      reasonCode: 'AVAILABLE' as const,
    };
    const out = await explainAvailability(raw, '?mock=ok');
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.explanation.startsWith('Status: unavailable.')).toBe(true);
  });

  it('returns a generic non-empty sentence for an unknown reason code', () => {
    const text = fallbackExplanation({
      roomLabel: 'Seminar Room A-101',
      startMinute: 570,
      endMinute: 600,
      isAvailable: false,
      reasonCode: 'JUNK' as never,
    });
    expect(typeof text).toBe('string');
    expect(text.length).toBeGreaterThan(0);
  });
});
