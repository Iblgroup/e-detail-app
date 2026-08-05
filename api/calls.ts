import { useQuery } from '@tanstack/react-query';
import axios from '@/config/axios';

/**
 * One completed call, shaped to the backend `call_tracking` columns. Only
 * `tsoid` + `doctorid` are required; everything else is optional and omitted
 * when unknown. jsonb columns accept arrays/objects (serialized server-side).
 */
export interface CallTrackingInput {
  // Client-generated id linking this call's 'started' insert to its 'completed'
  // update (the backend upserts on it). Generated at call start.
  client_call_id: string;
  tsoid: string;
  // Optional: a walking-call 'started' row has no doctor yet (chosen at End).
  doctorid?: string;
  doctor_name?: string;
  doctor_specialty?: string;
  pmdc?: string;
  doctor_last_visit?: string; // YYYY-MM-DD
  latitude?: number;
  longitude?: number;
  arrived_location?: string;
  arrived_time?: string; // ISO timestamp
  arrived_within_vicinity?: boolean; // rep within 50m of the clinic (day or evening)
  arrived_distance_meters?: number; // nearest distance from arrival GPS to the clinic
  call_start_time?: string; // ISO timestamp
  call_end_time?: string; // ISO timestamp
  total_call_time_seconds?: number;
  total_slides_count?: number;
  shown_slides_count?: number;
  slides_total_time_seconds?: number;
  each_slide_time?: unknown; // jsonb — e.g. { [slideLabel]: seconds } or number[]
  brand?: unknown; // jsonb — brands shown, e.g. [{ id, name }]
  sku?: unknown; // jsonb — SKUs shown, each linked, e.g. [{ brand_id, name }]
  brand_slide_time?: unknown; // jsonb
  sku_slide_time?: unknown; // jsonb
  join_call?: unknown; // jsonb — e.g. string[]
  sample_provided?: boolean;
  samples_json?: unknown; // jsonb
  feedback?: string;
  feedback_comment?: string;
  call_type?: string; // 'planned' | 'unplanned'
  institution_call_type?: string; // 'walking' | 'group'
  call_outcome?: string;
  /** Why the rep cancelled — set when call_outcome is 'cancelled'. */
  cancel_reason?: string;
  /** When the rep cancelled — ISO timestamp, set alongside cancel_reason. */
  call_cancel_time?: string;
  route_json?: unknown; // jsonb
  engagement_score?: number;
  conversion_score?: number;
  recording_url?: string;
  recording_duration_seconds?: number;
  prescriptions_json?: unknown; // jsonb
  current_medicines_json?: unknown; // jsonb
  created_by?: number; // user_validation.user_id
}

export interface BatchCallItem extends CallTrackingInput {
  /** Outbox client id echoed back so we know which queued row synced. */
  clientId: string;
}

export interface BatchCallResult {
  clientId: string | null;
  success: boolean;
  callId?: number;
  message?: string;
}

export interface BatchCallResponse {
  success: boolean;
  count: number;
  results: BatchCallResult[];
}

/** Record a single call immediately (used when online at submit time). */
export const postCall = async (
  payload: CallTrackingInput,
): Promise<{ success: boolean; callId: number }> => {
  return axios.post('/calls', payload) as unknown as Promise<{
    success: boolean;
    callId: number;
  }>;
};

/** Flush a batch of queued calls; returns per-item results (partial success ok). */
export const postCallsBatch = async (
  calls: BatchCallItem[],
): Promise<BatchCallResponse> => {
  return axios.post('/calls/batch', { calls }) as unknown as Promise<BatchCallResponse>;
};

/** Doctor ids this rep has RECORDED a call for today (from call_tracking). */
export const completedDoctorIdsKey = (mieId?: string) =>
  ['completed-doctors', mieId ?? 'no-mie'] as const;

export const getCompletedDoctorIds = async (mieId: string): Promise<string[]> => {
  const res = (await axios.get('/calls/completed', {
    params: { mieId },
  })) as unknown as { success: boolean; doctorIds: string[] };
  return res.doctorIds ?? [];
};

// Server-recorded completed doctors, cached (and offline-persisted) so the
// Completed tab survives app restarts. Refetches when online.
export const useCompletedDoctorIds = (mieId?: string) => {
  return useQuery({
    queryKey: completedDoctorIdsKey(mieId),
    queryFn: () => getCompletedDoctorIds(mieId as string),
    enabled: Boolean(mieId),
    staleTime: 60 * 1000,
  });
};

/** One completed call in the month's history with a doctor. */
export interface DoctorCallRecord {
  callId: number;
  date: string;
  kind?: string | null;
  callType?: string | null;
  durationSeconds: number;
  slidesShown: number;
  slidesTotal: number;
  slidesSeconds: number;
  brands: string[];
  skus: string[];
  feedback?: string | null;
  feedbackComment?: string | null;
  sampleProvided: boolean;
}

export interface DoctorCallSummary {
  totalCalls: number;
  byKind: { chamber: number; group: number; parking: number };
  durationSeconds: number;
  slidesShown: number;
  slidesTotal: number;
  samplesProvided: number;
  brands: string[];
  skus: string[];
  /** Seconds spent per brand / per SKU across the month, highest first. */
  brandTimes: { name: string; seconds: number }[];
  skuTimes: { name: string; seconds: number }[];
  /** The doctor's class for this rep, and the month's quota it sets. */
  doctorClass?: string | null;
  maxVisits?: number | null;
  visitsDone?: number;
  /** Calls still owed this month; null when the class carries no quota. */
  remainingVisits?: number | null;
  /** Date of the most recent completed call, or null. */
  lastVisit?: string | null;
}

export interface DoctorCallSummaryResponse {
  success: boolean;
  summary: DoctorCallSummary;
  calls: DoctorCallRecord[];
}

export const doctorCallSummaryKey = (
  mieId?: string,
  doctorId?: string,
  kind?: string
) =>
  [
    'doctor-call-summary',
    mieId ?? 'no-mie',
    doctorId ?? 'no-doctor',
    kind ?? 'all-kinds',
  ] as const;

export const getDoctorCallSummary = async (
  mieId: string,
  doctorId: string,
  kind?: string
): Promise<DoctorCallSummaryResponse> => {
  return axios.get('/calls/doctor-summary', {
    params: { mieId, doctorId, kind },
  }) as unknown as Promise<DoctorCallSummaryResponse>;
};

/**
 * Everything this rep has done with a doctor this month — the calls themselves
 * plus the totals. Drives the completed-call analytics screen, which otherwise
 * only knows about the call just made (and nothing at all when reopened later).
 *
 * `kind` narrows it to one way of calling, so a report opened from the Group tab
 * reports on group calls rather than every call the doctor had.
 */
export const useDoctorCallSummary = (
  mieId?: string,
  doctorId?: string,
  kind?: string
) => {
  return useQuery({
    queryKey: doctorCallSummaryKey(mieId, doctorId, kind),
    queryFn: () => getDoctorCallSummary(mieId as string, doctorId as string, kind),
    enabled: Boolean(mieId && doctorId),
    staleTime: 60 * 1000,
  });
};
