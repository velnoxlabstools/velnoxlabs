import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - VelnoxLabs',
  description: 'Learn how VelnoxLabs protects your privacy. All tools run 100% in your browser. No data is uploaded, stored, or shared.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Privacy Policy</h1>
          <p className="mt-4 text-sm text-slate-500">Last updated: September 2026</p>
        </div>

        <div className="space-y-6 text-slate-400 leading-relaxed">
          
          <div>
            <h2 className="text-xl font-semibold text-white mb-3">1. 100% Browser-Based Processing</h2>
            <p>
              All VelnoxLabs tools run entirely in your browser. Your data (JSON, text, images, etc.) 
              never leaves your device. We do not upload, store, or share your data with any server.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">2. No Sign-up Required</h2>
            <p>
              We do not require you to create an account or provide any personal information to use our tools. 
              You can open any tool and use it instantly.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">3. Cookies & Tracking</h2>
            <p>
              We do not use cookies to track you, and we do not sell your data to third parties. 
              Any analytics we use are anonymized and only help us understand which tools are most useful.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">4. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:velnoxlabss@gmail.com" className="text-cyan-400 hover:text-cyan-300">
                velnoxlabss@gmail.com
              </a>.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}