import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI or default error message
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-bg-main flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-bg-secondary rounded-lg border border-border p-6 text-center">
            <div className="mb-4">
              <svg 
                className="mx-auto h-12 w-12 text-red-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
            
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              Something went wrong
            </h2>
            
            <p className="text-text-secondary mb-4">
              An unexpected error occurred. Please refresh the page and try again.
            </p>
            
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
              >
                Refresh Page
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false })}
                className="w-full px-4 py-2 border border-border text-text-primary rounded-md hover:bg-bg-tertiary transition-colors"
              >
                Try Again
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-text-secondary">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs text-red-400 bg-gray-900 p-2 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}