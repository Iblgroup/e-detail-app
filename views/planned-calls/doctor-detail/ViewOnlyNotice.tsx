import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';

/**
 * Shown in place of the Arrived / Start Call buttons when the detail screen was
 * opened from the Doctor List, which is a reference view — calls are made from
 * Call Reporting.
 */
export function ViewOnlyNotice() {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrapper}>
        <Ionicons name="eye-outline" size={26} color={Colors.textMuted} />
      </View>
      <Text style={styles.label}>View Only</Text>
      <Text style={styles.hint}>Start calls from Call Reporting</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 130,
    borderRadius: 16,
    backgroundColor: '#E7ECF3',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: Colors.textMuted,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  hint: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});
