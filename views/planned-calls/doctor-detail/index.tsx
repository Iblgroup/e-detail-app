import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { CallType } from '../callTypes';
import { AddTokenButton } from './AddTokenButton';
import { ArrivedButton } from './ArrivedButton';
import { CallCompletedCard } from './CallCompletedCard';
import { CancelCallButton } from './CancelCallButton';
import { DoctorDetailHeader } from './DoctorDetailHeader';
import { PlannedCallItem, PlannedCallsCard } from './PlannedCallsCard';
import { ProfessionalDetailsCard } from './ProfessionalDetailsCard';
import { HistoryItem } from './RecentHistoryCard';
import { StartCallButton } from './StartCallButton';

export interface DoctorDetailData {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  address: string;
  lastVisit: string;
  doctorRating: string;
  pmdcNumber: string;
  scheduledTime?: string;
  history: HistoryItem[];
  plannedCalls?: PlannedCallItem[];
}

interface DoctorDetailProps {
  doctor: DoctorDetailData;
  completed?: boolean;
  callType?: CallType;
}

export default function DoctorDetail({
  doctor,
  completed = false,
  callType = 'planned',
}: DoctorDetailProps) {
  const [arrived, setArrived] = useState(false);
  const [tokenAdded, setTokenAdded] = useState(false);
  const plannedCallsSource = doctor.plannedCalls ?? [
    {
      id: `${doctor.id}-planned-call`,
      title: 'E-Detailing Call',
      scheduledTime: doctor.scheduledTime ?? 'Time TBD',
      location: doctor.hospital,
      status: 'pending' as const,
    },
  ];
  const plannedCalls = plannedCallsSource.map((item, index) => ({
    ...item,
    status: completed && index === 0 ? 'completed' as const : item.status ?? 'pending' as const,
  }));

  return (
    <View style={styles.screen}>
      <DoctorDetailHeader name={doctor.name} specialty={doctor.specialty} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ProfessionalDetailsCard
          hospital={doctor.hospital}
          address={doctor.address}
          lastVisit={doctor.lastVisit}
          doctorRating={doctor.doctorRating}
          pmdcNumber={doctor.pmdcNumber}
          scheduledTime={doctor.scheduledTime}
        />

        <PlannedCallsCard items={plannedCalls} />

        {completed ? (
          <CallCompletedCard />
        ) : (
          <View style={styles.buttonsRow}>
            <View style={styles.buttonCellHalf}>
              <AddTokenButton
                active={tokenAdded}
                onPress={() => setTokenAdded((value) => !value)}
              />
            </View>
            <View style={styles.buttonCellHalf}>
              <ArrivedButton arrived={arrived} onPress={() => setArrived((v) => !v)} />
            </View>
            <View style={styles.buttonCellHalf}>
              <StartCallButton
                enabled={arrived}
                onPress={() =>
                  router.push({
                    pathname: '/call/[id]',
                    params: {
                      id: doctor.id,
                      callType,
                      doctorName: doctor.name,
                    },
                  })
                }
              />
            </View>
            <View style={styles.buttonCellHalf}>
              <CancelCallButton enabled={arrived} onPress={() => setArrived(false)} />
            </View>
          </View>
        )}
        {/* <ContactInfoCard /> */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
    marginTop: -36,
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  buttonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    rowGap: 12,
  },
  buttonCellHalf: {
    width: '50%',
    height: 140,
    paddingHorizontal: 6,
  },
});
