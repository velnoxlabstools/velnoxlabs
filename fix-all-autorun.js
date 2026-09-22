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

  // Step 1: Remove ALL broken "Auto-run on mount" useEffect blocks
  const autoRunPattern = /[ \t]*\/\/ Auto-run on mount[ \t]*\r?\n[ \t]*useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);[ \t]*\r?\n/g;
  content = content.replace(autoRunPattern, '');

  // Step 2: Check if file needs auto-run (has handleProcess or handleConvert)
  const hasHandleProcess = content.includes('const handleProcess =');
  const hasHandleConvert = content.includes('const handleConvert =');

  if (hasHandleProcess || hasHandleConvert) {
    const stateMatches = [...content.matchAll(/const \[(\w+),\s*(set\w+)\]\s*=\s*useState/g)];
    const states = stateMatches.map(m => m[1]);

    let inputVar = null, outputVar = null;
    const inputCandidates = ['input', 'jsonInput', 'curlInput', 'headerInput', 'rawHeaders', 'inputJson'];
    const outputCandidates = ['output', 'pyOutput', 'goOutput', 'tsOutput', 'result'];

    for (const p of inputCandidates) {
      if (states.includes(p)) { inputVar = p; break; }
    }
    for (const p of outputCandidates) {
      if (states.includes(p)) { outputVar = p; break; }
    }

    if (inputVar && outputVar) {
      const hasMode = states.includes('mode');
      const handler = hasHandleProcess ? 'handleProcess' : 'handleConvert';
      const handlerCall = (hasHandleConvert && hasMode)
        ? `${handler}(${inputVar}, mode)`
        : `${handler}(${inputVar})`;

      const useEffectCode = `  // Auto-run on mount
  useEffect(() => {
    if (${inputVar} && !${outputVar}) {
      ${handlerCall};
    }
  }, []);

`;

      const handleCopyIdx = content.indexOf('const handleCopy =');
      if (handleCopyIdx !== -1) {
        content = content.slice(0, handleCopyIdx) + useEffectCode + content.slice(handleCopyIdx);
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