'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  Wand2,
  Code2,
} from 'lucide-react';

function utf8ToBase64(str: string, urlSafe: boolean, wrap76: boolean): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  let b64 = btoa(binary);
  if (urlSafe) {
    b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } else if (wrap76) {
    b64 = b64.replace(/(.{76})/g, '$1\n').trim();
  }
  return b64;
}

function parseBase64Input(rawInput: string): {
  bytes: Uint8Array;
  declaredMime: string | null;
} {
  let clean = rawInput
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\\n|\\r/g, '');
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
): { mime: string; ext: string; kind: 'pdf' | 'image' | 'audio' | 'video' | 'binary' | 'text' } {
  if (declaredMime) {
    if (declaredMime === 'application/pdf') return { mime: declaredMime, ext: 'pdf', kind: 'pdf' };
    if (declaredMime.startsWith('image/')) {
      const sub = declaredMime.split('/')[1]?.split('+')[0] || 'png';
      return { mime: declaredMime, ext: sub === 'jpeg' ? 'jpg' : sub, kind: 'image' };
    }
    if (declaredMime.startsWith('audio/')) {
      const sub = declaredMime.split('/')[1] || 'mp3';
      return { mime: declaredMime, ext: sub === 'mpeg' ? 'mp3' : sub, kind: 'audio' };
    }
    if (declaredMime.startsWith('video/')) {
      const sub = declaredMime.split('/')[1] || 'mp4';
      return { mime: declaredMime, ext: sub, kind: 'video' };
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
    return { mime: 'application/pdf', ext: 'pdf', kind: 'pdf' };
  }
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return { mime: 'image/png', ext: 'png', kind: 'image' };
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: 'image/jpeg', ext: 'jpg', kind: 'image' };
  }
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38
  ) {
    return { mime: 'image/gif', ext: 'gif', kind: 'image' };
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
    return { mime: 'image/webp', ext: 'webp', kind: 'image' };
  }
  // MP3 (ID3 or frame sync)
  if (
    (bytes.length >= 3 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) ||
    (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)
  ) {
    return { mime: 'audio/mpeg', ext: 'mp3', kind: 'audio' };
  }
  // MP4 (ftyp)
  if (
    bytes.length >= 8 &&
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70
  ) {
    return { mime: 'video/mp4', ext: 'mp4', kind: 'video' };
  }
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04
  ) {
    return { mime: 'application/zip', ext: 'zip', kind: 'binary' };
  }

  const head = new TextDecoder('utf-8', { fatal: false }).decode(bytes.subarray(0, 120)).trim();
  if (head.startsWith('<svg') || (head.startsWith('<?xml') && head.includes('<svg'))) {
    return { mime: 'image/svg+xml', ext: 'svg', kind: 'image' };
  }

  return { mime: declaredMime || 'text/plain', ext: 'txt', kind: 'text' };
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function looksLikeBase64(text: string): boolean {
  const t = text.trim();
  if (t.length < 16) return false;
  if (/^data:[^;]+;base64,/i.test(t)) return true;
  if (/^(JVBERi0|iVBORw0KGgo|\/9j\/|R0lGOD)/.test(t)) return true;
  if (/^[A-Za-z0-9+/=_-]{24,}$/.test(t.replace(/\s+/g, '')) && t.length % 4 === 0) return true;
  return false;
}

interface EncodedFileItem {
  name: string;
  mime: string;
  size: number;
  rawBase64: string;
  dataUri: string;
}

export default function Base64EncoderPage() {
  const t = useTranslations('ToolUI.base64Encoder');

  const [mode, setMode] = useState<'encode' | 'decode' | 'file'>('encode');
  const [input, setInput] = useState('Hello VelnoxLabs!');
  const [output, setOutput] = useState('');
  const [urlSafe, setUrlSafe] = useState(false);
  const [wrap76, setWrap76] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const [decodedPreview, setDecodedPreview] = useState<{
    url: string;
    mime: string;
    ext: string;
    kind: 'pdf' | 'image' | 'audio' | 'video' | 'binary' | 'text';
    size: number;
  } | null>(null);

  const [fileItems, setFileItems] = useState<EncodedFileItem[]>([]);
  const [includeDataUri, setIncludeDataUri] = useState(false);
  const [copiedFileIdx, setCopiedFileIdx] = useState<number | null>(null);
  const [copiedSnippetKey, setCopiedSnippetKey] = useState<string | null>(null);
  const [copiedCliIdx, setCopiedCliIdx] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (decodedPreview?.url) {
        URL.revokeObjectURL(decodedPreview.url);
      }
    };
  }, [decodedPreview]);

  const showAiSwitchToDecode = useMemo(() => {
    return mode === 'encode' && looksLikeBase64(input);
  }, [mode, input]);

  const processText = useCallback(
    (text: string, currentMode: 'encode' | 'decode', isUrlSafe: boolean, isWrap76: boolean) => {
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
          setOutput(utf8ToBase64(text, isUrlSafe, isWrap76));
        } else {
          const { bytes, declaredMime } = parseBase64Input(text);
          const detected = detectMimeAndExt(bytes, declaredMime);

          if (detected.kind !== 'text') {
            const blob = new Blob([new Uint8Array(bytes)], { type: detected.mime });
            const url = URL.createObjectURL(blob);
            setDecodedPreview({
              url,
              mime: detected.mime,
              ext: detected.ext,
              kind: detected.kind,
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
      processText(input, mode, urlSafe, wrap76);
    }
  }, [input, mode, urlSafe, wrap76, processText]);

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
    setMode(nextMode);
    if (!decodedPreview && output) {
      setInput(output);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
    setDecodedPreview(null);
  };

  const handleFilesSelected = (files: FileList | File[]) => {
    const fileArr = Array.from(files).slice(0, 20);
    fileArr.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUri = String(reader.result || '');
        const commaIdx = dataUri.indexOf(',');
        const rawBase64 = commaIdx !== -1 ? dataUri.slice(commaIdx + 1) : dataUri;
        setFileItems((prev) => [
          ...prev,
          {
            name: file.name,
            mime: file.type || 'application/octet-stream',
            size: file.size,
            rawBase64,
            dataUri,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCopyFileBase64 = async (val: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(val);
      setCopiedFileIdx(idx);
      setTimeout(() => setCopiedFileIdx(null), 1800);
    } catch {
      // ignore
    }
  };

  const handleDownloadFileBase64Txt = (item: EncodedFileItem) => {
    const content = includeDataUri ? item.dataUri : item.rawBase64;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.name}.base64.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportBatchJson = () => {
    if (fileItems.length === 0) return;
    const payload = fileItems.map((it) => ({
      filename: it.name,
      mime: it.mime,
      sizeBytes: it.size,
      base64: includeDataUri ? it.dataUri : it.rawBase64,
    }));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'base64-batch.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySnippet = async (val: string, key: string) => {
    try {
      await navigator.clipboard.writeText(val);
      setCopiedSnippetKey(key);
      setTimeout(() => setCopiedSnippetKey(null), 1600);
    } catch {
      // ignore
    }
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

  const inputBytes = new TextEncoder().encode(input).length;
  const outputBytes = new TextEncoder().encode(output).length;

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
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={urlSafe}
                    onChange={(e) => setUrlSafe(e.target.checked)}
                    style={{ width: '15px', height: '15px', accentColor: '#3b82f6' }}
                  />
                  {t('urlSafeToggle')}
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={wrap76}
                    disabled={urlSafe}
                    onChange={(e) => setWrap76(e.target.checked)}
                    style={{ width: '15px', height: '15px', accentColor: '#3b82f6' }}
                  />
                  {t('wrap76Toggle')}
                </label>
              </div>
            )}
          </div>

          {/* AI Auto-Detect Banner */}
          {showAiSwitchToDecode && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#8b5cf6',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                }}
              >
                <Wand2 size={16} />
                <span>{t('aiDetectedBase64Hint')}</span>
              </div>
              <button
                type="button"
                onClick={() => setMode('decode')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#8b5cf6',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {t('aiSwitchDecodeBtn')}
              </button>
            </div>
          )}

          {/* ENCODE / DECODE TEXT OR BINARY */}
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
                      {input.length} {t('charsLabel')} ({formatBytes(inputBytes)})
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {output && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {formatBytes(outputBytes)}
                        </span>
                      )}
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

              {/* Decoded Binary / PDF / Image / Audio / Video Preview Box */}
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

                  {decodedPreview.kind === 'audio' && (
                    <audio controls src={decodedPreview.url} style={{ width: '100%' }} />
                  )}

                  {decodedPreview.kind === 'video' && (
                    <video
                      controls
                      src={decodedPreview.url}
                      style={{ width: '100%', maxHeight: '340px', borderRadius: '8px' }}
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
            /* MULTI-FILE TO BASE64 MODE */
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => {
                  if (e.target.files?.length) handleFilesSelected(e.target.files);
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
                  if (e.dataTransfer.files?.length) handleFilesSelected(e.dataTransfer.files);
                }}
                style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: '12px',
                  padding: '32px 20px',
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

              {fileItems.length > 0 && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                      marginBottom: '16px',
                    }}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.84rem',
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

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={handleExportBatchJson}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '8px',
                          padding: '6px 14px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Download size={14} />
                        {t('exportBatchJsonBtn')}
                      </button>

                      <button
                        type="button"
                        onClick={() => setFileItems([])}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: 'var(--bg-page)',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={14} />
                        {t('clear')}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {fileItems.map((item, idx) => {
                      const activeText = includeDataUri ? item.dataUri : item.rawBase64;
                      const htmlSnippet = `<img src="${item.dataUri}" alt="${item.name}" />`;
                      const cssSnippet = `background-image: url('${item.dataUri}');`;
                      return (
                        <div
                          key={`${item.name}-${idx}`}
                          style={{
                            padding: '16px',
                            backgroundColor: 'var(--bg-page)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '10px',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '8px',
                              marginBottom: '10px',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.88rem',
                                fontWeight: 700,
                                color: 'var(--text-main)',
                              }}
                            >
                              {item.name} ({item.mime} — {formatBytes(item.size)})
                            </span>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                onClick={() => handleCopyFileBase64(activeText, idx)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  backgroundColor: copiedFileIdx === idx ? '#10b981' : '#3b82f6',
                                  color: '#ffffff',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                {copiedFileIdx === idx ? <Check size={13} /> : <Copy size={13} />}
                                {copiedFileIdx === idx ? t('copied') : t('copy')}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDownloadFileBase64Txt(item)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid rgba(16, 185, 129, 0.3)',
                                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                  color: '#10b981',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                <Download size={13} />
                                {t('downloadBase64Txt')}
                              </button>

                              {item.mime.startsWith('image/') && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleCopySnippet(htmlSnippet, `html-${idx}`)}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '5px 10px',
                                      borderRadius: '6px',
                                      border: '1px solid var(--border-color)',
                                      backgroundColor:
                                        copiedSnippetKey === `html-${idx}`
                                          ? '#10b981'
                                          : 'var(--bg-card)',
                                      color:
                                        copiedSnippetKey === `html-${idx}`
                                          ? '#ffffff'
                                          : 'var(--text-main)',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <Code2 size={12} />
                                    {copiedSnippetKey === `html-${idx}` ? t('copied') : 'HTML'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleCopySnippet(cssSnippet, `css-${idx}`)}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '5px 10px',
                                      borderRadius: '6px',
                                      border: '1px solid var(--border-color)',
                                      backgroundColor:
                                        copiedSnippetKey === `css-${idx}`
                                          ? '#10b981'
                                          : 'var(--bg-card)',
                                      color:
                                        copiedSnippetKey === `css-${idx}`
                                          ? '#ffffff'
                                          : 'var(--text-main)',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <Code2 size={12} />
                                    {copiedSnippetKey === `css-${idx}` ? t('copied') : 'CSS'}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          <textarea
                            value={
                              activeText.slice(0, 1000) + (activeText.length > 1000 ? '...' : '')
                            }
                            readOnly
                            rows={3}
                            style={{
                              width: '100%',
                              backgroundColor: 'var(--bg-card)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px',
                              color: '#10b981',
                              padding: '8px',
                              fontFamily: 'monospace',
                              fontSize: '0.76rem',
                              outline: 'none',
                              resize: 'none',
                            }}
                          />
                        </div>
                      );
                    })}
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
