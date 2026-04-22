import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Polygon, Polyline } from 'react-native-svg';
import { Colors } from '@/constants/theme';

export interface LineChartDataPoint {
  label: string;
  value: number;
}

interface AppLineChartProps {
  data: LineChartDataPoint[];
  goal?: number;
  height?: number;
  maxValue?: number;
  lineColor?: string;
}

export function AppLineChart({
  data,
  goal,
  height = 220,
  maxValue,
  lineColor = Colors.primary,
}: AppLineChartProps) {
  const chartWidth = 320;
  const chartHeight = height;
  const topPadding = 12;
  const bottomPadding = 18;
  const usableHeight = chartHeight - topPadding - bottomPadding;
  const resolvedMax = maxValue ?? Math.max(...data.map((item) => item.value), goal ?? 0, 1);
  const ticks = [resolvedMax, resolvedMax * 0.75, resolvedMax * 0.5, resolvedMax * 0.25, 0];

  const points = data.map((item, index) => {
    const x = data.length <= 1 ? 0 : (index / (data.length - 1)) * chartWidth;
    const y = topPadding + usableHeight - (item.value / resolvedMax) * usableHeight;

    return { x, y };
  });
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ');
  const areaPoints =
    points.length > 0
      ? `0,${chartHeight - bottomPadding} ${linePoints} ${chartWidth},${chartHeight - bottomPadding}`
      : '';
  const goalY =
    goal === undefined
      ? undefined
      : topPadding + usableHeight - (goal / resolvedMax) * usableHeight;

  return (
    <View style={styles.container}>
      <View style={styles.chartRow}>
        <View style={[styles.axisLabels, { height }]}>
          {ticks.map((tick) => (
            <Text key={tick} style={styles.axisLabel}>
              {Math.round(tick)}
            </Text>
          ))}
        </View>

        <View style={styles.chartArea}>
          <Svg width="100%" height={height} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            {ticks.map((tick) => {
              const y = topPadding + usableHeight - (tick / resolvedMax) * usableHeight;

              return (
                <Line
                  key={tick}
                  x1="0"
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeDasharray="3 4"
                  strokeWidth="1"
                />
              );
            })}

            {goalY !== undefined && (
              <Line
                x1="0"
                y1={goalY}
                x2={chartWidth}
                y2={goalY}
                stroke="#94A3B8"
                strokeDasharray="4 5"
                strokeWidth="1.5"
              />
            )}

            {areaPoints && <Polygon points={areaPoints} fill={lineColor} opacity="0.08" />}
            {linePoints && (
              <Polyline
                points={linePoints}
                fill="none"
                stroke={lineColor}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </Svg>
        </View>
      </View>

      <View style={styles.labelsRow}>
        {data.map((item) => (
          <Text key={item.label} style={styles.label}>
            {item.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  chartRow: {
    flexDirection: 'row',
    gap: 10,
  },
  axisLabels: {
    width: 28,
    justifyContent: 'space-between',
    paddingTop: 6,
    paddingBottom: 18,
  },
  axisLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'right',
  },
  chartArea: {
    flex: 1,
  },
  labelsRow: {
    marginLeft: 38,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
});
