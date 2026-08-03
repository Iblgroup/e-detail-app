import { AppButton } from '@/components/ui/AppButton';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SummaryMetricsGrid } from '@/components/ui/SummaryMetricsGrid';
import { DashboardNavCard } from './DashboardNavCard';

// The tutorial video (TutorialVideoCard) and the performance chart
// (MonthlyPerformanceCard) are TEMPORARILY hidden — the dashboard is now the
// four entry points below. Both components are kept for when they come back.
const NAV_CARDS: {
  label: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
  href: Href;
}[] = [
  {
    label: 'Doctor List',
    description: 'Every doctor assigned to you',
    iconName: 'people-outline',
    href: '/doctor-list',
  },
  {
    label: 'Content Viewing',
    description: 'Brands and SKUs you detail',
    iconName: 'albums-outline',
    href: '/content-library',
  },
  {
    label: 'Call Reporting',
    description: "Report today's calls",
    iconName: 'calendar-outline',
    href: '/planned-calls',
  },
  {
    label: 'Analytics',
    description: 'Your calls and coverage',
    iconName: 'bar-chart-outline',
    href: '/analytics',
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const profileName = user?.name ?? 'Medical Rep';

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
      <SummaryMetricsGrid />

      <View style={styles.grid}>
        <View style={styles.row}>
          {NAV_CARDS.slice(0, 2).map((card) => (
            <DashboardNavCard
              key={card.label}
              label={card.label}
              description={card.description}
              iconName={card.iconName}
              onPress={() => router.navigate(card.href)}
            />
          ))}
        </View>
        <View style={styles.row}>
          {NAV_CARDS.slice(2, 4).map((card) => (
            <DashboardNavCard
              key={card.label}
              label={card.label}
              description={card.description}
              iconName={card.iconName}
              onPress={() => router.navigate(card.href)}
            />
          ))}
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  hiddenHeaderButton: {
    display: 'none' as const,
  },
  grid: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
});
