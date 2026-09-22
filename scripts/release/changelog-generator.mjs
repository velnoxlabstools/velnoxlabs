#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const date = new Date().toISOString().slice(0, 10);
let range = '';
try {
  range = execSync('git log -20 --pretty=format:"- %s (%h)"', { encoding: 'utf8' });
} catch {
  range = '- Initial automation setup';
}
const entry = `## v${pkg.version} — ${date}

${range}

`;
const path = 'CHANGELOG.md';
const prev = existsSync(path) ? readFileSync(path, 'utf8') : '# Changelog

';
writeFileSync(path, prev.startsWith('#') ? prev.replace('# Changelog

', '# Changelog

' + entry) : entry + prev);
console.log('CHANGELOG updated for', pkg.version);
