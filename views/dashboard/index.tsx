import { AppButton } from '@/components/ui/AppButton';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { MonthlyPerformanceCard } from './MonthlyPerformanceCard';
import { TutorialVideoCard } from './TutorialVideoCard';
// import { DailyGoalCard } from './DailyGoalCard';
// import { QuickActionsCard } from './QuickActionsCard';
// import { NoteRemindersCard } from './NoteRemindersCard';
// import { ProTipCard } from './ProTipCard';

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

export default function Dashboard() {
  return (
    <ScreenLayout
      userName="John Doe"
      notificationCount={1}
      headerAction={
        <AppButton
          label="New Note"
          onPress={() => {}}
          icon={<Ionicons name="add" size={20} color={Colors.textOnDark} />}
        />
      }
    >
      <TutorialVideoCard />
      <MonthlyPerformanceCard periodData={dashboardPerformance} />
      {/* <DailyGoalCard completed={2} total={5} />
      <QuickActionsCard />
      <NoteRemindersCard />
      <ProTipCard /> */}
    </ScreenLayout>
  );
}
