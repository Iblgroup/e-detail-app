import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

type MetricTone = 'positive' | 'negative';

interface AppMetricCardProps {
  label: string;
  value: string;
  pill?: string;
  tone?: MetricTone;
  icon?: keyof typeof Ionicons.glyphMap;
  accent?: string;
}

export function AppMetricCard({
  label,
  value,
  pill,
  tone = 'positive',
  icon,
  accent = Colors.primary,
}: AppMetricCardProps) {
  const isPositive = tone === 'positive';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        {icon ? (
          <View style={[styles.iconBox, { backgroundColor: `${accent}12` }]}>
            <Ionicons name={icon} size={19} color={accent} />
          </View>
        ) : (
          <Text style={styles.label}>{label}</Text>
        )}

        {pill && (
          <View style={[styles.pill, isPositive ? styles.pillPositive : styles.pillNegative]}>
            <Text style={[styles.pillText, isPositive ? styles.pillTextPositive : styles.pillTextNegative]}>
              {pill}
            </Text>
          </View>
        )}
      </View>

      {icon && <Text style={styles.label}>{label}</Text>}
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: Colors.surface,
    padding: 16,
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    minHeight: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 6,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  value: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '800',
  },
  pill: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    alignItems: 'center',
  },
  pillPositive: {
    backgroundColor: Colors.successBg,
  },
  pillNegative: {
    backgroundColor: Colors.dangerBg,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  pillTextPositive: {
    color: Colors.success,
  },
  pillTextNegative: {
    color: Colors.danger,
  },
});
