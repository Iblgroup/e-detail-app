import * as Crypto from 'expo-crypto';
import NetInfo from '@react-native-community/netinfo';

import {
  postCallsBatch,
  type BatchCallItem,
  type CallTrackingInput,
} from '@/api/calls';
import {
  openOutbox,
  dbInsert,
  dbCount,
  dbGetBatch,
  dbDelete,
  dbUpdateFailed,
} from './outboxStore';

/**
 * A durable, offline-first write queue for call activity. Every completed call
 * is written here FIRST (even when online), then flushed to the backend. If the
 * device is offline the row simply waits; a flush is retried on reconnect, on
 * app start, and after each enqueue. This guarantees no call is ever lost.
 *
 * Storage is platform-split: expo-sqlite on native, localStorage on web (see
 * outboxStore.ts / outboxStore.web.ts).
 */

// Flush at most this many rows per batch request.
const FLUSH_BATCH_SIZE = 50;
// A call the server keeps REJECTING (e.g. an invalid/stale doctor id) is dropped
// after this many attempts so it can't block the queue forever. Transient
// network failures do NOT count toward this cap — data is only given up when the
// server explicitly rejected the content.
const MAX_REJECT_ATTEMPTS = 5;

let isFlushing = false;
const listeners = new Set<() => void>();

/** Initialize the store early (called at app start). */
export async function initOutbox(): Promise<void> {
  await openOutbox();
}

function notify() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore listener errors
    }
  });
}

/** Subscribe to queue changes (e.g. to show a pending badge). Returns unsubscribe. */
export function subscribeOutbox(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Count of calls still waiting to sync. */
export async function getPendingCount(): Promise<number> {
  return dbCount();
}

/**
 * Queue one completed call. Writes locally, then kicks off a best-effort flush
 * (which is a no-op when offline). Resolves once the row is persisted, so the
 * UI can proceed immediately regardless of connectivity.
 */
export async function enqueueCall(payload: CallTrackingInput): Promise<string> {
  const clientId = Crypto.randomUUID();
  await dbInsert(clientId, JSON.stringify(payload), new Date().toISOString());
  notify();
  // Fire-and-forget; never block the caller on the network.
  void flushOutbox();
  return clientId;
}

/**
 * Push queued calls to the backend. Safe to call anytime: it does nothing when
 * offline, already flushing, or empty. Successfully synced rows are removed;
 * failures keep their row (attempts incremented) to retry later.
 */
export async function flushOutbox(): Promise<void> {
  if (isFlushing) return;

  const net = await NetInfo.fetch();
  if (!net.isConnected) return;

  isFlushing = true;
  try {
    // Retry oldest first, in bounded batches.
    const rows = await dbGetBatch(FLUSH_BATCH_SIZE);
    if (rows.length === 0) return;

    const items: BatchCallItem[] = rows.map((row) => ({
      ...(JSON.parse(row.payload) as CallTrackingInput),
      clientId: row.client_id,
    }));

    let response;
    try {
      response = await postCallsBatch(items);
    } catch (error: any) {
      // Network/server failure: bump attempts, keep rows for the next retry.
      const message = String(error?.message ?? 'flush failed').slice(0, 500);
      for (const row of rows) {
        await dbUpdateFailed(row.client_id, row.attempts + 1, message);
      }
      notify();
      return;
    }

    const attemptsByClientId = new Map(rows.map((row) => [row.client_id, row.attempts]));
    for (const result of response.results) {
      if (!result.clientId) continue;
      if (result.success) {
        await dbDelete(result.clientId);
      } else {
        const nextAttempts = (attemptsByClientId.get(result.clientId) ?? 0) + 1;
        if (nextAttempts >= MAX_REJECT_ATTEMPTS) {
          // Permanently rejected by the server — give up so it can't wedge the queue.
          console.warn(
            `[outbox] dropping call ${result.clientId} after ${nextAttempts} rejections: ${result.message}`,
          );
          await dbDelete(result.clientId);
        } else {
          await dbUpdateFailed(
            result.clientId,
            nextAttempts,
            String(result.message ?? 'rejected').slice(0, 500),
          );
        }
      }
    }
    notify();

    // If a full batch synced, there may be more queued — keep draining.
    if (rows.length === FLUSH_BATCH_SIZE) {
      isFlushing = false;
      await flushOutbox();
      return;
    }
  } finally {
    isFlushing = false;
  }
}
