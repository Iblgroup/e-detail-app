import type { ColumnChartPoint } from '@/components/ui/AppColumnChart';
import type { SummaryMetric } from '@/lib/analytics/summaryMetrics';

/**
 * DEMO DATA for the Sales Performance view.
 *
 * There is NO sales source wired up yet — every figure here is invented so the
 * view can be reviewed as a layout. The screen says so on its face (see the
 * notice banner on Analytics); nothing here is ever shown without it.
 *
 * Delete this module the moment real sales data lands. Only app/(tabs)/analytics
 * imports it, so nothing else has to change.
 */

/** Completed sales this month vs last, mirroring the Calls Completed card. */
export const SALES_MONTHLY = {
  thisMonth: 'PKR 1.24M',
  previousMonth: 'PKR 1.11M',
};

/** The headline row, mirroring the call metrics one for one. */
export const SALES_METRICS: readonly SummaryMetric[] = [
  {
    label: 'Sales Value / Target',
    value: 'PKR 1.24M / 1.80M',
    change: '69%',
    tone: 'neutral',
  },
  {
    label: 'Productive / Doctors',
    value: '84 / 130',
    change: '65%',
    tone: 'neutral',
  },
  { label: 'Avg Order Value', value: 'PKR 14.8K', change: '+6%', tone: 'positive' },
];

export const SALES_BY_SPECIALTY: ColumnChartPoint[] = [
  { label: 'Cardiologists', value: 412, topLabel: 'PKR 412K' },
  { label: 'Physicians', value: 318, topLabel: 'PKR 318K' },
  { label: 'Family Physicians', value: 205, topLabel: 'PKR 205K' },
  { label: 'RMOs', value: 164, topLabel: 'PKR 164K' },
  { label: 'Neurologists', value: 141, topLabel: 'PKR 141K' },
];

export const SALES_BY_BRAND: ColumnChartPoint[] = [
  { label: 'EXTOR', value: 386, topLabel: 'PKR 386K' },
  { label: 'RANCARD XR', value: 297, topLabel: 'PKR 297K' },
  { label: 'EMSYN MET', value: 244, topLabel: 'PKR 244K' },
  { label: 'Cardio-Health Pro', value: 168, topLabel: 'PKR 168K' },
  { label: 'EMSYIN LEE', value: 145, topLabel: 'PKR 145K' },
];
