import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useInfinitePlannedDoctors } from '@/api/doctor';
import { AppSearchInput } from '@/components/ui/AppSearchInput';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { mapDoctorRows } from '@/views/planned-calls/mapDoctor';
import { DoctorListCard } from './DoctorListCard';

// Doctors revealed per scroll, sliced from the fully-cached list (no network).
const LIST_PAGE = 30;

/**
 * The rep's full doctor book — every doctor mapped to this MIE, browsable
 * outside of call reporting. Reads the same cached planned-doctor list the sync
 * fills, so it works offline. This is a REFERENCE view: tapping a card opens the
 * doctor record in view-only mode, with no call actions. Calls are started from
 * Call Reporting.
 */
export default function DoctorList() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery.trim());
  const [visibleCount, setVisibleCount] = useState(LIST_PAGE);

  const doctorsQuery = useInfinitePlannedDoctors({
    mieId: user?.mieId,
    teamId: user?.teamId,
  });

  const doctors = useMemo(() => {
    const mapped = mapDoctorRows(
      doctorsQuery.data?.pages.flatMap((page) => page.data) ?? []
    );

    const search = deferredSearchQuery.toLowerCase();
    if (!search) return mapped;

    return mapped.filter((doctor) =>
      [doctor.name, doctor.specialty].some((value) =>
        value?.toLowerCase().includes(search)
      )
    );
  }, [deferredSearchQuery, doctorsQuery.data?.pages]);

  // Restart paging whenever the search narrows the list.
  useEffect(() => {
    setVisibleCount(LIST_PAGE);
  }, [deferredSearchQuery]);

  const visibleDoctors = useMemo(
    () => doctors.slice(0, visibleCount),
    [doctors, visibleCount]
  );

  const handleLoadMore = () => {
    setVisibleCount((count) => (count < doctors.length ? count + LIST_PAGE : count));
  };

  return (
    <ScreenLayout title="Doctor List" subtitle={user?.name} scrollable={false} showBack>
      <FlatList
        data={visibleDoctors}
        keyExtractor={(doctor) => doctor.id}
        renderItem={({ item }) => <DoctorListCard doctor={item} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.35}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppSearchInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name or specialty"
            />

            {doctorsQuery.isLoading ? (
              <View style={styles.stateCard}>
                <ActivityIndicator color={Colors.primary} />
                <Text style={styles.stateTitle}>Loading doctors...</Text>
              </View>
            ) : null}

            {!doctorsQuery.isLoading && doctors.length === 0 ? (
              <View style={styles.stateCard}>
                <Text style={styles.stateTitle}>No doctors found</Text>
                <Text style={styles.stateText}>
                  {deferredSearchQuery
                    ? 'No doctor matches this search.'
                    : `We did not find doctor records for ${user?.name ?? 'this rep'} yet.`}
                </Text>
              </View>
            ) : null}

            {doctors.length > 0 ? (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>
                  Showing {visibleDoctors.length} of {doctors.length} doctors
                </Text>
                <View style={styles.viewOnlyPill}>
                  <Ionicons name="eye-outline" size={12} color={Colors.textMuted} />
                  <Text style={styles.viewOnlyText}>View only</Text>
                </View>
              </View>
            ) : null}
          </View>
        }
        ListFooterComponent={<View style={styles.footerSpacer} />}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 10,
  },
  header: {
    gap: 12,
    paddingBottom: 4,
  },
  stateCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    gap: 6,
    alignItems: 'center',
  },
  stateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  stateText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  viewOnlyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  viewOnlyText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  footerSpacer: {
    height: 24,
  },
});
