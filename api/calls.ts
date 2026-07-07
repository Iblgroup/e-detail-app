import axios from '@/config/axios';

/**
 * One completed call, shaped to the backend `call_tracking` columns. Only
 * `tsoid` + `doctorid` are required; everything else is optional and omitted
 * when unknown. jsonb columns accept arrays/objects (serialized server-side).
 */
export interface CallTrackingInput {
  tsoid: string;
  doctorid: string;
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
