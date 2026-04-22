import { useLocalSearchParams } from 'expo-router';
import CallScreen from '@/views/planned-calls/call-screen';
import { CallType } from '@/views/planned-calls/callTypes';

export default function CallScreenRoute() {
  const { id, callType, doctorName } = useLocalSearchParams<{
    id: string;
    callType?: CallType;
    doctorName?: string;
  }>();
  const normalizedCallType: CallType = callType === 'unplanned' ? 'unplanned' : 'planned';
  const normalizedDoctorName = Array.isArray(doctorName) ? doctorName[0] : doctorName;

  return <CallScreen doctorId={id} callType={normalizedCallType} doctorName={normalizedDoctorName} />;
}
