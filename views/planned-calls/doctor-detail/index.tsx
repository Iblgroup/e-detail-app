import { Colors } from '@/constants/theme';
import { useArrival } from '@/lib/location/useArrival';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { CallType } from '../callTypes';
// import { AddTokenButton } from './AddTokenButton'; // hidden for now
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
  specialtyId?: number;
  hospital: string;
  address: string;
  lastVisit: string;
  doctorRating: string;
  pmdcNumber: string;
  scheduledTime?: string;
  teamId?: number;
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
  const { arrived, arrival, toggleArrived, reset } = useArrival();
  // const [tokenAdded, setTokenAdded] = useState(false); // Add Card (Token) hidden
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
            {/* Add Card (Token) hidden for now */}
            <View style={styles.buttonCellFull}>
              <ArrivedButton arrived={arrived} onPress={toggleArrived} />
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
                      specialtyId: doctor.specialtyId ? String(doctor.specialtyId) : undefined,
                      teamId: doctor.teamId ? String(doctor.teamId) : undefined,
                      latitude: arrival?.latitude != null ? String(arrival.latitude) : undefined,
                      longitude: arrival?.longitude != null ? String(arrival.longitude) : undefined,
                      arrivedTime: arrival?.arrivedTime,
                      arrivedLocation: arrival?.arrivedLocation,
                    },
                  })
                }
              />
            </View>
            <View style={styles.buttonCellHalf}>
              <CancelCallButton enabled={arrived} onPress={reset} />
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
  buttonCellFull: {
    width: '100%',
    height: 140,
    paddingHorizontal: 6,
  },
});
