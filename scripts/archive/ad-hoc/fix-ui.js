const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'src', 'app', 'tools');

function generateUI(inputState, setInputState, outputState, mainHandler, copyHandler, extraUI = '') {
  const onChangeLine = mainHandler
    ? `onChange={(e) => { ${setInputState}(e.target.value); try { ${mainHandler}(e.target.value); } catch(err) {} }}`
    : `onChange={(e) => ${setInputState}(e.target.value)}`;

  const copyBtn = copyHandler
    ? `<button onClick={${copyHandler}} style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Copy</button>`
    : '';

  return `
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            ${extraUI}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Input:</label>
                <textarea value={${inputState} || ''} ${onChangeLine} rows={10} placeholder="Enter your input here..." style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>Output:</label>
                  ${copyBtn}
                </div>
                <textarea value={${outputState} || ''} readOnly rows={10} placeholder="Output will appear here..." style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#34d399', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none' }} />
              </div>
            </div>
          </div>
`;
}

const items = fs.readdirSync(toolsDir);
let fixedCount = 0;

items.forEach(item => {
  const pagePath = path.join(toolsDir, item, 'page.tsx');
  if (!fs.existsSync(pagePath)) return;

  let content = fs.readFileSync(pagePath, 'utf8');
  let changed = false;

  // --- FIX 1: Missing <form> opening tag ---
  if (content.includes('</form>') && !content.includes('<form')) {
    content = content.replace(
      /<div className="space-y-4">\s*\n?\s*<textarea\s+rows=\{4\}/,
      '<form onSubmit={handleFeedbackSubmit} className="space-y-4">\n          <textarea\n            rows={4}'
    );
    // Fix double div issue
    content = content.replace(/(<\/form>)\s*<\/div>\s*<\/div>\s*\n\s*<\/div>\s*\n\s*<\/GlobalContainer>/, '$1\n          </div>\n\n        </div>\n      </GlobalContainer>');
    changed = true;
  }

  // --- FIX 2: Add missing handleFeedbackSubmit if absent ---
  if (!content.includes('handleFeedbackSubmit')) {
    const hookEnd = content.indexOf('const schemaData');
    if (hookEnd !== -1) {
      const feedbackFn = `const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setFeedbackSent(true);
    setFeedback('');
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  `;
      content = content.slice(0, hookEnd) + feedbackFn + content.slice(hookEnd);
      changed = true;
    }
  }

  // --- FIX 3: Insert UI if missing (detect by checking for textarea with placeholder "Enter" before feedback) ---
  const sectionHeadingEnd = content.indexOf('subtitle=');
  const feedbackStart = content.indexOf('{/* Single Feedback Section');
  const hasUI = content.includes('placeholder="Enter') || 
                content.includes('placeholder="Paste') ||
                content.includes('placeholder="Type');

  if (!hasUI && sectionHeadingEnd !== -1 && feedbackStart !== -1) {
    // Detect state variables
    const stateMatches = [...content.matchAll(/const \[(\w+),\s*(set\w+)\]\s*=\s*useState/g)];
    const handlerMatches = [...content.matchAll(/const (handle\w+)\s*=/g)];
    const handlers = handlerMatches.map(m => m[1]).filter(h => !h.includes('Feedback') && !h.includes('Copy'));

    if (stateMatches.length >= 2) {
      // Find input state (contains input/text/value/raw/json/etc.)
      let inputEntry = stateMatches.find(m => /input|raw|text|json|curl|value|source/i.test(m[1]));
      let outputEntry = stateMatches.find(m => /output|result|converted|generated/i.test(m[1]));

      if (!inputEntry) inputEntry = stateMatches[0];
      if (!outputEntry) outputEntry = stateMatches[1] || stateMatches[0];

      const inputState = inputEntry[1];
      const setInputState = inputEntry[2];
      const outputState = outputEntry[1];
      const mainHandler = handlers[0] || null;
      const copyHandler = content.includes('const handleCopy') ? 'handleCopy' : null;

      const uiBlock = generateUI(inputState, setInputState, outputState, mainHandler, copyHandler);

      // Find where SectionHeading ends
      const sectionEnd = content.indexOf('/>', sectionHeadingEnd);
      if (sectionEnd !== -1) {
        const insertPoint = sectionEnd + 2;
        content = content.slice(0, insertPoint) + '\n' + uiBlock + content.slice(insertPoint);
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log(`✅ Fixed: ${item}`);
    fixedCount++;
  }
});

console.log(`\n🎉 Total tools fixed: ${fixedCount}`);