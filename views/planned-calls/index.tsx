import { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { ScheduleSectionHeader } from './ScheduleSectionHeader';
import { DoctorCard, Doctor } from './DoctorCard';
import { getCompletedCallIds } from './callCompletionStore';

const todayDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Smith',
    specialty: 'Cardiologist',
    hospital: 'City Hospital',
    lastVisit: '2024-02-15',
    scheduledTime: '09:00 AM',
  },
  {
    id: '2',
    name: 'Dr. Ahmed Khan',
    specialty: 'General Physician',
    hospital: 'Central Clinic',
    lastVisit: '2024-01-20',
    scheduledTime: '11:30 AM',
  },
  {
    id: '3',
    name: 'Dr. Sarah Smith',
    specialty: 'Cardiologist',
    hospital: 'City Hospital',
    lastVisit: '2024-02-15',
    scheduledTime: '03:00 PM',
  },
];

export default function PlannedCalls() {
  const [completedCallIds, setCompletedCallIds] = useState(() => getCompletedCallIds('planned'));

  useFocusEffect(
    useCallback(() => {
      setCompletedCallIds(getCompletedCallIds('planned'));
    }, [])
  );

  const doctors = todayDoctors
    .map((doctor) => ({
      ...doctor,
      status:
        doctor.status === 'completed' || completedCallIds.has(doctor.id)
          ? 'completed' as const
          : 'pending' as const,
    }))
    .sort((a, b) => Number(a.status === 'completed') - Number(b.status === 'completed'));
  const remaining = doctors.filter((doctor) => doctor.status !== 'completed').length;

  return (
    <ScreenLayout title="Planned Calls" notificationCount={1}>
      <View style={styles.section}>
        <ScheduleSectionHeader title="Today's Schedule" remaining={remaining} />
        <View style={styles.list}>
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} callType="planned" onPress={() => {}} />
          ))}
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  list: {
    gap: 10,
  },
});
