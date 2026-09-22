# Deployment Guide

Platform-agnostic. Set env from .env.example.

```bash
pnpm build
pnpm start
# or platform adapter (Vercel/Netlify/Cloudflare)
```

Pre-deploy:
```bash
pnpm release:validate
node -e "console.log(require('./src/environment'))" # or use deploymentManager in app
```

Use NEXT_PUBLIC_APP_ENV=production and real NEXT_PUBLIC_APP_URL in prod.
