import { AppBarChart, BarChartDataPoint } from '@/components/ui/AppBarChart';
import { AppButton } from '@/components/ui/AppButton';
import { AppBottomSheetSelect } from '@/components/ui/AppBottomSheetSelect';
import { AppLineChart, LineChartDataPoint } from '@/components/ui/AppLineChart';
import { AppMetricCard } from '@/components/ui/AppMetricCard';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const metrics = [
  { label: 'Total Calls', value: '284', change: '+12', tone: 'positive' },
  { label: 'Avg Duration', value: '14m', change: '-2%', tone: 'negative' },
  { label: 'Goal Completion', value: '92%', change: '+5%', tone: 'positive' },
  { label: 'Doctor Rating', value: '4.8', change: '+0.2', tone: 'positive' },
] as const;

const callVolumeData: LineChartDataPoint[] = [
  { label: 'Jan', value: 45 },
  { label: 'Feb', value: 52 },
  { label: 'Mar', value: 60 },
  { label: 'Apr', value: 48 },
  { label: 'May', value: 70 },
  { label: 'Jun', value: 66 },
];

const specialtyData: BarChartDataPoint[] = [
  { label: 'Cardio', value: 45 },
  { label: 'Neuro', value: 32 },
  { label: 'GP', value: 28 },
  { label: 'Pedia', value: 24 },
  { label: 'Ortho', value: 18 },
];

const rfiData = {
  planned: 320,
  completed: 284,
};

const periodOptions = ['This Month', 'Last Month', 'This Quarter', 'This Year'];

export default function AnalyticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState(periodOptions[0]);
  const outstandingCalls = Math.max(0, rfiData.planned - rfiData.completed);
  const rfiCompletion = rfiData.planned > 0
    ? Math.round((rfiData.completed / rfiData.planned) * 100)
    : 0;

  return (
    <ScreenLayout
      title="Analytics & Reports"
      subtitle="Deep dive into your field performance metrics"
      contentStyle={styles.content}
    >
      <View style={styles.headerActions}>
        <View style={styles.periodSelectWrap}>
          <AppBottomSheetSelect
            options={periodOptions}
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            placeholder="Select period"
            title="Select Period"
            searchable={false}
            chevronColor={Colors.primary}
            triggerStyle={styles.periodButton}
            triggerContentStyle={styles.periodButtonContent}
            triggerTextStyle={styles.periodButtonText}
          />
        </View>
        <View style={styles.exportButtonWrap}>
          <AppButton
            label="Export PDF"
            style={styles.exportButton}
            textStyle={styles.exportButtonText}
            icon={<Ionicons name="download-outline" size={16} color={Colors.textOnDark} />}
          />
        </View>
      </View>

      <View style={styles.metricsGrid}>
        {metrics.map((metric) => (
          <AppMetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            pill={metric.change}
            tone={metric.tone}
          />
        ))}
      </View>

      <View style={styles.rfiCard}>
        <View style={styles.rfiHeader}>
          <View style={styles.rfiTitleRow}>
            <Ionicons name="swap-horizontal-outline" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>RFI</Text>
            <Text style={styles.rfiSubtitle}>(Plan / Completed)</Text>
          </View>
        </View>
        <View style={styles.rfiStatsRow}>
          <View style={styles.rfiStatBox}>
            <Text style={styles.rfiStatLabel}>Planned</Text>
            <Text style={styles.rfiStatValue}>{rfiData.planned}</Text>
          </View>
          <View style={styles.rfiStatBox}>
            <Text style={styles.rfiStatLabel}>Completed</Text>
            <Text style={styles.rfiStatValue}>{rfiData.completed}</Text>
          </View>
        </View>

        <View style={styles.rfiProgressBlock}>
          <View style={styles.rfiProgressHeader}>
            <Text style={styles.rfiProgressLabel}>Completion Progress</Text>
            <Text style={styles.rfiProgressValue}>{rfiCompletion}%</Text>
          </View>
          <View style={styles.rfiTrack}>
            <View style={[styles.rfiFill, { width: `${rfiCompletion}%` }]} />
          </View>
        </View>

        <View style={styles.rfiFooterRow}>
          <View style={styles.rfiFooterPill}>
            <Text style={styles.rfiFooterPillText}>{outstandingCalls} Remaining</Text>
          </View>
          <Text style={styles.rfiFooterText}>
            {rfiData.completed} of {rfiData.planned} planned calls completed
          </Text>
        </View>
      </View>

      <View style={styles.chartsGrid}>
        <View style={styles.chartCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up-outline" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Call Volume vs Goal</Text>
          </View>
          <View style={styles.lineChartWrapper}>
            <AppLineChart data={callVolumeData} goal={50} maxValue={80} height={230} />
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people-outline" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Specialty Distribution</Text>
          </View>
          <View style={styles.barChartWrapper}>
            <AppBarChart
              data={specialtyData}
              barColor={Colors.primary}
              height={210}
              maxValue={60}
              showYAxis
            />
          </View>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
    paddingBottom: 36,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'stretch',
  },
  periodSelectWrap: {
    flex: 1,
    flexBasis: 0,
  },
  periodButton: {
    width: '100%',
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
  },
  periodButtonContent: {
    justifyContent: 'center',
    gap: 6,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  exportButtonWrap: {
    flex: 1,
    flexBasis: 0,
  },
  exportButton: {
    width: '100%',
    minHeight: 40,
    borderRadius: 12,
    paddingVertical: 8,
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  metricsGrid: {
    gap: 12,
  },
  chartsGrid: {
    gap: 16,
  },
  rfiCard: {
    borderRadius: 18,
    backgroundColor: Colors.surface,
    padding: 18,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  rfiHeader: {
    gap: 6,
  },
  chartCard: {
    borderRadius: 18,
    backgroundColor: Colors.surface,
    padding: 18,
    minHeight: 330,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
  },
  rfiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rfiSubtitle: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  rfiStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rfiStatBox: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 6,
  },
  rfiStatLabel: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  rfiStatValue: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  rfiProgressBlock: {
    gap: 8,
  },
  rfiProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rfiProgressLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  rfiProgressValue: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  rfiTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  rfiFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  rfiFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  rfiFooterPill: {
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  rfiFooterPillText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  rfiFooterText: {
    flex: 1,
    textAlign: 'right',
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  lineChartWrapper: {
    marginTop: 20,
  },
  barChartWrapper: {
    marginTop: 32,
  },
});
