import { ChecksumItem, OutputCase, OutputFormat } from '../types';
import { hexToBase64 } from './checksumEngine';
export async function copyToClipboard(text: string): Promise<boolean> { try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; } else { const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; document.body.appendChild(ta); ta.focus(); ta.select(); const res = document.execCommand('copy'); document.body.removeChild(ta); return res; } } catch { return false; } }
export function formatHashOutput(h: string, c: OutputCase, f: OutputFormat): string { if (!h) return ''; return f === 'base64' ? hexToBase64(h) : c === 'uppercase' ? h.toUpperCase() : h.toLowerCase(); }
export function generateSummaryReport(item: ChecksumItem, c: OutputCase, f: OutputFormat): string { return 'CHECKSUM REPORT: ' + item.name + ' (' + item.size + ' bytes)'; }
