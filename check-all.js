const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'src', 'app', 'tools');
if (fs.existsSync(toolsDir)) {
  const items = fs.readdirSync(toolsDir);
  let brokenCount = 0;
  console.log('🔍 Scanning all tools...\n');
  
  items.forEach(item => {
    const pagePath = path.join(toolsDir, item, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      const content = fs.readFileSync(pagePath, 'utf8');
      let isBroken = false;
      
      // Check 1: Missing GlobalContainer closing tag (Unexpected eof)
      if (!content.includes('</GlobalContainer>')) isBroken = true;
      
      // Check 2: Missing <form> opening tag (Expected '</', got 'jsx text')
      if (content.includes('</form>') && !content.includes('<form')) isBroken = true;
      
      // Check 3: Missing closing divs before GlobalContainer
      if (content.includes('</GlobalContainer>') && !content.includes('</div>\n      </GlobalContainer>') && !content.includes('</div>\n        </div>\n      </GlobalContainer>')) isBroken = true;

      if (isBroken) {
        console.log(`❌ PROBLEM: ${item}`);
        brokenCount++;
      } else {
        console.log(`✅ OK: ${item}`);
      }
    }
  });
  console.log(`\n🎯 Total broken tools found: ${brokenCount}`);
} else {
  console.log('❌ Tools directory not found. Check your path.');
}