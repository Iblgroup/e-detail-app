/**
 * Shared key the app sends (`x-app-key`) to pull the on-open offline bundles
 * (login mirror + all reps' planned lists) BEFORE any user has signed in.
 * Falls back to a baked-in default so it works without a Metro cache-clear
 * (EXPO_PUBLIC_* vars only load on a full restart). Must match the backend's
 * OFFLINE_SYNC_KEY.
 */
export const OFFLINE_SYNC_KEY =
  process.env.EXPO_PUBLIC_OFFLINE_SYNC_KEY || 'edet_offline_9f2c7a1b4e8d6f30';
