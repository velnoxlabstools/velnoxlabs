const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'src', 'app', 'tools');
if (fs.existsSync(toolsDir)) {
  const items = fs.readdirSync(toolsDir);
  items.forEach(item => {
    const pagePath = path.join(toolsDir, item, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      let content = fs.readFileSync(pagePath, 'utf8');
      
      // Clean up extra broken closing tags at the end of the file
      content = content.replace(/<\/GlobalContainer>\s*<\/>/g, '</div>');
      content = content.replace(/<\/>\s*\);\s*}\s*$/, '\n  );\n}');

      fs.writeFileSync(pagePath, content, 'utf8');
    }
  });
  console.log('Syntax errors and broken tags fixed successfully across all tool pages!');
}
