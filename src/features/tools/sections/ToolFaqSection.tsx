'use client';

import React, { useState } from 'react';
import { useTool } from '../ToolProvider';

interface FaqItem {
  question: string;
  answer: string;
}

const UA_FAQS: FaqItem[] = [
  {
    question: 'What information does a User-Agent string contain?',
    answer:
      'A User-Agent string provides details regarding the client browser application, rendering engine, operating system platform, CPU architecture, and device form factor.',
  },
  {
    question: 'Can this parser differentiate human browsers from bots and AI scrapers?',
    answer:
      'Yes. The parser maintains signature patterns for search engine bots (Googlebot, Bingbot), social crawlers, and AI scraping agents (OpenAI GPTBot, ClaudeBot, PerplexityBot, ByteDance ByteSpider).',
  },
  {
    question: 'Is my User-Agent string sent to any external server?',
    answer:
      'No. The parsing engine executes 100% locally inside your browser memory without sending data to external APIs.',
  },
  {
    question: 'What does RFC compliant mean for a User-Agent?',
    answer:
      'RFC 7231 specifies that HTTP user agents should begin with product identifier tokens (like Mozilla/5.0) and maintain clean token formatting without illegal characters.',
  },
];

const DEFAULT_FAQS: FaqItem[] = [
  {
    question: 'Is this utility free to use?',
    answer: 'Yes, all VelnoxLabs utility tools are completely free, client-side, and open.',
  },
];

export function ToolFaqSection() {
  const { tool } = useTool();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = tool?.slug === 'user-agent-parser' ? UA_FAQS : DEFAULT_FAQS;

  return (
    <div style={{ marginTop: 'var(--space-8)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
          Frequently Asked Questions
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              style={{
                backgroundColor: '#090d16',
                border: '1px solid #1e293b',
                borderRadius: '10px',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  background: 'none',
                  border: 'none',
                  color: '#f8fafc',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span>{faq.question}</span>
                <span style={{ color: isOpen ? '#38bdf8' : '#64748b', fontSize: '12px' }}>
                  {isOpen ? '▲' : '▼'}
                </span>
              </button>
              {isOpen && (
                <div
                  style={{
                    padding: '0 18px 16px',
                    fontSize: '13px',
                    color: '#94a3b8',
                    lineHeight: 1.6,
                    borderTop: '1px solid #1e293b',
                    paddingTop: '12px',
                  }}
                >
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}