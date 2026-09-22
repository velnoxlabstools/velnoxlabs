import { AppError } from './AppError';
import { errorLogger } from '../logging';
import { safePublicMessage } from '../utils';
import type { ErrorCode } from '../types';

export interface HandledError {
  code: ErrorCode;
  status: number;
  message: string;
}

export class GlobalErrorHandler {
  handle(error: unknown, context?: Record<string, unknown>): HandledError {
    if (error instanceof AppError) {
      errorLogger.capture(error, error.code, { ...error.context, ...context });
      return {
        code: error.code,
        status: error.status,
        message: error.publicMessage,
      };
    }

    if (error instanceof Error) {
      errorLogger.capture(error, 'RUNTIME', context);
      return {
        code: 'RUNTIME',
        status: 500,
        message: safePublicMessage(error.message),
      };
    }

    errorLogger.capture(error, 'UNKNOWN', context);
    return {
      code: 'UNKNOWN',
      status: 500,
      message: 'Something went wrong',
    };
  }
}

export const globalErrorHandler = new GlobalErrorHandler();
