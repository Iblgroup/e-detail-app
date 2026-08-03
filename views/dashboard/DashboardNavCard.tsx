import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface DashboardNavCardProps {
  label: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

/** One dashboard entry point — a big tappable card in the 2x2 grid. */
export function DashboardNavCard({
  label,
  description,
  iconName,
  onPress,
}: DashboardNavCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.iconBubble}>
        <Ionicons name={iconName} size={24} color={Colors.primary} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.description}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 148,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 8,
    justifyContent: 'center',
    boxShadow: '0px 1px 4px rgba(43, 115, 184, 0.08)',
    elevation: 2,
  },
  pressed: {
    opacity: 0.75,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  description: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
  },
});
