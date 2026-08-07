import { jsPDF } from 'jspdf';
import { Platform } from 'react-native';

export interface AnalyticsMetric {
  label: string;
  value: string;
  /** The figure printed under the value. Omitted when there is none. */
  change?: string;
  tone: 'positive' | 'negative' | 'neutral';
}

/** One bar of a breakdown. `value` sizes the bar; `display` is what's printed. */
export interface BreakdownRow {
  name: string;
  value: number;
  display: string;
}

export interface AnalyticsReportData {
  dateLabel: string;
  /** Which view was exported — 'Call Performance' / 'Sales Performance'. */
  viewLabel: string;
  metrics: readonly AnalyticsMetric[];
  /** The headline two-stat block: this month against the one before. */
  monthly: { title: string; thisMonth: string; previousMonth: string };
  /** Titled runs of bars, printed in order. */
  breakdowns: { title: string; rows: BreakdownRow[] }[];
}

type RGB = [number, number, number];

// Refined, restrained palette — navy accent on grays.
const INK: RGB = [17, 24, 39];
const NAVY: RGB = [30, 41, 84];
const MUTED: RGB = [100, 116, 139];
const FAINT: RGB = [148, 163, 184];
const HAIRLINE: RGB = [226, 232, 240];
const TRACK: RGB = [237, 240, 245];
const GREEN: RGB = [21, 128, 61];
const RED: RGB = [185, 28, 28];

/** Uppercase, letter-spaced label — used for the elegant small captions. */
function tracked(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options?: { align?: 'left' | 'right' | 'center'; space?: number },
) {
  doc.setCharSpace(options?.space ?? 0.6);
  doc.text(text, x, y, options?.align ? { align: options.align } : undefined);
  doc.setCharSpace(0);
}

/** Section heading: small tracked label with a hairline extending to the right. */
function sectionHeader(
  doc: jsPDF,
  x: number,
  y: number,
  right: number,
  label: string,
) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  tracked(doc, label.toUpperCase(), x, y);
  const textW = doc.getTextWidth(label.toUpperCase()) + label.length * 0.6;
  doc.setDrawColor(...HAIRLINE);
  doc.setLineWidth(0.3);
  doc.line(x + textW + 5, y - 1.4, right, y - 1.4);
}

function buildDoc(data: AnalyticsReportData) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  const right = pageWidth - margin;

  // ---- Letterhead ----
  // Thin accent rule across the very top.
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 1.4, 'F');

  let y = 24;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  tracked(doc, 'SEARLE · E-DETAILING', margin, y - 8, { space: 1 });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...INK);
  doc.text('Analytics & Reports', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(...MUTED);
  doc.text(data.viewLabel, margin, y + 7);

  // Right-aligned period block.
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...FAINT);
  tracked(doc, 'REPORTING PERIOD', right, y - 8, { align: 'right', space: 0.8 });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...INK);
  doc.text(data.dateLabel, right, y, { align: 'right' });

  y += 13;
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.5);
  doc.line(margin, y, right, y);
  y += 14;

  // ---- Key metrics ----
  sectionHeader(doc, margin, y, right, 'Key Metrics');
  y += 8;

  const count = data.metrics.length || 1;
  const gap = 5;
  const boxW = (contentWidth - gap * (count - 1)) / count;
  const boxH = 30;
  data.metrics.forEach((metric, index) => {
    const x = margin + index * (boxW + gap);
    // Clean bordered card — no fill, hairline border.
    doc.setDrawColor(...HAIRLINE);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, boxW, boxH, 2, 2, 'S');

    // label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...MUTED);
    tracked(doc, metric.label.toUpperCase(), x + 5, y + 8, { space: 0.4 });

    // value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...INK);
    doc.text(metric.value, x + 5, y + 20);

    // change — subtle colored text, no pill. Metrics carrying no figure simply
    // leave this line off. A 'neutral' one is progress through a target rather
    // than a movement, so it gets no +/- sign and no "vs prev." caption.
    if (metric.change) {
      const neutral = metric.tone === 'neutral';
      const positive = metric.tone === 'positive';
      const signed =
        metric.change.startsWith('+') || metric.change.startsWith('-');
      const changeText =
        neutral || signed
          ? metric.change
          : `${positive ? '+' : ''}${metric.change}`;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...(neutral ? NAVY : positive ? GREEN : RED));
      doc.text(changeText, x + 5, y + 26);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...FAINT);
      doc.text(
        neutral ? 'of plan' : 'vs prev.',
        x + 5 + doc.getTextWidth(changeText) + 2,
        y + 26,
      );
    }
  });

  y += boxH + 16;

  // ---- This month vs last ----
  sectionHeader(doc, margin, y, right, data.monthly.title);
  y += 10;

  // Two typographic stats with a hairline divider between.
  const half = contentWidth / 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  tracked(doc, 'THIS MONTH', margin, y, { space: 0.6 });
  tracked(doc, 'PREVIOUS MONTH', margin + half + 6, y, { space: 0.6 });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...NAVY);
  doc.text(data.monthly.thisMonth, margin, y + 11);
  doc.setTextColor(...INK);
  doc.text(data.monthly.previousMonth, margin + half + 6, y + 11);

  // vertical divider
  doc.setDrawColor(...HAIRLINE);
  doc.setLineWidth(0.3);
  doc.line(margin + half - 4, y - 2, margin + half - 4, y + 13);

  y += 24;

  // ---- Engagement breakdowns (horizontal bars, single accent) ----
  const labelW = 42;
  const valueW = 16;
  const barX = margin + labelW;
  const barMaxW = contentWidth - labelW - valueW;
  const rowH = 11;
  const barH = 5;

  /** One titled run of bars; returns the y to carry on from. */
  const breakdown = (title: string, rows: BreakdownRow[], top: number) => {
    sectionHeader(doc, margin, top, right, title);
    let rowTop = top + 11;

    if (rows.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text('No calls recorded this month.', margin, rowTop + 2);
      return rowTop + 10;
    }

    const maxValue = Math.max(1, ...rows.map((item) => item.value));

    rows.forEach((item, index) => {
      const rowY = rowTop + index * rowH;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(...INK);
      doc.text(item.name, margin, rowY + barH - 0.6, { maxWidth: labelW - 3 });

      doc.setFillColor(...TRACK);
      doc.roundedRect(barX, rowY, barMaxW, barH, 1.5, 1.5, 'F');
      const w = Math.max(2, (barMaxW * item.value) / maxValue);
      doc.setFillColor(...NAVY);
      doc.roundedRect(barX, rowY, w, barH, 1.5, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...INK);
      doc.text(item.display, right, rowY + barH - 0.6, { align: 'right' });
    });

    return rowTop + rows.length * rowH;
  };

  data.breakdowns.forEach((section) => {
    y = breakdown(section.title, section.rows, y) + 8;
  });

  // ---- Footer ----
  const footerY = pageHeight - 16;
  doc.setDrawColor(...HAIRLINE);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 6, right, footerY - 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...FAINT);
  tracked(doc, 'SEARLE · E-DETAILING', margin, footerY, { space: 0.8 });
  doc.text(`Generated ${new Date().toLocaleString()}`, right, footerY, {
    align: 'right',
  });

  return doc;
}

/** Generates the analytics PDF and downloads it (web) or saves + shares it (native). */
export async function exportAnalyticsPdf(data: AnalyticsReportData) {
  const doc = buildDoc(data);
  const fileName = `analytics-report-${new Date().toISOString().slice(0, 10)}.pdf`;

  if (Platform.OS === 'web') {
    // Triggers a normal browser file download — no print dialog.
    doc.save(fileName);
    return;
  }

  // Native: write the PDF to disk, then hand it to the OS share/save sheet.
  const FileSystem = await import('expo-file-system/legacy');
  const Sharing = await import('expo-sharing');
  const base64 = doc.output('datauristring').split('base64,')[1] ?? '';
  const uri = `${FileSystem.cacheDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(uri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Analytics Report',
      UTI: 'com.adobe.pdf',
    });
  }
}
