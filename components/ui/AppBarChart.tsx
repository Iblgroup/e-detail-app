import { Colors } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

export interface BarChartDataPoint {
  label: string;
  value: number;
  valueLabel?: string;
}

interface AppBarChartProps {
  data: BarChartDataPoint[];
  barColor?: string;
  height?: number;
  maxValue?: number;
  showYAxis?: boolean;
  showValueLabels?: boolean;
  valueFormatter?: (value: number) => string;
}

export function AppBarChart({
  data,
  barColor = Colors.primary,
  height = 82,
  maxValue,
  showYAxis = false,
  showValueLabels = false,
  valueFormatter = (value) => String(value),
}: AppBarChartProps) {
  const max = maxValue ?? Math.max(...data.map((item) => item.value), 1);
  const minVisibleHeight = 6;
  const yAxisTicks = [max, max * 0.75, max * 0.5, max * 0.25, 0];

  return (
    <View style={styles.container}>
      <View style={styles.chartRow}>
        {showYAxis && (
          <View style={[styles.axisLabels, { height }]}>
            {yAxisTicks.map((tick) => (
              <Text key={tick} style={styles.axisLabel}>
                {Math.round(tick)}
              </Text>
            ))}
          </View>
        )}

        <View style={[styles.chartArea, { height }]}>
          {showYAxis && (
            <View style={styles.grid}>
              {yAxisTicks.map((tick) => (
                <View key={tick} style={styles.gridLine} />
              ))}
            </View>
          )}

          <View style={[styles.barsRow, { height }]}>
            {data.map((item) => {
              const rawHeight = (item.value / max) * height;
              const barHeight = item.value > 0 ? Math.max(minVisibleHeight, rawHeight) : minVisibleHeight;

              return (
                <View key={item.label} style={styles.barColumn}>
                  <View style={styles.barSlot}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: barColor,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.labelsRow}>
        {showYAxis && <View style={styles.axisLabelSpacer} />}
        <View style={styles.dataLabelsRow}>
          {data.map((item) => (
            <View key={item.label} style={styles.labelColumn}>
              {showValueLabels && (
                <Text style={styles.valueLabel}>{item.valueLabel ?? valueFormatter(item.value)}</Text>
              )}
              <Text style={styles.label}>{item.label}</Text>
            </View>
          ))}
        </View>
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
    paddingTop: 1,
  },
  axisLabel: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    position: 'relative',
  },
  barColumn: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barSlot: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '62%',
    borderRadius: 4,
  },
  labelsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  axisLabelSpacer: {
    width: 28,
  },
  dataLabelsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  labelColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  valueLabel: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  label: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
});
