import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/ui/AppButton';
import { AppChartCard } from '@/components/ui/AppChartCard';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { useGetFieldForceHierarchy } from '@/api/master-data';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { MonthlyPerformanceCard } from './MonthlyPerformanceCard';
import { TutorialVideoCard } from './TutorialVideoCard';

const dashboardPerformance = {
  monthly: {
    data: [
      { label: 'Week 1', value: 12 },
      { label: 'Week 2', value: 14 },
      { label: 'Week 3', value: 13 },
      { label: 'Week 4', value: 21 },
    ],
    totalCalls: 60,
    changePercent: 15,
  },
  weekly: {
    data: [
      { label: 'Mon', value: 6 },
      { label: 'Tue', value: 7 },
      { label: 'Wed', value: 8 },
      { label: 'Thu', value: 9 },
      { label: 'Fri', value: 10 },
      { label: 'Sat', value: 5 },
      { label: 'Sun', value: 4 },
    ],
    totalCalls: 49,
    changePercent: 12,
  },
  daily: {
    data: [
      { label: '9 AM', value: 1 },
      { label: '11 AM', value: 2 },
      { label: '1 PM', value: 3 },
      { label: '3 PM', value: 2 },
      { label: '5 PM', value: 4 },
    ],
    totalCalls: 12,
    changePercent: 9,
  },
};

function asText(value: unknown, fallback = 'N/A') {
  if (value === null || value === undefined) {
    return fallback;
  }

  const text = String(value).trim();
  return text || fallback;
}

export default function Dashboard() {
  const teamQuery = useGetFieldForceHierarchy();
  const { user } = useAuth();
  const hierarchyRows = teamQuery.data?.data ?? [];
  const ownHierarchyRows = user?.sapId
    ? hierarchyRows.filter((row) => String(row.RM_SAP_ID ?? '') === user.sapId)
    : [];
  const rmProfile = ownHierarchyRows[0];
  const repIds = new Set(
    ownHierarchyRows
      .map((row) => String(row.MIE_SAP_ID ?? row.MIE_ID ?? '').trim())
      .filter(Boolean),
  );
  const repBases = new Set(
    ownHierarchyRows
      .map((row) => asText(row.MIE_BASE, ''))
      .filter(Boolean),
  );

  useEffect(() => {
    if (teamQuery.data) {
      console.log('[Dashboard] team API response', teamQuery.data);
    }
  }, [teamQuery.data]);

  const teamApiStatus = teamQuery.isLoading
    ? 'Loading team data from backend...'
    : teamQuery.isError
      ? 'Team API request failed.'
      : 'Team API request completed successfully.';

  const teamApiMeta = teamQuery.data
    ? `${teamQuery.data.count} records returned from /master-data/teams`
    : process.env.EXPO_PUBLIC_API_BASE_URL
      ? 'Waiting for the first successful response.'
      : 'Set EXPO_PUBLIC_API_BASE_URL to reach e-detailing-be.';

  const profileName = asText(rmProfile?.RM, user?.name ?? 'Regional Manager');
  const profileTeam = asText(rmProfile?.TEAMNAME, user?.team ?? 'Unknown team');
  const profileSap = asText(rmProfile?.RM_SAP_ID, user?.sapId ?? 'Unknown SAP');
  const profileManager = asText(rmProfile?.SM, 'Not available');
  const profileRepCount = repIds.size;
  const profileCoverage = repBases.size;

  return (
    <ScreenLayout
      userName={profileName}
      notificationCount={1}
      headerAction={
        <AppButton
          label="New Note"
          onPress={() => {}}
          icon={<Ionicons name="add" size={20} color={Colors.textOnDark} />}
          style={styles.hiddenHeaderButton}
        />
      }
    >
      <AppChartCard
        title="Your Team Profile"
        icon={<Ionicons name="person-circle-outline" size={18} color={Colors.primary} />}
      >
        <View style={styles.profileCard}>
          <View style={styles.profileHero}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {profileName
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase() ?? '')
                  .join('')}
              </Text>
            </View>
            <View style={styles.profileHeroText}>
              <Text style={styles.profileName}>{profileName}</Text>
              <Text style={styles.profileRole}>Regional Manager</Text>
            </View>
          </View>

          <View style={styles.profileGrid}>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Team</Text>
              <Text style={styles.profileValue}>{profileTeam}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>SAP ID</Text>
              <Text style={styles.profileValue}>{profileSap}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Reporting SM</Text>
              <Text style={styles.profileValue}>{profileManager}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Medical Reps</Text>
              <Text style={styles.profileValue}>{String(profileRepCount)}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Coverage Bases</Text>
              <Text style={styles.profileValue}>{String(profileCoverage)}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Data Source</Text>
              <Text style={styles.profileValue}>/master-data/teams</Text>
            </View>
          </View>
        </View>
      </AppChartCard>

      <AppChartCard
        title="Team API Status"
        icon={<Ionicons name="server-outline" size={18} color={Colors.primary} />}
        headerAction={
          <AppButton
            label={teamQuery.isFetching ? 'Refreshing...' : 'Refetch'}
            onPress={() => {
              void teamQuery.refetch();
            }}
            variant="ghost"
          />
        }
      >
        <View style={styles.apiStatusBody}>
          <Text style={styles.apiStatusTitle}>{teamApiStatus}</Text>
          <Text style={styles.apiStatusMeta}>{teamApiMeta}</Text>
          <Text style={styles.apiStatusMeta}>
            Base URL: {process.env.EXPO_PUBLIC_API_BASE_URL || 'Not configured'}
          </Text>
          {teamQuery.isLoading || teamQuery.isFetching ? (
            <ActivityIndicator color={Colors.primary} />
          ) : null}
          {teamQuery.error ? (
            <Text style={styles.apiErrorText}>
              {teamQuery.error instanceof Error ? teamQuery.error.message : 'Unknown error'}
            </Text>
          ) : null}
        </View>
      </AppChartCard>

      <TutorialVideoCard />
      <MonthlyPerformanceCard periodData={dashboardPerformance} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  hiddenHeaderButton: {
    display: 'none' as const,
  },
  profileCard: {
    gap: 18,
  },
  profileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: '900',
  },
  profileHeroText: {
    flex: 1,
    gap: 3,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.text,
  },
  profileRole: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  profileGrid: {
    gap: 12,
  },
  profileItem: {
    borderRadius: 14,
    backgroundColor: '#F7FAFD',
    borderWidth: 1,
    borderColor: '#E4ECF5',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  profileLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  profileValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  apiStatusBody: {
    gap: 10,
  },
  apiStatusTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  apiStatusMeta: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textMuted,
  },
  apiErrorText: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.danger,
  },
});
