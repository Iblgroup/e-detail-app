import { AppBarChart, BarChartDataPoint } from '@/components/ui/AppBarChart';
import { AppCalendarSheet } from '@/components/ui/AppCalendarSheet';
import { AppButton } from '@/components/ui/AppButton';
import { AppChartCard } from '@/components/ui/AppChartCard';
import { AppLineChart, LineChartDataPoint } from '@/components/ui/AppLineChart';
import { AppMetricCard } from '@/components/ui/AppMetricCard';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Colors } from '@/constants/theme';
import { exportAnalyticsPdf } from '@/lib/analytics/exportPdf';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

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

function formatRangeLabel(start: Date, end: Date) {
  const opts: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const startText = start.toLocaleDateString(undefined, opts);
  const endText = end.toLocaleDateString(undefined, opts);
  return startText === endText ? startText : `${startText} – ${endText}`;
}

export default function AnalyticsScreen() {
  // Analytics is scoped to a date range (start → end); default to today.
  const [startDate, setStartDate] = useState(() => new Date());
  const [endDate, setEndDate] = useState(() => new Date());
  const [isExporting, setIsExporting] = useState(false);
  const outstandingCalls = Math.max(0, rfiData.planned - rfiData.completed);
  const rfiCompletion = rfiData.planned > 0
    ? Math.round((rfiData.completed / rfiData.planned) * 100)
    : 0;

  const handleExportPdf = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await exportAnalyticsPdf({
        dateLabel: formatRangeLabel(startDate, endDate),
        metrics,
        rfi: rfiData,
        specialty: specialtyData,
      });
    } catch (error) {
      console.log('[analytics] PDF export failed', error);
      Alert.alert('Export failed', 'Could not generate the PDF report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ScreenLayout
      title="Analytics & Reports"
      subtitle="Deep dive into your field performance metrics"
      contentStyle={styles.content}
    >
      <View style={styles.headerActions}>
        <View style={styles.datesGroup}>
          <View style={styles.dateFieldWrap}>
            <Text style={styles.dateFieldLabel}>Start Date</Text>
            <AppCalendarSheet
              value={startDate}
              onChange={(next) => {
                setStartDate(next);
                // Keep the range valid: pull the end up if it fell behind.
                if (next > endDate) setEndDate(next);
              }}
              title="Select Start Date"
              chevronColor={Colors.primary}
              triggerStyle={styles.periodButton}
              triggerContentStyle={styles.periodButtonContent}
              triggerTextStyle={styles.periodButtonText}
            />
          </View>
          <View style={styles.dateFieldWrap}>
            <Text style={styles.dateFieldLabel}>End Date</Text>
            <AppCalendarSheet
              value={endDate}
              onChange={(next) => {
                setEndDate(next);
                // Keep the range valid: pull the start back if it overtook.
                if (next < startDate) setStartDate(next);
              }}
              title="Select End Date"
              chevronColor={Colors.primary}
              triggerStyle={styles.periodButton}
              triggerContentStyle={styles.periodButtonContent}
              triggerTextStyle={styles.periodButtonText}
            />
          </View>
        </View>
        <View style={styles.exportFieldWrap}>
          <Text style={styles.dateFieldLabel} />
          <AppButton
            label={isExporting ? 'Preparing…' : 'Export PDF'}
            onPress={handleExportPdf}
            style={styles.exportButton}
            textStyle={styles.exportButtonText}
            icon={<Ionicons name="download-outline" size={20} color={Colors.textOnDark} />}
          />
        </View>
      </View>

      <View style={styles.metricsGrid}>
        {metrics.map((metric) => (
          <View key={metric.label} style={styles.metricCell}>
            <AppMetricCard
              label={metric.label}
              value={metric.value}
              pill={metric.change}
              tone={metric.tone}
            />
          </View>
        ))}
      </View>

      <View style={styles.rfiCard}>
        <View style={styles.rfiHeader}>
          <View style={styles.rfiTitleRow}>
            <Ionicons name="swap-horizontal-outline" size={20} color={Colors.primary} />
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
        <AppChartCard
          title="Call Volume vs Goal"
          icon={<Ionicons name="trending-up-outline" size={20} color={Colors.primary} />}
          chartWrapperStyle={styles.lineChartWrapper}
          style={styles.chartCard}
        >
            <AppLineChart data={callVolumeData} goal={50} maxValue={80} height={230} />
        </AppChartCard>

        <AppChartCard
          title="Specialty Distribution"
          icon={<Ionicons name="people-outline" size={20} color={Colors.primary} />}
          chartWrapperStyle={styles.barChartWrapper}
          style={styles.chartCard}
        >
            <AppBarChart
              data={specialtyData}
              barColor={Colors.primary}
              height={210}
              maxValue={60}
              showYAxis
            />
        </AppChartCard>
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
    alignItems: 'flex-end',
  },
  // Left 50%: the two date pickers share this half.
  datesGroup: {
    flex: 1,
    flexBasis: 0,
    flexDirection: 'row',
    gap: 12,
  },
  dateFieldWrap: {
    flex: 1,
    flexBasis: 0,
    gap: 6,
  },
  // Right 50%: the export button.
  exportFieldWrap: {
    flex: 1,
    flexBasis: 0,
    gap: 6,
  },
  dateFieldLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginLeft: 2,
    minHeight: 15,
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
    flexDirection: 'row',
    gap: 12,
  },
  metricCell: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
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
    minHeight: 330,
  },
  rfiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
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
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: '800',
  },
  rfiFooterText: {
    flex: 1,
    textAlign: 'right',
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  lineChartWrapper: {
    marginTop: 20,
  },
  barChartWrapper: {
    marginTop: 32,
  },
});
