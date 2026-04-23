import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { AppBarChart } from '@/components/ui/AppBarChart';
import { HighlightCard } from '@/components/ui/HighlightCard';
import { AppMetricCard } from '@/components/ui/AppMetricCard';
import { CallType } from '../callTypes';

interface CallAnalyticsProps {
  doctorName?: string;
  callType?: CallType;
  durationSeconds: number;
  slidesViewed: number;
  totalSlides: number;
  feedback: string;
  slideTimes: number[];
}

function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
}

function formatSlideTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  if (minutes === 0) return `${remainingSeconds}s`;

  return `${minutes}m ${remainingSeconds}s`;
}

function getDoctorInterest(feedback: string) {
  return feedback.trim().length > 0 && feedback !== 'No feedback provided' ? 'High' : 'Medium';
}

export default function CallAnalytics({
  doctorName,
  callType = 'planned',
  durationSeconds,
  slidesViewed,
  totalSlides,
  feedback,
  slideTimes,
}: CallAnalyticsProps) {
  const safeSlideTimes =
    slideTimes.length > 0 ? slideTimes : Array.from({ length: totalSlides }, () => 0);
  const completion = totalSlides > 0 ? Math.round((slidesViewed / totalSlides) * 100) : 0;
  const interest = getDoctorInterest(feedback);
  const slideTimeData = safeSlideTimes.map((seconds, index) => ({
    label: `Slide ${index + 1}`,
    value: seconds,
    valueLabel: `${seconds}s`,
  }));
  const slideTimeSummary = safeSlideTimes.map((seconds, index) => ({
    label: `Slide ${index + 1}`,
    valueLabel: formatSlideTime(seconds),
  }));

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerTopRow}>
            <Pressable
              onPress={() => router.replace('/(tabs)' as never)}
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            >
              <Ionicons name="chevron-back" size={20} color={Colors.textOnDark} />
            </Pressable>
          </View>
        </SafeAreaView>

        <View style={styles.headerTitleRow}>
          <View style={styles.headerIconCard}>
            <Ionicons name="stats-chart-outline" size={36} color={Colors.primary} />
          </View>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerTitle}>Call Analytics</Text>
            <Text style={styles.headerSubtitle}>
              Detailed {callType} report for {doctorName ? `${doctorName}'s` : 'your'} last visit
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.submittedBadge}>
          <Ionicons name="checkmark-circle-outline" size={18} color={Colors.success} />
          <Text style={styles.submittedText}>Report Submitted</Text>
        </View>

        <View style={styles.metricGrid}>
          <AppMetricCard
            icon="time-outline"
            accent={Colors.primary}
            label="Total Duration"
            value={formatDuration(durationSeconds)}
            pill="+12% vs avg"
          />
          <AppMetricCard
            icon="document-text-outline"
            accent="#8B5CF6"
            label="Slides Viewed"
            value={`${slidesViewed} / ${totalSlides}`}
            pill={`${completion}% completion`}
          />
          <AppMetricCard
            icon="ribbon-outline"
            accent="#F97316"
            label="Doctor Interest"
            value={interest}
            pill="Positive Feedback"
          />
        </View>

        <View style={styles.detailGrid}>
          <View style={[styles.card, styles.chartCard]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trending-up-outline" size={16} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Time Spent per Slide (Seconds)</Text>
            </View>

            <View style={styles.chartWrapper}>
              <AppBarChart
                data={slideTimeData}
                barColor={Colors.primary}
                height={116}
                showValueLabels
              />
            </View>

            <View style={styles.slideTimeList}>
              {slideTimeSummary.map((item) => (
                <View key={item.label} style={styles.slideTimeRow}>
                  <Text style={styles.slideTimeLabel}>{item.label}</Text>
                  <Text style={styles.slideTimeValue}>{item.valueLabel}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sideColumn}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Doctor&apos;s Feedback</Text>
              <View style={styles.feedbackBox}>
                <Text style={styles.feedbackText}>&ldquo;{feedback}&rdquo;</Text>
              </View>
            </View>

            <HighlightCard
              title="Next Steps"
              items={[
                'Send follow-up clinical study PDF',
                'Schedule next visit for March 15th',
                'Drop off samples on Friday',
              ]}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.secondary,
    paddingBottom: 50,
  },
  headerTopRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    gap: 14,
    marginTop: 8,
  },
  headerIconCard: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTextBlock: {
    flex: 1,
    paddingBottom: 6,
    gap: 2,
  },
  headerTitle: {
    color: Colors.textOnDark,
    fontSize: 22,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  scroll: {
    flex: 1,
    marginTop: -36,
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 36,
  },
  submittedBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  submittedText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  metricGrid: {
    gap: 14,
  },
  detailGrid: {
    gap: 16,
  },
  sideColumn: {
    gap: 16,
  },
  card: {
    borderRadius: 16,
    backgroundColor: Colors.surface,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  chartCard: {
    minHeight: 270,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  chartWrapper: {
    marginTop: 18,
  },
  slideTimeList: {
    marginTop: 18,
    gap: 10,
  },
  slideTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  slideTimeLabel: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  slideTimeValue: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  feedbackBox: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    padding: 20,
    marginTop: 20,
  },
  feedbackText: {
    color: Colors.text,
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '500',
    lineHeight: 21,
  },
});
