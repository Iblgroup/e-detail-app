import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppBarChart, BarChartDataPoint } from '@/components/ui/AppBarChart';
import { AppButton } from '@/components/ui/AppButton';
import { AppLineChart, LineChartDataPoint } from '@/components/ui/AppLineChart';
import { AppMetricCard } from '@/components/ui/AppMetricCard';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Colors } from '@/constants/theme';

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
const periodOptions = ['This Month', 'Last Month', 'This Quarter', 'This Year'];

export default function AnalyticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState(periodOptions[0]);
  const [periodMenuVisible, setPeriodMenuVisible] = useState(false);

  const selectPeriod = (period: string) => {
    setSelectedPeriod(period);
    setPeriodMenuVisible(false);
  };

  return (
    <ScreenLayout
      title="Analytics & Reports"
      subtitle="Deep dive into your field performance metrics"
      contentStyle={styles.content}
    >
      <View style={styles.headerActions}>
        <AppButton
          label={selectedPeriod}
          onPress={() => setPeriodMenuVisible(true)}
          variant="outline"
          style={styles.periodButton}
          textStyle={styles.periodButtonText}
          icon={<Ionicons name="chevron-down" size={14} color={Colors.primary} />}
        />
        <AppButton
          label="Export PDF"
          style={styles.exportButton}
          textStyle={styles.exportButtonText}
          icon={<Ionicons name="download-outline" size={16} color={Colors.textOnDark} />}
        />
      </View>

      <Modal
        visible={periodMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPeriodMenuVisible(false)}
      >
        <Pressable style={styles.dropdownBackdrop} onPress={() => setPeriodMenuVisible(false)}>
          <View style={styles.periodMenu}>
            {periodOptions.map((period) => {
              const selected = period === selectedPeriod;

              return (
                <Pressable
                  key={period}
                  onPress={() => selectPeriod(period)}
                  style={[styles.periodOption, selected && styles.periodOptionSelected]}
                >
                  <Text style={[styles.periodOptionText, selected && styles.periodOptionTextSelected]}>
                    {period}
                  </Text>
                  {selected && (
                    <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>

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
  },
  periodButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    paddingVertical: 8,
    flexDirection: 'row-reverse',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  exportButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    paddingVertical: 8,
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  dropdownBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
    paddingHorizontal: 16,
    paddingTop: 142,
  },
  periodMenu: {
    alignSelf: 'flex-start',
    width: 220,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    padding: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 8,
  },
  periodOption: {
    minHeight: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  periodOptionSelected: {
    backgroundColor: Colors.primaryLight,
  },
  periodOptionText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  periodOptionTextSelected: {
    color: Colors.primary,
  },
  metricsGrid: {
    gap: 12,
  },
  chartsGrid: {
    gap: 16,
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
  lineChartWrapper: {
    marginTop: 20,
  },
  barChartWrapper: {
    marginTop: 32,
  },
});
