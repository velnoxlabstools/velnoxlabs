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
    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl mt-12">
      <h3 className="text-xl font-bold text-white mb-2">{t('feedbackTitle')}</h3>
      <p className="text-slate-400 mb-6 text-sm">{t('feedbackSubtitle')}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder={t('feedbackPlaceholder')}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-slate-600 text-sm resize-none"
        />
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-xl transition text-sm"
        >
          {feedbackSent ? t('feedbackSent') : t('feedbackSubmit')}
        </button>
      </form>
    </div>
  );
}
