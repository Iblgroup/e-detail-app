import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';

export function CallCompletedCard() {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrapper}>
        <Ionicons name="checkmark-circle-outline" size={30} color={Colors.textMuted} />
      </View>
      <Text style={styles.label}>Call Completed</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 140,
    borderRadius: 16,
    backgroundColor: '#E7ECF3',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  iconWrapper: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: Colors.textMuted,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
