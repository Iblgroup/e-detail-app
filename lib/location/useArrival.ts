import { useCallback, useRef, useState } from 'react';

import { captureArrival, type ArrivalCapture } from './captureArrival';

/**
 * Shared "Arrived" state for the call panels. Toggling Arrived ON captures the
 * rep's GPS position (offline-capable); toggling OFF / cancelling clears it.
 * `arrival` is what should be threaded into the call as arrived_time/lat/long.
 */
export function useArrival() {
  const [arrived, setArrived] = useState(false);
  const [arrival, setArrival] = useState<ArrivalCapture | null>(null);
  const arrivedRef = useRef(false);

  const markArrived = useCallback(async () => {
    arrivedRef.current = true;
    setArrived(true);
    // Provisional timestamp so arrived_time exists even before the GPS fix.
    setArrival({ arrivedTime: new Date().toISOString() });
    const captured = await captureArrival();
    // Ignore the fix if the user cancelled while it was resolving.
    if (arrivedRef.current) setArrival(captured);
  }, []);

  const reset = useCallback(() => {
    arrivedRef.current = false;
    setArrived(false);
    setArrival(null);
  }, []);

  const toggleArrived = useCallback(() => {
    if (arrivedRef.current) reset();
    else void markArrived();
  }, [markArrived, reset]);

  return { arrived, arrival, toggleArrived, reset };
}
