import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface StartCallButtonProps {
  enabled?: boolean;
  onPress?: () => void;
}

export function StartCallButton({ enabled = false, onPress }: StartCallButtonProps) {
  return (
    <Pressable
      onPress={enabled ? onPress : undefined}
      style={({ pressed }) => [
        styles.button,
        !enabled && styles.disabled,
        enabled && pressed && { opacity: 0.85 },
      ]}
    >
      <View style={styles.iconWrapper}>
        <Ionicons
          name="play"
          size={26}
          color={enabled ? '#FFFFFF' : 'rgba(255,255,255,0.4)'}
        />
      </View>
      <Text style={[styles.label, !enabled && styles.labelDisabled]}>
        START DOCTOR CALL
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2EAF72',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#2EAF72',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  disabled: {
    backgroundColor: '#A8C5B5',
    borderWidth: 2,
    borderColor: '#2EAF72',
    shadowOpacity: 0,
    elevation: 0,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  labelDisabled: {
    color: 'rgba(255,255,255,0.6)',
  },
});
