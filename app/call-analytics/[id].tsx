import { useLocalSearchParams } from 'expo-router';
import CallAnalytics from '@/views/planned-calls/call-analytics';
import { CallType } from '@/views/planned-calls/callTypes';

const DOCTOR_NAMES: Record<string, string> = {
  '1': 'Dr. Sarah Smith',
  '2': 'Dr. Ahmed Khan',
  '3': 'Dr. Sarah Smith',
  '4': 'Dr. Ayesha Malik',
  '5': 'Dr. Omar Farooq',
  '6': 'Dr. Nadia Ali',
  '7': 'Dr. Bilal Qureshi',
  '8': 'Dr. Sana Tariq',
  '9': 'Dr. Hammad Raza',
  '10': 'Dr. Zainab Noor',
};

function parseNumber(value: string | string[] | undefined, fallback = 0) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsed = Number(rawValue);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseSlideTimes(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (!rawValue) return [];

  return rawValue
    .split(',')
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));
}

export default function CallAnalyticsRoute() {
  const params = useLocalSearchParams<{
    id: string;
    duration?: string;
    slidesViewed?: string;
    totalSlides?: string;
    feedback?: string;
    doctorInterest?: 'High' | 'Medium' | 'Low';
    slideTimes?: string;
    callType?: CallType;
    doctorName?: string;
    returnToNewDoctor?: string;
  }>();

  const doctorId = Array.isArray(params.id) ? params.id[0] : params.id;
  const normalizedCallType: CallType = params.callType === 'unplanned' ? 'unplanned' : 'planned';
  const doctorName = Array.isArray(params.doctorName) ? params.doctorName[0] : params.doctorName;
  const returnToNewDoctor =
    (Array.isArray(params.returnToNewDoctor) ? params.returnToNewDoctor[0] : params.returnToNewDoctor) === '1';

  return (
    <CallAnalytics
      doctorName={doctorName ?? DOCTOR_NAMES[doctorId]}
      callType={normalizedCallType}
      durationSeconds={parseNumber(params.duration)}
      slidesViewed={parseNumber(params.slidesViewed)}
      totalSlides={parseNumber(params.totalSlides, 1)}
      feedback={params.feedback || 'No feedback provided'}
      doctorInterest={params.doctorInterest}
      slideTimes={parseSlideTimes(params.slideTimes)}
      returnToNewDoctor={returnToNewDoctor}
    />
  );
}
