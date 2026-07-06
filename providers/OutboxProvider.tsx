import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import NetInfo from '@react-native-community/netinfo';

import {
  flushOutbox,
  getPendingCount,
  initOutbox,
  subscribeOutbox,
} from '@/lib/offline/outbox';

interface OutboxContextValue {
  /** Number of call activities still waiting to sync. */
  pendingCount: number;
  /** Manually trigger a flush (e.g. a "Sync now" button). */
  flushNow: () => Promise<void>;
}

const OutboxContext = createContext<OutboxContextValue>({
  pendingCount: 0,
  flushNow: async () => {},
});

export function OutboxProvider({ children }: { children: ReactNode }) {
  const [pendingCount, setPendingCount] = useState(0);

  const refreshCount = useCallback(async () => {
    try {
      setPendingCount(await getPendingCount());
    } catch {
      // ignore
    }
  }, []);

  // Initialize the DB, do a first flush, and keep the pending count live.
  useEffect(() => {
    let mounted = true;
    (async () => {
      await initOutbox();
      if (!mounted) return;
      await refreshCount();
      void flushOutbox().then(refreshCount);
    })();
    const unsubscribe = subscribeOutbox(() => {
      void refreshCount();
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [refreshCount]);

  // Flush whenever connectivity is (re)gained.
  useEffect(() => {
    let wasConnected = true;
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = Boolean(state.isConnected);
      if (!wasConnected && connected) {
        void flushOutbox().then(refreshCount);
      }
      wasConnected = connected;
    });
    return unsubscribe;
  }, [refreshCount]);

  const flushNow = useCallback(async () => {
    await flushOutbox();
    await refreshCount();
  }, [refreshCount]);

  const value = useMemo<OutboxContextValue>(
    () => ({ pendingCount, flushNow }),
    [pendingCount, flushNow],
  );

  return <OutboxContext.Provider value={value}>{children}</OutboxContext.Provider>;
}

export function useOutbox() {
  return useContext(OutboxContext);
}
