# AGENTS.md

## Purpose
Smart Campus Room Availability Checker: a small client-side React + TypeScript prototype. A visitor filters four fictional rooms, enters a start and end time (minutes after midnight) and sees whether the slot is free. An optional "Explain availability" button shows a short text from a MOCK adapter. The app never creates bookings. All data is fictional.

## Architecture
- src/lib/availability.ts: pure rules (canBook, checkRoom, parseMinutes). The only authority on availability.
- src/lib/filtering.ts: room filtering by capacity and equipment.
- src/lib/fixtures.ts: fictional rooms, bookings and the fixed "current time" (NOW_MINUTES = 540, i.e. 09:00).
- src/lib/explain.ts, explainShared.ts, mockAi.ts: explanation layer (input and output validation, 2 s timeout, fixed fallback, mock adapter).
- src/components/*: presentational components. src/App.tsx holds the page state.
- Flow: UI -> checkRoom -> result banner; result -> reason code -> validated request -> adapter -> validated text.

## Setup and safe commands (allowed without asking)
- npm install
- npm run dev
- npx vitest run
- npm run lint
- npm run typecheck
- npm run build

## Acceptance criteria (must stay true after every change)
- AC1: Availability rules are unchanged: a blocked room is never available; the end must be after the start; the start must be after the current time; the duration is at most 120 minutes; overlapping an existing booking is unavailable.
- AC2: Room filtering by capacity and equipment is unchanged, including the Attendees field staying empty while the user types.
- AC3: canBook/checkRoom remain the only authority. The optional explanation never changes the Available/Unavailable status, is clearly labeled, and falls back safely on any failure.
- AC4: No secrets, real personal data, login, database, booking creation or network calls.
- AC5: npx vitest run, npm run lint, npm run typecheck and npm run build all pass, and the number of tests never drops below the baseline.

## Coding conventions
- TypeScript strict mode. Pure functions in src/lib with no UI code. Do not mutate fixtures.
- Small, focused changes. Keep existing label wording. Use at most one design pattern, and only for a concrete maintainability problem that is named in the report.

## Test expectations
- Run all four checks before saying a task is done, and show the exact output and pass/fail totals.
- Write a regression test for every bug fixed, and show it failing first when asked.
- Never delete, skip or weaken a test. Say which checks were NOT run.

## Forbidden actions
- No secrets, API keys, tokens or real personal data in code, tests, logs or docs.
- No production deployment, publishing or pushing to a remote without human approval.
- No destructive commands (rm -rf, git reset --hard, force-push, deleting files or branches outside the task).
- No adding, removing or upgrading dependencies (package.json, package-lock.json) without approval.
- No login, backend, database, booking creation or network calls.
- Do not edit a test to make it pass. Do not touch files outside the task.

## Review gates
1. Propose first: show the diff and wait for "approved" before changing any file.
2. After applying: run the four checks and report the changed files and the results.
3. A human reviews the diff before any merge. The agent never merges or deploys.
4. Separate observed facts (command output, file and line) from assumptions, and label unverified claims.
