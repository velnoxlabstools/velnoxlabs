import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy - VelnoxLabs',
  description: 'Cookie Policy for VelnoxLabs. We do not use tracking cookies.',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Cookie Policy</h1>
          <p className="mt-4 text-sm text-slate-500">Last updated: September 2026</p>
        </div>

        <div className="space-y-6 text-slate-400 leading-relaxed">
          
          <div>
            <h2 className="text-xl font-semibold text-white mb-3">1. No Tracking Cookies</h2>
            <p>
              VelnoxLabs does not use cookies to track you, your activity, or your data. 
              All tools run entirely in your browser.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">2. Essential Cookies</h2>
            <p>
              We may use minimal, essential cookies strictly for website functionality 
              (such as remembering your theme preference). These are never used for tracking.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">3. Third-Party Services</h2>
            <p>
              We do not share your data with third-party advertising or tracking services.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">4. Contact</h2>
            <p>
              For questions about this Cookie Policy, contact us at{' '}
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