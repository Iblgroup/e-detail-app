import { View, StyleSheet } from 'react-native';
import { useCallback, useRef, useState } from 'react';
import { router } from 'expo-router';
import { CallHeader } from './CallHeader';
import { SlideViewer } from './SlideViewer';
import { Slide } from './SlideCard';
import { CallSummaryData, CallSummaryModal } from './CallSummaryModal';
import { markCallCompleted } from '../callCompletionStore';
import { CallType } from '../callTypes';

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
}

export default function CallScreen({ doctorId, callType = 'planned', doctorName }: CallScreenProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [slideTimes, setSlideTimes] = useState<number[]>(() => DEMO_SLIDES.map(() => 0));
  const [slidesViewed, setSlidesViewed] = useState(0);
  const [canEndCall, setCanEndCall] = useState(false);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const hasEndedRef = useRef(false);

  const handleRequestEndCall = useCallback(() => {
    if (!canEndCall) return;

    setIsSummaryVisible(true);
  }, [canEndCall]);

  const handleCompleteSlides = useCallback(() => {
    setCanEndCall(true);
    setIsSummaryVisible(true);
  }, []);

  const handleSlidesViewedChange = useCallback((count: number, canEnd: boolean) => {
    setSlidesViewed((previous) => Math.max(previous, count));
    setCanEndCall(canEnd);
  }, []);

  const handleSubmitSummary = useCallback((summary: CallSummaryData) => {
    if (hasEndedRef.current || !canEndCall) return;

    hasEndedRef.current = true;
    markCallCompleted(doctorId, callType);
    router.replace({
      pathname: '/call-analytics/[id]',
      params: {
        id: doctorId ?? 'unknown',
        callType,
        doctorName,
        duration: String(elapsedSeconds),
        slidesViewed: String(slidesViewed),
        totalSlides: String(DEMO_SLIDES.length),
        feedback: summary.feedback || 'No feedback provided',
        jointCall: summary.jointCall,
        samplesProvided: summary.samplesProvided,
        slideTimes: slideTimes.join(','),
      },
    });
  }, [canEndCall, callType, doctorId, doctorName, elapsedSeconds, slideTimes, slidesViewed]);

  return (
    <View style={styles.screen}>
      <CallHeader
        elapsedSeconds={elapsedSeconds}
        canEndCall={canEndCall}
        onEndCall={handleRequestEndCall}
      />
      <View style={styles.body}>
        <SlideViewer
          slides={DEMO_SLIDES}
          isPaused={isSummaryVisible}
          onElapsedChange={setElapsedSeconds}
          onSlideTimesChange={setSlideTimes}
          onSlidesViewedChange={handleSlidesViewedChange}
          onComplete={handleCompleteSlides}
        />
      </View>
      <CallSummaryModal
        visible={isSummaryVisible}
        durationSeconds={elapsedSeconds}
        slidesViewed={slidesViewed}
        totalSlides={DEMO_SLIDES.length}
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
});
