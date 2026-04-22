import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { ActionButton } from './ActionButton';

interface QuickAction {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  onPress?: () => void;
}

interface QuickActionsCardProps {
  actions?: QuickAction[];
}

const defaultActions: QuickAction[] = [
  { label: 'Reschedule', iconName: 'calendar-outline', iconColor: Colors.primary },
  { label: 'Nearby', iconName: 'location-outline', iconColor: Colors.secondary },
  { label: 'New Doctor', iconName: 'medkit-outline', iconColor: Colors.primary },
  { label: 'My Stats', iconName: 'trending-up-outline', iconColor: Colors.secondary },
];

export function QuickActionsCard({ actions = defaultActions }: QuickActionsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.grid}>
        <View style={styles.row}>
          {actions.slice(0, 2).map((action, i) => (
            <ActionButton
              key={i}
              label={action.label}
              onPress={action.onPress}
              icon={<Ionicons name={action.iconName} size={22} color={action.iconColor} />}
            />
          ))}
        </View>
        <View style={styles.row}>
          {actions.slice(2, 4).map((action, i) => (
            <ActionButton
              key={i}
              label={action.label}
              onPress={action.onPress}
              icon={<Ionicons name={action.iconName} size={22} color={action.iconColor} />}
            />
          ))}
        </View>
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
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  grid: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
});
