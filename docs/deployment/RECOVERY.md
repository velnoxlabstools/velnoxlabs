# Recovery Guide

```ts
import { recoveryManager } from '@/recovery';

await recoveryManager.createBackup('full', 'pre-deploy');
// on failure:
await recoveryManager.rollback('full');
```

Integrity: recoveryManager.verify(snapshotId)
