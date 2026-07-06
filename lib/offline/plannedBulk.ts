import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

import axios from '@/config/axios';
import { OFFLINE_SYNC_KEY } from '@/config/app-sync';
import { queryClient } from '@/providers/QueryProvider';
import {
  plannedDoctorsKey,
  type DoctorDataRow,
  type DoctorDataResponse,
} from '@/api/doctor';

/**
 * A device-local cache of EVERY rep's planned doctor list, pulled on app open so
 * any rep can see their planned calls offline — even if they never synced
 * individually. Keyed by tsoid (= the app's mieId). Small enough to keep as one
 * JSON file (localStorage on web). This does NOT include the team pool
 * (unplanned) or forcing images — only the planned lists.
 */

type PlannedByMie = Record<string, DoctorDataRow[]>;

interface PlannedAllResponse {
  success: boolean;
  count: number;
  reps: number;
  byMie: PlannedByMie;
}

const STORAGE_KEY = 'e_detail_app_planned_bulk';
const fileUri = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}e-detail-app-planned-bulk.json`
  : null;

async function savePlannedBulk(byMie: PlannedByMie): Promise<void> {
  const json = JSON.stringify(byMie ?? {});
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, json);
      return;
    }
    if (!fileUri) return;
    await FileSystem.writeAsStringAsync(fileUri, json);
  } catch (error) {
    console.warn('[sync] Failed to persist planned bulk', error);
  }
}

async function readPlannedBulk(): Promise<PlannedByMie> {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as PlannedByMie) : {};
    }
    if (!fileUri) return {};
    const info = await FileSystem.getInfoAsync(fileUri);
    if (!info.exists) return {};
    const raw = await FileSystem.readAsStringAsync(fileUri);
    return raw ? (JSON.parse(raw) as PlannedByMie) : {};
  } catch (error) {
    console.warn('[sync] Failed to read planned bulk', error);
    return {};
  }
}

/** Number of reps whose planned lists are cached (for diagnostics). */
export async function getPlannedBulkRepCount(): Promise<number> {
  return Object.keys(await readPlannedBulk()).length;
}

/**
 * Persist ONE rep's planned list into the local bulk store (upsert by mieId).
 * Called whenever a rep's planned list is loaded (online fetch or sync) so their
 * own data survives logout and is re-seeded on the next (even offline) login —
 * independent of whether the all-reps bulk download succeeded.
 */
export async function savePlannedForMie(
  mieId: string,
  rows: DoctorDataRow[],
): Promise<void> {
  if (!mieId || !rows || rows.length === 0) return;
  const bulk = await readPlannedBulk();
  bulk[String(mieId)] = rows;
  await savePlannedBulk(bulk);
}

/**
 * Pull ALL reps' planned lists and cache them locally. Uses the shared app key
 * (no login needed) so it can run on app open. Best-effort: on error/offline it
 * keeps whatever was last cached.
 */
export async function bootstrapPlannedBulk(): Promise<void> {
  if (!OFFLINE_SYNC_KEY) return;
  try {
    const res = (await axios.get('/doctor/planned-all', {
      headers: { 'x-app-key': OFFLINE_SYNC_KEY },
    })) as unknown as PlannedAllResponse;
    if (res?.success && res.byMie) {
      await savePlannedBulk(res.byMie);
    }
  } catch (error) {
    console.warn('[sync] planned bulk download failed', error);
  }
}

/**
 * Seed the Planned screen's query cache for one rep from the local bulk cache,
 * so their planned calls render offline. Does NOT overwrite data already in the
 * cache (e.g. a fresh online fetch), so it only fills the gap.
 */
export async function seedPlannedFromBulk(
  teamId: number,
  mieId: string,
): Promise<void> {
  const key = plannedDoctorsKey(teamId, mieId, undefined);
  if (queryClient.getQueryData(key)) return; // don't clobber fresher data

  const bulk = await readPlannedBulk();
  const rows = bulk[String(mieId)];
  if (!rows || rows.length === 0) return;

  const page: DoctorDataResponse = {
    success: true,
    count: rows.length,
    totalCount: rows.length,
    offset: 0,
    limit: rows.length,
    hasMore: false,
    data: rows,
  };
  queryClient.setQueryData(key, { pages: [page], pageParams: [0] });
}
