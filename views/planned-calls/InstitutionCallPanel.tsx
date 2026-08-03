import { Colors } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { useArrival } from '@/lib/location/useArrival';
import { useSpecialties } from '@/api/content';
import { AppBottomSheetSelect } from '@/components/ui/AppBottomSheetSelect';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArrivedButton } from './doctor-detail/ArrivedButton';
import { CancelCallButton } from './doctor-detail/CancelCallButton';
import { StartCallButton } from './doctor-detail/StartCallButton';

/**
 * Group calls: several doctors at once, picked at the End of the call, with
 * forcing driven by a chosen specialty. Chamber and parking calls use the
 * doctor list instead.
 */
export function InstitutionCallPanel() {
  const { user } = useAuth();
  const { arrived, arrival, toggleArrived, reset } = useArrival();

  // Forcing for an institution call is driven by the chosen specialty.
  const specialtiesQuery = useSpecialties();
  const specialties = useMemo(() => specialtiesQuery.data ?? [], [specialtiesQuery.data]);
  const [selectedSpecialtyName, setSelectedSpecialtyName] = useState('');
  const specialtyOptions = useMemo(
    () => specialties.map((specialty) => specialty.specialty_name),
    [specialties],
  );
  const selectedSpecialty = useMemo(
    () => specialties.find((specialty) => specialty.specialty_name === selectedSpecialtyName),
    [specialties, selectedSpecialtyName],
  );
  const hasSpecialty = Boolean(selectedSpecialty);

  // A group call picks its doctors at the END (in the call summary), so the
  // panel only needs a specialty before Arrive.
  const readyToArrive = hasSpecialty;

  // Changing the specialty invalidates the current arrival (a fresh vicinity
  // check belongs to the newly chosen specialty), so reset the Arrived state.
  const handleSpecialtyChange = (name: string) => {
    if (name === selectedSpecialtyName) return;
    setSelectedSpecialtyName(name);
    reset();
  };

  const handleStartCall = () => {
    router.push({
      pathname: '/call/[id]',
      params: {
        id: 'institution-group',
        callType: 'planned',
        doctorName: 'Group Call',
        teamId: user?.teamId ? String(user.teamId) : undefined,
        specialtyId: selectedSpecialty ? String(selectedSpecialty.specialty_id) : undefined,
        institution: 'group',
        latitude: arrival?.latitude != null ? String(arrival.latitude) : undefined,
        longitude: arrival?.longitude != null ? String(arrival.longitude) : undefined,
        arrivedTime: arrival?.arrivedTime,
        arrivedLocation: arrival?.arrivedLocation,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Specialty</Text>
        <AppBottomSheetSelect
          title="Select Specialty"
          placeholder={
            specialtiesQuery.isLoading ? 'Loading specialties...' : 'Select a specialty...'
          }
          options={specialtyOptions}
          value={selectedSpecialtyName}
          onChange={handleSpecialtyChange}
          searchable={specialtyOptions.length > 6}
          emptyText="No specialties available."
        />
        <Text style={styles.helperText}>
          Forcing content is shown for the selected specialty.
        </Text>
      </View>

      <View style={styles.buttonsRow}>
        <View style={styles.buttonCellFull}>
          <ArrivedButton arrived={arrived} enabled={readyToArrive} onPress={toggleArrived} />
        </View>
        <View style={styles.buttonCellHalf}>
          <StartCallButton enabled={readyToArrive && arrived} onPress={handleStartCall} />
        </View>
        <View style={styles.buttonCellHalf}>
          <CancelCallButton enabled={arrived} onPress={reset} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    backgroundColor: Colors.surface,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLabel: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  helperText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
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
