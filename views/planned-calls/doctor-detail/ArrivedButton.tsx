import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface ArrivedButtonProps {
  onPress?: () => void;
  arrived?: boolean;
}

export function ArrivedButton({ onPress, arrived = false }: ArrivedButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, arrived && styles.arrivedActive, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.iconWrapper}>
        <Ionicons name="location-outline" size={26} color={Colors.primary} />
      </View>
      <Text style={[styles.label, arrived && styles.labelActive]}>ARRIVED</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  arrivedActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryLight,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(43,115,184,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1.5,
  },
  labelActive: {
    color: Colors.primary,
  },
});
