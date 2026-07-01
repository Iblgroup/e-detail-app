import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Tiny persistent JSON key/value store used by the offline layer.
 * Native: one JSON file per key under the document directory.
 * Web: localStorage. Falls back to in-memory if neither is available.
 */
const PREFIX = 'e-detail-offline:';
const memory = new Map<string, string>();

function fileUriForKey(key: string): string | null {
  if (!FileSystem.documentDirectory) return null;
  // Android filenames can't contain ':' (and other chars), so sanitize the
  // whole base name, not just the key.
  const safeName = `e-detail-offline-${key}`.replace(/[^a-z0-9_-]/gi, '_');
  return `${FileSystem.documentDirectory}${safeName}.json`;
}

export async function readRaw(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage === 'undefined') return memory.get(key) ?? null;
      return localStorage.getItem(PREFIX + key);
    }
    const uri = fileUriForKey(key);
    if (!uri) return memory.get(key) ?? null;
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) return null;
    return await FileSystem.readAsStringAsync(uri);
  } catch (error) {
    console.warn('[offline] readRaw failed', key, error);
    return null;
  }
}

export async function writeRaw(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage === 'undefined') {
        memory.set(key, value);
        return;
      }
      localStorage.setItem(PREFIX + key, value);
      return;
    }
    const uri = fileUriForKey(key);
    if (!uri) {
      memory.set(key, value);
      return;
    }
    await FileSystem.writeAsStringAsync(uri, value);
  } catch (error) {
    console.warn('[offline] writeRaw failed', key, error);
  }
}

export async function removeRaw(key: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(PREFIX + key);
      memory.delete(key);
      return;
    }
    const uri = fileUriForKey(key);
    if (!uri) {
      memory.delete(key);
      return;
    }
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch (error) {
    console.warn('[offline] removeRaw failed', key, error);
  }
}

export async function readJson<T>(key: string): Promise<T | null> {
  const raw = await readRaw(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function writeJson(key: string, value: unknown): Promise<void> {
  await writeRaw(key, JSON.stringify(value));
}
