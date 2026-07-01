import { Colors } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
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
  { key: 'group', label: 'Group Call', icon: 'people-outline', disabled: true },
  { key: 'walking', label: 'Walking/Parking Call', icon: 'car-outline' },
];

export function InstitutionCallPanel() {
  const { user } = useAuth();
  const [callType, setCallType] = useState<InstitutionCallType>('walking');
  const [arrived, setArrived] = useState(false);

  const selected = CALL_TYPES.find((option) => option.key === callType);

  const handleStartCall = () => {
    router.push({
      pathname: '/call/[id]',
      params: {
        id: `institution-${callType}`,
        callType: 'planned',
        doctorName: `${selected?.label ?? 'Institution Call'}`,
        teamId: user?.teamId ? String(user.teamId) : undefined,
        institution: callType,
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
                onPress={() => setCallType(option.key)}
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

      <View style={styles.buttonsRow}>
        <View style={styles.buttonCellFull}>
          <ArrivedButton arrived={arrived} onPress={() => setArrived((value) => !value)} />
        </View>
        <View style={styles.buttonCellHalf}>
          <StartCallButton enabled={arrived} onPress={handleStartCall} />
        </View>
        <View style={styles.buttonCellHalf}>
          <CancelCallButton enabled={arrived} onPress={() => setArrived(false)} />
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
