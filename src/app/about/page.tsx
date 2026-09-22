import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About - VelnoxLabs',
  description: 'Learn more about VelnoxLabs developer utilities.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">About VelnoxLabs</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            VelnoxLabs delivers fast, private, browser-based utilities designed for everyday developer workflows.
            No data ever leaves your device unless explicitly requested.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold">Private by Default</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              All string, encoding, and parsing utilities execute purely client-side without servers intercepting your payloads.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold">Zero Friction</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              No account creation, sign-up forms, or paywalls. Open the tool you need and complete your task instantly.
            </p>
          </div>
        </div>
        <div className="pt-6">
          <Link href="/tools" className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 transition-colors shadow-sm">
            Browse All Tools
          </Link>
        </div>
      </div>
    </div>
  );
}
