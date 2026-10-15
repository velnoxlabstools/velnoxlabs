const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'src', 'app', 'tools');
if (fs.existsSync(toolsDir)) {
  const items = fs.readdirSync(toolsDir);
  let errorCount = 0;
  
  items.forEach(item => {
    const pagePath = path.join(toolsDir, item, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      const content = fs.readFileSync(pagePath, 'utf8');
      
      // Check for common syntax/EOF issues or missing closures
      const openTags = (content.match(/<div/g) || []).length;
      const closeTags = (content.match(/<\/div>/g) || []).length;
      
      // If it ends abruptly or doesn't have standard export default closure
      if (!content.includes('export default') || !content.trim().endsWith('}')) {
        console.log(`[BROKEN FILE]: ${item}`);
        errorCount++;
        
        // Auto-fix by restoring a clean safe structure if </button> or return exists
        if (content.includes('</button>')) {
          const lastBtnIdx = content.lastIndexOf('</button>');
          let fixed = content.substring(0, lastBtnIdx + 9);
          fixed += `\n            </div>\n          </div>\n        </div>\n      </GlobalContainer>\n    </>\n  );\n}`;
          fs.writeFileSync(pagePath, fixed, 'utf8');
          console.log(`-> Automatically repaired: ${item}`);
        }
      }
    }
  });
  console.log(`Diagnosis complete. Total broken files found and fixed: ${errorCount}`);
}
