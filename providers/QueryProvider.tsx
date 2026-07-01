import { QueryClient, onlineManager } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import NetInfo from '@react-native-community/netinfo';
import { filePersister, CACHE_BUSTER } from '@/lib/offline/persister';

// Keep cached data for a week so the app works offline across days.
export const WEEK_MS = 1000 * 60 * 60 * 24 * 7;

// Drive React Query's online/offline state from real connectivity, so queries
// and mutations pause when offline and resume on reconnect.
onlineManager.setEventListener((setOnline) => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    setOnline(Boolean(state.isConnected));
  });
  return unsubscribe;
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // Offline-first: data only ever changes via the sync. The screens read
      // from the cache the sync seeded and never auto-refetch, so the only
      // network call is /sync/daily (in runSync).
      staleTime: Infinity,
      gcTime: WEEK_MS,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

interface AppQueryProviderProps {
  children: React.ReactNode;
}

export function AppQueryProvider({ children }: AppQueryProviderProps) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: filePersister,
        maxAge: WEEK_MS,
        buster: CACHE_BUSTER,
        dehydrateOptions: {
          // Only persist successful queries (don't cache errors/loading).
          shouldDehydrateQuery: (query) => query.state.status === 'success',
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}

export { queryClient };
