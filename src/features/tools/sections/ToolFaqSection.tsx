'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTool } from '../ToolProvider';

interface FaqItem {
  question: string;
  answer: string;
}

export function ToolFaqSection() {
  const { tool } = useTool();
  const t = useTranslations('ToolFaq');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] =
    tool?.slug === 'user-agent-parser'
      ? [
          { question: t('userAgentParser.q1'), answer: t('userAgentParser.a1') },
          { question: t('userAgentParser.q2'), answer: t('userAgentParser.a2') },
          { question: t('userAgentParser.q3'), answer: t('userAgentParser.a3') },
          { question: t('userAgentParser.q4'), answer: t('userAgentParser.a4') },
        ]
      : [{ question: t('generic.q1'), answer: t('generic.a1') }];

  return (
    <div style={{ marginTop: 'var(--space-8)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: 'var(--space-4)',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
          {t('heading')}
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
