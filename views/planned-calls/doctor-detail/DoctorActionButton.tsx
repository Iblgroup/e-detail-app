import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ButtonVariant = 'outline' | 'filled' | 'danger';

interface DoctorActionButtonProps {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  enabled?: boolean;
  active?: boolean;
  variant?: ButtonVariant;
}

export function DoctorActionButton({
  label,
  iconName,
  onPress,
  enabled = true,
  active = false,
  variant = 'outline',
}: DoctorActionButtonProps) {
  // Disabled looks the same for every variant: flat gray. A washed-out green or
  // red still read as a live button, so reps tapped Start before arriving.
  const iconColor = !enabled
    ? Colors.disabledText
    : variant === 'outline'
      ? Colors.primary
      : '#FFFFFF';

  return (
    <Pressable
      disabled={!enabled}
      onPress={enabled ? onPress : undefined}
      style={({ pressed }) => [
        styles.button,
        variant === 'outline' && styles.outlineButton,
        variant === 'filled' && styles.filledButton,
        variant === 'danger' && styles.dangerButton,
        active && variant === 'outline' && styles.outlineButtonActive,
        // Last, so it overrides whichever variant painted the button.
        !enabled && styles.disabledButton,
        pressed && enabled && styles.buttonPressed,
      ]}
    >
      <View
        style={[
          styles.iconWrapper,
          variant === 'filled' && styles.filledIconWrapper,
          variant === 'danger' && styles.dangerIconWrapper,
          !enabled && styles.disabledIconWrapper,
        ]}
      >
        <Ionicons name={iconName} size={26} color={iconColor} />
      </View>
      <Text
        style={[
          styles.label,
          variant === 'outline' && styles.outlineLabel,
          variant === 'filled' && styles.filledLabel,
          variant === 'danger' && styles.dangerLabel,
          !enabled && styles.disabledLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  outlineButton: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  outlineButtonActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryLight,
  },
  filledButton: {
    backgroundColor: '#2EAF72',
    shadowColor: '#2EAF72',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  dangerButton: {
    backgroundColor: '#D92D20',
    shadowColor: '#D92D20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  // One neutral disabled skin for outline, filled and danger alike.
  disabledButton: {
    backgroundColor: Colors.disabledBg,
    borderWidth: 1,
    borderColor: Colors.disabledBorder,
    shadowOpacity: 0,
    elevation: 0,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(43,115,184,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledIconWrapper: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dangerIconWrapper: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  disabledIconWrapper: {
    backgroundColor: 'rgba(107,114,128,0.12)',
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  outlineLabel: {
    color: Colors.primary,
  },
  filledLabel: {
    color: '#FFFFFF',
  },
  dangerLabel: {
    color: '#FFFFFF',
  },
  disabledLabel: {
    color: Colors.disabledText,
  },
});
