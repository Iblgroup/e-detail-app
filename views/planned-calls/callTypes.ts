export type CallType = 'planned' | 'unplanned';

/**
 * How a call is conducted. The value is stored verbatim in
 * `call_tracking.institution_call_type`, so a chamber call is marked 'chamber'
 * and a parking call 'parking'.
 *  - 'chamber' → single doctor, picked from the rep's list.
 *  - 'parking' → walking / parking call. Same doctor-by-doctor flow as chamber
 *                for now; only the mark on the record differs.
 *  - 'group'   → several doctors at once, picked at the End of the call.
 */
export type CallKind = 'chamber' | 'parking' | 'group';

/** The kinds that run the doctor-list flow (everything except group). */
export function isDoctorListKind(kind: CallKind): kind is 'chamber' | 'parking' {
  return kind !== 'group';
}
