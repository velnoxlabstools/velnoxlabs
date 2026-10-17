'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

// List of valid CSP directives
const VALID_DIRECTIVES = new Set([
  'default-src',
  'script-src',
  'style-src',
  'img-src',
  'font-src',
  'connect-src',
  'media-src',
  'object-src',
  'frame-src',
  'child-src',
  'worker-src',
  'manifest-src',
  'prefetch-src',
  'frame-ancestors',
  'base-uri',
  'form-action',
  'sandbox',
  'report-uri',
  'report-to',
  'upgrade-insecure-requests',
  'block-all-mixed-content',
  'require-sri-for',
  'navigate-to',
  'plugin-types',
]);

// Keywords that are valid as sources
const VALID_KEYWORDS = new Set([
  "'self'",
  "'none'",
  "'unsafe-inline'",
  "'unsafe-eval'",
  "'strict-dynamic'",
  "'unsafe-hashes'",
  "'report-sample'",
  "'wasm-unsafe-eval'",
  "'inline-speculation-rules'",
  '*',
  'data:',
  'blob:',
  'filesystem:',
  'mediastream:',
]);

export default function CspHeaderBuilderPage() {
  const [input, setInput] = useState(
    "default-src 'self';\nscript-src 'self' https://cdn.example.com;\nstyle-src 'self' 'unsafe-inline'"
  );
  const [output, setOutput] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const validateSource = (source: string): string | null => {
    if (VALID_KEYWORDS.has(source)) return null;
    // Allow https://, http://, wss://, ws:// URLs and domains
    if (/^(https?|wss?):\/\//i.test(source)) return null;
    // Allow domains like example.com or *.example.com
    if (/^(\*\.)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*$/i.test(source)) return null;
    // Allow nonce/hash
    if (/^'(nonce|sha256|sha384|sha512)-[A-Za-z0-9+/=]+'$/.test(source)) return null;
    return `Invalid source: "${source}"`;
  };

  const buildCsp = (raw: string) => {
    const errs: string[] = [];
    const warns: string[] = [];
    const directives: string[] = [];

    if (!raw.trim()) {
      setOutput('');
      setErrors([]);
      setWarnings([]);
      return;
    }

    // Step 1: If input already contains "Content-Security-Policy:", strip it
    const cleaned = raw.replace(/Content-Security-Policy:\s*/i, '').trim();

    // Step 2: Split by both newlines AND semicolons
    const parts = cleaned
      .split(/[\n;]+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    parts.forEach((part) => {
      // Step 3: Support both "directive=value" and "directive value" formats
      let directiveName = '';
      let directiveValue = '';

      if (part.includes('=')) {
        const idx = part.indexOf('=');
        directiveName = part.slice(0, idx).trim();
        directiveValue = part.slice(idx + 1).trim();
      } else {
        const spaceIdx = part.search(/\s/);
        if (spaceIdx === -1) {
          directiveName = part.trim();
          directiveValue = '';
        } else {
          directiveName = part.slice(0, spaceIdx).trim();
          directiveValue = part.slice(spaceIdx + 1).trim();
        }
      }

      // Step 4: Validate directive name
      if (!VALID_DIRECTIVES.has(directiveName)) {
        errs.push(`Invalid directive: "${directiveName}"`);
        return;
      }

      // Step 5: Validate sources (skip for special directives that don't take sources)
      if (
        directiveValue &&
        !['upgrade-insecure-requests', 'block-all-mixed-content'].includes(directiveName)
      ) {
        // Extract sources — split by spaces but keep quoted tokens together
        const sourceTokens = directiveValue.match(/'[^']*'|[^\s]+/g) || [];
        sourceTokens.forEach((src) => {
          const err = validateSource(src);
          if (err) errs.push(`${directiveName}: ${err}`);
        });
      }

      directives.push(directiveValue ? `${directiveName} ${directiveValue}` : directiveName);
    });

    // Step 6: Warn if default-src is missing
    const hasDefaultSrc = directives.some((d) => d.startsWith('default-src'));
    if (!hasDefaultSrc && directives.length > 0) {
      warns.push("Best practice: Add 'default-src' as a fallback directive.");
    }

    // Step 7: Warn if unsafe-inline/unsafe-eval is present
    if (directives.join(' ').includes("'unsafe-inline'")) {
      warns.push("Security warning: 'unsafe-inline' reduces XSS protection.");
    }
    if (directives.join(' ').includes("'unsafe-eval'")) {
      warns.push("Security warning: 'unsafe-eval' allows dangerous code execution.");
    }

    setErrors(errs);
    setWarnings(warns);

    if (errs.length > 0) {
      setOutput('');
      return;
    }

    setOutput('Content-Security-Policy: ' + directives.join('; '));
  };

  const handleProcess = (val: string) => {
    setInput(val);
    buildCsp(val);
  };

  useEffect(() => {
    buildCsp(input);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only initial CSP build for default template
  }, []);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'VelnoxLabs CSP Header Builder & Validator',
        operatingSystem: 'All',
        applicationCategory: 'DeveloperApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Build and validate Content Security Policy headers securely with real-time directive and source validation.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How to build a CSP header online?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Paste your directives in any format (newline or semicolon-separated) and the tool instantly generates a valid Content-Security-Policy header.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is CSP header building secure?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, 100% client-side processing. Your policy is never uploaded to any server.',
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading
            title="CSP Header Builder & Validator"
            subtitle="Build, validate, and format Content Security Policy headers with real-time directive checking."
          />

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
              marginTop: 'var(--space-6)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              <div>
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  Directives (newline or semicolon separated):
                </label>
                <textarea
                  value={input}
                  onChange={(e) => handleProcess(e.target.value)}
                  rows={12}
                  placeholder="default-src 'self'; script-src 'self' https://cdn.example.com"
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

                {/* Errors */}
                {errors.length > 0 && (
                  <div
                    style={{
                      marginTop: '12px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                  >
                    <p
                      style={{
                        color: '#f87171',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        marginBottom: '6px',
                      }}
                    >
                      ❌ Errors:
                    </p>
                    {errors.map((err, i) => (
                      <p
                        key={i}
                        style={{ color: '#fca5a5', fontSize: '0.75rem', marginBottom: '4px' }}
                      >
                        • {err}
                      </p>
                    ))}
                  </div>
                )}

                {/* Warnings */}
                {warnings.length > 0 && errors.length === 0 && (
                  <div
                    style={{
                      marginTop: '12px',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                  >
                    <p
                      style={{
                        color: '#fbbf24',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        marginBottom: '6px',
                      }}
                    >
                      ⚠️ Warnings:
                    </p>
                    {warnings.map((w, i) => (
                      <p
                        key={i}
                        style={{ color: '#fcd34d', fontSize: '0.75rem', marginBottom: '4px' }}
                      >
                        • {w}
                      </p>
                    ))}
                  </div>
                )}
              </div>

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
                    CSP Header:
                  </label>
                  <button
                    onClick={handleCopy}
                    disabled={!output}
                    style={{
                      backgroundColor: output
                        ? 'rgba(59, 130, 246, 0.15)'
                        : 'rgba(255,255,255,0.05)',
                      color: output ? '#60a5fa' : '#64748b',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      padding: '4px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: output ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea
                  value={output}
                  readOnly
                  rows={12}
                  placeholder="Valid CSP header will appear here..."
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#34d399',
                    padding: '12px',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          </div>

          <ToolSeoContent
            toolSlug="csp-header-builder-and-validator"
            toolName="CSP Header Builder & Validator"
          />
        </div>
      </GlobalContainer>
    </>
  );
}
