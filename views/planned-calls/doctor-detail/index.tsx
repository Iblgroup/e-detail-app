import { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { DoctorDetailHeader } from './DoctorDetailHeader';
import { ProfessionalDetailsCard } from './ProfessionalDetailsCard';
import { RecentHistoryCard, HistoryItem } from './RecentHistoryCard';
import { ContactInfoCard } from './ContactInfoCard';
import { ArrivedButton } from './ArrivedButton';
import { router } from 'expo-router';
import { StartCallButton } from './StartCallButton';
import { CallCompletedCard } from './CallCompletedCard';
import { CallType } from '../callTypes';

export interface DoctorDetailData {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  address: string;
  lastVisit: string;
  rating: string;
  history: HistoryItem[];
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
          rating={doctor.rating}
        />

        <RecentHistoryCard items={doctor.history} />

        {completed ? (
          <CallCompletedCard />
        ) : (
          <View style={styles.buttonsRow}>
            <View style={styles.buttonCell}>
              <ArrivedButton arrived={arrived} onPress={() => setArrived((v) => !v)} />
            </View>
            <View style={styles.buttonCell}>
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
          </View>
        )}

        <ContactInfoCard />
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
    marginHorizontal: -6,
  },
  buttonCell: {
    width: '50%',
    height: 140,
    paddingHorizontal: 6,
  },
});
