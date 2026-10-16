'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

const WORDS =
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(
    ' '
  );

function generateLorem(paragraphs: number) {
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
  return result.join('\n\n');
}

export default function LoremIpsumPage() {
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  // Auto-generate on count change
  useEffect(() => {
    setOutput(generateLorem(count));
  }, [count]);

  const handleGenerate = () => {
    setOutput(generateLorem(count));
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCountChange = (val: string) => {
    const num = parseInt(val);
    if (!isNaN(num)) {
      setCount(Math.min(20, Math.max(1, num)));
    } else if (val === '') {
      setCount(1);
    }
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'VelnoxLabs Lorem Ipsum Generator',
        operatingSystem: 'All',
        applicationCategory: 'DeveloperApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Generate placeholder lorem ipsum text instantly for designs, mockups, and layouts.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How to generate Lorem Ipsum text online?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Enter the number of paragraphs (1-20) and the tool instantly generates placeholder text.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is the Lorem Ipsum generator free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, 100% free with client-side generation and no tracking.',
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
            title="Lorem Ipsum Generator"
            subtitle="Generate placeholder text for your designs and layouts instantly."
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
            {/* Controls Row */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-end',
                flexWrap: 'wrap',
                marginBottom: '20px',
              }}
            >
              <div style={{ flex: '1', minWidth: '150px' }}>
                <label
                  style={{
                    color: '#fff',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  Paragraphs (1-20):
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={count}
                  onChange={(e) => handleCountChange(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    padding: '10px',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>
              <button
                onClick={handleGenerate}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Regenerate
              </button>
              <button
                onClick={handleCopy}
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Output */}
            <textarea
              value={output}
              readOnly
              rows={14}
              placeholder="Generated Lorem Ipsum will appear here..."
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

          <ToolSeoContent toolSlug="lorem-ipsum" toolName="Lorem Ipsum Generator" />
        </div>
      </GlobalContainer>
    </>
  );
}
