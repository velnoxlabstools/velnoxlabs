const fs = require('fs');
const path = require('path');
const toolsDir = path.join(__dirname, 'src', 'app', 'tools');

const toolsWithoutSEO = [
  'checksum-calculator',
  'csp-header-builder-and-validator',
  'curl-to-fetch-and-axios-converter',
  'json-to-zod-schema-generator',
  'json-yaml-converter',
  'lorem-ipsum',
  'markdown-to-html-live-converter',
  'mime-type-lookup-and-extension-finder',
  'nanoid-generator',
  'secure-password-generator',
  'systemd-service-file-generator',
  'ulid-generator-and-parser',
  'unix-timestamp-converter',
  'url-parser-and-query-string-extractor',
  'user-agent'
];

const toolMeta = {
  'checksum-calculator': { name: 'Checksum Calculator', desc: 'Calculate cryptographic hashes instantly in your browser.' },
  'csp-header-builder-and-validator': { name: 'CSP Header Builder', desc: 'Build and validate Content Security Policy headers securely.' },
  'curl-to-fetch-and-axios-converter': { name: 'cURL to Fetch & Axios Converter', desc: 'Translate cURL commands into JavaScript code instantly.' },
  'json-to-zod-schema-generator': { name: 'JSON to Zod Schema Generator', desc: 'Generate Zod validation schemas from JSON objects instantly.' },
  'json-yaml-converter': { name: 'JSON to YAML Converter', desc: 'Convert between JSON and YAML formats instantly.' },
  'lorem-ipsum': { name: 'Lorem Ipsum Generator', desc: 'Generate placeholder lorem ipsum text instantly.' },
  'markdown-to-html-live-converter': { name: 'Markdown to HTML Converter', desc: 'Convert Markdown text to HTML in real-time.' },
  'mime-type-lookup-and-extension-finder': { name: 'MIME Type Lookup', desc: 'Find MIME types and file extensions instantly.' },
  'nanoid-generator': { name: 'NanoID Generator', desc: 'Generate compact, URL-friendly unique identifiers.' },
  'secure-password-generator': { name: 'Secure Password Generator', desc: 'Generate cryptographically secure passwords.' },
  'systemd-service-file-generator': { name: 'Systemd Service File Generator', desc: 'Create Linux systemd service files instantly.' },
  'ulid-generator-and-parser': { name: 'ULID Generator & Parser', desc: 'Generate and parse ULIDs instantly.' },
  'unix-timestamp-converter': { name: 'Unix Timestamp Converter', desc: 'Convert Unix timestamps to human-readable dates.' },
  'url-parser-and-query-string-extractor': { name: 'URL Parser & Query Extractor', desc: 'Deconstruct URLs into components and query params.' },
  'user-agent': { name: 'User-Agent Parser', desc: 'Parse User-Agent strings to extract browser info.' }
};

let fixed = 0;

toolsWithoutSEO.forEach(folder => {
  const pagePath = path.join(toolsDir, folder, 'page.tsx');
  if (!fs.existsSync(pagePath)) return;

  let content = fs.readFileSync(pagePath, 'utf8');
  if (content.includes('application/ld+json')) {
    console.log('Skipped (has SEO): ' + folder);
    return;
  }

  const meta = toolMeta[folder];
  if (!meta) return;

  const schema = '{\n' +
    '        "@context": "https://schema.org",\n' +
    '        "@type": "SoftwareApplication",\n' +
    '        "name": "VelnoxLabs ' + meta.name + '",\n' +
    '        "operatingSystem": "All",\n' +
    '        "applicationCategory": "DeveloperApplication",\n' +
    '        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },\n' +
    '        "description": "' + meta.desc + '"\n' +
    '      }';

  const scriptBlock = '      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(' + schema + ') }} />\n';

  const returnIdx = content.indexOf('return (');
  if (returnIdx === -1) return;
  const fragIdx = content.indexOf('<>', returnIdx);
  if (fragIdx === -1) return;

  const insertIdx = fragIdx + 2;
  content = content.slice(0, insertIdx) + '\n' + scriptBlock + content.slice(insertIdx);

  fs.writeFileSync(pagePath, content, 'utf8');
  console.log('Added SEO: ' + folder);
  fixed++;
});

console.log('\nTotal SEO added: ' + fixed);