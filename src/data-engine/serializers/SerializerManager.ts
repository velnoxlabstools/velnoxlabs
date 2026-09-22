export class SerializerManager {
  toJson(data: unknown, pretty = true): string {
    return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  }

  toCsv(rows: string[][]): string {
    return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  }
}

export const serializerManager = new SerializerManager();
