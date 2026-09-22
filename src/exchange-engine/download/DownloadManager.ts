export class DownloadManager {
  download(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  downloadText(text: string, filename: string, mime = 'text/plain'): void {
    this.download(new Blob([text], { type: mime }), filename);
  }
}

export const downloadManager = new DownloadManager();
