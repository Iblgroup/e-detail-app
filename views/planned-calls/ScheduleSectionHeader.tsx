import { Colors } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

interface ScheduleSectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  remaining?: number;
}

export function ScheduleSectionHeader({ title, action, remaining }: ScheduleSectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action ?? (remaining !== undefined && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{remaining} Remaining</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  badge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});
