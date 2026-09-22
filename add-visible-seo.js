const fs = require('fs');
const path = require('path');
const toolsDir = path.join(__dirname, 'src', 'app', 'tools');

function buildSEOSection(toolName, description) {
  return `
          {/* Visible SEO Content */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a ${toolName}?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              ${description}
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Enter or paste your data into the input field above.</li>
              <li>The tool processes your input instantly in real-time.</li>
              <li>View the result in the output panel on the right.</li>
              <li>Click the <strong style={{ color: '#34d399' }}>Copy</strong> button to copy the result to your clipboard.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is this tool free to use?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, VelnoxLabs ${toolName} is 100% free with no sign-up required.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is my data secure?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Absolutely. All processing happens entirely in your browser using client-side JavaScript. Your data never leaves your device and is never sent to any server.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Does it work on mobile devices?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, this tool is fully responsive and works on desktop, tablet, and mobile browsers.</p>
            </div>
          </div>

`;

}

const toolDescriptions = {
  'base64-encoder': ['Base64 Encoder & Decoder', 'The Base64 Encoder & Decoder is a browser-based utility that converts plain text into Base64 encoding and vice versa. Base64 is commonly used for encoding binary data in email attachments, JSON Web Tokens, data URLs, and API payloads. This tool helps developers quickly encode or decode Base64 strings without needing any external library.'],
  'case-converter': ['Case Converter', 'The Case Converter is a text transformation utility that switches text between multiple formats including UPPERCASE, lowercase, Title Case, camelCase, snake_case, and kebab-case. Developers and writers use it for formatting variable names, headers, and content quickly without manually retyping.'],
  'color-converter': ['Color Converter', 'The Color Converter is a utility that transforms color values between HEX, RGB, HSL, and other formats. Designers and front-end developers use this tool to quickly find equivalent color codes when working across CSS, design tools, and graphics software.'],
  'checksum-calculator': ['Checksum Calculator', 'The Checksum Calculator generates cryptographic hashes (SHA-256, SHA-512, SHA-1) and simple checksums from any text. It is widely used for verifying file integrity, digital signatures, blockchain development, and detecting accidental data corruption.'],
  'csp-header-builder-and-validator': ['CSP Header Builder', 'The CSP Header Builder & Validator helps developers construct Content Security Policy headers to prevent XSS attacks, clickjacking, and code injection. It validates your directives and outputs a production-ready header string.'],
  'curl-to-fetch-and-axios-converter': ['cURL to Fetch & Axios Converter', 'This tool translates cURL commands into equivalent JavaScript code using the Fetch API and Axios library. It is essential for front-end developers who copy API examples from documentation and need them in modern JavaScript.'],
  'curl-to-python-requests-converter': ['cURL to Python Requests Converter', 'This tool converts cURL commands into clean Python code using the requests library. It extracts URLs, headers, HTTP methods, and request bodies automatically so developers can quickly integrate APIs into Python scripts.'],
  'hash-generator': ['Cryptographic Hash Generator', 'The Cryptographic Hash Generator produces MD5, SHA-256, and SHA-512 hashes from any text input. It is commonly used for password storage verification, data integrity checks, blockchain applications, and digital fingerprinting.'],
  'hmac-generator': ['HMAC Signature Generator', 'The HMAC Signature Generator creates Hash-based Message Authentication Codes using SHA-256, SHA-384, or SHA-512. HMAC is used in API authentication, JWT signing, and secure data transmission between services.'],
  'html-encoder-decoder': ['HTML Encoder & Decoder', 'The HTML Encoder & Decoder safely converts special characters like <, >, &, and quotes into their corresponding HTML entities, and vice versa. It prevents XSS vulnerabilities and ensures safe rendering of user-generated content.'],
  'image-resizer': ['Image Resizer & Compressor', 'The Image Resizer lets you resize, compress, and convert images directly in your browser without uploading them anywhere. It supports PNG, JPG, and WEBP formats and uses HTML5 Canvas for hardware-accelerated processing.'],
  'json-formatter': ['JSON Formatter & Validator', 'The JSON Formatter & Validator beautifies raw or minified JSON and detects syntax errors with precise feedback. Developers use it daily for debugging API responses and cleaning up configuration files.'],
  'json-to-go-struct-generator': ['JSON to Go Struct Generator', 'This tool converts JSON objects into Go struct definitions with proper field names and json tags. It saves backend Go developers from manually writing struct types for API responses.'],
  'json-to-pydantic-&-python-dataclass-generator': ['JSON to Pydantic Generator', 'The JSON to Pydantic & Dataclass Generator converts JSON objects into Python Pydantic BaseModel classes. It is used for FastAPI development, data validation, and typed API integrations.'],
  'json-to-typescript-interface-generator': ['JSON to TypeScript Interface Generator', 'This tool converts JSON objects into TypeScript interfaces with proper typing. Front-end developers use it to quickly add types to API responses in React, Vue, and Angular applications.'],
  'json-to-zod-schema-generator': ['JSON to Zod Schema Generator', 'The JSON to Zod Schema Generator creates Zod validation schemas from JSON objects. It is used for runtime type checking and form validation in modern TypeScript applications.'],
  'json-yaml-converter': ['JSON to YAML Converter', 'The JSON to YAML Converter transforms data between JSON and YAML formats. YAML is preferred in DevOps tools like Kubernetes, Docker Compose, and GitHub Actions for its human-readable syntax.'],
  'jwt-decoder-&-inspector': ['JWT Decoder & Inspector', 'The JWT Decoder & Inspector decodes JSON Web Tokens and displays their header, payload, and signature in readable JSON format. It is used for debugging authentication and authorization flows.'],
  'lorem-ipsum': ['Lorem Ipsum Generator', 'The Lorem Ipsum Generator produces placeholder text for designs, mockups, and layout testing. Designers use it to fill space with realistic-looking content before real copy is available.'],
  'markdown-to-html-live-converter': ['Markdown to HTML Live Converter', 'The Markdown to HTML Converter transforms Markdown syntax into clean HTML in real-time. It supports headings, bold, italics, code blocks, links, and lists. Perfect for bloggers, developers, and technical writers.'],
  'mime-type-lookup-and-extension-finder': ['MIME Type Lookup', 'The MIME Type Lookup & Extension Finder provides instant reference for file extensions and their corresponding MIME types. It helps developers configure web servers, APIs, and upload handlers correctly.'],
  'nanoid-generator': ['NanoID Generator', 'The NanoID Generator creates compact, URL-friendly unique identifiers using cryptographically secure randomness. NanoID is a smaller, faster alternative to UUID for modern applications.'],
  'password-generator': ['Password Generator', 'The Password Generator creates random passwords with customizable length and character sets. It helps users create strong credentials for accounts and services.'],
  'qr-code-generator': ['QR Code Generator', 'The QR Code Generator creates scannable QR codes from text, URLs, or any data. QR codes are widely used in marketing, payments, and contactless information sharing.'],
  'regex-tester': ['RegEx Tester', 'The RegEx Tester helps developers test regular expressions against sample text with real-time matching. It supports flags, groups, and pattern highlighting.'],
  'secure-password-generator': ['Secure Password Generator', 'The Secure Password Generator creates cryptographically strong passwords using Web Crypto API. It supports custom length, character sets, and exclude-similar options.'],
  'systemd-service-file-generator': ['Systemd Service File Generator', 'The Systemd Service File Generator creates ready-to-use .service files for Linux systemd. It helps DevOps engineers quickly deploy Node.js, Python, and other applications as background services.'],
  'text-diff-checker': ['Text Difference Checker', 'The Text Diff Checker compares two text blocks and highlights differences. It is useful for code review, document editing, and tracking changes.'],
  'ulid-generator-and-parser': ['ULID Generator & Parser', 'The ULID Generator & Parser produces Universally Unique Lexicographically Sortable Identifiers and parses existing ones. ULIDs are ideal for databases where sortable IDs matter.'],
  'unix-timestamp-converter': ['Unix Timestamp Converter', 'The Unix Timestamp Converter transforms Unix timestamps into human-readable dates, ISO 8601 format, and vice versa. It supports live current-time tracking and date pickers.'],
  'url-encoder-decoder': ['URL Encoder & Decoder', 'The URL Encoder & Decoder converts URLs and special characters to percent-encoded format and back. It is essential for handling query strings, form submissions, and API paths correctly.'],
  'url-parser-and-query-string-extractor': ['URL Parser & Query Extractor', 'The URL Parser deconstructs URLs into protocol, host, path, and query parameters. It helps developers debug routing and inspect tracking parameters.'],
  'user-agent-parser': ['User-Agent Parser', 'The User-Agent Parser analyzes browser User-Agent strings to extract browser name, version, operating system, device type, and rendering engine.'],
  'uuid-generator': ['UUID v4 Generator', 'The UUID v4 Generator creates cryptographically random Version 4 Universally Unique Identifiers. UUIDs are used for database keys, session IDs, and distributed systems.']
};

const items = fs.readdirSync(toolsDir);
let added = 0;
let skipped = 0;

items.forEach(folder => {
  const itemPath = path.join(toolsDir, folder);
  if (!fs.statSync(itemPath).isDirectory()) return;

  const pagePath = path.join(itemPath, 'page.tsx');
  if (!fs.existsSync(pagePath)) return;

  let content = fs.readFileSync(pagePath, 'utf8');

  // Skip if already has visible SEO content
  if (content.includes('What is a ') && content.includes('Frequently Asked Questions')) {
    console.log('Skipped (has visible SEO): ' + folder);
    skipped++;
    return;
  }

  const meta = toolDescriptions[folder];
  if (!meta) {
    console.log('No description for: ' + folder);
    return;
  }

  const seoSection = buildSEOSection(meta[0], meta[1]);

  // Find feedback section to insert before it
  const feedbackPatterns = [
    '{/* Single Feedback Section',
    'Got Feedback or Feature Requests'
  ];

  let insertIdx = -1;
  for (const p of feedbackPatterns) {
    const idx = content.indexOf(p);
    if (idx !== -1) {
      // Find the div/comment start
      let startIdx = content.lastIndexOf('<div', idx);
      if (startIdx === -1) startIdx = content.lastIndexOf('{/*', idx);
      if (startIdx !== -1) {
        insertIdx = startIdx;
        break;
      }
    }
  }

  if (insertIdx === -1) {
    console.log('Could not find insertion point: ' + folder);
    return;
  }

  content = content.slice(0, insertIdx) + seoSection + content.slice(insertIdx);
  fs.writeFileSync(pagePath, content, 'utf8');
  console.log('Added visible SEO: ' + folder);
  added++;
});

console.log('\n✅ Total added: ' + added);
console.log('⏭️  Total skipped: ' + skipped);