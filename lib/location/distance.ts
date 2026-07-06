/** The rep is "at the clinic" when within this many metres of it. */
export const VICINITY_RADIUS_METERS = 50;

const EARTH_RADIUS_METERS = 6_371_000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Great-circle distance between two lat/long points, in metres. */
export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Parse a coordinate that may be a string (DB varchar) or number; null if invalid. */
export function parseCoord(value: unknown): number | null {
  if (value == null) return null;
  const n = typeof value === 'number' ? value : Number(String(value).trim());
  return Number.isFinite(n) && n !== 0 ? n : null;
}

export interface VicinityResult {
  distanceMeters: number;
  withinVicinity: boolean;
}

/**
 * Nearest distance from an arrival point to a doctor's clinic, checking both the
 * day and evening clinic locations. Returns null when the arrival point or all
 * clinic coordinates are missing/invalid.
 */
export function nearestClinicVicinity(
  arrival: { latitude?: number; longitude?: number },
  clinic: {
    dayLat?: unknown;
    dayLng?: unknown;
    eveLat?: unknown;
    eveLng?: unknown;
  },
): VicinityResult | null {
  const aLat = parseCoord(arrival.latitude);
  const aLng = parseCoord(arrival.longitude);
  if (aLat == null || aLng == null) return null;

  const candidates: number[] = [];
  const dayLat = parseCoord(clinic.dayLat);
  const dayLng = parseCoord(clinic.dayLng);
  if (dayLat != null && dayLng != null) {
    candidates.push(haversineMeters(aLat, aLng, dayLat, dayLng));
  }
  const eveLat = parseCoord(clinic.eveLat);
  const eveLng = parseCoord(clinic.eveLng);
  if (eveLat != null && eveLng != null) {
    candidates.push(haversineMeters(aLat, aLng, eveLat, eveLng));
  }
  if (candidates.length === 0) return null;

  const distanceMeters = Math.round(Math.min(...candidates));
  return { distanceMeters, withinVicinity: distanceMeters <= VICINITY_RADIUS_METERS };
}
