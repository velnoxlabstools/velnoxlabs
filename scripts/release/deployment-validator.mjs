#!/usr/bin/env node
import { existsSync } from 'node:fs';

const required = ['package.json', 'next.config.ts', 'tsconfig.json'];
// next.config may be .js/.mjs
const alt = ['next.config.js', 'next.config.mjs', 'next.config.ts'];
let ok = true;
for (const f of required) {
  if (f.startsWith('next.config') ) continue;
  if (!existsSync(f)) { console.error('Missing', f); ok = false; }
}
if (!alt.some((f) => existsSync(f))) {
  console.warn('next.config.* not found (may be ok in partial sandboxes)');
}
if (!existsSync('.next') && process.env.REQUIRE_BUILD_OUTPUT === '1') {
  console.error('.next missing — build before deploy');
  ok = false;
}
console.log(ok ? 'Deployment validator: OK' : 'Deployment validator: FAIL');
process.exit(ok ? 0 : 1);
