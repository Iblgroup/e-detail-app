import { View, StyleSheet, ViewStyle } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0 to 100
  trackColor?: string;
  fillColor?: string;
  height?: number;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  trackColor = 'rgba(255,255,255,0.25)',
  fillColor = '#FFFFFF',
  height = 8,
  style,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <View style={[styles.track, { backgroundColor: trackColor, height }, style]}>
      <View
        style={[
          styles.fill,
          {
            backgroundColor: fillColor,
            width: `${clamped}%`,
            height,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: 100,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 100,
  },
});
