#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const checks = [];
function check(id, ok, message) {
  checks.push({ id, ok: Boolean(ok), message });
  console.log(ok ? 'PASS' : 'FAIL', id, '-', message);
}

check('package.json', existsSync('package.json'), 'package.json present');
check('env-example', existsSync('.env.example'), '.env.example present');
check('ci-workflow', existsSync('.github/workflows/ci.yml'), 'CI workflow present');
check('security-headers', existsSync('src/security/headers/securityHeaders.ts'), 'Security headers module');
check('environment', existsSync('src/environment/index.ts'), 'Environment module');
check('monitoring', existsSync('src/monitoring/index.ts'), 'Monitoring module');
check('recovery', existsSync('src/recovery/index.ts'), 'Recovery module');
check('docs', existsSync('docs/README.md'), 'Documentation hub');
check('tests', existsSync('tests/unit') && existsSync('vitest.config.ts'), 'Test infrastructure');

let pkg = {};
try {
  pkg = JSON.parse(readFileSync('package.json', 'utf8'));
} catch { /* */ }
check('scripts-build', Boolean(pkg.scripts?.build), 'build script');
check('scripts-test', Boolean(pkg.scripts?.test), 'test script');

// Optional command gates (skip if tools missing)
function tryRun(label, cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', shell: process.platform === 'win32' });
  const ok = r.status === 0;
  check(label, ok, ok ? 'ok' : (r.stderr || r.stdout || 'failed').toString().slice(0, 120));
}

if (process.env.READINESS_FULL === '1') {
  tryRun('typecheck', 'pnpm', ['typecheck']);
  tryRun('lint', 'pnpm', ['lint']);
  tryRun('unit-tests', 'pnpm', ['test:unit']);
  tryRun('build', 'pnpm', ['build']);
}

const failed = checks.filter((c) => !c.ok);
console.log('\nSummary:', checks.length - failed.length, '/', checks.length, 'passed');
process.exit(failed.length ? 1 : 0);
