import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface ContactAction {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

const defaultActions: ContactAction[] = [
  { label: 'Call Office', iconName: 'call-outline' },
  { label: 'Send Email', iconName: 'mail-outline' },
  { label: 'View Documents', iconName: 'document-text-outline' },
];

interface ContactInfoCardProps {
  actions?: ContactAction[];
}

export function ContactInfoCard({ actions = defaultActions }: ContactInfoCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Contact Info</Text>
      <View style={styles.list}>
        {actions.map((action, index) => (
          <View key={action.label}>
            <Pressable
              onPress={action.onPress}
              style={({ pressed }) => [styles.row, index === actions.length - 1 && styles.rowLast, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name={action.iconName} size={18} color={Colors.primary} />
              <Text style={styles.label}>{action.label}</Text>
            </Pressable>
            {index < actions.length - 1 && <View style={styles.divider} />}
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
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
  },
  rowLast: {
    paddingBottom: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
});
