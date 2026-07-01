import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { readJson, writeJson } from './fileStore';

/**
 * Downloads slide images to the device so they can be shown offline, and maps
 * each remote URL to its local file URI. The manifest is held in memory for
 * synchronous lookup (slides resolve their image during a React Query `select`).
 */
const MANIFEST_KEY = 'image-manifest';
const IMAGES_DIR = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}offline-images/`
  : null;

type Manifest = Record<string, string>; // remoteUrl -> localUri

let manifest: Manifest = {};
let loaded = false;

function hashUrl(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i += 1) {
    hash = (hash * 31 + url.charCodeAt(i)) | 0;
  }
  const match = url.split('?')[0].match(/\.([a-z0-9]{2,5})$/i);
  const ext = match ? match[1].toLowerCase() : 'img';
  return `${Math.abs(hash).toString(36)}.${ext}`;
}

/** Load the manifest into memory. Call once at startup before resolving. */
export async function loadImageManifest(): Promise<void> {
  if (loaded) return;
  manifest = (await readJson<Manifest>(MANIFEST_KEY)) ?? {};
  loaded = true;
}

/** Synchronous: returns the local URI if cached, otherwise the original URL. */
export function resolveCachedImage(url: string | undefined): string | undefined {
  if (!url) return url;
  return manifest[url] ?? url;
}

async function ensureDir(): Promise<void> {
  if (!IMAGES_DIR) return;
  const info = await FileSystem.getInfoAsync(IMAGES_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
  }
}

export interface DownloadProgress {
  total: number;
  done: number;
}

/**
 * Ensures every URL in `urls` is available locally and prunes images that are
 * no longer needed. Web has no file system download, so it is a no-op there
 * (the browser/expo-image cache handles it).
 */
export async function syncImages(
  urls: string[],
  onProgress?: (progress: DownloadProgress) => void,
): Promise<void> {
  await loadImageManifest();

  if (Platform.OS === 'web' || !IMAGES_DIR) {
    return;
  }

  await ensureDir();

  const wanted = [...new Set(urls.filter(Boolean))];
  const total = wanted.length;
  let done = 0;

  // Download anything missing (or whose file vanished).
  for (const url of wanted) {
    try {
      const existing = manifest[url];
      const existingInfo = existing
        ? await FileSystem.getInfoAsync(existing)
        : null;

      if (!existing || !existingInfo?.exists) {
        const target = `${IMAGES_DIR}${hashUrl(url)}`;
        const result = await FileSystem.downloadAsync(url, target);
        if (result.status >= 200 && result.status < 300) {
          manifest[url] = result.uri;
        }
      }
    } catch (error) {
      console.warn('[offline] image download failed', url, error);
    } finally {
      done += 1;
      onProgress?.({ total, done });
    }
  }

  // Prune cached images no longer referenced.
  const keep = new Set(wanted);
  for (const url of Object.keys(manifest)) {
    if (!keep.has(url)) {
      const localUri = manifest[url];
      delete manifest[url];
      try {
        const info = await FileSystem.getInfoAsync(localUri);
        if (info.exists) await FileSystem.deleteAsync(localUri, { idempotent: true });
      } catch {
        // ignore prune errors
      }
    }
  }

  await writeJson(MANIFEST_KEY, manifest);
}

/** Wipe all cached images + manifest (used on logout). */
export async function clearImageCache(): Promise<void> {
  manifest = {};
  loaded = true;
  await writeJson(MANIFEST_KEY, manifest);
  if (Platform.OS !== 'web' && IMAGES_DIR) {
    try {
      const info = await FileSystem.getInfoAsync(IMAGES_DIR);
      if (info.exists) await FileSystem.deleteAsync(IMAGES_DIR, { idempotent: true });
    } catch {
      // ignore
    }
  }
}
