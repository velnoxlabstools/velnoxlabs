const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'src', 'app', 'tools');
if (fs.existsSync(toolsDir)) {
  const items = fs.readdirSync(toolsDir);
  items.forEach(item => {
    const pagePath = path.join(toolsDir, item, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      let content = fs.readFileSync(pagePath, 'utf8');
      
      // Remove any previously injected enterprise sections to start clean
      content = content.replace(/\{?\/\*[\s\S]*?(?:Enterprise-Grade|Unified Enterprise)[\s\S]*?\*\/\}?\s*<div[\s\S]*?<\/div>\s*<\/div>/g, '');
      
      // Clean up trailing malformed closing tags before the final return ending
      content = content.replace(/<\/div>\s*<\/div>\s*\);\s*}\s*$/, '\n  );\n}');
      
      fs.writeFileSync(pagePath, content, 'utf8');
    }
  });
  console.log('All files cleaned up to a stable base state!');
}
