import type { ShareRequest, ShareResult } from '../types';
import { clipboardManager } from '../clipboard';

export class ShareManager {
  async share(req: ShareRequest): Promise<ShareResult> {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: req.title,
          text: req.text,
          url: req.url,
        });
        return { ok: true, method: 'native' };
      } catch (e) {
        // user abort or failure → fallback
        const msg = e instanceof Error ? e.message : '';
        if (/abort/i.test(msg)) return { ok: false, method: 'native', error: 'Share cancelled' };
      }
    }

    const payload = [req.title, req.text, req.url].filter(Boolean).join('\n');
    const copied = await clipboardManager.copy(payload);
    if (copied.ok) return { ok: true, method: 'clipboard' };
    return { ok: false, method: 'none', error: copied.error ?? 'Share unavailable' };
  }

  async copyLink(url: string): Promise<ShareResult> {
    const r = await clipboardManager.copy(url);
    return r.ok
      ? { ok: true, method: 'clipboard' }
      : { ok: false, method: 'none', error: r.error };
  }

  async copyResult(text: string): Promise<ShareResult> {
    const r = await clipboardManager.copy(text);
    return r.ok
      ? { ok: true, method: 'clipboard' }
      : { ok: false, method: 'none', error: r.error };
  }
}

export const shareManager = new ShareManager();
