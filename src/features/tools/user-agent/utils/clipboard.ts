export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback if Clipboard API fails in iframe
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Copy to clipboard failed:', err);
    return false;
  }
}

export function formatAsTextReport(parsed: any): string {
  if (!parsed) return '';
  return `==================================================
VELNOX LABS - USER-AGENT PARSER REPORT (#23)
==================================================
Raw User-Agent: ${parsed.rawUA}
Parsed At: ${new Date(parsed.timestamp).toLocaleString()}

HUMAN SUMMARY:
${parsed.humanSummary}

BROWSER DETAILS:
- Name: ${parsed.browser.name}
- Full Version: ${parsed.browser.version} (Major: ${parsed.browser.majorVersion})
- Vendor: ${parsed.browser.vendor}
- Type: ${parsed.browser.type}

OPERATING SYSTEM:
- Name: ${parsed.os.name} ${parsed.os.version || ''}
- Category: ${parsed.os.category}
- Vendor: ${parsed.os.vendor}

RENDERING ENGINE:
- Engine: ${parsed.engine.name} ${parsed.engine.version}

DEVICE & HARDWARE:
- Category: ${parsed.device.type}
- Vendor: ${parsed.device.vendor}
- Model: ${parsed.device.model}
- Touch Capable: ${parsed.device.isTouchCapable ? 'Yes' : 'No'}

CPU ARCHITECTURE:
- Architecture: ${parsed.cpu.architecture}
- Bitness: ${parsed.cpu.bitness}

BOT & AI CRAWLER DETECTION:
- Is Bot: ${parsed.bot.isBot ? 'YES' : 'NO'}
- Is AI Bot: ${parsed.bot.isAIBot ? 'YES' : 'NO'}
${parsed.bot.isBot ? `- Bot Name: ${parsed.bot.botName}\n- Category: ${parsed.bot.botCategory || 'General'}\n- Vendor: ${parsed.bot.botVendor || 'N/A'}` : ''}

VALIDATION & RFC:
- Status: ${parsed.validation.isValid ? 'VALID' : 'WARNINGS DETECTED'}
- Length: ${parsed.validation.length} chars
${parsed.validation.warnings.length > 0 ? `- Warnings: ${parsed.validation.warnings.join('; ')}` : ''}
==================================================`;
}

export function formatAsMarkdownTable(parsed: any): string {
  if (!parsed) return '';
  return `### User-Agent Analysis Report

**Raw UA:** \`${parsed.rawUA}\`  
**Summary:** ${parsed.humanSummary}

| Metric | Property Value |
| :--- | :--- |
| **Browser** | ${parsed.browser.name} ${parsed.browser.version} |
| **Browser Vendor** | ${parsed.browser.vendor} |
| **OS** | ${parsed.os.name} ${parsed.os.version} (${parsed.os.category}) |
| **Rendering Engine** | ${parsed.engine.name} ${parsed.engine.version} |
| **Device Model** | ${parsed.device.vendor} ${parsed.device.model} (${parsed.device.type}) |
| **CPU Architecture** | ${parsed.cpu.architecture} (${parsed.cpu.bitness}) |
| **Bot Detection** | ${parsed.bot.isBot ? `🤖 ${parsed.bot.botName}` : '🛡️ Human Browser'} |
| **AI Bot** | ${parsed.bot.isAIBot ? 'YES' : 'NO'} |
`;
}