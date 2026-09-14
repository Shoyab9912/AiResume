import type { ErrorInfo, ReactNode, ComponentType } from "react";
import React from "react";

export interface FallbackProps {
  error: Error | null;
  onRetry: () => void;
}

interface ErrorBoundaryProps {
  fallback: ComponentType<FallbackProps>;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryKey: number;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      retryKey: 0,
    };
  }

  static getDerivedStateFromError(
    error: Error,
  ): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Error:", error.message);
    console.error("Component stack:", info.componentStack);
  }

  handleRetry = () => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      retryKey: prev.retryKey + 1,
    }));
  };

  render() {
    const { hasError, error, retryKey } = this.state;
    const { fallback: Fallback, children } = this.props;

    if (hasError) {
      return (
        <Fallback
          error={error}
          onRetry={this.handleRetry}
        />
      );
    }

    return <div key={retryKey}>{children}</div>;
  }
}

export {ErrorBoundary};