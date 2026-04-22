import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export interface HistoryItem {
  id: string;
  type: string;
  date: string;
  duration: string;
  outcome: 'Positive' | 'Very Positive' | 'Neutral' | 'Negative';
}

const outcomeColor: Record<HistoryItem['outcome'], string> = {
  'Very Positive': '#10B981',
  'Positive': '#10B981',
  'Neutral': Colors.textMuted,
  'Negative': Colors.danger,
};

interface RecentHistoryCardProps {
  items: HistoryItem[];
  onViewAll?: () => void;
}

export function RecentHistoryCard({ items, onViewAll }: RecentHistoryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent History</Text>
        <Pressable onPress={onViewAll}>
          <Text style={styles.viewAll}>View All</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {items.map((item, index) => (
          <View key={item.id}>
            <View style={[styles.row, index === items.length - 1 && styles.rowLast]}>
              <View style={styles.iconWrapper}>
                <Ionicons name="time-outline" size={16} color={Colors.textMuted} />
              </View>
              <View style={styles.info}>
                <Text style={styles.type}>{item.type}</Text>
                <Text style={styles.date}>{item.date}</Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.duration}>{item.duration}</Text>
                <Text style={[styles.outcome, { color: outcomeColor[item.outcome] }]}>
                  {item.outcome}
                </Text>
              </View>
            </View>
            {index < items.length - 1 && <View style={styles.divider} />}
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
    padding: 18,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  list: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  rowLast: {
    paddingBottom: 0,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  type: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  date: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  duration: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  outcome: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
});
