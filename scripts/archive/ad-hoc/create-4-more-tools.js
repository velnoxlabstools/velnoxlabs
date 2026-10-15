const fs = require('fs');
const path = require('path');
const toolsDir = path.join(__dirname, 'src', 'app', 'tools');

function curlToFetch(val) {
  let url = 'https://api.example.com';
  const urlMatch = val.match(/https?:\/\/[^\s'"]+/);
  if (urlMatch) url = urlMatch[0];
  let method = 'GET';
  if (/-X\s+POST|--request\s+POST|-d\s|--data/.test(val)) method = 'POST';
  else if (/-X\s+PUT|--request\s+PUT/.test(val)) method = 'PUT';
  else if (/-X\s+DELETE|--request\s+DELETE/.test(val)) method = 'DELETE';
  const headers = {};
  const headerRegex = /(?:-H|--header)\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = headerRegex.exec(val)) !== null) {
    const idx = m[1].indexOf(':');
    if (idx !== -1) headers[m[1].slice(0, idx).trim()] = m[1].slice(idx + 1).trim();
  }
  let body = '';
  const dataMatch = val.match(/(?:-d|--data|--data-raw)\s+['"]([^'"]+)['"]/);
  if (dataMatch) body = dataMatch[1];
  let fetchCode = 'const response = await fetch("' + url + '"';
  const fetchOpts = [];
  if (method !== 'GET') fetchOpts.push('  method: "' + method + '"');
  if (Object.keys(headers).length) fetchOpts.push('  headers: ' + JSON.stringify(headers, null, 2).replace(/\n/g, '\n  '));
  if (body) fetchOpts.push('  body: ' + JSON.stringify(body));
  let code = '// Fetch API\n' + fetchCode;
  if (fetchOpts.length) code += ', {\n' + fetchOpts.join(',\n') + '\n}';
  code += ');\nconst data = await response.json();\nconsole.log(data);\n\n';
  code += '// Axios\nimport axios from "axios";\n\nconst { data } = await axios({\n  url: "' + url + '",\n  method: "' + method.toLowerCase() + '"';
  if (Object.keys(headers).length) code += ',\n  headers: ' + JSON.stringify(headers, null, 2).replace(/\n/g, '\n  ');
  if (body) code += ',\n  data: ' + JSON.stringify(body);
  code += '\n});\nconsole.log(data);';
  return code;
}

function markdownToHtml(val) {
  let html = val;
  html = html.replace(/^###### (.*)$/gm, '<h6>$1</h6>');
  html = html.replace(/^##### (.*)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#### (.*)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/^\- (.*)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  html = html.replace(/^(?!<[hula])/gm, function(line) { return line.trim() ? '<p>' + line + '</p>' : ''; });
  return html.trim();
}

function nanoidGen(val) {
  const size = Math.min(64, Math.max(1, parseInt(val) || 21));
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  const array = new Uint32Array(size);
  crypto.getRandomValues(array);
  let result = '';
  for (let i = 0; i < size; i++) result += chars[array[i] % chars.length];
  return result;
}

function ulidGen(val) {
  const count = Math.min(20, Math.max(1, parseInt(val) || 5));
  const chars = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  const result = [];
  for (let i = 0; i < count; i++) {
    let time = Date.now() + i;
    let timeStr = '';
    for (let j = 0; j < 10; j++) {
      timeStr = chars[time % 32] + timeStr;
      time = Math.floor(time / 32);
    }
    let randomStr = '';
    const arr = new Uint32Array(16);
    crypto.getRandomValues(arr);
    for (let j = 0; j < 16; j++) randomStr += chars[arr[j] % 32];
    result.push(timeStr + randomStr);
  }
  return result.join('\n');
}

const tools = [
  { folder: 'curl-to-fetch-and-axios-converter', title: 'cURL to Fetch & Axios Converter', subtitle: 'Translate cURL to JavaScript fetch and Axios.', defaultInput: "curl -X POST https://api.example.com/users -H 'Content-Type: application/json' -d '{\"name\":\"John\"}'", inputPlaceholder: 'Paste cURL command...', inputLabel: 'cURL Command:', outputLabel: 'JavaScript Code:', logic: curlToFetch },
  { folder: 'markdown-to-html-live-converter', title: 'Markdown to HTML Live Converter', subtitle: 'Preview and convert Markdown text to HTML live.', defaultInput: '# Hello VelnoxLabs\n\nThis is **bold** and *italic*.\n\n- Item 1\n- Item 2\n\n[Link](https://velnoxlabs.com)', inputPlaceholder: 'Enter Markdown...', inputLabel: 'Markdown Input:', outputLabel: 'HTML Output:', logic: markdownToHtml },
  { folder: 'nanoid-generator', title: 'NanoID Generator', subtitle: 'Generate compact, URL-friendly unique IDs.', defaultInput: '21', inputPlaceholder: 'Enter length (default 21)', inputLabel: 'Length:', outputLabel: 'Generated NanoID:', logic: nanoidGen },
  { folder: 'ulid-generator-and-parser', title: 'ULID Generator & Parser', subtitle: 'Generate Universally Unique Lexicographically Sortable Identifiers.', defaultInput: '5', inputPlaceholder: 'How many ULIDs?', inputLabel: 'Count:', outputLabel: 'Generated ULIDs:', logic: ulidGen }
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
console.log('\\n🎉 All 4 remaining tools created!');