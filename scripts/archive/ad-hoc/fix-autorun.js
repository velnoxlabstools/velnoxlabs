const fs = require('fs');
const path = require('path');
const toolsDir = path.join(__dirname, 'src', 'app', 'tools');

const items = fs.readdirSync(toolsDir);
let fixed = 0;

items.forEach(item => {
  const pagePath = path.join(toolsDir, item, 'page.tsx');
  if (!fs.existsSync(pagePath)) return;

  let content = fs.readFileSync(pagePath, 'utf8');

  if (content.includes('// Auto-run on mount')) return;
  if (!content.includes('const handleProcess') && !content.includes('const handleConvert')) return;

  let changed = false;

  if (!content.includes('useEffect')) {
    content = content.replace(
      /import React, \{ ([^}]+) \} from 'react';/,
      (m, p1) => {
        if (p1.includes('useEffect')) return m;
        return `import React, { ${p1.trim()}, useEffect } from 'react';`;
      }
    );
    changed = true;
  }

  if (content.includes('const handleProcess')) {
    const idx = content.indexOf('const handleCopy =');
    if (idx !== -1 && !content.includes('// Auto-run on mount')) {
      const ue = `// Auto-run on mount
  useEffect(() => {
    if (input && !output) {
      handleProcess(input);
    }
  }, []);

  `;
      content = content.slice(0, idx) + ue + content.slice(idx);
      changed = true;
    }
  }

  if (content.includes('const handleConvert') && !content.includes('// Auto-run on mount')) {
    const idx = content.indexOf('const handleCopy =');
    if (idx !== -1) {
      const ue = `// Auto-run on mount
  useEffect(() => {
    if (jsonInput && !pyOutput) {
      handleConvert(jsonInput);
    }
  }, []);

  `;
      content = content.slice(0, idx) + ue + content.slice(idx);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log('✅ Fixed: ' + item);
    fixed++;
  }
});

console.log('\\n🎉 Total fixed: ' + fixed);