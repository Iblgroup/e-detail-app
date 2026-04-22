import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/ui/AppHeader';
import { Colors } from '@/constants/theme';

interface ScreenLayoutProps {
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  title?: string;
  subtitle?: string;
  userName?: string;
  notificationCount?: number;
  onNotification?: () => void;
  scrollable?: boolean;
  contentStyle?: ViewStyle;
}

export function ScreenLayout({
  children,
  headerAction,
  title,
  subtitle,
  userName,
  notificationCount,
  onNotification,
  scrollable = true,
  contentStyle,
}: ScreenLayoutProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        title={title}
        subtitle={subtitle}
        userName={userName}
        notificationCount={notificationCount}
        onNotification={onNotification}
        action={headerAction}
      />
      {scrollable ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flat, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 32,
  },
  flat: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
