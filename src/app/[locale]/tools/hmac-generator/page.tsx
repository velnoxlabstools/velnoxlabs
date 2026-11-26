'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import CryptoJS from 'crypto-js';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Key,
  ShieldCheck,
  Lock,
  Unlock,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Code,
  Zap,
  CheckCircle2,
  XCircle,
  Info,
  Layers,
  Terminal,
} from 'lucide-react';

type TabType = 'generator' | 'keygen' | 'pbkdf2' | 'verifier' | 'code';
type AlgorithmType = 'SHA-256' | 'SHA-512' | 'SHA-384' | 'SHA-1' | 'MD5';
type KeyFormatType = 'hex' | 'base64' | 'alphanumeric' | 'ascii';

export default function HmacGeneratorPage() {
  const tUI = useTranslations('ToolUI.hmacGenerator');

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('generator');

  // ----------------------------------------------------
  // Tab 1: HMAC Generator State
  // ----------------------------------------------------
  const [message, setMessage] = useState(
    '{"event":"payment.succeeded","amount":2500,"currency":"usd"}'
  );
  const [secret, setSecret] = useState('k3y_live_9f82d1c5a0b7e412');
  const [showSecret, setShowSecret] = useState(false);
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('SHA-256');
  const [isUppercase, setIsUppercase] = useState(false);
  const [keyIsHex, setKeyIsHex] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Compute HMAC digests
  const hmacResults = useMemo(() => {
    if (!message || !secret) {
      return { hex: '', base64: '', base64Url: '', byteSize: 0, charCount: 0 };
    }

    try {
      let keyParam: string | CryptoJS.lib.WordArray = secret;
      if (keyIsHex) {
        try {
          keyParam = CryptoJS.enc.Hex.parse(secret.replace(/\s+/g, ''));
        } catch {
          keyParam = secret;
        }
      }

      let hashWord: CryptoJS.lib.WordArray;
      switch (algorithm) {
        case 'SHA-512':
          hashWord = CryptoJS.HmacSHA512(message, keyParam);
          break;
        case 'SHA-384':
          hashWord = CryptoJS.HmacSHA384(message, keyParam);
          break;
        case 'SHA-1':
          hashWord = CryptoJS.HmacSHA1(message, keyParam);
          break;
        case 'MD5':
          hashWord = CryptoJS.HmacMD5(message, keyParam);
          break;
        case 'SHA-256':
        default:
          hashWord = CryptoJS.HmacSHA256(message, keyParam);
          break;
      }

      let hex = hashWord.toString(CryptoJS.enc.Hex);
      if (isUppercase) hex = hex.toUpperCase();

      const base64 = hashWord.toString(CryptoJS.enc.Base64);
      const base64Url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const byteSize = new TextEncoder().encode(message).length;
      const charCount = message.length;

      return { hex, base64, base64Url, byteSize, charCount };
    } catch {
      return { hex: '', base64: '', base64Url: '', byteSize: 0, charCount: 0 };
    }
  }, [message, secret, algorithm, isUppercase, keyIsHex]);

  // ----------------------------------------------------
  // Tab 2: Secret Key Generator State
  // ----------------------------------------------------
  const [keyLengthBits, setKeyLengthBits] = useState<number>(256);
  const [keyFormat, setKeyFormat] = useState<KeyFormatType>('hex');
  const [generatedKey, setGeneratedKey] = useState<string>('');

  const generateCryptographicKey = useCallback(() => {
    const bytesNeeded = keyLengthBits / 8;
    const array = new Uint8Array(bytesNeeded);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < bytesNeeded; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }

    if (keyFormat === 'hex') {
      const hex = Array.from(array)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      setGeneratedKey(hex);
    } else if (keyFormat === 'base64') {
      let binary = '';
      for (let i = 0; i < array.length; i++) {
        binary += String.fromCharCode(array[i]);
      }
      setGeneratedKey(btoa(binary));
    } else if (keyFormat === 'alphanumeric') {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let res = '';
      for (let i = 0; i < bytesNeeded * 2; i++) {
        const rand = array[i % array.length] % chars.length;
        res += chars[rand];
      }
      setGeneratedKey(res.slice(0, bytesNeeded * 2));
    } else {
      // URL-Safe ASCII
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_~.';
      let res = '';
      for (let i = 0; i < bytesNeeded * 2; i++) {
        const rand = array[i % array.length] % chars.length;
        res += chars[rand];
      }
      setGeneratedKey(res.slice(0, bytesNeeded * 2));
    }
  }, [keyLengthBits, keyFormat]);

  useEffect(() => {
    generateCryptographicKey();
  }, [generateCryptographicKey]);

  const applyGeneratedKeyToHmac = () => {
    if (!generatedKey) return;
    setSecret(generatedKey);
    setKeyIsHex(keyFormat === 'hex');
    setActiveTab('generator');
  };

  // ----------------------------------------------------
  // Tab 3: PBKDF2-HMAC-SHA256 State
  // ----------------------------------------------------
  const [pbkdfPassword, setPbkdfPassword] = useState('PassphraseSecret_2026!');
  const [pbkdfSalt, setPbkdfSalt] = useState('random_salt_9a8b');
  const [pbkdfIterations, setPbkdfIterations] = useState(100000);
  const [pbkdfKeyBits, setPbkdfKeyBits] = useState(256);
  const [pbkdfResultHex, setPbkdfResultHex] = useState('');
  const [pbkdfResultBase64, setPbkdfResultBase64] = useState('');
  const [pbkdfDuration, setPbkdfDuration] = useState<number | null>(null);

  const calculatePbkdf2 = useCallback(() => {
    if (!pbkdfPassword || !pbkdfSalt) {
      setPbkdfResultHex('');
      setPbkdfResultBase64('');
      setPbkdfDuration(null);
      return;
    }

    try {
      const startTime = performance.now();
      const derived = CryptoJS.PBKDF2(pbkdfPassword, pbkdfSalt, {
        keySize: pbkdfKeyBits / 32,
        iterations: pbkdfIterations,
        hasher: CryptoJS.algo.SHA256,
      });
      const endTime = performance.now();

      setPbkdfResultHex(derived.toString(CryptoJS.enc.Hex));
      setPbkdfResultBase64(derived.toString(CryptoJS.enc.Base64));
      setPbkdfDuration(Math.round(endTime - startTime));
    } catch {
      setPbkdfResultHex('');
      setPbkdfResultBase64('');
    }
  }, [pbkdfPassword, pbkdfSalt, pbkdfIterations, pbkdfKeyBits]);

  useEffect(() => {
    calculatePbkdf2();
  }, [calculatePbkdf2]);

  const generateRandomSalt = () => {
    const arr = new Uint8Array(16);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(arr);
    }
    const hex = Array.from(arr)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    setPbkdfSalt(hex);
  };

  // ----------------------------------------------------
  // Tab 4: Verifier & Decrypt Explainer State
  // ----------------------------------------------------
  const [verifyMsg, setVerifyMsg] = useState(
    '{"event":"payment.succeeded","amount":2500,"currency":"usd"}'
  );
  const [verifyKey, setVerifyKey] = useState('k3y_live_9f82d1c5a0b7e412');
  const [verifyExpectedSignature, setVerifyExpectedSignature] = useState('');
  const [verifyAlgorithm, setVerifyAlgorithm] = useState<AlgorithmType>('SHA-256');

  // Auto populate expected signature initially
  useEffect(() => {
    if (hmacResults.hex && !verifyExpectedSignature) {
      setVerifyExpectedSignature(hmacResults.hex);
    }
  }, [hmacResults.hex, verifyExpectedSignature]);

  const verificationStatus = useMemo(() => {
    if (!verifyMsg || !verifyKey || !verifyExpectedSignature.trim()) return null;

    try {
      let hashWord: CryptoJS.lib.WordArray;
      switch (verifyAlgorithm) {
        case 'SHA-512':
          hashWord = CryptoJS.HmacSHA512(verifyMsg, verifyKey);
          break;
        case 'SHA-384':
          hashWord = CryptoJS.HmacSHA384(verifyMsg, verifyKey);
          break;
        case 'SHA-1':
          hashWord = CryptoJS.HmacSHA1(verifyMsg, verifyKey);
          break;
        case 'MD5':
          hashWord = CryptoJS.HmacMD5(verifyMsg, verifyKey);
          break;
        case 'SHA-256':
        default:
          hashWord = CryptoJS.HmacSHA256(verifyMsg, verifyKey);
          break;
      }

      const calculatedHex = hashWord.toString(CryptoJS.enc.Hex).toLowerCase();
      const calculatedBase64 = hashWord.toString(CryptoJS.enc.Base64);
      const cleanExpected = verifyExpectedSignature.trim();

      // Check match against hex (case-insensitive) or Base64 (exact)
      const isHexMatch = calculatedHex === cleanExpected.toLowerCase();
      const isBase64Match = calculatedBase64 === cleanExpected;

      return {
        matched: isHexMatch || isBase64Match,
        calculatedHex,
        calculatedBase64,
        matchType: isHexMatch ? 'Hex' : isBase64Match ? 'Base64' : 'None',
      };
    } catch {
      return { matched: false, calculatedHex: '', calculatedBase64: '', matchType: 'Error' };
    }
  }, [verifyMsg, verifyKey, verifyExpectedSignature, verifyAlgorithm]);

  // ----------------------------------------------------
  // Tab 5: Code Snippets State
  // ----------------------------------------------------
  const [selectedLang, setSelectedLang] = useState<
    'python' | 'node' | 'php' | 'java' | 'go' | 'curl'
  >('python');

  // Copy helper
  const handleCopy = (text: string, fieldKey: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Quick Preset Handlers
  const loadPreset = (type: 'generic' | 'github' | 'stripe' | 'shopify') => {
    if (type === 'generic') {
      setMessage('{"event":"user.created","id":"usr_99182","timestamp":1795700000}');
      setSecret('sec_app_7c2b09a1');
      setAlgorithm('SHA-256');
    } else if (type === 'github') {
      setMessage('{"ref":"refs/heads/main","repository":{"name":"velnoxlabs","owner":"velnox"}}');
      setSecret('gh_webhook_secret_x8291f');
      setAlgorithm('SHA-256');
    } else if (type === 'stripe') {
      setMessage(
        '1795700000.{"id":"evt_3MwvW2LkdIwHu7ix","object":"event","type":"charge.captured"}'
      );
      setSecret('whsec_839f28cba71d60e5');
      setAlgorithm('SHA-256');
    } else if (type === 'shopify') {
      setMessage('{"id":82098291194,"email":"customer@example.com","total_price":"49.99"}');
      setSecret('shpss_d92e8174f8372b01');
      setAlgorithm('SHA-256');
    }
  };

  return (
    <>
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          {/* Header */}
          <SectionHeading
            title={tUI('title')}
            subtitle={tUI('subtitle')}
            toolSlug="hmac-generator"
          />

          {/* Security & Client-Side Privacy Badge */}
          <div
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: '12px',
              padding: '16px 20px',
              marginTop: 'var(--space-6)',
              marginBottom: 'var(--space-6)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  borderRadius: '8px',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={20} color="#60a5fa" />
              </div>
              <div>
                <div style={{ color: '#93c5fd', fontWeight: 700, fontSize: '0.95rem' }}>
                  {tUI('clientSideBadge')}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>
                  {tUI('clientSideSubtitle')}
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                padding: '4px 10px',
                borderRadius: '6px',
                fontWeight: 600,
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              {tUI('zeroServerLog')}
            </div>
          </div>

          {/* Tab Navigation */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '20px',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '12px',
            }}
          >
            {[
              { key: 'generator', label: tUI('tabGenerator'), icon: ShieldCheck },
              { key: 'keygen', label: tUI('tabKeyGen'), icon: Key },
              { key: 'pbkdf2', label: tUI('tabPbkdf2'), icon: Layers },
              { key: 'verifier', label: tUI('tabVerifier'), icon: CheckCircle2 },
              { key: 'code', label: tUI('tabCode'), icon: Code },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabType)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--color-primary)' : 'transparent',
                    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    color: isActive ? '#60a5fa' : 'var(--text-muted)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <IconComp size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ==================================================== */}
          {/* TAB 1: HMAC Generator & Signer                       */}
          {/* ==================================================== */}
          {activeTab === 'generator' && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '24px',
              }}
            >
              {/* Presets Header */}
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
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {tUI('quickPresets')}:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <button
                    onClick={() => loadPreset('generic')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--bg-page)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                    }}
                  >
                    JSON Event
                  </button>
                  <button
                    onClick={() => loadPreset('github')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--bg-page)',
                      color: '#a78bfa',
                      border: '1px solid rgba(167, 139, 250, 0.3)',
                      cursor: 'pointer',
                    }}
                  >
                    GitHub Webhook
                  </button>
                  <button
                    onClick={() => loadPreset('stripe')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--bg-page)',
                      color: '#60a5fa',
                      border: '1px solid rgba(96, 165, 250, 0.3)',
                      cursor: 'pointer',
                    }}
                  >
                    Stripe Signature
                  </button>
                  <button
                    onClick={() => loadPreset('shopify')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--bg-page)',
                      color: '#34d399',
                      border: '1px solid rgba(52, 211, 153, 0.3)',
                      cursor: 'pointer',
                    }}
                  >
                    Shopify
                  </button>
                </div>
              </div>

              {/* Secret Key Field */}
              <div style={{ marginBottom: '20px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Key size={14} color="#60a5fa" />
                    {tUI('secretKey')}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setKeyIsHex(!keyIsHex)}
                      style={{
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: keyIsHex ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-page)',
                        color: keyIsHex ? '#60a5fa' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                      title={tUI('keyHexToggleTooltip')}
                    >
                      {keyIsHex ? tUI('keyIsHexActive') : tUI('keyIsUtf8Active')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const arr = new Uint8Array(32);
                        if (typeof window !== 'undefined' && window.crypto) {
                          window.crypto.getRandomValues(arr);
                        }
                        const hex = Array.from(arr)
                          .map((b) => b.toString(16).padStart(2, '0'))
                          .join('');
                        setSecret(hex);
                        setKeyIsHex(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: '#60a5fa',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      <Sparkles size={12} />
                      {tUI('randomKeyBtn')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title={showSecret ? 'Hide secret key' : 'Show secret key'}
                    >
                      {showSecret ? <Unlock size={14} /> : <Lock size={14} />}
                    </button>
                  </div>
                </div>
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder={tUI('secretPlaceholder')}
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
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginTop: '4px',
                  }}
                >
                  <span>
                    {secret.length} {tUI('characters')} • {new TextEncoder().encode(secret).length}{' '}
                    {tUI('bytes')}
                  </span>
                  <span>
                    {algorithm === 'SHA-256' ? '✓ 256-bit hash key' : `${algorithm} mode`}
                  </span>
                </div>
              </div>

              {/* Algorithm & Settings Toolbar */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label
                    style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600 }}
                  >
                    {tUI('algorithm')}:
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(['SHA-256', 'SHA-512', 'SHA-384', 'SHA-1', 'MD5'] as AlgorithmType[]).map(
                      (alg) => (
                        <button
                          key={alg}
                          onClick={() => setAlgorithm(alg)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            backgroundColor:
                              algorithm === alg ? 'var(--color-primary)' : 'var(--bg-page)',
                            color: algorithm === alg ? '#ffffff' : 'var(--text-main)',
                            border:
                              algorithm === alg
                                ? '1px solid var(--color-primary)'
                                : '1px solid var(--border-color)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {alg}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setIsUppercase(!isUppercase)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-page)',
                      color: isUppercase ? '#60a5fa' : 'var(--text-muted)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {isUppercase ? tUI('uppercaseActive') : tUI('lowercaseActive')}
                  </button>
                </div>
              </div>

              {/* Message Payload Editor */}
              <div style={{ marginBottom: '24px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Terminal size={14} color="#60a5fa" />
                    {tUI('message')}
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {hmacResults.charCount} {tUI('characters')} • {hmacResults.byteSize}{' '}
                    {tUI('bytes')}
                  </span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder={tUI('messagePlaceholder')}
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

              {/* Generated HMAC Signature Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 1. Hexadecimal Output */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '14px',
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
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8' }}>
                      HMAC-{algorithm} ({tUI('formatHex')})
                    </span>
                    <button
                      onClick={() => handleCopy(hmacResults.hex, 'hex')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor:
                          copiedField === 'hex'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(56, 189, 248, 0.12)',
                        color: copiedField === 'hex' ? '#34d399' : '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {copiedField === 'hex' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedField === 'hex' ? tUI('copied') : tUI('copy')}
                    </button>
                  </div>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      color: '#34d399',
                      wordBreak: 'break-all',
                      lineHeight: '1.4',
                    }}
                  >
                    {hmacResults.hex || (
                      <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                        {tUI('signaturePlaceholder')}
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Base64 Output */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '14px',
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
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a78bfa' }}>
                      HMAC-{algorithm} ({tUI('formatBase64')})
                    </span>
                    <button
                      onClick={() => handleCopy(hmacResults.base64, 'base64')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor:
                          copiedField === 'base64'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(167, 139, 250, 0.12)',
                        color: copiedField === 'base64' ? '#34d399' : '#a78bfa',
                        border: '1px solid rgba(167, 139, 250, 0.3)',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {copiedField === 'base64' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedField === 'base64' ? tUI('copied') : tUI('copy')}
                    </button>
                  </div>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      color: '#a78bfa',
                      wordBreak: 'break-all',
                      lineHeight: '1.4',
                    }}
                  >
                    {hmacResults.base64 || (
                      <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                        {tUI('signaturePlaceholder')}
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Base64URL Output */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '14px',
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
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24' }}>
                      HMAC-{algorithm} ({tUI('formatBase64Url')})
                    </span>
                    <button
                      onClick={() => handleCopy(hmacResults.base64Url, 'base64url')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor:
                          copiedField === 'base64url'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(251, 191, 36, 0.12)',
                        color: copiedField === 'base64url' ? '#34d399' : '#fbbf24',
                        border: '1px solid rgba(251, 191, 36, 0.3)',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {copiedField === 'base64url' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedField === 'base64url' ? tUI('copied') : tUI('copy')}
                    </button>
                  </div>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      color: '#fbbf24',
                      wordBreak: 'break-all',
                      lineHeight: '1.4',
                    }}
                  >
                    {hmacResults.base64Url || (
                      <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                        {tUI('signaturePlaceholder')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: Secret Key Generator                          */}
          {/* ==================================================== */}
          {activeTab === 'keygen' && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '24px',
              }}
            >
              <div style={{ marginBottom: '20px' }}>
                <h3
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Key size={18} color="#60a5fa" />
                  {tUI('keyGenTitle')}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {tUI('keyGenSubtitle')}
                </p>
              </div>

              {/* Length Selector */}
              <div style={{ marginBottom: '18px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '8px',
                  }}
                >
                  {tUI('keyEntropyLabel')}:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
                    { bits: 128, label: '128-bit (16 Bytes)' },
                    { bits: 256, label: '256-bit (32 Bytes - Standard)' },
                    { bits: 384, label: '384-bit (48 Bytes)' },
                    { bits: 512, label: '512-bit (64 Bytes - Maximum)' },
                  ].map((opt) => (
                    <button
                      key={opt.bits}
                      onClick={() => setKeyLengthBits(opt.bits)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        backgroundColor:
                          keyLengthBits === opt.bits ? 'var(--color-primary)' : 'var(--bg-page)',
                        color: keyLengthBits === opt.bits ? '#ffffff' : 'var(--text-main)',
                        border:
                          keyLengthBits === opt.bits
                            ? '1px solid var(--color-primary)'
                            : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format Selector */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '8px',
                  }}
                >
                  {tUI('keyFormatLabel')}:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
                    { id: 'hex', label: 'Hexadecimal' },
                    { id: 'base64', label: 'Base64' },
                    { id: 'alphanumeric', label: 'Alphanumeric' },
                    { id: 'ascii', label: 'URL-Safe Characters' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => setKeyFormat(fmt.id as KeyFormatType)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        backgroundColor:
                          keyFormat === fmt.id ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-page)',
                        color: keyFormat === fmt.id ? '#60a5fa' : 'var(--text-main)',
                        border:
                          keyFormat === fmt.id
                            ? '1px solid rgba(59, 130, 246, 0.4)'
                            : '1px solid var(--border-color)',
                        cursor: 'pointer',
                      }}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Output Display */}
              <div
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px',
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
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {tUI('generatedSecretKeyLabel')}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={generateCryptographicKey}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <RefreshCw size={12} />
                      {tUI('regenerateKeyBtn')}
                    </button>
                    <button
                      onClick={() => handleCopy(generatedKey, 'genkey')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor:
                          copiedField === 'genkey'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(59, 130, 246, 0.15)',
                        color: copiedField === 'genkey' ? '#34d399' : '#60a5fa',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {copiedField === 'genkey' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedField === 'genkey' ? tUI('copied') : tUI('copy')}
                    </button>
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    color: '#34d399',
                    wordBreak: 'break-all',
                    lineHeight: '1.4',
                  }}
                >
                  {generatedKey}
                </div>
              </div>

              {/* Action: Use in Generator */}
              <button
                onClick={applyGeneratedKeyToHmac}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Zap size={16} />
                {tUI('applyKeyToHmacBtn')}
              </button>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: PBKDF2-HMAC-SHA256                            */}
          {/* ==================================================== */}
          {activeTab === 'pbkdf2' && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '24px',
              }}
            >
              <div style={{ marginBottom: '20px' }}>
                <h3
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Layers size={18} color="#60a5fa" />
                  {tUI('pbkdf2Title')}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {tUI('pbkdf2Subtitle')}
                </p>
              </div>

              {/* Passphrase & Salt */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '16px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      marginBottom: '6px',
                    }}
                  >
                    {tUI('pbkdfPasswordLabel')}
                  </label>
                  <input
                    type="text"
                    value={pbkdfPassword}
                    onChange={(e) => setPbkdfPassword(e.target.value)}
                    placeholder="Enter password..."
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
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <label
                      style={{
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                      }}
                    >
                      {tUI('pbkdfSaltLabel')}
                    </label>
                    <button
                      onClick={generateRandomSalt}
                      style={{
                        fontSize: '0.75rem',
                        color: '#60a5fa',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      {tUI('randomSaltBtn')}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={pbkdfSalt}
                    onChange={(e) => setPbkdfSalt(e.target.value)}
                    placeholder="Enter salt string or hex..."
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

              {/* Iterations & Key Length */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '16px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      marginBottom: '6px',
                    }}
                  >
                    {tUI('pbkdfIterationsLabel')}: {pbkdfIterations.toLocaleString()} rounds
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {[1000, 10000, 100000, 310000, 600000].map((rounds) => (
                      <button
                        key={rounds}
                        onClick={() => setPbkdfIterations(rounds)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor:
                            pbkdfIterations === rounds ? 'var(--color-primary)' : 'var(--bg-page)',
                          color: pbkdfIterations === rounds ? '#ffffff' : 'var(--text-main)',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                        }}
                      >
                        {rounds >= 1000 ? `${rounds / 1000}k` : rounds}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      marginBottom: '6px',
                    }}
                  >
                    {tUI('pbkdfDerivedLengthLabel')}:
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[128, 256, 512].map((bits) => (
                      <button
                        key={bits}
                        onClick={() => setPbkdfKeyBits(bits)}
                        style={{
                          flex: 1,
                          padding: '6px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          backgroundColor:
                            pbkdfKeyBits === bits ? 'var(--color-primary)' : 'var(--bg-page)',
                          color: pbkdfKeyBits === bits ? '#ffffff' : 'var(--text-main)',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                        }}
                      >
                        {bits}-bit
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* PBKDF2 Outputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pbkdfDuration !== null && (
                  <div style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600 }}>
                    ⚡ {tUI('pbkdfBenchPrefix')} {pbkdfDuration} ms
                  </div>
                )}
                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399' }}>
                      PBKDF2-HMAC-SHA256 (Hex)
                    </span>
                    <button
                      onClick={() => handleCopy(pbkdfResultHex, 'pbkdf_hex')}
                      style={{
                        padding: '2px 8px',
                        fontSize: '0.75rem',
                        borderRadius: '4px',
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                      }}
                    >
                      {copiedField === 'pbkdf_hex' ? tUI('copied') : tUI('copy')}
                    </button>
                  </div>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      color: '#34d399',
                      wordBreak: 'break-all',
                    }}
                  >
                    {pbkdfResultHex}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a78bfa' }}>
                      PBKDF2-HMAC-SHA256 (Base64)
                    </span>
                    <button
                      onClick={() => handleCopy(pbkdfResultBase64, 'pbkdf_base64')}
                      style={{
                        padding: '2px 8px',
                        fontSize: '0.75rem',
                        borderRadius: '4px',
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                      }}
                    >
                      {copiedField === 'pbkdf_base64' ? tUI('copied') : tUI('copy')}
                    </button>
                  </div>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      color: '#a78bfa',
                      wordBreak: 'break-all',
                    }}
                  >
                    {pbkdfResultBase64}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: Verifier & Decrypt Explainer                  */}
          {/* ==================================================== */}
          {activeTab === 'verifier' && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '24px',
              }}
            >
              {/* Educational Decrypt Box */}
              <div
                style={{
                  backgroundColor: 'rgba(234, 179, 8, 0.08)',
                  border: '1px solid rgba(234, 179, 8, 0.25)',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#facc15',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    marginBottom: '6px',
                  }}
                >
                  <Info size={18} />
                  {tUI('decryptNoticeTitle')}
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                  {tUI('decryptNoticeDesc')}
                </p>
              </div>

              {/* Signature Verification Form */}
              <div style={{ marginBottom: '20px' }}>
                <h4
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    marginBottom: '14px',
                  }}
                >
                  {tUI('verifierSectionTitle')}
                </h4>

                <div style={{ marginBottom: '14px' }}>
                  <label
                    style={{
                      display: 'block',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      marginBottom: '6px',
                    }}
                  >
                    {tUI('verifyPayloadLabel')}
                  </label>
                  <textarea
                    rows={3}
                    value={verifyMsg}
                    onChange={(e) => setVerifyMsg(e.target.value)}
                    placeholder="Enter payload string to verify..."
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '10px',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '14px',
                    marginBottom: '14px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        marginBottom: '6px',
                      }}
                    >
                      {tUI('secretKey')}
                    </label>
                    <input
                      type="text"
                      value={verifyKey}
                      onChange={(e) => setVerifyKey(e.target.value)}
                      placeholder="Enter secret key..."
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        padding: '10px',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        marginBottom: '6px',
                      }}
                    >
                      {tUI('algorithm')}
                    </label>
                    <select
                      value={verifyAlgorithm}
                      onChange={(e) => setVerifyAlgorithm(e.target.value as AlgorithmType)}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        padding: '10px',
                        fontSize: '0.85rem',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="SHA-256">HMAC-SHA256</option>
                      <option value="SHA-512">HMAC-SHA512</option>
                      <option value="SHA-384">HMAC-SHA384</option>
                      <option value="SHA-1">HMAC-SHA1</option>
                      <option value="MD5">HMAC-MD5</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label
                    style={{
                      display: 'block',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      marginBottom: '6px',
                    }}
                  >
                    {tUI('verifySignatureToTestLabel')}
                  </label>
                  <input
                    type="text"
                    value={verifyExpectedSignature}
                    onChange={(e) => setVerifyExpectedSignature(e.target.value)}
                    placeholder="Paste received signature from HTTP header (Hex or Base64)..."
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '10px',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Live Match Result */}
                {verificationStatus && (
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid',
                      backgroundColor: verificationStatus.matched
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'rgba(239, 68, 68, 0.1)',
                      borderColor: verificationStatus.matched
                        ? 'rgba(16, 185, 129, 0.3)'
                        : 'rgba(239, 68, 68, 0.3)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    {verificationStatus.matched ? (
                      <CheckCircle2
                        size={24}
                        color="#34d399"
                        style={{ flexShrink: 0, marginTop: '2px' }}
                      />
                    ) : (
                      <XCircle
                        size={24}
                        color="#f87171"
                        style={{ flexShrink: 0, marginTop: '2px' }}
                      />
                    )}
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: verificationStatus.matched ? '#34d399' : '#f87171',
                          marginBottom: '4px',
                        }}
                      >
                        {verificationStatus.matched
                          ? tUI('verifyMatchSuccessTitle')
                          : tUI('verifyMatchFailedTitle')}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                        {verificationStatus.matched
                          ? tUI('verifyMatchSuccessDesc')
                          : tUI('verifyMatchFailedDesc')}
                      </div>
                      <div
                        style={{
                          marginTop: '8px',
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                          color: '#94a3b8',
                        }}
                      >
                        Calculated Hex: {verificationStatus.calculatedHex}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 5: Code Snippets                                 */}
          {/* ==================================================== */}
          {activeTab === 'code' && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '24px',
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <h3
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Code size={18} color="#60a5fa" />
                  {tUI('codeSnippetsTitle')}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {tUI('codeSnippetsSubtitle')}
                </p>
              </div>

              {/* Language Selector */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {[
                  { id: 'python', label: 'Python (hmac + hashlib)' },
                  { id: 'node', label: 'Node.js / TypeScript' },
                  { id: 'php', label: 'PHP (hash_hmac)' },
                  { id: 'java', label: 'Java (javax.crypto.Mac)' },
                  { id: 'go', label: 'Go (crypto/hmac)' },
                  { id: 'curl', label: 'cURL / OpenSSL CLI' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedLang(item.id as typeof selectedLang)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      backgroundColor:
                        selectedLang === item.id ? 'var(--color-primary)' : 'var(--bg-page)',
                      color: selectedLang === item.id ? '#ffffff' : 'var(--text-main)',
                      border:
                        selectedLang === item.id
                          ? '1px solid var(--color-primary)'
                          : '1px solid var(--border-color)',
                      cursor: 'pointer',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Code Box */}
              <div
                style={{
                  position: 'relative',
                  backgroundColor: '#0a0f1d',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                <button
                  onClick={() => {
                    const snippets: Record<string, string> = {
                      python: `import hmac\nimport hashlib\n\nkey = b"${secret}"\nmessage = b'${message.replace(/'/g, "\\'")}'\n\nsignature_hex = hmac.new(key, message, hashlib.sha256).hexdigest()\nprint("HMAC-SHA256:", signature_hex)`,
                      node: `import crypto from 'crypto';\n\nconst key = '${secret}';\nconst message = '${message.replace(/'/g, "\\'")}';\n\nconst signatureHex = crypto.createHmac('sha256', key).update(message).digest('hex');\nconsole.log('HMAC-SHA256:', signatureHex);`,
                      php: `<?php\n$key = '${secret}';\n$message = '${message.replace(/'/g, "\\'")}';\n\n$signatureHex = hash_hmac('sha256', $message, $key);\necho "HMAC-SHA256: " . $signatureHex . PHP_EOL;`,
                      java: `import javax.crypto.Mac;\nimport javax.crypto.spec.SecretKeySpec;\nimport java.util.HexFormat;\n\npublic class HmacExample {\n    public static void main(String[] args) throws Exception {\n        String key = "${secret}";\n        String message = "${message.replace(/"/g, '\\"')}";\n\n        Mac mac = Mac.getInstance("HmacSHA256");\n        mac.init(new SecretKeySpec(key.getBytes(), "HmacSHA256"));\n        byte[] hash = mac.doFinal(message.getBytes());\n\n        String signatureHex = HexFormat.of().formatHex(hash);\n        System.out.println("HMAC-SHA256: " + signatureHex);\n    }\n}`,
                      go: `package main\n\nimport (\n    "crypto/hmac"\n    "crypto/sha256"\n    "encoding/hex"\n    "fmt"\n)\n\nfunc main() {\n    key := []byte("${secret}")\n    message := []byte(\`${message}\`)\n\n    mac := hmac.New(sha256.New, key)\n    mac.Write(message)\n    signatureHex := hex.EncodeToString(mac.Sum(nil))\n\n    fmt.Println("HMAC-SHA256:", signatureHex)\n}`,
                      curl: `# Generate HMAC-SHA256 in Bash using OpenSSL:\necho -n '${message.replace(/'/g, "\\'")}' | openssl dgst -sha256 -hmac "${secret}"`,
                    };
                    handleCopy(snippets[selectedLang], 'snippet');
                  }}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copiedField === 'snippet' ? (
                    <Check size={12} color="#34d399" />
                  ) : (
                    <Copy size={12} />
                  )}
                  {copiedField === 'snippet' ? tUI('copied') : tUI('copy')}
                </button>

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
                  {selectedLang === 'python' &&
                    `import hmac\nimport hashlib\n\nkey = b"${secret}"\nmessage = b'${message.replace(/'/g, "\\'")}'\n\nsignature_hex = hmac.new(key, message, hashlib.sha256).hexdigest()\nprint("HMAC-SHA256:", signature_hex)`}
                  {selectedLang === 'node' &&
                    `import crypto from 'crypto';\n\nconst key = '${secret}';\nconst message = '${message.replace(/'/g, "\\'")}';\n\nconst signatureHex = crypto.createHmac('sha256', key).update(message).digest('hex');\nconsole.log('HMAC-SHA256:', signatureHex);`}
                  {selectedLang === 'php' &&
                    `<?php\n$key = '${secret}';\n$message = '${message.replace(/'/g, "\\'")}';\n\n$signatureHex = hash_hmac('sha256', $message, $key);\necho "HMAC-SHA256: " . $signatureHex . PHP_EOL;`}
                  {selectedLang === 'java' &&
                    `import javax.crypto.Mac;\nimport javax.crypto.spec.SecretKeySpec;\nimport java.util.HexFormat;\n\npublic class HmacExample {\n    public static void main(String[] args) throws Exception {\n        String key = "${secret}";\n        String message = "${message.replace(/"/g, '\\"')}";\n\n        Mac mac = Mac.getInstance("HmacSHA256");\n        mac.init(new SecretKeySpec(key.getBytes(), "HmacSHA256"));\n        byte[] hash = mac.doFinal(message.getBytes());\n\n        String signatureHex = HexFormat.of().formatHex(hash);\n        System.out.println("HMAC-SHA256: " + signatureHex);\n    }\n}`}
                  {selectedLang === 'go' &&
                    `package main\n\nimport (\n    "crypto/hmac"\n    "crypto/sha256"\n    "encoding/hex"\n    "fmt"\n)\n\nfunc main() {\n    key := []byte("${secret}")\n    message := []byte(\`${message}\`)\n\n    mac := hmac.New(sha256.New, key)\n    mac.Write(message)\n    signatureHex := hex.EncodeToString(mac.Sum(nil))\n\n    fmt.Println("HMAC-SHA256:", signatureHex)\n}`}
                  {selectedLang === 'curl' &&
                    `# Generate HMAC-SHA256 in Bash using OpenSSL:\necho -n '${message.replace(/'/g, "\\'")}' | openssl dgst -sha256 -hmac "${secret}"`}
                </pre>
              </div>
            </div>
          )}

          {/* SEO Content Section */}
          <ToolSeoContent
            toolSlug="hmac-generator"
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
