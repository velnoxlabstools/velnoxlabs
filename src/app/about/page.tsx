import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About VelnoxLabs - 51+ Free Browser-Based Tools',
  description: 'Learn more about VelnoxLabs. 51+ free, fast, and private browser-based tools for developers and everyday work. No sign-up. 100% privacy.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">About VelnoxLabs</h1>
          <p className="mt-4 text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            VelnoxLabs is a collection of 51+ free, browser-based tools designed for developers and everyday work. 
            No sign-up. No tracking. No hidden charges. Just fast, private utilities that run 100% in your browser.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 mt-12">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white">🔒 Private by Default</h3>
            <p className="mt-2 text-sm text-slate-400">
              All tools execute purely client-side. Your data never leaves your device, and we never upload or store your payloads on any server.
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white">⚡ Zero Friction</h3>
            <p className="mt-2 text-sm text-slate-400">
              No account creation, sign-up forms, or paywalls. Open the tool you need and complete your task instantly.
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white">🛠️ Built for Developers</h3>
            <p className="mt-2 text-sm text-slate-400">
              From JSON formatting to cURL conversion and Cron generation, our tools streamline your daily workflow.
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white">🌍 Free Forever</h3>
            <p className="mt-2 text-sm text-slate-400">
              We believe essential utilities should be accessible to everyone. All 51+ tools are 100% free to use.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <h2 className="text-2xl font-semibold text-white mb-4">Why I Built VelnoxLabs</h2>
          <p className="text-slate-400 leading-relaxed">
            I was tired of slow, ad-filled tool websites that upload your data to their servers just to format a simple JSON file or resize an image. 
            So I built VelnoxLabs — a place where you can use everyday developer and utility tools without any friction. 
            Everything runs in your browser, so your privacy is always protected.
          </p>
        </div>

        {/* Contact Section */}
        <div className="mt-12 pt-8 border-t border-slate-800 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">Get in Touch</h2>
          <p className="text-slate-400 mb-4">
            Have feedback, a tool suggestion, or just want to say hi? Feel free to reach out.
          </p>
          <a href="mailto:velnoxlabss@gmail.com" className="text-cyan-400 hover:text-cyan-300 font-medium text-lg">
            velnoxlabss@gmail.com
          </a>
        </div>

        {/* CTA Button */}
        <div className="pt-8 text-center">
          <Link 
            href="/tools" 
            className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-6 py-3 text-sm font-medium text-white hover:bg-cyan-500 transition-colors shadow-sm"
          >
            Browse All 51+ Tools
          </Link>
        </div>

      </div>
    </div>
  );
}