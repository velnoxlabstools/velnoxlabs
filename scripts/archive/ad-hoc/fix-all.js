const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'src', 'app', 'tools');
const standardClosing = `          </form>\n          </div>\n\n        </div>\n      </GlobalContainer>\n    </>\n  );\n}\n`;

if (fs.existsSync(toolsDir)) {
  const items = fs.readdirSync(toolsDir);
  let fixedCount = 0;
  
  items.forEach(item => {
    const pagePath = path.join(toolsDir, item, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      let content = fs.readFileSync(pagePath, 'utf8');
      let changed = false;

      // 1. Fix missing closing tags if </GlobalContainer> is absent
      if (!content.includes('</GlobalContainer>')) {
        const lastBtnIdx = content.lastIndexOf('</button>');
        if (lastBtnIdx !== -1) {
          content = content.substring(0, lastBtnIdx + 9);
          content += '\n' + standardClosing;
          changed = true;
        }
      }

      // 2. Fix the feedback textarea if it's missing value/onChange
      const feedbackTextareaRegex = /(<textarea\s+rows=\{4\}\s+)(placeholder="Write your suggestions or feature requests here...")/g;
      if (feedbackTextareaRegex.test(content)) {
        content = content.replace(feedbackTextareaRegex, '$1value={feedback}\n            onChange={(e) => setFeedback(e.target.value)}\n            $2');
        changed = true;
      }
      
      // 3. Add type="submit" to the feedback button
      const submitButtonRegex = /(<button\s+)(className="bg-emerald-600)/g;
      if (submitButtonRegex.test(content)) {
         content = content.replace(submitButtonRegex, '$1type="submit" $2');
         changed = true;
      }

      if (changed) {
        fs.writeFileSync(pagePath, content, 'utf8');
        console.log(`✅ Fixed: ${item}`);
        fixedCount++;
      }
    }
  });
  console.log(`\n🎉 Total tools fixed: ${fixedCount}`);
} else {
  console.log('❌ Tools directory not found. Make sure you run this from the project root folder.');
}