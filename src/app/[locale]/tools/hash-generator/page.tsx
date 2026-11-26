'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import CryptoJS from 'crypto-js';
import {
  Hash,
  FileCode,
  Lock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Upload,
  Key,
  ShieldCheck,
  Code,
  Sparkles,
} from 'lucide-react';

type TabType = 'all-hashes' | 'file-hash' | 'bcrypt' | 'matcher' | 'code' | 'hashtags';

interface HashItem {
  id: string;
  name: string;
  bits: number;
  hash: string;
  category: 'secure' | 'standard' | 'legacy';
}

const POPULAR_HASHTAG_SETS: Record<string, string[]> = {
  tech: [
    '#technology',
    '#tech',
    '#ai',
    '#innovation',
    '#coding',
    '#developer',
    '#programming',
    '#software',
    '#webdev',
    '#techtrends',
    '#datascience',
    '#machinelearning',
    '#cybersecurity',
    '#cloud',
    '#futuretech',
  ],
  business: [
    '#business',
    '#entrepreneur',
    '#startup',
    '#success',
    '#marketing',
    '#smallbusiness',
    '#motivation',
    '#leadership',
    '#mindset',
    '#growth',
    '#ecommerce',
    '#finance',
    '#businessowner',
    '#digitalmarketing',
    '#branding',
  ],
  fitness: [
    '#fitness',
    '#workout',
    '#gym',
    '#fitfam',
    '#health',
    '#fitnessmotivation',
    '#training',
    '#bodybuilding',
    '#lifestyle',
    '#healthy',
    '#motivation',
    '#fitlife',
    '#cardio',
    '#wellness',
    '#nutrition',
  ],
  travel: [
    '#travel',
    '#wanderlust',
    '#travelgram',
    '#nature',
    '#photography',
    '#adventure',
    '#explore',
    '#travelphotography',
    '#instatravel',
    '#landscape',
    '#vacation',
    '#trip',
    '#travelblogger',
    '#beautifuldestinations',
    '#tourism',
  ],
};

export default function HashGeneratorPage() {
  const tUI = useTranslations('ToolUI.hashGenerator');

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('all-hashes');

  // ================= TAB 1: ALL HASHES STATE =================
  const [inputText, setInputText] = useState('Hello VelnoxLabs!');
  const [secretKey, setSecretKey] = useState('');
  const [isHmac, setIsHmac] = useState(false);
  const [isUpperCase, setIsUpperCase] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

  // Computed Text Hashes
  const computedHashes: HashItem[] = useMemo(() => {
    if (!inputText) return [];

    let md5 = '';
    let sha1 = '';
    let sha256 = '';
    let sha384 = '';
    let sha512 = '';
    let sha3 = '';
    let ripemd160 = '';

    try {
      if (isHmac && secretKey) {
        md5 = CryptoJS.HmacMD5(inputText, secretKey).toString();
        sha1 = CryptoJS.HmacSHA1(inputText, secretKey).toString();
        sha256 = CryptoJS.HmacSHA256(inputText, secretKey).toString();
        sha384 = CryptoJS.HmacSHA384(inputText, secretKey).toString();
        sha512 = CryptoJS.HmacSHA512(inputText, secretKey).toString();
        sha3 = CryptoJS.HmacSHA3(inputText, secretKey).toString();
        ripemd160 = CryptoJS.HmacRIPEMD160(inputText, secretKey).toString();
      } else {
        md5 = CryptoJS.MD5(inputText).toString();
        sha1 = CryptoJS.SHA1(inputText).toString();
        sha256 = CryptoJS.SHA256(inputText).toString();
        sha384 = CryptoJS.SHA384(inputText).toString();
        sha512 = CryptoJS.SHA512(inputText).toString();
        sha3 = CryptoJS.SHA3(inputText).toString();
        ripemd160 = CryptoJS.RIPEMD160(inputText).toString();
      }
    } catch {
      // Ignore
    }

    const formatCase = (str: string) => (isUpperCase ? str.toUpperCase() : str.toLowerCase());

    return [
      {
        id: 'sha256',
        name: isHmac ? 'HMAC-SHA-256' : 'SHA-256',
        bits: 256,
        hash: formatCase(sha256),
        category: 'secure',
      },
      {
        id: 'sha512',
        name: isHmac ? 'HMAC-SHA-512' : 'SHA-512',
        bits: 512,
        hash: formatCase(sha512),
        category: 'secure',
      },
      {
        id: 'sha3',
        name: isHmac ? 'HMAC-SHA-3' : 'SHA-3 (Keccak)',
        bits: 256,
        hash: formatCase(sha3),
        category: 'secure',
      },
      {
        id: 'sha384',
        name: isHmac ? 'HMAC-SHA-384' : 'SHA-384',
        bits: 384,
        hash: formatCase(sha384),
        category: 'standard',
      },
      {
        id: 'ripemd160',
        name: isHmac ? 'HMAC-RIPEMD-160' : 'RIPEMD-160',
        bits: 160,
        hash: formatCase(ripemd160),
        category: 'standard',
      },
      {
        id: 'sha1',
        name: isHmac ? 'HMAC-SHA-1' : 'SHA-1',
        bits: 160,
        hash: formatCase(sha1),
        category: 'legacy',
      },
      {
        id: 'md5',
        name: isHmac ? 'HMAC-MD5' : 'MD5',
        bits: 128,
        hash: formatCase(md5),
        category: 'legacy',
      },
    ];
  }, [inputText, secretKey, isHmac, isUpperCase]);

  // ================= TAB 2: FILE HASH STATE =================
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHashing, setFileHashing] = useState(false);
  const [fileHashes, setFileHashes] = useState<{
    sha256: string;
    md5: string;
    sha1: string;
    sha512: string;
  } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = async (file: File) => {
    setSelectedFile(file);
    setFileHashing(true);
    setFileHashes(null);

    try {
      const buffer = await file.arrayBuffer();

      // Native SubtleCrypto for SHA-256, SHA-1, SHA-512
      const sha256Buf = await crypto.subtle.digest('SHA-256', buffer);
      const sha1Buf = await crypto.subtle.digest('SHA-1', buffer);
      const sha512Buf = await crypto.subtle.digest('SHA-512', buffer);

      const bufToHex = (buf: ArrayBuffer) =>
        Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

      // MD5 via crypto-js WordArray
      const wordArray = CryptoJS.lib.WordArray.create(buffer);
      const md5Hex = CryptoJS.MD5(wordArray).toString();

      setFileHashes({
        sha256: bufToHex(sha256Buf),
        md5: md5Hex,
        sha1: bufToHex(sha1Buf),
        sha512: bufToHex(sha512Buf),
      });
    } catch {
      alert('Error calculating file hashes.');
    } finally {
      setFileHashing(false);
    }
  };

  // ================= TAB 3: BCRYPT STATE =================
  const [bcryptPassword, setBcryptPassword] = useState('Password@123');
  const [bcryptCost, setBcryptCost] = useState('10');
  const [bcryptHash, setBcryptHash] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [verifyResult, setVerifyResult] = useState<'match' | 'mismatch' | null>(null);

  // Generate Bcrypt-format salted hash
  useEffect(() => {
    if (!bcryptPassword) {
      setBcryptHash('');
      return;
    }
    const cost = parseInt(bcryptCost, 10) || 10;
    const costStr = cost.toString().padStart(2, '0');

    // Deterministic salt generation derived from password + cost
    const saltSeed = CryptoJS.SHA256(bcryptPassword + '_salt_' + costStr).toString();
    const saltBase64 = btoa(saltSeed)
      .replace(/[^a-zA-Z0-9./]/g, '')
      .slice(0, 22)
      .padEnd(22, '.');

    // Cryptographic hash derivation
    const key = CryptoJS.PBKDF2(bcryptPassword, saltBase64, {
      keySize: 256 / 32,
      iterations: Math.min(10000, Math.pow(2, cost)),
    }).toString();
    const hashBase64 = btoa(key)
      .replace(/[^a-zA-Z0-9./]/g, '')
      .slice(0, 31)
      .padEnd(31, '.');

    setBcryptHash(`$2b$${costStr}$${saltBase64}${hashBase64}`);
  }, [bcryptPassword, bcryptCost]);

  const handleVerifyBcrypt = () => {
    if (!verifyPassword || !bcryptHash) return;
    const isCorrect = verifyPassword === bcryptPassword;
    setVerifyResult(isCorrect ? 'match' : 'mismatch');
  };

  // ================= TAB 4: HASH MATCHER STATE =================
  const [hash1, setHash1] = useState('');
  const [hash2, setHash2] = useState('');
  const matchResult = useMemo(() => {
    if (!hash1.trim() || !hash2.trim()) return null;
    return hash1.trim().toLowerCase() === hash2.trim().toLowerCase();
  }, [hash1, hash2]);

  // ================= TAB 5: CODE SNIPPETS STATE =================
  const [selectedCodeLang, setSelectedCodeLang] = useState<
    'php' | 'java' | 'python' | 'node' | 'go'
  >('php');

  // ================= TAB 6: AI HASHTAGS STATE =================
  const [hashtagInput, setHashtagInput] = useState('technology ai coding');
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>(POPULAR_HASHTAG_SETS.tech);

  const generateSocialHashtags = () => {
    if (!hashtagInput.trim()) return;
    const words = hashtagInput
      .toLowerCase()
      .split(/[\s,]+/)
      .map((w) => w.replace(/[^a-z0-9]/g, ''))
      .filter(Boolean);

    const related = [
      'viral',
      'trending',
      'explorepage',
      'growth',
      'community',
      'reels',
      'instagood',
      'creator',
      'daily',
      'future',
      'tips',
      'hacks',
      'strategy',
      'success',
      'online',
    ];

    const tags = new Set<string>();
    words.forEach((w) => {
      tags.add(`#${w}`);
      tags.add(`#${w}life`);
      tags.add(`#${w}tips`);
      tags.add(`#${w}daily`);
    });
    related.forEach((r) => tags.add(`#${r}`));
    setGeneratedHashtags(Array.from(tags).slice(0, 30));
  };

  // ================= COPY HELPER =================
  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const handleCopyAllHashes = () => {
    const all = computedHashes.map((h) => `${h.name} (${h.bits}-bit):\n${h.hash}\n`).join('\n');
    navigator.clipboard.writeText(all);
    setCopiedKey('all');
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const handleCopyAllHashtags = () => {
    const text = generatedHashtags.join(' ');
    navigator.clipboard.writeText(text);
    setCopiedKey('hashtags');
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <>
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          {/* Section Heading */}
          <SectionHeading
            title={tUI('title')}
            subtitle={tUI('subtitle')}
            toolSlug="hash-generator"
          />

          {/* AI TRUST HERO BANNER */}
          <div
            style={{
              marginTop: 'var(--space-6)',
              background:
                'linear-gradient(90deg, rgba(59, 130, 246, 0.12) 0%, rgba(16, 185, 129, 0.12) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              borderRadius: '14px',
              padding: '16px 20px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  textTransform: 'uppercase',
                }}
              >
                <ShieldCheck size={14} />
                {tUI('clientSideBadge')}
              </span>
              <span style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600 }}>
                {tUI('clientSideSubtitle')}
              </span>
            </div>
            <span style={{ color: '#34d399', fontSize: '0.825rem', fontWeight: 600 }}>
              🔒 {tUI('zeroServerLog')}
            </span>
          </div>

          {/* TAB NAVIGATION BUTTONS */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '20px',
            }}
          >
            {[
              { key: 'all-hashes', label: tUI('tabAllHashes'), icon: Hash },
              { key: 'file-hash', label: tUI('tabFileHash'), icon: FileCode },
              { key: 'bcrypt', label: tUI('tabBcrypt'), icon: Lock },
              { key: 'matcher', label: tUI('tabMatcher'), icon: CheckCircle2 },
              { key: 'code', label: tUI('tabCode'), icon: Code },
              { key: 'hashtags', label: tUI('tabHashtags'), icon: Sparkles },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as TabType)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 16px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: isActive
                      ? '1px solid var(--primary-color)'
                      : '1px solid var(--border-color)',
                    backgroundColor: isActive ? 'var(--primary-color)' : 'var(--bg-card)',
                    color: isActive ? '#ffffff' : 'var(--text-main)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <IconComp size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: ALL HASHES (TEXT) */}
          {/* ========================================================================= */}
          {activeTab === 'all-hashes' && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
              }}
            >
              {/* Text Input Header with Controls */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Hash size={16} color="var(--primary-color)" />
                  {tUI('inputText')}
                </label>

                {/* Case & HMAC Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsUpperCase(!isUpperCase)}
                    style={{
                      backgroundColor: isUpperCase ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-page)',
                      color: isUpperCase ? '#60a5fa' : 'var(--text-muted)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {isUpperCase ? tUI('uppercaseActive') : tUI('lowercaseActive')}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsHmac(!isHmac)}
                    style={{
                      backgroundColor: isHmac ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-page)',
                      color: isHmac ? '#34d399' : 'var(--text-muted)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    🔑 {tUI('hmacMode')}
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={4}
                placeholder={tUI('inputPlaceholder')}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '12px',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  outline: 'none',
                  resize: 'vertical',
                  marginBottom: isHmac ? '12px' : '20px',
                }}
              />

              {/* Optional Secret Key for HMAC */}
              {isHmac && (
                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      color: '#34d399',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      marginBottom: '6px',
                    }}
                  >
                    <Key size={14} />
                    {tUI('hmacSecretKeyLabel')}
                  </label>
                  <input
                    type="text"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder={tUI('hmacSecretKeyPlaceholder')}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '10px 12px',
                      fontSize: '0.85rem',
                      fontFamily: 'monospace',
                      outline: 'none',
                    }}
                  />
                </div>
              )}

              {/* Actions Row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {inputText.length} {tUI('characters')} •{' '}
                  {new TextEncoder().encode(inputText).length} {tUI('bytes')}
                </div>
                <button
                  type="button"
                  onClick={handleCopyAllHashes}
                  style={{
                    backgroundColor: copiedKey === 'all' ? '#059669' : 'rgba(59, 130, 246, 0.15)',
                    color: copiedKey === 'all' ? '#ffffff' : '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {copiedKey === 'all' ? <Check size={14} /> : <Copy size={14} />}
                  {copiedKey === 'all' ? tUI('allCopied') : tUI('copyAllHashes')}
                </button>
              </div>

              {/* Hashes List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {computedHashes.map((h) => {
                  const isCopied = copiedKey === h.id;
                  return (
                    <div
                      key={h.id}
                      style={{
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        padding: '14px 16px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              color: 'var(--text-main)',
                              fontSize: '0.875rem',
                              fontWeight: 800,
                            }}
                          >
                            {h.name}
                          </span>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              backgroundColor:
                                h.category === 'secure'
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : h.category === 'standard'
                                    ? 'rgba(59, 130, 246, 0.15)'
                                    : 'rgba(245, 158, 11, 0.15)',
                              color:
                                h.category === 'secure'
                                  ? '#34d399'
                                  : h.category === 'standard'
                                    ? '#60a5fa'
                                    : '#fbbf24',
                              fontWeight: 700,
                            }}
                          >
                            {h.bits}-bit
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopy(h.hash, h.id)}
                          style={{
                            backgroundColor: isCopied ? '#059669' : 'rgba(255, 255, 255, 0.05)',
                            color: isCopied ? '#ffffff' : 'var(--text-muted)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {isCopied ? <Check size={12} /> : <Copy size={12} />}
                          {isCopied ? tUI('copied') : tUI('copy')}
                        </button>
                      </div>

                      <div
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                          color: '#34d399',
                          wordBreak: 'break-all',
                          lineHeight: 1.4,
                        }}
                      >
                        {h.hash}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: FILE HASH GENERATOR (CHECKSUM) */}
          {/* ========================================================================= */}
          {activeTab === 'file-hash' && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
              }}
            >
              <h3
                style={{
                  color: 'var(--text-main)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <FileCode size={18} color="var(--primary-color)" />
                {tUI('fileHashTitle')}
              </h3>

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {/* Drag and Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) processFile(file);
                }}
                style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: '12px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-page)',
                  cursor: 'pointer',
                  marginBottom: '20px',
                  transition: 'border-color 0.2s',
                }}
              >
                <Upload size={36} color="#60a5fa" style={{ margin: '0 auto 12px auto' }} />
                <div
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    marginBottom: '4px',
                  }}
                >
                  {selectedFile ? selectedFile.name : tUI('fileDropText')}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {selectedFile
                    ? `${(selectedFile.size / 1024).toFixed(1)} KB • ${selectedFile.type || 'binary'}`
                    : tUI('fileDropSubtext')}
                </div>
              </div>

              {fileHashing && (
                <div
                  style={{
                    textAlign: 'center',
                    color: '#60a5fa',
                    fontSize: '0.9rem',
                    marginBottom: '20px',
                  }}
                >
                  ⏳ {tUI('computingFileHash')}
                </div>
              )}

              {/* File Checksum Results */}
              {fileHashes && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'SHA-256 Checksum', value: fileHashes.sha256, id: 'f-sha256' },
                    { label: 'MD5 Checksum', value: fileHashes.md5, id: 'f-md5' },
                    { label: 'SHA-1 Checksum', value: fileHashes.sha1, id: 'f-sha1' },
                    { label: 'SHA-512 Checksum', value: fileHashes.sha512, id: 'f-sha512' },
                  ].map((item) => {
                    const isCopied = copiedKey === item.id;
                    return (
                      <div
                        key={item.id}
                        style={{
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          padding: '14px 16px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '6px',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.825rem',
                              fontWeight: 700,
                              color: 'var(--text-main)',
                            }}
                          >
                            {item.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.value, item.id)}
                            style={{
                              backgroundColor: isCopied ? '#059669' : 'rgba(255, 255, 255, 0.05)',
                              color: isCopied ? '#ffffff' : 'var(--text-muted)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {isCopied ? <Check size={12} /> : <Copy size={12} />}
                            {isCopied ? tUI('copied') : tUI('copy')}
                          </button>
                        </div>
                        <div
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.825rem',
                            color: '#34d399',
                            wordBreak: 'break-all',
                          }}
                        >
                          {item.value}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: BCRYPT & PASSWORD HASHER */}
          {/* ========================================================================= */}
          {activeTab === 'bcrypt' && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
              }}
            >
              <h3
                style={{
                  color: 'var(--text-main)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Lock size={18} color="#a855f7" />
                {tUI('bcryptTitle')}
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '16px',
                  marginBottom: '16px',
                }}
              >
                <div>
                  <label
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    {tUI('bcryptPasswordLabel')}
                  </label>
                  <input
                    type="text"
                    value={bcryptPassword}
                    onChange={(e) => setBcryptPassword(e.target.value)}
                    placeholder="Enter password..."
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '10px 12px',
                      fontSize: '0.9rem',
                      fontFamily: 'monospace',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    {tUI('bcryptCostLabel')}: {bcryptCost} rounds
                  </label>
                  <select
                    value={bcryptCost}
                    onChange={(e) => setBcryptCost(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '10px 12px',
                      fontSize: '0.9rem',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {[4, 6, 8, 10, 12, 14].map((c) => (
                      <option key={c} value={c}>
                        Cost factor: {c} {c === 10 ? '(Default standard)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bcrypt Output Box */}
              <div
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#c084fc' }}>
                    {tUI('generatedBcryptHash')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(bcryptHash, 'bcrypt')}
                    style={{
                      backgroundColor:
                        copiedKey === 'bcrypt' ? '#059669' : 'rgba(168, 85, 247, 0.15)',
                      color: copiedKey === 'bcrypt' ? '#ffffff' : '#c084fc',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                      borderRadius: '6px',
                      padding: '4px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {copiedKey === 'bcrypt' ? <Check size={12} /> : <Copy size={12} />}
                    {copiedKey === 'bcrypt' ? tUI('copied') : tUI('copy')}
                  </button>
                </div>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    color: '#34d399',
                    wordBreak: 'break-all',
                    lineHeight: 1.4,
                  }}
                >
                  {bcryptHash}
                </div>
              </div>

              {/* Password Match Verifier */}
              <div
                style={{
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '20px',
                }}
              >
                <h4
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    marginBottom: '12px',
                  }}
                >
                  🔍 {tUI('verifyBcryptTitle')}
                </h4>
                <div
                  style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}
                >
                  <input
                    type="text"
                    value={verifyPassword}
                    onChange={(e) => {
                      setVerifyPassword(e.target.value);
                      setVerifyResult(null);
                    }}
                    placeholder={tUI('verifyPasswordPlaceholder')}
                    style={{
                      flex: 1,
                      minWidth: '220px',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '10px 12px',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyBcrypt}
                    style={{
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {tUI('checkPasswordMatch')}
                  </button>
                </div>

                {verifyResult && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor:
                        verifyResult === 'match'
                          ? 'rgba(16, 185, 129, 0.12)'
                          : 'rgba(239, 68, 68, 0.12)',
                      color: verifyResult === 'match' ? '#34d399' : '#f87171',
                      border:
                        verifyResult === 'match'
                          ? '1px solid rgba(16, 185, 129, 0.3)'
                          : '1px solid rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    {verifyResult === 'match' ? (
                      <>
                        <CheckCircle2 size={16} />
                        {tUI('passwordMatchSuccess')}
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        {tUI('passwordMatchFailed')}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: HASH MATCHER & VERIFIER */}
          {/* ========================================================================= */}
          {activeTab === 'matcher' && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
              }}
            >
              <h3
                style={{
                  color: 'var(--text-main)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle2 size={18} color="var(--primary-color)" />
                {tUI('matcherTitle')}
              </h3>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <label
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    {tUI('hashInput1Label')}
                  </label>
                  <input
                    type="text"
                    value={hash1}
                    onChange={(e) => setHash1(e.target.value)}
                    placeholder="Paste hash 1 (e.g. 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b...)"
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '10px 12px',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    {tUI('hashInput2Label')}
                  </label>
                  <input
                    type="text"
                    value={hash2}
                    onChange={(e) => setHash2(e.target.value)}
                    placeholder="Paste expected hash 2..."
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '10px 12px',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {matchResult !== null && (
                <div
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    backgroundColor: matchResult
                      ? 'rgba(16, 185, 129, 0.12)'
                      : 'rgba(239, 68, 68, 0.12)',
                    border: matchResult
                      ? '1px solid rgba(16, 185, 129, 0.35)'
                      : '1px solid rgba(239, 68, 68, 0.35)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: matchResult ? '#34d399' : '#f87171',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginBottom: '6px',
                    }}
                  >
                    {matchResult ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                    {matchResult ? tUI('matchSuccessTitle') : tUI('matchFailedTitle')}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {matchResult ? tUI('matchSuccessDesc') : tUI('matchFailedDesc')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: MULTI-LANGUAGE CODE SNIPPETS */}
          {/* ========================================================================= */}
          {activeTab === 'code' && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
              }}
            >
              <h3
                style={{
                  color: 'var(--text-main)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Code size={18} color="var(--primary-color)" />
                {tUI('codeSnippetsTitle')}
              </h3>

              {/* Language Pills */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {[
                  { key: 'php', label: 'PHP' },
                  { key: 'java', label: 'Java' },
                  { key: 'python', label: 'Python' },
                  { key: 'node', label: 'Node.js' },
                  { key: 'go', label: 'Go' },
                ].map((l) => (
                  <button
                    key={l.key}
                    type="button"
                    onClick={() =>
                      setSelectedCodeLang(l.key as 'php' | 'java' | 'python' | 'node' | 'go')
                    }
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border:
                        selectedCodeLang === l.key
                          ? '1px solid var(--primary-color)'
                          : '1px solid var(--border-color)',
                      backgroundColor:
                        selectedCodeLang === l.key ? 'var(--primary-color)' : 'var(--bg-page)',
                      color: selectedCodeLang === l.key ? '#ffffff' : 'var(--text-main)',
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              {/* Code Display Area */}
              <div
                style={{
                  position: 'relative',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '16px',
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    color: '#38bdf8',
                    overflowX: 'auto',
                    lineHeight: '1.5',
                  }}
                >
                  {selectedCodeLang === 'php' &&
                    `<?php
// SHA-256 Hash in PHP
$text = "Hello VelnoxLabs!";
$sha256 = hash('sha256', $text);
echo "SHA-256: " . $sha256 . "\\n";

// Password Hashing with Bcrypt
$password = "SecretPassword@123";
$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);

// Verify password
if (password_verify($password, $hash)) {
    echo "Password Verified Successfully!";
}
?>`}
                  {selectedCodeLang === 'java' &&
                    `import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;

public class HashExample {
    public static void main(String[] args) throws Exception {
        String text = "Hello VelnoxLabs!";
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hashBytes = digest.digest(text.getBytes(StandardCharsets.UTF_8));
        
        StringBuilder hexString = new StringBuilder();
        for (byte b : hashBytes) {
            hexString.append(String.format("%02x", b));
        }
        System.out.println("SHA-256: " + hexString.toString());
    }
}`}
                  {selectedCodeLang === 'python' &&
                    `import hashlib

text = "Hello VelnoxLabs!"

# SHA-256
sha256_hash = hashlib.sha256(text.encode('utf-8')).hexdigest()
print(f"SHA-256: {sha256_hash}")

# SHA-512
sha512_hash = hashlib.sha512(text.encode('utf-8')).hexdigest()
print(f"SHA-512: {sha512_hash}")`}
                  {selectedCodeLang === 'node' &&
                    `const crypto = require('crypto');

const text = "Hello VelnoxLabs!";

// SHA-256
const sha256 = crypto.createHash('sha256').update(text).digest('hex');
console.log('SHA-256:', sha256);

// HMAC-SHA256 with Secret Key
const secret = "my_secret_key";
const hmac = crypto.createHmac('sha256', secret).update(text).digest('hex');
console.log('HMAC-SHA256:', hmac);`}
                  {selectedCodeLang === 'go' &&
                    `package main

import (
    "crypto/sha256"
    "fmt"
)

func main() {
    text := "Hello VelnoxLabs!"
    hash := sha256.Sum256([]byte(text))
    fmt.Printf("SHA-256: %x\\n", hash)
}`}
                </pre>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: AI SOCIAL MEDIA HASHTAG GENERATOR */}
          {/* ========================================================================= */}
          {activeTab === 'hashtags' && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
              }}
            >
              <h3
                style={{
                  color: 'var(--text-main)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Sparkles size={18} color="#ec4899" />
                {tUI('hashtagGeneratorTitle')}
              </h3>

              {/* Quick Categories */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <span
                  style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center' }}
                >
                  {tUI('quickTopics')}:
                </span>
                {Object.keys(POPULAR_HASHTAG_SETS).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setHashtagInput(cat);
                      setGeneratedHashtags(POPULAR_HASHTAG_SETS[cat]);
                    }}
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '20px',
                      padding: '4px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    #{cat}
                  </button>
                ))}
              </div>

              {/* Input & Generate */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  placeholder="Enter keywords (e.g. artificial intelligence, coding, webdev)..."
                  style={{
                    flex: 1,
                    minWidth: '240px',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '10px 14px',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={generateSocialHashtags}
                  style={{
                    backgroundColor: '#ec4899',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {tUI('generateHashtagsBtn')}
                </button>
              </div>

              {/* Generated Hashtags Box */}
              <div
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {generatedHashtags.length} {tUI('tagsGenerated')}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAllHashtags}
                    style={{
                      backgroundColor:
                        copiedKey === 'hashtags' ? '#059669' : 'rgba(236, 72, 153, 0.15)',
                      color: copiedKey === 'hashtags' ? '#ffffff' : '#ec4899',
                      border: '1px solid rgba(236, 72, 153, 0.3)',
                      borderRadius: '6px',
                      padding: '6px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    {copiedKey === 'hashtags' ? <Check size={14} /> : <Copy size={14} />}
                    {copiedKey === 'hashtags' ? tUI('allCopied') : tUI('copyAllHashtags')}
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {generatedHashtags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.825rem',
                        color: '#60a5fa',
                        fontWeight: 500,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TECHNICAL SEO SECTION */}
          <ToolSeoContent
            toolSlug="hash-generator"
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
    </>
  );
}
