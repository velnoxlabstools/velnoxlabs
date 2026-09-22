# Deployment Handbook v1.0

NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain
pnpm build && pnpm start

Pre-flight: pnpm quality && pnpm readiness
Backup: recoveryManager.createBackup('full', 'pre-deploy')
Rollback: previous tag + recoveryManager.rollback('full')
