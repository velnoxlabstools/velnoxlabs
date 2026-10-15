const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'src', 'app', 'tools');
if (fs.existsSync(toolsDir)) {
  const items = fs.readdirSync(toolsDir);
  items.forEach(item => {
    const pagePath = path.join(toolsDir, item, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      let content = fs.readFileSync(pagePath, 'utf8');
      
      // Remove any injected markup blocks so it goes back to clean base
      const markerIdx = content.indexOf('{/* Enterprise-Grade');
      if (markerIdx !== -1) {
        content = content.substring(0, markerIdx);
        // Ensure proper closing tags at the end
        content = content.trim();
        if (!content.endsWith('</)}^')) {
          // Clean up standard component return closure
          content = content.replace(/\s*<\/div>\s*$/, '');
          content += '\n    </div>\n  );\n}';
        }
        fs.writeFileSync(pagePath, content, 'utf8');
      }
    }
  });
  console.log('All tool pages cleaned back to stable base!');
}
