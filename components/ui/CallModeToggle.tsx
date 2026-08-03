import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/theme';
import { useCallMode, type CallMode } from '@/lib/settings/callModeStore';

const CALL_MODE_OPTIONS: {
  key: CallMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'territory', label: 'Territory', icon: 'map-outline' },
  { key: 'institution', label: 'Institution', icon: 'business-outline' },
];

interface CallModeToggleProps {
  /** Optional line of copy above the buttons (Settings shows one, the list doesn't). */
  hint?: string;
  style?: ViewStyle;
}

/**
 * Territory / Institution switch for planned calls. Backed by the shared
 * callModeStore, so the Settings copy and the Call Reporting copy always agree.
 */
export function CallModeToggle({ hint, style }: CallModeToggleProps) {
  const { callMode, setCallMode } = useCallMode();

  return (
    <View style={[styles.wrapper, style]}>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <View style={styles.segment}>
        {CALL_MODE_OPTIONS.map((option) => {
          const active = callMode === option.key;
          return (
            <Pressable
              key={option.key}
              onPress={() => setCallMode(option.key)}
              style={({ pressed }) => [
                styles.segmentButton,
                active && styles.segmentButtonActive,
                pressed && styles.segmentPressed,
              ]}
            >
              <Ionicons
                name={option.icon}
                size={18}
                color={active ? Colors.textOnDark : Colors.primary}
              />
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
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
  wrapper: {
    gap: 10,
  },
  hint: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  segment: {
    flexDirection: 'row',
    gap: 12,
  },
  segmentButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
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
  segmentPressed: {
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
});
