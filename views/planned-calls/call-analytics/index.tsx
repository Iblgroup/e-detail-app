import { AppBarChart } from '@/components/ui/AppBarChart';
import { AppMetricCard } from '@/components/ui/AppMetricCard';
import { Colors } from '@/constants/theme';
import { queueReturnToNewDoctor } from '@/views/unplanned-calls/returnToNewDoctorStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CallType } from '../callTypes';

interface CallAnalyticsProps {
  doctorName?: string;
  callType?: CallType;
  durationSeconds: number;
  slidesViewed: number;
  totalSlides: number;
  feedback: string;
  doctorInterest?: 'High' | 'Medium' | 'Low';
  slideTimes: number[];
  slideLabels?: string[];
  returnToNewDoctor?: boolean;
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

function getBrandLabel(index: number) {
  return `Brand ${index + 1}`;
}

function getSlideLabel(labels: string[] | undefined, index: number) {
  return labels?.[index] || getBrandLabel(index);
}

function splitSlideLabel(label: string) {
  if (label.includes(' - ')) {
    const [primary, ...rest] = label.split(' - ');
    return {
      primary: primary?.trim() || label,
      secondary: rest.join(' - ').trim(),
    };
  }

  if (label.includes('·')) {
    const [primary, ...rest] = label.split('·');
    return {
      primary: primary?.trim() || label,
      secondary: rest.join('·').trim(),
    };
  }

  if (label.includes('Â·')) {
    const [primary, ...rest] = label.split('Â·');
    return {
      primary: primary?.trim() || label,
      secondary: rest.join('Â·').trim(),
    };
  }

  return {
    primary: label,
    secondary: '',
  };
}

function parseFeedbackTags(feedback: string) {
  return feedback
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getDoctorInterest(feedback: string, doctorInterest?: 'High' | 'Medium' | 'Low') {
  if (doctorInterest) {
    return doctorInterest;
  }

  const tags = parseFeedbackTags(feedback);

  if (tags.includes('Not Interested')) {
    return 'Low';
  }

  if (
    tags.some((tag) =>
      [
        'Interested',
        'Need Follow-up',
        'Asked for Samples',
        'Requested Literature',
        'Next Visit Planned',
      ].includes(tag)
    )
  ) {
    return 'High';
  }

  if (tags.some((tag) => ['Price Concern', 'Competitor Mentioned'].includes(tag))) {
    return 'Medium';
  }

  return 'Medium';
}

function getFeedbackToneLabel(feedback: string, doctorInterest?: 'High' | 'Medium' | 'Low') {
  const interest = getDoctorInterest(feedback, doctorInterest);

  if (interest === 'High') return 'Positive Feedback';
  if (interest === 'Low') return 'Low Interest';

  return 'Neutral Feedback';
}

export default function CallAnalytics({
  doctorName,
  callType = 'planned',
  durationSeconds,
  slidesViewed,
  totalSlides,
  feedback,
  doctorInterest,
  slideTimes,
  slideLabels,
  returnToNewDoctor = false,
}: CallAnalyticsProps) {
  const safeSlideTimes =
    slideTimes.length > 0 ? slideTimes : Array.from({ length: totalSlides }, () => 0);
  const completion = totalSlides > 0 ? Math.round((slidesViewed / totalSlides) * 100) : 0;
  const interest = getDoctorInterest(feedback, doctorInterest);
  const feedbackToneLabel = getFeedbackToneLabel(feedback, doctorInterest);

  // Aggregate the per-slide time by brand (the primary label of each slide).
  const brandTimes = (() => {
    const map = new Map<string, { brand: string; value: number }>();
    safeSlideTimes.forEach((seconds, index) => {
      const brand = splitSlideLabel(getSlideLabel(slideLabels, index)).primary;
      const existing = map.get(brand);
      if (existing) {
        existing.value += seconds;
      } else {
        map.set(brand, { brand, value: seconds });
      }
    });
    return [...map.values()];
  })();

  const slideTimeData = brandTimes.map((item, index) => ({
    id: `${index}-${item.brand}`,
    label: item.brand,
    primaryLabel: item.brand,
    secondaryLabel: '',
    value: item.value,
    valueLabel: `${item.value}s`,
  }));

  const slideTimeSummary = brandTimes.map((item, index) => ({
    id: `${index}-${item.brand}`,
    label: item.brand,
    primaryLabel: item.brand,
    secondaryLabel: '',
    valueLabel: formatSlideTime(item.value),
  }));

  const handleBackPress = () => {
    if (callType === 'unplanned' && returnToNewDoctor) {
      queueReturnToNewDoctor();
      router.replace('/(tabs)/unplanned-calls');
      return;
    }

    router.replace(callType === 'unplanned' ? '/(tabs)/unplanned-calls' : '/(tabs)/planned-calls');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerTopRow}>
            <Pressable
              onPress={handleBackPress}
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            >
              <Ionicons name="chevron-back" size={20} color={Colors.textOnDark} />
            </Pressable>
          </View>
        </SafeAreaView>

        <View style={styles.headerProfile}>
          <View style={styles.headerIconCard}>
            <Ionicons name="stats-chart-outline" size={28} color={Colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Call Analytics</Text>
          <Text style={styles.headerSubtitle}>
            Detailed {callType} report for {doctorName ? `${doctorName}'s` : 'your'} last visit
          </Text>
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
            <Text style={styles.completedText}>Call Completed</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
          {/* Doctor Interest hidden (removed from the call summary)
          <AppMetricCard
            icon="ribbon-outline"
            accent="#F97316"
            label="Doctor Interest"
            value={interest}
            pill={feedbackToneLabel}
          />
          */}
        </View>

        <View style={styles.detailGrid}>
          <View style={[styles.card, styles.chartCard]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trending-up-outline" size={16} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Time Spent per Brand (Seconds)</Text>
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
                <View key={item.id} style={styles.slideTimeRow}>
                  <Text style={styles.slideTimeLabel}>
                    <Text style={styles.slideTimePrimaryLabel}>{item.primaryLabel}</Text>
                    {item.secondaryLabel ? <Text>{` - ${item.secondaryLabel}`}</Text> : null}
                  </Text>
                  <Text style={styles.slideTimeValue}>{item.valueLabel}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sideColumn}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Doctor&apos;s Feedback</Text>
              <View style={styles.feedbackBox}>
                <Text style={styles.feedbackText}>"{feedback}"</Text>
              </View>
            </View>
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
  headerProfile: {
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 4,
  },
  headerIconCard: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    color: Colors.textOnDark,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#22C55E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 4,
  },
  completedText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  slideTimePrimaryLabel: {
    fontWeight: '800',
  },
  slideTimeValue: {
    color: Colors.primary,
    fontSize: 14,
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
