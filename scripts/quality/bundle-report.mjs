#!/usr/bin/env node
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dir = '.next';
if (!existsSync(dir)) {
  console.log('Bundle report: .next not found (run build first)');
  process.exit(0);
}

function walk(p, acc = []) {
  for (const name of readdirSync(p)) {
    const full = join(p, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (/\.(js|css)$/.test(name)) acc.push({ full, size: st.size });
  }
  return acc;
}

const files = walk(dir).sort((a, b) => b.size - a.size).slice(0, 15);
const total = files.reduce((s, f) => s + f.size, 0);
console.log('Top bundle-ish artifacts under .next (sample):');
for (const f of files) {
  console.log(String(Math.round(f.size / 1024)).padStart(8), 'KB', f.full);
}
console.log('Sampled total:', Math.round(total / 1024), 'KB');
