const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'src', 'app', 'tools');
if (fs.existsSync(toolsDir)) {
  const items = fs.readdirSync(toolsDir);
  items.forEach(item => {
    const pagePath = path.join(toolsDir, item, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      let content = fs.readFileSync(pagePath, 'utf8');
      
      // Clean up extra closing tags before export/return closure
      content = content.replace(/(<\/div>\s*){3,}\s*\);\s*}\s*$/, '</div>\n    </div>\n  );\n}');
      
      fs.writeFileSync(pagePath, content, 'utf8');
    }
  });
  console.log('All tool pages cleaned up and syntax fixed successfully!');
}
