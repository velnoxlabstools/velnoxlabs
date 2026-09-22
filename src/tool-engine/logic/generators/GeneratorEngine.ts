import type { ToolLogicModule, LogicInput, LogicOutput } from '../types';
import { validateAgainstSchema, asNumber, asString } from '../utils';
import { SharedLogicUtilities } from '../shared';

function getCrypto(): Crypto {
  if (typeof crypto !== 'undefined') return crypto;
  throw new Error('Web Cryptography API is not available');
}

function generateUuidV4(): string {
  const c = getCrypto();
  if (typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  const bytes = new Uint8Array(16);
  c.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function generateUuidV7(): string {
  const c = getCrypto();
  const bytes = new Uint8Array(16);
  c.getRandomValues(bytes);
  const now = Date.now();
  bytes[0] = Math.floor(now / 0x10000000000) & 0xff;
  bytes[1] = Math.floor(now / 0x100000000) & 0xff;
  bytes[2] = Math.floor(now / 0x1000000) & 0xff;
  bytes[3] = Math.floor(now / 0x10000) & 0xff;
  bytes[4] = Math.floor(now / 0x100) & 0xff;
  bytes[5] = now & 0xff;
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function generateUuidV1(): string {
  const c = getCrypto();
  const bytes = new Uint8Array(16);
  c.getRandomValues(bytes);
  const GREGORIAN_OFFSET = 122192928000000000n;
  const nowNs = BigInt(Date.now()) * 10000n + GREGORIAN_OFFSET;
  const timeLow = Number(nowNs & 0xffffffffn);
  const timeMid = Number((nowNs >> 32n) & 0xffffn);
  const timeHi = Number((nowNs >> 48n) & 0x0fffn);
  bytes[0] = (timeLow >>> 24) & 0xff;
  bytes[1] = (timeLow >>> 16) & 0xff;
  bytes[2] = (timeLow >>> 8) & 0xff;
  bytes[3] = timeLow & 0xff;
  bytes[4] = (timeMid >>> 8) & 0xff;
  bytes[5] = timeMid & 0xff;
  bytes[6] = ((timeHi >>> 8) & 0x0f) | 0x10;
  bytes[7] = timeHi & 0xff;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  bytes[10] |= 0x01;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function randomPassword(length: number, opts: { symbols?: boolean; numbers?: boolean } = {}): string {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  const symbols = '!@#$%^&*()-_=+[]{}';
  let chars = lower + upper;
  if (opts.numbers !== false) chars += nums;
  if (opts.symbols) chars += symbols;
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

export const GeneratorEngine: ToolLogicModule = {
  id: 'generator-base',
  name: 'GeneratorEngine',
  category: 'general',
  kind: 'generator',
  inputSchema: [
    { name: 'length', type: 'number' },
    { name: 'mode', type: 'string' },
    { name: 'count', type: 'number' },
    { name: 'version', type: 'string' },
    { name: 'casing', type: 'string' },
    { name: 'hyphens', type: 'boolean' },
  ],
  outputSchema: [{ name: 'result', type: 'string' }],
  validate(input: LogicInput) {
    return validateAgainstSchema(input, this.inputSchema);
  },
  process(input: LogicInput): LogicOutput {
    const rawMode = asString(input.mode, '').toLowerCase();
    const count = SharedLogicUtilities.clamp(asNumber(input.count, 1), 1, 10000);
    const version = asString(input.version, 'v4').toLowerCase();
    const casing = asString(input.casing, 'lower').toLowerCase();
    const hasHyphens = input.hyphens !== false;

    // UUID Generation Branch
    if (rawMode === 'uuid' || rawMode === 'uuid-v4' || rawMode === '' || rawMode.includes('uuid')) {
      const list: string[] = [];
      for (let i = 0; i < count; i++) {
        let id = '';
        if (version === 'v7') id = generateUuidV7();
        else if (version === 'v1') id = generateUuidV1();
        else if (version === 'nil') id = '00000000-0000-0000-0000-000000000000';
        else id = generateUuidV4();

        if (!hasHyphens) id = id.replace(/-/g, '');
        if (casing === 'upper' || casing === 'uppercase') id = id.toUpperCase();
        else id = id.toLowerCase();

        list.push(id);
      }
      return { result: list.join('\n'), count: list.length };
    }

    if (rawMode === 'lorem' || rawMode === 'lorem-ipsum') {
      const words = LOREM.split(/\s+/);
      const take = SharedLogicUtilities.clamp(asNumber(input.length, 50), 1, 500);
      const out: string[] = [];
      for (let i = 0; i < take; i++) out.push(words[i % words.length]);
      return { result: out.join(' ') };
    }

    const length = SharedLogicUtilities.clamp(asNumber(input.length, 16), 1, 256);
    const symbols = input.symbols === true || input.symbols === 'true';
    return { result: randomPassword(length, { symbols, numbers: true }) };
  },
};