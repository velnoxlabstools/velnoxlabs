const http = require('http');
const fs = require('fs');
const path = require('path');

// 1. All 51 tool slugs
const toolsDir = path.join(__dirname, '..', 'src', 'app', '[locale]', 'tools');
const ALL_TOOLS = fs.readdirSync(toolsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort();

// 2. Non-English locales to scan
const NON_EN_LOCALES = ['zh', 'es', 'pt', 'de', 'fr', 'it', 'ja', 'ru', 'ko'];

// 3. Known UI English words/phrases that indicate missed inner UI translations.
// We test case-insensitively or with exact boundaries for short words.
const FORBIDDEN_PATTERNS = [
  // Actions & Buttons
  { pattern: /\bCopy\b/i, label: 'Copy' },
  { pattern: /\bCopied\b/i, label: 'Copied' },
  { pattern: /\bCopy\s+(all|result|matches|breakdown|full|report|text)\b/i, label: 'Copy ...' },
  { pattern: /\bDownload\b/i, label: 'Download' },
  { pattern: /\bDownload\s+(svg|png|zip|all|json|file)\b/i, label: 'Download ...' },
  { pattern: /\bClear\b/i, label: 'Clear' },
  { pattern: /\bClear\s+all\b/i, label: 'Clear All' },
  { pattern: /\bReset\b/i, label: 'Reset' },
  { pattern: /\bGenerate\b/i, label: 'Generate' },
  { pattern: /\bGenerate\s+(new|password|random|numbers|slug|uuid|service)\b/i, label: 'Generate ...' },
  { pattern: /\bCalculate\b/i, label: 'Calculate' },
  { pattern: /\bConvert\b/i, label: 'Convert' },
  { pattern: /\bInspect\b/i, label: 'Inspect' },
  { pattern: /\bParse\b/i, label: 'Parse' },
  { pattern: /\bFormat\b/i, label: 'Format' },
  { pattern: /\bMinify\b/i, label: 'Minify' },

  // Labels & Headers
  { pattern: /\bInput\s*(Text|:)?\b/i, label: 'Input' },
  { pattern: /\bOutput\s*(Text|:)?\b/i, label: 'Output' },
  { pattern: /\bResult\s*(:)?\b/i, label: 'Result' },
  { pattern: /\bGenerated\s+Password\b/i, label: 'Generated Password' },
  { pattern: /\bRegEx\s+Pattern\b/i, label: 'RegEx Pattern' },
  { pattern: /\bTest\s+String\b/i, label: 'Test String' },
  { pattern: /\bMatches\s+Found\b/i, label: 'Matches Found' },
  { pattern: /\bMatch\s+List\b/i, label: 'Match List' },
  { pattern: /\bHighlighted\s+Output\b/i, label: 'Highlighted Output' },
  { pattern: /\bConversion\s+Settings\b/i, label: 'Conversion Settings' },
  { pattern: /\bSettings\b/i, label: 'Settings' },
  { pattern: /\bOptions\b/i, label: 'Options' },
  { pattern: /\bStrength\s*:\b/i, label: 'Strength:' },
  { pattern: /\bVery\s+Strong\b/i, label: 'Very Strong' },
  { pattern: /\bLength\s*:\b/i, label: 'Length:' },
  { pattern: /\bUppercase\b/i, label: 'Uppercase' },
  { pattern: /\bLowercase\b/i, label: 'Lowercase' },
  { pattern: /\bNumbers\b/i, label: 'Numbers' },
  { pattern: /\bSymbols\b/i, label: 'Symbols' },
  { pattern: /\bExclude\s+similar\b/i, label: 'Exclude similar' },
  { pattern: /\bAnnual\s+Salary\b/i, label: 'Annual Salary' },
  { pattern: /\bHourly\s+Rate\b/i, label: 'Hourly Rate' },
  { pattern: /\bHours\s+per\s+Week\b/i, label: 'Hours per Week' },
  { pattern: /\bWeeks\s+per\s+Year\b/i, label: 'Weeks per Year' },
  { pattern: /\bYour\s+Hourly\s+Rate\b/i, label: 'Your Hourly Rate' },
  { pattern: /\bYour\s+Annual\s+Salary\b/i, label: 'Your Annual Salary' },
  { pattern: /\bMinimum\s*:\b/i, label: 'Minimum:' },
  { pattern: /\bMaximum\s*:\b/i, label: 'Maximum:' },
  { pattern: /\bCount\s*:\b/i, label: 'Count:' },
  { pattern: /\bSort\s*:\b/i, label: 'Sort:' },
  { pattern: /\bAscending\b/i, label: 'Ascending' },
  { pattern: /\bDescending\b/i, label: 'Descending' },
  { pattern: /\bAllow\s+duplicates\b/i, label: 'Allow duplicates' },
  { pattern: /\bOriginal\s+Images\b/i, label: 'Original Images' },
  { pattern: /\bOutput\s+Images\b/i, label: 'Output Images' },
  { pattern: /\bAdd\s+More\s+Images\b/i, label: 'Add More Images' },
  { pattern: /\bMaintain\s+Aspect\s+Ratio\b/i, label: 'Maintain Aspect Ratio' },
  { pattern: /\bResize\s+All\b/i, label: 'Resize All' },
  { pattern: /\bMarkdown\s+Input\b/i, label: 'Markdown Input' },
  { pattern: /\bHTML\s+Output\b/i, label: 'HTML Output' },
  { pattern: /\bFirst\s+Name\b/i, label: 'First Name' },
  { pattern: /\bSecond\s+Name\b/i, label: 'Second Name' },
  { pattern: /\bCombine\s+Names\b/i, label: 'Combine Names' },
  { pattern: /\bMIME\s+Type\b/i, label: 'MIME Type' },
  { pattern: /\bFile\s+Extension\b/i, label: 'File Extension' },
  { pattern: /\bLoan\s+Amount\b/i, label: 'Loan Amount' },
  { pattern: /\bInterest\s+Rate\b/i, label: 'Interest Rate' },
  { pattern: /\bMonthly\s+EMI\b/i, label: 'Monthly EMI' },
  { pattern: /\bSecret\s+Key\b/i, label: 'Secret Key' },
  { pattern: /\bSelect\s+Algorithm\b/i, label: 'Select Algorithm' },

  // Common Placeholders
  { pattern: /\bEnter\s+(your\s+)?text\b/i, label: 'Enter text' },
  { pattern: /\bType\s+or\s+paste\b/i, label: 'Type or paste' },
  { pattern: /\bPaste\s+(your\s+)?(json|code|url|text)\b/i, label: 'Paste ...' },
  { pattern: /\bGenerate\s+password\.\.\./i, label: 'Generate password...' },
  { pattern: /\bClick\s+a\s+case\s+button\b/i, label: 'Click a case button' },
  { pattern: /\bHash\s+output\s+will\s+appear\b/i, label: 'Hash output will appear' }
];

function fetchPage(url, retries = 3) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : 'http://localhost:3001' + res.headers.location;
        return fetchPage(redirectUrl, retries).then(resolve);
      }
      if (res.statusCode >= 500 && retries > 0) {
        setTimeout(() => {
          fetchPage(url, retries - 1).then(resolve);
        }, 3000);
        return;
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    }).on('error', () => {
      if (retries > 0) {
        setTimeout(() => {
          fetchPage(url, retries - 1).then(resolve);
        }, 3000);
      } else {
        resolve({ statusCode: 500, body: '', error: 'Request failed' });
      }
    });
  });
}

// Extract Inner Tool UI HTML
function extractInnerToolUI(fullHtml) {
  // If streaming SSR with id="S:0", take the streamed content
  let content = fullHtml;
  const s0Start = fullHtml.indexOf('id="S:0"');
  if (s0Start !== -1) {
    const s0End = fullHtml.indexOf('</div><script>$RC("B:0"');
    content = fullHtml.substring(s0Start, s0End !== -1 ? s0End : undefined);
  } else {
    const mainStart = fullHtml.indexOf('<main');
    const mainEnd = fullHtml.indexOf('</main>');
    if (mainStart !== -1 && mainEnd !== -1) {
      content = fullHtml.substring(mainStart, mainEnd);
    }
  }

  // Strip all <script>...</script> (including Schema.org JSON-LD and Next scripts)
  content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Strip ToolSeoContent (starts with style containing margin-top:48px or border-radius:12px with About section)
  // ToolSeoContent typically has style="margin-top:48px;background-color:var(--bg-card)..."
  const seoIdx = content.indexOf('margin-top:48px');
  if (seoIdx !== -1) {
    content = content.substring(0, seoIdx);
  }

  // Also strip any feedback section
  const feedbackIdx = content.indexOf('feedbackHeading');
  if (feedbackIdx !== -1) {
    content = content.substring(0, feedbackIdx);
  }

  return content;
}

// Extract visible text, button text, labels, and placeholders from inner UI
function extractScannableTokens(innerHtml) {
  const tokens = [];

  // 1. Placeholders
  const placeholderRegex = /placeholder=["']([^"']+)["']/gi;
  let match;
  while ((match = placeholderRegex.exec(innerHtml)) !== null) {
    tokens.push({ type: 'placeholder', text: match[1] });
  }

  // 2. Titles / Aria labels
  const titleRegex = /(?:title|aria-label)=["']([^"']+)["']/gi;
  while ((match = titleRegex.exec(innerHtml)) !== null) {
    tokens.push({ type: 'attribute', text: match[1] });
  }

  // 3. Button texts
  const buttonRegex = /<button\b[^>]*>([\s\S]*?)<\/button>/gi;
  while ((match = buttonRegex.exec(innerHtml)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text) tokens.push({ type: 'button', text });
  }

  // 4. Label texts
  const labelRegex = /<label\b[^>]*>([\s\S]*?)<\/label>/gi;
  while ((match = labelRegex.exec(innerHtml)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text) tokens.push({ type: 'label', text });
  }

  // 5. Headings (h1, h2, h3, h4)
  const headingRegex = /<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/gi;
  while ((match = headingRegex.exec(innerHtml)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text) tokens.push({ type: 'heading', text });
  }

  // 6. Generic text stripped of HTML tags
  const rawText = innerHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  tokens.push({ type: 'body', text: rawText });

  return tokens;
}

async function runAudit() {
  console.log(`Starting Systematic Verification across ${ALL_TOOLS.length} tools and ${NON_EN_LOCALES.length} locales...`);
  console.log(`Total permutations: ${ALL_TOOLS.length * NON_EN_LOCALES.length}`);

  const results = {}; // tool -> { [locale]: [errors] }
  let totalScanned = 0;
  let totalErrors = 0;

  for (let idx = 0; idx < ALL_TOOLS.length; idx++) {
    const tool = ALL_TOOLS[idx];
    console.log(`[${idx + 1}/${ALL_TOOLS.length}] Auditing: ${tool}`);
    results[tool] = {};
    for (const loc of NON_EN_LOCALES) {
      totalScanned++;
      const url = `http://localhost:3001/${loc}/tools/${tool}`;
      const res = await fetchPage(url);
      await new Promise(r => setTimeout(r, 60));

      if (res.statusCode !== 200) {
        if (!results[tool][loc]) results[tool][loc] = [];
        results[tool][loc].push(`HTTP_${res.statusCode}`);
        totalErrors++;
        continue;
      }

      const innerHtml = extractInnerToolUI(res.body);
      const tokens = extractScannableTokens(innerHtml);
      const errors = new Set();

      for (const token of tokens) {
        for (const { pattern, label } of FORBIDDEN_PATTERNS) {
          if (pattern.test(token.text)) {
            // Filter out known technical false positives
            if (label === 'Format' && token.text.includes('JSON') && !token.text.includes('Format:')) {
              // Might be JSON Format in some contexts, keep if suspicious
            }
            errors.add(`${label} (in ${token.type}: "${token.text.substring(0, 40)}")`);
          }
        }
      }

      if (errors.size > 0) {
        results[tool][loc] = Array.from(errors);
        totalErrors += errors.size;
      }
    }
  }

  // Generate Report
  console.log('\n================================================================');
  console.log('                 SYSTEMATIC VERIFICATION REPORT                 ');
  console.log('================================================================');
  console.log(`Total Pages Scanned: ${totalScanned}`);
  console.log(`Total Flagged Errors: ${totalErrors}\n`);

  const cleanTools = [];
  const flaggedTools = [];

  for (const tool of ALL_TOOLS) {
    const locKeys = Object.keys(results[tool]);
    if (locKeys.length === 0) {
      cleanTools.push(tool);
    } else {
      flaggedTools.push({ tool, locales: results[tool] });
    }
  }

  console.log(`Clean Tools (${cleanTools.length} / ${ALL_TOOLS.length}):`);
  console.log(cleanTools.join(', '));
  console.log('\n----------------------------------------------------------------');
  console.log(`Flagged Tools with Hardcoded English (${flaggedTools.length} / ${ALL_TOOLS.length}):\n`);

  for (const { tool, locales } of flaggedTools) {
    console.log(`[!] TOOL: ${tool}`);
    for (const [loc, errs] of Object.entries(locales)) {
      console.log(`    - ${loc.toUpperCase()}: ${errs.join(', ')}`);
    }
    console.log('');
  }

  // Save report to JSON for programmatic consumption
  const reportPath = path.join(__dirname, 'audit_report.json');
  fs.writeFileSync(reportPath, JSON.stringify({ cleanTools, flaggedTools, totalScanned, totalErrors }, null, 2), 'utf8');
  console.log(`Full report saved to: ${reportPath}`);
}

runAudit();
