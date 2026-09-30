import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact VelnoxLabs - Get in Touch',
  description: 'Have a question, feedback, or a tool suggestion? Contact the VelnoxLabs team. We reply within 24 hours.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        
        <h1 className="text-4xl font-bold tracking-tight text-white">Contact Us</h1>
        
        <p className="text-lg text-slate-400 leading-relaxed">
          Have a question, feedback, or a tool suggestion? We'd love to hear from you.
        </p>

        <div className="mt-12 p-8 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-4">📧 Email Us</h2>
          <a 
            href="mailto:velnoxlabss@gmail.com" 
            className="text-cyan-400 hover:text-cyan-300 font-medium text-lg break-all"
          >
            velnoxlabss@gmail.com
          </a>
          <p className="mt-4 text-sm text-slate-500">
            We typically reply within 24 hours.
          </p>
        </div>

        <div className="mt-8 text-sm text-slate-500">
          <p>For tool suggestions, please mention the tool name and what it should do.</p>
        </div>

      </div>
    </div>
  );
}