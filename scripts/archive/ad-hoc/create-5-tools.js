const fs = require('fs');
const path = require('path');
const toolsDir = path.join(__dirname, 'src', 'app', 'tools');

function jsonToZod(val) {
  const obj = JSON.parse(val);
  let code = "import { z } from 'zod';\n\nconst schema = z.object({\n";
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    let zType = 'z.string()';
    const t = typeof value;
    if (t === 'number') zType = Number.isInteger(value) ? 'z.number().int()' : 'z.number()';
    else if (t === 'boolean') zType = 'z.boolean()';
    else if (Array.isArray(value)) zType = 'z.array(z.any())';
    else if (t === 'object' && value !== null) zType = 'z.object({})';
    code += '  ' + key + ': ' + zType + ',\n';
  }
  code += '});';
  return code;
}

function mimeLookup(val) {
  const q = val.trim().toLowerCase().replace(/^\./, '');
  const data = [
    ['html', 'text/html'], ['htm', 'text/html'], ['css', 'text/css'],
    ['js', 'application/javascript'], ['json', 'application/json'],
    ['xml', 'application/xml'], ['txt', 'text/plain'], ['csv', 'text/csv'],
    ['pdf', 'application/pdf'], ['zip', 'application/zip'],
    ['png', 'image/png'], ['jpg', 'image/jpeg'], ['jpeg', 'image/jpeg'],
    ['gif', 'image/gif'], ['svg', 'image/svg+xml'], ['webp', 'image/webp'],
    ['ico', 'image/x-icon'], ['mp3', 'audio/mpeg'], ['mp4', 'video/mp4'],
    ['webm', 'video/webm'], ['wav', 'audio/wav'],
    ['woff', 'font/woff'], ['woff2', 'font/woff2'],
    ['ttf', 'font/ttf'], ['otf', 'font/otf'],
    ['doc', 'application/msword'], ['xls', 'application/vnd.ms-excel'],
    ['ppt', 'application/vnd.ms-powerpoint']
  ];
  const matches = data.filter(function(d) { return d[0].indexOf(q) !== -1 || d[1].indexOf(q) !== -1; });
  if (!matches.length) return 'No matches found for: ' + q;
  return matches.map(function(m) { return m[0] + '  →  ' + m[1]; }).join('\n');
}

function systemdGen(val) {
  const lines = val.split('\n').filter(function(l) { return l.trim(); });
  const cfg = {};
  lines.forEach(function(line) {
    const idx = line.indexOf('=');
    if (idx !== -1) cfg[line.slice(0, idx).trim().toLowerCase()] = line.slice(idx + 1).trim();
  });
  const name = cfg.name || 'myapp';
  const desc = cfg.description || 'My Application';
  const exec = cfg.exec || '/usr/bin/node /opt/myapp/index.js';
  const user = cfg.user || 'www-data';
  const workdir = cfg.workdir || '/opt/myapp';
  const restart = cfg.restart || 'on-failure';
  return '[Unit]\nDescription=' + desc + '\nAfter=network.target\n\n[Service]\nType=simple\nUser=' + user + '\nWorkingDirectory=' + workdir + '\nExecStart=' + exec + '\nRestart=' + restart + '\nRestartSec=10\n\n[Install]\nWantedBy=multi-user.target';
}

function urlParser(val) {
  const u = new URL(val.trim());
  const lines = [];
  lines.push('Protocol:   ' + u.protocol);
  lines.push('Host:       ' + u.host);
  lines.push('Hostname:   ' + u.hostname);
  lines.push('Port:       ' + (u.port || '(default)'));
  lines.push('Pathname:   ' + u.pathname);
  lines.push('Search:     ' + (u.search || '(none)'));
  lines.push('Hash:       ' + (u.hash || '(none)'));
  lines.push('');
  lines.push('Query Parameters:');
  if (u.searchParams.toString()) {
    u.searchParams.forEach(function(v, k) { lines.push('  ' + k + ' = ' + v); });
  } else {
    lines.push('  (none)');
  }
  return lines.join('\n');
}

function cspBuilder(val) {
  const lines = val.split('\n').filter(function(l) { return l.trim() && l.indexOf('=') !== -1; });
  const directives = lines.map(function(line) {
    const idx = line.indexOf('=');
    return line.slice(0, idx).trim() + ' ' + line.slice(idx + 1).trim();
  });
  return "Content-Security-Policy: " + directives.join('; ');
}

const tools = [
  { folder: 'json-to-zod-schema-generator', title: 'JSON to Zod Schema Generator', subtitle: 'Generate Zod validation schemas from JSON objects instantly.', defaultInput: '{\n  "name": "VelnoxLabs",\n  "version": 1,\n  "active": true\n}', inputPlaceholder: 'Paste JSON here...', outputLabel: 'Zod Schema Output:', logic: jsonToZod },
  { folder: 'mime-type-lookup-and-extension-finder', title: 'MIME Type Lookup & Extension Finder', subtitle: 'Find MIME types and file extensions instantly.', defaultInput: '.jpg', inputPlaceholder: 'Enter extension (jpg) or MIME (image/)', inputLabel: 'Search:', outputLabel: 'Results:', logic: mimeLookup },
  { folder: 'systemd-service-file-generator', title: 'Systemd Service File Generator', subtitle: 'Create Linux systemd service configuration files.', defaultInput: 'name=myapp\ndescription=My Node Application\nexec=/usr/bin/node /opt/myapp/index.js\nuser=www-data\nworkdir=/opt/myapp\nrestart=on-failure', inputPlaceholder: 'name=...\ndescription=...', inputLabel: 'Service Config (key=value):', outputLabel: 'systemd .service file:', logic: systemdGen },
  { folder: 'url-parser-and-query-string-extractor', title: 'URL Parser & Query Extractor', subtitle: 'Deconstruct URLs into components and query params.', defaultInput: 'https://example.com/path/to/page?search=hello&page=2#section', inputPlaceholder: 'Paste a URL...', inputLabel: 'URL:', outputLabel: 'Parsed Components:', logic: urlParser },
  { folder: 'csp-header-builder-and-validator', title: 'CSP Header Builder & Validator', subtitle: 'Build Content Security Policy headers.', defaultInput: "default-src='self'\nscript-src='self' https://cdn.example.com\nstyle-src='self' 'unsafe-inline'", inputPlaceholder: "default-src='self'", inputLabel: 'Directives (one per line):', outputLabel: 'CSP Header:', logic: cspBuilder }
];

tools.forEach(function(tool) {
  const folderPath = path.join(toolsDir, tool.folder);
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
  const logicStr = tool.logic.toString();
  const content = `'use client';

import React, { useState } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

export default function Page() {
  const [input, setInput] = useState(${JSON.stringify(tool.defaultInput)});
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleProcess = (val: string) => {
    setInput(val);
    setError('');
    if (!val.trim()) { setOutput(''); return; }
    try {
      const fn = ${logicStr};
      setOutput(fn(val));
    } catch (e: any) {
      setError(e.message);
      setOutput('');
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setFeedbackSent(true);
    setFeedback('');
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  return (
    <>
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading title=${JSON.stringify(tool.title)} subtitle=${JSON.stringify(tool.subtitle)} />
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>${tool.inputLabel || 'Input:'}</label>
                <textarea value={input} onChange={(e) => handleProcess(e.target.value)} rows={12} placeholder=${JSON.stringify(tool.inputPlaceholder)} style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none' }} />
                {error && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '8px' }}>{error}</p>}
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>${tool.outputLabel || 'Output:'}</label>
                  <button onClick={handleCopy} style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>{copied ? 'Copied!' : 'Copy'}</button>
                </div>
                <textarea value={output} readOnly rows={12} placeholder="Output will appear here..." style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#34d399', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none' }} />
              </div>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl mt-12">
            <h3 className="text-xl font-bold text-white mb-2">Got Feedback or Feature Requests?</h3>
            <p className="text-slate-400 mb-6 text-sm">Help us enhance VelnoxLabs developer utility standards.</p>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <textarea rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Write your suggestions..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 text-sm resize-none"></textarea>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-xl text-sm">{feedbackSent ? 'Sent!' : 'Submit Suggestion'}</button>
            </form>
          </div>
        </div>
      </GlobalContainer>
    </>
  );
}
`;
  fs.writeFileSync(path.join(folderPath, 'page.tsx'), content, 'utf8');
  console.log('✅ Created: ' + tool.folder);
});
console.log('\\n🎉 First 5 tools created!');