import { useLocalSearchParams } from 'expo-router';
import DoctorDetail, { DoctorDetailData } from '@/views/planned-calls/doctor-detail';
import { isCallCompleted } from '@/views/planned-calls/callCompletionStore';
import { CallType } from '@/views/planned-calls/callTypes';
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
    history: [],
  };

  const completed = getParam(params.completed);

  return (
    <DoctorDetail
      doctor={doctor}
      callType={normalizedCallType}
      completed={completed === '1' || isCallCompleted(doctorId, normalizedCallType)}
    />
  );
}
