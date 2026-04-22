import { CallType } from './callTypes';

const completedCallIds = new Set<string>();

function getCallKey(callType: CallType, doctorId: string) {
  return `${callType}:${doctorId}`;
}

export function markCallCompleted(doctorId?: string, callType: CallType = 'planned') {
  if (!doctorId || doctorId === 'unknown') return;

  completedCallIds.add(getCallKey(callType, doctorId));
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
