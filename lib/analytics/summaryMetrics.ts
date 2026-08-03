/**
 * The four headline figures shown on both Analytics and the Dashboard.
 *
 * PLACEHOLDER DATA — these are not yet computed from call_tracking. Replace this
 * module with a query when the numbers go live; both screens pick it up.
 */
export interface SummaryMetric {
  label: string;
  value: string;
  change: string;
  tone: 'positive' | 'negative';
}

export const SUMMARY_METRICS: readonly SummaryMetric[] = [
  { label: 'Total Calls', value: '284', change: '+12', tone: 'positive' },
  { label: 'Avg Duration', value: '14m', change: '-2%', tone: 'negative' },
  { label: 'Goal Completion', value: '92%', change: '+5%', tone: 'positive' },
  { label: 'Doctor Rating', value: '4.8', change: '+0.2', tone: 'positive' },
] as const;
