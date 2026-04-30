import { HighlightCard } from '@/components/ui/HighlightCard';
import { Colors } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from './ProgressBar';

interface DailyGoalCardProps {
  completed?: number;
  total?: number;
}

export function DailyGoalCard({ completed = 2, total = 5 }: DailyGoalCardProps) {
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const remaining = total - completed;

  return (
    <HighlightCard
      title="Daily Goal"
      description={`You've completed ${completed} out of ${total} visits today.`}
    >
      <View style={styles.progressSection}>
        <ProgressBar
          progress={progress}
          trackColor="rgba(43,115,184,0.2)"
          fillColor={Colors.primary}
          height={10}
        />
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>{progress}% Progress</Text>
          <Text style={styles.progressLabel}>{remaining} visits left</Text>
        </View>
      </View>
    </HighlightCard>
  );
}

const styles = StyleSheet.create({
  progressSection: {
    gap: 8,
    marginTop: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});
