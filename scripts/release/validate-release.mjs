#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const version = pkg.version || '';
if (!/^\d+\.\d+\.\d+/.test(version)) {
  console.error('Invalid semver in package.json:', version);
  process.exit(1);
}
console.log('Release version OK:', version);
if (!existsSync('CHANGELOG.md')) {
  console.warn('CHANGELOG.md missing — run changelog-generator');
} else {
  console.log('CHANGELOG.md present');
}
