import { Colors } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { useArrival } from '@/lib/location/useArrival';
import { useSpecialties } from '@/api/content';
import { useInfiniteDoctors } from '@/api/doctor';
import { AppBottomSheetSelect } from '@/components/ui/AppBottomSheetSelect';
import { AppMultiSelectSheet, MultiSelectOption } from '@/components/ui/AppMultiSelectSheet';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrivedButton } from './doctor-detail/ArrivedButton';
import { CancelCallButton } from './doctor-detail/CancelCallButton';
import { StartCallButton } from './doctor-detail/StartCallButton';

type InstitutionCallType = 'group' | 'walking';

interface CallTypeOption {
  key: InstitutionCallType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}

const CALL_TYPES: CallTypeOption[] = [
  { key: 'group', label: 'Group Call', icon: 'people-outline' },
  { key: 'walking', label: 'Walking/Parking Call', icon: 'car-outline' },
];

export function InstitutionCallPanel() {
  const { user } = useAuth();
  const [callType, setCallType] = useState<InstitutionCallType>('walking');
  const { arrived, arrival, toggleArrived, reset } = useArrival();
  const isGroupCall = callType === 'group';

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

  // A group call is made to a set of doctors picked from the team pool.
  const teamDoctorsQuery = useInfiniteDoctors({
    teamId: user?.teamId,
    mieId: user?.mieId ? String(user.mieId) : undefined,
  });
  const doctorOptions = useMemo<MultiSelectOption[]>(() => {
    const rows = teamDoctorsQuery.data?.pages.flatMap((page) => page.data) ?? [];
    const seen = new Set<string>();
    const options: MultiSelectOption[] = [];
    for (const row of rows) {
      if (row.DOCTORID == null || !row.DOCTORNAME) continue;
      const value = String(row.DOCTORID);
      if (seen.has(value)) continue;
      seen.add(value);
      options.push({ value, label: row.DOCTORNAME });
    }
    return options.sort((a, b) => a.label.localeCompare(b.label));
  }, [teamDoctorsQuery.data]);
  const [selectedDoctorIds, setSelectedDoctorIds] = useState<string[]>([]);
  const hasDoctors = selectedDoctorIds.length > 0;

  // Group calls also require picking at least one doctor; walking calls don't.
  const readyToArrive = hasSpecialty && (!isGroupCall || hasDoctors);

  const selected = CALL_TYPES.find((option) => option.key === callType);

  const handleCallTypeChange = (key: InstitutionCallType) => {
    if (key === callType) return;
    setCallType(key);
    reset();
  };

  // Changing the specialty invalidates the current arrival (a fresh vicinity
  // check belongs to the newly chosen specialty), so reset the Arrived state.
  const handleSpecialtyChange = (name: string) => {
    if (name === selectedSpecialtyName) return;
    setSelectedSpecialtyName(name);
    reset();
  };

  // Changing the doctor set also invalidates a prior arrival.
  const handleDoctorsChange = (ids: string[]) => {
    setSelectedDoctorIds(ids);
    if (arrived) reset();
  };

  const handleStartCall = () => {
    const doctorName = isGroupCall
      ? `Group Call · ${selectedDoctorIds.length} doctor${selectedDoctorIds.length === 1 ? '' : 's'}`
      : `${selected?.label ?? 'Institution Call'}`;

    router.push({
      pathname: '/call/[id]',
      params: {
        id: `institution-${callType}`,
        callType: 'planned',
        doctorName,
        teamId: user?.teamId ? String(user.teamId) : undefined,
        specialtyId: selectedSpecialty ? String(selectedSpecialty.specialty_id) : undefined,
        institution: callType,
        groupDoctorIds: isGroupCall ? selectedDoctorIds.join(',') : undefined,
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
        <Text style={styles.cardLabel}>Institution Call Type</Text>
        <View style={styles.segment}>
          {CALL_TYPES.map((option) => {
            const isActive = option.key === callType && !option.disabled;
            return (
              <Pressable
                key={option.key}
                disabled={option.disabled}
                onPress={() => handleCallTypeChange(option.key)}
                style={({ pressed }) => [
                  styles.segmentButton,
                  isActive && styles.segmentButtonActive,
                  option.disabled && styles.segmentButtonDisabled,
                  pressed && !option.disabled && styles.pressed,
                ]}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={
                    option.disabled
                      ? Colors.textMuted
                      : isActive
                        ? Colors.textOnDark
                        : Colors.primary
                  }
                />
                <Text
                  style={[
                    styles.segmentText,
                    isActive && styles.segmentTextActive,
                    option.disabled && styles.segmentTextDisabled,
                  ]}
                >
                  {option.label}
                </Text>
                {option.disabled ? (
                  <Text style={styles.soonBadge}>Soon</Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        {isGroupCall ? (
          <View style={styles.field}>
            <Text style={styles.cardLabel}>Doctors</Text>
            <AppMultiSelectSheet
              title="Select Doctors"
              placeholder={
                teamDoctorsQuery.isLoading ? 'Loading doctors...' : 'Select doctors...'
              }
              options={doctorOptions}
              values={selectedDoctorIds}
              onChange={handleDoctorsChange}
              searchable={doctorOptions.length > 6}
              emptyText="No doctors available."
            />
            <Text style={styles.helperText}>
              Select every doctor attending this group call.
            </Text>
          </View>
        ) : null}

        <View style={styles.field}>
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
  field: {
    gap: 12,
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
  segment: {
    flexDirection: 'row',
    gap: 12,
  },
  segmentButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  segmentButtonActive: {
    backgroundColor: Colors.primary,
  },
  segmentButtonDisabled: {
    borderColor: '#E2E8F0',
    backgroundColor: '#F1F5F9',
  },
  pressed: {
    opacity: 0.85,
  },
  segmentText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  segmentTextActive: {
    color: Colors.textOnDark,
  },
  segmentTextDisabled: {
    color: Colors.textMuted,
  },
  soonBadge: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 2,
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
