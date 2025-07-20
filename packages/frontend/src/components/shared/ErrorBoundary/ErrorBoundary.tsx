import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface FallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  resetError?: () => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<FallbackProps> | React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Default fallback UI component
const DefaultFallbackComponent: React.FC<FallbackProps> = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg mx-auto my-4 max-w-4xl text-center">
      <div className="mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-16 h-16 text-red-500 mx-auto"
        >
          <path
            fillRule="evenodd"
            d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h2>
      <p className="text-gray-700 mb-4">
        We're sorry, but an error occurred. Our team has been notified and we're working to fix it.
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Go to Homepage
      </button>
    </div>
  );
};

// Disable React error overlay in development mode
if (import.meta.env.DEV) {
  window.addEventListener('error', (event) => {
    // Check if the error is from our component
    if (event.error && event.error.message && event.error.message.includes('ErrorTest component')) {
      // Prevent the default error handler from showing React's overlay
      event.preventDefault();
    }
  });
}

// Custom Error Boundary
export class GlobalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render shows the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Update state with error details
    this.setState({
      errorInfo,
    });

    // Log to console in development
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Render fallback UI
      if (!fallback) {
        return (
          <DefaultFallbackComponent
            error={error as Error}
            errorInfo={errorInfo as ErrorInfo}
            resetError={this.resetError}
          />
        );
      }

      if (React.isValidElement(fallback)) {
        return fallback;
      }

      const FallbackComponent = fallback as React.ComponentType<FallbackProps>;
      return (
        <FallbackComponent error={error as Error} errorInfo={errorInfo as ErrorInfo} resetError={this.resetError} />
      );
    }

    return children;
  }
}
