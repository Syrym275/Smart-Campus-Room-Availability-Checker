## Project
Smart Campus room availability checker; four fictional rooms (room catalog), fictional data.
## Constraints
Preserve AC1–AC6; no backend, login, database or booking creation. Keep the existing time form and its wording; add room selection and filter sections.
## Engineering rules
Prefer pure functions and minimal changes; use at most 2 justified patterns.
Do not mutate booking fixtures; keep responsive UI feedback.
## Commands
Run tests: npx vitest run
## Verification
Run existing tests and add focused regression tests.
Report changed files, rationale and test evidence.
## Practice 11 — optional "Explain availability" feature
Acceptance criteria AC1–AC5 apply to this feature.
The LLM (mock adapter) never decides availability; canBook/checkRoom in src/lib/availability.ts remains the only authority.
Commands: npx vitest run, npm run lint, npm run typecheck, npm run build.