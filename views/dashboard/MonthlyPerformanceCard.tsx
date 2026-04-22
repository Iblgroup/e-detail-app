import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { AppBarChart, BarChartDataPoint } from '@/components/ui/AppBarChart';

interface MonthlyPerformanceCardProps {
  data?: BarChartDataPoint[];
  totalCalls?: number;
  changePercent?: number;
}

const defaultData: BarChartDataPoint[] = [
  { label: 'Week 1', value: 40 },
  { label: 'Week 2', value: 55 },
  { label: 'Week 3', value: 48 },
  { label: 'Week 4', value: 70 },
];

export function MonthlyPerformanceCard({
  data = defaultData,
  totalCalls = 60,
  changePercent = 15,
}: MonthlyPerformanceCardProps) {
  const isPositive = changePercent >= 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Monthly Performance</Text>
      <View style={styles.chartWrapper}>
        <AppBarChart data={data} barColor={Colors.primary} height={80} />
      </View>
      <View style={styles.footer}>
        <View>
          <Text style={styles.totalNumber}>{totalCalls}</Text>
          <Text style={styles.totalLabel}>TOTAL CALLS</Text>
        </View>
        <View style={[styles.badge, isPositive ? styles.badgeGreen : styles.badgeRed]}>
          <Ionicons
            name={isPositive ? 'trending-up' : 'trending-down'}
            size={12}
            color={isPositive ? Colors.success : Colors.danger}
          />
          <Text style={[styles.badgeText, isPositive ? styles.badgeTextGreen : styles.badgeTextRed]}>
            {isPositive ? '+' : ''}{changePercent}% vs last month
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  chartWrapper: {
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  totalNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 32,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeGreen: {
    backgroundColor: Colors.successBg,
  },
  badgeRed: {
    backgroundColor: Colors.dangerBg,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextGreen: {
    color: Colors.success,
  },
  badgeTextRed: {
    color: Colors.danger,
  },
});
