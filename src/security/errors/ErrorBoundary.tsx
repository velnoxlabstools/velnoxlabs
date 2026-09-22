'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { errorLogger } from '../logging';
import { safePublicMessage } from '../utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: safePublicMessage(error.message),
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    errorLogger.capture(error, 'RUNTIME', {
      componentStack: info.componentStack?.slice(0, 500),
    });
    this.props.onError?.(error);
  }

  private recover = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          role="alert"
          style={{
            padding: 'var(--space-6)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            background: 'var(--card)',
            maxWidth: '32rem',
            margin: 'var(--space-8) auto',
          }}
        >
          <h2
            style={{
              margin: '0 0 var(--space-2)',
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-semibold)',
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              margin: '0 0 var(--space-4)',
              color: 'var(--muted-foreground)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            {this.state.message}
          </p>
          <button
            type="button"
            onClick={this.recover}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              cursor: 'pointer',
              fontWeight: 'var(--font-weight-semibold)',
            }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
