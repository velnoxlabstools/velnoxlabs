import { revokeUrl } from '../utils';

export class DownloadManager {
  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => revokeUrl(url), 1000);
  }

  downloadText(text: string, filename: string, mime = 'text/plain'): void {
    this.downloadBlob(new Blob([text], { type: mime }), filename);
  }

  downloadManagedOutput(output: Blob | string, name: string, mime?: string): void {
    if (typeof output === 'string') {
      this.downloadText(output, name, mime);
    } else {
      this.downloadBlob(output, name);
    }
  }
}

export const downloadManager = new DownloadManager();
