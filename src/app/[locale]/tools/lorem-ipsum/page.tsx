'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
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
  const tUI = useTranslations('ToolUI.loremIpsum');
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

  return (
    <>
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

          {/* ========== TOOL UI ========== */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
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
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  {tUI('paragraphs')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={count}
                  onChange={(e) => handleCountChange(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
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
                {tUI('regenerate')}
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
                {copied ? tUI('copied') : tUI('copy')}
              </button>
            </div>

            {/* Output */}
            <textarea
              value={output}
              readOnly
              rows={14}
              placeholder={tUI('outputPlaceholder')}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
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

          <ToolSeoContent
            toolSlug="lorem-ipsum"
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
    </>
  );
}
