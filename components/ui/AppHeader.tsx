import { Colors } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
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
  userName,
  notificationCount = 0,
  onNotification,
  action,
}: AppHeaderProps) {
  const { user } = useAuth();
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
          {title ?? `Hello, ${userName ?? user?.name ?? 'John Doe'}`}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle}>{subtitle}</Text>
        ) : (
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
        )}
      </View>

      <View style={styles.right}>
        {/* Notification bell hidden for now — restore when notifications ship.
        <Pressable style={styles.bellWrapper} onPress={onNotification}>
          <Ionicons name="notifications-outline" size={20} color={Colors.secondary} />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificationCount}</Text>
            </View>
          )}
        </Pressable>
        */}
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
    gap: 6,
  },
  date: {
    fontSize: 14,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 1,
    right: 1,
    backgroundColor: Colors.danger,
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: Colors.textOnDark,
    fontSize: 12,
    lineHeight: 12,
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
