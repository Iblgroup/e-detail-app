import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { Colors } from '@/constants/theme';

export interface LineChartDataPoint {
  label: string;
  value: number;
}

interface AppLineChartProps {
  data: LineChartDataPoint[];
  /** Draws a dashed target line across the plot. */
  goal?: number;
  height?: number;
  maxValue?: number;
  lineColor?: string;
}

/** Shared with AppColumnChart so the two charts read as one family. */
const ACCENT = '#2BC48A';
const SECTIONS = 4;
/** Room for the y-axis labels. */
const AXIS_WIDTH = 34;

/**
 * The project's line/area chart. Built on react-native-gifted-charts — the same
 * library as AppColumnChart — so the two sit together instead of one looking
 * hand-drawn next to the other. It replaces a bespoke SVG implementation.
 *
 * The library needs a pixel width, so the container is measured and the point
 * spacing derived from it; that also keeps the last point on the axis rather
 * than running past the edge of the card.
 */
export function AppLineChart({
  data,
  goal,
  height = 220,
  maxValue,
  lineColor = ACCENT,
}: AppLineChartProps) {
  const [width, setWidth] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    setWidth((current) => (Math.abs(current - next) > 1 ? next : current));
  };

  if (data.length === 0) return null;

  const plotWidth = Math.max(0, width - AXIS_WIDTH);
  const spacing = data.length > 1 ? plotWidth / (data.length - 1) : plotWidth;

  const chartData = data.map((point) => ({
    value: point.value,
    label: point.label,
  }));

  return (
    <View style={styles.container} onLayout={onLayout}>
      {width > 0 ? (
        <LineChart
          data={chartData}
          width={plotWidth}
          height={height}
          spacing={spacing}
          initialSpacing={0}
          endSpacing={0}
          // Filled area beneath the line, as this screen had before.
          areaChart
          curved
          color={lineColor}
          thickness={2.5}
          startFillColor={lineColor}
          endFillColor={lineColor}
          startOpacity={0.22}
          endOpacity={0.02}
          dataPointsColor={lineColor}
          dataPointsRadius={3}
          maxValue={maxValue}
          noOfSections={SECTIONS}
          rulesColor={Colors.border}
          rulesType="dashed"
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor={Colors.border}
          yAxisTextStyle={styles.axisText}
          xAxisLabelTextStyle={styles.axisText}
          // The dashed target the line is measured against.
          showReferenceLine1={goal != null}
          referenceLine1Position={goal}
          referenceLine1Config={{
            color: Colors.textMuted,
            dashWidth: 4,
            dashGap: 4,
            thickness: 1,
          }}
          disableScroll
          isAnimated
          animationDuration={400}
        />
      ) : (
        <View style={{ height }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  axisText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
});
