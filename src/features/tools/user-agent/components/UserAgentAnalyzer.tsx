'use client';

import React, { useState } from 'react';
import { UAParserProvider, useUAParser } from '../context/UAParserContext';
import { NavTabs } from './NavTabs';
import { UAParseInput } from './LiveParser/UAParseInput';
import { HumanSummaryCard } from './LiveParser/HumanSummaryCard';
import { TechnicalBreakdown } from './LiveParser/TechnicalBreakdown';
import { BrowserCapabilities } from './LiveParser/BrowserCapabilities';
import { ValidationAlerts } from './LiveParser/ValidationAlerts';
import { UACompareView } from './Comparison/UACompareView';
import { UABatchView } from './BatchParser/UABatchView';
import { UAAnalyticsView } from './Analytics/UAAnalyticsView';
import { UAHistoryView } from './History/UAHistoryView';
import { PresetModal } from './Modals/PresetModal';
import { ExportModal } from './Modals/ExportModal';
import { KeyboardShortcutsModal } from './Modals/KeyboardShortcutsModal';
import {
  Globe,
  Sparkles,
  Download,
  Keyboard,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';

const MainToolContent: React.FC = () => {
  const {
    activeTab,
    openExportModal,
    setIsShortcutsOpen,
    setIsPresetSelectorOpen,
    theme,
    toggleTheme,
    toast,
  } = useUAParser();

  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setFeedbackSent(true);
    setFeedback('');
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "SoftwareApplication",
            "name": "VelnoxLabs User-Agent Parser & Analyzer",
            "operatingSystem": "All",
            "applicationCategory": "DeveloperApplication",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            "description": "Deep User-Agent parser, bot detector, device fingerprint inspector, batch processor, and comparison tool."
          },
          {
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is a User-Agent string?",
                "acceptedAnswer": { "@type": "Answer", "text": "A User-Agent string is a line of text sent by a web browser or bot with every HTTP request. It identifies the client's browser, operating system, device type, and rendering engine." }
              },
              {
                "@type": "Question",
                "name": "Can I detect bots and AI scrapers?",
                "acceptedAnswer": { "@type": "Answer", "text": "Yes. This tool identifies common bot/crawler User-Agents including search engine bots (Googlebot, Bingbot), AI scrapers (GPTBot, ClaudeBot), social media preview bots, and monitoring services." }
              },
              {
                "@type": "Question",
                "name": "Is my data secure?",
                "acceptedAnswer": { "@type": "Answer", "text": "Absolutely. All parsing and analysis happens entirely in your browser using client-side JavaScript." }
              }
            ]
          }
        ]
      }) }} />

      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans pb-16 antialiased selection:bg-cyan-500 selection:text-white">
        {/* Header Bar */}
        <header className="border-b border-slate-200 bg-white/70 dark:border-slate-800/80 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-linear-to-tr from-cyan-600 to-blue-600 shadow-md shadow-cyan-500/20">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    User-Agent Parser & Analyzer
                  </h1>
                  <span className="text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/80 px-2 py-0.5 rounded-full">
                    RFC 9110
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Deep browser telemetry, hardware, bot & AI scraper analysis
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <NavTabs />

          {activeTab === 'live' && (
            <div className="space-y-6 animate-fade-in">
              <UAParseInput />
              <HumanSummaryCard />
              <TechnicalBreakdown />
              <BrowserCapabilities />
              <ValidationAlerts />
            </div>
          )}

          {activeTab === 'compare' && (
            <div className="animate-fade-in">
              <UACompareView />
            </div>
          )}

          {activeTab === 'batch' && (
            <div className="animate-fade-in">
              <UABatchView />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="animate-fade-in">
              <UAAnalyticsView />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="animate-fade-in">
              <UAHistoryView />
            </div>
          )}

          {/* Visible SEO Content */}
          <div className="mt-12 bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">What is a User-Agent Parser?</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              A User-Agent Parser is a developer tool that decodes the User-Agent string sent by browsers and bots in every HTTP request. The User-Agent string contains valuable metadata including browser name and version, operating system, device type (desktop, mobile, tablet), rendering engine, CPU architecture, and even bot/crawler identity. This tool helps developers debug analytics, implement adaptive experiences, detect scrapers, and understand their incoming traffic at a granular level.
            </p>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 mt-6">How to Use This Tool</h3>
            <ul className="text-slate-600 dark:text-slate-400 leading-loose pl-5 mb-6 list-disc">
              <li>Paste any User-Agent string into the input field, or use a preset example.</li>
              <li>View the human-readable summary at the top for quick identification.</li>
              <li>Explore the technical breakdown matrix for browser, OS, device, and engine data.</li>
              <li>Switch to <strong className="text-cyan-600 dark:text-cyan-400">Compare</strong>, <strong className="text-cyan-600 dark:text-cyan-400">Batch</strong>, or <strong className="text-cyan-600 dark:text-cyan-400">Analytics</strong> tabs for advanced workflows.</li>
            </ul>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 mt-6">Frequently Asked Questions</h3>

            <div className="mb-4">
              <h4 className="text-base font-semibold text-cyan-600 dark:text-cyan-400 mb-1">What is a User-Agent string?</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">A User-Agent string is a line of text sent by a web browser or bot with every HTTP request. It identifies the client's browser, operating system, device type, and rendering engine to help servers respond appropriately.</p>
            </div>

            <div className="mb-4">
              <h4 className="text-base font-semibold text-cyan-600 dark:text-cyan-400 mb-1">Can I detect bots and AI scrapers?</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Yes. This tool identifies common bot/crawler User-Agents including search engine bots (Googlebot, Bingbot), AI scrapers (GPTBot, ClaudeBot), social media preview bots, and monitoring services.</p>
            </div>

            <div className="mb-4">
              <h4 className="text-base font-semibold text-cyan-600 dark:text-cyan-400 mb-1">Is my data secure?</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Absolutely. All parsing and analysis happens entirely in your browser using client-side JavaScript. Your User-Agent strings are never sent to any server.</p>
            </div>
          </div>

          {/* Feedback Form */}
          <div className="mt-8 bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Got Feedback or Feature Requests?</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">Help us enhance VelnoxLabs developer utility standards. Share your feedback below!</p>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write your suggestions or feature requests here..."
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-4 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500 text-sm resize-none"
              ></textarea>
              <button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-6 py-2.5 rounded-xl transition text-sm"
              >
                {feedbackSent ? 'Sent!' : 'Submit Suggestion'}
              </button>
            </form>
          </div>
        </main>

        {/* Global Modals */}
        <PresetModal />
        <ExportModal />
        <KeyboardShortcutsModal />

        {/* Toast Notification Banner */}
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 animate-slide-up">
            <div
              className={`px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-xl flex items-center gap-2 ${
                toast.type === 'error'
                  ? 'bg-rose-950/90 border-rose-800 text-rose-200'
                  : toast.type === 'warning'
                  ? 'bg-amber-950/90 border-amber-800 text-amber-200'
                  : toast.type === 'info'
                  ? 'bg-blue-950/90 border-blue-800 text-blue-200'
                  : 'bg-slate-900 border-cyan-500/50 text-cyan-300'
              }`}
            >
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export const UserAgentAnalyzer: React.FC = () => {
  return (
    <UAParserProvider>
      <MainToolContent />
    </UAParserProvider>
  );
};

export default UserAgentAnalyzer;