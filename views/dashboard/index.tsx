import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { AppButton } from '@/components/ui/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { MonthlyPerformanceCard } from './MonthlyPerformanceCard';
import { DailyGoalCard } from './DailyGoalCard';
import { QuickActionsCard } from './QuickActionsCard';
import { NoteRemindersCard } from './NoteRemindersCard';
import { ProTipCard } from './ProTipCard';

export default function Dashboard() {
  return (
    <ScreenLayout
      userName="John Doe"
      notificationCount={1}
      headerAction={
        <AppButton
          label="New Note"
          onPress={() => {}}
          icon={<Ionicons name="add" size={18} color={Colors.textOnDark} />}
        />
      }
    >
      <MonthlyPerformanceCard totalCalls={60} changePercent={15} />
      <DailyGoalCard completed={2} total={5} />
      <QuickActionsCard />
      <NoteRemindersCard />
      <ProTipCard />
    </ScreenLayout>
  );
}
