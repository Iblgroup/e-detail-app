import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { VisitProgress } from '../VisitProgress';

interface MonthlyCoverageCardProps {
  visitCount: number;
  maxVisits?: number | null;
  /** This month's completed calls, by how they were conducted. */
  chamber: number;
  group: number;
  parking: number;
}

const KINDS = [
  { key: 'chamber', label: 'Chamber', icon: 'person-outline' },
  { key: 'group', label: 'Group', icon: 'people-outline' },
  { key: 'parking', label: 'Parking', icon: 'car-outline' },
] as const;

/**
 * This month's coverage for the doctor: the class quota as circles, then what
 * made up the count — a doctor called three times shows which of those were
 * chamber, group or parking calls.
 */
export function MonthlyCoverageCard({
  visitCount,
  maxVisits,
  chamber,
  group,
  parking,
}: MonthlyCoverageCardProps) {
  const counts = { chamber, group, parking };
  const total = chamber + group + parking;

  // Nothing to report: no quota to track and no calls made.
  if (!maxVisits && total === 0) return null;

  const remaining = maxVisits ? Math.max(maxVisits - visitCount, 0) : 0;

  return (
    <View style={styles.card}>
      {/* The class isn't repeated here — Professional Details above already
          states it, and the quota it drives is spelled out below. */}
      <Text style={styles.title}>This Month&apos;s Calls</Text>

      <VisitProgress visitCount={visitCount} maxVisits={maxVisits} />

      {maxVisits ? (
        <Text style={styles.summary}>
          {remaining > 0
            ? `${remaining} more call${remaining === 1 ? '' : 's'} needed this month.`
            : 'Required calls completed for this month.'}
        </Text>
      ) : null}

      {/* One panel, split by hairlines — three separate boxes read as three
          unrelated stats rather than one breakdown of the same total. */}
      <View style={styles.kindPanel}>
        {KINDS.map((kind, index) => (
          <View key={kind.key} style={styles.kindCell}>
            {index > 0 ? <View style={styles.kindSeparator} /> : null}

            <View style={styles.kindInner}>
              <View style={styles.kindHeader}>
                <Ionicons name={kind.icon} size={14} color={Colors.primary} />
                <Text style={styles.kindLabel}>{kind.label}</Text>
              </View>
              <Text style={styles.kindCount}>{counts[kind.key]}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  summary: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  kindPanel: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    overflow: 'hidden',
    marginTop: 2,
  },
  kindCell: {
    flex: 1,
    flexDirection: 'row',
  },
  kindSeparator: {
    width: 1,
    backgroundColor: Colors.border,
  },
  kindInner: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  kindHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  kindCount: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  kindLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
});
