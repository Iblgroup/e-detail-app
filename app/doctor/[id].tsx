import { useLocalSearchParams } from 'expo-router';
import DoctorDetail, { DoctorDetailData } from '@/views/planned-calls/doctor-detail';
import { isCallCompleted } from '@/views/planned-calls/callCompletionStore';
import { CallType } from '@/views/planned-calls/callTypes';

// Mock data store — replace with API call using the id
const DOCTORS: Record<string, DoctorDetailData> = {
  '1': {
    id: '1',
    name: 'Dr. Sarah Smith',
    specialty: 'Cardiologist',
    hospital: 'City Hospital',
    address: '123 Heart St',
    lastVisit: '2024-02-15',
    rating: 'A+ Priority',
    history: [
      { id: 'h1', type: 'E-Detailing', date: 'Feb 15, 2024', duration: '12 mins', outcome: 'Positive' },
      { id: 'h2', type: 'Sample Drop', date: 'Jan 20, 2024', duration: '5 mins', outcome: 'Neutral' },
      { id: 'h3', type: 'E-Detailing', date: 'Dec 12, 2023', duration: '15 mins', outcome: 'Very Positive' },
    ],
  },
  '2': {
    id: '2',
    name: 'Dr. Ahmed Khan',
    specialty: 'General Physician',
    hospital: 'Central Clinic',
    address: '45 Main Blvd',
    lastVisit: '2024-01-20',
    rating: 'B+ Priority',
    history: [
      { id: 'h1', type: 'E-Detailing', date: 'Jan 20, 2024', duration: '10 mins', outcome: 'Positive' },
      { id: 'h2', type: 'Sample Drop', date: 'Dec 5, 2023', duration: '8 mins', outcome: 'Very Positive' },
    ],
  },
  '3': {
    id: '3',
    name: 'Dr. Sarah Smith',
    specialty: 'Cardiologist',
    hospital: 'City Hospital',
    address: '123 Heart St',
    lastVisit: '2024-02-15',
    rating: 'A+ Priority',
    history: [
      { id: 'h1', type: 'E-Detailing', date: 'Feb 15, 2024', duration: '12 mins', outcome: 'Positive' },
      { id: 'h2', type: 'Sample Drop', date: 'Jan 20, 2024', duration: '5 mins', outcome: 'Neutral' },
      { id: 'h3', type: 'E-Detailing', date: 'Dec 12, 2023', duration: '15 mins', outcome: 'Very Positive' },
    ],
  },
  '4': {
    id: '4',
    name: 'Dr. Ayesha Malik',
    specialty: 'Dermatologist',
    hospital: 'Skin Care Clinic',
    address: '18 Wellness Road',
    lastVisit: '2024-03-05',
    rating: 'A Priority',
    history: [
      { id: 'h1', type: 'E-Detailing', date: 'Mar 5, 2024', duration: '9 mins', outcome: 'Positive' },
      { id: 'h2', type: 'Sample Drop', date: 'Feb 11, 2024', duration: '4 mins', outcome: 'Neutral' },
    ],
  },
  '5': {
    id: '5',
    name: 'Dr. Omar Farooq',
    specialty: 'Orthopedic Surgeon',
    hospital: 'Metro Hospital',
    address: '77 Joint Avenue',
    lastVisit: '2024-02-28',
    rating: 'B+ Priority',
    history: [
      { id: 'h1', type: 'E-Detailing', date: 'Feb 28, 2024', duration: '11 mins', outcome: 'Positive' },
      { id: 'h2', type: 'Sample Drop', date: 'Jan 18, 2024', duration: '6 mins', outcome: 'Neutral' },
    ],
  },
  '6': {
    id: '6',
    name: 'Dr. Nadia Ali',
    specialty: 'Pulmonologist',
    hospital: 'Care Medical Center',
    address: '9 Breath Lane',
    lastVisit: '2024-03-12',
    rating: 'A+ Priority',
    history: [
      { id: 'h1', type: 'E-Detailing', date: 'Mar 12, 2024', duration: '13 mins', outcome: 'Very Positive' },
      { id: 'h2', type: 'Sample Drop', date: 'Feb 3, 2024', duration: '5 mins', outcome: 'Positive' },
    ],
  },
  '7': {
    id: '7',
    name: 'Dr. Bilal Qureshi',
    specialty: 'ENT Specialist',
    hospital: 'North Medical Complex',
    address: '24 North Avenue',
    lastVisit: '2024-03-18',
    rating: 'B Priority',
    history: [
      { id: 'h1', type: 'E-Detailing', date: 'Mar 18, 2024', duration: '8 mins', outcome: 'Positive' },
      { id: 'h2', type: 'Sample Drop', date: 'Feb 14, 2024', duration: '4 mins', outcome: 'Neutral' },
    ],
  },
  '8': {
    id: '8',
    name: 'Dr. Sana Tariq',
    specialty: 'Gynecologist',
    hospital: 'Women Care Hospital',
    address: '12 Care Street',
    lastVisit: '2024-03-22',
    rating: 'A Priority',
    history: [
      { id: 'h1', type: 'E-Detailing', date: 'Mar 22, 2024', duration: '10 mins', outcome: 'Very Positive' },
      { id: 'h2', type: 'Sample Drop', date: 'Feb 20, 2024', duration: '5 mins', outcome: 'Positive' },
    ],
  },
  '9': {
    id: '9',
    name: 'Dr. Hammad Raza',
    specialty: 'Neurologist',
    hospital: 'Neuro Health Center',
    address: '5 Neuro Park',
    lastVisit: '2024-02-19',
    rating: 'A+ Priority',
    history: [
      { id: 'h1', type: 'E-Detailing', date: 'Feb 19, 2024', duration: '14 mins', outcome: 'Positive' },
      { id: 'h2', type: 'Sample Drop', date: 'Jan 27, 2024', duration: '6 mins', outcome: 'Neutral' },
    ],
  },
  '10': {
    id: '10',
    name: 'Dr. Zainab Noor',
    specialty: 'Endocrinologist',
    hospital: 'Life Clinic',
    address: '63 Life Boulevard',
    lastVisit: '2024-01-30',
    rating: 'B+ Priority',
    history: [
      { id: 'h1', type: 'E-Detailing', date: 'Jan 30, 2024', duration: '9 mins', outcome: 'Positive' },
      { id: 'h2', type: 'Sample Drop', date: 'Jan 2, 2024', duration: '4 mins', outcome: 'Neutral' },
    ],
  },
};

export default function DoctorDetailScreen() {
  const { id, completed, callType, name, specialty, hospital, address, lastVisit } = useLocalSearchParams<{
    id: string;
    completed?: string;
    callType?: CallType;
    name?: string;
    specialty?: string;
    hospital?: string;
    address?: string;
    lastVisit?: string;
  }>();
  const doctorId = Array.isArray(id) ? id[0] : id;
  const normalizedCallType: CallType = callType === 'unplanned' ? 'unplanned' : 'planned';
  const getParam = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  const doctor = DOCTORS[doctorId] ?? (
    getParam(name)
      ? {
          id: doctorId,
          name: getParam(name) ?? 'New Doctor',
          specialty: getParam(specialty) ?? 'Specialist',
          hospital: getParam(hospital) ?? 'Clinic',
          address: getParam(address) ?? 'Address not added',
          lastVisit: getParam(lastVisit) ?? 'New doctor',
          rating: 'New Contact',
          history: [],
        }
      : undefined
  );

  if (!doctor) return null;

  return (
    <DoctorDetail
      doctor={doctor}
      callType={normalizedCallType}
      completed={completed === '1' || isCallCompleted(doctorId, normalizedCallType)}
    />
  );
}
