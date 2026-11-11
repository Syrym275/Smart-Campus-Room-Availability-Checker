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