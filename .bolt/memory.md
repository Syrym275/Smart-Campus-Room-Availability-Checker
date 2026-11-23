# Project memory

## Product intent & audience

- App with filtering UI for activities/venues/events; users filter by attendee count and availability.
- Production-quality, not a demo/prototype.

## Brand personality & voice

- Polish and correctness matter; regression tests are used to lock in confirmed bugs before fixing.

## Visual design & UX direction

- Filter panel includes a numeric "Attendees" field (labeled input, `getByLabelText('Attendees')`).
- Controlled inputs route every change through parsing helpers in `src/lib/filtering.ts`.

## Decisions, constraints & rationale

- Stack: Vite + React (JSX), Tailwind CSS, Lucide React icons, `@/` path alias → `src/`.
- Tests: Vitest (v2.1.9) + Testing Library (`fireEvent`, `screen`); `npx vitest run` is the canonical command.
- Test files: `src/App.test.tsx`, `src/lib/filtering.test.ts`, `src/lib/availability.test.ts`.
- Known confirmed bug: `parseAttendees` in `src/lib/filtering.ts` resets cleared/empty Attendees input to `1` immediately, making retyping unreliable.
- Regression test added in `src/App.test.tsx` asserting cleared field stays `''`; currently failing as expected (1 failed, 34 passed). No app code changed yet; fix pending user go-ahead.
- Constraint: do not weaken or delete existing tests; add only focused regression tests for confirmed risks.

## Open questions & assumptions

- Fix for `parseAttendees` (allow empty string to persist until blur or valid entry) is pending user approval.
- Assumed desired behavior: empty Attendees field should remain empty so users can type a new number; exact UX (e.g. commit on blur vs. on change) not yet specified.