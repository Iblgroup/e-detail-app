import * as SQLite from 'expo-sqlite';

import type { OutboxRow } from './outboxTypes';

/**
 * Native (iOS/Android) outbox storage backed by expo-sqlite. Metro resolves the
 * `.web.ts` sibling on web (where expo-sqlite's wasm worker can't be bundled),
 * so this module is never imported in the web bundle.
 */

const DB_NAME = 'e-detail-outbox.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS call_outbox (
          client_id  TEXT PRIMARY KEY NOT NULL,
          payload    TEXT NOT NULL,
          status     TEXT NOT NULL DEFAULT 'pending',
          attempts   INTEGER NOT NULL DEFAULT 0,
          last_error TEXT,
          created_at TEXT NOT NULL
        );
      `);
      return db;
    })();
  }
  return dbPromise;
}

export async function openOutbox(): Promise<void> {
  await getDb();
}

export async function dbInsert(
  clientId: string,
  payload: string,
  createdAt: string,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO call_outbox (client_id, payload, status, attempts, created_at)
     VALUES (?, ?, 'pending', 0, ?)`,
    clientId,
    payload,
    createdAt,
  );
}

export async function dbCount(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM call_outbox`,
  );
  return row?.n ?? 0;
}

export async function dbGetBatch(limit: number): Promise<OutboxRow[]> {
  const db = await getDb();
  return db.getAllAsync<OutboxRow>(
    `SELECT client_id, payload, status, attempts, last_error, created_at
     FROM call_outbox
     ORDER BY created_at ASC
     LIMIT ?`,
    limit,
  );
}

export async function dbDelete(clientId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM call_outbox WHERE client_id = ?`, clientId);
}

export async function dbUpdateFailed(
  clientId: string,
  attempts: number,
  lastError: string,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE call_outbox
       SET attempts = ?, last_error = ?, status = 'failed'
     WHERE client_id = ?`,
    attempts,
    lastError,
    clientId,
  );
}
