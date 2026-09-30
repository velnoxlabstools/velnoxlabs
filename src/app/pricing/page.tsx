import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - VelnoxLabs',
  description: 'All VelnoxLabs tools are 100% free. No sign-up required.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        
        <h1 className="text-4xl font-bold tracking-tight text-white">Pricing</h1>
        
        <p className="text-lg text-slate-400 leading-relaxed">
          All VelnoxLabs tools are 100% free. No sign-up, no hidden charges, no paywalls.
        </p>

        <div className="mt-12 p-12 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
          <p className="text-2xl font-semibold text-cyan-400 mb-2">✨ Free Forever</p>
          <p className="text-slate-400">
            Enjoy unlimited access to all 51+ tools, forever.
          </p>
        </div>

        <div className="mt-8 text-sm text-slate-500">
          <p>We believe essential utilities should be accessible to everyone.</p>
        </div>

      </div>
    </div>
  );
}