# Room Availability Checker

A small prototype for a campus "Smart Campus" setting. Visitors pick the number of attendees and any equipment they need, choose a room from the matching list, and enter a start and end time to see whether that slot is free.

The tool only checks availability. It does not create, save or confirm bookings. All room data is fictional and fixed in the code.

## Features

- Filter rooms by minimum capacity and required equipment (every selected item must be present).
- Blocked rooms stay in the list with a "Blocked" badge and are never reported as available.
- Check a time slot in minutes after midnight (0 to 1440), with a maximum duration of 120 minutes.
- Each room shows its capacity, equipment, current time and existing bookings for the day.
- Changing the room or any input clears the previous result.

## Setup

```bash
npm install
```

## Run

```bash
npm run dev
```

Then open the local address that Vite prints in the terminal.

## Test

```bash
npx vitest run
```

The suite covers the availability rules, the filtering rules and the main user flows (empty filter result and switching rooms).

## Project structure

```
src/
  App.tsx                   Page state and layout; wires the components together
  main.tsx                  Application entry point
  index.css                 Global styles (Tailwind)
  App.test.tsx              Interface tests for the main user flows
  components/
    FilterPanel.tsx         Attendees input and equipment checkboxes
    RoomSelector.tsx        Room dropdown, or the "no rooms match" message
    RoomSummary.tsx         Selected room details, Blocked badge and current time
    BookingList.tsx         Existing bookings for the selected room
    AvailabilityForm.tsx    Start and end inputs and the Check availability button
    ResultBanner.tsx        Available / Unavailable result
    styles.ts               Shared class names for cards and captions
  lib/
    fixtures.ts             Room data, equipment list and the fixed current time
    availability.ts         Time rules: range, duration, overlaps and clock formatting
    filtering.ts            Attendee and equipment filtering and room selection
    availability.test.ts    Tests for the availability rules
    filtering.test.ts       Tests for the filtering rules
```

## Fictional room data

The current time is fixed at 09:00 for every check.

| Room | Name | Capacity | Equipment | Blocked | Bookings today |
| --- | --- | --- | --- | --- | --- |
| A-101 | Seminar Room A-101 | 30 | Projector, Whiteboard | No | 10:00 to 11:00 |
| B-202 | Study Room B-202 | 8 | Whiteboard | No | 12:00 to 13:00 |
| C-303 | Lecture Hall C-303 | 120 | Projector, Microphone, Whiteboard | No | 10:00 to 11:00, 14:00 to 15:00 |
| D-404 | Computer Lab D-404 | 40 | Computers, Projector | Yes | None |

Equipment options offered in the filter: Projector, Whiteboard, Microphone, Computers.
