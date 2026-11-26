'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import { Sparkles, Copy, Check, Upload, CheckCircle2, XCircle, FileText, Cpu } from 'lucide-react';

type InputMode = 'text' | 'hex' | 'binary';

// RFC 1321 MD5 implementation for Uint8Array (supports UTF-8 & binary files)
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

// CRC-16 CCITT-FALSE
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

function parseInputToBytes(
  input: string,
  mode: InputMode
): { bytes: Uint8Array; error: string | null } {
  if (!input) return { bytes: new Uint8Array(0), error: null };
  if (mode === 'text') {
    return { bytes: new TextEncoder().encode(input), error: null };
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

function detectExpectedHashType(raw: string): string {
  const clean = raw.trim().replace(/^0x/i, '');
  if (!/^[0-9a-fA-F]+$/.test(clean)) return '';
  if (clean.length === 2) return '8-bit (Mod 256 / XOR)';
  if (clean.length === 4) return '16-bit / CRC-16';
  if (clean.length === 8) return 'CRC-32';
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
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uppercase, setUppercase] = useState(false);
  const [expectedHash, setExpectedHash] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [cryptoHashes, setCryptoHashes] = useState({
    md5: '',
    sha1: '',
    sha256: '',
    sha512: '',
  });

  const parsedInput = useMemo(() => {
    if (fileBytes) return { bytes: fileBytes, error: null };
    return parseInputToBytes(text, mode);
  }, [fileBytes, text, mode]);

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
    const crc32 = computeCrc32(b);

    return {
      mod256,
      twosComp,
      xorVal,
      sum16,
      crc16,
      crc32,
      totalSum: sum,
    };
  }, [parsedInput.bytes]);

  // Compute MD5 + Web Crypto SHA hashes whenever bytes change
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
        id: 'mod256',
        label: tUI('algoMod256'),
        hex: hex8(simpleChecksums.mod256),
        extra: `Dec: ${simpleChecksums.mod256} · Bin: ${simpleChecksums.mod256.toString(2).padStart(8, '0')}`,
      },
      {
        id: 'twos',
        label: tUI('algoTwos'),
        hex: hex8(simpleChecksums.twosComp),
        extra: `Dec: ${simpleChecksums.twosComp} · Bin: ${simpleChecksums.twosComp.toString(2).padStart(8, '0')}`,
      },
      {
        id: 'xor',
        label: tUI('algoXor'),
        hex: hex8(simpleChecksums.xorVal),
        extra: `Dec: ${simpleChecksums.xorVal} · Bin: ${simpleChecksums.xorVal.toString(2).padStart(8, '0')}`,
      },
      {
        id: 'sum16',
        label: tUI('algo16Bit'),
        hex: hex16(simpleChecksums.sum16),
        extra: `Dec: ${simpleChecksums.sum16}`,
      },
      {
        id: 'crc16',
        label: 'CRC-16 (CCITT)',
        hex: hex16(simpleChecksums.crc16),
        extra: `Dec: ${simpleChecksums.crc16}`,
      },
      {
        id: 'crc32',
        label: 'CRC-32 (IEEE 802.3)',
        hex: hex32(simpleChecksums.crc32),
        extra: `Dec: ${simpleChecksums.crc32}`,
      },
      { id: 'md5', label: 'MD5 (128-bit)', hex: fmtHex(cryptoHashes.md5), extra: '' },
      { id: 'sha1', label: 'SHA-1 (160-bit)', hex: fmtHex(cryptoHashes.sha1), extra: '' },
      { id: 'sha256', label: 'SHA-256 (256-bit)', hex: fmtHex(cryptoHashes.sha256), extra: '' },
      { id: 'sha512', label: 'SHA-512 (512-bit)', hex: fmtHex(cryptoHashes.sha512), extra: '' },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simpleChecksums, cryptoHashes, uppercase, tUI]);

  const normalizedExpected = expectedHash.trim().replace(/^0x/i, '').toLowerCase();
  const detectedType = useMemo(() => detectExpectedHashType(expectedHash), [expectedHash]);
  const matchedEntry = useMemo(() => {
    if (!normalizedExpected) return null;
    return allEntries.find((e) => e.hex.toLowerCase() === normalizedExpected) || null;
  }, [normalizedExpected, allEntries]);

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

  const handleCopy = (id: string, val: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

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
            borderRadius: '14px',
            padding: '24px',
            marginTop: 'var(--space-6)',
            marginBottom: '28px',
          }}
        >
          {/* Input Mode Tabs & File Upload */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px',
            }}
          >
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
                    border:
                      !fileBytes && mode === m.id
                        ? '1px solid rgba(59, 130, 246, 0.5)'
                        : '1px solid var(--border-color)',
                    backgroundColor:
                      !fileBytes && mode === m.id ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-page)',
                    color: !fileBytes && mode === m.id ? '#60a5fa' : 'var(--text-muted)',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: 'rgba(139, 92, 246, 0.14)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  color: '#a78bfa',
                }}
              >
                <Upload size={14} />
                {tUI('uploadFileBtn')}
                <input
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f);
                  }}
                />
              </label>

              <button
                type="button"
                onClick={() => setUppercase((u) => !u)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
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

          {/* File Banner or Textarea */}
          {fileBytes && fileName ? (
            <div
              style={{
                backgroundColor: 'var(--bg-page)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} style={{ color: '#a78bfa' }} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                    {fileName}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {fileBytes.length.toLocaleString()} bytes
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFileBytes(null);
                  setFileName(null);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                {tUI('clearFile')}
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: '18px' }}>
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
                  borderRadius: '8px',
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
              borderRadius: '10px',
              padding: '14px 16px',
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
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  color: '#a78bfa',
                }}
              >
                <Sparkles size={15} />
                {tUI('verifyTitle')}
              </span>
              {detectedType && (
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {tUI('detectedFormat', { format: detectedType })}
                </span>
              )}
            </div>
            <input
              type="text"
              value={expectedHash}
              onChange={(e) => setExpectedHash(e.target.value)}
              placeholder={tUI('verifyPlaceholder')}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: 'var(--text-main)',
                fontFamily: 'monospace',
                fontSize: '0.84rem',
                outline: 'none',
              }}
            />
            {normalizedExpected && allEntries.length > 0 && (
              <div style={{ marginTop: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
                {matchedEntry ? (
                  <span
                    style={{
                      color: '#34d399',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <CheckCircle2 size={15} />
                    {tUI('matchFound', { algo: matchedEntry.label })}
                  </span>
                ) : (
                  <span
                    style={{
                      color: '#f87171',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <XCircle size={15} />
                    {tUI('noMatchFound')}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* All-in-One Checksum Matrix */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '12px',
            }}
          >
            {allEntries.map((entry) => {
              const isMatched =
                Boolean(normalizedExpected) && entry.hex.toLowerCase() === normalizedExpected;
              return (
                <div
                  key={entry.id}
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: isMatched ? '1px solid #34d399' : '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '6px',
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
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#60a5fa' }}>
                      {entry.label}
                    </span>
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
                      color: '#34d399',
                      wordBreak: 'break-all',
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

          {/* Byte-by-Byte Educational Math Breakdown */}
          {simpleChecksums && parsedInput.bytes.length > 0 && (
            <div
              style={{
                marginTop: '20px',
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
                {Array.from(parsedInput.bytes.slice(0, 12))
                  .map((b) => `0x${b.toString(16).padStart(2, '0').toUpperCase()}`)
                  .join(' + ')}
                {parsedInput.bytes.length > 12 ? ` + ... (${parsedInput.bytes.length} bytes)` : ''}{' '}
                = {simpleChecksums.totalSum} (mod 256 ={' '}
                <strong style={{ color: '#34d399' }}>
                  0x{simpleChecksums.mod256.toString(16).padStart(2, '0').toUpperCase()}
                </strong>
                )
              </div>
            </div>
          )}
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
