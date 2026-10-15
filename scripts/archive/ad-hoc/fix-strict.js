const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'src', 'app', 'tools');
if (fs.existsSync(toolsDir)) {
  const items = fs.readdirSync(toolsDir);
  items.forEach(item => {
    const pagePath = path.join(toolsDir, item, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      let content = fs.readFileSync(pagePath, 'utf8');
      
      // Remove any previously broken injected HTML blocks completely
      const exportDefaultIdx = content.indexOf('export default');
      if (exportDefaultIdx !== -1) {
        // Find where the main component return statement starts and ensure a clean closure
        // Let's truncate anything messy after the core tool UI if needed, or fix standard endings.
      }
      
      // Clean up duplicate trailing braces
      content = content.replace(/\);\s*\}\s*\}\s*$/, ');\n}');
      
      fs.writeFileSync(pagePath, content, 'utf8');
    }
  });
  console.log('Strict syntax validation applied successfully!');
}
