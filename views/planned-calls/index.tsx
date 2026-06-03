import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppSearchInput } from '@/components/ui/AppSearchInput';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { DoctorDataRow, useInfinitePlannedDoctors } from '@/api/doctor';
import { ScheduleSectionHeader } from './ScheduleSectionHeader';
import { DoctorCard, Doctor } from './DoctorCard';
import { getCompletedCallIds } from './callCompletionStore';

function asText(value: unknown, fallback: string) {
  if (value === null || value === undefined) {
    return fallback;
  }

  const text = String(value).trim();
  return text || fallback;
}

function mapDoctors(rows: DoctorDataRow[]): Doctor[] {
  return rows.map((row) => ({
    id: String(row.DOCTORID ?? ''),
    name: asText(row.DOCTORNAME, 'Unknown Doctor'),
    specialty: asText(row.SpecialtyByCommercial, asText(row.SpecialtyByIkon, 'Unknown Specialty')),
    specialtyId: row.SpecialtyId,
    hospital: asText(row.CITY, 'Unknown City'),
    address: asText(row.CITY, 'Unknown City'),
    lastVisit: 'No visit recorded',
    teamId: row.TEAMID,
  }));
}

export default function PlannedCalls() {
  const { user } = useAuth();
  const [completedCallIds, setCompletedCallIds] = useState(() => getCompletedCallIds('planned'));
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery.trim());
  const doctorsQuery = useInfinitePlannedDoctors({
    mieId: user?.mieId,
    teamId: user?.teamId,
    query: deferredSearchQuery,
  });

  useFocusEffect(
    useCallback(() => {
      setCompletedCallIds(getCompletedCallIds('planned'));
    }, [])
  );

  const doctors = useMemo(() => {
    const mappedDoctors = mapDoctors(
      doctorsQuery.data?.pages.flatMap((page) => page.data) ?? []
    );

    return mappedDoctors
      .map((doctor) => ({
        ...doctor,
        status: completedCallIds.has(doctor.id) ? 'completed' as const : 'pending' as const,
      }))
      .sort((a, b) => Number(a.status === 'completed') - Number(b.status === 'completed'));
  }, [completedCallIds, doctorsQuery.data?.pages]);

  const remaining = doctors.filter((doctor) => doctor.status !== 'completed').length;
  const totalLoaded = doctors.length;
  const totalAvailable = doctorsQuery.data?.pages[0]?.totalCount ?? totalLoaded;
  const hasActiveSearch = deferredSearchQuery.length > 0;
  const sourceLabel = doctorsQuery.data?.pages[0]?.source;

  const handleLoadMore = () => {
    if (!doctorsQuery.hasNextPage || doctorsQuery.isFetchingNextPage) {
      return;
    }

    void doctorsQuery.fetchNextPage();
  };

  const renderFooter = () => {
    if (!doctorsQuery.isFetchingNextPage) {
      return <View style={styles.footerSpacer} />;
    }

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={Colors.primary} />
        <Text style={styles.footerText}>Loading more doctors...</Text>
      </View>
    );
  };

  return (
    <ScreenLayout title="Planned Calls" notificationCount={1} scrollable={false}>
      <FlatList
        data={doctors}
        keyExtractor={(doctor) => doctor.id}
        renderItem={({ item }) => <DoctorCard doctor={item} callType="planned" onPress={() => {}} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.35}
        ListHeaderComponent={
          <View style={styles.section}>
            <ScheduleSectionHeader title="Assigned Doctors" remaining={remaining} />

            {doctorsQuery.isLoading ? (
              <View style={styles.stateCard}>
                <ActivityIndicator color={Colors.primary} />
                <Text style={styles.stateTitle}>Loading doctors...</Text>
                <Text style={styles.stateText}>
                  Fetching the doctor list for {user?.name ?? 'your account'}.
                </Text>
              </View>
            ) : null}

            {doctorsQuery.isError ? (
              <View style={styles.stateCard}>
                <Text style={styles.stateTitle}>Unable to load doctors</Text>
                <Text style={styles.stateText}>
                  {doctorsQuery.error instanceof Error ? doctorsQuery.error.message : 'Unknown error'}
                </Text>
              </View>
            ) : null}

            {!doctorsQuery.isLoading && !doctorsQuery.isError && totalLoaded === 0 ? (
              <View style={styles.stateCard}>
                <Text style={styles.stateTitle}>No doctors assigned</Text>
                <Text style={styles.stateText}>
                  We did not find doctor records for {user?.name ?? 'this rep'} yet.
                </Text>
              </View>
            ) : null}

            {!doctorsQuery.isLoading && !doctorsQuery.isError && totalLoaded > 0 ? (
              <View style={styles.summaryBlock}>
                <Text style={styles.summaryText}>
                  Showing {totalLoaded} of {totalAvailable} assigned doctors for {user?.name ?? 'this rep'}.
                </Text>
                {sourceLabel === 'temporary-fallback' ? (
                  <Text style={styles.sourceHint}>
                    Temporary planned list from the rep doctor pool.
                  </Text>
                ) : null}
              </View>
            ) : null}

            <AppSearchInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search doctors by name, city, or specialty"
            />

            {hasActiveSearch ? (
              <Text style={styles.searchHint}>
                Search results for "{deferredSearchQuery}"
              </Text>
            ) : null}
          </View>
        }
        ListFooterComponent={renderFooter}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 10,
  },
  section: {
    gap: 12,
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textMuted,
  },
  summaryBlock: {
    gap: 4,
  },
  sourceHint: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
  searchHint: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
  stateCard: {
    borderRadius: 16,
    backgroundColor: Colors.surface,
    padding: 18,
    gap: 8,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  stateText: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textMuted,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  footerSpacer: {
    height: 12,
  },
});
