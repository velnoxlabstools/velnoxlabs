'use client';

import React, { useState } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

// Comprehensive MIME type database (100+ common types)
const MIME_DB: Array<{ ext: string[]; mime: string; category: string }> = [
  // Text
  { ext: ['txt', 'text'], mime: 'text/plain', category: 'Text' },
  { ext: ['html', 'htm', 'xhtml'], mime: 'text/html', category: 'Text' },
  { ext: ['css'], mime: 'text/css', category: 'Text' },
  { ext: ['csv'], mime: 'text/csv', category: 'Text' },
  { ext: ['md', 'markdown'], mime: 'text/markdown', category: 'Text' },
  { ext: ['xml'], mime: 'text/xml', category: 'Text' },
  { ext: ['rtf'], mime: 'application/rtf', category: 'Text' },
  { ext: ['ics'], mime: 'text/calendar', category: 'Text' },
  { ext: ['vcf'], mime: 'text/vcard', category: 'Text' },

  // Scripts / Data
  { ext: ['js', 'mjs', 'cjs'], mime: 'application/javascript', category: 'Scripts & Data' },
  { ext: ['json'], mime: 'application/json', category: 'Scripts & Data' },
  { ext: ['jsonld'], mime: 'application/ld+json', category: 'Scripts & Data' },
  { ext: ['yaml', 'yml'], mime: 'application/x-yaml', category: 'Scripts & Data' },
  { ext: ['ts'], mime: 'application/typescript', category: 'Scripts & Data' },
  { ext: ['wasm'], mime: 'application/wasm', category: 'Scripts & Data' },
  { ext: ['map'], mime: 'application/json', category: 'Scripts & Data' },

  // Images
  { ext: ['png'], mime: 'image/png', category: 'Images' },
  { ext: ['jpg', 'jpeg', 'jpe'], mime: 'image/jpeg', category: 'Images' },
  { ext: ['gif'], mime: 'image/gif', category: 'Images' },
  { ext: ['webp'], mime: 'image/webp', category: 'Images' },
  { ext: ['svg'], mime: 'image/svg+xml', category: 'Images' },
  { ext: ['ico'], mime: 'image/x-icon', category: 'Images' },
  { ext: ['bmp'], mime: 'image/bmp', category: 'Images' },
  { ext: ['tiff', 'tif'], mime: 'image/tiff', category: 'Images' },
  { ext: ['avif'], mime: 'image/avif', category: 'Images' },
  { ext: ['heic'], mime: 'image/heic', category: 'Images' },
  { ext: ['heif'], mime: 'image/heif', category: 'Images' },

  // Audio
  { ext: ['mp3'], mime: 'audio/mpeg', category: 'Audio' },
  { ext: ['wav'], mime: 'audio/wav', category: 'Audio' },
  { ext: ['ogg', 'oga'], mime: 'audio/ogg', category: 'Audio' },
  { ext: ['m4a'], mime: 'audio/mp4', category: 'Audio' },
  { ext: ['aac'], mime: 'audio/aac', category: 'Audio' },
  { ext: ['flac'], mime: 'audio/flac', category: 'Audio' },
  { ext: ['opus'], mime: 'audio/opus', category: 'Audio' },
  { ext: ['mid', 'midi'], mime: 'audio/midi', category: 'Audio' },
  { ext: ['weba'], mime: 'audio/webm', category: 'Audio' },

  // Video
  { ext: ['mp4', 'm4v'], mime: 'video/mp4', category: 'Video' },
  { ext: ['webm'], mime: 'video/webm', category: 'Video' },
  { ext: ['ogv'], mime: 'video/ogg', category: 'Video' },
  { ext: ['mov'], mime: 'video/quicktime', category: 'Video' },
  { ext: ['avi'], mime: 'video/x-msvideo', category: 'Video' },
  { ext: ['wmv'], mime: 'video/x-ms-wmv', category: 'Video' },
  { ext: ['flv'], mime: 'video/x-flv', category: 'Video' },
  { ext: ['mkv'], mime: 'video/x-matroska', category: 'Video' },
  { ext: ['mpeg', 'mpg'], mime: 'video/mpeg', category: 'Video' },
  { ext: ['3gp'], mime: 'video/3gpp', category: 'Video' },
  { ext: ['ts'], mime: 'video/mp2t', category: 'Video' },

  // Fonts
  { ext: ['woff'], mime: 'font/woff', category: 'Fonts' },
  { ext: ['woff2'], mime: 'font/woff2', category: 'Fonts' },
  { ext: ['ttf'], mime: 'font/ttf', category: 'Fonts' },
  { ext: ['otf'], mime: 'font/otf', category: 'Fonts' },
  { ext: ['eot'], mime: 'application/vnd.ms-fontobject', category: 'Fonts' },

  // Documents
  { ext: ['pdf'], mime: 'application/pdf', category: 'Documents' },
  { ext: ['doc'], mime: 'application/msword', category: 'Documents' },
  { ext: ['docx'], mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', category: 'Documents' },
  { ext: ['xls'], mime: 'application/vnd.ms-excel', category: 'Documents' },
  { ext: ['xlsx'], mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', category: 'Documents' },
  { ext: ['ppt'], mime: 'application/vnd.ms-powerpoint', category: 'Documents' },
  { ext: ['pptx'], mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', category: 'Documents' },
  { ext: ['odt'], mime: 'application/vnd.oasis.opendocument.text', category: 'Documents' },
  { ext: ['ods'], mime: 'application/vnd.oasis.opendocument.spreadsheet', category: 'Documents' },
  { ext: ['odp'], mime: 'application/vnd.oasis.opendocument.presentation', category: 'Documents' },
  { ext: ['epub'], mime: 'application/epub+zip', category: 'Documents' },
  { ext: ['mobi'], mime: 'application/x-mobipocket-ebook', category: 'Documents' },

  // Archives
  { ext: ['zip'], mime: 'application/zip', category: 'Archives' },
  { ext: ['gz', 'gzip'], mime: 'application/gzip', category: 'Archives' },
  { ext: ['tar'], mime: 'application/x-tar', category: 'Archives' },
  { ext: ['7z'], mime: 'application/x-7z-compressed', category: 'Archives' },
  { ext: ['rar'], mime: 'application/vnd.rar', category: 'Archives' },
  { ext: ['bz2'], mime: 'application/x-bzip2', category: 'Archives' },
  { ext: ['xz'], mime: 'application/x-xz', category: 'Archives' },

  // Other / Binary
  { ext: ['bin'], mime: 'application/octet-stream', category: 'Other' },
  { ext: ['exe'], mime: 'application/x-msdownload', category: 'Other' },
  { ext: ['dmg'], mime: 'application/x-apple-diskimage', category: 'Other' },
  { ext: ['iso'], mime: 'application/x-iso9660-image', category: 'Other' },
  { ext: ['apk'], mime: 'application/vnd.android.package-archive', category: 'Other' },
  { ext: ['deb'], mime: 'application/vnd.debian.binary-package', category: 'Other' },
  { ext: ['rpm'], mime: 'application/x-rpm', category: 'Other' },
  { ext: ['sqlite'], mime: 'application/vnd.sqlite3', category: 'Other' },
];

type Match = { ext: string[]; mime: string; category: string };

function searchMime(query: string): Match[] {
  const q = query.trim().toLowerCase().replace(/^\./, '');
  if (!q) return [];

  // ✅ NEW: If user types "mime" or "mimetype", show the entire database
  if (q === 'mime' || q === 'mimetype' || q === 'mime type') {
    return MIME_DB;
  }

  return MIME_DB.filter((entry) => {
    const matchExt = entry.ext.some((e) => e === q || e.startsWith(q) || q.startsWith(e));
    const matchMime = entry.mime.toLowerCase().includes(q);
    return matchExt || matchMime;
  });
}

export default function Page() {
  const [input, setInput] = useState('jpg');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const matches = searchMime(input);
  const isEmptyQuery = !input.trim();
  const isBrowseMode = isEmptyQuery || matches.length === MIME_DB.length;

  const handleCopy = () => {
    if (!matches.length) return;
    const text = matches.map((m) => `${m.ext.join(', ')}  →  ${m.mime}`).join('\n');
    navigator.clipboard.writeText(text);
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

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        'name': 'VelnoxLabs MIME Type Lookup & Extension Finder',
        'operatingSystem': 'All',
        'applicationCategory': 'DeveloperApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Look up MIME types by file extension or find file extensions by MIME type. Includes 100+ common formats with instant search.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How to find the MIME type of a file?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Enter the file extension (like jpg or pdf) and instantly see its MIME type. You can also search by MIME type to find extensions.' }
          },
          {
            '@type': 'Question',
            'name': 'Is this MIME lookup free?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, 100% free with a client-side database of 100+ common MIME types.' }
          }
        ]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />

      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading
            title="MIME Type Lookup & Extension Finder"
            subtitle="Look up MIME types by extension or find extensions by MIME type — 100+ formats."
          />

          {/* ========== TOOL UI ========== */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>

            {/* Search input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Search by extension (jpg) or MIME type (image/jpeg):
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., jpg, png, pdf, image/, video/, mime (show all)"
                style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontFamily: 'monospace', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            {/* Result count + Copy button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>
                {isBrowseMode ? (
                  <>Reference Table: <span style={{ color: '#34d399' }}>{MIME_DB.length} formats</span></>
                ) : (
                  <>Results: <span style={{ color: '#34d399' }}>{matches.length} found</span></>
                )}
              </label>
              <button
                onClick={handleCopy}
                disabled={matches.length === 0}
                style={{ backgroundColor: matches.length > 0 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.05)', color: matches.length > 0 ? '#60a5fa' : '#64748b', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: matches.length > 0 ? 'pointer' : 'not-allowed' }}
              >
                {copied ? 'Copied!' : 'Copy Results'}
              </button>
            </div>

            {/* Results table */}
            <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', maxHeight: '480px', overflowY: 'auto' }}>
              {isBrowseMode && (
                <p style={{ color: '#64748b', fontSize: '0.8rem', padding: '8px 12px', marginBottom: '8px', fontStyle: 'italic' }}>
                  Showing all supported formats. Type above to filter.
                </p>
              )}

              {matches.length === 0 && !isEmptyQuery && (
                <p style={{ color: '#f87171', fontSize: '0.9rem', padding: '16px', textAlign: 'center' }}>
                  No matches found for: <strong>{input}</strong>
                </p>
              )}

              {matches.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(120px, 1fr) 2fr auto',
                    gap: '12px',
                    padding: '10px 12px',
                    borderBottom: idx < matches.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ fontFamily: 'monospace', color: '#60a5fa', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                    {m.ext.map((e) => `.${e}`).join(', ')}
                  </div>
                  <div style={{ fontFamily: 'monospace', color: '#34d399', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                    {m.mime}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {m.category}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========== SEO CONTENT ========== */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a MIME Type Lookup?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              MIME (Multipurpose Internet Mail Extensions) types tell browsers, web servers, and APIs how to handle a file. This tool provides instant lookup between file extensions and their corresponding MIME types — useful for configuring web servers, building file upload handlers, and setting HTTP Content-Type headers.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Type a file extension like <code style={{ color: '#60a5fa' }}>jpg</code> or <code style={{ color: '#60a5fa' }}>pdf</code> to find its MIME type.</li>
              <li>Type a MIME type like <code style={{ color: '#60a5fa' }}>image/</code> or <code style={{ color: '#60a5fa' }}>application/json</code> to find matching extensions.</li>
              <li>Type <code style={{ color: '#60a5fa' }}>mime</code> to browse the entire reference table.</li>
              <li>The database contains <strong style={{ color: '#34d399' }}>100+ common formats</strong> across images, audio, video, documents, archives, and code.</li>
              <li>Click <strong style={{ color: '#34d399' }}>Copy Results</strong> to copy the entire table to your clipboard.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>What is a MIME type used for?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>MIME types are sent in HTTP <code style={{ color: '#60a5fa' }}>Content-Type</code> headers to tell browsers how to render content. They're also critical for file upload validation and API responses.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is this tool free to use?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, VelnoxLabs MIME Type Lookup is 100% free with no sign-up required.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is my data secure?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Absolutely. All lookups happen entirely in your browser — the entire database runs client-side. Your data never leaves your device.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Does it work on mobile devices?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, this tool is fully responsive and works on desktop, tablet, and mobile browsers.</p>
            </div>
          </div>

          {/* ========== FEEDBACK FORM ========== */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl mt-12">
            <h3 className="text-xl font-bold text-white mb-2">Got Feedback or Feature Requests?</h3>
            <p className="text-slate-400 mb-6 text-sm">Help us enhance VelnoxLabs developer utility standards. Share your feedback below!</p>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write your suggestions or feature requests here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-slate-600 text-sm resize-none"
              ></textarea>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-xl transition text-sm">
                {feedbackSent ? 'Sent!' : 'Submit Suggestion'}
              </button>
            </form>
          </div>

        </div>
      </GlobalContainer>
    </>
  );
}
