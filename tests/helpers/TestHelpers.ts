export function createMockEvent<T extends object>(partial: T): T & { preventDefault: () => void } {
  return {
    preventDefault: () => undefined,
    ...partial,
  };
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function assertDefined<T>(value: T | null | undefined, message = 'Expected value'): T {
  if (value == null) throw new Error(message);
  return value;
}
