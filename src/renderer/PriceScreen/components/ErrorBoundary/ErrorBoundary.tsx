import React, { Component, ErrorInfo, ReactNode } from 'react';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component that catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 * 
 * @component
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    window.electron?.writeLog?.('ERROR', 'Error caught by boundary', { 
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      source: 'CLIENT'
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>משהו השתבש</h2>
          <p>אנא נסה לרענן את הדף</p>
          <button 
            onClick={() => window.location.reload()}
            className="error-boundary-button"
          >
            רענן
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 