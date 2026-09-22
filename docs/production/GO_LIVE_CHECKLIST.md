# Go-Live Checklist

## Pre-deploy
- [ ] `pnpm install --frozen-lockfile`
- [ ] `.env` production values from `.env.example` (no secrets in NEXT_PUBLIC except intentional)
- [ ] `NEXT_PUBLIC_APP_ENV=production`
- [ ] `NEXT_PUBLIC_APP_URL=https://<domain>`
- [ ] `NEXT_PUBLIC_ALLOW_INDEXING=true` (when ready to index)
- [ ] `pnpm typecheck && pnpm lint && pnpm test:coverage && pnpm build`
- [ ] `pnpm test:e2e` against staging
- [ ] `deploymentManager.preDeploy()` / env validation OK
- [ ] `recoveryManager.createBackup('full', 'pre-launch')`
- [ ] Security headers applied in middleware
- [ ] Analytics consent policy decided

## Deploy
- [ ] Deploy platform artifact (Vercel/CF/Netlify/Node host)
- [ ] Smoke: `/`, `/tools`, `/categories`, `/search`, sample tool slug
- [ ] Verify `/robots.txt` and `/sitemap.xml` (if routed)
- [ ] Monitoring snapshot OK

## Post-deploy
- [ ] Core Web Vitals baseline
- [ ] Error rate dashboard / logs
- [ ] Tag release `vX.Y.Z` + changelog
- [ ] Rollback plan documented (previous tag + recovery snapshot)
