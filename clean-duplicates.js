const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'src', 'app', 'tools');
if (fs.existsSync(toolsDir)) {
  const items = fs.readdirSync(toolsDir);
  items.forEach(item => {
    const pagePath = path.join(toolsDir, item, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      let content = fs.readFileSync(pagePath, 'utf8');
      
      // If there are multiple suggestion forms or boxes, let's keep only the bottom unified one
      // We can search for occurrences of "Got Feedback or Feature Requests?" and remove all but the last one if duplicated
      const matches = [...content.matchAll(/Got Feedback or Feature Requests\?/g)];
      if (matches.length > 1) {
        // Find the index of the last occurrence
        const lastIndex = content.lastIndexOf('Got Feedback or Feature Requests?');
        // Remove earlier occurrences along with their surrounding block if it's a duplicate form
        // Or simpler: clean up standard template blocks and re-apply a single block at the end.
      }
    }
  });
  console.log('Checked for duplicate suggestion blocks.');
}
