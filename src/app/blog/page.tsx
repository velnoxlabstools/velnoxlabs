import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - VelnoxLabs',
  description: 'Tutorials, guides, and updates from VelnoxLabs. Coming soon.',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        
        <h1 className="text-4xl font-bold tracking-tight text-white">Blog</h1>
        
        <p className="text-lg text-slate-400 leading-relaxed">
          Tutorials, developer tips, and product updates are coming soon.
        </p>

        <div className="mt-12 p-12 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
          <p className="text-2xl font-semibold text-cyan-400 mb-2">🚧 Coming Soon</p>
          <p className="text-slate-400">
            We're working on helpful content for developers and everyday users. Stay tuned!
          </p>
        </div>

      </div>
    </div>
  );
}