import { Colors } from '@/constants/theme';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { AppSectionHeader } from './AppSectionHeader';

interface AppChartCardProps {
  title: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  chartWrapperStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

export function AppChartCard({
  title,
  icon,
  headerAction,
  children,
  footer,
  chartWrapperStyle,
  style,
}: AppChartCardProps) {
  return (
    <View style={[styles.card, style]}>
      <AppSectionHeader title={title} icon={icon} action={headerAction} />
      <View style={[styles.chartWrapper, chartWrapperStyle]}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    backgroundColor: Colors.surface,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  chartWrapper: {
    marginTop: 12,
  },
  footer: {
    marginTop: 12,
  },
});
