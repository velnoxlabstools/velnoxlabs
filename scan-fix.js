const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'src', 'app', 'tools');
if (fs.existsSync(toolsDir)) {
  const items = fs.readdirSync(toolsDir);
  console.log(`Total tool folders found: ${items.length}`);
  
  items.forEach(item => {
    const pagePath = path.join(toolsDir, item, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      let content = fs.readFileSync(pagePath, 'utf8');
      
      // Check if file is missing proper ending or has EOF syntax issues
      if (content.includes('</button>') && (!content.trim().endsWith('}') || !content.includes('export default'))) {
        console.log(`[Scanning & Repairing]: ${item}`);
        
        const lastBtnIdx = content.lastIndexOf('</button>');
        if (lastBtnIdx !== -1) {
          let fixedContent = content.substring(0, lastBtnIdx + 9);
          fixedContent += `\n            </div>\n          </div>\n        </div>\n      </GlobalContainer>\n    </>\n  );\n}`;
          fs.writeFileSync(pagePath, fixedContent, 'utf8');
          console.log(` -> Successfully repaired ${item}`);
        }
      }
    }
  });
  console.log('All tool pages scan and repair check completed successfully!');
}
