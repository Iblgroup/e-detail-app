import * as Location from 'expo-location';

export interface ArrivalCapture {
  latitude?: number;
  longitude?: number;
  /** Human-readable place, filled best-effort (needs network); may be undefined. */
  arrivedLocation?: string;
  /** ISO timestamp of when arrival was marked. */
  arrivedTime: string;
}

/**
 * Capture the rep's current position when they mark "Arrived".
 *
 * GPS works fully OFFLINE — coordinates come from the device's location
 * services, not the internet. Reverse-geocoding coordinates into a place name
 * DOES need network, so it's best-effort and skipped silently when offline.
 *
 * Never throws: if permission is denied or the fix fails, it returns just the
 * timestamp so the call flow is never blocked.
 */
export async function captureArrival(): Promise<ArrivalCapture> {
  const arrivedTime = new Date().toISOString();

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { arrivedTime };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const { latitude, longitude } = position.coords;

    let arrivedLocation: string | undefined;
    // Best-effort address; only works online, so failures are ignored.
    try {
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (place) {
        arrivedLocation =
          [place.name, place.street, place.city, place.region]
            .filter(Boolean)
            .join(', ') || undefined;
      }
    } catch {
      // offline / geocoder unavailable — keep just the coordinates
    }

    return { latitude, longitude, arrivedLocation, arrivedTime };
  } catch {
    // permission error / no fix — still return the timestamp
    return { arrivedTime };
  }
}
