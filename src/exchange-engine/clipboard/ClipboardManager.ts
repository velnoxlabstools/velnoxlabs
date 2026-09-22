export class ClipboardManager {
  async copy(text: string): Promise<{ ok: boolean; error?: string }> {
    try {
      await navigator.clipboard.writeText(text);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Clipboard write failed' };
    }
  }

  async paste(): Promise<{ ok: boolean; text?: string; error?: string }> {
    try {
      const text = await navigator.clipboard.readText();
      return { ok: true, text };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Clipboard read failed' };
    }
  }

  sanitize(text: string, max = 5_000_000): string {
    return text.replace(/\u0000/g, '').slice(0, max);
  }
}

export const clipboardManager = new ClipboardManager();
