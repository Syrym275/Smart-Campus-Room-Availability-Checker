export default {
  // fictional booking 10:00-11:00 (minutes after midnight); shown in the table
  bookings: [{ start: 600, end: 660 }],

  check: (startText, durationText, blocked) => {
    const NOW = 540; // fixed "current time" 09:00
    const MAX_DURATION = 120;
    const BOOKINGS = [{ start: 600, end: 660 }]; // same data as `bookings` above
    const toClock = (m) => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
    const bad = (code, message) => ({ available: false, code: code, message: message });

    const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(String(startText).trim());
    const dText = String(durationText).trim();
    if (!m || !/^\d+$/.test(dText)) {
      return bad("INVALID_INPUT", "Invalid: enter the start as HH:MM and the duration as a whole number of minutes.");
    }
    const start = Number(m[1]) * 60 + Number(m[2]);
    const duration = Number(dText);
    const end = start + duration;
    if (blocked) return bad("BLOCKED", "Unavailable: the room is blocked.");
    if (duration < 1 || duration > MAX_DURATION) {
      return bad("INVALID_DURATION", "Invalid: duration must be between 1 and " + MAX_DURATION + " minutes.");
    }
    if (end > 1440) return bad("INVALID_DURATION", "Invalid: the booking must end by 24:00.");
    if (start <= NOW) {
      return bad("PAST_START", "Invalid: the start time must be after the current time (" + toClock(NOW) + ").");
    }
    for (let i = 0; i < BOOKINGS.length; i++) {
      const b = BOOKINGS[i];
      if (b.start < end && start < b.end) {
        return bad("OVERLAP", "Unavailable: it overlaps the existing booking " + toClock(b.start) + "-" + toClock(b.end) + ".");
      }
    }
    return { available: true, code: "AVAILABLE", message: "Available: the room is free from " + toClock(start) + " to " + toClock(end) + "." };
  },
};
