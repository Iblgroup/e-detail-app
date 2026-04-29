import { useLocalSearchParams } from 'expo-router';
import CallScreen from '@/views/planned-calls/call-screen';
import { CallType } from '@/views/planned-calls/callTypes';

export default function CallScreenRoute() {
  const { id, callType, doctorName, returnToNewDoctor } = useLocalSearchParams<{
    id: string;
    callType?: CallType;
    doctorName?: string;
    returnToNewDoctor?: string;
  }>();
  const normalizedCallType: CallType = callType === 'unplanned' ? 'unplanned' : 'planned';
  const normalizedDoctorName = Array.isArray(doctorName) ? doctorName[0] : doctorName;
  const shouldReturnToNewDoctor =
    (Array.isArray(returnToNewDoctor) ? returnToNewDoctor[0] : returnToNewDoctor) === '1';

  return (
    <CallScreen
      doctorId={id}
      callType={normalizedCallType}
      doctorName={normalizedDoctorName}
      returnToNewDoctor={shouldReturnToNewDoctor}
    />
  );
}
