'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Sparkles,
  Copy,
  Check,
  Upload,
  CheckCircle2,
  XCircle,
  FileText,
  Cpu,
  Download,
  Terminal,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

type InputMode = 'text' | 'hex' | 'binary';
type LineEnding = 'preserve' | 'lf' | 'crlf';

// RFC 1321 MD5 implementation for Uint8Array (client-side native)
function computeMd5(bytes: Uint8Array): string {
  const K = new Uint32Array([
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
  ]);
  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9,
    14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  const origLen = bytes.length;
  const paddedLen = ((origLen + 8) >>> 6) * 64 + 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[origLen] = 0x80;
  const bitLen = origLen * 8;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 8, bitLen >>> 0, true);
  view.setUint32(paddedLen - 4, Math.floor(bitLen / 0x100000000), true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let offset = 0; offset < paddedLen; offset += 64) {
    const M = new Uint32Array(16);
    for (let j = 0; j < 16; j++) M[j] = view.getUint32(offset + j * 4, true);

    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;

    for (let i = 0; i < 64; i++) {
      let F: number;
      let g: number;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      const temp = D;
      D = C;
      C = B;
      const sum = (A + F + K[i] + M[g]) >>> 0;
      B = (B + ((sum << S[i]) | (sum >>> (32 - S[i])))) >>> 0;
      A = temp;
    }
    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  const out = new Uint8Array(16);
  const ov = new DataView(out.buffer);
  ov.setUint32(0, a0, true);
  ov.setUint32(4, b0, true);
  ov.setUint32(8, c0, true);
  ov.setUint32(12, d0, true);
  return Array.from(out)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// IEEE 802.3 CRC-32
const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function computeCrc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// CRC-16 CCITT-FALSE (Polynomial 0x1021, Init 0xFFFF)
function computeCrc16(bytes: Uint8Array): number {
  let crc = 0xffff;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i] << 8;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc;
}

// CRC-16 Modbus (Polynomial 0x8005 reversed -> 0xA001, Init 0xFFFF)
function computeCrc16Modbus(bytes: Uint8Array): number {
  let crc = 0xffff;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    for (let j = 0; j < 8; j++) {
      if ((crc & 1) !== 0) {
        crc = (crc >>> 1) ^ 0xa001;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return crc & 0xffff;
}

// Adler-32 (RFC 1950 / zlib)
function computeAdler32(bytes: Uint8Array): number {
  let a = 1;
  let b = 0;
  const MOD_ADLER = 65521;
  for (let i = 0; i < bytes.length; i++) {
    a = (a + bytes[i]) % MOD_ADLER;
    b = (b + a) % MOD_ADLER;
  }
  return ((b << 16) | a) >>> 0;
}

// Fletcher-16 (RFC 1146)
function computeFletcher16(bytes: Uint8Array): number {
  let sum1 = 0;
  let sum2 = 0;
  for (let i = 0; i < bytes.length; i++) {
    sum1 = (sum1 + bytes[i]) % 255;
    sum2 = (sum2 + sum1) % 255;
  }
  return ((sum2 << 8) | sum1) & 0xffff;
}

function normalizeLineEndings(str: string, ending: LineEnding): string {
  if (ending === 'preserve') return str;
  const unified = str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return ending === 'crlf' ? unified.replace(/\n/g, '\r\n') : unified;
}

function parseInputToBytes(
  input: string,
  mode: InputMode,
  lineEnding: LineEnding
): { bytes: Uint8Array; error: string | null } {
  if (!input) return { bytes: new Uint8Array(0), error: null };
  if (mode === 'text') {
    const processed = normalizeLineEndings(input, lineEnding);
    return { bytes: new TextEncoder().encode(processed), error: null };
  }
  if (mode === 'hex') {
    const cleaned = input.replace(/0x/gi, '').replace(/[^0-9a-fA-F]/g, '');
    if (cleaned.length === 0) return { bytes: new Uint8Array(0), error: 'hex' };
    if (cleaned.length % 2 !== 0) return { bytes: new Uint8Array(0), error: 'hex' };
    const arr = new Uint8Array(cleaned.length / 2);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = parseInt(cleaned.slice(i * 2, i * 2 + 2), 16);
    }
    return { bytes: arr, error: null };
  }
  // binary
  const bits = input.replace(/[^01]/g, '');
  if (bits.length === 0 || bits.length % 8 !== 0) {
    return { bytes: new Uint8Array(0), error: 'binary' };
  }
  const arr = new Uint8Array(bits.length / 8);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  }
  return { bytes: arr, error: null };
}

// Cleans vendor formatted hash strings (e.g., "SHA256: abc...", "abc *file.iso", "0xabc")
function cleanExpectedHash(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^(?:sha(?:256|512|1)|md5|crc(?:32|16)?|modbus|checksum)\s*[:=]\s*/i, '');
  const match = s.match(/^([0-9a-fA-F]{2,128})\s+[\*]?.*$/);
  if (match) {
    s = match[1];
  }
  s = s.replace(/['"]/g, '').replace(/^0x/i, '').replace(/\s+/g, '');
  return s;
}

function detectExpectedHashType(clean: string): string {
  if (!/^[0-9a-fA-F]+$/.test(clean)) return '';
  if (clean.length === 2) return "8-bit (Mod 256 / XOR / Two's Comp)";
  if (clean.length === 4) return '16-bit (CRC-16 Modbus / CCITT / Sum16 / Fletcher)';
  if (clean.length === 8) return '32-bit (CRC-32 / Adler-32)';
  if (clean.length === 32) return 'MD5 (128-bit)';
  if (clean.length === 40) return 'SHA-1 (160-bit)';
  if (clean.length === 64) return 'SHA-256 (256-bit)';
  if (clean.length === 128) return 'SHA-512 (512-bit)';
  return '';
}

export default function ChecksumClient() {
  const tUI = useTranslations('ToolUI.checksumCalculator');

  const [mode, setMode] = useState<InputMode>('text');
  const [text, setText] = useState('Hello VelnoxLabs!');
  const [lineEnding, setLineEnding] = useState<LineEnding>('preserve');
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uppercase, setUppercase] = useState(false);
  const [rawExpectedHash, setRawExpectedHash] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cryptoHashes, setCryptoHashes] = useState({
    md5: '',
    sha1: '',
    sha256: '',
    sha512: '',
  });

  const parsedInput = useMemo(() => {
    if (fileBytes) return { bytes: fileBytes, error: null };
    return parseInputToBytes(text, mode, lineEnding);
  }, [fileBytes, text, mode, lineEnding]);

  // Synchronous non-crypto checksums
  const simpleChecksums = useMemo(() => {
    const b = parsedInput.bytes;
    if (b.length === 0) return null;

    let sum = 0;
    let xorVal = 0;
    for (let i = 0; i < b.length; i++) {
      sum += b[i];
      xorVal ^= b[i];
    }

    const mod256 = sum & 0xff;
    const twosComp = ((~mod256 + 1) & 0xff) >>> 0;
    const sum16 = sum & 0xffff;
    const crc16 = computeCrc16(b);
    const crc16Modbus = computeCrc16Modbus(b);
    const adler32 = computeAdler32(b);
    const fletcher16 = computeFletcher16(b);
    const crc32 = computeCrc32(b);

    return {
      mod256,
      twosComp,
      xorVal,
      sum16,
      crc16,
      crc16Modbus,
      adler32,
      fletcher16,
      crc32,
      totalSum: sum,
    };
  }, [parsedInput.bytes]);

  // Compute MD5 + Web Crypto SHA hashes
  useEffect(() => {
    let cancelled = false;
    const b = parsedInput.bytes;
    if (b.length === 0) {
      setCryptoHashes({ md5: '', sha1: '', sha256: '', sha512: '' });
      return;
    }

    const md5Hex = computeMd5(b);
    const bufferCopy = new Uint8Array(b).buffer;

    Promise.all([
      crypto.subtle.digest('SHA-1', bufferCopy),
      crypto.subtle.digest('SHA-256', bufferCopy),
      crypto.subtle.digest('SHA-512', bufferCopy),
    ])
      .then(([s1, s256, s512]) => {
        if (cancelled) return;
        const toHex = (buf: ArrayBuffer) =>
          Array.from(new Uint8Array(buf))
            .map((x) => x.toString(16).padStart(2, '0'))
            .join('');
        setCryptoHashes({
          md5: md5Hex,
          sha1: toHex(s1),
          sha256: toHex(s256),
          sha512: toHex(s512),
        });
      })
      .catch(() => {
        if (!cancelled) {
          setCryptoHashes({ md5: md5Hex, sha1: '', sha256: '', sha512: '' });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [parsedInput.bytes]);

  const fmtHex = (val: string) => (uppercase ? val.toUpperCase() : val.toLowerCase());

  const allEntries = useMemo(() => {
    if (!simpleChecksums) return [];
    const hex8 = (n: number) => fmtHex(n.toString(16).padStart(2, '0'));
    const hex16 = (n: number) => fmtHex(n.toString(16).padStart(4, '0'));
    const hex32 = (n: number) => fmtHex(n.toString(16).padStart(8, '0'));

    return [
      {
        id: 'sha256',
        label: 'SHA-256 (256-bit)',
        hex: fmtHex(cryptoHashes.sha256),
        badge: 'Secure Hash',
        extra: 'NIST FIPS 180-4 standard',
      },
      {
        id: 'md5',
        label: 'MD5 (128-bit)',
        hex: fmtHex(cryptoHashes.md5),
        badge: 'File Integrity',
        extra: 'RFC 1321 legacy digest',
      },
      {
        id: 'crc32',
        label: 'CRC-32 (IEEE 802.3)',
        hex: hex32(simpleChecksums.crc32),
        badge: 'Network / Zip',
        extra: `Dec: ${simpleChecksums.crc32}`,
      },
      {
        id: 'crc16modbus',
        label: tUI('algoCrc16Modbus'),
        hex: hex16(simpleChecksums.crc16Modbus),
        badge: 'Industrial / PLC',
        extra: `Poly: 0xA001 · Init: 0xFFFF · Dec: ${simpleChecksums.crc16Modbus}`,
      },
      {
        id: 'crc16',
        label: 'CRC-16 (CCITT-FALSE)',
        hex: hex16(simpleChecksums.crc16),
        badge: 'Telecom / Embedded',
        extra: `Poly: 0x1021 · Dec: ${simpleChecksums.crc16}`,
      },
      {
        id: 'adler32',
        label: tUI('algoAdler32'),
        hex: hex32(simpleChecksums.adler32),
        badge: 'zlib / RFC 1950',
        extra: `Base: 65521 · Dec: ${simpleChecksums.adler32}`,
      },
      {
        id: 'fletcher16',
        label: tUI('algoFletcher16'),
        hex: hex16(simpleChecksums.fletcher16),
        badge: 'RFC 1146',
        extra: `Modulo 255 · Dec: ${simpleChecksums.fletcher16}`,
      },
      {
        id: 'mod256',
        label: tUI('algoMod256'),
        hex: hex8(simpleChecksums.mod256),
        badge: '8-bit Sum',
        extra: `Dec: ${simpleChecksums.mod256} · Bin: ${simpleChecksums.mod256.toString(2).padStart(8, '0')}`,
      },
      {
        id: 'twos',
        label: tUI('algoTwos'),
        hex: hex8(simpleChecksums.twosComp),
        badge: 'Intel HEX Check',
        extra: `Dec: ${simpleChecksums.twosComp} · Bin: ${simpleChecksums.twosComp.toString(2).padStart(8, '0')}`,
      },
      {
        id: 'xor',
        label: tUI('algoXor'),
        hex: hex8(simpleChecksums.xorVal),
        badge: 'BCC Parity',
        extra: `Dec: ${simpleChecksums.xorVal} · Bin: ${simpleChecksums.xorVal.toString(2).padStart(8, '0')}`,
      },
      {
        id: 'sum16',
        label: tUI('algo16Bit'),
        hex: hex16(simpleChecksums.sum16),
        badge: 'TCP / UDP Header',
        extra: `Dec: ${simpleChecksums.sum16}`,
      },
      {
        id: 'sha1',
        label: 'SHA-1 (160-bit)',
        hex: fmtHex(cryptoHashes.sha1),
        badge: 'Git SHA-1',
        extra: 'Deprecated for crypto signatures',
      },
      {
        id: 'sha512',
        label: 'SHA-512 (512-bit)',
        hex: fmtHex(cryptoHashes.sha512),
        badge: 'High Security',
        extra: 'SHA-2 family 64-bit words',
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simpleChecksums, cryptoHashes, uppercase, tUI]);

  const cleanExpected = useMemo(() => cleanExpectedHash(rawExpectedHash), [rawExpectedHash]);
  const detectedType = useMemo(() => detectExpectedHashType(cleanExpected), [cleanExpected]);

  const matchedEntry = useMemo(() => {
    if (!cleanExpected) return null;
    return allEntries.find((e) => e.hex.toLowerCase() === cleanExpected.toLowerCase()) || null;
  }, [cleanExpected, allEntries]);

  // AI Diagnostic Hint for Mismatch
  const aiDiagnostic = useMemo(() => {
    if (!cleanExpected || matchedEntry) return null;
    const len = cleanExpected.length;
    if (len === 64 && mode === 'text' && text.includes('\n')) {
      return tUI('diagLineEnding', { algo: 'SHA-256' });
    }
    if (len === 32 && mode === 'text' && text.includes('\n')) {
      return tUI('diagLineEnding', { algo: 'MD5' });
    }
    if (![2, 4, 8, 32, 40, 64, 128].includes(len)) {
      return tUI('diagTruncated', { len: String(len) });
    }
    return null;
  }, [cleanExpected, matchedEntry, mode, text, tUI]);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        setFileBytes(new Uint8Array(reader.result));
        setFileName(file.name);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleCopy = (id: string, val: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleExportManifest = (algo: 'sha256' | 'md5') => {
    const hash = algo === 'sha256' ? cryptoHashes.sha256 : cryptoHashes.md5;
    if (!hash) return;
    const targetName = fileName || 'checksum-input.txt';
    const content = `${fmtHex(hash)}  *${targetName}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${targetName}.${algo}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const activeTargetName = fileName || 'input.txt';

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading
          title={tUI('title')}
          subtitle={tUI('subtitle')}
          toolSlug="checksum-calculator"
        />

        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            marginTop: 'var(--space-6)',
            marginBottom: '28px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* Top Bar: Input Mode Tabs, Line-Ending Switcher, Uppercase Toggle */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            {/* Input Mode Selector */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(
                [
                  { id: 'text', label: tUI('modeText') },
                  { id: 'hex', label: tUI('modeHex') },
                  { id: 'binary', label: tUI('modeBinary') },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setFileBytes(null);
                    setFileName(null);
                    setMode(m.id);
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border:
                      !fileBytes && mode === m.id
                        ? '1px solid rgba(59, 130, 246, 0.5)'
                        : '1px solid var(--border-color)',
                    backgroundColor:
                      !fileBytes && mode === m.id ? 'rgba(59, 130, 246, 0.18)' : 'var(--bg-page)',
                    color: !fileBytes && mode === m.id ? '#60a5fa' : 'var(--text-muted)',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Quick Settings: Line Ending (Text Mode only) & Upper/Lower Hex */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {!fileBytes && mode === 'text' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span
                    style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}
                  >
                    {tUI('lineEndingsLabel')}:
                  </span>
                  <select
                    value={lineEnding}
                    onChange={(e) => setLineEnding(e.target.value as LineEnding)}
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '5px 8px',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="preserve">{tUI('lineEndingsPreserve')}</option>
                    <option value="lf">{tUI('lineEndingsLf')}</option>
                    <option value="crlf">{tUI('lineEndingsCrlf')}</option>
                  </select>
                </div>
              )}

              <button
                type="button"
                onClick={() => setUppercase((u) => !u)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)',
                  backgroundColor: uppercase ? 'rgba(16, 185, 129, 0.18)' : 'var(--bg-page)',
                  color: uppercase ? '#34d399' : 'var(--text-muted)',
                }}
              >
                {uppercase ? 'HEX: UPPER' : 'hex: lower'}
              </button>
            </div>
          </div>

          {/* Drag & Drop File Upload Zone OR Textarea */}
          {fileBytes && fileName ? (
            <div
              style={{
                backgroundColor: 'var(--bg-page)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    backgroundColor: 'rgba(139, 92, 246, 0.15)',
                    padding: '10px',
                    borderRadius: '10px',
                    color: '#a78bfa',
                  }}
                >
                  <FileText size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.94rem' }}>
                    {fileName}
                  </div>
                  <div
                    style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}
                  >
                    {tUI('fileSize')}: {(fileBytes.length / 1024).toFixed(1)} KB (
                    {fileBytes.length.toLocaleString()} bytes)
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setFileBytes(null);
                    setFileName(null);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={13} />
                  {tUI('clearFile')}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '18px' }}>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: isDragging ? '2px dashed #a78bfa' : '1px dashed var(--border-color)',
                  borderRadius: '10px',
                  backgroundColor: isDragging ? 'rgba(139, 92, 246, 0.08)' : 'rgba(0, 0, 0, 0.02)',
                  padding: '14px',
                  marginBottom: '10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: isDragging ? '#a78bfa' : 'var(--text-muted)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                >
                  <Upload size={16} />
                  <span>{isDragging ? tUI('dragDropActive') : tUI('dragDropText')}</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f);
                  }}
                />
              </div>

              <textarea
                rows={4}
                placeholder={
                  mode === 'hex'
                    ? '48 65 6C 6C 6F'
                    : mode === 'binary'
                      ? '01001000 01100101 01101100 01101100 01101111'
                      : tUI('inputPlaceholder')
                }
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: parsedInput.error ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: 'var(--text-main)',
                  padding: '14px',
                  fontSize: '0.92rem',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'monospace',
                }}
              />
              {parsedInput.error && (
                <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '6px' }}>
                  {parsedInput.error === 'hex' ? tUI('invalidHexHint') : tUI('invalidBinaryHint')}
                </div>
              )}
            </div>
          )}

          {/* AI Checksum Verifier & Auto-Detector */}
          <div
            style={{
              backgroundColor: 'rgba(139, 92, 246, 0.07)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '22px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  color: '#a78bfa',
                }}
              >
                <Sparkles size={16} />
                {tUI('verifyTitle')}
              </span>
              {detectedType && (
                <span
                  style={{
                    fontSize: '0.76rem',
                    color: '#60a5fa',
                    backgroundColor: 'rgba(59, 130, 246, 0.14)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontWeight: 600,
                  }}
                >
                  {tUI('detectedFormat', { format: detectedType })}
                </span>
              )}
            </div>

            <input
              type="text"
              value={rawExpectedHash}
              onChange={(e) => setRawExpectedHash(e.target.value)}
              placeholder={tUI('verifyPlaceholder')}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'var(--text-main)',
                fontFamily: 'monospace',
                fontSize: '0.84rem',
                outline: 'none',
              }}
            />

            {/* Match or Mismatch Status */}
            {cleanExpected && allEntries.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                {matchedEntry ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#34d399',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                    }}
                  >
                    <CheckCircle2 size={17} />
                    <span>{tUI('matchFound', { algo: matchedEntry.label })}</span>
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#f87171',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                      }}
                    >
                      <XCircle size={17} />
                      <span>{tUI('noMatchFound')}</span>
                    </div>
                    {aiDiagnostic && (
                      <div
                        style={{
                          marginTop: '6px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '6px',
                          color: '#fbbf24',
                          fontSize: '0.78rem',
                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                          padding: '8px 10px',
                          borderRadius: '6px',
                        }}
                      >
                        <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{aiDiagnostic}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* All-in-One Checksum Matrix Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px',
            }}
          >
            {allEntries.map((entry) => {
              const isMatched =
                Boolean(cleanExpected) && entry.hex.toLowerCase() === cleanExpected.toLowerCase();
              return (
                <div
                  key={entry.id}
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: isMatched ? '2px solid #10b981' : '1px solid var(--border-color)',
                    boxShadow: isMatched ? '0 0 14px rgba(16, 185, 129, 0.3)' : 'none',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '8px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#60a5fa' }}>
                        {entry.label}
                      </span>
                      {entry.badge && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                            color: 'var(--text-muted)',
                            fontWeight: 600,
                          }}
                        >
                          {entry.badge}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(entry.id, entry.hex)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor:
                          copiedId === entry.id ? '#10b981' : 'rgba(59, 130, 246, 0.16)',
                        color: copiedId === entry.id ? '#ffffff' : '#60a5fa',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      {copiedId === entry.id ? <Check size={12} /> : <Copy size={12} />}
                      {copiedId === entry.id ? tUI('copied') : tUI('copy')}
                    </button>
                  </div>

                  <code
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.84rem',
                      color: isMatched ? '#10b981' : '#34d399',
                      wordBreak: 'break-all',
                      lineHeight: 1.4,
                    }}
                  >
                    {entry.hex || '—'}
                  </code>

                  {entry.extra && (
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {entry.extra}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick 1-Click Manifest Exports */}
          {cryptoHashes.sha256 && (
            <div
              style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {tUI('exportTitle') || '1-Click Verification Manifest:'}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleExportManifest('sha256')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: '#60a5fa',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Download size={13} />
                  {tUI('exportSha256')}
                </button>
                <button
                  type="button"
                  onClick={() => handleExportManifest('md5')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-page)',
                    color: 'var(--text-main)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Download size={13} />
                  {tUI('exportMd5')}
                </button>
              </div>
            </div>
          )}

          {/* Educational Byte-by-Byte Math Breakdown */}
          {simpleChecksums && parsedInput.bytes.length > 0 && (
            <div
              style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-color)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginBottom: '8px',
                }}
              >
                <Cpu size={15} style={{ color: '#60a5fa' }} />
                <span>{tUI('byteBreakdownTitle')}</span>
              </div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.76rem',
                  color: 'var(--text-muted)',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  overflowX: 'auto',
                }}
              >
                {Array.from(parsedInput.bytes.slice(0, 10))
                  .map((b) => `0x${b.toString(16).padStart(2, '0').toUpperCase()}`)
                  .join(' + ')}
                {parsedInput.bytes.length > 10 ? ` + ... (${parsedInput.bytes.length} bytes)` : ''}{' '}
                = {simpleChecksums.totalSum} (mod 256 ={' '}
                <strong style={{ color: '#34d399' }}>
                  0x{simpleChecksums.mod256.toString(16).padStart(2, '0').toUpperCase()}
                </strong>
                , Modbus CRC ={' '}
                <strong style={{ color: '#60a5fa' }}>
                  0x{simpleChecksums.crc16Modbus.toString(16).padStart(4, '0').toUpperCase()}
                </strong>
                )
              </div>
            </div>
          )}

          {/* Quick Terminal CLI Commands Generator */}
          <div
            style={{
              marginTop: '18px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '10px',
              }}
            >
              <Terminal size={15} style={{ color: '#a78bfa' }} />
              <span>{tUI('cliTitle')}</span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '8px',
              }}
            >
              {[
                {
                  id: 'cmd-ps',
                  label: 'PowerShell (Windows)',
                  cmd: `Get-FileHash -Algorithm SHA256 "${activeTargetName}"`,
                },
                {
                  id: 'cmd-bash',
                  label: 'Linux / macOS Bash',
                  cmd: `sha256sum "${activeTargetName}"`,
                },
                {
                  id: 'cmd-certutil',
                  label: 'Windows Command Prompt',
                  cmd: `certutil -hashfile "${activeTargetName}" SHA256`,
                },
              ].map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '4px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}
                    >
                      {item.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, item.cmd)}
                      style={{
                        padding: '2px 6px',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        backgroundColor:
                          copiedId === item.id ? '#10b981' : 'rgba(59, 130, 246, 0.14)',
                        color: copiedId === item.id ? '#ffffff' : '#60a5fa',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      {copiedId === item.id ? tUI('copied') : tUI('copy')}
                    </button>
                  </div>
                  <code
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.74rem',
                      color: 'var(--text-main)',
                      wordBreak: 'break-all',
                    }}
                  >
                    {item.cmd}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Algorithm Comparison Table Section for Technical SEO */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px',
            overflowX: 'auto',
          }}
        >
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              marginBottom: '16px',
            }}
          >
            {tUI('comparisonTitle')}
          </h3>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.84rem',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {tUI('colAlgorithm')}
                </th>
                <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {tUI('colBits')}
                </th>
                <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {tUI('colType')}
                </th>
                <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {tUI('colUseCase')}
                </th>
                <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {tUI('colSecurity')}
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  name: 'SHA-256',
                  bits: '256 bits',
                  type: 'Cryptographic Hash',
                  useCase: 'Software integrity, Bitcoin, TLS certificates',
                  sec: 'Cryptographically Secure (Zero collisions)',
                },
                {
                  name: 'MD5',
                  bits: '128 bits',
                  type: 'Legacy Hash',
                  useCase: 'Quick file matching, legacy checksum verification',
                  sec: 'Insecure for auth (Collision vulnerable)',
                },
                {
                  name: 'CRC-32',
                  bits: '32 bits',
                  type: 'Cyclic Redundancy Check',
                  useCase: 'ZIP / PNG compression, Ethernet packets',
                  sec: 'Non-cryptographic (Accidental errors only)',
                },
                {
                  name: 'CRC-16 Modbus',
                  bits: '16 bits',
                  type: 'Industrial Polynomial',
                  useCase: 'Modbus RTU, PLC telemetry, IoT sensors',
                  sec: 'Non-cryptographic (Bit-flip detection)',
                },
                {
                  name: 'Adler-32',
                  bits: '32 bits',
                  type: 'Dual Rolling Sum',
                  useCase: 'zlib decompression, rsync rolling checksum',
                  sec: 'Non-cryptographic (Speed optimized)',
                },
                {
                  name: '8-bit Modulo 256',
                  bits: '8 bits',
                  type: 'Arithmetic Sum',
                  useCase: 'Microcontrollers, Intel HEX, basic byte parity',
                  sec: 'Non-cryptographic (Basic parity only)',
                },
              ].map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: idx % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#60a5fa' }}>
                    {row.name}
                  </td>
                  <td
                    style={{
                      padding: '10px 12px',
                      color: 'var(--text-main)',
                      fontFamily: 'monospace',
                    }}
                  >
                    {row.bits}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{row.type}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-main)' }}>{row.useCase}</td>
                  <td
                    style={{
                      padding: '10px 12px',
                      color: row.sec.includes('Secure') ? '#34d399' : 'var(--text-muted)',
                    }}
                  >
                    {row.sec}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ToolSeoContent
          toolSlug="checksum-calculator"
          toolName={tUI('title')}
          description={tUI('subtitle')}
          customAbout={tUI('aboutText')}
          customFeatures={[tUI('feature1'), tUI('feature2'), tUI('feature3'), tUI('feature4')]}
          customSteps={[
            { title: tUI('step1Title'), body: tUI('step1Body') },
            { title: tUI('step2Title'), body: tUI('step2Body') },
            { title: tUI('step3Title'), body: tUI('step3Body') },
          ]}
          customFaqs={[
            { q: tUI('faq1Q'), a: tUI('faq1A') },
            { q: tUI('faq2Q'), a: tUI('faq2A') },
            { q: tUI('faq3Q'), a: tUI('faq3A') },
            { q: tUI('faq4Q'), a: tUI('faq4A') },
          ]}
        />
      </div>
    </GlobalContainer>
  );
}
