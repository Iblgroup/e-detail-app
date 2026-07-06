import { useGetFieldForceHierarchy } from '@/api/master-data';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { API_BASE_URL } from '@/config/api-base-url';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
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
  const repProfile = user?.mieId
    ? hierarchyRows.find((row) => String(row.MIE_ID ?? '') === user.mieId)
    : undefined;

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
    : API_BASE_URL
      ? 'Waiting for the first successful response.'
      : 'Set EXPO_PUBLIC_API_BASE_URL for deployed builds, EXPO_PUBLIC_LOCAL_API_BASE_URL for local web, or EXPO_PUBLIC_NATIVE_API_BASE_URL for Metro on a phone if needed.';

  const profileName = asText(repProfile?.MIE_NAME, user?.name ?? 'Medical Rep');
  const profileTeam = asText(repProfile?.TEAMNAME, user?.team ?? 'Unknown team');
  const profileSap = asText(repProfile?.MIE_SAP_ID, user?.mieId ?? 'Unknown MIE');
  const profileManager = asText(repProfile?.RM, 'Not available');
  const profileBase = asText(repProfile?.MIE_BASE, 'Not available');
  const profileSm = asText(repProfile?.SM, 'Not available');

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
      {/* <AppChartCard
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
              <Text style={styles.profileRole}>Medical Rep</Text>
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
              <Text style={styles.profileLabel}>Reporting RM</Text>
              <Text style={styles.profileValue}>{profileManager}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Base</Text>
              <Text style={styles.profileValue}>{profileBase}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Reporting SM</Text>
              <Text style={styles.profileValue}>{profileSm}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Data Source</Text>
              <Text style={styles.profileValue}>/master-data/teams</Text>
            </View>
          </View>
        </View>
      </AppChartCard> */}

      {/* <AppChartCard
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
            Base URL: {API_BASE_URL || 'Not configured'}
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
      </AppChartCard> */}

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
