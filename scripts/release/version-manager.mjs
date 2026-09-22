#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const arg = process.argv[2] || 'patch';
const parts = String(pkg.version || '0.1.0').split('.').map(Number);
if (arg === 'major') { parts[0]++; parts[1]=0; parts[2]=0; }
else if (arg === 'minor') { parts[1]++; parts[2]=0; }
else { parts[2]++; }
pkg.version = parts.join('.');
writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log('version ->', pkg.version);
