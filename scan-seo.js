const fs = require('fs');
const path = require('path');
const toolsDir = path.join(__dirname, 'src', 'app', 'tools');

const items = fs.readdirSync(toolsDir);
let hasSEO = [];
let noSEO = [];
let hasFeedback = [];
let noFeedback = [];

items.forEach(item => {
  const itemPath = path.join(toolsDir, item);
  if (!fs.statSync(itemPath).isDirectory()) return;

  const pagePath = path.join(itemPath, 'page.tsx');
  let content = '';
  if (fs.existsSync(pagePath)) content += fs.readFileSync(pagePath, 'utf8');

  // Also check all Client files
  const files = fs.readdirSync(itemPath);
  files.forEach(f => {
    if (f.endsWith('Client.tsx') || f.endsWith('client.tsx')) {
      content += fs.readFileSync(path.join(itemPath, f), 'utf8');
    }
  });

  if (content.includes('application/ld+json')) hasSEO.push(item);
  else noSEO.push(item);

  if (/suggestions|feedback|Got Feedback/i.test(content)) hasFeedback.push(item);
  else noFeedback.push(item);
});

console.log('=========================================');
console.log('SEO SCAN RESULT');
console.log('=========================================');
console.log('');
console.log('✅ WITH SEO (' + hasSEO.length + '):');
hasSEO.forEach(t => console.log('   - ' + t));
console.log('');
console.log('❌ WITHOUT SEO (' + noSEO.length + '):');
noSEO.forEach(t => console.log('   - ' + t));

console.log('');
console.log('=========================================');
console.log('FEEDBACK FORM SCAN');
console.log('=========================================');
console.log('');
console.log('✅ WITH FEEDBACK (' + hasFeedback.length + '):');
hasFeedback.forEach(t => console.log('   - ' + t));
console.log('');
console.log('❌ WITHOUT FEEDBACK (' + noFeedback.length + '):');
noFeedback.forEach(t => console.log('   - ' + t));