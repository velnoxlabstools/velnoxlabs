#!/usr/bin/env sh
set -e
echo "[pre-commit] lint-staged + typecheck"
pnpm exec lint-staged
pnpm typecheck
