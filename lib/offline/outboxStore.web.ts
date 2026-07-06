import type { OutboxRow } from './outboxTypes';

/**
 * Web outbox storage backed by localStorage (expo-sqlite's wasm worker can't be
 * bundled by Metro for web). Same API as the native `outboxStore.ts`. Web is a
 * dev convenience only — the real app runs natively — so a simple JSON-array
 * store is sufficient and keeps the queue durable across reloads.
 */

const STORAGE_KEY = 'e_detail_call_outbox';

function hasStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

function readAll(): OutboxRow[] {
  if (!hasStorage()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OutboxRow[]) : [];
  } catch {
    return [];
  }
}

function writeAll(rows: OutboxRow[]): void {
  if (!hasStorage()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    // storage full / unavailable — best effort
  }
}

export async function openOutbox(): Promise<void> {
  // Nothing to open; ensure the key exists.
  if (hasStorage() && localStorage.getItem(STORAGE_KEY) == null) {
    writeAll([]);
  }
}

export async function dbInsert(
  clientId: string,
  payload: string,
  createdAt: string,
): Promise<void> {
  const rows = readAll();
  rows.push({
    client_id: clientId,
    payload,
    status: 'pending',
    attempts: 0,
    last_error: null,
    created_at: createdAt,
  });
  writeAll(rows);
}

export async function dbCount(): Promise<number> {
  return readAll().length;
}

export async function dbGetBatch(limit: number): Promise<OutboxRow[]> {
  return readAll()
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .slice(0, limit);
}

export async function dbDelete(clientId: string): Promise<void> {
  writeAll(readAll().filter((row) => row.client_id !== clientId));
}

export async function dbUpdateFailed(
  clientId: string,
  attempts: number,
  lastError: string,
): Promise<void> {
  const rows = readAll().map((row) =>
    row.client_id === clientId
      ? { ...row, attempts, last_error: lastError, status: 'failed' as const }
      : row,
  );
  writeAll(rows);
}
