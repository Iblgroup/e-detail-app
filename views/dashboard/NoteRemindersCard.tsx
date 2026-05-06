import { Colors } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';
import { Reminder, ReminderItem } from './ReminderItem';

interface NoteRemindersCardProps {
  reminders?: Reminder[];
  onReminderPress?: (reminder: Reminder) => void;
}

const defaultReminders: Reminder[] = [
  { id: '1', title: 'Follow up with Dr. Sarah', time: 'Today, 2:00 PM', priority: 'high' },
  { id: '2', title: 'Submit expense report', time: 'Tomorrow, 10:00 AM', priority: 'medium' },
  { id: '3', title: 'New product training', time: 'Friday, 4:00 PM', priority: 'low' },
];

export function NoteRemindersCard({
  reminders = defaultReminders,
  onReminderPress,
}: NoteRemindersCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Note Reminders</Text>
      <View style={styles.list}>
        {reminders.map((reminder) => (
          <ReminderItem
            key={reminder.id}
            reminder={reminder}
            onPress={() => onReminderPress?.(reminder)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  list: {
    gap: 8,
  },
});
