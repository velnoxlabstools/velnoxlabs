export class BlobManager {
  fromText(text: string, mime = 'text/plain'): Blob {
    return new Blob([text], { type: mime });
  }

  fromJson(data: unknown): Blob {
    return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  }

  async toText(blob: Blob): Promise<string> {
    return blob.text();
  }

  async toDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }
}

export const blobManager = new BlobManager();
