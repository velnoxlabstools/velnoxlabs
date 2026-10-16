'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

const SUPPORTED_KEYS = [
  { key: 'name', desc: 'Service name (used for filename suggestion)' },
  { key: 'description', desc: 'Human-readable description' },
  { key: 'exec', desc: 'Full command to start the service' },
  { key: 'user', desc: 'Linux user to run as' },
  { key: 'workdir', desc: 'Working directory' },
  { key: 'restart', desc: 'Restart policy (on-failure, always, no)' },
];

export default function Page() {
  const [input, setInput] = useState(
    'name=myapp\ndescription=My Node Application\nexec=/usr/bin/node /opt/myapp/index.js\nuser=www-data\nworkdir=/opt/myapp\nrestart=on-failure'
  );
  const [output, setOutput] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const generateService = (val: string) => {
    setError('');
    setWarnings([]);
    setOutput('');
    setServiceName('');

    if (!val.trim()) {
      return;
    }

    const lines = val
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const cfg: Record<string, string> = {};
    const invalidLines: string[] = [];
    const unknownKeys: string[] = [];

    lines.forEach((line) => {
      const idx = line.indexOf('=');
      if (idx === -1) {
        invalidLines.push(line);
        return;
      }
      const k = line.slice(0, idx).trim().toLowerCase();
      const v = line.slice(idx + 1).trim();
      if (!k) {
        invalidLines.push(line);
        return;
      }
      cfg[k] = v;
      if (!SUPPORTED_KEYS.some((sk) => sk.key === k)) {
        unknownKeys.push(k);
      }
    });

    const warns: string[] = [];

    // If nothing valid was parsed, show error
    if (Object.keys(cfg).length === 0) {
      setError('No valid key=value pairs found. Format: key=value (one per line)');
      return;
    }

    if (invalidLines.length > 0) {
      warns.push(
        `${invalidLines.length} line(s) skipped (missing "="): ${invalidLines.slice(0, 3).join(', ')}${invalidLines.length > 3 ? '...' : ''}`
      );
    }

    if (unknownKeys.length > 0) {
      warns.push(`Unknown keys (ignored): ${unknownKeys.join(', ')}`);
    }

    // Required field: exec
    if (!cfg.exec) {
      setError('Missing required field: "exec" (the command to start the service)');
      setWarnings(warns);
      return;
    }

    const name = cfg.name || 'my-service';
    const desc = cfg.description || name;
    const user = cfg.user || 'www-data';
    const workdir = cfg.workdir || '/opt/' + name;
    const restart = cfg.restart || 'on-failure';

    // Validate restart value
    const validRestart = [
      'no',
      'on-success',
      'on-failure',
      'on-abnormal',
      'on-watchdog',
      'on-abort',
      'always',
    ];
    if (!validRestart.includes(restart)) {
      warns.push(
        `"restart=${restart}" is not a standard value. Use one of: ${validRestart.join(', ')}`
      );
    }

    setWarnings(warns);
    setServiceName(name);

    const serviceFile = `[Unit]
Description=${desc}
After=network.target

[Service]
Type=simple
User=${user}
WorkingDirectory=${workdir}
ExecStart=${cfg.exec}
Restart=${restart}
RestartSec=10

[Install]
WantedBy=multi-user.target`;

    setOutput(serviceFile);
  };

  useEffect(() => {
    generateService(input);
  }, [input]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${serviceName || 'my-service'}.service`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'VelnoxLabs Systemd Service File Generator',
        operatingSystem: 'Linux',
        applicationCategory: 'DeveloperApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Generate production-ready systemd .service files for Linux applications in seconds. Supports Node.js, Python, Go, and any executable.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How to create a systemd service file?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Enter key=value pairs like name, description, exec, user, workdir, and restart. The tool generates a ready-to-use .service file that you can copy or download.',
            },
          },
          {
            '@type': 'Question',
            name: 'Where do systemd service files go?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Custom systemd service files are typically placed in /etc/systemd/system/ or /usr/lib/systemd/system/. After adding one, run: systemctl daemon-reload && systemctl enable --now your-service.',
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
            title="Systemd Service File Generator"
            subtitle="Create production-ready systemd .service files for your Linux applications."
          />

          {/* ========== TOOL UI ========== */}
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
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
              {/* Input */}
              <div>
                <label
                  style={{
                    color: '#fff',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  Service Config (key=value):
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={12}
                  placeholder={
                    'name=myapp\ndescription=My App\nexec=/usr/bin/node /opt/myapp/index.js\nuser=www-data\nworkdir=/opt/myapp\nrestart=on-failure'
                  }
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    padding: '12px',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />

                {/* Supported keys hint */}
                <div
                  style={{
                    marginTop: '12px',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <p
                    style={{
                      color: '#94a3b8',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      marginBottom: '6px',
                    }}
                  >
                    Supported keys:
                  </p>
                  {SUPPORTED_KEYS.map((k) => (
                    <p
                      key={k.key}
                      style={{ color: '#64748b', fontSize: '0.7rem', marginBottom: '2px' }}
                    >
                      <span style={{ color: '#60a5fa', fontFamily: 'monospace' }}>{k.key}</span> —{' '}
                      {k.desc}
                    </p>
                  ))}
                </div>

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
                    <p style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>
                      ❌ {error}
                    </p>
                  </div>
                )}

                {warnings.length > 0 && !error && (
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

              {/* Output */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                    gap: '8px',
                    flexWrap: 'wrap',
                  }}
                >
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>
                    {serviceName ? `${serviceName}.service` : 'systemd .service file'}
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleDownload}
                      disabled={!output}
                      style={{
                        backgroundColor: output ? '#059669' : 'rgba(255,255,255,0.05)',
                        color: output ? '#fff' : '#64748b',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: output ? 'pointer' : 'not-allowed',
                      }}
                    >
                      Download
                    </button>
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
                </div>
                <textarea
                  value={output}
                  readOnly
                  rows={12}
                  placeholder={'Enter config like "name=myapp" to generate a service file...'}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
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
            toolSlug="systemd-service-file-generator"
            toolName="Systemd Service File Generator"
          />
        </div>
      </GlobalContainer>
    </>
  );
}
