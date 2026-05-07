import { AppBottomSheetSelect } from '@/components/ui/AppBottomSheetSelect';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Colors } from '@/constants/theme';
import { Doctor, DoctorCard } from '@/views/planned-calls/DoctorCard';
import { ScheduleSectionHeader } from '@/views/planned-calls/ScheduleSectionHeader';
import { getCompletedCallIds } from '@/views/planned-calls/callCompletionStore';
import { consumeReturnToNewDoctor } from '@/views/unplanned-calls/returnToNewDoctorStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const unplannedDoctors: Doctor[] = [
  {
    id: '4',
    name: 'Dr. Ayesha Malik',
    specialty: 'Dermatologist',
    hospital: 'Skin Care Clinic',
    lastVisit: '2024-03-05',
  },
  {
    id: '5',
    name: 'Dr. Omar Farooq',
    specialty: 'Orthopedic Surgeon',
    hospital: 'Metro Hospital',
    lastVisit: '2024-02-28',
  },
  {
    id: '6',
    name: 'Dr. Nadia Ali',
    specialty: 'Pulmonologist',
    hospital: 'Care Medical Center',
    lastVisit: '2024-03-12',
    status: 'completed',
  },
];

const doctorOptions: Doctor[] = [
  {
    id: '7',
    name: 'Dr. Bilal Qureshi',
    specialty: 'ENT Specialist',
    hospital: 'North Medical Complex',
    lastVisit: '2024-03-18',
  },
  {
    id: '8',
    name: 'Dr. Sana Tariq',
    specialty: 'Gynecologist',
    hospital: 'Women Care Hospital',
    lastVisit: '2024-03-22',
  },
  {
    id: '9',
    name: 'Dr. Hammad Raza',
    specialty: 'Neurologist',
    hospital: 'Neuro Health Center',
    lastVisit: '2024-02-19',
  },
  {
    id: '10',
    name: 'Dr. Zainab Noor',
    specialty: 'Endocrinologist',
    hospital: 'Life Clinic',
    lastVisit: '2024-01-30',
  },
];

const emptyNewDoctorForm = {
  name: '',
  profession: '',
  hospital: '',
  address: '',
};

type PickerMode = 'existing' | 'new';

export default function UnplannedCalls() {
  const [completedCallIds, setCompletedCallIds] = useState(() => getCompletedCallIds('unplanned'));
  const [addedDoctors, setAddedDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<PickerMode>('existing');
  const [newDoctorForm, setNewDoctorForm] = useState(emptyNewDoctorForm);
  const [newDoctorCallCompleted, setNewDoctorCallCompleted] = useState(false);
  const [activePendingDoctorId, setActivePendingDoctorId] = useState<string>();
  const [newDoctorDrafts, setNewDoctorDrafts] = useState<Record<string, typeof emptyNewDoctorForm>>({});

  const handlePendingNewDoctorReturn = useCallback((pendingDoctorId?: string) => {
    if (pendingDoctorId) {
      setAddedDoctors((current) => {
        if (current.some((doctor) => doctor.id === pendingDoctorId)) return current;

        return [
          ...current,
          {
            id: pendingDoctorId,
            name: 'New Doctor',
            specialty: 'Details Pending',
            hospital: 'Tap to complete profile',
            lastVisit: 'Call completed',
            status: 'completed',
            isNewDoctor: true,
            isNewDoctorPending: true,
          },
        ];
      });
      setActivePendingDoctorId(pendingDoctorId);
      setNewDoctorForm((current) => newDoctorDrafts[pendingDoctorId] ?? current);
    } else {
      setActivePendingDoctorId(undefined);
      setNewDoctorForm(emptyNewDoctorForm);
    }

    setPickerVisible(true);
    setPickerMode('new');
    setNewDoctorCallCompleted(true);
  }, [newDoctorDrafts]);

  useFocusEffect(
    useCallback(() => {
      setCompletedCallIds(getCompletedCallIds('unplanned'));
      const pendingReturn = consumeReturnToNewDoctor();
      if (pendingReturn?.shouldOpenForm) {
        handlePendingNewDoctorReturn(pendingReturn.pendingDoctorId);
      }
    }, [handlePendingNewDoctorReturn])
  );

  const professionOptions = useMemo(() => {
    const specialties = [...unplannedDoctors, ...doctorOptions, ...addedDoctors]
      .map((doctor) => doctor.specialty?.trim())
      .filter((specialty): specialty is string => Boolean(specialty));

    return Array.from(new Set(specialties)).sort((a, b) => a.localeCompare(b));
  }, [addedDoctors]);

  const existingDoctorIds = new Set([...unplannedDoctors, ...addedDoctors].map((doctor) => doctor.id));
  const availableDoctorOptions = doctorOptions.filter((doctor) => !existingDoctorIds.has(doctor.id));
  const selectedDoctor = availableDoctorOptions.find((doctor) => doctor.id === selectedDoctorId);
  const isNewDoctorFormValid = Boolean(
    newDoctorForm.name.trim()
      && newDoctorForm.profession.trim()
      && newDoctorForm.hospital.trim()
      && newDoctorForm.address.trim()
  );
  const canAddDoctor =
    pickerMode === 'new'
      ? (newDoctorCallCompleted && isNewDoctorFormValid)
      : Boolean(selectedDoctor);

  const openPicker = () => {
    setSelectedDoctorId(availableDoctorOptions[0]?.id);
    setPickerMode('existing');
    setNewDoctorCallCompleted(false);
    setActivePendingDoctorId(undefined);
    setNewDoctorForm(emptyNewDoctorForm);
    setPickerVisible(true);
  };

  const closePicker = (preserveDraft = true) => {
    if (preserveDraft && pickerMode === 'new' && activePendingDoctorId) {
      setNewDoctorDrafts((current) => ({
        ...current,
        [activePendingDoctorId]: newDoctorForm,
      }));
    }

    setPickerVisible(false);
    setSelectedDoctorId(undefined);
    setPickerMode('existing');
    setNewDoctorCallCompleted(false);
    setActivePendingDoctorId(undefined);
    setNewDoctorForm(emptyNewDoctorForm);
  };

  const updateNewDoctorField = (field: keyof typeof emptyNewDoctorForm, value: string) => {
    setNewDoctorForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const addSelectedDoctor = () => {
    if (pickerMode === 'new') {
      if (!isNewDoctorFormValid) return;

      const newDoctor: Doctor = {
        id: activePendingDoctorId ?? `custom-${Date.now()}`,
        name: newDoctorForm.name.trim(),
        specialty: newDoctorForm.profession.trim(),
        hospital: newDoctorForm.hospital.trim(),
        address: newDoctorForm.address.trim(),
        lastVisit: '2026-04-20',
        status: 'completed',
        isNewDoctor: true,
      };

      setAddedDoctors((current) => {
        if (!activePendingDoctorId) return [...current, newDoctor];

        return current.map((doctor) =>
          doctor.id === activePendingDoctorId ? newDoctor : doctor
        );
      });
      if (activePendingDoctorId) {
        setNewDoctorDrafts((current) => {
          const next = { ...current };
          delete next[activePendingDoctorId];
          return next;
        });
      }
      setNewDoctorForm(emptyNewDoctorForm);
      closePicker(false);
      return;
    }

    if (!selectedDoctor) return;

    setAddedDoctors((current) => [...current, selectedDoctor]);
    closePicker();
  };

  const startNewDoctorCall = () => {
    setPickerVisible(false);
    setSelectedDoctorId(undefined);
    setPickerMode('new');
    setNewDoctorCallCompleted(false);
    setActivePendingDoctorId(undefined);
    setNewDoctorForm(emptyNewDoctorForm);

    router.push({
      pathname: '/call/[id]',
      params: {
        id: `new-unplanned-${Date.now()}`,
        callType: 'unplanned',
        doctorName: 'New Doctor',
        returnToNewDoctor: '1',
      },
    });
  };

  const doctors = [...unplannedDoctors, ...addedDoctors]
    .map((doctor) => ({
      ...doctor,
      status:
        doctor.status === 'completed' || completedCallIds.has(doctor.id)
          ? 'completed' as const
          : 'pending' as const,
    }))
    .sort((a, b) => Number(a.status === 'completed') - Number(b.status === 'completed'));

  return (
    <ScreenLayout title="Unplanned Calls" notificationCount={1}>
      <View style={styles.section}>
        <ScheduleSectionHeader
          title="Available Doctors"
          action={
            <AppButton
              label="Add Doctor"
              onPress={openPicker}
              icon={<Ionicons name="add" size={20} color={Colors.textOnDark} />}
              style={styles.addButton}
              textStyle={styles.addButtonText}
            />
          }
        />
        <View style={styles.list}>
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              callType="unplanned"
              onPress={(selectedDoctor) => {
                if (!selectedDoctor.isNewDoctorPending) return false;

                setActivePendingDoctorId(selectedDoctor.id);
                setPickerVisible(true);
                setPickerMode('new');
                setNewDoctorCallCompleted(true);
                setNewDoctorForm(newDoctorDrafts[selectedDoctor.id] ?? emptyNewDoctorForm);
                return true;
              }}
            />
          ))}
        </View>
      </View>

      <Modal visible={pickerVisible} transparent animationType="fade" onRequestClose={closePicker}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Unplanned Doctor</Text>
            <Text style={styles.modalSubtitle}>
              Select a doctor or create a new one for your unplanned call list.
            </Text>

            <View style={styles.modeRow}>
              <Pressable
                onPress={() => {
                  setPickerMode('existing');
                  setNewDoctorCallCompleted(false);
                  setActivePendingDoctorId(undefined);
                }}
                style={[styles.modeButton, pickerMode === 'existing' && styles.modeButtonActive]}
              >
                <Text style={[styles.modeText, pickerMode === 'existing' && styles.modeTextActive]}>
                  Existing
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setPickerMode('new');
                  setNewDoctorCallCompleted(Boolean(activePendingDoctorId));
                  if (activePendingDoctorId) {
                    setNewDoctorForm(newDoctorDrafts[activePendingDoctorId] ?? emptyNewDoctorForm);
                  }
                }}
                style={[
                  styles.modeButton,
                  styles.hiddenModeButton,
                  pickerMode === 'new' && styles.modeButtonActive,
                ]}
              >
                <Text style={[styles.modeText, pickerMode === 'new' && styles.modeTextActive]}>
                  New Doctor
                </Text>
              </Pressable>
            </View>

            {pickerMode === 'existing' ? (
              <View style={styles.dropdownBox}>
                <View style={styles.dropdownHeader}>
                  <Text style={styles.dropdownLabel}>
                    {selectedDoctor?.name ?? 'No doctors available'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={Colors.textMuted} />
                </View>

                <ScrollView
                  style={styles.optionsScroll}
                  contentContainerStyle={styles.optionsList}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                >
                  {availableDoctorOptions.map((doctor) => {
                    const selected = doctor.id === selectedDoctorId;

                    return (
                      <Pressable
                        key={doctor.id}
                        onPress={() => setSelectedDoctorId(doctor.id)}
                        style={[styles.optionRow, selected && styles.optionRowSelected]}
                      >
                        <View>
                          <Text style={styles.optionName}>{doctor.name}</Text>
                          <Text style={styles.optionMeta}>
                            {doctor.specialty} - {doctor.hospital}
                          </Text>
                        </View>
                        {selected && (
                          <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                        )}
                      </Pressable>
                    );
                  })}

                  {availableDoctorOptions.length === 0 && (
                    <Text style={styles.emptyText}>All available doctors have already been added.</Text>
                  )}
                </ScrollView>
              </View>
            ) : newDoctorCallCompleted ? (
              <View style={styles.form}>
                <TextInput
                  value={newDoctorForm.name}
                  onChangeText={(value) => updateNewDoctorField('name', value)}
                  style={styles.input}
                  placeholder="Doctor name"
                  placeholderTextColor={Colors.textMuted}
                />
                <AppBottomSheetSelect
                  options={professionOptions}
                  value={newDoctorForm.profession}
                  onChange={(value) => updateNewDoctorField('profession', value)}
                  placeholder="Profession"
                  title="Select Profession"
                  searchPlaceholder="Search profession"
                  emptyText="No professions available."
                />
                <TextInput
                  value={newDoctorForm.hospital}
                  onChangeText={(value) => updateNewDoctorField('hospital', value)}
                  style={styles.input}
                  placeholder="Hospital"
                  placeholderTextColor={Colors.textMuted}
                />
                <TextInput
                  value={newDoctorForm.address}
                  onChangeText={(value) => updateNewDoctorField('address', value)}
                  style={[styles.input, styles.addressInput]}
                  placeholder="Address"
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            ) : (
              <View style={styles.callPromptBox}>
                <Ionicons name="call-outline" size={22} color={Colors.primary} />
                <Text style={styles.callPromptTitle}>Start Doctor Call</Text>
                <Text style={styles.callPromptText}>
                  Start the unplanned call first. After the call is completed, you can add the new doctor details.
                </Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <AppButton
                label="Cancel"
                variant="secondary"
                onPress={closePicker}
                style={styles.modalButton}
              />
              <AppButton
                label={
                  pickerMode === 'new'
                    ? (newDoctorCallCompleted ? 'Add Doctor' : 'Start Doctor Call')
                    : 'Add'
                }
                onPress={
                  pickerMode === 'new'
                    ? (newDoctorCallCompleted ? (canAddDoctor ? addSelectedDoctor : undefined) : startNewDoctorCall)
                    : (canAddDoctor ? addSelectedDoctor : undefined)
                }
                icon={
                  pickerMode === 'new' && !newDoctorCallCompleted
                    ? <Ionicons name="call-outline" size={20} color={Colors.textOnDark} />
                    : <Ionicons name="add" size={20} color={Colors.textOnDark} />
                }
                style={[
                  styles.modalButton,
                  pickerMode === 'new' && !newDoctorCallCompleted && styles.startCallButton,
                  pickerMode !== 'new' && !canAddDoctor && styles.modalButtonDisabled,
                  pickerMode === 'new' && newDoctorCallCompleted && !canAddDoctor && styles.modalButtonDisabled,
                ]}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  addButton: {
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  addButtonText: {
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    width: '100%',
    maxWidth: 430,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    padding: 18,
    gap: 14,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 18,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 10,
    backgroundColor: '#EEF2F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenModeButton: {
    display: 'none',
  },
  modeButtonActive: {
    backgroundColor: Colors.primary,
  },
  modeText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '800',
  },
  modeTextActive: {
    color: Colors.textOnDark,
  },
  dropdownBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  dropdownLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  optionsList: {
    padding: 8,
    gap: 8,
  },
  optionsScroll: {
    maxHeight: 260,
  },
  optionRow: {
    minHeight: 58,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  optionRowSelected: {
    backgroundColor: Colors.primaryLight,
  },
  optionName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  optionMeta: {
    color: Colors.textMuted,
    fontSize: 14,
    marginTop: 3,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
    padding: 12,
    textAlign: 'center',
  },
  form: {
    gap: 10,
  },
  input: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  addressInput: {
    minHeight: 78,
    paddingTop: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 10,
  },
  modalButtonDisabled: {
    opacity: 0.45,
  },
  callPromptBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  callPromptTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  callPromptText: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  startCallButton: {
    backgroundColor: Colors.primary,
  },
});
