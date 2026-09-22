# Release Guide

```bash
pnpm version:patch   # or minor|major
pnpm changelog
git tag vX.Y.Z
git push --tags
```

GitHub Actions release.yml validates on tags.
Rollback: previous tag + recovery snapshots if config corrupted.
