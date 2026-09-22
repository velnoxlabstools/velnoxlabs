import type { AppErrorOptions, ErrorCode } from '../types';
import { safePublicMessage } from '../utils';

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly publicMessage: string;
  readonly context?: Record<string, unknown>;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = 'AppError';
    this.code = options.code ?? 'UNKNOWN';
    this.status = options.status ?? 500;
    this.publicMessage = options.publicMessage ?? safePublicMessage(message);
    this.context = options.context;
    if (options.cause) {
      this.cause = options.cause;
    }
  }

  static validation(message: string, context?: Record<string, unknown>) {
    return new AppError(message, {
      code: 'VALIDATION',
      status: 400,
      publicMessage: message,
      context,
    });
  }

  static notFound(resource = 'Resource') {
    return new AppError(`${resource} not found`, {
      code: 'NOT_FOUND',
      status: 404,
      publicMessage: `${resource} not found`,
    });
  }
}
