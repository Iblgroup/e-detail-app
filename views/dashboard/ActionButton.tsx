import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/theme';

interface ActionButtonProps {
  label: string;
  icon: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export function ActionButton({ label, icon, onPress, style }: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
    >
      {icon}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(43,115,184,0.2)',
  },
  pressed: {
    opacity: 0.75,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
});
