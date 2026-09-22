export type ScriptStrategy = 'beforeInteractive' | 'afterInteractive' | 'lazyOnload';

export class ScriptOptimizer {
  strategyFor(kind: 'analytics' | 'widget' | 'critical'): ScriptStrategy {
    if (kind === 'critical') return 'beforeInteractive';
    if (kind === 'analytics') return 'lazyOnload';
    return 'afterInteractive';
  }
}

export const scriptOptimizer = new ScriptOptimizer();
