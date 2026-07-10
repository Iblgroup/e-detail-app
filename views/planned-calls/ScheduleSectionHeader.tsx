import { Colors } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

interface ScheduleSectionHeaderProps {
  title: string;
  // A small count chip shown right next to the title.
  count?: number;
  // Right-aligned node (e.g. a filter toggle or an action button).
  action?: React.ReactNode;
}

export function ScheduleSectionHeader({ title, count, action }: ScheduleSectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {count !== undefined ? (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        ) : null}
      </View>
      {action ?? null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  countBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: 20,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
});
