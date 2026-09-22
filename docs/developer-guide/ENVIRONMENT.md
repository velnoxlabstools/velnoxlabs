# Environment Guide

See .env.example and src/environment.

Key variables:
- NEXT_PUBLIC_APP_ENV — local | development | staging | production | ...
- NEXT_PUBLIC_APP_URL — absolute site URL
- NEXT_PUBLIC_FLAG_* — feature flags

Validate with environmentManager.validate() or deploymentManager.preDeploy().
