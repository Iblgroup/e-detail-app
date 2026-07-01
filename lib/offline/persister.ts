import type { Persister, PersistedClient } from '@tanstack/react-query-persist-client';
import { readJson, writeJson, removeRaw } from './fileStore';

/**
 * Persists the React Query cache to the device so the doctor lists, forcing
 * rows and other JSON survive app restarts and remain available offline.
 * Writes are throttled to avoid hammering the file system.
 */
const CLIENT_KEY = 'react-query-cache';
const WRITE_THROTTLE_MS = 1500;

// Bump when the cached data shape changes, to invalidate stale caches.
// Shared by the React provider and the headless background sync.
export const CACHE_BUSTER = 'v1';

export function createFilePersister(): Persister {
  let pending: PersistedClient | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    timer = null;
    if (pending) {
      const toWrite = pending;
      pending = null;
      void writeJson(CLIENT_KEY, toWrite);
    }
  };

  return {
    persistClient(client) {
      pending = client;
      if (!timer) {
        timer = setTimeout(flush, WRITE_THROTTLE_MS);
      }
    },
    async restoreClient() {
      return (await readJson<PersistedClient>(CLIENT_KEY)) ?? undefined;
    },
    async removeClient() {
      pending = null;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      await removeRaw(CLIENT_KEY);
    },
  };
}

// Single shared instance used by both the React provider and the headless
// background sync (so they read/write the same cache file).
export const filePersister = createFilePersister();
