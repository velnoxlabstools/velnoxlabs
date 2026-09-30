import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - VelnoxLabs',
  description: 'VelnoxLabs terms of service. Read our usage guidelines and limitations.',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Terms of Service</h1>
          <p className="mt-4 text-sm text-slate-500">Last updated: September 2026</p>
        </div>

        <div className="space-y-6 text-slate-400 leading-relaxed">
          
          <div>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By using VelnoxLabs, you agree to these Terms of Service. If you do not agree, 
              please do not use the website or its tools.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">2. Use of Tools</h2>
            <p>
              Our tools are provided "as is" for personal and commercial use. You are responsible 
              for how you use the output of these tools. We are not liable for any decisions made 
              based on the results.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">3. Intellectual Property</h2>
            <p>
              The VelnoxLabs name, logo, website design, and underlying code are our property. 
              You may not copy, reproduce, or redistribute them without permission.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">4. Limitation of Liability</h2>
            <p>
              VelnoxLabs is not liable for any damages, data loss, or issues arising from the use 
              of our tools. Use them at your own risk.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">5. Contact</h2>
            <p>
              For any questions regarding these Terms, contact us at{' '}
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