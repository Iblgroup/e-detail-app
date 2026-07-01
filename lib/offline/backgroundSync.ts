import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';

import { readStoredSession, enrichUserFromDummyAccounts } from '@/providers/AuthProvider';
import { runSync } from '@/lib/offline/runSync';
import { getSyncMeta, todayWorkday } from '@/lib/offline/syncMeta';

export const BACKGROUND_SYNC_TASK = 'e-detail-background-sync';

// Hint to the OS for how often the task may run (minutes). The OS decides the
// actual timing — overnight, on charger + WiFi, it tends to fire. A few hours
// keeps it eligible across the night; the "already synced today?" guard stops
// redundant work. The app-open catch-up remains the real guarantee.
const MINIMUM_INTERVAL_MINUTES = 6 * 60;

// Defined at module load (must be registered in global scope before the OS can
// invoke it — this file is imported early from the root layout).
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    // Skip if we already have today's data.
    const meta = await getSyncMeta();
    if (meta.lastSyncedFor === todayWorkday()) {
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    // Need a signed-in rep with a team + MIE id to sync anything.
    const session = await readStoredSession();
    const user = enrichUserFromDummyAccounts(session?.user ?? null);
    if (!session?.token || !user?.mieId || !user?.teamId) {
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    await runSync({ mieId: user.mieId, teamId: user.teamId });
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    console.warn('[bg-sync] failed', error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

/** Register the periodic background sync (idempotent). Call once on app start. */
export async function registerBackgroundSync(): Promise<void> {
  try {
    const status = await BackgroundTask.getStatusAsync();
    if (status === BackgroundTask.BackgroundTaskStatus.Restricted) {
      // Background execution disabled by the OS / user settings.
      return;
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_SYNC_TASK,
    );
    if (!isRegistered) {
      await BackgroundTask.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: MINIMUM_INTERVAL_MINUTES,
      });
    }
  } catch (error) {
    console.warn('[bg-sync] registration failed', error);
  }
}
