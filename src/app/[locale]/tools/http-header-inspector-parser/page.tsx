'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Server,
  ShieldCheck,
  Code,
  BookOpen,
  Copy,
  Check,
  Search,
  Trash2,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Laptop,
} from 'lucide-react';

type TabType = 'parser' | 'security' | 'client' | 'code' | 'dictionary';
type ServerConfigType = 'nginx' | 'apache' | 'nextjs' | 'express';

interface ParsedHeader {
  key: string;
  val: string;
  category: 'security' | 'caching' | 'cors' | 'content' | 'general';
}

interface SecurityAuditItem {
  id: string;
  name: string;
  headerName: string;
  present: boolean;
  value: string;
  importance: 'critical' | 'high' | 'medium';
  recommendation: string;
  example: string;
}

interface DictionaryItem {
  name: string;
  type: 'Request' | 'Response' | 'Both';
  category: string;
  desc: string;
  example: string;
}

const DICTIONARY_HEADERS: DictionaryItem[] = [
  {
    name: 'Strict-Transport-Security',
    type: 'Response',
    category: 'Security',
    desc: 'Enforces secure HTTPS connections and prevents SSL-stripping man-in-the-middle attacks.',
    example: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    name: 'Content-Security-Policy',
    type: 'Response',
    category: 'Security',
    desc: 'Restricts script, stylesheet, and media origins to protect against Cross-Site Scripting (XSS).',
    example: "default-src 'self'; script-src 'self' https://trusted.cdn.com",
  },
  {
    name: 'X-Frame-Options',
    type: 'Response',
    category: 'Security',
    desc: 'Controls whether a browser is permitted to render a page inside a frame, iframe, or object (Clickjacking defense).',
    example: 'DENY (or SAMEORIGIN)',
  },
  {
    name: 'X-Content-Type-Options',
    type: 'Response',
    category: 'Security',
    desc: 'Prevents browsers from MIME-type sniffing a response away from the declared Content-Type.',
    example: 'nosniff',
  },
  {
    name: 'Referrer-Policy',
    type: 'Response',
    category: 'Security',
    desc: 'Controls how much referrer information (URL path) is included with outbound requests.',
    example: 'strict-origin-when-cross-origin',
  },
  {
    name: 'Permissions-Policy',
    type: 'Response',
    category: 'Security',
    desc: 'Allows site owners to enable or disable browser features and APIs (camera, microphone, geolocation).',
    example: 'geolocation=(), camera=(), microphone=()',
  },
  {
    name: 'Cache-Control',
    type: 'Both',
    category: 'Caching',
    desc: 'Specifies directives for caching mechanisms in both requests and responses across browsers and CDNs.',
    example: 'public, max-age=31536000, immutable',
  },
  {
    name: 'ETag',
    type: 'Response',
    category: 'Caching',
    desc: 'Unique identifier for a specific version of a resource, used for conditional cache revalidation.',
    example: '"33a64df551425fcc55e4d42a148795d9f25f89d4"',
  },
  {
    name: 'Access-Control-Allow-Origin',
    type: 'Response',
    category: 'CORS',
    desc: 'Specifies which origins are permitted to access resources via Cross-Origin Resource Sharing (CORS).',
    example: 'https://example.com (or *)',
  },
  {
    name: 'Authorization',
    type: 'Request',
    category: 'Authentication',
    desc: 'Contains authentication credentials for the HTTP authentication realm, such as Bearer tokens.',
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  },
  {
    name: 'Content-Type',
    type: 'Both',
    category: 'Content',
    desc: 'Indicates the media type (MIME type) of the resource or payload entity body.',
    example: 'application/json; charset=utf-8',
  },
  {
    name: 'User-Agent',
    type: 'Request',
    category: 'General',
    desc: 'Identifies the client software, operating system, and vendor sending the HTTP request.',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
  },
];

export default function HttpHeaderInspectorPage() {
  const tUI = useTranslations('ToolUI.httpHeaderInspector');

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('parser');

  // Tab 1: Raw Headers State
  const [rawHeaders, setRawHeaders] = useState(
    `HTTP/2 200 OK
content-type: application/json; charset=utf-8
cache-control: public, max-age=3600, must-revalidate
strict-transport-security: max-age=63072000; includeSubDomains; preload
content-security-policy: default-src 'self'; script-src 'self' https://apis.google.com
x-frame-options: DENY
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
permissions-policy: geolocation=(), camera=(), microphone=()
server: cloudflare
x-powered-by: Next.js`
  );

  const [headerSearch, setHeaderSearch] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Tab 2: Server Config Generator State
  const [selectedServerConfig, setSelectedServerConfig] = useState<ServerConfigType>('nginx');

  // Tab 3: Client Headers State
  const [clientInfo, setClientInfo] = useState({
    userAgent: '',
    language: '',
    platform: '',
    cookiesEnabled: false,
    online: true,
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      setClientInfo({
        userAgent: navigator.userAgent || 'Unknown',
        language: navigator.language || 'en-US',
        platform: navigator.platform || 'Desktop',
        cookiesEnabled: navigator.cookieEnabled || false,
        online: navigator.onLine,
      });
    }
  }, []);

  // Tab 4: Code Snippets State
  const [codeLang, setCodeLang] = useState<'curl' | 'fetch' | 'axios' | 'python' | 'php'>('curl');

  // Tab 5: Dictionary Search
  const [dictSearch, setDictSearch] = useState('');

  // ----------------------------------------------------
  // Parsing Logic
  // ----------------------------------------------------
  const parsedData = useMemo(() => {
    const lines = rawHeaders.split('\n');
    let statusLine = '';
    const headersList: ParsedHeader[] = [];

    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) return;

      // Check if it's an HTTP Status Line (e.g. HTTP/2 200 OK or HTTP/1.1 404 Not Found)
      if (line.toUpperCase().startsWith('HTTP/') && !statusLine) {
        statusLine = line;
        return;
      }

      const idx = line.indexOf(':');
      if (idx !== -1) {
        const key = line.slice(0, idx).trim();
        const val = line.slice(idx + 1).trim();
        const lowerKey = key.toLowerCase();

        let category: ParsedHeader['category'] = 'general';
        if (
          lowerKey.includes('security') ||
          lowerKey.includes('strict-transport') ||
          lowerKey.includes('frame-options') ||
          lowerKey.includes('content-type-options') ||
          lowerKey.includes('referrer-policy') ||
          lowerKey.includes('permissions-policy')
        ) {
          category = 'security';
        } else if (
          lowerKey.includes('cache') ||
          lowerKey.includes('etag') ||
          lowerKey.includes('expires')
        ) {
          category = 'caching';
        } else if (lowerKey.includes('access-control')) {
          category = 'cors';
        } else if (
          lowerKey.includes('content-type') ||
          lowerKey.includes('content-length') ||
          lowerKey.includes('encoding')
        ) {
          category = 'content';
        }

        headersList.push({ key, val, category });
      }
    });

    // Parse status line tokens
    let protocol = 'HTTP/1.1';
    let statusCode = '200';
    let statusMessage = 'OK';

    if (statusLine) {
      const parts = statusLine.split(/\s+/);
      if (parts[0]) protocol = parts[0];
      if (parts[1]) statusCode = parts[1];
      if (parts.length > 2) statusMessage = parts.slice(2).join(' ');
    }

    return {
      statusLine,
      protocol,
      statusCode,
      statusMessage,
      headers: headersList,
    };
  }, [rawHeaders]);

  // Filtered Headers List for Tab 1
  const filteredHeaders = useMemo(() => {
    if (!headerSearch.trim()) return parsedData.headers;
    const q = headerSearch.toLowerCase().trim();
    return parsedData.headers.filter(
      (h) => h.key.toLowerCase().includes(q) || h.val.toLowerCase().includes(q)
    );
  }, [parsedData.headers, headerSearch]);

  // Export JSON Object
  const headersJsonObject = useMemo(() => {
    const obj: Record<string, string> = {};
    parsedData.headers.forEach((h) => {
      obj[h.key] = h.val;
    });
    return JSON.stringify(obj, null, 2);
  }, [parsedData.headers]);

  // ----------------------------------------------------
  // Security Audit Engine
  // ----------------------------------------------------
  const securityAudit = useMemo(() => {
    const map = new Map<string, string>();
    parsedData.headers.forEach((h) => {
      map.set(h.key.toLowerCase(), h.val);
    });

    const checks: SecurityAuditItem[] = [
      {
        id: 'hsts',
        name: 'Strict-Transport-Security (HSTS)',
        headerName: 'Strict-Transport-Security',
        present: map.has('strict-transport-security'),
        value: map.get('strict-transport-security') || '',
        importance: 'critical',
        recommendation:
          'Enforces HTTPS and protects against cookie hijacking and SSL-stripping attacks.',
        example: 'max-age=63072000; includeSubDomains; preload',
      },
      {
        id: 'csp',
        name: 'Content-Security-Policy (CSP)',
        headerName: 'Content-Security-Policy',
        present: map.has('content-security-policy'),
        value: map.get('content-security-policy') || '',
        importance: 'critical',
        recommendation:
          'Restricts script and resource execution origins to defend against Cross-Site Scripting (XSS).',
        example: "default-src 'self'; script-src 'self'",
      },
      {
        id: 'xfo',
        name: 'X-Frame-Options',
        headerName: 'X-Frame-Options',
        present: map.has('x-frame-options'),
        value: map.get('x-frame-options') || '',
        importance: 'high',
        recommendation:
          'Prevents clickjacking by forbidding unauthorized framing of your web pages.',
        example: 'DENY',
      },
      {
        id: 'xcto',
        name: 'X-Content-Type-Options',
        headerName: 'X-Content-Type-Options',
        present: map.has('x-content-type-options'),
        value: map.get('x-content-type-options') || '',
        importance: 'high',
        recommendation:
          'Stops browsers from MIME-sniffing the response away from the declared content type.',
        example: 'nosniff',
      },
      {
        id: 'referrer',
        name: 'Referrer-Policy',
        headerName: 'Referrer-Policy',
        present: map.has('referrer-policy'),
        value: map.get('referrer-policy') || '',
        importance: 'medium',
        recommendation:
          'Protects user privacy by controlling how much URL path data is leaked in the Referer header.',
        example: 'strict-origin-when-cross-origin',
      },
      {
        id: 'permissions',
        name: 'Permissions-Policy',
        headerName: 'Permissions-Policy',
        present: map.has('permissions-policy'),
        value: map.get('permissions-policy') || '',
        importance: 'medium',
        recommendation:
          'Explicitly restricts access to sensitive browser hardware (camera, microphone, geolocation).',
        example: 'camera=(), microphone=(), geolocation=()',
      },
    ];

    // Info Leak Checks
    const leaks: { name: string; value: string; warning: string }[] = [];
    if (map.has('server')) {
      const serverVal = map.get('server')!;
      if (/\d/.test(serverVal)) {
        leaks.push({
          name: 'Server',
          value: serverVal,
          warning:
            'Discloses backend server version numbers (e.g. Nginx/Apache version) to potential attackers.',
        });
      }
    }
    if (map.has('x-powered-by')) {
      leaks.push({
        name: 'X-Powered-By',
        value: map.get('x-powered-by')!,
        warning:
          'Discloses application framework/backend stack (e.g. PHP, Express, ASP.NET). Should be removed.',
      });
    }

    // Grade Calculation (A+ to F)
    const passedCount = checks.filter((c) => c.present).length;
    let grade = 'F';
    let gradeColor = '#ef4444';

    if (passedCount === 6 && leaks.length === 0) {
      grade = 'A+';
      gradeColor = '#10b981';
    } else if (passedCount >= 5) {
      grade = 'A';
      gradeColor = '#34d399';
    } else if (passedCount >= 4) {
      grade = 'B';
      gradeColor = '#60a5fa';
    } else if (passedCount >= 3) {
      grade = 'C';
      gradeColor = '#facc15';
    } else if (passedCount >= 2) {
      grade = 'D';
      gradeColor = '#fb923c';
    } else {
      grade = 'F';
      gradeColor = '#ef4444';
    }

    return { checks, leaks, passedCount, totalCount: checks.length, grade, gradeColor };
  }, [parsedData.headers]);

  // Copy helper
  const handleCopy = (text: string, fieldKey: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Presets Loader
  const loadPreset = (preset: 'secure' | 'vulnerable' | 'cloudflare' | 'github') => {
    if (preset === 'secure') {
      setRawHeaders(`HTTP/2 200 OK
content-type: application/json; charset=utf-8
cache-control: public, max-age=3600, must-revalidate
strict-transport-security: max-age=63072000; includeSubDomains; preload
content-security-policy: default-src 'self'; script-src 'self' https://trusted.cdn.com
x-frame-options: DENY
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
permissions-policy: geolocation=(), camera=(), microphone=()`);
    } else if (preset === 'vulnerable') {
      setRawHeaders(`HTTP/1.1 200 OK
Date: Wed, 26 Nov 2026 12:00:00 GMT
Server: Apache/2.4.41 (Ubuntu)
X-Powered-By: PHP/7.4.3
Content-Type: text/html; charset=UTF-8
Connection: keep-alive`);
    } else if (preset === 'cloudflare') {
      setRawHeaders(`HTTP/2 200 OK
date: Wed, 26 Nov 2026 14:15:00 GMT
content-type: application/json; charset=utf-8
cache-control: public, max-age=14400
strict-transport-security: max-age=31536000; includeSubDomains
cf-ray: 8e918274b9182-BOM
cf-cache-status: HIT
server: cloudflare
alt-svc: h3=":443"; ma=86400`);
    } else if (preset === 'github') {
      setRawHeaders(`HTTP/2 200 OK
date: Wed, 26 Nov 2026 14:20:00 GMT
content-type: application/json; charset=utf-8
server: GitHub.com
strict-transport-security: max-age=31536000; includeSubdomains; preload
x-content-type-options: nosniff
x-frame-options: deny
x-xss-protection: 0
referrer-policy: origin-when-cross-origin, strict-origin-when-cross-origin
content-security-policy: default-src 'none'
x-ratelimit-limit: 5000
x-ratelimit-remaining: 4982`);
    }
  };

  // Filtered Dictionary List
  const filteredDict = useMemo(() => {
    if (!dictSearch.trim()) return DICTIONARY_HEADERS;
    const q = dictSearch.toLowerCase().trim();
    return DICTIONARY_HEADERS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.desc.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
    );
  }, [dictSearch]);

  return (
    <>
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          {/* Header */}
          <SectionHeading
            title={tUI('title')}
            subtitle={tUI('subtitle')}
            toolSlug="http-header-inspector-parser"
          />

          {/* Privacy & Fast Client-Side Badge */}
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
              { key: 'parser', label: tUI('tabParser'), icon: Server },
              { key: 'security', label: tUI('tabSecurity'), icon: ShieldCheck },
              { key: 'client', label: tUI('tabClient'), icon: Laptop },
              { key: 'code', label: tUI('tabCode'), icon: Code },
              { key: 'dictionary', label: tUI('tabDictionary'), icon: BookOpen },
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
          {/* TAB 1: Header Parser & JSON Export                   */}
          {/* ==================================================== */}
          {activeTab === 'parser' && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '24px',
              }}
            >
              {/* Presets Bar */}
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
                <div
                  style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}
                >
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {tUI('presetsLabel')}:
                  </span>
                  <button
                    onClick={() => loadPreset('secure')}
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
                    Secure HTTPS (Grade A+)
                  </button>
                  <button
                    onClick={() => loadPreset('vulnerable')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--bg-page)',
                      color: '#f87171',
                      border: '1px solid rgba(248, 113, 113, 0.3)',
                      cursor: 'pointer',
                    }}
                  >
                    Vulnerable Server
                  </button>
                  <button
                    onClick={() => loadPreset('cloudflare')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--bg-page)',
                      color: '#fbbf24',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      cursor: 'pointer',
                    }}
                  >
                    Cloudflare CDN
                  </button>
                  <button
                    onClick={() => loadPreset('github')}
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
                    GitHub API
                  </button>
                  <button
                    onClick={() => setRawHeaders('')}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--bg-page)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Trash2 size={12} />
                    {tUI('clearBtn')}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleCopy(headersJsonObject, 'json')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor:
                        copiedField === 'json'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(59, 130, 246, 0.15)',
                      color: copiedField === 'json' ? '#34d399' : '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      padding: '4px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {copiedField === 'json' ? <Check size={12} /> : <Copy size={12} />}
                    {copiedField === 'json' ? tUI('copied') : tUI('copyJsonBtn')}
                  </button>
                  <button
                    onClick={() => handleCopy(rawHeaders, 'raw')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: 'var(--bg-page)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '4px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {copiedField === 'raw' ? tUI('copied') : tUI('copyRawBtn')}
                  </button>
                </div>
              </div>

              {/* Raw Headers Textarea */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  {tUI('rawHeadersLabel')}
                </label>
                <textarea
                  value={rawHeaders}
                  onChange={(e) => setRawHeaders(e.target.value)}
                  placeholder={tUI('rawHeadersPlaceholder')}
                  rows={8}
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
                    lineHeight: '1.4',
                  }}
                />
              </div>

              {/* Status Line Banner if Present */}
              {parsedData.statusLine && (
                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        backgroundColor: parsedData.statusCode.startsWith('2')
                          ? 'rgba(16, 185, 129, 0.2)'
                          : parsedData.statusCode.startsWith('3')
                            ? 'rgba(59, 130, 246, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)',
                        color: parsedData.statusCode.startsWith('2')
                          ? '#34d399'
                          : parsedData.statusCode.startsWith('3')
                            ? '#60a5fa'
                            : '#f87171',
                      }}
                    >
                      {parsedData.statusCode} {parsedData.statusMessage}
                    </span>
                    <span
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-main)',
                        fontFamily: 'monospace',
                      }}
                    >
                      Protocol: {parsedData.protocol}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {parsedData.headers.length} headers parsed
                  </span>
                </div>
              )}

              {/* Search Filter Bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '14px',
                  gap: '12px',
                }}
              >
                <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
                  <Search
                    size={14}
                    color="#94a3b8"
                    style={{ position: 'absolute', left: '10px', top: '9px' }}
                  />
                  <input
                    type="text"
                    value={headerSearch}
                    onChange={(e) => setHeaderSearch(e.target.value)}
                    placeholder={tUI('searchPlaceholder')}
                    style={{
                      width: '100%',
                      padding: '6px 12px 6px 32px',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-main)',
                      fontSize: '0.8rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Showing {filteredHeaders.length} of {parsedData.headers.length}
                </div>
              </div>

              {/* Parsed Structure Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredHeaders.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      display: 'grid',
                      gridTemplateColumns: 'minmax(180px, 240px) 1fr auto',
                      gap: '12px',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          backgroundColor:
                            item.category === 'security'
                              ? 'rgba(52, 211, 153, 0.15)'
                              : item.category === 'caching'
                                ? 'rgba(96, 165, 250, 0.15)'
                                : 'rgba(255, 255, 255, 0.05)',
                          color:
                            item.category === 'security'
                              ? '#34d399'
                              : item.category === 'caching'
                                ? '#60a5fa'
                                : 'var(--text-muted)',
                        }}
                      >
                        {item.category}
                      </span>
                      <span
                        style={{
                          color: '#60a5fa',
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          wordBreak: 'break-all',
                        }}
                      >
                        {item.key}
                      </span>
                    </div>

                    <span
                      style={{
                        color: 'var(--text-main)',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        wordBreak: 'break-all',
                      }}
                    >
                      {item.val}
                    </span>

                    <button
                      onClick={() => handleCopy(`${item.key}: ${item.val}`, `row_${idx}`)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: copiedField === `row_${idx}` ? '#34d399' : 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                      title="Copy header pair"
                    >
                      {copiedField === `row_${idx}` ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: OWASP Security Headers Audit & Grade          */}
          {/* ==================================================== */}
          {activeTab === 'security' && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '24px',
              }}
            >
              {/* Security Score Banner */}
              <div
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '20px',
                  marginBottom: '24px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '12px',
                      backgroundColor: `${securityAudit.gradeColor}20`,
                      border: `2px solid ${securityAudit.gradeColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.8rem',
                      fontWeight: 800,
                      color: securityAudit.gradeColor,
                    }}
                  >
                    {securityAudit.grade}
                  </div>
                  <div>
                    <h3
                      style={{
                        color: 'var(--text-main)',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        margin: 0,
                      }}
                    >
                      OWASP Security Score: {securityAudit.grade}
                    </h3>
                    <p
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.85rem',
                        margin: '4px 0 0 0',
                      }}
                    >
                      {securityAudit.passedCount} of {securityAudit.totalCount} essential OWASP
                      security headers configured
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontWeight: 600,
                      backgroundColor:
                        securityAudit.passedCount >= 5
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(239, 68, 68, 0.2)',
                      color: securityAudit.passedCount >= 5 ? '#34d399' : '#f87171',
                    }}
                  >
                    {securityAudit.passedCount >= 5 ? 'Hardened Defense' : 'Action Required'}
                  </span>
                </div>
              </div>

              {/* Information Disclosure Leaks Notice */}
              {securityAudit.leaks.length > 0 && (
                <div
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    padding: '14px 16px',
                    marginBottom: '20px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#f87171',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      marginBottom: '6px',
                    }}
                  >
                    <AlertTriangle size={16} />
                    {tUI('infoLeakWarningTitle')}
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: '20px',
                      fontSize: '0.85rem',
                      color: '#cbd5e1',
                    }}
                  >
                    {securityAudit.leaks.map((leak, idx) => (
                      <li key={idx}>
                        <strong>{leak.name}:</strong>{' '}
                        <code style={{ color: '#fca5a5' }}>{leak.value}</code> — {leak.warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 6 Essential OWASP Headers Breakdown */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginBottom: '28px',
                }}
              >
                {securityAudit.checks.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '14px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        flex: 1,
                        minWidth: '240px',
                      }}
                    >
                      {item.present ? (
                        <CheckCircle2
                          size={20}
                          color="#34d399"
                          style={{ flexShrink: 0, marginTop: '2px' }}
                        />
                      ) : (
                        <XCircle
                          size={20}
                          color="#f87171"
                          style={{ flexShrink: 0, marginTop: '2px' }}
                        />
                      )}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontWeight: 700,
                              color: 'var(--text-main)',
                              fontSize: '0.9rem',
                            }}
                          >
                            {item.name}
                          </span>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 600,
                              backgroundColor: item.present
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(239, 68, 68, 0.15)',
                              color: item.present ? '#34d399' : '#f87171',
                            }}
                          >
                            {item.present ? 'Pass' : 'Missing'}
                          </span>
                        </div>
                        <p
                          style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.8rem',
                            margin: '4px 0 0 0',
                          }}
                        >
                          {item.recommendation}
                        </p>
                        {item.present ? (
                          <div
                            style={{
                              marginTop: '6px',
                              fontSize: '0.8rem',
                              fontFamily: 'monospace',
                              color: '#38bdf8',
                            }}
                          >
                            Value: {item.value}
                          </div>
                        ) : (
                          <div
                            style={{
                              marginTop: '6px',
                              fontSize: '0.75rem',
                              fontFamily: 'monospace',
                              color: '#94a3b8',
                            }}
                          >
                            Recommended: {item.example}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Server Remediation Config Generator */}
              <div
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '20px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '14px',
                  }}
                >
                  <h4
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Zap size={16} color="#60a5fa" />
                    {tUI('serverFixTitle')}
                  </h4>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { id: 'nginx', label: 'Nginx' },
                      { id: 'apache', label: 'Apache (.htaccess)' },
                      { id: 'nextjs', label: 'Next.js' },
                      { id: 'express', label: 'Express (Helmet)' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedServerConfig(s.id as ServerConfigType)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor:
                            selectedServerConfig === s.id
                              ? 'var(--color-primary)'
                              : 'var(--bg-card)',
                          color: selectedServerConfig === s.id ? '#ffffff' : 'var(--text-muted)',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    position: 'relative',
                    backgroundColor: '#0a0f1d',
                    borderRadius: '8px',
                    padding: '14px',
                  }}
                >
                  <button
                    onClick={() => {
                      const configs: Record<ServerConfigType, string> = {
                        nginx: `# Add security headers in Nginx configuration:\nadd_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;\nadd_header Content-Security-Policy "default-src 'self'; script-src 'self'" always;\nadd_header X-Frame-Options "DENY" always;\nadd_header X-Content-Type-Options "nosniff" always;\nadd_header Referrer-Policy "strict-origin-when-cross-origin" always;\nadd_header Permissions-Policy "geolocation=(), camera=(), microphone=()" always;\nserver_tokens off;`,
                        apache: `# Add security headers in Apache .htaccess:\n<IfModule mod_headers.c>\n    Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"\n    Header always set Content-Security-Policy "default-src 'self'; script-src 'self'"\n    Header always set X-Frame-Options "DENY"\n    Header always set X-Content-Type-Options "nosniff"\n    Header always set Referrer-Policy "strict-origin-when-cross-origin"\n    Header always set Permissions-Policy "geolocation=(), camera=(), microphone=()"\n    Header unset X-Powered-By\n</IfModule>`,
                        nextjs: `// next.config.ts (Next.js Security Headers):\nconst nextConfig = {\n  async headers() {\n    return [\n      {\n        source: '/:path*',\n        headers: [\n          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },\n          { key: 'Content-Security-Policy', value: "default-src 'self'" },\n          { key: 'X-Frame-Options', value: 'DENY' },\n          { key: 'X-Content-Type-Options', value: 'nosniff' },\n          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },\n        ],\n      },\n    ];\n  },\n};`,
                        express: `// Express.js with Helmet middleware:\nimport express from 'express';\nimport helmet from 'helmet';\n\nconst app = express();\n// Enables HSTS, CSP, X-Frame-Options, nosniff automatically:\napp.use(helmet());\napp.disable('x-powered-by');`,
                      };
                      handleCopy(configs[selectedServerConfig], 'config');
                    }}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
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
                    {copiedField === 'config' ? (
                      <Check size={12} color="#34d399" />
                    ) : (
                      <Copy size={12} />
                    )}
                    {copiedField === 'config' ? tUI('copied') : tUI('copy')}
                  </button>

                  <pre
                    style={{
                      margin: 0,
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      color: '#38bdf8',
                      overflowX: 'auto',
                      lineHeight: '1.4',
                    }}
                  >
                    {selectedServerConfig === 'nginx' &&
                      `# Add security headers in Nginx configuration:\nadd_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;\nadd_header Content-Security-Policy "default-src 'self'; script-src 'self'" always;\nadd_header X-Frame-Options "DENY" always;\nadd_header X-Content-Type-Options "nosniff" always;\nadd_header Referrer-Policy "strict-origin-when-cross-origin" always;\nadd_header Permissions-Policy "geolocation=(), camera=(), microphone=()" always;\nserver_tokens off;`}
                    {selectedServerConfig === 'apache' &&
                      `# Add security headers in Apache .htaccess:\n<IfModule mod_headers.c>\n    Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"\n    Header always set Content-Security-Policy "default-src 'self'; script-src 'self'"\n    Header always set X-Frame-Options "DENY"\n    Header always set X-Content-Type-Options "nosniff"\n    Header always set Referrer-Policy "strict-origin-when-cross-origin"\n    Header always set Permissions-Policy "geolocation=(), camera=(), microphone=()"\n    Header unset X-Powered-By\n</IfModule>`}
                    {selectedServerConfig === 'nextjs' &&
                      `// next.config.ts (Next.js Security Headers):\nconst nextConfig = {\n  async headers() {\n    return [\n      {\n        source: '/:path*',\n        headers: [\n          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },\n          { key: 'Content-Security-Policy', value: "default-src 'self'" },\n          { key: 'X-Frame-Options', value: 'DENY' },\n          { key: 'X-Content-Type-Options', value: 'nosniff' },\n          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },\n        ],\n      },\n    ];\n  },\n};`}
                    {selectedServerConfig === 'express' &&
                      `// Express.js with Helmet middleware:\nimport express from 'express';\nimport helmet from 'helmet';\n\nconst app = express();\n// Enables HSTS, CSP, X-Frame-Options, nosniff automatically:\napp.use(helmet());\napp.disable('x-powered-by');`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: My HTTP Request Headers (Client Inspector)    */}
          {/* ==================================================== */}
          {activeTab === 'client' && (
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
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Laptop size={18} color="#60a5fa" />
                  {tUI('myHeadersTitle')}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                  {tUI('myHeadersSubtitle')}
                </p>
              </div>

              {/* Detected Browser Attributes */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '14px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <span
                    style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}
                  >
                    USER-AGENT (CLIENT HEADER)
                  </span>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      color: '#60a5fa',
                      wordBreak: 'break-all',
                      marginTop: '4px',
                    }}
                  >
                    {clientInfo.userAgent}
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
                  <span
                    style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}
                  >
                    ACCEPT-LANGUAGE
                  </span>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      color: '#34d399',
                      marginTop: '4px',
                    }}
                  >
                    {clientInfo.language}
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
                  <span
                    style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}
                  >
                    PLATFORM / ARCHITECTURE
                  </span>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      color: '#fbbf24',
                      marginTop: '4px',
                    }}
                  >
                    {clientInfo.platform}
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
                  <span
                    style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}
                  >
                    BROWSER COOKIES
                  </span>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      color: '#a78bfa',
                      marginTop: '4px',
                    }}
                  >
                    {clientInfo.cookiesEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </div>

              {/* Step-by-Step Chrome DevTools Guide */}
              <div
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '18px',
                }}
              >
                <h4
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    margin: '0 0 10px 0',
                  }}
                >
                  {tUI('chromeGuideTitle')}
                </h4>
                <ol
                  style={{
                    margin: 0,
                    paddingLeft: '20px',
                    fontSize: '0.85rem',
                    color: '#cbd5e1',
                    lineHeight: '1.6',
                  }}
                >
                  <li>{tUI('chromeStep1')}</li>
                  <li>{tUI('chromeStep2')}</li>
                  <li>{tUI('chromeStep3')}</li>
                  <li>{tUI('chromeStep4')}</li>
                </ol>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: How to Pass Headers in Code                   */}
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
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Code size={18} color="#60a5fa" />
                  {tUI('passHeadersTitle')}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                  {tUI('passHeadersSubtitle')}
                </p>
              </div>

              {/* Language Selector */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {[
                  { id: 'curl', label: 'cURL Command Line' },
                  { id: 'fetch', label: 'JavaScript fetch()' },
                  { id: 'axios', label: 'Axios (JS/TS)' },
                  { id: 'python', label: 'Python requests' },
                  { id: 'php', label: 'PHP cURL' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCodeLang(item.id as typeof codeLang)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      backgroundColor:
                        codeLang === item.id ? 'var(--color-primary)' : 'var(--bg-page)',
                      color: codeLang === item.id ? '#ffffff' : 'var(--text-main)',
                      border:
                        codeLang === item.id
                          ? '1px solid var(--color-primary)'
                          : '1px solid var(--border-color)',
                      cursor: 'pointer',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Code Snippet Box */}
              <div
                style={{
                  position: 'relative',
                  backgroundColor: '#0a0f1d',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                <button
                  onClick={() => {
                    const snippets: Record<string, string> = {
                      curl: `# Send custom HTTP headers in cURL request:\ncurl -X POST "https://api.example.com/data" \\\n  -H "Authorization: Bearer YOUR_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -H "Accept: application/json" \\\n  -d '{"key": "value"}'`,
                      fetch: `// Pass HTTP headers in JavaScript fetch():\nconst response = await fetch('https://api.example.com/data', {\n  method: 'POST',\n  headers: {\n    'Authorization': 'Bearer YOUR_TOKEN',\n    'Content-Type': 'application/json',\n    'Accept': 'application/json',\n  },\n  body: JSON.stringify({ key: 'value' }),\n});\nconst data = await response.json();`,
                      axios: `// Pass HTTP headers in Axios:\nimport axios from 'axios';\n\nconst response = await axios.post('https://api.example.com/data', {\n  key: 'value'\n}, {\n  headers: {\n    'Authorization': 'Bearer YOUR_TOKEN',\n    'Content-Type': 'application/json',\n  }\n});\nconsole.log(response.data);`,
                      python: `# Pass HTTP headers in Python requests:\nimport requests\n\nurl = "https://api.example.com/data"\nheaders = {\n    "Authorization": "Bearer YOUR_TOKEN",\n    "Content-Type": "application/json",\n    "User-Agent": "MyCustomClient/1.0"\n}\npayload = {"key": "value"}\n\nresponse = requests.post(url, json=payload, headers=headers)\nprint(response.status_code, response.json())`,
                      php: `<?php\n// Pass HTTP headers in PHP cURL:\n$ch = curl_init("https://api.example.com/data");\n\n$headers = [\n    "Authorization: Bearer YOUR_TOKEN",\n    "Content-Type: application/json",\n];\n\ncurl_setopt($ch, CURLOPT_HTTPHEADER, $headers);\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n$response = curl_exec($ch);\ncurl_close($ch);`,
                    };
                    handleCopy(snippets[codeLang], 'code_snippet');
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
                  {copiedField === 'code_snippet' ? (
                    <Check size={12} color="#34d399" />
                  ) : (
                    <Copy size={12} />
                  )}
                  {copiedField === 'code_snippet' ? tUI('copied') : tUI('copy')}
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
                  {codeLang === 'curl' &&
                    `# Send custom HTTP headers in cURL request:\ncurl -X POST "https://api.example.com/data" \\\n  -H "Authorization: Bearer YOUR_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -H "Accept: application/json" \\\n  -d '{"key": "value"}'`}
                  {codeLang === 'fetch' &&
                    `// Pass HTTP headers in JavaScript fetch():\nconst response = await fetch('https://api.example.com/data', {\n  method: 'POST',\n  headers: {\n    'Authorization': 'Bearer YOUR_TOKEN',\n    'Content-Type': 'application/json',\n    'Accept': 'application/json',\n  },\n  body: JSON.stringify({ key: 'value' }),\n});\nconst data = await response.json();`}
                  {codeLang === 'axios' &&
                    `// Pass HTTP headers in Axios:\nimport axios from 'axios';\n\nconst response = await axios.post('https://api.example.com/data', {\n  key: 'value'\n}, {\n  headers: {\n    'Authorization': 'Bearer YOUR_TOKEN',\n    'Content-Type': 'application/json',\n  }\n});\nconsole.log(response.data);`}
                  {codeLang === 'python' &&
                    `# Pass HTTP headers in Python requests:\nimport requests\n\nurl = "https://api.example.com/data"\nheaders = {\n    "Authorization": "Bearer YOUR_TOKEN",\n    "Content-Type": "application/json",\n    "User-Agent": "MyCustomClient/1.0"\n}\npayload = {"key": "value"}\n\nresponse = requests.post(url, json=payload, headers=headers)\nprint(response.status_code, response.json())`}
                  {codeLang === 'php' &&
                    `<?php\n// Pass HTTP headers in PHP cURL:\n$ch = curl_init("https://api.example.com/data");\n\n$headers = [\n    "Authorization: Bearer YOUR_TOKEN",\n    "Content-Type: application/json",\n];\n\ncurl_setopt($ch, CURLOPT_HTTPHEADER, $headers);\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n$response = curl_exec($ch);\ncurl_close($ch);`}
                </pre>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 5: Standard HTTP Headers Dictionary              */}
          {/* ==================================================== */}
          {activeTab === 'dictionary' && (
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
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <BookOpen size={18} color="#60a5fa" />
                  {tUI('dictTitle')}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                  {tUI('dictSubtitle')}
                </p>
              </div>

              {/* Dictionary Search */}
              <div style={{ position: 'relative', maxWidth: '380px', marginBottom: '16px' }}>
                <Search
                  size={14}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '10px', top: '10px' }}
                />
                <input
                  type="text"
                  value={dictSearch}
                  onChange={(e) => setDictSearch(e.target.value)}
                  placeholder={tUI('searchDictPlaceholder')}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 32px',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Dictionary Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredDict.map((item, idx) => (
                  <div
                    key={idx}
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            color: '#60a5fa',
                          }}
                        >
                          {item.name}
                        </span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {item.type}
                        </span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(59, 130, 246, 0.15)',
                            color: '#93c5fd',
                          }}
                        >
                          {item.category}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(item.name, `dict_${idx}`)}
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          backgroundColor: 'var(--bg-card)',
                          color: copiedField === `dict_${idx}` ? '#34d399' : 'var(--text-muted)',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                        }}
                      >
                        {copiedField === `dict_${idx}` ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p
                      style={{
                        margin: '0 0 6px 0',
                        fontSize: '0.85rem',
                        color: 'var(--text-main)',
                        lineHeight: '1.4',
                      }}
                    >
                      {item.desc}
                    </p>
                    <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#34d399' }}>
                      Example: {item.example}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEO Content Section */}
          <ToolSeoContent
            toolSlug="http-header-inspector-parser"
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
