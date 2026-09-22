# Monitoring Guide

```ts
import { monitoringService } from '@/monitoring';

monitoringService.performance.toolExecution(120, 'json-formatter');
await monitoringService.snapshot();
```

Optional MonitoringProvider with enableHeartbeat.
