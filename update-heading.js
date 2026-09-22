const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'src', 'app', 'tools');
if (fs.existsSync(toolsDir)) {
  const items = fs.readdirSync(toolsDir);
  items.forEach(item => {
    const pagePath = path.join(toolsDir, item, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      let content = fs.readFileSync(pagePath, 'utf8');
      
      // Replace old feedback heading with the new US-standard premium heading on UI and Schema
      content = content.replace(/Have a Suggestion or Feedback\?/g, 'Got Feedback or Feature Requests?');
      content = content.replace(/Have Feedback or Suggestions\?/g, 'Got Feedback or Feature Requests?');
      
      fs.writeFileSync(pagePath, content, 'utf8');
    }
  });
  console.log('Feedback heading updated to "Got Feedback or Feature Requests?" across all tools successfully!');
}
