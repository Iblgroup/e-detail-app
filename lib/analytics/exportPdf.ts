import { jsPDF } from 'jspdf';
import { Platform } from 'react-native';

export interface AnalyticsMetric {
  label: string;
  value: string;
  change: string;
  tone: 'positive' | 'negative';
}

export interface AnalyticsReportData {
  dateLabel: string;
  metrics: readonly AnalyticsMetric[];
  rfi: { planned: number; completed: number };
  specialty: { label: string; value: number }[];
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
  doc.text('Field performance metrics', margin, y + 7);

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

    // change — subtle colored text, no pill
    const positive = metric.tone === 'positive';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...(positive ? GREEN : RED));
    const arrow = positive ? '+' : '';
    const changeText = metric.change.startsWith('+') || metric.change.startsWith('-')
      ? metric.change
      : `${arrow}${metric.change}`;
    doc.text(changeText, x + 5, y + 26);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...FAINT);
    doc.text('vs prev.', x + 5 + doc.getTextWidth(changeText) + 2, y + 26);
  });

  y += boxH + 16;

  // ---- Call completion (RFI) ----
  sectionHeader(doc, margin, y, right, 'Call Completion');
  y += 10;

  const completion =
    data.rfi.planned > 0
      ? Math.round((data.rfi.completed / data.rfi.planned) * 100)
      : 0;
  const outstanding = Math.max(0, data.rfi.planned - data.rfi.completed);

  // Two typographic stats with a hairline divider between.
  const half = contentWidth / 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  tracked(doc, 'PLANNED', margin, y, { space: 0.6 });
  tracked(doc, 'COMPLETED', margin + half + 6, y, { space: 0.6 });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...INK);
  doc.text(String(data.rfi.planned), margin, y + 11);
  doc.setTextColor(...NAVY);
  doc.text(String(data.rfi.completed), margin + half + 6, y + 11);

  // vertical divider
  doc.setDrawColor(...HAIRLINE);
  doc.setLineWidth(0.3);
  doc.line(margin + half - 4, y - 2, margin + half - 4, y + 13);

  y += 20;

  // Progress
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('Completion Progress', margin, y);
  doc.setTextColor(...INK);
  doc.setFontSize(10);
  doc.text(`${completion}%`, right, y, { align: 'right' });
  y += 3;

  const trackH = 3;
  doc.setFillColor(...TRACK);
  doc.roundedRect(margin, y, contentWidth, trackH, 1.5, 1.5, 'F');
  const fillW = (contentWidth * completion) / 100;
  if (fillW > 0) {
    doc.setFillColor(...NAVY);
    doc.roundedRect(margin, y, Math.max(fillW, 2), trackH, 1.5, 1.5, 'F');
  }
  y += trackH + 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(
    `${data.rfi.completed} of ${data.rfi.planned} planned calls completed   ·   ${outstanding} remaining`,
    margin,
    y,
  );

  y += 16;

  // ---- Specialty distribution (horizontal bars, single accent) ----
  sectionHeader(doc, margin, y, right, 'Specialty Distribution');
  y += 11;

  const maxValue = Math.max(1, ...data.specialty.map((item) => item.value));
  const labelW = 26;
  const valueW = 12;
  const barX = margin + labelW;
  const barMaxW = contentWidth - labelW - valueW;
  const rowH = 11;
  const barH = 5;

  data.specialty.forEach((item, index) => {
    const rowY = y + index * rowH;

    // label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.text(item.label, margin, rowY + barH - 0.6);

    // track + bar (single refined navy, subtle)
    doc.setFillColor(...TRACK);
    doc.roundedRect(barX, rowY, barMaxW, barH, 1.5, 1.5, 'F');
    const w = Math.max(2, (barMaxW * item.value) / maxValue);
    doc.setFillColor(...NAVY);
    doc.roundedRect(barX, rowY, w, barH, 1.5, 1.5, 'F');

    // value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.text(String(item.value), right, rowY + barH - 0.6, { align: 'right' });
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
