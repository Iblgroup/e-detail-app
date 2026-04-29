import { AppBarChart, BarChartDataPoint } from '@/components/ui/AppBarChart';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type PerformancePeriod = 'monthly' | 'weekly' | 'daily';

interface PerformancePeriodConfig {
  data: BarChartDataPoint[];
  totalCalls: number;
  changePercent: number;
}

interface MonthlyPerformanceCardProps {
  data?: BarChartDataPoint[];
  totalCalls?: number;
  changePercent?: number;
  periodData?: Partial<Record<PerformancePeriod, PerformancePeriodConfig>>;
  initialPeriod?: PerformancePeriod;
}

const DEFAULT_PERIOD_DATA: Record<PerformancePeriod, PerformancePeriodConfig> = {
  monthly: {
    data: [
      { label: 'Week 1', value: 12 },
      { label: 'Week 2', value: 14 },
      { label: 'Week 3', value: 13 },
      { label: 'Week 4', value: 21 },
    ],
    totalCalls: 60,
    changePercent: 15,
  },
  weekly: {
    data: [
      { label: 'Mon', value: 6 },
      { label: 'Tue', value: 7 },
      { label: 'Wed', value: 8 },
      { label: 'Thu', value: 9 },
      { label: 'Fri', value: 10 },
      { label: 'Sat', value: 5 },
      { label: 'Sun', value: 4 },
    ],
    totalCalls: 49,
    changePercent: 12,
  },
  daily: {
    data: [
      { label: '9 AM', value: 1 },
      { label: '11 AM', value: 2 },
      { label: '1 PM', value: 3 },
      { label: '3 PM', value: 2 },
      { label: '5 PM', value: 4 },
    ],
    totalCalls: 12,
    changePercent: 9,
  },
};

const PERIOD_META = {
  monthly: {
    buttonLabel: 'Month',
    title: 'Monthly Performance',
    compareLabel: 'last month',
  },
  weekly: {
    buttonLabel: 'Week',
    title: 'Weekly Performance',
    compareLabel: 'last week',
  },
  daily: {
    buttonLabel: 'Day',
    title: 'Daily Performance',
    compareLabel: 'yesterday',
  },
} as const;

export function MonthlyPerformanceCard({
  data = DEFAULT_PERIOD_DATA.monthly.data,
  totalCalls = DEFAULT_PERIOD_DATA.monthly.totalCalls,
  changePercent = DEFAULT_PERIOD_DATA.monthly.changePercent,
  periodData,
  initialPeriod = 'monthly',
}: MonthlyPerformanceCardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PerformancePeriod>(initialPeriod);

  const performanceByPeriod = useMemo<Record<PerformancePeriod, PerformancePeriodConfig>>(
    () => ({
      monthly: {
        data: periodData?.monthly?.data ?? data,
        totalCalls: periodData?.monthly?.totalCalls ?? totalCalls,
        changePercent: periodData?.monthly?.changePercent ?? changePercent,
      },
      weekly: {
        data: periodData?.weekly?.data ?? DEFAULT_PERIOD_DATA.weekly.data,
        totalCalls: periodData?.weekly?.totalCalls ?? DEFAULT_PERIOD_DATA.weekly.totalCalls,
        changePercent:
          periodData?.weekly?.changePercent ?? DEFAULT_PERIOD_DATA.weekly.changePercent,
      },
      daily: {
        data: periodData?.daily?.data ?? DEFAULT_PERIOD_DATA.daily.data,
        totalCalls: periodData?.daily?.totalCalls ?? DEFAULT_PERIOD_DATA.daily.totalCalls,
        changePercent:
          periodData?.daily?.changePercent ?? DEFAULT_PERIOD_DATA.daily.changePercent,
      },
    }),
    [changePercent, data, periodData, totalCalls]
  );

  const activePeriod = performanceByPeriod[selectedPeriod];
  const activeMeta = PERIOD_META[selectedPeriod];
  const isPositive = activePeriod.changePercent >= 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{activeMeta.title}</Text>
        <View style={styles.segmentedControl}>
          {(Object.keys(PERIOD_META) as PerformancePeriod[]).map((period) => {
            const isActive = period === selectedPeriod;

            return (
              <Pressable
                key={period}
                style={[styles.segmentButton, isActive && styles.segmentButtonActive]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    isActive && styles.segmentButtonTextActive,
                  ]}
                >
                  {PERIOD_META[period].buttonLabel}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.chartWrapper}>
        <AppBarChart data={activePeriod.data} barColor={Colors.primary} height={80} />
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.totalNumber}>{activePeriod.totalCalls}</Text>
          <Text style={styles.totalLabel}>TOTAL CALLS</Text>
        </View>
        <View style={[styles.badge, isPositive ? styles.badgeGreen : styles.badgeRed]}>
          <Ionicons
            name={isPositive ? 'trending-up' : 'trending-down'}
            size={12}
            color={isPositive ? Colors.success : Colors.danger}
          />
          <Text
            style={[styles.badgeText, isPositive ? styles.badgeTextGreen : styles.badgeTextRed]}
          >
            {isPositive ? '+' : ''}
            {activePeriod.changePercent}% vs {activeMeta.compareLabel}
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
    boxShadow: '0px 1px 4px rgba(43, 115, 184, 0.08)',
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  segmentedControl: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  segmentButton: {
    minWidth: 56,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: Colors.primary,
  },
  segmentButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  segmentButtonTextActive: {
    color: Colors.textOnDark,
  },
  chartWrapper: {
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
    gap: 12,
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
