import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/theme';
import type { CallKind } from './callTypes';

const CALL_KINDS: {
  key: CallKind;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'chamber', label: 'Chamber', icon: 'person-outline' },
  { key: 'group', label: 'Group', icon: 'people-outline' },
  { key: 'parking', label: 'Parking', icon: 'car-outline' },
];

interface CallKindSelectorProps {
  value: CallKind;
  onChange: (kind: CallKind) => void;
  style?: ViewStyle;
}

/**
 * Chamber / Group / Parking. Shown for both territory and institution modes —
 * a rep can make any of the three from either.
 */
export function CallKindSelector({ value, onChange, style }: CallKindSelectorProps) {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.cardLabel}>Call Type</Text>
      <View style={styles.segment}>
        {CALL_KINDS.map((option) => {
          const isActive = option.key === value;
          return (
            <Pressable
              key={option.key}
              onPress={() => onChange(option.key)}
              style={({ pressed }) => [
                styles.segmentButton,
                isActive && styles.segmentButtonActive,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={option.icon}
                size={20}
                color={isActive ? Colors.textOnDark : Colors.primary}
              />
              <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    gap: 10,
  },
  // Icon over label, so three fit across a narrow phone without truncating.
  segmentButton: {
    flex: 1,
    minHeight: 68,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  segmentButtonActive: {
    backgroundColor: Colors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
  segmentText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  segmentTextActive: {
    color: Colors.textOnDark,
  },
});
