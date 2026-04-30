import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface AppHeaderProps {
  /** Screen title (e.g. "Planned Calls"). When provided, shown instead of greeting. */
  title?: string;
  subtitle?: string;
  userName?: string;
  notificationCount?: number;
  onNotification?: () => void;
  action?: React.ReactNode;
}

export function AppHeader({
  title,
  subtitle,
  userName = 'John Doe',
  notificationCount = 0,
  onNotification,
  action,
}: AppHeaderProps) {
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.greeting}>
          {title ?? `Hello, ${userName}`}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle}>{subtitle}</Text>
        ) : (
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={13} color={Colors.primary} />
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
        )}
      </View>

      <View style={styles.right}>
        <Pressable style={styles.bellWrapper} onPress={onNotification}>
          <Ionicons name="notifications-outline" size={21} color={Colors.secondary} />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificationCount}</Text>
            </View>
          )}
        </Pressable>
        {action}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  left: {
    gap: 3,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  date: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellWrapper: {
    position: 'relative',
    padding: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.danger,
    borderRadius: 6,
    minWidth: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: Colors.textOnDark,
    fontSize: 10,
    fontWeight: '700',
  },
});
