import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export type ReminderPriority = 'high' | 'medium' | 'low';

export interface Reminder {
  id: string;
  title: string;
  time: string;
  priority: ReminderPriority;
}

interface ReminderItemProps {
  reminder: Reminder;
  onPress?: () => void;
}

const priorityColor: Record<ReminderPriority, string> = {
  high: Colors.danger,
  medium: Colors.primary,
  low: Colors.success,
};

export function ReminderItem({ reminder, onPress }: ReminderItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.dot, { backgroundColor: priorityColor[reminder.priority] }]} />
      <View style={styles.text}>
        <Text style={styles.title}>{reminder.title}</Text>
        <Text style={styles.time}>{reminder.time}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(43,115,184,0.15)',
  },
  pressed: {
    opacity: 0.75,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  time: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
