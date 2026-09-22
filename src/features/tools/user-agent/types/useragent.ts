export type DeviceCategory =
  | 'Desktop'
  | 'Mobile'
  | 'Tablet'
  | 'Smart TV'
  | 'Wearable'
  | 'Console'
  | 'Embedded'
  | 'Bot';

export type BotCategory =
  | 'Search Engine'
  | 'AI Scraper'
  | 'Social Media'
  | 'SEO Audit'
  | 'Monitoring'
  | 'Generic Crawler';

export interface BrowserInfo {
  name: string;
  version: string;
  majorVersion: string;
  minorVersion: string;
  patchVersion: string;
  vendor: string;
  type: 'Standard Browser' | 'Web View' | 'In-App Browser' | 'Headless Browser' | 'Bot Client' | 'Unknown';
}

export interface OSInfo {
  name: string;
  version: string;
  category: 'Desktop' | 'Mobile' | 'Tablet' | 'Wearable' | 'Server' | 'Gaming' | 'Smart TV' | 'Embedded' | 'Unknown';
  vendor: string;
  codename?: string;
}

export interface EngineInfo {
  name: string;
  version: string;
}

export interface DeviceInfo {
  type: DeviceCategory;
  vendor: string;
  model: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchCapable: boolean;
}

export interface CPUInfo {
  architecture: 'x86_64' | 'ARM64' | 'ARM32' | 'x86' | 'Apple Silicon' | 'PowerPC' | 'MIPS' | 'RISC-V' | 'Unknown';
  bitness: '64-bit' | '32-bit' | 'Unknown';
}

export interface BotInfo {
  isBot: boolean;
  isAIBot: boolean;
  botName: string;
  botCategory?: BotCategory;
  botVendor?: string;
  botUrl?: string;
  aiModelFamily?: string;
}

export interface CapabilitiesInfo {
  webgl: boolean | 'Likely';
  webgpu: boolean | 'Likely';
  webassembly: boolean | 'Likely';
  webrtc: boolean | 'Likely';
  serviceWorker: boolean | 'Likely';
  touchEvents: boolean;
  es2023: boolean | 'Likely';
  pwa: boolean | 'Likely';
  cookieSupport: boolean;
  doNotTrack: boolean;
  clientHints: boolean;
}

export interface ValidationInfo {
  isValid: boolean;
  length: number;
  warnings: string[];
  anomalies: string[];
  unknownTokens: string[];
  rawTokens: string[];
  hasMozillaPrefix: boolean;
  rfcCompliant: boolean;
}

export interface ParsedUA {
  id: string;
  rawUA: string;
  timestamp: string;
  humanSummary: string;
  browser: BrowserInfo;
  os: OSInfo;
  engine: EngineInfo;
  device: DeviceInfo;
  cpu: CPUInfo;
  bot: BotInfo;
  capabilities: CapabilitiesInfo;
  validation: ValidationInfo;
}

export interface FieldDiff {
  category: string;
  field: string;
  val1: string;
  val2: string;
  isMatch: boolean;
}

export interface ComparisonResult {
  ua1: string;
  ua2: string;
  parsed1: ParsedUA;
  parsed2: ParsedUA;
  differences: FieldDiff[];
  similarityScore: number;
}

export interface BatchItem {
  id: string;
  rawUA: string;
  parsed: ParsedUA;
  status: 'success' | 'warning' | 'error';
  warningsCount: number;
}

export interface HistoryItem {
  parsed: ParsedUA;
  isPinned: boolean;
  tags: string[];
}

export interface PresetUA {
  id: string;
  name: string;
  category: 'Desktop' | 'Mobile & Tablet' | 'Search Engine Crawlers' | 'AI Bots & Scrapers' | 'Gaming & Smart TV' | 'Legacy & Rare' | 'Spoofed / Custom';
  ua: string;
  description: string;
  tags: string[];
}

export type ViewTab = 'live' | 'compare' | 'batch' | 'analytics' | 'history';
export type ExportFormat = 'json' | 'txt' | 'csv';