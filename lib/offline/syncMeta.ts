import { readJson, writeJson, removeRaw } from './fileStore';

/**
 * Tracks which workday the cached data belongs to. The app compares
 * `lastSyncedFor` against today's workday to decide whether it already has
 * today's data (set during the overnight/background sync) or must catch up.
 *
 * NOTE: today this is computed on-device. When the backend starts returning a
 * "workday date" in the daily payload, stamp that value instead to avoid any
 * before/after-midnight off-by-one.
 */
const META_KEY = 'sync-meta';

export interface SyncMeta {
  lastSyncedFor: string | null; // YYYY-MM-DD workday the data is for
  lastSyncedAt: string | null; // ISO timestamp of the last successful sync
}

const EMPTY: SyncMeta = { lastSyncedFor: null, lastSyncedAt: null };

/** Local workday as YYYY-MM-DD. */
export function todayWorkday(date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export async function getSyncMeta(): Promise<SyncMeta> {
  return (await readJson<SyncMeta>(META_KEY)) ?? EMPTY;
}

export async function setSyncMeta(meta: SyncMeta): Promise<void> {
  await writeJson(META_KEY, meta);
}

export async function clearSyncMeta(): Promise<void> {
  await removeRaw(META_KEY);
}
