import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import { CallHeader } from './CallHeader';
import { SlideViewer } from './SlideViewer';
import { Slide } from './SlideCard';
import { CallSummaryData, CallSummaryModal } from './CallSummaryModal';
import { markCallCompleted } from '../callCompletionStore';
import { CallType } from '../callTypes';
import { queueReturnToNewDoctor } from '@/views/unplanned-calls/returnToNewDoctorStore';
import { DoctorCallSlide, useForcingSlides } from '@/api/content';
import { useTeamSkus } from '@/api/sku';
import { useInfiniteDoctors } from '@/api/doctor';
import { useAuth } from '@/providers/AuthProvider';
import { enqueueCall } from '@/lib/offline/outbox';
import { nearestClinicVicinity } from '@/lib/location/distance';
import type { CallTrackingInput } from '@/api/calls';

const DEMO_SLIDES: Slide[] = [
  {
    id: '1',
    brand: 'Searle Pharmaceuticals',
    title: 'Cardio-Health Pro',
    subtitle: 'The Next Generation in Cardiac Care',
    durationSeconds: 10,
    bullets: ['Once-daily dosing', 'High bioavailability', 'Patient compliance focus'],
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
    bullets: ['Minimal side effects', 'No known drug interactions', 'Safe for long-term use'],
  },
];

interface CallScreenProps {
  doctorId?: string;
  callType?: CallType;
  doctorName?: string;
  returnToNewDoctor?: boolean;
  specialtyId?: number;
  teamId?: number;
  // Institution call type ('walking' | 'group'); when set, the summary requires
  // picking a doctor from the team.
  institutionType?: string;
  // Location captured when the rep marked "Arrived" (offline-capable GPS).
  arrivedLatitude?: number;
  arrivedLongitude?: number;
  arrivedTime?: string;
  arrivedLocation?: string;
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

  if (title && subtitle) return `${title} - ${subtitle}`;
  return title || subtitle || slide.brand || 'Slide';
}

export default function CallScreen({
  doctorId,
  callType = 'planned',
  doctorName,
  returnToNewDoctor = false,
  specialtyId,
  teamId,
  institutionType,
  arrivedLatitude,
  arrivedLongitude,
  arrivedTime,
  arrivedLocation,
}: CallScreenProps) {
  const { user } = useAuth();
  const isInstitutionCall = Boolean(institutionType);
  const hasForcingContext = Boolean(teamId && specialtyId);
  const forcingSlidesQuery = useForcingSlides({ teamId, doctorSpecId: specialtyId });
  // The team's SKUs, for the "Samples Provided" picker.
  const sampleOptions = useTeamSkus(teamId).data ?? [];
  // The team's (cached) doctor pool. Institution calls require picking a doctor
  // from it; all calls use it to resolve the real doctorid + specialty needed to
  // record the call to call_tracking.
  const teamDoctorsQuery = useInfiniteDoctors({ teamId });
  // When the call screen mounts is our best proxy for the call start time.
  const callStartRef = useRef(new Date().toISOString());
  const teamRows = useMemo(
    () => teamDoctorsQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [teamDoctorsQuery.data?.pages],
  );
  const doctorOptions = useMemo(() => {
    return [
      ...new Set(
        teamRows
          .map((row) => String(row.DOCTORNAME ?? '').trim())
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [teamRows]);
  // Resolve a doctor row by id (planned/known calls) or by name (institution
  // calls where the doctor is chosen in the summary).
  const doctorById = useMemo(
    () => new Map(teamRows.map((row) => [String(row.DOCTORID ?? ''), row])),
    [teamRows],
  );
  const doctorByName = useMemo(
    () =>
      new Map(
        teamRows.map((row) => [String(row.DOCTORNAME ?? '').trim().toLowerCase(), row]),
      ),
    [teamRows],
  );
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

  // Build a full call_tracking payload and hand it to the offline outbox.
  const recordCallToOutbox = useCallback(
    async (summary: CallSummaryData, effectiveDoctorName?: string) => {
      const tsoid = user?.mieId ? String(user.mieId) : '';
      if (!tsoid) return; // can't attribute the call without a rep (tso) id

      // Resolve the real doctorid (FK to doctors). Institution calls resolve by
      // the chosen name; others by the incoming id.
      const selectedRow =
        isInstitutionCall && effectiveDoctorName
          ? doctorByName.get(effectiveDoctorName.trim().toLowerCase())
          : doctorById.get(String(doctorId ?? ''));
      const resolvedDoctorId = selectedRow
        ? String(selectedRow.DOCTORID ?? '')
        : String(doctorId ?? '');

      // call_tracking.doctorid is a FK to doctors — only real (numeric) ids can
      // be recorded. Brand-new unplanned doctors (synthetic ids) are skipped
      // until they exist in the doctors table.
      if (!/^\d+$/.test(resolvedDoctorId)) return;

      const slideLabels = slides.map(getAnalyticsSlideLabel);
      const eachSlideTime: Record<string, number> = {};
      slideLabels.forEach((label, index) => {
        eachSlideTime[label] = slideTimes[index] ?? 0;
      });
      const slidesTotalSeconds = slideTimes.reduce((sum, n) => sum + (n || 0), 0);
      const jointCall = (summary.jointCall ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter((value) => value && value.toLowerCase() !== 'no');
      const sampleProvided = Boolean(
        summary.samplesProvided && summary.samplesProvided !== 'None',
      );

      // Flag whether the rep's arrival GPS was within 50m of the doctor's clinic
      // (checks both day + evening locations). null when GPS or clinic coords are
      // missing. Out-of-vicinity calls are recorded and flagged, never blocked.
      const vicinity = nearestClinicVicinity(
        { latitude: arrivedLatitude, longitude: arrivedLongitude },
        {
          dayLat: selectedRow?.DocLat,
          dayLng: selectedRow?.DocLng,
          eveLat: selectedRow?.DocEveLat,
          eveLng: selectedRow?.DocEveLng,
        },
      );

      const payload: CallTrackingInput = {
        tsoid,
        doctorid: resolvedDoctorId,
        doctor_name: effectiveDoctorName || selectedRow?.DOCTORNAME || undefined,
        doctor_specialty:
          selectedRow?.SpecialtyByCommercial ||
          selectedRow?.SpecialtyByIkon ||
          undefined,
        // Arrival GPS captured on the "Arrived" tap (works offline).
        latitude: arrivedLatitude,
        longitude: arrivedLongitude,
        // arrived_location = the doctor's clinic address; fall back to the
        // reverse-geocoded address of where the rep actually was.
        arrived_location: selectedRow?.ClinicAddress || arrivedLocation || undefined,
        arrived_time: arrivedTime || undefined,
        arrived_within_vicinity: vicinity?.withinVicinity,
        arrived_distance_meters: vicinity?.distanceMeters,
        call_start_time: callStartRef.current,
        call_end_time: new Date().toISOString(),
        total_call_time_seconds: elapsedSeconds,
        total_slides_count: slides.length,
        shown_slides_count: slidesViewed,
        slides_total_time_seconds: slidesTotalSeconds,
        each_slide_time: eachSlideTime,
        brand: slides[0]?.brand || undefined,
        join_call: jointCall,
        sample_provided: sampleProvided,
        samples_json: sampleProvided
          ? { samples: [summary.samplesProvided] }
          : { samples: [] },
        feedback: summary.feedback || undefined,
        call_type: callType,
        institution_call_type: institutionType || undefined,
        created_by: Number(user?.userId) || undefined,
      };

      try {
        await enqueueCall(payload);
      } catch (error) {
        console.warn('[call] failed to queue call for sync', error);
      }
    },
    [
      user?.mieId,
      user?.userId,
      isInstitutionCall,
      doctorByName,
      doctorById,
      doctorId,
      slides,
      slideTimes,
      elapsedSeconds,
      slidesViewed,
      callType,
      institutionType,
      arrivedLatitude,
      arrivedLongitude,
      arrivedTime,
      arrivedLocation,
    ],
  );

  const handleSubmitSummary = useCallback(
    (summary: CallSummaryData) => {
      if (hasEndedRef.current) return;

      // Institution/walking calls carry the doctor chosen in the summary.
      const effectiveDoctorName = summary.selectedDoctor?.trim() || doctorName;

      hasEndedRef.current = true;
      markCallCompleted(doctorId, callType, {
        doctorName: effectiveDoctorName,
        durationSeconds: elapsedSeconds,
        slidesViewed,
        totalSlides: slides.length,
        feedback: summary.feedback || 'No feedback provided',
        doctorInterest: summary.doctorInterest,
        slideTimes,
        slideLabels: slides.map(getAnalyticsSlideLabel),
      });

      // Durably record the call to the outbox (written locally first, then
      // synced to call_tracking when online). Best-effort: never block the UI.
      void recordCallToOutbox(summary, effectiveDoctorName);

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
          doctorName: effectiveDoctorName,
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
    },
    [
      callType,
      doctorId,
      doctorName,
      elapsedSeconds,
      returnToNewDoctor,
      slideTimes,
      slides,
      slidesViewed,
      recordCallToOutbox,
    ]
  );

  return (
    <View style={styles.screen}>
      <CallHeader elapsedSeconds={elapsedSeconds} canEndCall onEndCall={handleRequestEndCall} />
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
        sampleOptions={sampleOptions}
        requireDoctor={isInstitutionCall}
        doctorOptions={doctorOptions}
        onCancel={() => setIsSummaryVisible(false)}
        onSubmit={handleSubmitSummary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  body: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
