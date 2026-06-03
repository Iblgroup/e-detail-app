import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useCallback, useRef, useState } from 'react';
import { router } from 'expo-router';
import { CallHeader } from './CallHeader';
import { SlideViewer } from './SlideViewer';
import { Slide } from './SlideCard';
import { CallSummaryData, CallSummaryModal } from './CallSummaryModal';
import { markCallCompleted } from '../callCompletionStore';
import { CallType } from '../callTypes';
import { queueReturnToNewDoctor } from '@/views/unplanned-calls/returnToNewDoctorStore';
import { DoctorCallSlide, useForcingSlides } from '@/api/content';

const DEMO_SLIDES: Slide[] = [
  {
    id: '1',
    brand: 'Searle Pharmaceuticals',
    title: 'Cardio-Health Pro',
    subtitle: 'The Next Generation in Cardiac Care',
    durationSeconds: 10,
    bullets: [
      'Once-daily dosing',
      'High bioavailability',
      'Patient compliance focus',
    ],
  },
  {
    id: '2',
    brand: 'Searle Pharmaceuticals',
    title: 'Clinical Efficacy',
    subtitle: 'Proven results in large-scale trials',
    durationSeconds: 20,
    bullets: [
      '92% reduction in adverse events',
      'Superior to standard of care',
      'Recommended by cardiologists',
    ],
  },
  {
    id: '3',
    brand: 'Searle Pharmaceuticals',
    title: 'Safety Profile',
    subtitle: 'Well tolerated across all age groups',
    durationSeconds: 30,
    bullets: [
      'Minimal side effects',
      'No known drug interactions',
      'Safe for long-term use',
    ],
  },
];

interface CallScreenProps {
  doctorId?: string;
  callType?: CallType;
  doctorName?: string;
  returnToNewDoctor?: boolean;
  specialtyId?: number;
  teamId?: number;
}

function mapForcingSlides(slides: DoctorCallSlide[]): Slide[] {
  return slides.map((slide) => ({
    id: slide.id,
    brand: slide.brand,
    title: slide.title,
    subtitle: slide.subtitle,
    bullets: slide.bullets,
    durationSeconds: slide.durationSeconds,
    image: slide.image,
  }));
}

function getAnalyticsSlideLabel(slide: Slide) {
  const title = slide.title?.trim();
  const subtitle = slide.subtitle?.trim();

  if (title && subtitle) return `${title} · ${subtitle}`;
  return title || subtitle || slide.brand || 'Slide';
}

export default function CallScreen({
  doctorId,
  callType = 'planned',
  doctorName,
  returnToNewDoctor = false,
  specialtyId,
  teamId,
}: CallScreenProps) {
  const hasForcingContext = Boolean(teamId && specialtyId);
  const forcingSlidesQuery = useForcingSlides({ teamId, doctorSpecId: specialtyId });
  const slides = !hasForcingContext
    ? DEMO_SLIDES
    : forcingSlidesQuery.data && forcingSlidesQuery.data.length > 0
      ? mapForcingSlides(forcingSlidesQuery.data)
      : forcingSlidesQuery.isLoading
        ? []
        : DEMO_SLIDES;
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [slideTimes, setSlideTimes] = useState<number[]>([]);
  const [slidesViewed, setSlidesViewed] = useState(0);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const hasEndedRef = useRef(false);

  const handleRequestEndCall = useCallback(() => {
    setIsSummaryVisible(true);
  }, []);

  const handleSlidesViewedChange = useCallback((count: number) => {
    setSlidesViewed((previous) => Math.max(previous, count));
  }, []);

  const handleSubmitSummary = useCallback((summary: CallSummaryData) => {
    if (hasEndedRef.current) return;

    hasEndedRef.current = true;
    markCallCompleted(doctorId, callType, {
      doctorName,
      durationSeconds: elapsedSeconds,
      slidesViewed,
      totalSlides: slides.length,
      feedback: summary.feedback || 'No feedback provided',
      doctorInterest: summary.doctorInterest,
      slideTimes,
      slideLabels: slides.map(getAnalyticsSlideLabel),
    });

    if (callType === 'unplanned' && returnToNewDoctor) {
      queueReturnToNewDoctor(doctorId ?? 'unknown');
      router.replace('/(tabs)/unplanned-calls');
      return;
    }

    router.replace({
      pathname: '/call-analytics/[id]',
      params: {
        id: doctorId ?? 'unknown',
        callType,
        doctorName,
        duration: String(elapsedSeconds),
        slidesViewed: String(slidesViewed),
        totalSlides: String(slides.length),
        feedback: summary.feedback || 'No feedback provided',
        doctorInterest: summary.doctorInterest,
        jointCall: summary.jointCall,
        samplesProvided: summary.samplesProvided,
        slideTimes: slideTimes.join(','),
        slideLabels: JSON.stringify(slides.map(getAnalyticsSlideLabel)),
        returnToNewDoctor: returnToNewDoctor ? '1' : '0',
      },
    });
  }, [callType, doctorId, doctorName, elapsedSeconds, returnToNewDoctor, slideTimes, slides, slidesViewed]);

  return (
    <View style={styles.screen}>
      <CallHeader
        elapsedSeconds={elapsedSeconds}
        canEndCall
        onEndCall={handleRequestEndCall}
      />
      <View style={styles.body}>
        {hasForcingContext && forcingSlidesQuery.isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Loading forcing content...</Text>
          </View>
        ) : null}
        <SlideViewer
          slides={slides}
          isPaused={isSummaryVisible || isTimerPaused}
          onTogglePause={() => setIsTimerPaused((value) => !value)}
          onElapsedChange={setElapsedSeconds}
          onSlideTimesChange={setSlideTimes}
          onSlidesViewedChange={handleSlidesViewedChange}
        />
      </View>
      <CallSummaryModal
        visible={isSummaryVisible}
        durationSeconds={elapsedSeconds}
        slidesViewed={slidesViewed}
        totalSlides={slides.length}
        onCancel={() => setIsSummaryVisible(false)}
        onSubmit={handleSubmitSummary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#12121E',
  },
  body: {
    flex: 1,
  },
  loadingState: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 10,
    elevation: 10,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
