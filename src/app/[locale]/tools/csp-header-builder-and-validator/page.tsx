'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import { ShieldCheck, Sparkles, Copy, Check, Wand2 } from 'lucide-react';

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

type ExportTarget = 'header' | 'meta' | 'nginx' | 'apache' | 'nextjs';

const CSP_PRESETS = [
  {
    id: 'strict',
    labelKey: 'presetStrict',
    value:
      "default-src 'none';\nscript-src 'self' 'strict-dynamic';\nstyle-src 'self';\nimg-src 'self' data:;\nfont-src 'self';\nconnect-src 'self';\nobject-src 'none';\nbase-uri 'self';\nframe-ancestors 'none';\nupgrade-insecure-requests",
  },
  {
    id: 'google',
    labelKey: 'presetGoogle',
    value:
      "default-src 'self';\nscript-src 'self' https://www.googletagmanager.com https://www.google-analytics.com;\nstyle-src 'self' https://fonts.googleapis.com;\nfont-src 'self' https://fonts.gstatic.com;\nimg-src 'self' data: https://www.google-analytics.com;\nconnect-src 'self' https://www.google-analytics.com;\nobject-src 'none';\nframe-ancestors 'self'",
  },
  {
    id: 'nextjs',
    labelKey: 'presetNextjs',
    value:
      "default-src 'self';\nscript-src 'self' 'unsafe-inline';\nstyle-src 'self' 'unsafe-inline';\nimg-src 'self' blob: data: https:;\nfont-src 'self' data:;\nconnect-src 'self' https:;\nobject-src 'none';\nbase-uri 'self';\nframe-ancestors 'none'",
  },
  {
    id: 'wordpress',
    labelKey: 'presetWordpress',
    value:
      "default-src 'self';\nscript-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com;\nstyle-src 'self' 'unsafe-inline' https://fonts.googleapis.com;\nimg-src 'self' data: https:;\nfont-src 'self' https://fonts.gstatic.com data:;\nframe-src https://googleads.g.doubleclick.net;\nobject-src 'none'",
  },
] as const;

export default function CspHeaderBuilderPage() {
  const tUI = useTranslations('ToolUI.cspHeaderBuilder');
  const [input, setInput] = useState(
    "default-src 'self';\nscript-src 'self' https://cdn.example.com;\nstyle-src 'self' 'unsafe-inline'"
  );
  const [output, setOutput] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [exportTarget, setExportTarget] = useState<ExportTarget>('header');
  const [copiedExport, setCopiedExport] = useState(false);

  const validateSource = (source: string): string | null => {
    if (VALID_KEYWORDS.has(source)) return null;
    if (/^(https?|wss?):\/\//i.test(source)) return null;
    if (/^(\*\.)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*$/i.test(source)) return null;
    if (/^'(nonce|sha256|sha384|sha512)-[A-Za-z0-9+/=]+'$/.test(source)) return null;
    return tUI('errInvalidSource', { source });
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

    const cleaned = raw.replace(/Content-Security-Policy:\s*/i, '').trim();
    const parts = cleaned
      .split(/[\n;]+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    parts.forEach((part) => {
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

      if (!VALID_DIRECTIVES.has(directiveName)) {
        errs.push(tUI('errInvalidDirective', { directive: directiveName }));
        return;
      }

      if (
        directiveName === 'upgrade-insecure-requests' ||
        directiveName === 'block-all-mixed-content'
      ) {
        directives.push(directiveName);
        return;
      }

      if (!directiveValue) {
        errs.push(tUI('errMissingValue', { directive: directiveName }));
        return;
      }

      const sources = directiveValue.split(/\s+/);
      sources.forEach((src) => {
        const err = validateSource(src);
        if (err) errs.push(err);
      });

      directives.push(`${directiveName} ${sources.join(' ')}`);
    });

    const fullCsp = directives.join('; ');
    if (fullCsp && !fullCsp.includes('default-src')) warns.push(tUI('warnDefaultSrc'));
    if (fullCsp.includes("'unsafe-inline'")) warns.push(tUI('warnUnsafeInline'));
    if (fullCsp.includes("'unsafe-eval'")) warns.push(tUI('warnUnsafeEval'));

    setErrors(errs);
    setWarnings(warns);
    setOutput(fullCsp);
  };

  useEffect(() => {
    buildCsp(input);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  // AI CSP Evaluator Score (0-100)
  const evaluation = useMemo(() => {
    if (!output) return { score: 0, grade: 'F', color: '#f87171', tips: [] as string[] };
    let score = 100;
    const tips: string[] = [];

    if (errors.length > 0) {
      score -= Math.min(40, errors.length * 15);
    }
    if (!output.includes('default-src')) {
      score -= 15;
      tips.push(tUI('tipDefaultSrc'));
    }
    if (!output.includes("object-src 'none'")) {
      score -= 10;
      tips.push(tUI('tipObjectSrc'));
    }
    if (!output.includes('frame-ancestors')) {
      score -= 10;
      tips.push(tUI('tipFrameAncestors'));
    }
    if (!output.includes('base-uri')) {
      score -= 10;
      tips.push(tUI('tipBaseUri'));
    }
    if (output.includes("'unsafe-inline'")) {
      score -= 15;
    }
    if (output.includes("'unsafe-eval'")) {
      score -= 15;
    }
    if (/\s\*(?:\s|;|$)/.test(output)) {
      score -= 15;
      tips.push(tUI('tipWildcard'));
    }

    const clamped = Math.max(0, Math.min(100, score));
    const grade = clamped >= 90 ? 'A+' : clamped >= 75 ? 'B' : clamped >= 55 ? 'C' : 'F';
    const color =
      clamped >= 90 ? '#34d399' : clamped >= 75 ? '#60a5fa' : clamped >= 55 ? '#fbbf24' : '#f87171';
    return { score: clamped, grade, color, tips };
  }, [output, errors, tUI]);

  const exportSnippet = useMemo(() => {
    if (!output) return '';
    if (exportTarget === 'meta') {
      return `<meta http-equiv="Content-Security-Policy" content="${output}">`;
    }
    if (exportTarget === 'nginx') {
      return `add_header Content-Security-Policy "${output}" always;`;
    }
    if (exportTarget === 'apache') {
      return `Header set Content-Security-Policy "${output}"`;
    }
    if (exportTarget === 'nextjs') {
      return `{\n  key: 'Content-Security-Policy',\n  value: "${output}"\n}`;
    }
    return `Content-Security-Policy: ${output}`;
  }, [output, exportTarget]);

  const handleFormat = () => {
    if (!output) return;
    setInput(output.split(/;\s*/).join(';\n'));
  };

  const handleMinify = () => {
    if (!output) return;
    setInput(output);
  };

  const handleHarden = () => {
    let next = input.trim();
    if (!next.includes('object-src')) next += "\nobject-src 'none';";
    if (!next.includes('frame-ancestors')) next += "\nframe-ancestors 'none';";
    if (!next.includes('base-uri')) next += "\nbase-uri 'self';";
    setInput(next);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleCopyExport = () => {
    if (!exportSnippet) return;
    navigator.clipboard.writeText(exportSnippet);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 1800);
  };

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading
          title={tUI('title')}
          subtitle={tUI('subtitle')}
          toolSlug="csp-header-builder-and-validator"
        />

        {/* 1-Click CSP Wizard Presets */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: 'var(--space-6)',
            marginBottom: '16px',
          }}
        >
          {CSP_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setInput(p.value)}
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {tUI(p.labelKey)}
            </button>
          ))}
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          {/* Toolbar */}
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
            <label style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600 }}>
              {tUI('directivesLabel')}
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleFormat}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-page)',
                  color: 'var(--text-main)',
                }}
              >
                {tUI('formatBtn')}
              </button>
              <button
                type="button"
                onClick={handleMinify}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-page)',
                  color: 'var(--text-main)',
                }}
              >
                {tUI('minifyBtn')}
              </button>
              <button
                type="button"
                onClick={handleHarden}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  backgroundColor: 'rgba(139, 92, 246, 0.14)',
                  color: '#a78bfa',
                }}
              >
                <Wand2 size={12} />
                {tUI('hardenBtn')}
              </button>
            </div>
          </div>

          <textarea
            rows={5}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={tUI('directivesPlaceholder')}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-main)',
              padding: '14px',
              fontSize: '0.88rem',
              fontFamily: 'monospace',
              outline: 'none',
              resize: 'vertical',
              marginBottom: '18px',
            }}
          />

          {/* AI Evaluator Score */}
          {output && (
            <div
              style={{
                backgroundColor: 'rgba(139, 92, 246, 0.07)',
                border: '1px solid rgba(139, 92, 246, 0.25)',
                borderRadius: '10px',
                padding: '14px 16px',
                marginBottom: '18px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#a78bfa',
                  }}
                >
                  <Sparkles size={15} />
                  {tUI('evaluatorTitle')}
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    color: evaluation.color,
                  }}
                >
                  <ShieldCheck size={16} />
                  {evaluation.score}/100 ({evaluation.grade})
                </span>
              </div>
              {evaluation.tips.length > 0 && (
                <ul
                  style={{
                    margin: '8px 0 0 0',
                    paddingLeft: '18px',
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.6,
                  }}
                >
                  {evaluation.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Formatted CSP Output */}
          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                color: 'var(--text-main)',
                fontSize: '0.875rem',
                fontWeight: 600,
                display: 'block',
                marginBottom: '8px',
              }}
            >
              {tUI('cspHeaderLabel')}
            </label>
            <div
              style={{
                position: 'relative',
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '14px',
                paddingRight: '100px',
                minHeight: '54px',
              }}
            >
              <code
                style={{
                  color: '#34d399',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  wordBreak: 'break-all',
                }}
              >
                {output || tUI('cspHeaderPlaceholder')}
              </code>
              {output && (
                <button
                  type="button"
                  onClick={handleCopy}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: copied ? '#10b981' : '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? tUI('copied') : tUI('copy')}
                </button>
              )}
            </div>
          </div>

          {/* Errors & Warnings */}
          {errors.length > 0 && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '14px',
                fontSize: '0.82rem',
                color: '#f87171',
              }}
            >
              <strong>{tUI('errorsHeading')}</strong>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px' }}>
                {errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          {warnings.length > 0 && (
            <div
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '18px',
                fontSize: '0.82rem',
                color: '#fbbf24',
              }}
            >
              <strong>{tUI('warningsHeading')}</strong>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px' }}>
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Multi-Platform Export */}
          {output && (
            <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '10px',
                }}
              >
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {tUI('exportTitle')}
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {(
                    [
                      { id: 'header', label: 'HTTP Header' },
                      { id: 'meta', label: 'HTML <meta>' },
                      { id: 'nginx', label: 'Nginx' },
                      { id: 'apache', label: 'Apache' },
                      { id: 'nextjs', label: 'Next.js' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setExportTarget(tab.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '1px solid var(--border-color)',
                        backgroundColor: exportTarget === tab.id ? '#3b82f6' : 'var(--bg-page)',
                        color: exportTarget === tab.id ? '#ffffff' : 'var(--text-main)',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <div
                style={{
                  position: 'relative',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  paddingRight: '95px',
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    fontFamily: 'monospace',
                    fontSize: '0.78rem',
                    color: '#60a5fa',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  {exportSnippet}
                </pre>
                <button
                  type="button"
                  onClick={handleCopyExport}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: copiedExport ? '#10b981' : '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copiedExport ? <Check size={12} /> : <Copy size={12} />}
                  {copiedExport ? tUI('copied') : tUI('copy')}
                </button>
              </div>
            </div>
          )}
        </div>

        <ToolSeoContent
          toolSlug="csp-header-builder-and-validator"
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
