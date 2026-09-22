#!/usr/bin/env node
/**
 * Local quality gate — mirrors CI blockers.
 */
import { spawnSync } from 'node:child_process';

const steps = [
  ['pnpm', ['lint']],
  ['pnpm', ['typecheck']],
  ['pnpm', ['test:unit']],
];

let failed = false;
for (const [cmd, args] of steps) {
  console.log('\n>>', cmd, args.join(' '));
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status !== 0) failed = true;
}
process.exit(failed ? 1 : 0);
