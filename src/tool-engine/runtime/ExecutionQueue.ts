type Job = () => Promise<void>;

/**
 * Serial execution queue — one tool run at a time per runtime instance.
 */
export class ExecutionQueue {
  private queue: Job[] = [];
  private running = false;

  enqueue(job: Job): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          await job();
          resolve();
        } catch (e) {
          reject(e);
        }
      });
      void this.pump();
    });
  }

  private async pump(): Promise<void> {
    if (this.running) return;
    this.running = true;
    while (this.queue.length) {
      const job = this.queue.shift();
      if (job) await job();
    }
    this.running = false;
  }

  clear(): void {
    this.queue = [];
  }
}
