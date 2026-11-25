'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Copy,
  Check,
  Download,
  Upload,
  ArrowLeftRight,
  Trash2,
  Terminal,
  FileText,
  Lock,
  Unlock,
} from 'lucide-react';

function utf8ToBase64(str: string, urlSafe: boolean): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  let b64 = btoa(binary);
  if (urlSafe) {
    b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return b64;
}

function parseBase64Input(rawInput: string): {
  bytes: Uint8Array;
  declaredMime: string | null;
} {
  let clean = rawInput.trim();
  let declaredMime: string | null = null;

  const dataUriMatch = clean.match(/^data:([^;]+);base64,([\s\S]*)$/i);
  if (dataUriMatch) {
    declaredMime = dataUriMatch[1].toLowerCase();
    clean = dataUriMatch[2];
  }

  clean = clean.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  const pad = clean.length % 4;
  if (pad === 2) clean += '==';
  else if (pad === 3) clean += '=';
  else if (pad === 1) throw new Error('Invalid Base64 length');

  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return { bytes, declaredMime };
}

function detectMimeAndExt(
  bytes: Uint8Array,
  declaredMime: string | null
): { mime: string; ext: string; isBinaryPreviewable: 'pdf' | 'image' | 'binary' | 'text' } {
  if (declaredMime) {
    if (declaredMime === 'application/pdf')
      return { mime: declaredMime, ext: 'pdf', isBinaryPreviewable: 'pdf' };
    if (declaredMime.startsWith('image/')) {
      const sub = declaredMime.split('/')[1]?.split('+')[0] || 'png';
      return {
        mime: declaredMime,
        ext: sub === 'jpeg' ? 'jpg' : sub,
        isBinaryPreviewable: 'image',
      };
    }
  }

  // Magic bytes
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  ) {
    return { mime: 'application/pdf', ext: 'pdf', isBinaryPreviewable: 'pdf' };
  }
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return { mime: 'image/png', ext: 'png', isBinaryPreviewable: 'image' };
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: 'image/jpeg', ext: 'jpg', isBinaryPreviewable: 'image' };
  }
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38
  ) {
    return { mime: 'image/gif', ext: 'gif', isBinaryPreviewable: 'image' };
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { mime: 'image/webp', ext: 'webp', isBinaryPreviewable: 'image' };
  }
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04
  ) {
    return { mime: 'application/zip', ext: 'zip', isBinaryPreviewable: 'binary' };
  }

  // Check if SVG text
  const head = new TextDecoder('utf-8', { fatal: false }).decode(bytes.subarray(0, 120)).trim();
  if (head.startsWith('<svg') || (head.startsWith('<?xml') && head.includes('<svg'))) {
    return { mime: 'image/svg+xml', ext: 'svg', isBinaryPreviewable: 'image' };
  }

  return { mime: declaredMime || 'text/plain', ext: 'txt', isBinaryPreviewable: 'text' };
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export default function Base64EncoderPage() {
  const t = useTranslations('ToolUI.base64Encoder');

  const [mode, setMode] = useState<'encode' | 'decode' | 'file'>('encode');
  const [input, setInput] = useState('Hello VelnoxLabs!');
  const [output, setOutput] = useState('');
  const [urlSafe, setUrlSafe] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Decoded binary/preview state
  const [decodedPreview, setDecodedPreview] = useState<{
    url: string;
    mime: string;
    ext: string;
    kind: 'pdf' | 'image' | 'binary' | 'text';
    size: number;
  } | null>(null);

  // File to Base64 state
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    mime: string;
    size: number;
    rawBase64: string;
    dataUri: string;
  } | null>(null);
  const [includeDataUri, setIncludeDataUri] = useState(false);
  const [copiedFile, setCopiedFile] = useState(false);
  const [copiedCliIdx, setCopiedCliIdx] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up blob URLs
  useEffect(() => {
    return () => {
      if (decodedPreview?.url) {
        URL.revokeObjectURL(decodedPreview.url);
      }
    };
  }, [decodedPreview]);

  const processText = useCallback(
    (text: string, currentMode: 'encode' | 'decode', isUrlSafe: boolean) => {
      setError('');
      setDecodedPreview((prev) => {
        if (prev?.url) URL.revokeObjectURL(prev.url);
        return null;
      });

      if (!text.trim()) {
        setOutput('');
        return;
      }

      try {
        if (currentMode === 'encode') {
          setOutput(utf8ToBase64(text, isUrlSafe));
        } else {
          const { bytes, declaredMime } = parseBase64Input(text);
          const detected = detectMimeAndExt(bytes, declaredMime);

          if (detected.isBinaryPreviewable !== 'text') {
            const blob = new Blob([new Uint8Array(bytes)], { type: detected.mime });
            const url = URL.createObjectURL(blob);
            setDecodedPreview({
              url,
              mime: detected.mime,
              ext: detected.ext,
              kind: detected.isBinaryPreviewable,
              size: bytes.length,
            });
            setOutput(`[${detected.mime.toUpperCase()} — ${formatBytes(bytes.length)}]`);
          } else {
            const decodedText = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
            setOutput(decodedText);
          }
        }
      } catch {
        setError(t('invalidInput'));
        setOutput('');
      }
    },
    [t]
  );

  useEffect(() => {
    if (mode === 'encode' || mode === 'decode') {
      processText(input, mode, urlSafe);
    }
  }, [input, mode, urlSafe, processText]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleSwap = () => {
    if (mode === 'file') return;
    const nextMode = mode === 'encode' ? 'decode' : 'encode';
    const nextInput = decodedPreview ? input : output;
    setMode(nextMode);
    if (!decodedPreview && output) {
      setInput(output);
    } else {
      setInput(nextInput);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
    setDecodedPreview(null);
  };

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = String(reader.result || '');
      const commaIdx = dataUri.indexOf(',');
      const rawBase64 = commaIdx !== -1 ? dataUri.slice(commaIdx + 1) : dataUri;
      setFileInfo({
        name: file.name,
        mime: file.type || 'application/octet-stream',
        size: file.size,
        rawBase64,
        dataUri,
      });
    };
    reader.readAsDataURL(file);
  };

  const activeFileOutput = fileInfo ? (includeDataUri ? fileInfo.dataUri : fileInfo.rawBase64) : '';

  const handleCopyFileBase64 = async () => {
    if (!activeFileOutput) return;
    try {
      await navigator.clipboard.writeText(activeFileOutput);
      setCopiedFile(true);
      setTimeout(() => setCopiedFile(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownloadFileBase64Txt = () => {
    if (!activeFileOutput || !fileInfo) return;
    const blob = new Blob([activeFileOutput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileInfo.name}.base64.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cliCommands = [
    {
      labelKey: 'cliWindowsPs',
      cmd: '[Convert]::ToBase64String([IO.File]::ReadAllBytes("file.pdf")) | Set-Clipboard',
    },
    {
      labelKey: 'cliWindowsCmd',
      cmd: 'certutil -encode file.pdf encoded.txt',
    },
    {
      labelKey: 'cliLinuxMac',
      cmd: 'base64 -i file.pdf -o encoded.txt',
    },
  ];

  const handleCopyCli = async (cmd: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopiedCliIdx(idx);
      setTimeout(() => setCopiedCliIdx(null), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading toolSlug="base64-encoder" title={t('title')} subtitle={t('subtitle')} />

        {/* ========== TOOL UI ========== */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '24px',
            marginTop: 'var(--space-6)',
          }}
        >
          {/* Mode Tabs & Options */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setMode('encode')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: mode === 'encode' ? '#3b82f6' : 'var(--bg-page)',
                  color: mode === 'encode' ? '#ffffff' : 'var(--text-muted)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Lock size={15} />
                {t('encode')}
              </button>

              <button
                type="button"
                onClick={() => setMode('decode')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: mode === 'decode' ? '#3b82f6' : 'var(--bg-page)',
                  color: mode === 'decode' ? '#ffffff' : 'var(--text-muted)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Unlock size={15} />
                {t('decode')}
              </button>

              <button
                type="button"
                onClick={() => setMode('file')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: mode === 'file' ? '#3b82f6' : 'var(--bg-page)',
                  color: mode === 'file' ? '#ffffff' : 'var(--text-muted)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Upload size={15} />
                {t('fileToBase64Tab')}
              </button>
            </div>

            {mode === 'encode' && (
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={urlSafe}
                  onChange={(e) => setUrlSafe(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
                />
                {t('urlSafeToggle')}
              </label>
            )}
          </div>

          {/* ENCODE / DECODE TEXT OR PDF/IMAGE DECODE */}
          {mode !== 'file' ? (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px',
                }}
              >
                {/* Input Panel */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <label
                      style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600 }}
                    >
                      {mode === 'encode' ? t('textInput') : t('base64Input')}
                    </label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {input.length} {t('charsLabel')}
                    </span>
                  </div>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={10}
                    placeholder={
                      mode === 'encode' ? t('enterTextPlaceholder') : t('pasteBase64Placeholder')
                    }
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '12px',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Output Panel */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <label
                      style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600 }}
                    >
                      {mode === 'encode' ? t('base64Output') : t('decodedOutput')}
                    </label>
                    <button
                      type="button"
                      onClick={handleCopy}
                      disabled={!output}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: copied
                          ? '#10b981'
                          : output
                            ? 'rgba(59, 130, 246, 0.15)'
                            : 'var(--bg-card)',
                        color: copied ? '#ffffff' : output ? '#3b82f6' : 'var(--text-muted)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '6px',
                        padding: '4px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: output ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      {copied ? t('copied') : t('copy')}
                    </button>
                  </div>
                  <textarea
                    value={output}
                    readOnly
                    rows={10}
                    placeholder={t('outputPlaceholder')}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: '#10b981',
                      padding: '12px',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>

              {/* Decoded Binary / PDF / Image Preview Box */}
              {decodedPreview && (
                <div
                  style={{
                    marginTop: '20px',
                    padding: '18px',
                    backgroundColor: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                      marginBottom: decodedPreview.kind === 'binary' ? '0' : '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={18} style={{ color: '#10b981' }} />
                      <span
                        style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}
                      >
                        {t('detectedFileLabel')}: {decodedPreview.mime} (
                        {formatBytes(decodedPreview.size)})
                      </span>
                    </div>
                    <a
                      href={decodedPreview.url}
                      download={`decoded-file.${decodedPreview.ext}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      <Download size={15} />
                      {t('downloadDecodedFile', { ext: decodedPreview.ext.toUpperCase() })}
                    </a>
                  </div>

                  {decodedPreview.kind === 'image' && (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '10px',
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={decodedPreview.url}
                        alt="Decoded Preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '320px',
                          margin: '0 auto',
                          display: 'block',
                        }}
                      />
                    </div>
                  )}

                  {decodedPreview.kind === 'pdf' && (
                    <iframe
                      src={decodedPreview.url}
                      title="Decoded PDF Preview"
                      style={{
                        width: '100%',
                        height: '380px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                      }}
                    />
                  )}
                </div>
              )}

              {/* Error */}
              {error && (
                <div
                  style={{
                    marginTop: '12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <p style={{ color: '#f87171', fontSize: '0.85rem', margin: 0 }}>{error}</p>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={handleSwap}
                  disabled={!output}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: output ? 'pointer' : 'not-allowed',
                    opacity: output ? 1 : 0.5,
                  }}
                >
                  <ArrowLeftRight size={16} />
                  {t('swapBtn')}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'var(--bg-page)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={16} />
                  {t('clear')}
                </button>
              </div>
            </div>
          ) : (
            /* FILE TO BASE64 MODE */
            <div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                  e.target.value = '';
                }}
                style={{ display: 'none' }}
              />

              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleFileSelect(f);
                }}
                style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: '12px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(59, 130, 246, 0.03)',
                  marginBottom: '20px',
                }}
              >
                <Upload size={34} style={{ color: '#3b82f6', margin: '0 auto 10px' }} />
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'var(--text-main)',
                    margin: '0 0 6px 0',
                  }}
                >
                  {t('dropFileTitle')}
                </p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                  {t('dropFileSubtitle')}
                </p>
              </div>

              {fileInfo && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                      marginBottom: '12px',
                    }}
                  >
                    <div
                      style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}
                    >
                      {fileInfo.name} ({fileInfo.mime} — {formatBytes(fileInfo.size)})
                    </div>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={includeDataUri}
                        onChange={(e) => setIncludeDataUri(e.target.checked)}
                        style={{ accentColor: '#3b82f6' }}
                      />
                      {t('includeDataUriLabel')}
                    </label>
                  </div>

                  <textarea
                    value={activeFileOutput}
                    readOnly
                    rows={8}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: '#10b981',
                      padding: '12px',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      outline: 'none',
                      resize: 'vertical',
                      marginBottom: '14px',
                    }}
                  />

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={handleCopyFileBase64}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: copiedFile ? '#10b981' : '#3b82f6',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 18px',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {copiedFile ? <Check size={16} /> : <Copy size={16} />}
                      {copiedFile ? t('copied') : t('copy')}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadFileBase64Txt}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '8px',
                        padding: '10px 18px',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Download size={16} />
                      {t('downloadBase64Txt')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CLI / WINDOWS COMMAND REFERENCE */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '20px 24px',
            marginTop: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Terminal size={18} style={{ color: '#3b82f6' }} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {t('cliSectionTitle')}
            </h3>
          </div>
          <div style={{ display: 'grid', gap: '10px' }}>
            {cliCommands.map((item, idx) => (
              <div
                key={item.labelKey}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                }}
              >
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      marginBottom: '2px',
                    }}
                  >
                    {t(item.labelKey)}
                  </div>
                  <code
                    style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-main)',
                      wordBreak: 'break-all',
                    }}
                  >
                    {item.cmd}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCli(item.cmd, idx)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: copiedCliIdx === idx ? '#10b981' : 'var(--bg-card)',
                    color: copiedCliIdx === idx ? '#ffffff' : 'var(--text-main)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copiedCliIdx === idx ? <Check size={12} /> : <Copy size={12} />}
                  {copiedCliIdx === idx ? t('copied') : t('copy')}
                </button>
              </div>
            ))}
          </div>
        </div>

        <ToolSeoContent
          toolSlug="base64-encoder"
          toolName={t('title')}
          description={t('subtitle')}
          customAbout={t('aboutText')}
          customFeatures={[t('feature1'), t('feature2'), t('feature3'), t('feature4')]}
          customSteps={[
            { title: t('step1Title'), body: t('step1Body') },
            { title: t('step2Title'), body: t('step2Body') },
            { title: t('step3Title'), body: t('step3Body') },
          ]}
          customFaqs={[
            { q: t('faq1Q'), a: t('faq1A') },
            { q: t('faq2Q'), a: t('faq2A') },
            { q: t('faq3Q'), a: t('faq3A') },
            { q: t('faq4Q'), a: t('faq4A') },
            { q: t('faq5Q'), a: t('faq5A') },
            { q: t('faq6Q'), a: t('faq6A') },
          ]}
        />
      </div>
    </GlobalContainer>
  );
}
