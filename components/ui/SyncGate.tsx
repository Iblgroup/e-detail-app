import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { useSync } from '@/providers/SyncProvider';
import { AppButton } from '@/components/ui/AppButton';

function formatDate(value: string | null): string {
  if (!value) return '—';
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Gates the authenticated app on offline-sync state:
 * - First run / no cached data + syncing  -> full "Preparing today's calls" screen.
 * - No cached data + offline               -> blocking "connect to download" screen.
 * - Otherwise renders the app, with a thin banner when offline / stale / syncing.
 */
export function SyncGate({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { status, progress, lastSyncedFor, isOnline, isStale, hasNoData, syncNow } =
    useSync();

  // Login flow and unauthenticated screens get no sync chrome.
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Nothing cached yet — must download before the app is usable.
  if (hasNoData) {
    if (status === 'syncing') {
      return (
        <View style={styles.fullScreen}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.title}>Preparing today&apos;s calls…</Text>
          {progress ? (
            <Text style={styles.subtitle}>
              Downloading content {progress.done}/{progress.total}
            </Text>
          ) : (
            <Text style={styles.subtitle}>Fetching your schedule</Text>
          )}
        </View>
      );
    }

    return (
      <View style={styles.fullScreen}>
        <Text style={styles.title}>No offline data yet</Text>
        <Text style={styles.subtitle}>
          {isOnline
            ? 'Tap below to download today’s content.'
            : 'Connect to the internet to download today’s content.'}
        </Text>
        <View style={styles.action}>
          <AppButton
            label={isOnline ? 'Download now' : 'Retry'}
            onPress={() => void syncNow()}
          />
        </View>
      </View>
    );
  }

  // Has data: show the app, plus a status banner when relevant.
  const showBanner = !isOnline || isStale || status === 'syncing';
  const bannerSyncing = status === 'syncing';
  const bannerOffline = !isOnline;

  let bannerText: string;
  if (bannerSyncing) {
    bannerText = progress
      ? `Syncing… ${progress.done}/${progress.total}`
      : 'Syncing today’s content…';
  } else if (bannerOffline) {
    bannerText = `Offline · showing data from ${formatDate(lastSyncedFor)}`;
  } else {
    bannerText = `Showing data from ${formatDate(lastSyncedFor)} · tap to update`;
  }

  const bannerStyle = [
    styles.banner,
    bannerSyncing
      ? styles.bannerInfo
      : bannerOffline
        ? styles.bannerOffline
        : styles.bannerStale,
  ];

  return (
    <View style={styles.flex}>
      {showBanner ? (
        <View style={bannerStyle}>
          {bannerSyncing ? (
            <ActivityIndicator size="small" color={Colors.textOnDark} />
          ) : null}
          <Text style={styles.bannerText} onPress={() => void syncNow()}>
            {bannerText}
          </Text>
        </View>
      ) : null}
      <View style={styles.flex}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 24,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  action: {
    marginTop: 12,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  bannerInfo: { backgroundColor: Colors.primary },
  bannerOffline: { backgroundColor: Colors.danger },
  bannerStale: { backgroundColor: Colors.secondary },
  bannerText: {
    color: Colors.textOnDark,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
