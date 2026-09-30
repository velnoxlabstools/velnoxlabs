import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categories - VelnoxLabs',
  description: 'Browse tools by category. Coming soon.',
};

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        
        <h1 className="text-4xl font-bold tracking-tight text-white">Categories</h1>
        
        <p className="text-lg text-slate-400 leading-relaxed">
          Browse our tools by category. This page is coming soon.
        </p>

        <div className="mt-12 p-12 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
          <p className="text-2xl font-semibold text-cyan-400 mb-2">🚧 Coming Soon</p>
          <p className="text-slate-400">
            We are working on this page. Please check back later.
          </p>
        </div>

      </div>
    </div>
  );
}