import { CallType } from './callTypes';

const completedCallIds = new Set<string>();
const completedCallReports = new Map<string, CompletedCallReport>();

export interface CompletedCallReport {
  doctorName?: string;
  durationSeconds: number;
  slidesViewed: number;
  totalSlides: number;
  feedback: string;
  slideTimes: number[];
}

function getCallKey(callType: CallType, doctorId: string) {
  return `${callType}:${doctorId}`;
}

export function markCallCompleted(
  doctorId?: string,
  callType: CallType = 'planned',
  report?: CompletedCallReport
) {
  if (!doctorId || doctorId === 'unknown') return;

  const callKey = getCallKey(callType, doctorId);
  completedCallIds.add(callKey);

  if (report) {
    completedCallReports.set(callKey, report);
  }
}

export function isCallCompleted(doctorId?: string, callType: CallType = 'planned') {
  return Boolean(doctorId && completedCallIds.has(getCallKey(callType, doctorId)));
}

export function getCompletedCallIds(callType: CallType = 'planned') {
  return new Set(
    [...completedCallIds]
      .filter((key) => key.startsWith(`${callType}:`))
      .map((key) => key.replace(`${callType}:`, ''))
  );
}

export function getCompletedCallReport(doctorId?: string, callType: CallType = 'planned') {
  if (!doctorId) return undefined;

  return completedCallReports.get(getCallKey(callType, doctorId));
}
