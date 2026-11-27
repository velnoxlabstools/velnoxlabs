'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  Lock,
  Sparkles,
  Copy,
  Check,
  Terminal,
  Trash2,
} from 'lucide-react';

// Common weak secrets for audit
const COMMON_SECRETS = new Set([
  'secret',
  'password',
  '123456',
  '12345678',
  '123456789',
  'admin',
  'jwtsecret',
  'test',
  'demo',
  'key',
  'root',
  'secretkey',
  'mysecret',
  'supersecret',
]);

interface DecodedToken {
  header: Record<string, unknown> | null;
  payload: Record<string, unknown> | null;
  signature: string;
  rawHeader: string;
  rawPayload: string;
  error: string | null;
}

interface AuditFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'pass';
  title: string;
  detail: string;
}

// Pre-computed presets
const SAMPLE_TOKENS = {
  standard: {
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsZXggSm9obnNvbiIsImVtYWlsIjoiYWxleEB2ZWxub3hsYWJzLmNvbSIsImFkbWluIjp0cnVlLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTkyNDk4NTYwMH0.X3e0H1j-X1GgS4d1U10bQJ10J7N0F3L5J5B5C5D5E5F',
    secret: 'your-256-bit-secret',
  },
  firebase: {
    token:
      'eyJhbGciOiJSUzI1NiIsImtpZCI6ImZpcmViYXNlLWtleS00MiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vbXktcHJvamVjdCIsImF1ZCI6Im15LXByb2plY3QiLCJhdXRoX3RpbWUiOjE3MDAwMDAwMDAsInVzZXJfaWQiOiJ1Xzk4NGYxYjJjIiwic3ViIjoidV85ODRmMWIyYyIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDAzNjAwLCJlbWFpbCI6ImRldmVsb3BlckB2ZWxub3hsYWJzLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlfQ.kE1bX2tY3uI4oP5qA6sD7fG8hJ9kL0zX',
    secret: '',
  },
  supabase: {
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxOTI0OTg1NjAwLCJzdWIiOiJiMmMzZDRlNS1mNmE3LTRiOGMtOWQwZS0xZjJhM2I0YzVkNmUiLCJlbWFpbCI6InVzZXJAc3VwYWJhc2UuaW8iLCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEifQ.mG5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4G5',
    secret: 'supabase-jwt-secret-example-key',
  },
  expired: {
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJleHBpcmVkLXVzZXIiLCJuYW1lIjoiRXhwaXJlZCBGaWxlIiwiaWF0IjoxNTc3ODMzMjAwLCJleHAiOjE1Nzc4MzY4MDB9.s1i2g3n4a5t6u7r8e9e1x2p3i4r5e6d7v8a9l0i1d2e',
    secret: 'secret',
  },
  insecure: {
    token:
      'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhdHRhY2tlciIsInJvbGUiOiJzdXBlcmFkbWluIiwiYWRtaW4iOnRydWUsImlhdCI6MTYwMDAwMDAwMH0.',
    secret: '',
  },
};

export default function JwtDecoderPage() {
  const tUI = useTranslations('ToolUI.jwtDecoder');

  const [tokenInput, setTokenInput] = useState<string>(SAMPLE_TOKENS.standard.token);
  const [secretInput, setSecretInput] = useState<string>(SAMPLE_TOKENS.standard.secret);
  const [isSecretBase64, setIsSecretBase64] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string>('');
  const [verifyStatus, setVerifyStatus] = useState<
    'verified' | 'invalid' | 'unverified' | 'asymmetric' | 'none'
  >('unverified');

  // Decode Base64Url helper
  const decodeBase64Url = (str: string): string => {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  };

  // Safe parse JWT
  const decoded: DecodedToken = useMemo(() => {
    const trimmed = tokenInput.trim();
    if (!trimmed) {
      return {
        header: null,
        payload: null,
        signature: '',
        rawHeader: '',
        rawPayload: '',
        error: null,
      };
    }

    const parts = trimmed.split('.');
    if (parts.length !== 3) {
      return {
        header: null,
        payload: null,
        signature: '',
        rawHeader: '',
        rawPayload: '',
        error: tUI('invalidFormat'),
      };
    }

    try {
      const headerStr = decodeBase64Url(parts[0]);
      const payloadStr = decodeBase64Url(parts[1]);
      const headerJson = JSON.parse(headerStr);
      const payloadJson = JSON.parse(payloadStr);

      return {
        header: headerJson,
        payload: payloadJson,
        signature: parts[2],
        rawHeader: headerStr,
        rawPayload: payloadStr,
        error: null,
      };
    } catch {
      return {
        header: null,
        payload: null,
        signature: parts[2] || '',
        rawHeader: '',
        rawPayload: '',
        error: tUI('decodeFailed'),
      };
    }
  }, [tokenInput, tUI]);

  // Relative Time Formatter
  const formatEpochTime = useCallback((epoch: number) => {
    if (!epoch || typeof epoch !== 'number') return null;
    const date = new Date(epoch * 1000);
    const now = Date.now();
    const diffSec = Math.floor((epoch * 1000 - now) / 1000);

    let relativeStr = '';
    const absDiff = Math.abs(diffSec);

    if (absDiff < 60) {
      relativeStr = diffSec >= 0 ? 'in a few seconds' : 'a few seconds ago';
    } else if (absDiff < 3600) {
      const mins = Math.floor(absDiff / 60);
      relativeStr = diffSec >= 0 ? `in ${mins}m` : `${mins}m ago`;
    } else if (absDiff < 86400) {
      const hours = Math.floor(absDiff / 3600);
      relativeStr = diffSec >= 0 ? `in ${hours}h` : `${hours}h ago`;
    } else {
      const days = Math.floor(absDiff / 86400);
      relativeStr = diffSec >= 0 ? `in ${days}d` : `${days}d ago`;
    }

    return {
      iso: date.toISOString(),
      local: date.toLocaleString(),
      relative: relativeStr,
      isPast: diffSec < 0,
      diffSec,
    };
  }, []);

  // Expiration Status
  const expirationInfo = useMemo(() => {
    if (!decoded.payload) return null;
    const exp = decoded.payload.exp;
    const nbf = decoded.payload.nbf;
    const now = Math.floor(Date.now() / 1000);

    if (typeof exp !== 'number') {
      return { status: 'immortal', label: tUI('tokenImmortal'), color: '#38bdf8' };
    }

    if (typeof nbf === 'number' && now < nbf) {
      return { status: 'future', label: tUI('tokenFuture'), color: '#facc15' };
    }

    if (now > exp) {
      return { status: 'expired', label: tUI('tokenExpired'), color: '#f87171' };
    }

    return { status: 'active', label: tUI('tokenActive'), color: '#4ade80' };
  }, [decoded.payload, tUI]);

  // AI & Smart Security Audit Engine
  const securityAudit = useMemo(() => {
    if (!decoded.header || !decoded.payload) return null;

    const findings: AuditFinding[] = [];
    let score = 100;
    const header = decoded.header;
    const payload = decoded.payload;
    const alg = String(header.alg || '').toUpperCase();
    const now = Math.floor(Date.now() / 1000);

    // 1. Alg None Check (Critical)
    if (!alg || alg === 'NONE' || decoded.signature === '') {
      findings.push({
        id: 'alg-none',
        severity: 'critical',
        title: 'Critical Vulnerability: Algorithm "none" / Missing Signature',
        detail:
          'Tokens signed with "alg: none" or missing signatures allow attackers to forge tokens with elevated permissions (CVE-2015-9235 attack vector).',
      });
      score -= 50;
    } else {
      findings.push({
        id: 'alg-secure',
        severity: 'pass',
        title: `Valid Cryptographic Algorithm: ${alg}`,
        detail: `Token specifies standard algorithm (${alg}).`,
      });
    }

    // 2. Expiration (exp) Claim Audit
    if (typeof payload.exp !== 'number') {
      findings.push({
        id: 'missing-exp',
        severity: 'high',
        title: 'Missing "exp" (Expiration) Claim: Immortal Bearer Token',
        detail:
          'This token has no expiration timestamp. An immortal token cannot be invalidated automatically, posing high risk if intercepted.',
      });
      score -= 25;
    } else if (now > payload.exp) {
      findings.push({
        id: 'expired-token',
        severity: 'medium',
        title: 'Token Currently Expired',
        detail: `Expired at epoch ${payload.exp}. Backend middleware enforcing RFC 7519 will reject this token.`,
      });
      score -= 10;
    } else {
      findings.push({
        id: 'active-token',
        severity: 'pass',
        title: 'Token is Active and Within Valid Lifetime',
        detail: `Token expires safely in the future (${new Date(payload.exp * 1000).toLocaleString()}).`,
      });

      // Check TTL > 30 days
      const issueTime = typeof payload.iat === 'number' ? payload.iat : now;
      const ttlDays = (payload.exp - issueTime) / 86400;
      if (ttlDays > 30) {
        findings.push({
          id: 'long-ttl',
          severity: 'low',
          title: `Excessive Expiration Duration (~${Math.round(ttlDays)} days)`,
          detail:
            'JWT access token lifetimes should ideally be 15 to 60 minutes. Long-lived access tokens increase replay attack windows (use refresh tokens instead).',
        });
        score -= 10;
      }
    }

    // 3. Sensitive Data Exposure Audit
    const sensitiveKeyRegex =
      /^(password|passwd|secret|api[_-]?key|private[_-]?key|auth[_-]?token|ssn|credit[_-]?card|cvv|pin)$/i;
    const exposedKeys: string[] = [];

    const inspectObjectKeys = (obj: Record<string, unknown>) => {
      for (const [k, v] of Object.entries(obj)) {
        if (sensitiveKeyRegex.test(k)) {
          exposedKeys.push(k);
        }
        if (v && typeof v === 'object' && !Array.isArray(v)) {
          inspectObjectKeys(v as Record<string, unknown>);
        }
      }
    };
    inspectObjectKeys(payload);

    if (exposedKeys.length > 0) {
      findings.push({
        id: 'sensitive-data',
        severity: 'critical',
        title: `Sensitive Credential Exposure: "${exposedKeys.join(', ')}"`,
        detail:
          'JWT payloads are merely Base64URL-encoded, NOT encrypted! Anyone in possession of the token can read plaintext keys.',
      });
      score -= 30;
    } else {
      findings.push({
        id: 'no-sensitive-data',
        severity: 'pass',
        title: 'No Obvious Plaintext Credentials Leaked',
        detail: 'Standard claim structure verified without exposed password or private key fields.',
      });
    }

    // 4. Weak Secret Audit
    if (secretInput.trim()) {
      const lowerSecret = secretInput.trim().toLowerCase();
      if (COMMON_SECRETS.has(lowerSecret)) {
        findings.push({
          id: 'weak-secret',
          severity: 'high',
          title: `Insecure Dictionary Secret: "${secretInput}"`,
          detail:
            'This secret is a well-known dictionary word easily cracked via offline dictionary brute-force attacks (e.g., hashcat/john).',
        });
        score -= 20;
      }
    }

    // 5. Standard Claims presence (iss, sub, aud)
    const missingStandard: string[] = [];
    if (!payload.iss) missingStandard.push('iss');
    if (!payload.sub) missingStandard.push('sub');
    if (!payload.aud) missingStandard.push('aud');

    if (missingStandard.length > 0) {
      findings.push({
        id: 'missing-claims',
        severity: 'low',
        title: `Recommended Standard Claims Missing (${missingStandard.join(', ')})`,
        detail:
          'RFC 7519 recommends setting "iss" (issuer) and "aud" (audience) to avoid token reuse across unauthorized microservices.',
      });
      score -= 5;
    } else {
      findings.push({
        id: 'rfc-claims-pass',
        severity: 'pass',
        title: 'Standard Registered Claims (iss, sub, aud) Present',
        detail: 'Good architecture: Token is scoped to specific audience and issuer.',
      });
    }

    const finalScore = Math.max(0, Math.min(100, score));

    return {
      score: finalScore,
      findings,
    };
  }, [decoded.header, decoded.payload, decoded.signature, secretInput]);

  // Client-side Web Crypto HMAC Verification
  const verifyHmacSignature = useCallback(async () => {
    if (!decoded.header || !tokenInput.trim()) {
      setVerifyStatus('unverified');
      return;
    }

    const alg = String(decoded.header.alg || '').toUpperCase();

    if (!alg || alg === 'NONE') {
      setVerifyStatus('none');
      return;
    }

    // Asymmetric algorithms require public key
    if (alg.startsWith('RS') || alg.startsWith('ES') || alg.startsWith('PS') || alg === 'EDDSA') {
      setVerifyStatus('asymmetric');
      return;
    }

    if (!secretInput.trim()) {
      setVerifyStatus('unverified');
      return;
    }

    const parts = tokenInput.trim().split('.');
    if (parts.length !== 3) {
      setVerifyStatus('invalid');
      return;
    }

    try {
      const hashName = alg === 'HS384' ? 'SHA-384' : alg === 'HS512' ? 'SHA-512' : 'SHA-256';

      let secretKeyBytes: Uint8Array;
      if (isSecretBase64) {
        try {
          const bin = atob(secretInput.replace(/-/g, '+').replace(/_/g, '/'));
          secretKeyBytes = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) secretKeyBytes[i] = bin.charCodeAt(i);
        } catch {
          secretKeyBytes = new TextEncoder().encode(secretInput);
        }
      } else {
        secretKeyBytes = new TextEncoder().encode(secretInput);
      }

      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        secretKeyBytes as unknown as BufferSource,
        { name: 'HMAC', hash: { name: hashName } },
        false,
        ['verify']
      );

      // Decode expected signature
      let sigBase64 = parts[2].replace(/-/g, '+').replace(/_/g, '/');
      while (sigBase64.length % 4) sigBase64 += '=';
      const binarySig = atob(sigBase64);
      const sigBytes = new Uint8Array(binarySig.length);
      for (let i = 0; i < binarySig.length; i++) sigBytes[i] = binarySig.charCodeAt(i);

      const dataBytes = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
      const isValid = await window.crypto.subtle.verify(
        'HMAC',
        cryptoKey,
        sigBytes as unknown as BufferSource,
        dataBytes as unknown as BufferSource
      );

      setVerifyStatus(isValid ? 'verified' : 'invalid');
    } catch {
      setVerifyStatus('invalid');
    }
  }, [decoded.header, tokenInput, secretInput, isSecretBase64]);

  // Run verification when inputs change
  useEffect(() => {
    verifyHmacSignature();
  }, [verifyHmacSignature]);

  // Load Preset
  const handleLoadPreset = (key: keyof typeof SAMPLE_TOKENS) => {
    const p = SAMPLE_TOKENS[key];
    setTokenInput(p.token);
    setSecretInput(p.secret);
  };

  // Copy helper
  const handleCopy = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  // Telemetry stats
  const tokenStats = useMemo(() => {
    const raw = tokenInput.trim();
    const parts = raw.split('.');
    return {
      totalBytes: new Blob([raw]).size,
      headerBytes: parts[0] ? new Blob([parts[0]]).size : 0,
      payloadBytes: parts[1] ? new Blob([parts[1]]).size : 0,
      alg: decoded.header?.alg ? String(decoded.header.alg) : 'unknown',
      typ: decoded.header?.typ ? String(decoded.header.typ) : 'JWT',
    };
  }, [tokenInput, decoded.header]);

  return (
    <>
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          {/* Header & Badges */}
          <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'center',
              marginTop: '12px',
              marginBottom: '24px',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#34d399',
                backgroundColor: 'rgba(52, 211, 153, 0.1)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                borderRadius: '9999px',
                padding: '4px 12px',
              }}
            >
              <Lock size={12} />
              {tUI('clientSideNotice')}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#60a5fa',
                backgroundColor: 'rgba(96, 165, 250, 0.1)',
                border: '1px solid rgba(96, 165, 250, 0.3)',
                borderRadius: '9999px',
                padding: '4px 12px',
              }}
            >
              <Sparkles size={12} />
              {tUI('aiAuditSubtitle')}
            </span>
          </div>

          {/* Presets Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {tUI('presets')}:
              </span>
              <button
                type="button"
                onClick={() => handleLoadPreset('standard')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                {tUI('presetStandard')}
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('firebase')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                {tUI('presetFirebase')}
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('supabase')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                {tUI('presetSupabase')}
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('expired')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  cursor: 'pointer',
                }}
              >
                {tUI('presetExpired')}
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('insecure')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#fbbf24',
                  cursor: 'pointer',
                }}
              >
                {tUI('presetInsecure')}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setTokenInput('');
                setSecretInput('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <Trash2 size={12} />
              {tUI('clear')}
            </button>
          </div>

          {/* Token Input Box */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '20px',
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
                <Terminal size={15} color="#60a5fa" />
                {tUI('tokenInput')}
              </label>

              {/* Token Telemetry Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'monospace',
                  }}
                >
                  {tokenStats.totalBytes} B | Alg: {tokenStats.alg}
                </span>
                {expirationInfo && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      color: expirationInfo.color,
                      backgroundColor: `${expirationInfo.color}18`,
                      border: `1px solid ${expirationInfo.color}40`,
                    }}
                  >
                    {expirationInfo.label}
                  </span>
                )}
              </div>
            </div>

            <textarea
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              rows={4}
              placeholder={tUI('tokenPlaceholder')}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                padding: '12px',
                fontFamily: 'monospace',
                fontSize: '0.82rem',
                outline: 'none',
                resize: 'vertical',
                wordBreak: 'break-all',
              }}
            />

            {decoded.error && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertTriangle size={15} />
                {decoded.error}
              </div>
            )}
          </div>

          {/* Quick Actions Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '20px',
            }}
          >
            <button
              type="button"
              onClick={() => handleCopy(`Authorization: Bearer ${tokenInput.trim()}`, 'bearer')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                cursor: 'pointer',
              }}
            >
              {copiedField === 'bearer' ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
              {copiedField === 'bearer' ? tUI('copied') : tUI('copyBearer')}
            </button>

            <button
              type="button"
              onClick={() =>
                handleCopy(
                  JSON.stringify(
                    {
                      header: decoded.header,
                      payload: decoded.payload,
                      signature: decoded.signature,
                    },
                    null,
                    2
                  ),
                  'fullJson'
                )
              }
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                cursor: 'pointer',
              }}
            >
              {copiedField === 'fullJson' ? (
                <Check size={14} color="#34d399" />
              ) : (
                <Copy size={14} />
              )}
              {copiedField === 'fullJson' ? tUI('copied') : tUI('copyFullJson')}
            </button>
          </div>

          {/* 3-Section Decoded Viewer */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            {/* 1. HEADER (JOSE) */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#f43f5e',
                    }}
                  />
                  <span style={{ color: '#f43f5e', fontWeight: 700, fontSize: '0.85rem' }}>
                    {tUI('header')} (Algorithm & Type)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(JSON.stringify(decoded.header, null, 2), 'headerJson')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: '1px solid rgba(244, 63, 94, 0.4)',
                    backgroundColor: 'rgba(244, 63, 94, 0.1)',
                    color: '#f43f5e',
                    cursor: 'pointer',
                  }}
                >
                  {copiedField === 'headerJson' ? <Check size={11} /> : <Copy size={11} />}
                  {copiedField === 'headerJson' ? tUI('copied') : tUI('copy')}
                </button>
              </div>

              <pre
                style={{
                  flex: 1,
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  color: '#fb7185',
                  overflow: 'auto',
                  margin: 0,
                  minHeight: '130px',
                }}
              >
                {decoded.header
                  ? JSON.stringify(decoded.header, null, 2)
                  : '// ' + tUI('headerPlaceholder')}
              </pre>
            </div>

            {/* 2. PAYLOAD (Claims) */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#a855f7',
                    }}
                  />
                  <span style={{ color: '#a855f7', fontWeight: 700, fontSize: '0.85rem' }}>
                    {tUI('payload')} (Data Claims)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(JSON.stringify(decoded.payload, null, 2), 'payloadJson')
                  }
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: '1px solid rgba(168, 85, 247, 0.4)',
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    color: '#c084fc',
                    cursor: 'pointer',
                  }}
                >
                  {copiedField === 'payloadJson' ? <Check size={11} /> : <Copy size={11} />}
                  {copiedField === 'payloadJson' ? tUI('copied') : tUI('copy')}
                </button>
              </div>

              <pre
                style={{
                  flex: 1,
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  color: '#c084fc',
                  overflow: 'auto',
                  margin: 0,
                  minHeight: '130px',
                }}
              >
                {decoded.payload
                  ? JSON.stringify(decoded.payload, null, 2)
                  : '// ' + tUI('payloadPlaceholder')}
              </pre>
            </div>

            {/* 3. SIGNATURE & VERIFICATION */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#06b6d4',
                    }}
                  />
                  <span style={{ color: '#06b6d4', fontWeight: 700, fontSize: '0.85rem' }}>
                    {tUI('signature')} & Verification
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(decoded.signature, 'signatureStr')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: '1px solid rgba(6, 182, 212, 0.4)',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    color: '#22d3ee',
                    cursor: 'pointer',
                  }}
                >
                  {copiedField === 'signatureStr' ? <Check size={11} /> : <Copy size={11} />}
                  {copiedField === 'signatureStr' ? tUI('copied') : tUI('copy')}
                </button>
              </div>

              {/* Raw Signature Display */}
              <div
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
                  color: '#22d3ee',
                  wordBreak: 'break-all',
                  marginBottom: '12px',
                  maxHeight: '60px',
                  overflowY: 'auto',
                }}
              >
                {decoded.signature || (
                  <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    {tUI('signaturePlaceholder')}
                  </span>
                )}
              </div>

              {/* HMAC Secret Verifier */}
              <div
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(6, 182, 212, 0.05)',
                  border: '1px solid rgba(6, 182, 212, 0.2)',
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
                  <label
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Key size={12} color="#06b6d4" />
                    {tUI('secretInput')}
                  </label>
                  <label
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSecretBase64}
                      onChange={(e) => setIsSecretBase64(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    {tUI('secretBase64')}
                  </label>
                </div>

                <input
                  type="text"
                  value={secretInput}
                  onChange={(e) => setSecretInput(e.target.value)}
                  placeholder={tUI('secretPlaceholder')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    padding: '6px 10px',
                    fontFamily: 'monospace',
                    fontSize: '0.78rem',
                    outline: 'none',
                    marginBottom: '8px',
                  }}
                />

                {/* Status Indicator */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                  }}
                >
                  {verifyStatus === 'verified' && (
                    <span
                      style={{
                        color: '#4ade80',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCircle2 size={14} />
                      {tUI('sigVerified')}
                    </span>
                  )}
                  {verifyStatus === 'invalid' && (
                    <span
                      style={{
                        color: '#f87171',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <XCircle size={14} />
                      {tUI('sigInvalid')}
                    </span>
                  )}
                  {verifyStatus === 'unverified' && (
                    <span
                      style={{
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Key size={14} />
                      {tUI('sigPending')}
                    </span>
                  )}
                  {verifyStatus === 'asymmetric' && (
                    <span
                      style={{
                        color: '#fbbf24',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Lock size={14} />
                      {tUI('sigAsymmetric')}
                    </span>
                  )}
                  {verifyStatus === 'none' && (
                    <span
                      style={{
                        color: '#f87171',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <AlertTriangle size={14} />
                      {tUI('sigNone')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Smart Claims & Timestamp Inspector */}
          {decoded.payload && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px',
                }}
              >
                <Clock size={18} color="#60a5fa" />
                <h3
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    margin: 0,
                  }}
                >
                  {tUI('claimsInspector')}
                </h3>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '12px',
                }}
              >
                {/* exp claim */}
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
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#60a5fa',
                        fontFamily: 'monospace',
                      }}
                    >
                      exp ({tUI('claimExp')})
                    </span>
                    {typeof decoded.payload.exp === 'number' && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor:
                            Date.now() / 1000 > decoded.payload.exp
                              ? 'rgba(239, 68, 68, 0.15)'
                              : 'rgba(34, 197, 94, 0.15)',
                          color: Date.now() / 1000 > decoded.payload.exp ? '#f87171' : '#4ade80',
                        }}
                      >
                        {Date.now() / 1000 > decoded.payload.exp
                          ? tUI('tokenExpired')
                          : tUI('tokenActive')}
                      </span>
                    )}
                  </div>
                  {typeof decoded.payload.exp === 'number' ? (
                    (() => {
                      const t = formatEpochTime(decoded.payload.exp as number);
                      return (
                        <>
                          <div
                            style={{
                              fontSize: '0.82rem',
                              color: 'var(--text-main)',
                              fontWeight: 600,
                            }}
                          >
                            {t?.local}
                          </div>
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: t?.isPast ? '#f87171' : '#4ade80',
                              marginTop: '2px',
                            }}
                          >
                            {t?.relative} ({decoded.payload.exp})
                          </div>
                        </>
                      );
                    })()
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#f87171', fontStyle: 'italic' }}>
                      {tUI('tokenImmortal')} (None)
                    </span>
                  )}
                </div>

                {/* iat claim */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#60a5fa',
                      fontFamily: 'monospace',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    iat ({tUI('claimIat')})
                  </span>
                  {typeof decoded.payload.iat === 'number' ? (
                    (() => {
                      const t = formatEpochTime(decoded.payload.iat as number);
                      return (
                        <>
                          <div
                            style={{
                              fontSize: '0.82rem',
                              color: 'var(--text-main)',
                              fontWeight: 600,
                            }}
                          >
                            {t?.local}
                          </div>
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)',
                              marginTop: '2px',
                            }}
                          >
                            {t?.relative} ({decoded.payload.iat})
                          </div>
                        </>
                      );
                    })()
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Not specified
                    </span>
                  )}
                </div>

                {/* sub / iss / aud */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#60a5fa',
                      fontFamily: 'monospace',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Context (sub, iss, aud)
                  </span>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-main)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    <div>
                      <strong>sub:</strong>{' '}
                      <span style={{ color: '#c084fc' }}>{String(decoded.payload.sub || '—')}</span>
                    </div>
                    <div>
                      <strong>iss:</strong>{' '}
                      <span style={{ color: '#60a5fa' }}>{String(decoded.payload.iss || '—')}</span>
                    </div>
                    <div>
                      <strong>aud:</strong>{' '}
                      <span style={{ color: '#34d399' }}>{String(decoded.payload.aud || '—')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI & Smart Heuristic Security Audit Panel */}
          {securityAudit && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '32px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '20px',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {securityAudit.score >= 80 ? (
                    <ShieldCheck size={26} color="#4ade80" />
                  ) : securityAudit.score >= 60 ? (
                    <AlertTriangle size={26} color="#fbbf24" />
                  ) : (
                    <ShieldAlert size={26} color="#f87171" />
                  )}
                  <div>
                    <h3
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        margin: 0,
                      }}
                    >
                      {tUI('aiAuditTitle')}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                      Automated heuristic vulnerability audit (CVE, RFC 7519 compliance & PII
                      leakage)
                    </p>
                  </div>
                </div>

                {/* Score Gauge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {tUI('securityScore')}:
                  </span>
                  <span
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color:
                        securityAudit.score >= 80
                          ? '#4ade80'
                          : securityAudit.score >= 60
                            ? '#fbbf24'
                            : '#f87171',
                    }}
                  >
                    {securityAudit.score} / 100
                  </span>
                </div>
              </div>

              {/* Findings List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {securityAudit.findings.map((item) => {
                  let badgeBg = 'rgba(52, 211, 153, 0.1)';
                  let badgeBorder = 'rgba(52, 211, 153, 0.3)';
                  let badgeColor = '#4ade80';

                  if (item.severity === 'critical') {
                    badgeBg = 'rgba(239, 68, 68, 0.15)';
                    badgeBorder = 'rgba(239, 68, 68, 0.4)';
                    badgeColor = '#f87171';
                  } else if (item.severity === 'high') {
                    badgeBg = 'rgba(249, 115, 22, 0.15)';
                    badgeBorder = 'rgba(249, 115, 22, 0.4)';
                    badgeColor = '#fb923c';
                  } else if (item.severity === 'medium' || item.severity === 'low') {
                    badgeBg = 'rgba(245, 158, 11, 0.15)';
                    badgeBorder = 'rgba(245, 158, 11, 0.4)';
                    badgeColor = '#fbbf24';
                  }

                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: badgeBg,
                          border: `1px solid ${badgeBorder}`,
                          color: badgeColor,
                          whiteSpace: 'nowrap',
                          marginTop: '2px',
                        }}
                      >
                        {item.severity}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: 'var(--text-main)',
                            marginBottom: '2px',
                          }}
                        >
                          {item.title}
                        </div>
                        <div
                          style={{
                            fontSize: '0.78rem',
                            color: 'var(--text-muted)',
                            lineHeight: 1.4,
                          }}
                        >
                          {item.detail}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tool SEO Content Section */}
          <ToolSeoContent
            toolSlug="jwt-decoder-&-inspector"
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
