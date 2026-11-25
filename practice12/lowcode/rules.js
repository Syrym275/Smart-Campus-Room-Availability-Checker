// Smart Campus Room Availability Checker - low-code rule script (same contract as the code-based version)
// Paste into an Appsmith JSObject (see steps). Pure function: does not change `bookings`.
export default {
  NOW: 540,                                   // fixed "current time" 09:00 (minutes after midnight)
  MAX_DURATION: 120,
  bookings: [{ start: 600, end: 660 }],       // fictional booking 10:00-11:00

  toClock(m) {
    return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
  },

  // startText: "HH:MM", durationText: text or number, blocked: true/false
  check(startText, durationText, blocked) {
    const bad = (code, message) => ({ available: false, code, message });
    const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(String(startText).trim());
    const dText = String(durationText).trim();
    if (!m || !/^\d+$/.test(dText)) {
      return bad("INVALID_INPUT", "Invalid: enter the start as HH:MM and the duration as a whole number of minutes.");
    }
    const start = Number(m[1]) * 60 + Number(m[2]);
    const duration = Number(dText);
    const end = start + duration;
    if (blocked) return bad("BLOCKED", "Unavailable: the room is blocked.");
    if (duration < 1 || duration > this.MAX_DURATION) {
      return bad("INVALID_DURATION", "Invalid: duration must be between 1 and " + this.MAX_DURATION + " minutes.");
    }
    if (end > 1440) return bad("INVALID_DURATION", "Invalid: the booking must end by 24:00.");
    if (start <= this.NOW) {
      return bad("PAST_START", "Invalid: the start time must be after the current time (" + this.toClock(this.NOW) + ").");
    }
    for (const b of this.bookings) {
      if (b.start < end && start < b.end) {
        return bad("OVERLAP", "Unavailable: it overlaps the existing booking " + this.toClock(b.start) + "-" + this.toClock(b.end) + ".");
      }
    }
    return { available: true, code: "AVAILABLE", message: "Available: the room is free from " + this.toClock(start) + " to " + this.toClock(end) + "." };
  },
};
