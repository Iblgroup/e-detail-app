import axios from '@/config/axios';
import { ApiEndpoints } from '@/api/endpoints';
import type { DoctorDataRow } from '@/api/doctor';
import type { ForcingContentRow } from '@/api/content';

export interface DailySyncResponse {
  success: boolean;
  workdayDate: string; // server-authoritative workday (YYYY-MM-DD)
  teamId: number;
  mieId: number;
  doctors: DoctorDataRow[];
  // The team's full doctor pool for offline unplanned calls.
  unplannedDoctors: DoctorDataRow[];
  // The team's SKUs, for the "Samples Provided" picker.
  teamSkus: string[];
  // Forcing rows keyed by the doctor's specialty id.
  forcing: Record<string, ForcingContentRow[]>;
  imageUrls: string[];
}

interface DailySyncParams {
  teamId: number;
  mieId: string;
}

/** One bundled call that returns everything the rep needs for the day. */
export const getDailySync = async ({
  teamId,
  mieId,
}: DailySyncParams): Promise<DailySyncResponse> => {
  return axios.get(ApiEndpoints.syncDaily, {
    params: { teamId, mieId },
  }) as unknown as Promise<DailySyncResponse>;
};
