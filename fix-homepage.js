const fs = require('fs');
const path = require('path');

const homepageContent = `import Link from 'next/link';
import { GlobalContainer } from '@/components/layout';

export default function Home() {
  const toolsList = [
    { name: 'cURL to Python Requests Converter', path: '/tools/curl-to-python-requests-converter', desc: 'Convert cURL commands into Python requests code.', cat: 'Developer Tools' },
    { name: 'cURL to Fetch & Axios Converter', path: '/tools/curl-to-fetch-and-axios-converter', desc: 'Translate cURL to JavaScript fetch and Axios.', cat: 'Developer Tools' },
    { name: 'HTTP Header Inspector & Parser', path: '/tools/http-header-inspector-_-parser', desc: 'Inspect and parse HTTP headers.', cat: 'Developer Tools' },
    { name: 'JSON Formatter & Validator', path: '/tools/json-formatter', desc: 'Format and validate JSON payloads.', cat: 'Developer Tools' },
    { name: 'JSON to Go Struct Generator', path: '/tools/json-to-go-struct-generator', desc: 'Convert JSON payloads into Go struct definitions.', cat: 'Developer Tools' },
    { name: 'JSON to Pydantic & Dataclass', path: '/tools/json-to-pydantic-&-python-dataclass-generator', desc: 'Generate Pydantic models from JSON.', cat: 'Developer Tools' },
    { name: 'JSON to TypeScript Interface', path: '/tools/json-to-typescript-interface-generator', desc: 'Convert JSON into TypeScript interfaces.', cat: 'Developer Tools' },
    { name: 'JSON to Zod Schema Generator', path: '/tools/json-to-zod-schema-generator', desc: 'Generate Zod validation schemas from JSON.', cat: 'Developer Tools' },
    { name: 'JSON to YAML Converter', path: '/tools/json-yaml-converter', desc: 'Convert between JSON and YAML formats.', cat: 'Converters' },
    { name: 'URL Parser & Query Extractor', path: '/tools/url-parser-and-query-string-extractor', desc: 'Deconstruct URLs into components and query params.', cat: 'Developer Tools' },
    { name: 'URL Encoder & Decoder', path: '/tools/url-encoder-decoder', desc: 'Percent-encode and decode URI components.', cat: 'Converters' },
    { name: 'Base64 Encoder & Decoder', path: '/tools/base64-encoder', desc: 'Encode and decode Base64 strings.', cat: 'Converters' },
    { name: 'HTML Encoder & Decoder', path: '/tools/html-encoder-decoder', desc: 'Encode and decode HTML entities.', cat: 'Converters' },
    { name: 'MIME Type Lookup & Extension Finder', path: '/tools/mime-type-lookup-and-extension-finder', desc: 'Find MIME types and file extensions.', cat: 'Developer Tools' },
    { name: 'Systemd Service File Generator', path: '/tools/systemd-service-file-generator', desc: 'Create Linux systemd service files.', cat: 'Developer Tools' },
    { name: 'Markdown to HTML Converter', path: '/tools/markdown-to-html-live-converter', desc: 'Convert Markdown to HTML live.', cat: 'Text & Content' },
    { name: 'Text Difference Checker', path: '/tools/text-diff-checker', desc: 'Compare two text blocks.', cat: 'Text & Content' },
    { name: 'Lorem Ipsum Generator', path: '/tools/lorem-ipsum', desc: 'Generate placeholder text.', cat: 'Text & Content' },
    { name: 'RegEx Tester', path: '/tools/regex-tester', desc: 'Test regular expressions against text.', cat: 'Developer Tools' },
    { name: 'Checksum Calculator', path: '/tools/checksum-calculator', desc: 'Calculate hashes (SHA-256, SHA-512, SHA-1).', cat: 'Security & Privacy' },
    { name: 'Hash Generator', path: '/tools/hash-generator', desc: 'Generate cryptographic hashes.', cat: 'Security & Privacy' },
    { name: 'HMAC Generator', path: '/tools/hmac-generator', desc: 'Generate HMAC signatures.', cat: 'Security & Privacy' },
    { name: 'JWT Decoder & Inspector', path: '/tools/jwt-decoder-&-inspector', desc: 'Decode and inspect JWT tokens.', cat: 'Security & Privacy' },
    { name: 'CSP Header Builder & Validator', path: '/tools/csp-header-builder-and-validator', desc: 'Build Content Security Policy headers.', cat: 'Security & Privacy' },
    { name: 'Password Generator', path: '/tools/password-generator', desc: 'Generate random passwords.', cat: 'Security & Privacy' },
    { name: 'Secure Password Generator', path: '/tools/secure-password-generator', desc: 'Generate cryptographically strong passwords.', cat: 'Security & Privacy' },
    { name: 'UUID v4 Generator', path: '/tools/uuid-generator', desc: 'Generate Version 4 UUIDs.', cat: 'Security & Privacy' },
    { name: 'NanoID Generator', path: '/tools/nanoid-generator', desc: 'Generate compact URL-friendly IDs.', cat: 'Security & Privacy' },
    { name: 'ULID Generator & Parser', path: '/tools/ulid-generator-and-parser', desc: 'Generate and parse ULIDs.', cat: 'Security & Privacy' },
    { name: 'QR Code Generator', path: '/tools/qr-code-generator', desc: 'Generate QR codes.', cat: 'Developer Tools' },
    { name: 'Unix Timestamp Converter', path: '/tools/unix-timestamp-converter', desc: 'Convert Unix timestamps to dates.', cat: 'Developer Tools' },
    { name: 'Case Converter', path: '/tools/case-converter', desc: 'Convert text between different cases.', cat: 'Text & Content' },
    { name: 'Color Converter', path: '/tools/color-converter', desc: 'Convert between color formats.', cat: 'Converters' },
    { name: 'Image Resizer', path: '/tools/image-resizer', desc: 'Resize and compress images.', cat: 'Media' },
    { name: 'User-Agent Parser', path: '/tools/user-agent', desc: 'Parse User-Agent strings.', cat: 'Developer Tools' },
    { name: 'User-Agent Parser (Advanced)', path: '/tools/user-agent-parser', desc: 'Advanced User-Agent analysis.', cat: 'Developer Tools' }
  ];

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-16)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
          <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            FREE ONLINE TOOLS
          </span>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#ffffff', marginTop: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            Powerful tools for everyday work
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            VelnoxLabs gives you fast, private, browser-based utilities. No sign-up required.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: 'var(--space-16)', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>TOOLS</div>
            <div style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 700 }}>{toolsList.length}</div>
          </div>
          <div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>CATEGORIES</div>
            <div style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 700 }}>6</div>
          </div>
          <div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>PRIVACY</div>
            <div style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 700 }}>100%</div>
          </div>
        </div>

        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
            All Tools ({toolsList.length})
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Explore all fully implemented developer tools ready for immediate use.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {toolsList.map((tool, idx) => (
            <div key={idx} style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#60a5fa', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
                    {tool.cat}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                  {tool.name}
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '20px' }}>
                  {tool.desc}
                </p>
              </div>
              <Link href={tool.path} style={{ color: '#34d399', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                Open tool →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </GlobalContainer>
  );
}
`;

const targetPath = path.join(__dirname, 'src', 'app', 'page.tsx');
fs.writeFileSync(targetPath, homepageContent, 'utf8');
console.log('✅ Homepage fixed! Total tools: 36');