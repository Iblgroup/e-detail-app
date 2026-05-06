import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export interface PlannedCallItem {
  id: string;
  title: string;
  scheduledTime: string;
  location?: string;
  status?: 'pending' | 'completed';
}

interface PlannedCallsCardProps {
  items: PlannedCallItem[];
}

export function PlannedCallsCard({ items }: PlannedCallsCardProps) {
  const pendingItems = items.filter((item) => item.status !== 'completed');

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Planned Calls</Text>
        <Text style={styles.count}>{pendingItems.length} Pending</Text>
      </View>

      <View style={styles.list}>
        {pendingItems.map((item, index) => (
          <View key={item.id}>
            <View style={[styles.row, index === pendingItems.length - 1 && styles.rowLast]}>
              <View style={styles.iconWrapper}>
                <Ionicons name="alarm-outline" size={16} color={Colors.primary} />
              </View>
              <View style={styles.info}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.locationText}>{item.location || 'Location TBD'}</Text>
              </View>
              <Text style={styles.timeText}>{item.scheduledTime}</Text>
            </View>
            {index < pendingItems.length - 1 && <View style={styles.divider} />}
          </View>
        ))}

        {pendingItems.length === 0 ? (
          <Text style={styles.emptyState}>No pending planned calls for today.</Text>
        ) : null}
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
  count: {
    fontSize: 14,
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
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  emptyState: {
    fontSize: 14,
    color: Colors.textMuted,
  },
});
