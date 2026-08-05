import { useLocalSearchParams } from 'expo-router';
import DoctorDetail, { DoctorDetailData } from '@/views/planned-calls/doctor-detail';
import { isCallCompleted } from '@/views/planned-calls/callCompletionStore';
import { CallType, type CallKind } from '@/views/planned-calls/callTypes';
import { DASH } from '@/views/planned-calls/mapDoctor';

/**
 * Doctor detail is rendered entirely from the row the list screen passed in
 * (already mapped from the `doctors` table by mapDoctorRow), so it works offline
 * with no extra fetch. Anything the record doesn't carry shows a dash.
 */
export default function DoctorDetailScreen() {
  const params = useLocalSearchParams<{
    id: string;
    completed?: string;
    callType?: CallType;
    name?: string;
    specialty?: string;
    specialtyId?: string;
    hospital?: string;
    address?: string;
    city?: string;
    lastVisit?: string;
    doctorClass?: string;
    pmdc?: string;
    scheduledTime?: string;
    teamId?: string;
    viewOnly?: string;
    callKind?: CallKind;
    visitCount?: string;
    maxVisits?: string;
    visitsChamber?: string;
    visitsGroup?: string;
    visitsParking?: string;
  }>();

  const getParam = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const doctorId = getParam(params.id) ?? '';
  const normalizedCallType: CallType =
    getParam(params.callType) === 'unplanned' ? 'unplanned' : 'planned';
  const name = getParam(params.name);

  if (!doctorId || !name) return null;

  const doctor: DoctorDetailData = {
    id: doctorId,
    name,
    specialty: getParam(params.specialty) ?? 'Unknown Specialty',
    specialtyId: Number(getParam(params.specialtyId)) || undefined,
    hospital: getParam(params.hospital) || DASH,
    address: getParam(params.address) || DASH,
    city: getParam(params.city) || DASH,
    lastVisit: getParam(params.lastVisit) || DASH,
    doctorClass: getParam(params.doctorClass) || DASH,
    pmdcNumber: getParam(params.pmdc) || DASH,
    scheduledTime: getParam(params.scheduledTime),
    teamId: Number(getParam(params.teamId)) || undefined,
    visitCount: Number(getParam(params.visitCount)) || 0,
    // Absent (unclassified doctor) must stay null, not 0 — 0 would read as a
    // real quota of zero and hide the circles for the wrong reason.
    maxVisits: getParam(params.maxVisits)
      ? Number(getParam(params.maxVisits)) || null
      : null,
    visitsChamber: Number(getParam(params.visitsChamber)) || 0,
    visitsGroup: Number(getParam(params.visitsGroup)) || 0,
    visitsParking: Number(getParam(params.visitsParking)) || 0,
    history: [],
  };

  const completed = getParam(params.completed);

  return (
    <DoctorDetail
      doctor={doctor}
      callType={normalizedCallType}
      completed={completed === '1' || isCallCompleted(doctorId, normalizedCallType)}
      // Chamber or parking — carried through so the call is marked correctly.
      callKind={getParam(params.callKind) as CallKind | undefined}
      // Opened from the Doctor List (a reference view) — no call actions.
      viewOnly={getParam(params.viewOnly) === '1'}
    />
  );
}
