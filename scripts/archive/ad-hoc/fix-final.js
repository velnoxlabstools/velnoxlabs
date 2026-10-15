const fs = require('fs');
const path = require('path');
const toolsDir = path.join(__dirname, 'src', 'app', 'tools');

const items = fs.readdirSync(toolsDir);
let fixed = 0;

items.forEach(item => {
  const pagePath = path.join(toolsDir, item, 'page.tsx');
  if (!fs.existsSync(pagePath)) return;

  let content = fs.readFileSync(pagePath, 'utf8');
  const original = content;

  // Remove old broken auto-run blocks
  content = content.replace(/[ \t]*\/\/ Auto-run on mount[ \t]*\r?\n[ \t]*useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);[ \t]*\r?\n/g, '');

  const hasHandler = content.includes('const handleProcess') || content.includes('const handleConvert') || content.includes('const handleFormat');
  if (!hasHandler) return;

  // Find ALL useState variables
  const stateMatches = [...content.matchAll(/const \[(\w+),\s*(set\w+)\]\s*=\s*useState(?:<[^>]*>)?\s*\(([^)]*)\)/g)];
  if (stateMatches.length < 2) return;

  // Find input and output variables
  let inputVar = null, inputSetter = null, inputDefault = null;
  let outputVar = null, outputSetter = null;

  for (const m of stateMatches) {
    const name = m[1];
    const setter = m[2];
    const def = m[3];
    if (/output|result|converted|generated|processed/i.test(name)) {
      if (!outputVar) { outputVar = name; outputSetter = setter; }
    } else if (/input|json|curl|header|raw|text|value|source|image/i.test(name)) {
      if (!inputVar) { inputVar = name; inputSetter = setter; inputDefault = def; }
    }
  }

  if (!inputVar || !outputVar) return;

  // Determine handler + args
  let handlerName = null;
  if (content.includes('const handleConvert')) handlerName = 'handleConvert';
  else if (content.includes('const handleProcess')) handlerName = 'handleProcess';
  else if (content.includes('const handleFormat')) handlerName = 'handleFormat';
  if (!handlerName) return;

  const hasMode = content.includes('const [mode,');
  const callArgs = (handlerName === 'handleConvert' && hasMode) ? `${inputVar}, mode` : inputVar;

  // Add useEffect right before handleCopy
  const useEffectBlock = `  // Auto-run on mount
  useEffect(() => {
    if (${inputVar}) {
      try { ${handlerName}(${callArgs}); } catch(e) {}
    }
  }, []);

`;

  const idx = content.indexOf('const handleCopy =');
  if (idx !== -1) {
    content = content.slice(0, idx) + useEffectBlock + content.slice(idx);
  }

  // Ensure useEffect is imported
  if (!content.includes('useEffect')) {
    content = content.replace(
      /import React, \{ ([^}]+) \} from 'react';/,
      (m, p1) => p1.includes('useEffect') ? m : `import React, { ${p1.trim()}, useEffect } from 'react';`
    );
  }

  // If input is empty string, add a sensible default
  if (inputDefault && inputDefault.trim() === "''") {
    const defaultMap = {
      'base64': "'Hello VelnoxLabs!'",
      'case': "'Hello World From VelnoxLabs'",
      'hash': "'Hello VelnoxLabs'",
      'hmac': "'Hello VelnoxLabs'",
      'checksum': "'Hello VelnoxLabs'",
      'jwt': "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlZlbG5veExhYnMifQ.dummy'"
    };
    for (const [key, val] of Object.entries(defaultMap)) {
      if (item.includes(key)) {
        content = content.replace(
          new RegExp(`const \\[${inputVar},\\s*${inputSetter}\\]\\s*=\\s*useState(\\([^)]*\\))`),
          `const [${inputVar}, ${inputSetter}] = useState(${val})`
        );
        break;
      }
    }
  }

  if (content !== original) {
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log('✅ Fixed: ' + item);
    fixed++;
  } else {
    console.log('⏭️  Skipped: ' + item);
  }
});

console.log('\\n🎉 Total fixed: ' + fixed);