const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'src', 'app', 'tools');
if (fs.existsSync(toolsDir)) {
  const items = fs.readdirSync(toolsDir);
  items.forEach(item => {
    const pagePath = path.join(toolsDir, item, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      let content = fs.readFileSync(pagePath, 'utf8');
      
      // Ensure visible SEO section is rendered at the bottom of the tool component
      if (!content.includes('Enterprise-Grade') && !content.includes('SEO Overview')) {
        // Appending a rich SEO UI section block before the final closing tags
        const seoSectionHtml = `
    {/* Visible Professional SEO & Features Section */}
    <section className="w-full max-w-7xl mx-auto px-4 py-12 mt-12 border-t border-slate-800">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-white mb-3">Enterprise-Grade Standards & Features</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">Optimized for speed, precision, and developer efficiency. Seamlessly execute tasks with secure client-side processing.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-white font-semibold mb-2">⚡ Instant Processing</h3>
          <p className="text-slate-400 text-sm">Real-time execution with optimized performance standards for developers.</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-white font-semibold mb-2">🔒 Complete Privacy</h3>
          <p className="text-slate-400 text-sm">All data handling occurs securely without storing sensitive parameters.</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-white font-semibold mb-2">🛠️ Production Ready</h3>
          <p className="text-slate-400 text-sm">Clean, formatted outputs built to integrate directly into your workflow.</p>
        </div>
      </div>
    </section>`;
        
        // Insert before the last closing </div> or export default block
        const lastDivIndex = content.lastIndexOf('</div>');
        if (lastDivIndex !== -1) {
          content = content.substring(0, lastDivIndex) + seoSectionHtml + '\n    </div>' + content.substring(lastDivIndex + 6);
          fs.writeFileSync(pagePath, content, 'utf8');
        }
      }
    }
  });
  console.log('Visible SEO UI sections injected successfully into all tools!');
}
