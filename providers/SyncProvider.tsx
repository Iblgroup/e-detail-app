import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import NetInfo from '@react-native-community/netinfo';

import { useAuth } from '@/providers/AuthProvider';
import { loadImageManifest, type DownloadProgress } from '@/lib/offline/imageCache';
import { getSyncMeta, todayWorkday } from '@/lib/offline/syncMeta';
import { runSync } from '@/lib/offline/runSync';

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

interface SyncContextValue {
  status: SyncStatus;
  progress: DownloadProgress | null;
  lastSyncedFor: string | null;
  lastSyncedAt: string | null;
  isOnline: boolean;
  isHydrated: boolean;
  /** True when there is cached data, but it is not for today's workday. */
  isStale: boolean;
  /** True when there is no synced data at all. */
  hasNoData: boolean;
  syncNow: () => Promise<void>;
}

const SyncContext = createContext<SyncContextValue | undefined>(undefined);

export function SyncProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [lastSyncedFor, setLastSyncedFor] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const runningRef = useRef(false);
  // Guards the auto catch-up so a failing sync doesn't retry in a tight loop.
  // Re-armed only when connectivity returns (offline -> online).
  const autoSyncAttemptedRef = useRef(false);
  const wasOnlineRef = useRef(true);

  // Load persisted manifest + sync metadata on startup.
  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadImageManifest();
      const meta = await getSyncMeta();
      if (!mounted) return;
      setLastSyncedFor(meta.lastSyncedFor);
      setLastSyncedAt(meta.lastSyncedAt);
      setIsHydrated(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Track connectivity for the UI (React Query's onlineManager is wired
  // separately in QueryProvider).
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const next = Boolean(state.isConnected);
      // On reconnect, allow one fresh auto catch-up attempt.
      if (!wasOnlineRef.current && next) {
        autoSyncAttemptedRef.current = false;
      }
      wasOnlineRef.current = next;
      setIsOnline(next);
    });
    return unsubscribe;
  }, []);

  const syncNow = useCallback(async () => {
    if (runningRef.current) return;
    const mieId = user?.mieId;
    const teamId = user?.teamId;
    if (!mieId || !teamId) return;

    runningRef.current = true;
    setStatus('syncing');
    setProgress(null);

    try {
      await runSync({ mieId, teamId, onProgress: setProgress });
      const meta = await getSyncMeta();
      setLastSyncedFor(meta.lastSyncedFor);
      setLastSyncedAt(meta.lastSyncedAt);
      setStatus('success');
    } catch (error) {
      console.warn('[sync] failed', error);
      setStatus('error');
    } finally {
      setProgress(null);
      runningRef.current = false;
    }
  }, [user?.mieId, user?.teamId]);

  const isStale = isHydrated && lastSyncedFor !== todayWorkday();
  const hasNoData = isHydrated && lastSyncedFor === null;

  // App-open catch-up + auto-sync on reconnect: if signed in and online but the
  // cached data isn't for today, sync. This is the real guarantee for a rep who
  // opens the app at 8 AM after the device was off all night.
  useEffect(() => {
    if (
      isHydrated &&
      isAuthenticated &&
      isOnline &&
      isStale &&
      status !== 'syncing' &&
      !autoSyncAttemptedRef.current
    ) {
      // Fire at most once until it succeeds or connectivity is regained, so a
      // failing sync (e.g. server unreachable) can't loop.
      autoSyncAttemptedRef.current = true;
      void syncNow();
    }
  }, [isHydrated, isAuthenticated, isOnline, isStale, status, syncNow]);

  const value = useMemo<SyncContextValue>(
    () => ({
      status,
      progress,
      lastSyncedFor,
      lastSyncedAt,
      isOnline,
      isHydrated,
      isStale,
      hasNoData,
      syncNow,
    }),
    [
      status,
      progress,
      lastSyncedFor,
      lastSyncedAt,
      isOnline,
      isHydrated,
      isStale,
      hasNoData,
      syncNow,
    ],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return ctx;
}
