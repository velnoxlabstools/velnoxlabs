const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'src', 'app', 'tools');
if (fs.existsSync(toolsDir)) {
  const items = fs.readdirSync(toolsDir);
  items.forEach(item => {
    const pagePath = path.join(toolsDir, item, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      let content = fs.readFileSync(pagePath, 'utf8');
      
      // Check if both sections exist, then ensure Feedback comes after Features
      if (content.includes('Got Feedback') && content.includes('Enterprise-Grade')) {
        // Remove existing injected blocks to re-inject cleanly in correct order
        content = content.replace(/\{?\/\*[\s\S]*?(?:Enterprise-Grade|Visible Professional)[\s\S]*?\*\/\}?\s*<div[\s\S]*?<\/div>\s*<\/div>/g, '');
      }
      
      // Let's apply a clean unified structure across all pages
      const niceName = item.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      
      const unifiedSection = `
    {/* Enterprise Standards and Feedback Section */}
    <div className="w-full max-w-7xl mx-auto px-4 py-12 mt-12 border-t border-slate-800">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Enterprise-Grade ${niceName} Standards</h2>
        <p className="text-slate-400 max-w-3xl">Streamlining developer workflows efficiently with high performance, strict client-side privacy, and production-ready outputs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl">
          <div className="text-orange-400 font-semibold mb-2 flex items-center gap-2">⚡ Instant Processing</div>
          <p className="text-slate-400 text-sm">Processes parameters and payloads in real-time with zero latency.</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl">
          <div className="text-orange-400 font-semibold mb-2 flex items-center gap-2">🔒 Complete Privacy</div>
          <p className="text-slate-400 text-sm">All parsing happens completely client-side without logging sensitive parameters.</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl">
          <div className="text-orange-400 font-semibold mb-2 flex items-center gap-2">🛠️ Production Ready</div>
          <p className="text-slate-400 text-sm">Outputs clean, standardized formats built to integrate directly into your workflow.</p>
        </div>
      </div>

      {/* Feedback Section at the Bottom */}
      <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl">
        <h3 className="text-xl font-bold text-white mb-2">Got Feedback or Feature Requests?</h3>
        <p className="text-slate-400 mb-6 text-sm">Help us enhance VelnoxLabs developer utility standards. Share your feedback below!</p>
        <div className="space-y-4">
          <textarea 
            rows={4} 
            placeholder="Write your suggestions or feature requests here..." 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-slate-600 text-sm resize-none"
          ></textarea>
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-xl transition text-sm">
            Submit Suggestion
          </button>
        </div>
      </div>
    </div>`;

      // Cleanly append at the end before final component closure
      const lastDivIndex = content.lastIndexOf('</div>');
      if (lastDivIndex !== -1) {
        content = content.substring(0, lastDivIndex) + unifiedSection + '\n    </div>' + content.substring(lastDivIndex + 6);
        fs.writeFileSync(pagePath, content, 'utf8');
      }
    }
  });
  console.log('All tool pages synchronized: Features cards first, Feedback section at the bottom!');
}
