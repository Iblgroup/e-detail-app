// Remembers the duration (seconds) of the most recently completed call, so the
// next call's analytics can show how much longer/shorter it was than the last
// one. In-memory: resets on app restart (the first call after open has no
// "last" to compare against).

let lastDurationSeconds: number | null = null;

/** The previous completed call's duration, or null if there hasn't been one. */
export function getLastCallDuration(): number | null {
  return lastDurationSeconds;
}

/** Record the just-completed call's duration as the new "last". */
export function setLastCallDuration(seconds: number) {
  lastDurationSeconds = Math.max(0, Math.floor(seconds));
}
