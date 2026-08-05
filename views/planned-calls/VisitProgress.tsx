import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

interface VisitProgressProps {
  /** Completed calls on this doctor this month. */
  visitCount: number;
  /** Calls the doctor's class requires this month. */
  maxVisits?: number | null;
  /** A1 / A2 / A3 / A4 — shown as a leading label when provided. */
  doctorClass?: string;
  /** Smaller dots, for denser rows. */
  compact?: boolean;
  /** Hide the "2/4 visits" text when the caller renders its own count. */
  showCount?: boolean;
}

/**
 * One circle per call the doctor's class requires this month — GREEN for calls
 * already made, RED for the ones still owed. An unclassified doctor has no quota
 * to render against, so nothing shows.
 *
 * Shared by the Call Reporting row and the Doctor List row so the two screens
 * can never disagree about a doctor's coverage.
 */
export function VisitProgress({
  visitCount,
  maxVisits,
  doctorClass,
  compact = false,
  showCount = true,
}: VisitProgressProps) {
  if (!maxVisits || maxVisits < 1) return null;

  const done = Math.min(Math.max(visitCount, 0), maxVisits);
  const dotStyle = compact ? styles.dotCompact : styles.dot;

  return (
    <View style={styles.row}>
      {doctorClass ? <Text style={styles.class}>{doctorClass}</Text> : null}

      <View style={styles.dots}>
        {Array.from({ length: maxVisits }, (_, position) => (
          <View
            key={position}
            style={[
              dotStyle,
              position < done ? styles.dotDone : styles.dotPending,
            ]}
          />
        ))}
      </View>

      {showCount ? (
        <Text style={styles.text}>
          {done}/{maxVisits} visits
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  class: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
  dots: {
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
  dotCompact: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  dotDone: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  dotPending: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
});
