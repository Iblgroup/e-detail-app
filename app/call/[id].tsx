import { useLocalSearchParams } from 'expo-router';
import CallScreen from '@/views/planned-calls/call-screen';
import { CallType } from '@/views/planned-calls/callTypes';

export default function CallScreenRoute() {
  const {
    id,
    callType,
    doctorName,
    returnToNewDoctor,
    specialtyId,
    teamId,
    institution,
    latitude,
    longitude,
    arrivedTime,
    arrivedLocation,
  } = useLocalSearchParams<{
    id: string;
    callType?: CallType;
    doctorName?: string;
    returnToNewDoctor?: string;
    specialtyId?: string;
    teamId?: string;
    institution?: string;
    latitude?: string;
    longitude?: string;
    arrivedTime?: string;
    arrivedLocation?: string;
  }>();
  const normalizedCallType: CallType = callType === 'unplanned' ? 'unplanned' : 'planned';
  const normalizedDoctorName = Array.isArray(doctorName) ? doctorName[0] : doctorName;
  const shouldReturnToNewDoctor =
    (Array.isArray(returnToNewDoctor) ? returnToNewDoctor[0] : returnToNewDoctor) === '1';
  const normalizedSpecialtyId = Number(Array.isArray(specialtyId) ? specialtyId[0] : specialtyId) || undefined;
  const normalizedTeamId = Number(Array.isArray(teamId) ? teamId[0] : teamId) || undefined;
  const normalizedInstitution = Array.isArray(institution) ? institution[0] : institution;
  const getParam = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);
  const normalizedLatitude = Number(getParam(latitude));
  const normalizedLongitude = Number(getParam(longitude));

  return (
    <CallScreen
      doctorId={id}
      callType={normalizedCallType}
      doctorName={normalizedDoctorName}
      returnToNewDoctor={shouldReturnToNewDoctor}
      specialtyId={normalizedSpecialtyId}
      teamId={normalizedTeamId}
      institutionType={normalizedInstitution}
      arrivedLatitude={Number.isFinite(normalizedLatitude) ? normalizedLatitude : undefined}
      arrivedLongitude={Number.isFinite(normalizedLongitude) ? normalizedLongitude : undefined}
      arrivedTime={getParam(arrivedTime)}
      arrivedLocation={getParam(arrivedLocation)}
    />
  );
}
