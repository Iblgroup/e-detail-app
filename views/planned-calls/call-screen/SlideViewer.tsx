import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Slide, SlideCard } from './SlideCard';

interface SlideViewerProps {
  slides: Slide[];
  isPaused?: boolean;
  onTogglePause?: () => void;
  onElapsedChange?: (seconds: number) => void;
  onSlideTimesChange?: (seconds: number[]) => void;
  onSlidesViewedChange?: (slidesViewed: number, canEndCall: boolean) => void;
}

function normalizeDuration(seconds: number) {
  return Math.max(1, Math.floor(seconds));
}

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safeSeconds / 60).toString().padStart(2, '0');
  const s = (safeSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function addSlideTime(seconds: number[], index: number, duration: number) {
  if (duration <= 0) return seconds;

  const next = [...seconds];
  next[index] = (next[index] ?? 0) + duration;
  return next;
}

export function SlideViewer({
  slides,
  isPaused = false,
  onTogglePause,
  onElapsedChange,
  onSlideTimesChange,
  onSlidesViewedChange,
}: SlideViewerProps) {
  const [current, setCurrent] = useState(0);
  const [slideElapsed, setSlideElapsed] = useState(0);
  const [spentSeconds, setSpentSeconds] = useState<number[]>(() => slides.map(() => 0));

  const durations = useMemo(
    () => slides.map((slide) => normalizeDuration(slide.durationSeconds)),
    [slides]
  );
  const currentDuration = durations[current] ?? 1;
  const slidesKey = useMemo(() => slides.map((slide) => slide.id).join('|'), [slides]);

  const slideTimes = useMemo(
    () =>
      spentSeconds.map((spent, index) => {
        if (index === current) {
          return spent + slideElapsed;
        }

        return spent;
      }),
    [current, slideElapsed, spentSeconds]
  );
  const totalElapsed = useMemo(
    () => slideTimes.reduce((total, seconds) => total + seconds, 0),
    [slideTimes]
  );
  const progressSeconds = useMemo(
    () => slideTimes.map((seconds, index) => Math.min(seconds, durations[index] ?? 1)),
    [durations, slideTimes]
  );
  const completedSeconds = Math.min(progressSeconds[current] ?? 0, currentDuration);
  const currentSlideSpentSeconds = slideTimes[current] ?? 0;
  const completedSlides = useMemo(
    () =>
      progressSeconds.filter((seconds, index) => seconds >= (durations[index] ?? 1)).length,
    [durations, progressSeconds]
  );
  const allSlidesCompleted = slides.length > 0 && completedSlides >= slides.length;
  const isLastSlide = current === slides.length - 1;
  const previousSlidesCompleted =
    slides.length <= 1 ||
    progressSeconds
      .slice(0, Math.max(0, slides.length - 1))
      .every((seconds, index) => seconds >= (durations[index] ?? 1));
  const canEndCall = slides.length > 0 && (allSlidesCompleted || (isLastSlide && previousSlidesCompleted));
  const slidesViewed = slides.length > 0 ? Math.max(completedSlides, current + 1) : 0;

  useEffect(() => {
    setCurrent(0);
    setSlideElapsed(0);
    setSpentSeconds(Array.from({ length: slides.length }, () => 0));
  }, [slides.length, slidesKey]);

  useEffect(() => {
    onElapsedChange?.(totalElapsed);
  }, [onElapsedChange, totalElapsed]);

  useEffect(() => {
    onSlideTimesChange?.(slideTimes);
  }, [onSlideTimesChange, slideTimes]);

  useEffect(() => {
    if (slides.length === 0) {
      onSlidesViewedChange?.(0, false);
      return;
    }

    onSlidesViewedChange?.(slidesViewed, canEndCall);
  }, [canEndCall, onSlidesViewedChange, slides.length, slidesViewed]);

  useEffect(() => {
    if (isPaused || slides.length === 0) return;

    const interval = setInterval(() => {
      setSlideElapsed((elapsed) => elapsed + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [current, isPaused, slides.length]);

  const goToSlide = useCallback(
    (target: number) => {
      if (target < 0 || target >= slides.length || target === current) return;

      setSpentSeconds((seconds) => addSlideTime(seconds, current, slideElapsed));
      setCurrent(target);
      setSlideElapsed(0);
    },
    [current, slideElapsed, slides.length]
  );

  const prev = () => goToSlide(current - 1);
  const next = () => goToSlide(current + 1);

  if (slides.length === 0) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {/* Prev arrow */}
      <Pressable
        onPress={prev}
        style={[styles.arrow, styles.arrowLeft, current === 0 && styles.arrowHidden]}
      >
        <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
      </Pressable>

      {/* Slide */}
      <View style={styles.slideWrapper}>
        <SlideCard slide={slides[current]} />
      </View>

      {/* Next arrow */}
      <Pressable
        onPress={next}
        style={[styles.arrow, styles.arrowRight, current === slides.length - 1 && styles.arrowHidden]}
      >
        <Ionicons name="chevron-forward" size={22} color="#FFFFFF" />
      </Pressable>

      <View style={styles.bottomStack}>
        <Pressable
          onPress={onTogglePause}
          style={[styles.pauseButton, isPaused ? styles.resumeButton : styles.pauseButtonActive]}
        >
          <Ionicons
            name={isPaused ? 'play-outline' : 'pause-outline'}
            size={18}
            color="#FFFFFF"
          />
          <Text style={styles.pauseButtonLabel}>{isPaused ? 'Resume' : 'Pause'}</Text>
        </Pressable>

        <View style={styles.slideTimer}>
          <View style={styles.slideTimerHeader}>
            <Text style={styles.slideTimerLabel}>Slide {current + 1}/{slides.length}</Text>
            <Text style={styles.slideTimerValue}>{formatTime(currentSlideSpentSeconds)} spent</Text>
          </View>
          <View style={styles.slideTimerTrack}>
            <View style={[styles.slideTimerFill, { flex: completedSeconds }]} />
            <View style={{ flex: Math.max(0, currentDuration - completedSeconds) }} />
          </View>
        </View>

        <View style={styles.dots}>
          {slides.map((_, i) => (
            <Pressable key={i} onPress={() => goToSlide(i)}>
              <View style={[styles.dot, i === current && styles.dotActive]} />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideWrapper: {
    width: '80%',
    height: '78%',
    zIndex: 1,
  },
  bottomStack: {
    position: 'absolute',
    bottom: 12,
    alignItems: 'center',
    gap: 14,
    zIndex: 20,
    elevation: 20,
  },
  slideTimer: {
    width: 172,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: 6,
    marginBottom: 2,
  },
  slideTimerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  slideTimerLabel: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 13,
    fontWeight: '700',
  },
  slideTimerValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  slideTimerTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  slideTimerFill: {
    backgroundColor: '#FFFFFF',
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  pauseButtonActive: {
    backgroundColor: '#EF4444',
    borderColor: '#F87171',
    shadowColor: '#EF4444',
  },
  resumeButton: {
    backgroundColor: '#16A34A',
    borderColor: '#4ADE80',
    shadowColor: '#16A34A',
  },
  pauseButtonLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  pauseButtonTime: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    fontWeight: '700',
  },
  arrow: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  arrowLeft: {
    left: 12,
  },
  arrowRight: {
    right: 12,
  },
  arrowHidden: {
    opacity: 0,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 20,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    width: 32,
    backgroundColor: '#FFFFFF',
  },
});
