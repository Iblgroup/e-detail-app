import { StyleSheet, Text, View } from 'react-native';

interface AppSectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function AppSectionHeader({
  title,
  icon,
  action,
}: AppSectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {icon}
        <Text style={styles.title}>{title}</Text>
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flexShrink: 1,
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
  },
  action: {
    flexShrink: 0,
  },
});
