import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/theme';

export type TagTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

interface TagProps {
  label: string;
  /** Leading icon; takes the tone's text colour. */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Colour intent. Defaults to the soft brand tint. */
  tone?: TagTone;
  /** Outlined instead of filled — for secondary tags sitting next to a filled one. */
  outlined?: boolean;
  style?: StyleProp<ViewStyle>;
}

const TONES: Record<TagTone, { background: string; text: string; border: string }> = {
  neutral: {
    background: Colors.background,
    text: Colors.textMuted,
    border: Colors.border,
  },
  primary: {
    background: Colors.primaryLight,
    text: Colors.secondary,
    border: Colors.primaryLight,
  },
  success: {
    background: Colors.successBg,
    text: Colors.success,
    border: Colors.successBg,
  },
  // Amber — work still outstanding, not an error.
  warning: {
    background: '#FEF3C7',
    text: '#B45309',
    border: '#FEF3C7',
  },
  danger: {
    background: Colors.dangerBg,
    text: Colors.danger,
    border: Colors.danger,
  },
};

/**
 * A small boxed label — specialty, class, status. Square-ish corners (6px) so it
 * reads as a tag rather than a chip or a button.
 */
export function Tag({
  label,
  icon,
  tone = 'primary',
  outlined = false,
  style,
}: TagProps) {
  const palette = TONES[tone];

  return (
    <View
      style={[
        styles.tag,
        {
          backgroundColor: outlined ? 'transparent' : palette.background,
          borderColor: palette.border,
        },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={12} color={palette.text} /> : null}
      <Text style={[styles.label, { color: palette.text }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    flexShrink: 1,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
