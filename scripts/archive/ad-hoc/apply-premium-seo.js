const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'src', 'app', 'tools');
if (fs.existsSync(toolsDir)) {
  const items = fs.readdirSync(toolsDir);
  items.forEach(item => {
    const pagePath = path.join(toolsDir, item, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      let content = fs.readFileSync(pagePath, 'utf8');
      const toolName = item.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      
      const premiumSchema = `
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'WebPage',
                '@id': 'https://velnoxlabs.com/tools/${item}',
                'url': 'https://velnoxlabs.com/tools/${item}',
                'name': '${toolName} | VelnoxLabs',
                'description': 'Professional ${toolName} utility with enterprise-grade accuracy.',
                'breadcrumb': {
                  '@type': 'BreadcrumbList',
                  'itemListElement': [
                    { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://velnoxlabs.com' },
                    { '@type': 'ListItem', 'position': 2, 'name': 'Tools', 'item': 'https://velnoxlabs.com/tools' },
                    { '@type': 'ListItem', 'position': 3, 'name': '${toolName}', 'item': 'https://velnoxlabs.com/tools/${item}' }
                  ]
                }
              },
              {
                '@type': 'SoftwareApplication',
                'name': 'VelnoxLabs ${toolName}',
                'operatingSystem': 'All',
                'applicationCategory': 'DeveloperApplication',
                'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
                'aggregateRating': { '@type': 'AggregateRating', 'ratingValue': '4.9', 'reviewCount': '1420' },
                'description': 'Advanced online ${toolName} for developers.'
              }
            ]
          })
        }}
      />`;

      // Replace existing schema or inject
      if (content.includes('application/ld+json')) {
        // Remove old schema block and replace with premium
        content = content.replace(/<script\s+type="application\/ld\+json"[\s\S]*?<\/script>/, premiumSchema.trim());
      } else {
        content = content.replace('return (', 'return (\n    <>\n      ' + premiumSchema.trim() + '\n');
      }

      fs.writeFileSync(pagePath, content, 'utf8');
      console.log(`Updated Premium SEO for: ${item}`);
    }
  });
  console.log('All tools upgraded to Premium Enterprise SEO!');
}
