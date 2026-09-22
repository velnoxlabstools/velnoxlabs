import {
  ParsedUA,
  BrowserInfo,
  OSInfo,
  EngineInfo,
  DeviceInfo,
  CPUInfo,
  BotInfo,
  CapabilitiesInfo,
  ValidationInfo,
  ComparisonResult,
  FieldDiff,
  DeviceCategory,
  BotCategory,
} from '../types/useragent';

export function generateId(): string {
  return 'ua_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
}

export function parseUserAgent(rawUA: string): ParsedUA {
  const cleanUA = (rawUA || '').trim();
  const botInfo = detectBot(cleanUA);
  const browserInfo = detectBrowser(cleanUA, botInfo);
  const osInfo = detectOS(cleanUA);
  const engineInfo = detectEngine(cleanUA, browserInfo.name);
  const deviceInfo = detectDevice(cleanUA, osInfo, botInfo);
  const cpuInfo = detectCPU(cleanUA, osInfo);
  const capabilities = inferCapabilities(browserInfo, osInfo, engineInfo, deviceInfo);
  const validation = validateUserAgent(cleanUA);
  const humanSummary = buildHumanSummary(browserInfo, osInfo, deviceInfo, cpuInfo, botInfo);

  return {
    id: generateId(),
    rawUA: cleanUA,
    timestamp: new Date().toISOString(),
    humanSummary,
    browser: browserInfo,
    os: osInfo,
    engine: engineInfo,
    device: deviceInfo,
    cpu: cpuInfo,
    bot: botInfo,
    capabilities,
    validation,
  };
}

function detectBot(ua: string): BotInfo {
  if (!ua) {
    return { isBot: false, isAIBot: false, botName: '' };
  }

  const aiBots: Array<{
    pattern: RegExp;
    name: string;
    vendor: string;
    family: string;
    category: BotCategory;
    url?: string;
  }> = [
    { pattern: /GPTBot\/([\d.]+)/i, name: 'GPTBot', vendor: 'OpenAI', family: 'GPT-4 / ChatGPT', category: 'AI Scraper', url: 'https://openai.com/gptbot' },
    { pattern: /ChatGPT-User\/([\d.]+)/i, name: 'ChatGPT-User', vendor: 'OpenAI', family: 'ChatGPT Web Browsing', category: 'AI Scraper', url: 'https://openai.com/bot' },
    { pattern: /OpenAI-Search\/([\d.]+)/i, name: 'OpenAI-Search', vendor: 'OpenAI', family: 'OpenAI SearchBot', category: 'AI Scraper' },
    { pattern: /ClaudeBot\/([\d.]+)/i, name: 'ClaudeBot', vendor: 'Anthropic', family: 'Claude AI', category: 'AI Scraper', url: 'https://anthropic.com/claudebot' },
    { pattern: /Claude-Web\/([\d.]+)/i, name: 'Claude-Web', vendor: 'Anthropic', family: 'Claude Web Browsing', category: 'AI Scraper' },
    { pattern: /Anthropic-AI/i, name: 'Anthropic-AI', vendor: 'Anthropic', family: 'Claude AI', category: 'AI Scraper' },
    { pattern: /PerplexityBot\/([\d.]+)/i, name: 'PerplexityBot', vendor: 'Perplexity AI', family: 'Perplexity Engine', category: 'AI Scraper', url: 'https://perplexity.ai/bot' },
    { pattern: /Bytespider/i, name: 'Bytespider', vendor: 'ByteDance', family: 'ByteDance AI / TikTok', category: 'AI Scraper' },
    { pattern: /CCBot\/([\d.]+)/i, name: 'CCBot', vendor: 'Common Crawl', family: 'Common Crawl Corpus', category: 'AI Scraper', url: 'https://commoncrawl.org/faq/' },
    { pattern: /Google-Extended/i, name: 'Google-Extended', vendor: 'Google', family: 'Gemini / Google AI Training', category: 'AI Scraper' },
    { pattern: /Cohere-AI/i, name: 'Cohere-AI', vendor: 'Cohere', family: 'Cohere Models', category: 'AI Scraper' },
    { pattern: /Diffbot\/([\d.]+)/i, name: 'Diffbot', vendor: 'Diffbot', family: 'Diffbot Knowledge Graph', category: 'AI Scraper' },
    { pattern: /FacebookBot\/([\d.]+)/i, name: 'FacebookBot', vendor: 'Meta', family: 'Llama / Meta AI', category: 'AI Scraper' },
    { pattern: /Meta-ExternalAgent/i, name: 'Meta-ExternalAgent', vendor: 'Meta', family: 'Meta AI Crawler', category: 'AI Scraper' },
    { pattern: /Omegacrawler/i, name: 'Omegacrawler', vendor: 'Omega', family: 'AI Web Indexer', category: 'AI Scraper' },
    { pattern: /YouBot\/([\d.]+)/i, name: 'YouBot', vendor: 'You.com', family: 'You.com AI Search', category: 'AI Scraper' },
    { pattern: /Applebot-Extended/i, name: 'Applebot-Extended', vendor: 'Apple', family: 'Apple Intelligence Crawler', category: 'AI Scraper' },
    { pattern: /Amazonbot\/([\d.]+)/i, name: 'Amazonbot', vendor: 'Amazon', family: 'Amazon AI / Bedrock', category: 'AI Scraper' },
    { pattern: /Scrapy\/([\d.]+)/i, name: 'Scrapy', vendor: 'Open Source', family: 'Scrapy Python Framework', category: 'Generic Crawler' },
  ];

  for (const bot of aiBots) {
    if (bot.pattern.test(ua)) {
      const match = ua.match(bot.pattern);
      const version = match && match[1] ? match[1] : '';
      return {
        isBot: true,
        isAIBot: true,
        botName: version ? `${bot.name} ${version}` : bot.name,
        botCategory: bot.category,
        botVendor: bot.vendor,
        botUrl: bot.url,
        aiModelFamily: bot.family,
      };
    }
  }

  const standardBots: Array<{
    pattern: RegExp;
    name: string;
    vendor: string;
    category: BotCategory;
    url?: string;
  }> = [
    { pattern: /Googlebot-Image\/([\d.]+)/i, name: 'Googlebot Image', vendor: 'Google', category: 'Search Engine' },
    { pattern: /Googlebot-News/i, name: 'Googlebot News', vendor: 'Google', category: 'Search Engine' },
    { pattern: /Googlebot-Video\/([\d.]+)/i, name: 'Googlebot Video', vendor: 'Google', category: 'Search Engine' },
    { pattern: /Googlebot\/([\d.]+)/i, name: 'Googlebot', vendor: 'Google', category: 'Search Engine', url: 'https://google.com/bot.html' },
    { pattern: /Storebot-Google\/([\d.]+)/i, name: 'Storebot Google', vendor: 'Google', category: 'Search Engine' },
    { pattern: /Google-Read-Aloud/i, name: 'Google Read Aloud', vendor: 'Google', category: 'Search Engine' },
    { pattern: /bingbot\/([\d.]+)/i, name: 'Bingbot', vendor: 'Microsoft', category: 'Search Engine', url: 'https://bing.com/bingbot.htm' },
    { pattern: /BingPreview\/([\d.]+)/i, name: 'BingPreview', vendor: 'Microsoft', category: 'Search Engine' },
    { pattern: /YandexBot\/([\d.]+)/i, name: 'YandexBot', vendor: 'Yandex', category: 'Search Engine', url: 'https://yandex.com/bots' },
    { pattern: /YandexImages\/([\d.]+)/i, name: 'YandexImages', vendor: 'Yandex', category: 'Search Engine' },
    { pattern: /Baiduspider(-image)?\/([\d.]+)/i, name: 'Baiduspider', vendor: 'Baidu', category: 'Search Engine' },
    { pattern: /DuckDuckBot\/([\d.]+)/i, name: 'DuckDuckBot', vendor: 'DuckDuckGo', category: 'Search Engine' },
    { pattern: /Yahoo! Slurp/i, name: 'Yahoo! Slurp', vendor: 'Yahoo!', category: 'Search Engine' },
    { pattern: /Applebot\/([\d.]+)/i, name: 'Applebot', vendor: 'Apple', category: 'Search Engine' },
    { pattern: /NaverBot|Yeti\/([\d.]+)/i, name: 'Naver Yeti', vendor: 'Naver', category: 'Search Engine' },
    { pattern: /SeznamBot\/([\d.]+)/i, name: 'SeznamBot', vendor: 'Seznam', category: 'Search Engine' },
    { pattern: /Twitterbot\/([\d.]+)/i, name: 'Twitterbot', vendor: 'X / Twitter', category: 'Social Media' },
    { pattern: /facebookexternalhit\/([\d.]+)/i, name: 'Facebook Crawler', vendor: 'Meta', category: 'Social Media' },
    { pattern: /LinkedInBot\/([\d.]+)/i, name: 'LinkedInBot', vendor: 'LinkedIn', category: 'Social Media' },
    { pattern: /WhatsApp\/([\d.]+)/i, name: 'WhatsApp Bot', vendor: 'Meta', category: 'Social Media' },
    { pattern: /TelegramBot/i, name: 'TelegramBot', vendor: 'Telegram', category: 'Social Media' },
    { pattern: /Slackbot-LinkExpanding|Slackbot\/([\d.]+)/i, name: 'Slackbot', vendor: 'Slack / Salesforce', category: 'Social Media' },
    { pattern: /Pinterest\/([\d.]+)|Pinterestbot/i, name: 'Pinterestbot', vendor: 'Pinterest', category: 'Social Media' },
    { pattern: /Discordbot\/([\d.]+)/i, name: 'Discordbot', vendor: 'Discord', category: 'Social Media' },
    { pattern: /AhrefsBot\/([\d.]+)/i, name: 'AhrefsBot', vendor: 'Ahrefs', category: 'SEO Audit' },
    { pattern: /SemrushBot\/([\d.]+)/i, name: 'SemrushBot', vendor: 'Semrush', category: 'SEO Audit' },
    { pattern: /MJ12bot\/([\d.]+)/i, name: 'MJ12bot', vendor: 'Majestic', category: 'SEO Audit' },
    { pattern: /DotBot\/([\d.]+)/i, name: 'DotBot', vendor: 'Moz', category: 'SEO Audit' },
    { pattern: /Screaming Frog SEO Spider\/([\d.]+)/i, name: 'Screaming Frog', vendor: 'Screaming Frog', category: 'SEO Audit' },
    { pattern: /Exabot\/([\d.]+)/i, name: 'Exabot', vendor: 'Exalead', category: 'Search Engine' },
    { pattern: /curl\/([\d.]+)/i, name: 'cURL Command Line', vendor: 'Open Source', category: 'Generic Crawler' },
    { pattern: /Wget\/([\d.]+)/i, name: 'Wget Utility', vendor: 'GNU', category: 'Generic Crawler' },
    { pattern: /Python-urllib\/([\d.]+)|python-requests\/([\d.]+)/i, name: 'Python HTTP Client', vendor: 'Python', category: 'Generic Crawler' },
    { pattern: /Go-http-client\/([\d.]+)/i, name: 'Go HTTP Client', vendor: 'Go Language', category: 'Generic Crawler' },
    { pattern: /Apache-HttpClient\/([\d.]+)/i, name: 'Apache HttpClient', vendor: 'Apache', category: 'Generic Crawler' },
    { pattern: /HeadlessChrome\/([\d.]+)/i, name: 'Headless Chrome', vendor: 'Google', category: 'Generic Crawler' },
    { pattern: /Puppeteer/i, name: 'Puppeteer Automation', vendor: 'Google', category: 'Generic Crawler' },
    { pattern: /Playwright/i, name: 'Playwright Automation', vendor: 'Microsoft', category: 'Generic Crawler' },
    { pattern: /Selenium/i, name: 'Selenium Webdriver', vendor: 'Selenium', category: 'Generic Crawler' },
    { pattern: /bot|crawler|spider|slurp|fetcher/i, name: 'Generic Web Crawler', vendor: 'Unknown Bot', category: 'Generic Crawler' },
  ];

  for (const bot of standardBots) {
    if (bot.pattern.test(ua)) {
      const match = ua.match(bot.pattern);
      const version = match && (match[1] || match[2]) ? (match[1] || match[2]) : '';
      return {
        isBot: true,
        isAIBot: false,
        botName: version ? `${bot.name} ${version}` : bot.name,
        botCategory: bot.category,
        botVendor: bot.vendor,
        botUrl: bot.url,
      };
    }
  }

  return {
    isBot: false,
    isAIBot: false,
    botName: '',
  };
}

function detectBrowser(ua: string, botInfo: BotInfo): BrowserInfo {
  if (!ua) {
    return { name: 'Unknown', version: '', majorVersion: '', minorVersion: '', patchVersion: '', vendor: 'Unknown', type: 'Unknown' };
  }

  if (botInfo.isBot) {
    return {
      name: botInfo.botName || 'Bot Client',
      version: extractVersion(ua, botInfo.botName),
      majorVersion: extractMajorVersion(extractVersion(ua, botInfo.botName)),
      minorVersion: '0',
      patchVersion: '0',
      vendor: botInfo.botVendor || 'Automated Bot',
      type: 'Bot Client',
    };
  }

  const browserRules: Array<{
    name: string;
    vendor: string;
    pattern: RegExp;
    versionPattern?: RegExp;
    type?: 'Standard Browser' | 'Web View' | 'In-App Browser' | 'Headless Browser';
  }> = [
    { name: 'Arc', vendor: 'The Browser Company', pattern: /Arc\/([\d.]+)/i },
    { name: 'Brave', vendor: 'Brave Software', pattern: /Brave\/([\d.]+)|Brave/i, versionPattern: /Chrome\/([\d.]+)/i },
    { name: 'Vivaldi', vendor: 'Vivaldi Technologies', pattern: /Vivaldi\/([\d.]+)/i },
    { name: 'Samsung Internet', vendor: 'Samsung', pattern: /SamsungBrowser\/([\d.]+)/i },
    { name: 'Opera GX', vendor: 'Opera Software', pattern: /OPR\/([\d.]+).*OPRGX/i, versionPattern: /OPR\/([\d.]+)/i },
    { name: 'Opera Touch', vendor: 'Opera Software', pattern: /OPT\/([\d.]+)/i },
    { name: 'Opera Mini', vendor: 'Opera Software', pattern: /Opera Mini\/([\d.]+)/i },
    { name: 'Opera', vendor: 'Opera Software', pattern: /OPR\/([\d.]+)|Opera\/([\d.]+)/i },
    { name: 'Edge', vendor: 'Microsoft', pattern: /Edg\/([\d.]+)|EdgA\/([\d.]+)|EdgiOS\/([\d.]+)|Edge\/([\d.]+)/i },
    { name: 'UC Browser', vendor: 'UCWeb / Alibaba', pattern: /UCBrowser\/([\d.]+)|UCWEB\/([\d.]+)/i },
    { name: 'Yandex Browser', vendor: 'Yandex', pattern: /YaBrowser\/([\d.]+)/i },
    { name: 'DuckDuckGo Browser', vendor: 'DuckDuckGo', pattern: /ddg_android\/([\d.]+)|DuckDuckGo\/([\d.]+)/i },
    { name: 'Puffin', vendor: 'CloudMosa', pattern: /Puffin\/([\d.]+)/i },
    { name: 'QQ Browser', vendor: 'Tencent', pattern: /MQQBrowser\/([\d.]+)|QQBrowser\/([\d.]+)/i },
    { name: 'Baidu Browser', vendor: 'Baidu', pattern: /Baidubrowser\/([\d.]+)|baiduboxapp\/([\d.]+)/i },
    { name: 'Sogou Browser', vendor: 'Sogou', pattern: /MetaSr|SogouMobileBrowser\/([\d.]+)/i },
    { name: 'Maxthon', vendor: 'Maxthon', pattern: /Maxthon\/([\d.]+)|MxBrowser\/([\d.]+)/i },
    { name: 'Silk', vendor: 'Amazon', pattern: /Silk\/([\d.]+)/i },
    { name: 'Orion', vendor: 'Kagi', pattern: /Orion\/([\d.]+)/i },
    { name: 'Tor Browser', vendor: 'Tor Project', pattern: /TorBrowser\/([\d.]+)/i },
    { name: 'Waterfox', vendor: 'System1', pattern: /Waterfox\/([\d.]+)/i },
    { name: 'Pale Moon', vendor: 'Moonchild Productions', pattern: /PaleMoon\/([\d.]+)/i },
    { name: 'SeaMonkey', vendor: 'SeaMonkey Council', pattern: /SeaMonkey\/([\d.]+)/i },
    { name: 'K-Meleon', vendor: 'K-Meleon', pattern: /K-Meleon\/([\d.]+)/i },
    { name: 'Epiphany / GNOME Web', vendor: 'GNOME', pattern: /Epiphany\/([\d.]+)/i },
    { name: 'Instagram In-App', vendor: 'Meta', pattern: /Instagram/i, type: 'In-App Browser' },
    { name: 'FB Mobile WebView', vendor: 'Meta', pattern: /FBAV\/([\d.]+)|FB_IAB/i, type: 'In-App Browser' },
    { name: 'TikTok In-App', vendor: 'ByteDance', pattern: /musical_ly|ByteLocale|TikTok/i, type: 'In-App Browser' },
    { name: 'Snapchat In-App', vendor: 'Snap Inc.', pattern: /Snapchat/i, type: 'In-App Browser' },
    { name: 'Line In-App', vendor: 'Line Corp', pattern: /Line\/([\d.]+)/i, type: 'In-App Browser' },
    { name: 'WeChat In-App', vendor: 'Tencent', pattern: /MicroMessenger\/([\d.]+)/i, type: 'In-App Browser' },
    { name: 'Android WebView', vendor: 'Google', pattern: /Version\/[\d.]+\s+Chrome\/[\d.]+\s+Mobile/i, type: 'Web View' },
    { name: 'Chrome', vendor: 'Google', pattern: /Chrome\/([\d.]+)|CriOS\/([\d.]+)/i },
    { name: 'Firefox', vendor: 'Mozilla', pattern: /Firefox\/([\d.]+)|FxiOS\/([\d.]+)/i },
    { name: 'Safari', vendor: 'Apple', pattern: /Version\/([\d.]+).*Safari\/|Safari\/([\d.]+)/i, versionPattern: /Version\/([\d.]+)/i },
    { name: 'Internet Explorer', vendor: 'Microsoft', pattern: /MSIE\s([\d.]+)|Trident\/.*rv:([\d.]+)/i },
  ];

  for (const rule of browserRules) {
    if (rule.pattern.test(ua)) {
      let version = '';
      const versionReg = rule.versionPattern || rule.pattern;
      const vMatch = ua.match(versionReg);
      if (vMatch) {
        for (let i = 1; i < vMatch.length; i++) {
          if (vMatch[i]) {
            version = vMatch[i];
            break;
          }
        }
      }
      if (!version) {
        version = extractVersion(ua, rule.name);
      }
      const major = extractMajorVersion(version);
      const parts = version.split('.');
      const minor = parts[1] || '0';
      const patch = parts[2] || '0';
      return {
        name: rule.name,
        version: version || 'Unknown',
        majorVersion: major || 'Unknown',
        minorVersion: minor,
        patchVersion: patch,
        vendor: rule.vendor,
        type: rule.type || 'Standard Browser',
      };
    }
  }

  const fallbackVersion = extractVersion(ua, '');
  return {
    name: 'Generic Browser',
    version: fallbackVersion || '1.0',
    majorVersion: extractMajorVersion(fallbackVersion) || '1',
    minorVersion: '0',
    patchVersion: '0',
    vendor: 'Unknown',
    type: 'Standard Browser',
  };
}

function detectOS(ua: string): OSInfo {
  if (!ua) {
    return { name: 'Unknown OS', version: '', category: 'Unknown', vendor: 'Unknown' };
  }

  if (/Windows/i.test(ua)) {
    let ver = '';
    let name = 'Windows';
    if (/Windows NT 10.0/i.test(ua)) {
      ver = /Windows NT 10.0.*Build\/2[2-9]\d{3}/i.test(ua) ? '11' : '10 / 11';
    } else if (/Windows NT 6.3/i.test(ua)) ver = '8.1';
    else if (/Windows NT 6.2/i.test(ua)) ver = '8';
    else if (/Windows NT 6.1/i.test(ua)) ver = '7';
    else if (/Windows NT 6.0/i.test(ua)) ver = 'Vista';
    else if (/Windows NT 5.1/i.test(ua) || /Windows XP/i.test(ua)) ver = 'XP';
    else if (/Windows NT 5.0/i.test(ua)) ver = '2000';
    else if (/Windows Phone/i.test(ua)) {
      name = 'Windows Phone';
      const match = ua.match(/Windows Phone (OS )?([\d.]+)/i);
      ver = match ? match[2] : '8';
      return { name, version: ver, category: 'Mobile', vendor: 'Microsoft' };
    }
    return {
      name: 'Windows',
      version: ver || 'NT',
      category: 'Desktop',
      vendor: 'Microsoft',
    };
  }

  if (/visionOS/i.test(ua) || (/(Macintosh|Mac OS X)/i.test(ua) && /AppleVision/i.test(ua))) {
    const ver = extractOSVersion(ua, /visionOS\/([\d_.]+)/i);
    return { name: 'visionOS', version: ver || '1.0', category: 'Wearable', vendor: 'Apple' };
  }

  if (/iPad/i.test(ua)) {
    const ver = extractOSVersion(ua, /OS ([\d_]+) like Mac OS X/i) || extractOSVersion(ua, /Version\/([\d.]+)/i);
    return { name: 'iPadOS', version: ver || '17.0', category: 'Tablet', vendor: 'Apple' };
  }

  if (/iPhone|iPod/i.test(ua)) {
    const ver = extractOSVersion(ua, /OS ([\d_]+) like Mac OS X/i);
    return { name: 'iOS', version: ver || '17.0', category: 'Mobile', vendor: 'Apple' };
  }

  if (/Macintosh|Mac OS X/i.test(ua)) {
    const ver = extractOSVersion(ua, /Mac OS X ([\d_.]+)/i);
    const codeName = getMacOSCodename(ver);
    return { name: 'macOS', version: ver || '14.0', category: 'Desktop', vendor: 'Apple', codename: codeName };
  }

  if (/Android/i.test(ua)) {
    const ver = extractOSVersion(ua, /Android ([\d.]+)/i);
    const isTablet = /Tablet|iPad/i.test(ua) || !/Mobile/i.test(ua);
    const isTV = /Android TV|SmartTV|ADT-1/i.test(ua);
    return {
      name: 'Android',
      version: ver || '14.0',
      category: isTV ? 'Smart TV' : isTablet ? 'Tablet' : 'Mobile',
      vendor: 'Google',
    };
  }

  if (/CrOS/i.test(ua)) {
    const ver = extractOSVersion(ua, /CrOS \w+ ([\d.]+)/i);
    return { name: 'ChromeOS', version: ver || '120.0', category: 'Desktop', vendor: 'Google' };
  }

  if (/Ubuntu/i.test(ua)) {
    const ver = extractOSVersion(ua, /Ubuntu\/([\d.]+)/i);
    return { name: 'Ubuntu Linux', version: ver || '24.04', category: 'Desktop', vendor: 'Canonical' };
  }

  if (/Debian/i.test(ua)) return { name: 'Debian Linux', version: '', category: 'Desktop', vendor: 'Debian' };
  if (/Fedora/i.test(ua)) return { name: 'Fedora Linux', version: '', category: 'Desktop', vendor: 'Red Hat' };
  if (/Arch/i.test(ua)) return { name: 'Arch Linux', version: 'Rolling', category: 'Desktop', vendor: 'Arch Linux' };
  if (/CentOS/i.test(ua)) return { name: 'CentOS Linux', version: '', category: 'Server', vendor: 'Red Hat' };
  if (/Red Hat|RedHat/i.test(ua)) return { name: 'Red Hat Enterprise Linux', version: '', category: 'Server', vendor: 'Red Hat' };
  if (/Linux/i.test(ua)) {
    return { name: 'Linux', version: 'Generic', category: 'Desktop', vendor: 'Open Source' };
  }

  if (/FreeBSD/i.test(ua)) return { name: 'FreeBSD', version: '', category: 'Server', vendor: 'FreeBSD' };
  if (/OpenBSD/i.test(ua)) return { name: 'OpenBSD', version: '', category: 'Server', vendor: 'OpenBSD' };
  if (/NetBSD/i.test(ua)) return { name: 'NetBSD', version: '', category: 'Server', vendor: 'NetBSD' };

  if (/Tizen/i.test(ua)) {
    const ver = extractOSVersion(ua, /Tizen ([\d.]+)/i);
    return { name: 'Tizen OS', version: ver || '7.0', category: 'Smart TV', vendor: 'Samsung' };
  }

  if (/webOS|Web0S/i.test(ua)) {
    const ver = extractOSVersion(ua, /webOS\/([\d.]+)/i);
    return { name: 'webOS', version: ver || '6.0', category: 'Smart TV', vendor: 'LG' };
  }

  if (/Roku/i.test(ua)) return { name: 'Roku OS', version: '', category: 'Smart TV', vendor: 'Roku' };
  if (/PlayStation 5/i.test(ua)) return { name: 'PlayStation OS', version: 'PS5 System', category: 'Gaming', vendor: 'Sony' };
  if (/PlayStation 4/i.test(ua)) return { name: 'PlayStation OS', version: 'PS4 System', category: 'Gaming', vendor: 'Sony' };
  if (/Xbox Series X|Xbox One|Xbox/i.test(ua)) return { name: 'Xbox OS', version: 'Xbox System', category: 'Gaming', vendor: 'Microsoft' };
  if (/Nintendo Switch/i.test(ua)) return { name: 'Nintendo Horizon OS', version: 'Switch', category: 'Gaming', vendor: 'Nintendo' };

  if (/HarmonyOS/i.test(ua)) return { name: 'HarmonyOS', version: '4.0', category: 'Mobile', vendor: 'Huawei' };
  if (/KaiOS/i.test(ua)) {
    const ver = extractOSVersion(ua, /KaiOS\/([\d.]+)/i);
    return { name: 'KaiOS', version: ver || '3.0', category: 'Mobile', vendor: 'KaiOS Tech' };
  }

  return { name: 'Unknown OS', version: '', category: 'Unknown', vendor: 'Unknown' };
}

function detectEngine(ua: string, browserName: string): EngineInfo {
  if (!ua) return { name: 'Unknown', version: '' };
  if (/Blink/i.test(ua) || (/Chrome\/[\d.]+/i.test(ua) && !/Gecko\/[\d.]+\s+Firefox/i.test(ua))) {
    const v = extractOSVersion(ua, /Chrome\/([\d.]+)/i);
    return { name: 'Blink', version: v || 'Latest' };
  }
  if (/AppleWebKit\/([\d.]+)/i.test(ua)) {
    const v = extractOSVersion(ua, /AppleWebKit\/([\d.]+)/i);
    if (/Firefox\/[\d.]+/i.test(ua) || /Gecko\/[\d.]+/i.test(ua)) {
      const gv = extractOSVersion(ua, /rv:([\d.]+)/i) || extractOSVersion(ua, /Gecko\/([\d.]+)/i);
      return { name: 'Gecko', version: gv || 'Latest' };
    }
    return { name: 'WebKit', version: v || 'Latest' };
  }
  if (/Gecko\/[\d.]+/i.test(ua) || /rv:[\d.]+/i.test(ua)) {
    const v = extractOSVersion(ua, /rv:([\d.]+)/i) || extractOSVersion(ua, /Gecko\/([\d.]+)/i);
    return { name: 'Gecko', version: v || 'Latest' };
  }
  if (/Trident\/([\d.]+)/i.test(ua)) {
    const v = extractOSVersion(ua, /Trident\/([\d.]+)/i);
    return { name: 'Trident', version: v || '7.0' };
  }
  if (/EdgeHTML\/([\d.]+)/i.test(ua)) {
    const v = extractOSVersion(ua, /EdgeHTML\/([\d.]+)/i);
    return { name: 'EdgeHTML', version: v || '18.0' };
  }
  if (/Presto\/([\d.]+)/i.test(ua)) {
    const v = extractOSVersion(ua, /Presto\/([\d.]+)/i);
    return { name: 'Presto', version: v || '2.12' };
  }
  if (/Servo/i.test(ua)) return { name: 'Servo', version: 'Experimental' };
  if (/Goanna\/([\d.]+)/i.test(ua)) return { name: 'Goanna', version: extractOSVersion(ua, /Goanna\/([\d.]+)/i) };
  return { name: 'Unknown Engine', version: '' };
}

function detectDevice(ua: string, osInfo: OSInfo, botInfo: BotInfo): DeviceInfo {
  if (botInfo.isBot) {
    return {
      type: 'Bot',
      vendor: botInfo.botVendor || 'Automated Crawler',
      model: botInfo.botName || 'Bot Unit',
      isMobile: false,
      isTablet: false,
      isDesktop: false,
      isTouchCapable: false,
    };
  }

  let type: DeviceCategory = 'Desktop';
  let vendor = 'Generic';
  let model = '';

  if (/iPhone/i.test(ua)) {
    type = 'Mobile';
    vendor = 'Apple';
    model = detectiPhoneModel(ua);
  } else if (/iPad/i.test(ua)) {
    type = 'Tablet';
    vendor = 'Apple';
    model = detectiPadModel(ua);
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    type = osInfo.name === 'iPadOS' ? 'Tablet' : 'Desktop';
    vendor = 'Apple';
    model = 'Mac (Desktop / Laptop)';
  } else if (/AppleVision|visionOS/i.test(ua)) {
    type = 'Wearable';
    vendor = 'Apple';
    model = 'Apple Vision Pro';
  } else if (/Apple Watch/i.test(ua)) {
    type = 'Wearable';
    vendor = 'Apple';
    model = 'Apple Watch';
  } else if (/Samsung|SM-[A-Z0-9]+|GT-[A-Z0-9]+/i.test(ua)) {
    vendor = 'Samsung';
    type = /Tablet|SM-T|SM-X/i.test(ua) ? 'Tablet' : 'Mobile';
    const match = ua.match(/(SM-[A-Z0-9]+|GT-[A-Z0-9]+)/i);
    model = match ? getSamsungModelName(match[1]) : 'Galaxy Device';
  } else if (/Pixel [0-9a-zA-Z\s]+|Nexus [0-9]+/i.test(ua)) {
    vendor = 'Google';
    const match = ua.match(/(Pixel [0-9a-zA-Z\s]+|Nexus [0-9a-zA-Z]+)/i);
    model = match ? match[1] : 'Pixel Device';
    type = /Tablet|Pixel Tablet/i.test(ua) ? 'Tablet' : 'Mobile';
  } else if (/PlayStation 5/i.test(ua)) {
    type = 'Console'; vendor = 'Sony'; model = 'PlayStation 5';
  } else if (/PlayStation 4/i.test(ua)) {
    type = 'Console'; vendor = 'Sony'; model = 'PlayStation 4';
  } else if (/Xbox Series X|Xbox Series S/i.test(ua)) {
    type = 'Console'; vendor = 'Microsoft'; model = 'Xbox Series X/S';
  } else if (/Xbox One/i.test(ua)) {
    type = 'Console'; vendor = 'Microsoft'; model = 'Xbox One';
  } else if (/Nintendo Switch/i.test(ua)) {
    type = 'Console'; vendor = 'Nintendo'; model = 'Nintendo Switch';
  } else if (/Steam Deck/i.test(ua)) {
    type = 'Console'; vendor = 'Valve'; model = 'Steam Deck';
  } else if (/Oculus Quest|Quest 3|Quest 2/i.test(ua)) {
    type = 'Wearable'; vendor = 'Meta / Oculus'; model = 'Meta Quest VR';
  } else if (/SmartTV|Tizen|webOS|Roku|Android TV|AppleTV|BRAVIA|Vizio/i.test(ua)) {
    type = 'Smart TV';
    if (/LG/i.test(ua) || /webOS/i.test(ua)) vendor = 'LG';
    else if (/Samsung/i.test(ua) || /Tizen/i.test(ua)) vendor = 'Samsung';
    else if (/Sony/i.test(ua)) vendor = 'Sony';
    else if (/Roku/i.test(ua)) vendor = 'Roku';
    model = 'Smart TV Display';
  } else if (/Kindle|Silk|KFOT|KFTT|KFJWI|KFJWA|KFSOWI|KFTHWI|KFAPWI|KFARWI|KFASWI|KFSAWI|KFSAWA/i.test(ua)) {
    vendor = 'Amazon';
    type = 'Tablet';
    model = 'Amazon Fire / Kindle';
  } else if (/Xiaomi|Redmi|POCO|Mi /i.test(ua)) {
    vendor = 'Xiaomi';
    type = /Pad|Tablet/i.test(ua) ? 'Tablet' : 'Mobile';
    model = 'Xiaomi / Redmi Device';
  } else if (/OnePlus|ONEPLUS/i.test(ua)) {
    vendor = 'OnePlus';
    type = 'Mobile';
    model = 'OnePlus Device';
  } else if (/Huawei|HUAWEI|Honor/i.test(ua)) {
    vendor = 'Huawei';
    type = /Pad|MediaPad/i.test(ua) ? 'Tablet' : 'Mobile';
    model = 'Huawei / Honor Device';
  } else if (osInfo.category === 'Mobile') {
    type = 'Mobile';
    if (!model) model = `${osInfo.name} Smartphone`;
  } else if (osInfo.category === 'Tablet') {
    type = 'Tablet';
    if (!model) model = `${osInfo.name} Tablet`;
  } else if (osInfo.category === 'Desktop') {
    type = 'Desktop';
    if (!model) model = `${osInfo.name} Computer`;
  }

  const isMobile = type === 'Mobile';
  const isTablet = type === 'Tablet';
  const isDesktop = type === 'Desktop';
  const isTouchCapable = isMobile || isTablet || type === 'Wearable' || /Touch/i.test(ua);

  return {
    type,
    vendor: vendor || 'Generic',
    model: model || (type === 'Desktop' ? 'PC Desktop / Laptop' : 'Generic Device'),
    isMobile,
    isTablet,
    isDesktop,
    isTouchCapable,
  };
}

function detectCPU(ua: string, osInfo: OSInfo): CPUInfo {
  if (!ua) return { architecture: 'Unknown', bitness: 'Unknown' };

  if (osInfo.name === 'macOS' || osInfo.name === 'iPadOS') {
    if (/arm64|aarch64|Apple Silicon/i.test(ua) || (osInfo.version && parseFloat(osInfo.version) >= 11 && !/Intel/i.test(ua))) {
      return { architecture: 'Apple Silicon', bitness: '64-bit' };
    }
    if (/Intel/i.test(ua)) {
      return { architecture: 'x86_64', bitness: '64-bit' };
    }
    return { architecture: 'Apple Silicon', bitness: '64-bit' };
  }

  if (/x86_64|x64|Win64|WOW64|x86-64|amd64/i.test(ua)) {
    return { architecture: 'x86_64', bitness: '64-bit' };
  }
  if (/aarch64|arm64|armv8|ARM64/i.test(ua)) {
    return { architecture: 'ARM64', bitness: '64-bit' };
  }
  if (/armv7|armv6|arm32|ARM/i.test(ua)) {
    return { architecture: 'ARM32', bitness: '32-bit' };
  }
  if (/i686|i386|x86|Win32/i.test(ua)) {
    return { architecture: 'x86', bitness: '32-bit' };
  }
  if (/PPC|PowerPC/i.test(ua)) {
    return { architecture: 'PowerPC', bitness: '32-bit' };
  }

  if (osInfo.name === 'Windows' || osInfo.name === 'Ubuntu Linux') {
    return { architecture: 'x86_64', bitness: '64-bit' };
  }
  if (osInfo.category === 'Mobile' || osInfo.category === 'Tablet') {
    return { architecture: 'ARM64', bitness: '64-bit' };
  }

  return { architecture: 'Unknown', bitness: 'Unknown' };
}

function inferCapabilities(
  browser: BrowserInfo,
  os: OSInfo,
  engine: EngineInfo,
  device: DeviceInfo
): CapabilitiesInfo {
  const major = parseInt(browser.majorVersion, 10) || 0;
  const isModern = major > 80;
  const isChromeLike = ['Chrome', 'Edge', 'Brave', 'Opera', 'Vivaldi', 'Samsung Internet'].includes(browser.name);
  const isFirefox = browser.name === 'Firefox';
  const isSafari = browser.name === 'Safari';

  return {
    webgl: true,
    webgpu: (isChromeLike && major >= 113) || (isSafari && major >= 18) ? true : 'Likely',
    webassembly: isModern || major > 60 ? true : 'Likely',
    webrtc: isModern || major > 60 ? true : 'Likely',
    serviceWorker: isModern || major > 50 ? true : 'Likely',
    touchEvents: device.isTouchCapable,
    es2023: isModern || major >= 100 ? true : 'Likely',
    pwa: isChromeLike || isFirefox || isSafari ? true : 'Likely',
    cookieSupport: true,
    doNotTrack: false,
    clientHints: isChromeLike && major >= 85,
  };
}

function validateUserAgent(ua: string): ValidationInfo {
  const warnings: string[] = [];
  const anomalies: string[] = [];
  const rawTokens: string[] = [];
  const unknownTokens: string[] = [];

  if (!ua) {
    return {
      isValid: false,
      length: 0,
      warnings: ['User-Agent string is empty'],
      anomalies: [],
      unknownTokens: [],
      rawTokens: [],
      hasMozillaPrefix: false,
      rfcCompliant: false,
    };
  }

  const length = ua.length;
  if (length > 512) {
    warnings.push('Unusually long User-Agent string (> 512 characters)');
  } else if (length < 15) {
    warnings.push('Very short User-Agent string (< 15 characters)');
  }

  const hasMozillaPrefix = /^Mozilla\/[\d.]+/i.test(ua);
  if (!hasMozillaPrefix && !/bot|crawler|curl|wget|python|go-http/i.test(ua)) {
    warnings.push('Missing standard "Mozilla/5.0" prefix required by HTTP conventions');
  }

  const tokenMatches = ua.match(/[\w-]+(\/[\d.]+)?|\(([^)]+)\)/g);
  if (tokenMatches) {
    tokenMatches.forEach((tok) => {
      rawTokens.push(tok);
      const isKnown = /Mozilla|AppleWebKit|Chrome|Safari|Firefox|Edge|Gecko|Windows|Macintosh|Android|Linux|Mobile|Trident|Khtml|Version|OPR|Brave|Vivaldi|SamsungBrowser|UCBrowser|GPTBot|Googlebot|bingbot|Yandex/i.test(tok);
      if (!isKnown && tok.length > 3 && !tok.startsWith('(')) {
        unknownTokens.push(tok);
      }
    });
  }

  if (/Chrome/i.test(ua) && /Safari/i.test(ua) && !/AppleWebKit/i.test(ua)) {
    anomalies.push('Claims Chrome and Safari without WebKit rendering engine (Spoof indicator)');
  }
  if (/Windows/i.test(ua) && /iPhone/i.test(ua)) {
    anomalies.push('Conflicting OS declarations: Windows and iPhone');
  }

  const rfcCompliant = hasMozillaPrefix && length < 500 && anomalies.length === 0;

  return {
    isValid: warnings.length === 0 && anomalies.length === 0,
    length,
    warnings,
    anomalies,
    unknownTokens: Array.from(new Set(unknownTokens)).slice(0, 8),
    rawTokens: rawTokens.slice(0, 15),
    hasMozillaPrefix,
    rfcCompliant,
  };
}

function buildHumanSummary(
  browser: BrowserInfo,
  os: OSInfo,
  device: DeviceInfo,
  cpu: CPUInfo,
  bot: BotInfo
): string {
  if (bot.isBot) {
    if (bot.isAIBot) {
      return `${bot.botName} (AI Crawler / ${bot.aiModelFamily || 'LLM Scraper'}) by ${bot.botVendor || 'AI Vendor'}`;
    }
    return `${bot.botName} (${bot.botCategory || 'Automated Web Crawler'}) by ${bot.botVendor || 'Bot Provider'}`;
  }

  const browserText = browser.version !== 'Unknown' ? `${browser.name} ${browser.majorVersion}` : browser.name;
  const osText = os.version ? `${os.name} ${os.version}` : os.name;
  const cpuText = cpu.architecture !== 'Unknown' ? ` (${cpu.architecture})` : '';
  const deviceText = device.model ? ` on ${device.model}` : ` on ${device.type}`;

  return `${browserText} on ${osText}${cpuText}${deviceText}`;
}

export function compareUserAgents(rawUA1: string, rawUA2: string): ComparisonResult {
  const p1 = parseUserAgent(rawUA1);
  const p2 = parseUserAgent(rawUA2);
  const diffs: FieldDiff[] = [];

  const addDiff = (category: string, field: string, val1: string, val2: string) => {
    diffs.push({
      category,
      field,
      val1: val1 || 'N/A',
      val2: val2 || 'N/A',
      isMatch: val1 === val2,
    });
  };

  addDiff('Browser', 'Browser Name', p1.browser.name, p2.browser.name);
  addDiff('Browser', 'Major Version', p1.browser.majorVersion, p2.browser.majorVersion);
  addDiff('Browser', 'Full Version', p1.browser.version, p2.browser.version);
  addDiff('Browser', 'Vendor', p1.browser.vendor, p2.browser.vendor);
  addDiff('OS', 'Operating System', p1.os.name, p2.os.name);
  addDiff('OS', 'OS Version', p1.os.version, p2.os.version);
  addDiff('OS', 'OS Category', p1.os.category, p2.os.category);
  addDiff('Engine', 'Rendering Engine', p1.engine.name, p2.engine.name);
  addDiff('Engine', 'Engine Version', p1.engine.version, p2.engine.version);
  addDiff('Device', 'Device Type', p1.device.type, p2.device.type);
  addDiff('Device', 'Vendor', p1.device.vendor, p2.device.vendor);
  addDiff('Device', 'Model', p1.device.model, p2.device.model);
  addDiff('CPU', 'Architecture', p1.cpu.architecture, p2.cpu.architecture);
  addDiff('CPU', 'Bitness', p1.cpu.bitness, p2.cpu.bitness);
  addDiff('Bot / Crawler', 'Bot Detection', p1.bot.isBot ? 'Yes (Bot)' : 'No (Human)', p2.bot.isBot ? 'Yes (Bot)' : 'No (Human)');
  addDiff('Bot / Crawler', 'AI Crawler', p1.bot.isAIBot ? 'Yes (AI Bot)' : 'No', p2.bot.isAIBot ? 'Yes (AI Bot)' : 'No');

  const matchesCount = diffs.filter((d) => d.isMatch).length;
  const similarityScore = Math.round((matchesCount / diffs.length) * 100);

  return {
    ua1: rawUA1,
    ua2: rawUA2,
    parsed1: p1,
    parsed2: p2,
    differences: diffs,
    similarityScore,
  };
}

function extractVersion(ua: string, name: string): string {
  if (!ua) return '1.0';
  if (name) {
    const esc = name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const match = ua.match(new RegExp(`${esc}[\\/\\s]([\\d.]+)`, 'i'));
    if (match && match[1]) return match[1];
  }
  const genericMatch = ua.match(/(Version|Chrome|Firefox|Safari|OPR|Edg|MSIE|rv:)\/([\d.]+)/i);
  return genericMatch && genericMatch[2] ? genericMatch[2] : '1.0.0';
}

function extractMajorVersion(versionString: string): string {
  if (!versionString) return '1';
  const first = versionString.split('.')[0];
  return first && !isNaN(parseInt(first, 10)) ? first : versionString;
}

function extractOSVersion(ua: string, regex: RegExp): string {
  const m = ua.match(regex);
  if (m && m[1]) {
    return m[1].replace(/_/g, '.');
  }
  return '';
}

function getMacOSCodename(version: string): string {
  if (!version) return '';
  if (version.startsWith('14')) return 'Sonoma';
  if (version.startsWith('13')) return 'Ventura';
  if (version.startsWith('12')) return 'Monterey';
  if (version.startsWith('11')) return 'Big Sur';
  if (version.startsWith('10.15')) return 'Catalina';
  if (version.startsWith('10.14')) return 'Mojave';
  if (version.startsWith('10.13')) return 'High Sierra';
  if (version.startsWith('10.12')) return 'Sierra';
  return 'macOS Release';
}

function detectiPhoneModel(ua: string): string {
  if (/iPhone16,1|iPhone16,2/i.test(ua)) return 'iPhone 15 Pro / Pro Max';
  if (/iPhone15,2|iPhone15,3/i.test(ua)) return 'iPhone 14 Pro / Pro Max';
  if (/iPhone14,2|iPhone14,3/i.test(ua)) return 'iPhone 13 Pro / Pro Max';
  return 'iPhone';
}

function detectiPadModel(ua: string): string {
  if (/iPad14,3|iPad14,4/i.test(ua)) return 'iPad Pro 11" (M2)';
  if (/iPad13,1|iPad13,2/i.test(ua)) return 'iPad Air (5th Gen)';
  return 'iPad';
}

function getSamsungModelName(modelCode: string): string {
  const code = modelCode.toUpperCase();
  if (code.includes('S928') || code.includes('S926') || code.includes('S921')) return `Galaxy S24 (${code})`;
  if (code.includes('S918') || code.includes('S916') || code.includes('S911')) return `Galaxy S23 (${code})`;
  if (code.includes('F946') || code.includes('F731')) return `Galaxy Z Fold5 / Flip5 (${code})`;
  return `Samsung Galaxy (${code})`;
}