import { ParsedUA, ExportFormat } from '../types/useragent';
import { formatAsTextReport } from './clipboard';

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportUARecords(
  records: ParsedUA[],
  format: ExportFormat,
  filenamePrefix = 'velnox_ua_report'
) {
  if (!records || records.length === 0) return;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `${filenamePrefix}_${timestamp}.${format}`;

  if (format === 'json') {
    const jsonStr = JSON.stringify(records, null, 2);
    downloadFile(jsonStr, filename, 'application/json');
  } else if (format === 'txt') {
    const txtContent = records.map((r) => formatAsTextReport(r)).join('\n\n\n');
    downloadFile(txtContent, filename, 'text/plain');
  } else if (format === 'csv') {
    const csvContent = convertToCSV(records);
    downloadFile(csvContent, filename, 'text/csv');
  }
}

function convertToCSV(records: ParsedUA[]): string {
  const headers = [
    'ID',
    'Timestamp',
    'Human Summary',
    'Browser Name',
    'Browser Version',
    'Browser Vendor',
    'OS Name',
    'OS Version',
    'OS Category',
    'Engine Name',
    'Device Type',
    'Device Vendor',
    'Device Model',
    'CPU Architecture',
    'CPU Bitness',
    'Is Bot',
    'Is AI Bot',
    'Bot Name',
    'Raw User-Agent',
  ];

  const escapeCSV = (str: any) => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = records.map((r) => [
    escapeCSV(r.id),
    escapeCSV(r.timestamp),
    escapeCSV(r.humanSummary),
    escapeCSV(r.browser.name),
    escapeCSV(r.browser.version),
    escapeCSV(r.browser.vendor),
    escapeCSV(r.os.name),
    escapeCSV(r.os.version),
    escapeCSV(r.os.category),
    escapeCSV(r.engine.name),
    escapeCSV(r.device.type),
    escapeCSV(r.device.vendor),
    escapeCSV(r.device.model),
    escapeCSV(r.cpu.architecture),
    escapeCSV(r.cpu.bitness),
    escapeCSV(r.bot.isBot ? 'TRUE' : 'FALSE'),
    escapeCSV(r.bot.isAIBot ? 'TRUE' : 'FALSE'),
    escapeCSV(r.bot.botName || ''),
    escapeCSV(r.rawUA),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}