const fs = require('fs');
const path = require('path');

const files = {};

files['json-yaml-converter/page.tsx'] = `'use client';

import React, { useState } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

function jsonToYaml(obj, indent) {
  indent = indent || '';
  let result = '';
  if (Array.isArray(obj)) {
    obj.forEach(function(item) {
      if (typeof item === 'object' && item !== null) {
        result += indent + '-\\n' + jsonToYaml(item, indent + '  ');
      } else {
        result += indent + '- ' + String(item) + '\\n';
      }
    });
  } else if (typeof obj === 'object' && obj !== null) {
    Object.keys(obj).forEach(function(key) {
      const value = obj[key];
      if (typeof value === 'object' && value !== null) {
        result += indent + key + ':\\n' + jsonToYaml(value, indent + '  ');
      } else {
        result += indent + key + ': ' + String(value) + '\\n';
      }
    });
  }
  return result;
}

export default function JsonYamlPage() {
  const [input, setInput] = useState('{\\n  "name": "VelnoxLabs",\\n  "version": "1.0.0",\\n  "features": ["tools", "api"]\\n}');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('json2yaml');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleConvert = (val, currentMode) => {
    setInput(val);
    setError('');
    if (!val.trim()) { setOutput(''); return; }
    try {
      if (currentMode === 'json2yaml') {
        const parsed = JSON.parse(val);
        setOutput(jsonToYaml(parsed).trimEnd());
      } else {
        const lines = val.split('\\n');
        const obj = {};
        lines.forEach(function(line) {
          const match = line.match(/^(\\s*)([^:]+):\\s*(.*)$/);
          if (match) {
            const key = match[2].trim();
            const value = match[3].trim();
            if (value === 'true') obj[key] = true;
            else if (value === 'false') obj[key] = false;
            else if (value === '') obj[key] = {};
            else if (!isNaN(Number(value))) obj[key] = Number(value);
            else obj[key] = value;
          }
        });
        setOutput(JSON.stringify(obj, null, 2));
      }
    } catch (e) {
      setError('Error: ' + e.message);
      setOutput('');
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedbackSubmit = (e) => {
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
          <SectionHeading title="JSON to YAML Converter" subtitle="Convert between JSON and YAML formats instantly." />

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button onClick={() => { setMode('json2yaml'); handleConvert(input, 'json2yaml'); }} style={{ backgroundColor: mode === 'json2yaml' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(0,0,0,0.3)', color: mode === 'json2yaml' ? '#60a5fa' : '#94a3b8', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '6px 16px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>JSON to YAML</button>
              <button onClick={() => { setMode('yaml2json'); handleConvert(input, 'yaml2json'); }} style={{ backgroundColor: mode === 'yaml2json' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(0,0,0,0.3)', color: mode === 'yaml2json' ? '#60a5fa' : '#94a3b8', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '6px 16px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>YAML to JSON</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>{mode === 'json2yaml' ? 'JSON Input:' : 'YAML Input:'}</label>
                <textarea value={input} onChange={(e) => handleConvert(e.target.value, mode)} rows={12} style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none' }} />
                {error && <span style={{ color: '#f87171', fontSize: '0.8rem' }}>{error}</span>}
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>{mode === 'json2yaml' ? 'YAML Output:' : 'JSON Output:'}</label>
                  <button onClick={handleCopy} style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>{copied ? 'Copied!' : 'Copy'}</button>
                </div>
                <textarea value={output} readOnly rows={12} style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#34d399', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none' }} />
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

files['lorem-ipsum/page.tsx'] = `'use client';

import React, { useState } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

const WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');

function generateLorem(paragraphs) {
  const result = [];
  for (let p = 0; p < paragraphs; p++) {
    const sentenceCount = 4 + Math.floor(Math.random() * 3);
    const paragraph = [];
    for (let s = 0; s < sentenceCount; s++) {
      const wordCount = 8 + Math.floor(Math.random() * 8);
      const sentence = [];
      for (let w = 0; w < wordCount; w++) {
        sentence.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
      }
      let sStr = sentence.join(' ');
      sStr = sStr.charAt(0).toUpperCase() + sStr.slice(1) + '.';
      paragraph.push(sStr);
    }
    result.push(paragraph.join(' '));
  }
  return result.join('\\n\\n');
}

export default function LoremIpsumPage() {
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState(generateLorem(3));
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleGenerate = () => setOutput(generateLorem(count));

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedbackSubmit = (e) => {
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
          <SectionHeading title="Lorem Ipsum Generator" subtitle="Generate placeholder text for your designs and layouts instantly." />

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '20px' }}>
              <div style={{ flex: '1', minWidth: '150px' }}>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Paragraphs:</label>
                <input type="number" min="1" max="20" value={count} onChange={(e) => setCount(Math.min(20, Math.max(1, Number(e.target.value))))} style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '10px', fontSize: '0.9rem', outline: 'none' }} />
              </div>
              <button onClick={handleGenerate} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Generate</button>
              <button onClick={handleCopy} style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '10px 24px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>{copied ? 'Copied!' : 'Copy'}</button>
            </div>
            <textarea value={output} readOnly rows={14} style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#34d399', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none' }} />
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

files['unix-timestamp-converter/page.tsx'] = `'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

export default function UnixTimestampPage() {
  const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000));
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  const date = new Date(timestamp * 1000);
  const humanDate = date.toString();
  const isoDate = date.toISOString();

  const handleTimestampChange = (val) => {
    const num = parseInt(val);
    if (!isNaN(num)) setTimestamp(num);
  };

  const handleDateChange = (val) => {
    const d = new Date(val);
    if (!isNaN(d.getTime())) setTimestamp(Math.floor(d.getTime() / 1000));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(String(timestamp));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedbackSubmit = (e) => {
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
          <SectionHeading title="Unix Timestamp Converter" subtitle="Convert between Unix timestamps and human-readable dates instantly." />

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Current Unix Time:</span>
              <span style={{ color: '#34d399', fontFamily: 'monospace', fontSize: '1rem', fontWeight: 600 }}>{currentTime}</span>
              <button onClick={() => setTimestamp(currentTime)} style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Use Now</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Unix Timestamp:</label>
                <input type="number" value={timestamp} onChange={(e) => handleTimestampChange(e.target.value)} style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontFamily: 'monospace', fontSize: '0.9rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Pick a Date:</label>
                <input type="datetime-local" onChange={(e) => handleDateChange(e.target.value)} style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontFamily: 'monospace', fontSize: '0.9rem', outline: 'none' }} />
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>Human Readable:</label>
                <button onClick={handleCopy} style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>{copied ? 'Copied!' : 'Copy Timestamp'}</button>
              </div>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#34d399' }}>{humanDate}</div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>ISO 8601:</label>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#60a5fa' }}>{isoDate}</div>
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

files['secure-password-generator/page.tsx'] = `'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

export default function SecurePasswordGeneratorPage() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(20);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const generate = () => {
    let chars = '';
    if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) chars += '0123456789';
    if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (excludeSimilar) chars = chars.replace(/[il1Lo0O]/g, '');
    if (!chars) { setPassword(''); setStrength(''); return; }
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    let pass = '';
    for (let i = 0; i < length; i++) pass += chars[array[i] % chars.length];
    setPassword(pass);

    let score = 0;
    if (length >= 12) score++;
    if (length >= 16) score++;
    if (useUpper && useLower) score++;
    if (useNumbers) score++;
    if (useSymbols) score++;
    if (score <= 2) setStrength('Weak');
    else if (score <= 3) setStrength('Medium');
    else if (score <= 4) setStrength('Strong');
    else setStrength('Very Strong');
  };

  useEffect(() => { generate(); }, []);

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedbackSubmit = (e) => {
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
          <SectionHeading title="Secure Password Generator" subtitle="Create cryptographically secure passwords with custom character sets." />

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>Generated Password:</label>
              <button onClick={handleCopy} style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>{copied ? 'Copied!' : 'Copy'}</button>
            </div>

            <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '1.1rem', color: '#34d399', wordBreak: 'break-all', marginBottom: '8px' }}>{password || 'Generate password...'}</div>
            {strength && <div style={{ color: strength === 'Weak' ? '#f87171' : strength === 'Medium' ? '#fbbf24' : '#34d399', fontSize: '0.85rem', marginBottom: '16px' }}>Strength: <strong>{strength}</strong></div>}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Length: {length}</label>
              <input type="range" min="8" max="64" value={length} onChange={(e) => setLength(Number(e.target.value))} style={{ width: '100%' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="checkbox" checked={useUpper} onChange={(e) => setUseUpper(e.target.checked)} /> Uppercase (A-Z)</label>
              <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="checkbox" checked={useLower} onChange={(e) => setUseLower(e.target.checked)} /> Lowercase (a-z)</label>
              <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="checkbox" checked={useNumbers} onChange={(e) => setUseNumbers(e.target.checked)} /> Numbers (0-9)</label>
              <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} /> Symbols (!@#$)</label>
              <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="checkbox" checked={excludeSimilar} onChange={(e) => setExcludeSimilar(e.target.checked)} /> Exclude similar (il1Lo0O)</label>
            </div>

            <button onClick={generate} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Generate New Password</button>
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

Object.keys(files).forEach(f => {
  const filePath = path.join(__dirname, 'src', 'app', 'tools', f);
  fs.writeFileSync(filePath, files[f], 'utf8');
  console.log('✅ Fixed: ' + f);
});

console.log('\\n🎉 All remaining tools fixed!');