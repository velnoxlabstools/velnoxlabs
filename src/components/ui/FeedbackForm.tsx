'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

export function FeedbackForm() {
  const t = useTranslations('ToolCommon');
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setFeedbackSent(true);
    setFeedback('');
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '32px',
        marginTop: '48px',
      }}
    >
      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          marginBottom: '8px',
        }}
      >
        {t('feedbackTitle')}
      </h3>
      <p
        style={{
          color: 'var(--text-muted)',
          marginBottom: '24px',
          fontSize: '0.875rem',
        }}
      >
        {t('feedbackSubtitle')}
      </p>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <textarea
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder={t('feedbackPlaceholder')}
          style={{
            width: '100%',
            backgroundColor: 'var(--bg-page)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '16px',
            color: 'var(--text-main)',
            fontSize: '0.875rem',
            resize: 'none',
            outline: 'none',
          }}
          className="focus:border-emerald-500 placeholder:text-[var(--text-muted)]"
        />
        <div>
          <button
            type="submit"
            style={{
              backgroundColor: '#059669',
              color: '#ffffff',
              fontWeight: 600,
              padding: '10px 24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              transition: 'all 0.2s ease',
            }}
            className="hover:opacity-90 active:scale-95"
          >
            {feedbackSent ? t('feedbackSent') : t('feedbackSubmit')}
          </button>
        </div>
      </form>
    </div>
  );
}
