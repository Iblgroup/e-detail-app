import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/theme';

export interface SegmentedOption<T extends string> {
  key: T;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface AppSegmentedToggleProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (next: T) => void;
  style?: ViewStyle;
}

/**
 * A compact switch between views: a soft track with the active option riding in
 * it as a filled pill. Sized to its labels and left-aligned rather than stretched
 * across the screen — it picks a view, so it shouldn't carry the visual weight of
 * a primary action.
 */
export function AppSegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  style,
}: AppSegmentedToggleProps<T>) {
  return (
    <View style={[styles.track, style]}>
      {options.map((option) => {
        const active = option.key === value;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={({ pressed }) => [
              styles.pill,
              active && styles.pillActive,
              pressed && !active && styles.pressed,
            ]}
          >
            {option.icon ? (
              <Ionicons
                name={option.icon}
                size={16}
                color={active ? Colors.textOnDark : Colors.textMuted}
              />
            ) : null}
            <Text
              style={[styles.label, active && styles.labelActive]}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    maxWidth: '100%',
    backgroundColor: '#EDF1F7',
    borderRadius: 999,
    padding: 4,
    gap: 4,
  },
  pill: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  labelActive: {
    color: Colors.textOnDark,
  },
});
