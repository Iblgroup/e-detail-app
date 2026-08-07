import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

// 'neutral' is for figures that aren't good or bad news — progress through a
// target, say, which is simply low early in the month.
type MetricTone = 'positive' | 'negative' | 'neutral';

interface AppMetricCardProps {
  label: string;
  value: string;
  pill?: string;
  tone?: MetricTone;
  icon?: keyof typeof Ionicons.glyphMap;
  accent?: string;
  style?: StyleProp<ViewStyle>;
}

export function AppMetricCard({
  label,
  value,
  pill,
  tone = 'positive',
  icon,
  accent = Colors.primary,
  style,
}: AppMetricCardProps) {
  const pillStyle = {
    positive: styles.pillPositive,
    negative: styles.pillNegative,
    neutral: styles.pillNeutral,
  }[tone];
  const pillTextStyle = {
    positive: styles.pillTextPositive,
    negative: styles.pillTextNegative,
    neutral: styles.pillTextNeutral,
  }[tone];

  return (
    <View style={[styles.card, style]}>
      {icon && (
        <View style={[styles.iconBox, { backgroundColor: `${accent}12` }]}>
          <Ionicons name={icon} size={20} color={accent} />
        </View>
      )}

      <Text style={styles.label}>{label}</Text>

      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {pill && (
          <View style={[styles.pill, pillStyle]}>
            <Text style={[styles.pillText, pillTextStyle]}>{pill}</Text>
          </View>
        )}
      </View>
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
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  label: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    lineHeight: 18,
    // Reserve two lines so cards with a wrapping label (e.g. "Goal Completion")
    // stay the same height and their values line up with the single-line cards.
    minHeight: 36,
    marginBottom: 6,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
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
  // Same blue chip the Call Reporting header uses for its count.
  pillNeutral: {
    backgroundColor: Colors.primaryLight,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '800',
  },
  pillTextPositive: {
    color: Colors.success,
  },
  pillTextNegative: {
    color: Colors.danger,
  },
  pillTextNeutral: {
    color: Colors.secondary,
  },
});
