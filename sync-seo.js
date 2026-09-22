const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'src', 'app', 'tools');
if (fs.existsSync(toolsDir)) {
  const items = fs.readdirSync(toolsDir);
  items.forEach(item => {
    const pagePath = path.join(toolsDir, item, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      let content = fs.readFileSync(pagePath, 'utf8');
      
      // Check if schema.org script is present
      if (!content.includes('application/ld+json')) {
        const toolName = item.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const schemaSnippet = `
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            'name': 'VelnoxLabs ${toolName}',
            'operatingSystem': 'All',
            'applicationCategory': 'DeveloperApplication',
            'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
            'description': 'Professional developer utility tool by VelnoxLabs.'
          })
        }}
      />
        `;
        
        // Inject right before return (
        content = content.replace('return (', 'return (\n    <>\n      ' + schemaSnippet.trim() + '\n');
        fs.writeFileSync(pagePath, content, 'utf8');
        console.log(`Injected SEO Schema into: ${item}`);
      }
    }
  });
  console.log('All tools SEO synchronization complete!');
}
